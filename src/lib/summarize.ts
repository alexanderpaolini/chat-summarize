import { LLM_MODEL } from '../options';
import { openRouter } from './openRouter';

export async function summarize(content: string, query?: string) {
    if (!content.trim()) return "NOTHING TO SUMMARIZE";

    const systemPrompt = query 
        ? "You are a helpful assistant that answers questions about conversations.\n" +
          "Guidelines:\n" +
          "- Answer the user's question based on the conversation provided\n" +
          "- Be clear and concise\n" +
          "- Mention relevant people using this format: <@{User Snowflake}> ex. <@277183033344524288>\n" +
          "- Mention relevant channels using this format: <#{Channel Snowflake}> ex. <#1456394387268571169>\n" +
          "- Any content prefixed with \" * \" is system-provided metadata (e.g., mentions, user IDs, display names). Use it only as supporting context if needed.\n" +
          "- If the answer cannot be found in the conversation, say so clearly\n" +
          "- Do not start with phrases like \"here is the answer\" or \"based on the conversation\""
        : "You are an expert summarizer. Summarize the conversation in clear, concise bullet points.\n" +
          "Guidelines:\n" +
          "- Keep it brief\n" +
          "- Be general, but include specific details when they are important for understanding.\m" +
          "- Mention relevant things using this format: <@{User Snowflake}> ex. <@277183033344524288>; <@{Channel Snowflake}> ex. <#1456394387268571169>\n" +
          "- Any content prefixed with \" * \" is system- provided metadata (e.g., mentions, user IDs, display names). Use it only as supporting context if needed, but do not explicitly quote or summarize it unless essential for clarity.\n" +
          "- Focus only on the actual conversation content.\n" +
          "- If something is unclear or uncertain, briefly note the uncertainty.\n" +
          "- IMPORTANT Keep the number of points per subject to a minimum\n" +
          "- Do not start with telling us \"here is the summary\"";

    const userContent = query 
        ? `Question: ${query}\n\nConversation:\n${content}`
        : content;

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
