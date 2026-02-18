import { Client, GatewayIntentBits, Message } from 'discord.js';
import { env } from './env';
import { logger } from './lib/logger';
import { parseCommand } from './lib/commandParser';
import { commandRegistry } from './lib/commands';
import { hasPermission, isAdmin } from './lib/permissions';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const isPrompt = (m: Message) => {
  const content = m.content.toLowerCase();
  const userId = client.user?.id;
  return (
    content === 'chat' ||
    content.startsWith('chat ') ||
    content.startsWith('chat\n') ||
    (userId && m.mentions.users.has(userId))
  );
};

const isStatusCheck = (m: Message) => {
  // Check if message only mentions the bot with no other content
  // Remove the bot's own mention and check if anything remains
  const userId = client.user?.id;
  if (!userId) return false;
  const botMentionPattern = new RegExp(`<@!?${userId}>`, 'g');
  const contentWithoutBotMention = m.content
    .replace(botMentionPattern, '')
    .trim();
  return m.mentions.users.has(userId) && !contentWithoutBotMention;
};

client.once('clientReady', () => {
  logger.info(`Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async message => {
  if (!message.guild) return;

  // Ignore all messages from bots
  if (message.author.bot) return;

  if (!isPrompt(message)) return;

  // Handle status check - when message is only a bot mention
  if (isStatusCheck(message)) {
    logger.info('Status check requested');
    await message.reply({
      content: 'ready to summarize!',
      allowedMentions: { repliedUser: true, users: [] },
    });
    return;
  }

  try {
    const userIsAdmin = isAdmin(message, env.ADMIN_USER_IDS);
    const parsed = parseCommand(message.content, userIsAdmin);

    // Get the command from registry
    const command = commandRegistry.get(parsed.command);

    if (!command) {
      logger.warn(`Unknown command: ${parsed.command}`);
      await message.reply({
        content: `Unknown command: \`${parsed.command}\`. Use \`--help\` to see available commands.`,
        allowedMentions: { users: [] },
      });
      return;
    }

    // Check if command requires permission
    if (
      command.requiresPermission &&
      !hasPermission(message, env.ALLOWED_USER_IDS)
    ) {
      logger.warn(
        `User ${message.author.tag} (${message.author.id}) attempted to execute restricted command: ${command.name}`
      );
      await message.reply({
        content: `You don't have permission to execute this command.`,
        allowedMentions: { users: [] },
      });
      return;
    }

    // Execute the command
    await command.execute({
      message,
      botUserId: client.user!.id,
      botUserTag: client.user!.tag,
      options: parsed.options,
    });
  } catch (err) {
    logger.error('Failed to execute command');
    logger.error(err);
    await message.reply({
      content: 'An error occurred while processing your command.',
      allowedMentions: { users: [] },
    });
  }
});

client.login(env.DISCORD_TOKEN);
