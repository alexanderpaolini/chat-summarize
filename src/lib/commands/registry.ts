import { Command } from "./types";
import { summarizeCommand } from "./summarize";
import { helpCommand } from "./help";
import { runCommand } from "./run";

class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  register(command: Command): void {
    this.commands.set(command.name.toLowerCase(), command);
  }

  get(name: string): Command | undefined {
    return this.commands.get(name.toLowerCase());
  }

  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  has(name: string): boolean {
    return this.commands.has(name.toLowerCase());
  }
}

// Create and export the singleton registry
export const commandRegistry = new CommandRegistry();

// Register built-in commands
commandRegistry.register(summarizeCommand);
commandRegistry.register(helpCommand);
commandRegistry.register(runCommand);
