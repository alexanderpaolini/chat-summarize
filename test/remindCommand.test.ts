import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { Message, Client } from 'discord.js';
import { parseCommand } from '../src/lib/commandParser';

let remindCommand: (typeof import('../src/lib/commands/remind'))['remindCommand'];
let openRouter: (typeof import('../src/lib/openRouter'))['openRouter'];

beforeAll(async () => {
  process.env.OPENROUTER_API_KEY =
    process.env.OPENROUTER_API_KEY ?? 'test-openrouter-key';
  process.env.DISCORD_TOKEN = process.env.DISCORD_TOKEN ?? 'test-discord-token';

  ({ remindCommand } = await import('../src/lib/commands/remind'));
  ({ openRouter } = await import('../src/lib/openRouter'));
});

describe('parseCommand - remind command', () => {
  it("should extract 'remind' command with instruction", () => {
    const result = parseCommand(
      'chat remind me in 10 minutes to check the oven'
    );
    expect(result.command).toBe('remind');
    expect(result.options.query).toBe('me in 10 minutes to check the oven');
  });

  it("should extract 'remind' command from @mention format", () => {
    const result = parseCommand(
      '<@123456789> remind me in an hour to call mom'
    );
    expect(result.command).toBe('remind');
    expect(result.options.query).toBe('me in an hour to call mom');
  });

  it("should handle 'remind' command with no instruction", () => {
    const result = parseCommand('chat remind');
    expect(result.command).toBe('remind');
    expect(result.options.query).toBeUndefined();
  });

  it('should handle remind with every/recurring phrasing', () => {
    const result = parseCommand(
      'chat remind me every tuesday at 5pm to go to taco bell'
    );
    expect(result.command).toBe('remind');
    expect(result.options.query).toBe(
      'me every tuesday at 5pm to go to taco bell'
    );
  });
});

describe('remindCommand execution', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not require admin permissions', () => {
    expect(remindCommand.requiresPermission).toBe(false);
  });

  it('should reply with error when no instruction given', async () => {
    const reply = vi.fn().mockResolvedValue(undefined);
    const message = {
      reply,
      channel: {},
      client: {} as Client,
    } as unknown as Message;

    await remindCommand.execute({
      message,
      botUserId: '123',
      botUserTag: 'bot#0001',
      options: {},
    });

    expect(reply).toHaveBeenCalledOnce();
    expect(reply.mock.calls[0][0]).toMatchObject({
      content: expect.stringContaining('remind'),
    });
  });

  it('should schedule a reminder via generated code', async () => {
    const reply = vi.fn().mockResolvedValue(undefined);
    const sendTyping = vi.fn().mockResolvedValue(undefined);
    const client = {} as Client;

    const message = {
      reply,
      channel: { sendTyping },
      client,
      author: { id: '999' },
    } as unknown as Message;

    type ChatClient = { send: ReturnType<typeof vi.fn> };
    const chatClient = openRouter.chat as unknown as
      | { send?: ReturnType<typeof vi.fn> }
      | undefined;

    if (!chatClient || typeof chatClient.send !== 'function') {
      (openRouter as unknown as { chat: ChatClient }).chat = {
        send: vi.fn(),
      };
    }

    const chat = (openRouter as unknown as { chat: ChatClient }).chat;

    vi.spyOn(chat, 'send').mockResolvedValue({
      choices: [
        {
          message: {
            content: `(async () => {
  await message.reply("I'll remind you in 10 seconds!");
  setTimeout(() => {
    message.reply("<@" + message.author.id + "> Reminder: do something!");
  }, 10000);
})();`,
          },
        },
      ],
    });

    await remindCommand.execute({
      message,
      botUserId: '123',
      botUserTag: 'bot#0001',
      options: { query: 'remind me in 10 seconds to do something' },
    });

    // Should have sent confirmation reply
    expect(reply).toHaveBeenCalledWith("I'll remind you in 10 seconds!");
  });

  it('should block generated code containing require()', async () => {
    const reply = vi.fn().mockResolvedValue(undefined);
    const sendTyping = vi.fn().mockResolvedValue(undefined);

    const message = {
      reply,
      channel: { sendTyping },
      client: {} as Client,
      author: { id: '999' },
    } as unknown as Message;

    type ChatClient = { send: ReturnType<typeof vi.fn> };
    const chat = (openRouter as unknown as { chat: ChatClient }).chat;

    vi.spyOn(chat, 'send').mockResolvedValue({
      choices: [
        {
          message: {
            // Malicious code attempting to use require
            content: `const fs = require('fs'); await message.reply(fs.readFileSync('/etc/passwd', 'utf8'));`,
          },
        },
      ],
    });

    await remindCommand.execute({
      message,
      botUserId: '123',
      botUserTag: 'bot#0001',
      options: { query: 'remind me to do something' },
    });

    // Should have replied with failure, not executed the require
    const calls = reply.mock.calls.map(c => c[0]);
    const failed = calls.some(
      c =>
        typeof c === 'object' &&
        c !== null &&
        typeof c.content === 'string' &&
        c.content.includes('REMINDER FAILED')
    );
    expect(failed).toBe(true);
  });

  it('should block generated code containing base64', async () => {
    const reply = vi.fn().mockResolvedValue(undefined);
    const sendTyping = vi.fn().mockResolvedValue(undefined);

    const message = {
      reply,
      channel: { sendTyping },
      client: {} as Client,
      author: { id: '999' },
    } as unknown as Message;

    type ChatClient = { send: ReturnType<typeof vi.fn> };
    const chat = (openRouter as unknown as { chat: ChatClient }).chat;

    vi.spyOn(chat, 'send').mockResolvedValue({
      choices: [
        {
          message: {
            content: `const evil = atob('aGVsbG8='); await message.reply(evil);`,
          },
        },
      ],
    });

    await remindCommand.execute({
      message,
      botUserId: '123',
      botUserTag: 'bot#0001',
      options: { query: 'remind me to do something' },
    });

    const calls = reply.mock.calls.map(c => c[0]);
    const failed = calls.some(
      c =>
        typeof c === 'object' &&
        c !== null &&
        typeof c.content === 'string' &&
        c.content.includes('REMINDER FAILED')
    );
    expect(failed).toBe(true);
  });
});
