import { describe, it, expect } from 'vitest';
import { hasPermission } from '../src/lib/permissions';
import { Message, User } from 'discord.js';

describe('permissions', () => {
  describe('hasPermission', () => {
    it('should return false for bot users', () => {
      const mockMessage = {
        author: {
          id: '123456789',
          bot: true,
        } as User,
      } as Message;

      expect(hasPermission(mockMessage, ['123456789'])).toBe(false);
    });

    it('should return false when no allowed user IDs are provided', () => {
      const mockMessage = {
        author: {
          id: '123456789',
          bot: false,
        } as User,
      } as Message;

      expect(hasPermission(mockMessage, [])).toBe(false);
    });

    it('should return true for allowed user ID', () => {
      const mockMessage = {
        author: {
          id: '123456789',
          bot: false,
        } as User,
      } as Message;

      expect(hasPermission(mockMessage, ['123456789'])).toBe(true);
    });

    it('should return true for allowed user ID in list', () => {
      const mockMessage = {
        author: {
          id: '222222222',
          bot: false,
        } as User,
      } as Message;

      expect(
        hasPermission(mockMessage, ['111111111', '222222222', '333333333'])
      ).toBe(true);
    });

    it('should return false for non-allowed user ID', () => {
      const mockMessage = {
        author: {
          id: '999999999',
          bot: false,
        } as User,
      } as Message;

      expect(hasPermission(mockMessage, ['111111111', '222222222'])).toBe(
        false
      );
    });
  });
});
