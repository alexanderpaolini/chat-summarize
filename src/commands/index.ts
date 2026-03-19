import type { Command } from "../types";
import { helpCommand } from "./help";
import { remindCommand } from "./remind";
import { runCommand } from "./run";

export const commands = new Map<string, Command>();

commands.set("remind", remindCommand);
commands.set("help", helpCommand);
commands.set("run", runCommand);
