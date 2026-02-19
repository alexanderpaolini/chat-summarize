import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { parseCommand } from '../src/lib/commandParser';

let runCommand: (typeof import('../src/lib/commands/run'))['runCommand'];
let openRouter: (typeof import('../src/lib/openRouter'))['openRouter'];

beforeAll(async () => {
  process.env.OPENROUTER_API_KEY =
    process.env.OPENROUTER_API_KEY ?? 'test-openrouter-key';
  process.env.DISCORD_TOKEN =
    process.env.DISCORD_TOKEN ?? 'test-discord-token';

  ({ runCommand } = await import('../src/lib/commands/run'));
  ({ openRouter } = await import('../src/lib/openRouter'));
});

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

describe('runCommand execution', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should expose require to generated code', async () => {
    const reply = vi.fn().mockResolvedValue(undefined);
    const sendTyping = vi.fn().mockResolvedValue(undefined);

    const message = {
      reply,
      channel: { sendTyping },
      client: {},
    } as any;

    if (!openRouter.chat || typeof (openRouter.chat as any).send !== 'function') {
      (openRouter as any).chat = { send: vi.fn() };
    }

    vi.spyOn(openRouter.chat as any, 'send').mockResolvedValue({
      choices: [
        {
          message: {
            content:
              'const path = require("path"); await message.reply(path.basename("/tmp/example.txt"));',
          },
        },
      ],
    });

    await runCommand.execute({
      message,
      botUserId: '123',
      botUserTag: 'bot#0001',
      options: { query: 'use require' },
    });

    expect(reply).toHaveBeenCalledWith('example.txt');
  });

  it('should not require admin permissions', () => {
    expect(runCommand.requiresPermission).toBe(false);
  });
});
