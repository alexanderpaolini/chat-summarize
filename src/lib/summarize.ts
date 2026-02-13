import { LLM_MODEL } from '../options';
import { openRouter } from './openRouter';
import { getSystemPrompt, formatUserContent } from './prompts';

export async function summarize(content: string, query?: string) {
    if (!content.trim()) return "NOTHING TO SUMMARIZE";

    const systemPrompt = getSystemPrompt(query);
    const userContent = formatUserContent(content, query);

    const res = await openRouter.chat.send({
        chatGenerationParams: {
            model: LLM_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userContent
                }
            ]
        }
    })

    return String(res.choices[0].message.content ?? "SUMMARY FAILED!");
}
