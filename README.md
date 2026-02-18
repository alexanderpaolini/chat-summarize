# Chat, summarize

`Chat, summarize` is a discord bot that summarizes the last `N` messages, such that your last message in that channel was message `N + 1`.

Tired of scrolling up in your channels and reading hundreds of messages? `Chat, summarize` has you covered.

## Usage

The bot uses Unix-like command syntax: `[chat | @bot] [command] [--options]`

### Basic Commands

- **Summarize** (default command)
  ```
  chat summarize
  chat
  @bot summarize
  @bot
  ```

- **Run** - Generate and execute code based on natural language
  ```
  chat run <instruction>
  @bot run <instruction>
  ```

- **Help** - Show available commands and options
  ```
  chat help
  chat --help
  @bot help
  @bot --help
  ```

### Query Mode

You can ask specific questions about the conversation:

```
chat what did James say about going to Fuji on Thursday?
@bot who mentioned the meeting?
chat summarize what did Sarah say about the project?
```

### Run Command Examples

The `run` command uses AI to generate and execute code based on your natural language instructions:

```
chat run remind me in 10 seconds to do something
chat run get the current time
chat run send a message saying hello
@bot run get the server name
```

**⚠️ SECURITY WARNING:** 
- The `run` command executes AI-generated JavaScript code with access to the Discord bot's permissions
- This feature is **RESTRICTED** to authorized users only via the `ALLOWED_USER_IDS` environment variable
- Bot accounts are automatically blocked from executing any commands
- While the command restricts access to file system and shell commands, it can still perform actions on Discord (send messages, modify channels, etc.) based on the bot's permissions
- The AI model may misinterpret instructions or generate unexpected code
- Be aware of potential prompt injection attacks where malicious users try to manipulate the AI
- Use this feature at your own risk and in controlled environments only

**Access Control:**
To enable the `run` command for specific users, set the `ALLOWED_USER_IDS` environment variable to a comma-separated list of Discord user IDs:
```bash
ALLOWED_USER_IDS="123456789012345678,987654321098765432"
```

Only users in this list will be able to:
- Execute the `run` command
- See the `run` command in help output

**Admin Privileges:**
To grant admin privileges (access to additional AI models), set the `ADMIN_USER_IDS` environment variable:
```bash
ADMIN_USER_IDS="123456789012345678"
```

Admin users have access to:
- All models available to regular users
- Additional admin-only models (when configured)

To find a user's Discord ID, enable Developer Mode in Discord settings, then right-click on a user and select "Copy ID".

### Command Options

You can customize the summarization behavior with the following options:

- `--help` or `-h`  
  Show available commands and options.
  
  Example: `chat --help`

- `--allow-summarizer` or `-S`  
  By default, bot messages are filtered out to prevent recursive summarization. Use this option to include bot messages in the summary.
  
  Example: `chat summarize -S`

- `--amount <number>` or `-N <number>`  
  Specify the exact number of messages to summarize instead of fetching all messages until your last message.
  
  Example: `chat summarize --amount 100`

- `--model <model-name>` or `-M <model-name>`  
  Specify which AI model to use for summarization. Model selection may be restricted based on user permissions.
  - Regular users can select from: `google/gemini-2.5-flash-lite` (default)
  - Admin users (configured via `ADMIN_USER_IDS`) have access to additional models
  
  Example: `chat summarize --model google/gemini-2.5-flash-lite`

You can combine multiple options:

```
chat summarize -S --amount 50 --model google/gemini-2.5-flash-lite
```

You can also use flags with queries:

```
@bot what was discussed yesterday? --amount 200
chat what happened -S --amount 100
```

## Docker Deployment

This bot can be run in a lightweight Docker container for easy deployment.

### Prerequisites

- Docker and Docker Compose installed on your system
- A `.env` file with your API keys (copy from `.env.example`)

### Quick Start with Docker

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your API keys:**
   ```bash
   OPENROUTER_API_KEY="your-openrouter-api-key"
   DISCORD_TOKEN="your-discord-bot-token"
   ALLOWED_USER_IDS="comma,separated,discord,user,ids"  # Optional: Required for 'run' command
   ADMIN_USER_IDS="comma,separated,discord,user,ids"    # Optional: For admin model access
   ```

3. **Start the bot using Docker Compose:**
   ```bash
   pnpm run docker:start
   ```

### Docker Commands

The following npm scripts are available for managing the Docker container:

- `pnpm run docker:start` - Build and start the container in detached mode
- `pnpm run docker:stop` - Stop and remove the container
- `pnpm run docker:logs` - View container logs in real-time
- `pnpm run docker:build` - Build the Docker image

Alternatively, you can use Docker Compose commands directly:

```bash
# Build and start
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f

# Rebuild
docker compose build
```

### Docker Container Details

- Based on lightweight `node:20-alpine` image
- Automatically installs dependencies using pnpm
- Configured to restart automatically unless stopped manually
- Uses environment variables from `.env` file

## Contributing

Interested in contributing? See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

For development and testing information, see [DEVELOPMENT.md](DEVELOPMENT.md).