/**
 * See https://openrouter.ai/models
 */
export const DEFAULT_LLM_MODEL = "google/gemini-3-flash-preview";

/**
 * List of allowed models that users can specify
 */
export const ALLOWED_MODELS = ["google/gemini-2.5-flash-lite"] as const;

export type AllowedModel = (typeof ALLOWED_MODELS)[number];
