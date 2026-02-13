import { describe, it, expect, vi } from 'vitest';
import { contextResolver } from '../src/lib/contextResolver';
import { Message, Collection, User, MessageReaction, Attachment, Embed, MessageReference, Role, GuildChannel } from 'discord.js';

describe('contextResolver', () => {
    describe('context formatting', () => {
        it('should include basic message information', async () => {
            const mockChannel = {
                messages: {
                    fetch: vi.fn().mockResolvedValue(new Collection())
                }
            };

            const mockAuthor = {
                id: '123456789',
                tag: 'TestUser#1234'
            } as User;

            const mockMessage = {
                id: '999',
                author: mockAuthor,
                content: 'Hello world',
                channel: mockChannel,
                createdTimestamp: 1234567890000,
                editedTimestamp: null,
                mentions: {
                    users: new Collection(),
                    channels: new Collection(),
                    roles: new Collection()
                },
                attachments: new Collection(),
                embeds: [],
                reactions: { cache: new Collection() },
                reference: null,
                hasThread: false
            } as unknown as Message;

            const result = await contextResolver(mockMessage, 'bot123');

            expect(result).toContain('TestUser#1234 (123456789)');
            expect(result).toContain('Hello world');
        });

        it('should include role mentions when present', async () => {
            const mockChannel = {
                messages: {
                    fetch: vi.fn().mockResolvedValue(new Collection())
                }
            };

            const mockRole = {
                id: '456789',
                name: 'Moderator'
            } as Role;

            const mockRoles = new Collection<string, Role>();
            mockRoles.set('456789', mockRole);

            const mockAuthor = {
                id: '123456789',
                tag: 'TestUser#1234'
            } as User;

            const mockMessage = {
                id: '999',
                author: mockAuthor,
                content: 'Hello @Moderator',
                channel: mockChannel,
                createdTimestamp: 1234567890000,
                editedTimestamp: null,
                mentions: {
                    users: new Collection(),
                    channels: new Collection(),
                    roles: mockRoles
                },
                attachments: new Collection(),
                embeds: [],
                reactions: { cache: new Collection() },
                reference: null,
                hasThread: false
            } as unknown as Message;

            const result = await contextResolver(mockMessage, 'bot123');

            expect(result).toContain('* mentions (roles): Moderator (456789)');
        });

        it('should include attachments when present', async () => {
            const mockChannel = {
                messages: {
                    fetch: vi.fn().mockResolvedValue(new Collection())
                }
            };

            const mockAttachment = {
                name: 'image.png',
                contentType: 'image/png',
                url: 'https://cdn.discordapp.com/attachments/123/456/image.png'
            } as Attachment;

            const mockAttachments = new Collection<string, Attachment>();
            mockAttachments.set('att1', mockAttachment);

            const mockAuthor = {
                id: '123456789',
                tag: 'TestUser#1234'
            } as User;

            const mockMessage = {
                id: '999',
                author: mockAuthor,
                content: 'Check this out',
                channel: mockChannel,
                createdTimestamp: 1234567890000,
                editedTimestamp: null,
                mentions: {
                    users: new Collection(),
                    channels: new Collection(),
                    roles: new Collection()
                },
                attachments: mockAttachments,
                embeds: [],
                reactions: { cache: new Collection() },
                reference: null,
                hasThread: false
            } as unknown as Message;

            const result = await contextResolver(mockMessage, 'bot123');

            expect(result).toContain('* attachments: image.png (image/png) - https://cdn.discordapp.com/attachments/123/456/image.png');
        });

        it('should handle attachments without name or contentType', async () => {
            const mockChannel = {
                messages: {
                    fetch: vi.fn().mockResolvedValue(new Collection())
                }
            };

            const mockAttachment = {
                name: null,
                contentType: null,
                url: 'https://cdn.discordapp.com/attachments/123/456/unknown.bin'
            } as unknown as Attachment;

            const mockAttachments = new Collection<string, Attachment>();
            mockAttachments.set('att1', mockAttachment);

            const mockAuthor = {
                id: '123456789',
                tag: 'TestUser#1234'
            } as User;

            const mockMessage = {
                id: '999',
                author: mockAuthor,
                content: 'Check this out',
                channel: mockChannel,
                createdTimestamp: 1234567890000,
                editedTimestamp: null,
                mentions: {
                    users: new Collection(),
                    channels: new Collection(),
                    roles: new Collection()
                },
                attachments: mockAttachments,
                embeds: [],
                reactions: { cache: new Collection() },
                reference: null,
                hasThread: false
            } as unknown as Message;

            const result = await contextResolver(mockMessage, 'bot123');

            expect(result).toContain('* attachments: file (unknown type) - https://cdn.discordapp.com/attachments/123/456/unknown.bin');
        });

        it('should include embeds when present', async () => {
            const mockChannel = {
                messages: {
                    fetch: vi.fn().mockResolvedValue(new Collection())
                }
            };

            const mockEmbed = {
                title: 'Important Link',
                description: 'This is a description'
            } as Embed;

            const mockAuthor = {
                id: '123456789',
                tag: 'TestUser#1234'
            } as User;

            const mockMessage = {
                id: '999',
                author: mockAuthor,
                content: 'Check this link',
                channel: mockChannel,
                createdTimestamp: 1234567890000,
                editedTimestamp: null,
                mentions: {
                    users: new Collection(),
                    channels: new Collection(),
                    roles: new Collection()
                },
                attachments: new Collection(),
                embeds: [mockEmbed],
                reactions: { cache: new Collection() },
                reference: null,
                hasThread: false
            } as unknown as Message;

            const result = await contextResolver(mockMessage, 'bot123');

            expect(result).toContain('* embeds: 1 embed');
            expect(result).toContain('[1] Important Link');
            expect(result).toContain('This is a description');
        });

        it('should use correct plural form for multiple embeds', async () => {
            const mockChannel = {
                messages: {
                    fetch: vi.fn().mockResolvedValue(new Collection())
                }
            };

            const mockEmbed1 = {
                title: 'First Link',
                description: 'First description'
            } as Embed;

            const mockEmbed2 = {
                title: 'Second Link',
                description: 'Second description'
            } as Embed;

            const mockAuthor = {
                id: '123456789',
                tag: 'TestUser#1234'
            } as User;

            const mockMessage = {
                id: '999',
                author: mockAuthor,
                content: 'Check these links',
                channel: mockChannel,
                createdTimestamp: 1234567890000,
                editedTimestamp: null,
                mentions: {
                    users: new Collection(),
                    channels: new Collection(),
                    roles: new Collection()
                },
                attachments: new Collection(),
                embeds: [mockEmbed1, mockEmbed2],
                reactions: { cache: new Collection() },
                reference: null,
                hasThread: false
            } as unknown as Message;

            const result = await contextResolver(mockMessage, 'bot123');

            expect(result).toContain('* embeds: 2 embeds');
            expect(result).toContain('[1] First Link');
            expect(result).toContain('[2] Second Link');
        });

        it('should include reactions when present', async () => {
            const mockChannel = {
                messages: {
                    fetch: vi.fn().mockResolvedValue(new Collection())
                }
            };

            const mockReaction = {
                emoji: { name: '👍' },
                count: 5
            } as MessageReaction;

            const mockReactions = new Collection<string, MessageReaction>();
            mockReactions.set('thumbsup', mockReaction);

            const mockAuthor = {
                id: '123456789',
                tag: 'TestUser#1234'
            } as User;

            const mockMessage = {
                id: '999',
                author: mockAuthor,
                content: 'Great idea!',
                channel: mockChannel,
                createdTimestamp: 1234567890000,
                editedTimestamp: null,
                mentions: {
                    users: new Collection(),
                    channels: new Collection(),
                    roles: new Collection()
                },
                attachments: new Collection(),
                embeds: [],
                reactions: { cache: mockReactions },
                reference: null,
                hasThread: false
            } as unknown as Message;

            const result = await contextResolver(mockMessage, 'bot123');

            expect(result).toContain('* reactions: 👍 (5)');
        });

        it('should include reply reference when present', async () => {
            const mockChannel = {
                messages: {
                    fetch: vi.fn().mockResolvedValue(new Collection())
                }
            };

            const mockReference = {
                messageId: '888777666'
            } as MessageReference;

            const mockAuthor = {
                id: '123456789',
                tag: 'TestUser#1234'
            } as User;

            const mockMessage = {
                id: '999',
                author: mockAuthor,
                content: 'Replying to that',
                channel: mockChannel,
                createdTimestamp: 1234567890000,
                editedTimestamp: null,
                mentions: {
                    users: new Collection(),
                    channels: new Collection(),
                    roles: new Collection()
                },
                attachments: new Collection(),
                embeds: [],
                reactions: { cache: new Collection() },
                reference: mockReference,
                hasThread: false
            } as unknown as Message;

            const result = await contextResolver(mockMessage, 'bot123');

            expect(result).toContain('* reply to message: 888777666');
        });

        it('should include thread indicator when message has thread', async () => {
            const mockChannel = {
                messages: {
                    fetch: vi.fn().mockResolvedValue(new Collection())
                }
            };

            const mockAuthor = {
                id: '123456789',
                tag: 'TestUser#1234'
            } as User;

            const mockMessage = {
                id: '999',
                author: mockAuthor,
                content: 'Starting a discussion',
                channel: mockChannel,
                createdTimestamp: 1234567890000,
                editedTimestamp: null,
                mentions: {
                    users: new Collection(),
                    channels: new Collection(),
                    roles: new Collection()
                },
                attachments: new Collection(),
                embeds: [],
                reactions: { cache: new Collection() },
                reference: null,
                hasThread: true
            } as unknown as Message;

            const result = await contextResolver(mockMessage, 'bot123');

            expect(result).toContain('* has thread');
        });
    });
});
