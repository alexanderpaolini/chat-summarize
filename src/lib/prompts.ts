/**
 * System prompts for different modes of operation
 */

import { CommandOptions } from './commandParser';

export const QUERY_SYSTEM_PROMPT =
  'Answer questions about the conversation.\n' +
  '- Mention users as <@USER_ID> ex "<@277183033344524288>"\n' +
  '- Mention channels as <#CHANNEL_ID> ex "<#1456394387268571169>"\n' +
  '- Link relevant attachments using their URLs\n' +
  '- Include source URLs inline at the end of the related sentence (same line)\n' +
  '- Content prefixed with "* " is metadata\n' +
  '- Avoid filler phrases';

export const TLDR_SYSTEM_PROMPT =
  "Summarize the conversation -- essentially a TLDR for users who aren't caught up\n" +
  '- Mention users as <@USER_ID> ex "<@277183033344524288>"\n' +
  '- Mention channels as <#CHANNEL_ID> ex "<#1456394387268571169>"\n' +
  '- Link relevant attachments using their URLs\n' +
  '- Include source URLs inline at the end of the related sentence (same line)\n' +
  '- Content prefixed with "* " is metadata\n' +
  '- Avoid filler phrases';

export const OVERALL_TLDR_PROMPT =
  '- Include an overall TLDR at the beginning without citations';

/**
 * Get the appropriate system prompt based on whether a query is provided
 */
export function getSystemPrompt(
  query?: string,
  options?: CommandOptions,
  botUserId?: string,
  botUserTag?: string
): string {
  let botIdentity = '';
  if (botUserId && botUserTag) {
    botIdentity = `\n- Your user ID is ${botUserId} and your username is ${botUserTag}`;
  }

  return (
    (query && query.trim() ? QUERY_SYSTEM_PROMPT : TLDR_SYSTEM_PROMPT) +
    botIdentity +
    (options?.tldr ? OVERALL_TLDR_PROMPT : '')
  );
}

/**
 * Format user content based on whether a query is provided
 */
export function formatUserContent(content: string, query?: string): string {
  return query && query.trim()
    ? `Question: ${query}\n\nConversation:\n${content}`
    : content;
}
