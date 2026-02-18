import { describe, it, expect } from 'vitest';
import { parseCommand } from '../src/lib/commandParser';

describe('parseCommand', () => {
  describe('command extraction', () => {
    it("should extract 'summarize' command explicitly", () => {
      const result = parseCommand('chat summarize');
      expect(result.command).toBe('summarize');
      expect(result.showHelp).toBe(false);
    });

    it("should default to 'summarize' when no command specified", () => {
      const result = parseCommand('chat what did they say');
      expect(result.command).toBe('summarize');
      expect(result.options.query).toBe('what did they say');
    });

    it("should extract 'help' command", () => {
      const result = parseCommand('chat help');
      expect(result.command).toBe('help');
      expect(result.showHelp).toBe(false);
    });

    it("should extract 'summarize' command with @mention", () => {
      const result = parseCommand('<@123456789> summarize');
      expect(result.command).toBe('summarize');
    });

    it("should extract 'help' command with @mention", () => {
      const result = parseCommand('<@123456789> help');
      expect(result.command).toBe('help');
    });
  });

  describe('help flag', () => {
    it('should detect --help flag', () => {
      const result = parseCommand('chat --help');
      expect(result.command).toBe('help');
      expect(result.showHelp).toBe(true);
    });

    it('should detect -h flag', () => {
      const result = parseCommand('@bot -h');
      expect(result.command).toBe('help');
      expect(result.showHelp).toBe(true);
    });

    it('should prioritize --help over other commands', () => {
      const result = parseCommand('chat summarize --help');
      expect(result.command).toBe('help');
      expect(result.showHelp).toBe(true);
    });
  });

  describe('command with options', () => {
    it('should parse summarize command with amount flag', () => {
      const result = parseCommand('chat summarize --amount 100');
      expect(result.command).toBe('summarize');
      expect(result.options.amount).toBe(100);
      expect(result.options.query).toBeUndefined();
    });

    it('should parse summarize command with query', () => {
      const result = parseCommand('chat summarize what did they say');
      expect(result.command).toBe('summarize');
      expect(result.options.query).toBe('what did they say');
    });

    it('should parse command with query and flags', () => {
      const result = parseCommand(
        'chat summarize what happened -S --amount 50'
      );
      expect(result.command).toBe('summarize');
      expect(result.options.query).toBe('what happened');
      expect(result.options.allowSummarizer).toBe(true);
      expect(result.options.amount).toBe(50);
    });

    it('should handle default command (no explicit command) with flags', () => {
      const result = parseCommand('chat --amount 100 what happened');
      expect(result.command).toBe('summarize');
      expect(result.options.amount).toBe(100);
      expect(result.options.query).toBe('what happened');
    });
  });

  describe('backward compatibility', () => {
    it("should support 'chat summarize' format", () => {
      const result = parseCommand('chat summarize');
      expect(result.command).toBe('summarize');
      expect(result.options.query).toBeUndefined();
    });

    it("should support '@bot query' format", () => {
      const result = parseCommand('<@123456789> what did they say');
      expect(result.command).toBe('summarize');
      expect(result.options.query).toBe('what did they say');
    });

    it("should support 'chat summarize query' format", () => {
      const result = parseCommand('chat summarize what did Sarah say');
      expect(result.command).toBe('summarize');
      expect(result.options.query).toBe('what did Sarah say');
    });

    it("should support 'chat query' format (implicit summarize)", () => {
      const result = parseCommand('chat what did they discuss');
      expect(result.command).toBe('summarize');
      expect(result.options.query).toBe('what did they discuss');
    });
  });

  describe('model flag', () => {
    it('should parse model flag with summarize command', () => {
      const result = parseCommand(
        'chat summarize --model google/gemini-2.5-flash-lite'
      );
      expect(result.command).toBe('summarize');
      expect(result.options.model).toBe('google/gemini-2.5-flash-lite');
    });

    it('should parse model flag with default command', () => {
      const result = parseCommand(
        'chat --model google/gemini-2.5-flash-lite what happened'
      );
      expect(result.command).toBe('summarize');
      expect(result.options.model).toBe('google/gemini-2.5-flash-lite');
      expect(result.options.query).toBe('what happened');
    });

    it('should allow valid model for regular users', () => {
      const result = parseCommand(
        'chat summarize --model google/gemini-2.5-flash-lite',
        false // not admin
      );
      expect(result.options.model).toBe('google/gemini-2.5-flash-lite');
    });

    it('should allow valid model for admin users', () => {
      const result = parseCommand(
        'chat summarize --model google/gemini-2.5-flash-lite',
        true // admin
      );
      expect(result.options.model).toBe('google/gemini-2.5-flash-lite');
    });

    it('should reject invalid model for regular users', () => {
      const result = parseCommand(
        'chat summarize --model invalid-model',
        false // not admin
      );
      expect(result.options.model).toBeUndefined();
    });

    it('should reject invalid model for admin users', () => {
      const result = parseCommand(
        'chat summarize --model invalid-model',
        true // admin
      );
      expect(result.options.model).toBeUndefined();
    });
  });
});
