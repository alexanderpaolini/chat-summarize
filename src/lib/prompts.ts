/**
 * System prompts for different modes of operation
 */

import { CommandOptions } from './commandParser';

export const QUERY_SYSTEM_PROMPT =
  'Answer questions about the conversation.\n' +
  '- Mention users as <@{USER ID}>\n' +
  '- Mention channels as <#{CHANNEL ID}>\n' +
  '- Link attachments using their URLs\n' +
  '- Content prefixed with "* " is metadata';

export const TLDR_SYSTEM_PROMPT =
  'Summarize the conversation.\n' +
  '- Mention users as <@{USER ID}>\n' +
  '- Mention channels as <#{CHANNEL ID}>\n' +
  '- Link attachments using their URLs\n' +
  '- Include source URLs after relevant sections\n' +
  '- Content prefixed with "* " is metadata';

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
