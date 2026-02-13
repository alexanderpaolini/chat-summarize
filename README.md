# Chat, summarize

`Chat, summarize` is a discord bot that summarizes the last `N` messages, such that your last message in that channel was message `N + 1`.

Tired of scrolling up in your channels and reading hundreds of messages? `Chat, summarize` has you covered.

## Usage

To use the bot, simply type `chat summarize` in any channel, or mention the bot.

### Command Options

You can customize the summarization behavior with the following options:

- `--allow-summarizer` or `-S`  
  By default, bot messages are filtered out to prevent recursive summarization. Use this option to include bot messages in the summary.
  
  Example: `chat summarize -S`

- `--amount <number>` or `-N <number>`  
  Specify the exact number of messages to summarize instead of fetching all messages until your last message.
  
  Example: `chat summarize --amount 100`

You can combine multiple options:

```
chat summarize -S --amount 50
```