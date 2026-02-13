import { Message, Collection } from "discord.js";
import { CommandOptions } from "./commandParser";

const MAX_EMBED_DESCRIPTION_LENGTH = 100;

export async function contextResolver(
  initMessage: Message,
  botUserId: string,
  options: CommandOptions = { allowSummarizer: false, tldr: false },
): Promise<string> {
  const authorId = initMessage.author.id;
  const channel = initMessage.channel;

  let beforeId: string | undefined = initMessage.id;
  const collected: Message[] = [];
  let lastNonBotMessageId: string | undefined = undefined;
  // Track message count for --amount option (starting at 1 to include initMessage)
  let messageCount = 1;

  while (true) {
    const batch: Collection<string, Message> = await channel.messages.fetch({
      limit: 100,
      before: beforeId,
    });

    if (!batch.size) break;

    const messages = Array.from(batch.values());

    for (const msg of messages) {
      // Skip the bot's own messages unless --allow-summarizer is set
      if (msg.author.id === botUserId && !options.allowSummarizer) {
        continue;
      }

      // If amount is specified, stop when we reach the limit
      if (options.amount !== undefined && messageCount >= options.amount) {
        beforeId = undefined;
        break;
      }

      // If amount is not specified, stop when we reach the author's previous message
      if (options.amount === undefined && msg.author.id === authorId) {
        beforeId = undefined;
        break;
      }

      collected.push(msg);
      messageCount++;
      // Track the last non-bot message for pagination
      lastNonBotMessageId = msg.id;
    }

    if (!beforeId) break;

    // If we didn't find any non-bot messages, we've reached the end
    if (!lastNonBotMessageId) break;

    beforeId = lastNonBotMessageId;
    lastNonBotMessageId = undefined; // Reset for next batch
  }

  collected.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const res = collected
    .map((m) => {
      let s = "";
      s += `${m.author.tag} (${m.author.id}) | ${new Date(
        m.editedTimestamp ?? m.createdTimestamp,
      ).toLocaleString()}\n`;
      s += m.content;

      if (m.mentions.users.size) {
        s += "\n";
        s += `* mentions (users): ${m.mentions.users
          .map((x) => `${x.tag} (${x.id})`)
          .join(", ")}`;
      }

      if (m.mentions.channels.size) {
        s += "\n";
        s += `* mentions (channels): ${m.mentions.channels
          .map((x) => `${x.id}`)
          .join(", ")}`;
      }

      if (m.mentions.roles.size) {
        s += "\n";
        s += `* mentions (roles): ${m.mentions.roles
          .map((role) => `${role.name} (${role.id})`)
          .join(", ")}`;
      }

      if (m.attachments.size) {
        s += "\n";
        s += `* attachments: ${m.attachments
          .map(
            (attachment) =>
              `${attachment.name || "file"} (${attachment.contentType || "unknown type"}) - ${attachment.url}`,
          )
          .join(", ")}`;
      }

      if (m.embeds.length) {
        s += "\n";
        s += `* embeds: ${m.embeds.length} ${m.embeds.length === 1 ? "embed" : "embeds"}`;
        m.embeds.forEach((embed, idx) => {
          if (embed.title) {
            s += `\n  - [${idx + 1}] ${embed.title}`;
          }
          if (embed.description) {
            const isTruncated =
              embed.description.length > MAX_EMBED_DESCRIPTION_LENGTH;
            const desc = embed.description.substring(
              0,
              MAX_EMBED_DESCRIPTION_LENGTH,
            );
            s += `\n    ${desc}${isTruncated ? "..." : ""}`;
          }
        });
      }

      if (m.reactions.cache.size) {
        s += "\n";
        s += `* reactions: ${Array.from(m.reactions.cache.values())
          .map((reaction) => `${reaction.emoji.name} (${reaction.count})`)
          .join(", ")}`;
      }

      if (m.reference) {
        s += "\n";
        s += `* reply to message: ${m.reference.messageId}`;
      }

      if (m.hasThread) {
        s += "\n";
        s += `* has thread`;
      }

      s += "* url: " + m.url;

      return s;
    })
    .join("\n\n");

  return res;
}
