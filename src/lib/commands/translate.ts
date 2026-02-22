import { GuildTextBasedChannel } from 'discord.js';
import { Command, CommandContext } from './types';
import { contextResolver } from '../contextResolver';
import { getTranslateSystemPrompt } from '../prompts';
import { DEFAULT_LLM_MODEL } from '../../options';
import { openRouter } from '../openRouter';
import { logger } from '../logger';

const MAX_LENGTH = 2000;
const DEFAULT_TTL = 60;
const DEFAULT_LANGUAGE = 'English';

function splitIntoChunks(text: string, maxLength = MAX_LENGTH) {
  const lines = text.split('\n');
  const chunks = [];
  let currentChunk = '';

  for (const line of lines) {
    if ((currentChunk + line + '\n').length > maxLength) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      if (line.length > maxLength) {
        for (let i = 0; i < line.length; i += maxLength) {
          chunks.push(line.slice(i, i + maxLength));
        }
      } else {
        currentChunk = line + '\n';
      }
    } else {
      currentChunk += line + '\n';
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Parse the target language from the query string.
 * Handles forms like "to english", "to french", or just "english".
 */
function parseTargetLanguage(query?: string): string {
  if (!query || !query.trim()) return DEFAULT_LANGUAGE;
  const stripped = query.trim().replace(/^to\s+/i, '').trim();
  return stripped || DEFAULT_LANGUAGE;
}

export const translateCommand: Command = {
  name: 'translate',
  description: 'Translate messages to a target language (default: English)',
  execute: async (context: CommandContext) => {
    const { message, botUserId, options } = context;

    if ('sendTyping' in message.channel) {
      await message.channel.sendTyping();
    }

    try {
      logger.info(
        `Translating in #${(message.channel as GuildTextBasedChannel).name} - ${message.guild?.name}`
      );

      await message.react('👍');

      const targetLanguage = parseTargetLanguage(options.query);
      const systemPrompt = getTranslateSystemPrompt(targetLanguage);
      const model = options.model || DEFAULT_LLM_MODEL;

      let contentToTranslate: string;

      // If the command is sent as a reply, translate only the referenced message
      if (message.reference?.messageId) {
        const referencedMessage = await message.channel.messages.fetch(
          message.reference.messageId
        );
        contentToTranslate = referencedMessage.content;
      } else {
        // Otherwise use the context resolver to get recent messages
        contentToTranslate = await contextResolver(message, botUserId, options);
      }

      if (!contentToTranslate.trim()) {
        await message.reply('Nothing to translate.');
        return;
      }

      logger.info(`Calling LLM with model: ${model} for translation`);

      const res = await openRouter.chat.send({
        chatGenerationParams: {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contentToTranslate },
          ],
        },
      });

      const translation = String(
        res.choices[0].message.content ?? 'TRANSLATION FAILED!'
      );
      logger.info(`Translation received (${translation.length} characters)`);

      let replyMsg = message;
      const chunks = splitIntoChunks(translation);

      logger.info(`Sending ${chunks.length} message chunk(s) as reply`);

      const msgs = [message];
      for (let i = 0; i < chunks.length; i++) {
        replyMsg = await replyMsg.reply({
          content: chunks[i],
          allowedMentions: { users: [] },
        });
        msgs.push(replyMsg);
      }

      const ttl = options.ttl ?? DEFAULT_TTL;
      logger.info(`Messages will be deleted after ${ttl} seconds`);

      await new Promise(r => setTimeout(r, ttl * 1000));

      let deletionFailures = 0;
      for (const msg of msgs) {
        try {
          await msg.delete();
        } catch (err) {
          deletionFailures++;
          logger.warn(`Failed to delete message: ${err}`);
        }
      }

      if (deletionFailures === 0) {
        logger.info('All messages deleted successfully');
      } else {
        logger.warn(
          `Completed with ${deletionFailures} message deletion failure(s)`
        );
      }
    } catch (err) {
      await message.reply(
        'Failed to translate messages. Please try again later.'
      );
      logger.error('Failed to translate messages');
      logger.error(err);
    }
  },
};
