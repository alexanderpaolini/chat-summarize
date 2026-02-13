import { DEFAULT_LLM_MODEL } from "../options";
import { CommandOptions } from "./commandParser";
import { openRouter } from "./openRouter";
import { getSystemPrompt, formatUserContent } from "./prompts";

export async function summarize(
  content: string,
  query?: string,
  options?: CommandOptions,
) {
  if (!content.trim()) return "NOTHING TO SUMMARIZE";

  const systemPrompt = getSystemPrompt(query, options);
  const userContent = formatUserContent(content, query);

  console.log(options);

  const res = await openRouter.chat.send({
    chatGenerationParams: {
      model: options?.model || DEFAULT_LLM_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    },
  });

  return String(res.choices[0].message.content ?? "SUMMARY FAILED!");
}
