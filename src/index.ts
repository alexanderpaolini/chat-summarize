import { Client, GatewayIntentBits } from "discord.js";
import { env } from "./env";
import { logger } from "./lib/logger";
import { handleCommand } from "./lib/commandHandler";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

client.on("messageCreate", handleCommand);

client.on("clientReady", async (c) => {
  logger.info(`Logged in as ${c.user.displayName}#${c.user.discriminator}`);
});

client.login(env.DISCORD_TOKEN);
