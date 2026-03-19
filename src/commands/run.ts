import * as Discord from "discord.js";
import { createRequire } from "module";
import { logger } from "../lib/logger";
import { openRouter } from "../lib/OpenRouter";
import { DEFAULT_LLM_MODEL } from "../options";
import type { Command, CommandContext } from "../types";
import { TextChannel } from "discord.js";
import { indent } from "../util";

const RUN_SYSTEM_PROMPT = `You are a code generation assistant that creates JavaScript code to be executed in a Discord bot environment.

IMPORTANT RULES:
- Generate ONLY executable JavaScript code, NO markdown code blocks, NO explanations, NO comments.
- The code will be executed using eval() in an async context.
- You have access to the discord.js library via the "Discord" variable.
- You can use require() for Node.js built-in modules when helpful.
- You have access to these variables:
  * message - The Discord.js Message object
  * client - The Discord.js Client object
- Always handle errors gracefully. Errors should be logged to the channel where the command was issued.
- Return or reply with meaningful output when appropriate.
- Use message.reply() to send responses back to the user.
- Avoid shell commands or file system writes.

Standard error handling example:
\`\`\`js
try {
  // your async code here
} catch (err) {
  console.error(err);
  await message.reply(String(err));
}
\`\`\`

User: "remind me in 10 seconds to do something"
Response:

\`\`\`js
await message.reply("I'll remind you in 10 seconds!");
setTimeout(() => {
message.reply("<@" + message.author.id + "> Reminder: do something!");
}, 10000);
\`\`\`

User: "get the current time"
Response:

\`\`\`js
await message.reply(\`Current time: \${new Date().toLocaleString()}\`);
\`\`\`

User: "send a message saying hello"
Response:

\`\`\`js
await message.reply("Hello!");
\`\`\`

User: "get the server name"
Response:

\`\`\`js
await message.reply(\`Server name: \${message.guild?.name || 'Unknown'}\`);
\`\`\`

User: "delete this message"
Response:

\`\`\`js
await message.delete();
await message.reply('Message deleted!');
\`\`\`

Generate ONLY the code, nothing else.
`;

export const runCommand: Command = {
  name: "run",
  description:
    "Generate and execute code based on natural language instructions",
  admin: true,
  execute: async (context: CommandContext) => {
    const { message, options, content } = context;

    if (!content.trim()) {
      await message.reply({
        content:
          "Please provide an instruction for what code to run. Example: `chat run ping 1.1.1.1`",
        allowedMentions: { users: [] },
      });
      return;
    }

    try {
      logger.info(`Generating code for instruction: ${content}`);

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
              content: RUN_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: `Generate code for: ${content}`,
            },
          ],
        },
      });

      let generatedCode = String(res.choices[0]?.message.content ?? "");
      generatedCode = generatedCode
        .replace(/^```(?:javascript|js)?\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();
      logger.info(`Executing generated code:\n${indent(generatedCode)}`);

      const client = message.client;
      const runtimeRequire = createRequire(import.meta.url);
      const executeFn = new Function(
        "message",
        "client",
        "Discord",
        "require",
        `return (async () => {
          ${generatedCode}
        })();`,
      );

      await executeFn(message, client, Discord, runtimeRequire);

      logger.info("Code executed successfully");
    } catch (err) {
      logger.error("Failed to execute run command");
      logger.error(err);
      await message.reply(String(err));
    }
  },
};
