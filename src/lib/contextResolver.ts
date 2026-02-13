import { Message, Collection } from "discord.js";

export async function contextResolver(initMessage: Message, botUserId: string): Promise<string> {
    const authorId = initMessage.author.id;
    const channel = initMessage.channel;

    let beforeId: string | undefined = initMessage.id;
    const collected: Message[] = [initMessage];

    while (true) {
        const batch: Collection<string, Message> =
            await channel.messages.fetch({
                limit: 100,
                before: beforeId,
            });

        if (!batch.size) break;

        const messages = Array.from(batch.values());
        let lastNonBotMessageId: string | undefined = undefined;

        for (const msg of messages) {
            // Skip bot's own messages
            if (msg.author.id === botUserId) {
                continue;
            }

            // Track the last non-bot message for pagination
            lastNonBotMessageId = msg.id;

            if (msg.author.id === authorId) {
                beforeId = undefined;
                break;
            }

            collected.push(msg);
        }

        if (!beforeId) break;

        // If we didn't find any non-bot messages, we've reached the end
        if (!lastNonBotMessageId) break;

        beforeId = lastNonBotMessageId;
    }

    collected.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    const res = collected
        .map(m => {
            let s = "";
            s += `${m.author.tag} (${m.author.id}) | ${new Date(
                m.editedTimestamp ?? m.createdTimestamp
            ).toLocaleString()}\n`;
            s += m.content;

            if (m.mentions.users.size) {
                s += '\n';
                s += `* mentions (users): ${m.mentions.users
                    .map(x => `${x.tag} (${x.id})`)
                    .join(", ")}`;
            }

            if (m.mentions.channels.size) {
                s += '\n';
                s += `* mentions (channels): ${m.mentions.channels
                    .map(x => `${x.id}`)
                    .join(", ")}`;
            }

            return s;
        })
        .join("\n\n");

    return res;
}
