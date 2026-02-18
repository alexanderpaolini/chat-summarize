import { Message } from 'discord.js';

/**
 * Check if a user has permission to execute restricted commands
 * @param message The Discord message to check permissions for
 * @param allowedUserIds Array of allowed user IDs
 * @returns true if the user has permission, false otherwise
 */
export function hasPermission(
  message: Message,
  allowedUserIds: string[]
): boolean {
  // Bots should never have permission
  if (message.author.bot) {
    return false;
  }

  // If no allowed user IDs are configured, no one has permission
  if (!allowedUserIds || allowedUserIds.length === 0) {
    return false;
  }

  // Check if the user ID is in the allowed list
  return allowedUserIds.includes(message.author.id);
}
