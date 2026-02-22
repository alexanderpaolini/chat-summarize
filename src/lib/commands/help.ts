import { Command, CommandContext } from './types';
import { USER_ALLOWED_MODELS, ADMIN_ALLOWED_MODELS } from '../../options';
import { commandRegistry } from './registry';
import { isAdmin } from '../permissions';
import { env } from '../../env';

export const helpCommand: Command = {
  name: 'help',
  description: 'Show available commands and options',
  execute: async (context: CommandContext) => {
    const { message } = context;

    // Get all commands and filter based on permissions
    const allCommands = commandRegistry.getAll();
    const userIsAdmin = isAdmin(message, env.ADMIN_USER_IDS);
    const availableCommands = allCommands.filter(
      cmd => !cmd.requiresPermission || userIsAdmin
    );

    // Determine available models based on admin status
    const availableModels = userIsAdmin
      ? ADMIN_ALLOWED_MODELS
      : USER_ALLOWED_MODELS;

    // Build command list for help text
    const commandList = availableCommands
      .map(cmd => {
        if (cmd.name === 'summarize') {
          return '• `summarize` - Summarize messages in the channel (default command)';
        } else if (cmd.name === 'translate') {
          return '• `translate [to <language>]` - Translate messages to a target language (default: English)';
        } else if (cmd.name === 'run') {
          return '• `run <instruction>` - Generate and execute code based on natural language';
        } else if (cmd.name === 'help') {
          return '• `help` - Show this help message';
        }
        return `• \`${cmd.name}\` - ${cmd.description}`;
      })
      .join('\n');

    const helpText = `
**chat, summarize**

**Usage:**
\`chat [command] [options]\` or \`@bot [command] [options]\`

**Commands:**
${commandList}

**Options:**
• \`--help\` - Show this help message
• \`--allow-summarizer\` or \`-S\` - Include bot messages in summaries
• \`--amount <number>\` or \`-N <number>\` - Specify number of messages to summarize
• \`--model <model>\` or \`-M <model>\` - Choose AI model for summarization
  Available models: ${availableModels.join(', ')}

**Examples:**
\`chat summarize\` - Summarize messages from your previous message to now
\`@bot summarize -S --amount 100\` - Summarize last 100 messages including bot messages
\`chat what did Sarah say?\` - Ask a specific question about the conversation
\`chat translate\` - Translate recent messages to English
\`chat translate to french\` - Translate recent messages to French
\`chat run remind me in 10 seconds to do something\` - Generate and run code
\`@bot run ping 1.1.1.1\` - Execute a ping command
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
