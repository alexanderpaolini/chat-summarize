import { Message } from "discord.js";
import type { CommandOptions } from "./lib/commandHandler";

export interface CommandContext {
  message: Message;
  content: string;
  options: CommandOptions;
}

export interface Command {
  name: string;
  description: string;
  admin?: boolean;
  execute: (context: CommandContext) => Promise<void>;
}
