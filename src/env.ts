import { createEnv } from "@t3-oss/env-nuxt";
import { z } from "zod";

export const env = createEnv({
  server: {
    DISCORD_TOKEN: z.string(),
    OPENROUTER_API_KEY: z.string(),
  },
});
