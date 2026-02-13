import { Client, GatewayIntentBits, GuildTextBasedChannel, Message } from 'discord.js';
import { env } from './env';
import { contextResolver } from './lib/contexResolver';
import { summarize } from './lib/summarize';
import { logger } from './lib/logger'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

const isPrompt = (m: Message) => {
    return m.content == "chat summarize" || m.mentions.users.has(client.user?.id!)
};

client.once('clientReady', () => {
    logger.info(`Logged in as ${client.user?.tag}`)
});

client.on('messageCreate', async (message) => {
    if (!message.guild) return;

    if (!isPrompt(message)) return;

    await message.channel.sendTyping();

    try {
        const content = await contextResolver(message, client.user!.id);
        const summary = await summarize(content);

        logger.info(`summarizing #${(message.channel as GuildTextBasedChannel).name} - ${message.guild.name}`)

        await message.reply({
            content: summary,
            allowedMentions: { repliedUser: true, users: [] }
        });
    } catch (err) {
        message.reply("FAILED TO SUMMARIZE!");
        logger.error('failed to summarize messages');
        logger.error(err);
    }
});

client.login(env.DISCORD_TOKEN);
