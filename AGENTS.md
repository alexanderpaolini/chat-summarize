# AGENTS

Quick reference for the repository.

- Purpose: Discord bot that summarizes recent channel messages and can run AI-generated code on admin request.
- Entry point: `src/index.ts` wires Discord events, status pings (`ready to summarize!`), command parsing, and permissions.
- Commands (see `src/lib/commands`):
  - `summarize` (default) with flags like `--amount/-N`, `--allow-summarizer/-S`, `--model/-M`; accepts an optional query after the command.
  - `run` (admin-only) generates and executes JS via OpenRouter; admin IDs come from `ADMIN_USER_IDS`.
  - `help` lists available commands and flags.
- Models: defaults to `google/gemini-2.5-flash-lite`; allowed models defined in `src/options.ts`.
- Environment: `OPENROUTER_API_KEY`, `DISCORD_TOKEN`, optional comma-separated `ADMIN_USER_IDS` (parsed in `src/env.ts`).
- Local dev: `pnpm install` then `pnpm start` (or `npm install`/`npm start` if pnpm is unavailable); `.env` required (see `.env.example`).
- Testing/type-check: `pnpm test`, `pnpm run type-check`. Docker helpers: `pnpm run docker:start|stop|logs|build`.
- Docs: see `README.md` for usage and `DEVELOPMENT.md` for dev/test details.
