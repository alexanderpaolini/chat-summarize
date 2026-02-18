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
 * Currently contains the same models as regular users, but can be extended
 * by adding admin-only models here (e.g., premium or more expensive models)
 */
export const ADMIN_ALLOWED_MODELS = [
  'google/gemini-2.5-flash-lite',
  // Add admin-only models here as they become available
  // Example: 'openai/gpt-4', 'anthropic/claude-3-opus'
] as const;

/**
 * @deprecated Use USER_ALLOWED_MODELS or ADMIN_ALLOWED_MODELS instead
 * This constant is kept for backward compatibility with existing code/tests.
 * Maps to USER_ALLOWED_MODELS since that's the baseline set all users can access.
 */
export const ALLOWED_MODELS = USER_ALLOWED_MODELS;

export type UserAllowedModel = (typeof USER_ALLOWED_MODELS)[number];
export type AdminAllowedModel = (typeof ADMIN_ALLOWED_MODELS)[number];
export type AllowedModel = UserAllowedModel | AdminAllowedModel;
