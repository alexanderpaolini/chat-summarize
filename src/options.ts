//
// See https://openrouter.ai/models
//

export const DEFAULT_LLM_MODEL = "google/gemini-2.5-flash-lite";
export const USER_ALLOWED_MODELS = ["google/gemini-2.5-flash-lite"] as const;
export const ADMIN_ALLOWED_MODELS = [...USER_ALLOWED_MODELS] as const;

export type UserAllowedModel = (typeof USER_ALLOWED_MODELS)[number];
export type AdminAllowedModel = (typeof ADMIN_ALLOWED_MODELS)[number];
export type AllowedModel = UserAllowedModel | AdminAllowedModel;
