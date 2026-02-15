import { DEFAULT_LLM_MODEL } from "../options";
import { CommandOptions } from "./commandParser";
import { openRouter } from "./openRouter";
import { getSystemPrompt, formatUserContent } from "./prompts";
import { logger } from "./logger";

export async function summarize(
  content: string,
  query?: string,
  options?: CommandOptions,
) {
  if (!content.trim()) {
    logger.warn("No content to generate TLDR from");
    return "NOTHING TO GENERATE TLDR FROM";
  }

  const systemPrompt = getSystemPrompt(query, options);
  const userContent = formatUserContent(content, query);

  const model = options?.model || DEFAULT_LLM_MODEL;
  logger.info(`Calling LLM with model: ${model}`);

  const res = await openRouter.chat.send({
    chatGenerationParams: {
      model,
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

  const summary = String(res.choices[0].message.content ?? "TLDR GENERATION FAILED!");
  logger.info(`LLM response received (${summary.length} characters)`);

  return summary;
}
