# AGENTS

Deep reference for agents working on this repo.

## What this bot does
- Discord bot that summarizes the latest channel messages (default command) and can optionally answer a targeted query.
- Admin-only `run` command asks an LLM to generate JavaScript and executes it with a constrained sandbox; non-admins cannot see or use it.
- Bot ignores other bots, and responds to plain `chat`/`chat ...`/`chat\n...` or mentions. Mention-only messages return a health reply: `ready to summarize!`.

## Event and command flow (start here for code changes)
- `src/index.ts`: Discord client + intents. Handles `messageCreate`:
  - Fast-path status check (mention with no text) → reply ready.
  - `parseCommand` in `src/lib/commandParser.ts` turns raw text into `{command, options, query}`. Flags: `--amount/-N`, `--allow-summarizer/-S`, `--model/-M`, `--help/-h`, implicit default `summarize`.
  - Permissions: `isAdmin` in `src/lib/permissions.ts` checks author id against `ADMIN_USER_IDS`.
  - `commandRegistry` in `src/lib/commands/index.ts` resolves handlers; restricted commands gate on `requiresPermission`.
  - Each handler executes with `{message, botUserId, botUserTag, options}`.

## Commands (expectations)
- `summarize` (default):
  - Fetches recent messages via `contextResolver` (`src/lib/contextResolver.ts`), respecting `amount` (explicit number) or auto-stop at user's last message; can include bot messages with `--allow-summarizer`.
  - Builds a formatted text context (roles, attachments, embeds, reactions, replies, threads) and sends to LLM using `summarizeConversation` in `src/lib/summarize.ts`.
  - Model choice validated against allowed lists in `src/options.ts`; default `google/gemini-2.5-flash-lite`.
- `run` (admin only):
  - Uses `src/lib/commands/run.ts`; prompts LLM to return JS; runs inside a limited evaluator that exposes `require`, `message`, and blocks shell/fs. Log lines show the generated code.
- `help`: Lists commands and flags; hides `run` for non-admins.

## Models and access control
- Allowed model sets: `USER_ALLOWED_MODELS` / `ADMIN_ALLOWED_MODELS` in `src/options.ts`; expand there when adding models.
- Admin list comes from `ADMIN_USER_IDS` (comma-separated) env. Non-admins cannot select admin-only models; invalid models are ignored with a warning.

## Configuration needed to run
- `.env` keys (see `.env.example`):
  - `OPENROUTER_API_KEY` – required for LLM calls.
  - `DISCORD_TOKEN` – bot token.
  - `ADMIN_USER_IDS` – optional, comma-separated Discord user IDs for elevated permissions.
- Env parsing lives in `src/env.ts` (via `@t3-oss/env-core` + `zod`).

## Local dev + ops runbook
- Install deps: `pnpm install` (or `npm install` if pnpm unavailable).
- Start bot locally: `pnpm start` (or `npm start`) after copying and filling `.env`.
- Type-check: `pnpm run type-check`.
- Tests: `pnpm test` (Vitest). No snapshot usage.
- Docker: `pnpm run docker:start|stop|logs|build` uses `docker-compose.yml`.
- Common checks:
  - Status: mention the bot with no content → expect `ready to summarize!`.
  - Command parse sanity: run `pnpm test` to ensure parsers, permissions, prompts stay stable.
  - Logs: Winston logger (`src/lib/logger.ts`) prints to stdout; warnings log bad models or restricted command attempts.

## File map (touchpoints)
- `src/index.ts` – wiring and guards.
- `src/lib/commandParser.ts` – parsing and option validation.
- `src/lib/commands/*` – command implementations and registry.
- `src/lib/contextResolver.ts` – Discord message collection/formatting.
- `src/lib/summarize.ts` – OpenRouter call for summaries.
- `src/lib/openRouter.ts` – OpenRouter client wrapper; adjust headers/models here.
- `src/lib/prompts.ts` – prompt templates (summaries, run command).
- `src/options.ts` – model defaults/allow lists.

## Safety/expectations for changes
- Preserve admin gating on `run` and on model selection.
- Keep default summarize behavior to stop at user’s last message unless `--amount` given.
- Be cautious editing prompts: tests assert wording and model validation behavior.
- Prefer updating allow lists for new models over hardcoding strings elsewhere.
