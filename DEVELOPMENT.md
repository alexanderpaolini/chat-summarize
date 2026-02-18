# Development

## Local Development

For local development, run the bot directly without Docker:

```bash
# Install dependencies
pnpm install

# Start the bot with live reloading
pnpm start
```

This allows you to make code changes and see them immediately without rebuilding.

### Docker Development

If you prefer to develop using Docker, note that code changes require rebuilding the container:

```bash
# Rebuild and restart after code changes
pnpm run docker:build
pnpm run docker:start
```

For faster iteration during development, it's recommended to run the bot locally with `pnpm start` instead of using Docker.

## Testing

This project uses [Vitest](https://vitest.dev/) for testing.

Run tests:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm run test:watch
```

Run tests with UI:
```bash
pnpm run test:ui
```
