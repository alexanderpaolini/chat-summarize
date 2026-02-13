import {
  Client,
  GatewayIntentBits,
  GuildTextBasedChannel,
  Message,
} from "discord.js";
import { env } from "./env";
import { contextResolver } from "./lib/contextResolver";
import { summarize } from "./lib/summarize";
import { logger } from "./lib/logger";
import { parseCommandOptions } from "./lib/commandParser";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

/** Seconds */
const DEFAULT_TTL = 60;

const isPrompt = (m: Message) => {
  return (
    m.content.toLowerCase().startsWith("chat summarize") ||
    m.mentions.users.has(client.user?.id!)
  );
};

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

const isStatusCheck = (m: Message) => {
  // Check if message only mentions the bot with no other content
  // Remove the bot's own mention and check if anything remains
  const botMentionPattern = new RegExp(`<@!?${client.user?.id}>`, "g");
  const contentWithoutBotMention = m.content
    .replace(botMentionPattern, "")
    .trim();
  return m.mentions.users.has(client.user?.id!) && !contentWithoutBotMention;
};

client.once("clientReady", () => {
  logger.info(`Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.guild) return;

  if (!isPrompt(message)) return;

  // Handle status check - when message is only a bot mention
  if (isStatusCheck(message)) {
    await message.reply({
      content: "ready to summarize!",
      allowedMentions: { repliedUser: true, users: [] },
    });
    return;
  }

  await message.channel.sendTyping();

  try {
    logger.info(
      `summarizing #${(message.channel as GuildTextBasedChannel).name} - ${message.guild.name}`,
    );

    // Parse command options from the message
    const options = parseCommandOptions(message.content);
    await message.react("👍");

    const content = await contextResolver(message, client.user!.id, options);
    const summary = await summarize(content, options.query, options);

    let replyMsg = message;
    const chunks = splitIntoChunks(summary);

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

    await new Promise((r) =>
      setTimeout(r, (options.ttl ?? DEFAULT_TTL) * 1000),
    );
    for (const msg of msgs) {
      try {
        await msg.delete();
      } catch (err) {
        /* void */
      }
    }
  } catch (err) {
    message.reply("FAILED TO SUMMARIZE!");
    logger.error("failed to summarize messages");
    logger.error(err);
  }
});

client.login(env.DISCORD_TOKEN);
