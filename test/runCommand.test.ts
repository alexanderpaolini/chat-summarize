import { describe, it, expect } from 'vitest';
import { parseCommand } from '../src/lib/commandParser';

describe('parseCommand - run command', () => {
  it("should extract 'run' command with instruction", () => {
    const result = parseCommand('chat run ping 1.1.1.1');
    expect(result.command).toBe('run');
    expect(result.options.query).toBe('ping 1.1.1.1');
  });

  it("should extract 'run' command from @mention format", () => {
    const result = parseCommand('<@123456789> run remind me in 10 seconds');
    expect(result.command).toBe('run');
    expect(result.options.query).toBe('remind me in 10 seconds');
  });

  it("should handle 'run' command with no instruction", () => {
    const result = parseCommand('chat run');
    expect(result.command).toBe('run');
    expect(result.options.query).toBeUndefined();
  });

  it("should handle 'run' command with model flag", () => {
    const result = parseCommand(
      'chat run get current time --model google/gemini-2.5-flash-lite'
    );
    expect(result.command).toBe('run');
    expect(result.options.query).toBe('get current time');
    expect(result.options.model).toBe('google/gemini-2.5-flash-lite');
  });

  it('should handle complex run instructions', () => {
    const result = parseCommand(
      'chat run create a reminder for tomorrow at 3pm'
    );
    expect(result.command).toBe('run');
    expect(result.options.query).toBe('create a reminder for tomorrow at 3pm');
  });
});
