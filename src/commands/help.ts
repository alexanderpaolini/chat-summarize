import { ADMIN_ALLOWED_MODELS, USER_ALLOWED_MODELS } from "../options";
import type { Command, CommandContext } from "../types";
import { commands } from ".";

export const helpCommand: Command = {
  name: "help",
  description: "Show available commands and options",
  execute: async (context: CommandContext) => {
    const { message } = context;

    // TODO: check admin?
    const availableCommands = commands;
    const availableModels = ADMIN_ALLOWED_MODELS;

    const commandList = availableCommands
      .values()
      .map((cmd) => `* \`${cmd.name}\` - ${cmd.description}`)
      .toArray()
      .join("\n");

    const helpText = `
**chat, summarize**

**Usage:**
\`<${context.message.guild?.members.me?.nickname ?? context.message.client.user.displayName} | [@bot]> <command> [options]\`

**Commands:**
${commandList}

**Options:**
* \`--help\` - Show this help message
* \`--allow-summarizer\` or \`-S\` - Include bot messages in summaries
* \`--amount <number>\` or \`-N <number>\` - Specify number of messages to summarize
* \`--model <model>\` or \`-M <model>\` - Choose AI model for summarization
* \`--tldr\` - Request a TLDR instead of a summary
-# Available models: ${availableModels.join(", ")}
`.trim();

    await message.reply({
      content: helpText,
      allowedMentions: {
        users: [],
      },
    });
  },
};
