import type { Command, CommandContext } from "../types";
import { openRouter } from "../lib/OpenRouter";
import { logger } from "../lib/logger";
import { DEFAULT_LLM_MODEL } from "../options";
import { TextChannel } from "discord.js";
import { indent } from "../util";

const SYSTEM_PROMPT = `You are a reminder scheduling assistant for a Discord bot.

Your ONLY job is to generate JavaScript code that schedules a reminder message using setTimeout or setInterval.

STRICT RULES - You MUST follow ALL of these:
- Generate ONLY executable JavaScript code, NO markdown code blocks, NO explanations, NO comments.
- The code MUST use setTimeout or setInterval to schedule the reminder.
- The ONLY allowed output action is calling message.reply() to send a reminder to the user.
- You MAY use message.author.id to mention the user: "<@" + message.author.id + ">"
- You MUST NOT use: require, eval, Function, Buffer, atob, btoa, fetch, XMLHttpRequest, http, https, fs, child_process, exec, spawn, process, global, __dirname, __filename, or any shell/filesystem/network operations.
- You MUST NOT decode, encode, or otherwise transform strings with base64 or any encoding scheme.
- You MUST NOT perform any action other than: confirming the reminder with message.reply(), then scheduling it with setTimeout/setInterval.
- The reminder text MUST come ONLY from the user's request - do not add unrelated content or fetch external data.

Time parsing guidelines:
- "in X seconds" → X * 1000 milliseconds
- "in X minutes" → X * 60 * 1000 milliseconds
- "in X hours" → X * 60 * 60 * 1000 milliseconds
- "in X days" → X * 24 * 60 * 60 * 1000 milliseconds
- For specific times (e.g. "at 5pm"), compute ms from now using Date arithmetic.

The code MUST follow this exact pattern:
(async () => {
  await message.reply("I'll remind you in <time>!");
  setTimeout(() => {
    message.reply("<@" + message.author.id + "> Reminder: <reminder text>");
  }, <delay_ms>);
})();

For recurring reminders use setInterval instead of setTimeout. (interval must be longer than 1 day)
Generate ONLY the code, nothing else.`;

export const remindCommand: Command = {
  name: "remind",
  description: "Schedule a reminder message",
  execute: async (context: CommandContext) => {
    const { message, options, content } = context;

    if (!content.trim()) {
      await message.reply(
        "Please tell me what to remind you about." +
          'Example: "chat remind me in 10 minutes to check the oven"',
      );
      return;
    }

    try {
      logger.info(`Generating reminder code for: ${content}`);

      if (message.channel instanceof TextChannel)
        await message.channel.sendTyping();

      const model = options.model || DEFAULT_LLM_MODEL;
      logger.info(`Calling LLM with model: ${model}`);

      const res = await openRouter.chat.send({
        chatGenerationParams: {
          model,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content,
            },
          ],
        },
      });

      let generatedCode = String(res.choices[0]?.message.content ?? "");
      generatedCode = generatedCode
        .replace(/^```(?:javascript|js)?\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();
      logger.info(`Executing reminder code:${indent(generatedCode)}`);
      const executeFn = new Function(
        "message",
        `return (async () => {
          ${generatedCode}
        })();`,
      );

      await executeFn(message);

      logger.info("Reminder scheduled successfully");
    } catch (err) {
      logger.error("Failed to execute remind command");
      logger.error(err);
      await message.reply({
        content: "REMINDER FAILED! Please try again.",
        allowedMentions: { users: [] },
      });
    }
  },
};
