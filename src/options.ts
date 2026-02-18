/**
 * See https://openrouter.ai/models
 */
export const DEFAULT_LLM_MODEL = 'google/gemini-2.5-flash-lite';

/**
 * List of models available to regular users
 */
export const USER_ALLOWED_MODELS = ['google/gemini-2.5-flash-lite'] as const;

/**
 * List of models available only to admin users
 */
export const ADMIN_ALLOWED_MODELS = [
  'google/gemini-2.5-flash-lite',
  // Add admin-only models here as they become available
] as const;

/**
 * @deprecated Use USER_ALLOWED_MODELS or ADMIN_ALLOWED_MODELS instead
 * List of allowed models that users can specify (kept for backward compatibility)
 */
export const ALLOWED_MODELS = USER_ALLOWED_MODELS;

export type UserAllowedModel = (typeof USER_ALLOWED_MODELS)[number];
export type AdminAllowedModel = (typeof ADMIN_ALLOWED_MODELS)[number];
export type AllowedModel = UserAllowedModel | AdminAllowedModel;
