import { Command, CommandContext } from "./types";
import { ALLOWED_MODELS } from "../../options";

export const helpCommand: Command = {
  name: "help",
  description: "Show available commands and options",
  execute: async (context: CommandContext) => {
    const { message } = context;

    const helpText = `
**chat, summarize**

**Usage:**
\`chat [command] [options]\` or \`@bot [command] [options]\`

**Commands:**
• \`summarize\` - Summarize messages in the channel (default command)
• \`help\` - Show this help message

**Options:**
• \`--help\` - Show this help message
• \`--allow-summarizer\` or \`-S\` - Include bot messages in summaries
• \`--amount <number>\` or \`-N <number>\` - Specify number of messages to summarize
• \`--model <model>\` or \`-M <model>\` - Choose AI model for summarization
  Available models: ${ALLOWED_MODELS.join(", ")}

**Examples:**
\`chat summarize\` - Summarize messages from your previous message to now
\`@bot summarize -S --amount 100\` - Summarize last 100 messages including bot messages
\`chat what did Sarah say?\` - Ask a specific question about the conversation
\`@bot --help\` - Show this help message
`.trim();

    await message.reply({
      content: helpText,
      allowedMentions: {
        users: [],
      },
    });
  },
};
