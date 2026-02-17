import { GuildTextBasedChannel } from "discord.js";
import { Command, CommandContext } from "./types";
import { contextResolver } from "../contextResolver";
import { summarize } from "../summarize";
import { logger } from "../logger";

const MAX_LENGTH = 2000;

function splitIntoChunks(text: string, maxLength = MAX_LENGTH) {
  const lines = text.split("\n");
  const chunks = [];
  let currentChunk = "";

  for (const line of lines) {
    // If adding this line would exceed limit, push current chunk first
    if ((currentChunk + line + "\n").length > maxLength) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      // If single line itself exceeds max length, hard-split it
      if (line.length > maxLength) {
        for (let i = 0; i < line.length; i += maxLength) {
          chunks.push(line.slice(i, i + maxLength));
        }
      } else {
        currentChunk = line + "\n";
      }
    } else {
      currentChunk += line + "\n";
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

const DEFAULT_TTL = 60;

export const summarizeCommand: Command = {
  name: "summarize",
  description: "Summarize the last N messages in the channel",
  execute: async (context: CommandContext) => {
    const { message, botUserId, botUserTag, options } = context;

    if ("sendTyping" in message.channel) {
      await message.channel.sendTyping();
    }

    try {
      logger.info(
        `Summarizing #${(message.channel as GuildTextBasedChannel).name} - ${message.guild?.name}`,
      );

      await message.react("👍");

      const content = await contextResolver(message, botUserId, options);
      const summary = await summarize(content, options.query, options, botUserId, botUserTag);

      let replyMsg = message;
      const chunks = splitIntoChunks(summary);

      logger.info(`Sending ${chunks.length} message chunk(s) as reply`);

      const msgs = [message];
      for (let i = 0; i < chunks.length; i++) {
        replyMsg = await replyMsg.reply({
          content: chunks[i],
          allowedMentions: {
            users: [],
          },
        });
        msgs.push(replyMsg);
      }

      const ttl = options.ttl ?? DEFAULT_TTL;
      logger.info(`Messages will be deleted after ${ttl} seconds`);

      await new Promise((r) => setTimeout(r, ttl * 1000));

      let deletionFailures = 0;
      for (const msg of msgs) {
        try {
          await msg.delete();
        } catch (err) {
          deletionFailures++;
          logger.warn(`Failed to delete message: ${err}`);
        }
      }

      if (deletionFailures === 0) {
        logger.info("All messages deleted successfully");
      } else {
        logger.warn(
          `Completed with ${deletionFailures} message deletion failure(s)`,
        );
      }
    } catch (err) {
      await message.reply("FAILED TO SUMMARIZE!");
      logger.error("Failed to summarize messages");
      logger.error(err);
    }
  },
};
