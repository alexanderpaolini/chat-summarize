import minimist from "minimist";
import { ALLOWED_MODELS, type AllowedModel } from "../options";
import { logger } from "./logger";

export interface CommandOptions {
  ttl?: number;
  tldr?: boolean;
  allowSummarizer?: boolean;
  amount?: number;
  query?: string;
  model?: AllowedModel;
}

export interface ParsedCommand {
  command: string;
  options: CommandOptions;
  showHelp: boolean;
}

/**
 * Parses a full command with Unix-like syntax from a Discord message
 * Supports: [chat | @bot] [command] [--options]
 * @param content The message content (e.g., "chat summarize --amount 100 -S" or "@bot --help")
 * @returns Parsed command with name, options, and help flag
 */
export function parseCommand(content: string): ParsedCommand {
  // Remove trigger phrase "chat" or bot mentions
  let cleanedContent = content
    .replace(/^chat\s+/i, "")
    .replace(/<@!?\d+>/g, "") // Remove mentions
    .trim();

  // Parse arguments using minimist
  const argv = minimist(cleanedContent.split(/\s+/), {
    boolean: ["allow-summarizer", "S", "tldr", "T", "help", "h"],
    string: ["model", "M", "ttl"],
    alias: {
      S: "allow-summarizer",
      N: "amount",
      M: "model",
      T: "tldr",
      h: "help",
    },
  });

  // Check if --help flag is present
  const showHelp = argv.help || false;

  // If --help is present, return early
  if (showHelp) {
    return {
      command: "help",
      options: {},
      showHelp: true,
    };
  }

  // Extract command name from the first non-flag argument
  const nonFlagArgs = argv._.filter(
    (arg) => typeof arg === "string" && arg.trim(),
  );
  
  let command = "summarize"; // default command
  let queryParts = nonFlagArgs;
  
  // Check if first argument is a known command
  if (nonFlagArgs.length > 0) {
    const firstArg = nonFlagArgs[0].toLowerCase();
    if (firstArg === "summarize" || firstArg === "help") {
      command = firstArg;
      queryParts = nonFlagArgs.slice(1); // Remove command from query parts
    }
  }

  // Extract query from remaining non-flag arguments
  const query =
    queryParts.length > 0
      ? queryParts.join(" ").trim() || undefined
      : undefined;

  // Validate and parse model
  const modelValue = argv.model;
  const isValidModel =
    modelValue && ALLOWED_MODELS.includes(modelValue as AllowedModel);
  const model = isValidModel ? (modelValue as AllowedModel) : undefined;

  const options: CommandOptions = {
    ttl: argv["ttl"] ? Number(argv["ttl"]) : undefined,
    tldr: argv["tldr"],
    allowSummarizer: argv["allow-summarizer"] || false,
    amount: typeof argv.amount === "number" ? argv.amount : undefined,
    query,
    model,
  };

  // Log parsed command and options (excluding query to avoid logging potentially sensitive user input)
  logger.info(
    `Parsed command: ${command}, options: ${JSON.stringify({ ...options, query: options.query ? "[redacted]" : undefined })}`,
  );

  return {
    command,
    options,
    showHelp,
  };
}

/**
 * Parses command-line style arguments from a Discord message
 * @param content The message content (e.g., "chat summarize --amount 100 -S")
 * @returns Parsed command options
 * @deprecated Use parseCommand instead for new code. This function is maintained for backward compatibility with existing tests.
 */
export function parseCommandOptions(content: string): CommandOptions {
  // For backward compatibility, we use parseCommand and return only options
  const parsed = parseCommand(content);
  return parsed.options;
}
