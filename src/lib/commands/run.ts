import { Command, CommandContext } from './types';
import { openRouter } from '../openRouter';
import { logger } from '../logger';
import { DEFAULT_LLM_MODEL } from '../../options';
import * as Discord from 'discord.js';
import { createRequire } from 'module';

const RUN_SYSTEM_PROMPT = `You are a code generation assistant that creates JavaScript code to be executed in a Discord bot environment.

IMPORTANT RULES:
- Generate ONLY executable JavaScript code, NO markdown code blocks, NO explanations, NO comments
- The code will be executed using eval() in an async context
- You have access to the discord.js library via the "Discord" variable
- You can use require() for Node.js built-in modules when helpful
- You have access to these variables:
  * message - The Discord.js Message object
  * client - The Discord.js Client object
- For async operations (like setTimeout, delays, scheduled tasks), wrap your code in an immediately invoked async function
- For sync operations (like reading data, formatting), write direct code
- Always handle errors gracefully
- Return or reply with meaningful output when appropriate
- Use message.reply() to send responses back to the user
- Avoid shell commands or file system writes

EXAMPLES:

User: "remind me in 10 seconds to do something"
Response:
(async () => {
  await message.reply("I'll remind you in 10 seconds!");
  setTimeout(() => {
    message.reply("<@" + message.author.id + "> Reminder: do something!");
  }, 10000);
})();

User: "get the current time"
Response:
await message.reply(\`Current time: \${new Date().toLocaleString()}\`);

User: "send a message saying hello"
Response:
await message.reply("Hello!");

User: "get the server name"
Response:
await message.reply(\`Server name: \${message.guild?.name || 'Unknown'}\`);

Generate ONLY the code, nothing else.`;

export const runCommand: Command = {
  name: 'run',
  description:
    'Generate and execute code based on natural language instructions',
  requiresPermission: false,
  execute: async (context: CommandContext) => {
    const { message, options } = context;

    // Get the instruction from the query
    const instruction = options.query;

    if (!instruction || !instruction.trim()) {
      await message.reply({
        content:
          'Please provide an instruction for what code to run. Example: `chat run ping 1.1.1.1`',
        allowedMentions: { users: [] },
      });
      return;
    }

    try {
      logger.info(`Generating code for instruction: ${instruction}`);

      // Send typing indicator
      if ('sendTyping' in message.channel) {
        await message.channel.sendTyping();
      }

      // Call LLM to generate code
      const model = options.model || DEFAULT_LLM_MODEL;
      logger.info(`Calling LLM with model: ${model}`);

      const res = await openRouter.chat.send({
        chatGenerationParams: {
          model,
          messages: [
            {
              role: 'system',
              content: RUN_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: `Generate code for: ${instruction}`,
            },
          ],
        },
      });

      let generatedCode = String(res.choices[0].message.content ?? '');
      logger.info(`Generated code (${generatedCode.length} characters)`);

      // Clean up the code: remove markdown code blocks if present
      generatedCode = generatedCode
        .replace(/^```(?:javascript|js)?\n?/i, '')
        .replace(/\n?```$/i, '')
        .trim();

      logger.info(`Executing generated code:\n${generatedCode}`);

      // Create a safe execution context
      const client = message.client;
      const runtimeRequire = createRequire(import.meta.url);

      // Execute the generated code with the provided context
      // We use an async function wrapper to support both sync and async code
      const executeFn = new Function(
        'message',
        'client',
        'Discord',
        'require',
        `return (async () => {
          ${generatedCode}
        })();`
      );

      // Execute with proper context
      await executeFn(message, client, Discord, runtimeRequire);

      logger.info('Code executed successfully');
    } catch (err) {
      logger.error('Failed to execute run command');
      logger.error(err);
      await message.reply({
        content: `Failed to execute command: ${err instanceof Error ? err.message : String(err)}`,
        allowedMentions: { users: [] },
      });
    }
  },
};
