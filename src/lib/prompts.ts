/**
 * System prompts for different modes of operation
 */

import { CommandOptions } from "./commandParser";

export const QUERY_SYSTEM_PROMPT =
  "You answer questions about a provided conversation.\n" +
  "Guidelines:\n" +
  "- Use only the provided conversation\n" +
  "- Be clear and concise\n" +
  "- Mention users as <@{USER ID}> and channels as <#{CHANNEL ID}> ex <@277183033344524288> and <#1410459859996119142>\n" +
  "- Link to attachments using their provided URLs\n" +
  '- Treat content prefixed with "* " as metadata; use it only if necessary\n' +
  "- If the answer is not in the conversation, say so\n" +
  "- Do not begin with filler phrases";

export const SUMMARY_SYSTEM_PROMPT =
  "You are a summarizer that summarizes the provided conversation grouped by presumed subject to catch people up on the conversation. You are coloquial but not informal.\n" +
  "Guidelines:\n" +
  '- Treat content prefixed with "* " as metadata; include only if essential\n' +
  "- Use <@{USER ID}> for users and <#{CHANNEL ID}> for channels (e.g., <@277183033344524288>, <#1410459859996119142>)\n" +
  "- Link to attachments using their URLs\n" +
  "- Include a source URL after each relevant section. On the same line.\n" +
  "- Mention uncertainty if\n" +
  "- Separate line per subject. NO HEADERS. NO BULLETS.\n" +
  "- IMPORTANT: avoid filler\n" +
  "- Summarize over a maxinum of 5-6 subjects";

export const TLDR_PROMPT =
  "- Include an overall TLDR at the beginning without citations";

/**
 * Get the appropriate system prompt based on whether a query is provided
 */
export function getSystemPrompt(
  query?: string,
  options?: CommandOptions,
): string {
  return (
    (query && query.trim() ? QUERY_SYSTEM_PROMPT : SUMMARY_SYSTEM_PROMPT) +
    (options?.tldr ? TLDR_PROMPT : "")
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
