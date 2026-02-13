# Chat, summarize

`Chat, summarize` is a discord bot that summarizes the last `N` messages, such that your last message in that channel was message `N + 1`.

Tired of scrolling up in your channels and reading hundreds of messages? `Chat, summarize` has you covered.

## Usage

To use the bot, simply type `chat summarize` in any channel, or mention the bot.

You can also ask specific questions about the conversation:

```
@bot what did James say about going to Fuji on Thursday?
```

### Command Options

You can customize the summarization behavior with the following options:

- `--allow-summarizer` or `-S`  
  By default, bot messages are filtered out to prevent recursive summarization. Use this option to include bot messages in the summary.
  
  Example: `chat summarize -S`

- `--amount <number>` or `-N <number>`  
  Specify the exact number of messages to summarize instead of fetching all messages until your last message.
  
  Example: `chat summarize --amount 100`

- `--model <model-name>` or `-M <model-name>`  
  Specify which AI model to use for summarization. Available models:
  - `google/gemini-2.5-flash-lite` (default)
  
  Example: `chat summarize --model google/gemini-2.5-flash-lite`

You can combine multiple options:

```
chat summarize -S --amount 50 --model google/gemini-2.5-flash-lite
```

### Query Mode

When you provide text after the command or mention, the bot will answer your specific question instead of providing a summary:

```
chat summarize what did Sarah say about the project?
@bot who mentioned the meeting?
```

You can also use flags with queries:

```
@bot what was discussed yesterday? --amount 200
```

## Development

### Testing

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