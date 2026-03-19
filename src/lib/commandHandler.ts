import minimist from "minimist";
import {
  USER_ALLOWED_MODELS,
  ADMIN_ALLOWED_MODELS,
  type AllowedModel,
  DEFAULT_LLM_MODEL,
} from "../options";
import { logger } from "./logger";
import type { Message } from "discord.js";
import { commands } from "../commands";

export interface CommandOptions {
  ttl: number;
  tldr: boolean;
  allowSummarizer: boolean;
  amount?: number;
  model: AllowedModel;
}

export function handleCommand(msg: Message): void {
  if (msg.author.bot) return;

  // TODO: fix this!!
  const isAdmin = true;
  const cmdInfo = parseCommand(msg, isAdmin);

  // TODO: this is ugly I don't like it
  if (!cmdInfo) return;

  cmdInfo.cmd?.execute({
    content: cmdInfo.text,
    message: msg,
    options: cmdInfo.options,
  });
}

export function parseCommand(msg: Message, isAdminUser = false) {
  const startsWithName =
    msg.content.startsWith(msg.guild?.members.me?.nickname ?? "") ||
    msg.content.startsWith(msg.client.user.displayName);

  const mentioned = msg.mentions.users.some((x) => x.id === msg.client.user.id);

  if (!startsWithName && !mentioned) return;

  const argv = minimist(
    msg.content.split(" ").filter((x) => x),
    {
      boolean: ["allow-summarizer", "S", "tldr", "T", "help", "h"],
      string: ["model", "M", "ttl"],
      alias: {
        S: "allow-summarizer",
        N: "amount",
        M: "model",
        T: "tldr",
        H: "help",
      },
    },
  );

  const showHelp = argv.help || false;

  if (showHelp) {
    return {
      command: "help",
      options: {
        allowSummarizer: false,
        model: DEFAULT_LLM_MODEL,
        tldr: false,
        ttl: 30_000,
      },
      text: "",
    };
  }

  let args = argv._;
  if (startsWithName) args = args.slice(1);
  const cmd =
    commands.get(args[0]?.toLowerCase() ?? "") ?? commands.get("summarize");

  if (!cmd) return;

  let model = argv.model;
  const allowedModels = isAdminUser
    ? ADMIN_ALLOWED_MODELS
    : USER_ALLOWED_MODELS;

  if (model && !allowedModels.includes(model)) {
    logger.warn(`${model}`);
    model = undefined;
  }

  const options: CommandOptions = {
    ttl: typeof argv.ttl === "number" ? argv.ttl : 30_000,
    tldr: argv["tldr"] || false,
    allowSummarizer: argv["allow-summarizer"] || false,
    amount: typeof argv.amount === "number" ? argv.amount : undefined,
    model: model ?? DEFAULT_LLM_MODEL,
  };

  logger.info(`Parsed command: ${cmd.name} --> ${msg.content}`);

  return {
    cmd,
    options,
    text: args.join(" "),
  };
}
