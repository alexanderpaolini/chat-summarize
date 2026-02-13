import { describe, it, expect } from 'vitest';
import { getSystemPrompt, formatUserContent, QUERY_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT } from '../src/lib/prompts';

describe('prompts', () => {
    describe('getSystemPrompt', () => {
        it('should return query prompt when query is provided', () => {
            const result = getSystemPrompt('what did they say?');
            expect(result).toBe(QUERY_SYSTEM_PROMPT);
        });

        it('should return summary prompt when no query is provided', () => {
            const result = getSystemPrompt();
            expect(result).toBe(SUMMARY_SYSTEM_PROMPT);
        });

        it('should return summary prompt when query is undefined', () => {
            const result = getSystemPrompt(undefined);
            expect(result).toBe(SUMMARY_SYSTEM_PROMPT);
        });

        it('should return summary prompt when query is an empty string', () => {
            const result = getSystemPrompt('');
            expect(result).toBe(SUMMARY_SYSTEM_PROMPT);
        });

        it('should return summary prompt when query is whitespace only', () => {
            const result = getSystemPrompt('   ');
            expect(result).toBe(SUMMARY_SYSTEM_PROMPT);
        });
    });

    describe('formatUserContent', () => {
        const content = 'User1: Hello\nUser2: Hi there';

        it('should format content with query', () => {
            const query = 'what did User1 say?';
            const result = formatUserContent(content, query);
            expect(result).toBe(`Question: ${query}\n\nConversation:\n${content}`);
        });

        it('should return content as-is when no query is provided', () => {
            const result = formatUserContent(content);
            expect(result).toBe(content);
        });

        it('should return content as-is when query is undefined', () => {
            const result = formatUserContent(content, undefined);
            expect(result).toBe(content);
        });

        it('should return content as-is when query is an empty string', () => {
            const result = formatUserContent(content, '');
            expect(result).toBe(content);
        });

        it('should return content as-is when query is whitespace only', () => {
            const result = formatUserContent(content, '   ');
            expect(result).toBe(content);
        });
    });
});
