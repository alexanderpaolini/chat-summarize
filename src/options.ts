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
 * Includes all user models plus additional admin-only models
 */
export const ADMIN_ALLOWED_MODELS = [
  ...USER_ALLOWED_MODELS,
  // Add admin-only models here as they become available
  // Example: 'openai/gpt-4', 'anthropic/claude-3-opus'
] as const;

export type UserAllowedModel = (typeof USER_ALLOWED_MODELS)[number];
export type AdminAllowedModel = (typeof ADMIN_ALLOWED_MODELS)[number];
export type AllowedModel = UserAllowedModel | AdminAllowedModel;
