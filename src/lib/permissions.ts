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

/**
 * Check if a user is an admin
 * @param message The Discord message to check admin status for
 * @param adminUserIds Array of admin user IDs
 * @returns true if the user is an admin, false otherwise
 */
export function isAdmin(message: Message, adminUserIds: string[]): boolean {
  // Bots should never be admins
  if (message.author.bot) {
    return false;
  }

  // If no admin user IDs are configured, no one is an admin
  if (!adminUserIds || adminUserIds.length === 0) {
    return false;
  }

  // Check if the user ID is in the admin list
  return adminUserIds.includes(message.author.id);
}
