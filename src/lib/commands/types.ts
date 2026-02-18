import { Message } from 'discord.js';
import { CommandOptions } from '../commandParser';

export interface CommandContext {
  message: Message;
  botUserId: string;
  botUserTag: string;
  options: CommandOptions;
}

export interface Command {
  name: string;
  description: string;
  execute: (context: CommandContext) => Promise<void>;
}
