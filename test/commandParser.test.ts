import { describe, it, expect } from 'vitest';
import { parseCommandOptions } from '../src/lib/commandParser';

describe('parseCommandOptions', () => {
    describe('query extraction', () => {
        it('should extract query from mention with text', () => {
            const result = parseCommandOptions('<@123456789> what did James say about Fuji');
            expect(result.query).toBe('what did James say about Fuji');
        });

        it('should extract query from chat summarize command', () => {
            const result = parseCommandOptions('chat summarize what did Sarah say');
            expect(result.query).toBe('what did Sarah say');
        });

        it('should return undefined query when no text is provided', () => {
            const result = parseCommandOptions('chat summarize');
            expect(result.query).toBeUndefined();
        });

        it('should return undefined query when only mention is provided', () => {
            const result = parseCommandOptions('<@123456789>');
            expect(result.query).toBeUndefined();
        });
    });

    describe('flags with query', () => {
        it('should extract query and amount flag', () => {
            const result = parseCommandOptions('chat summarize what did they say --amount 50');
            expect(result.query).toBe('what did they say');
            expect(result.amount).toBe(50);
        });

        it('should extract query and allow-summarizer flag', () => {
            const result = parseCommandOptions('<@123456789> tell me about the meeting -S');
            expect(result.query).toBe('tell me about the meeting');
            expect(result.allowSummarizer).toBe(true);
        });

        it('should handle both flags with query', () => {
            const result = parseCommandOptions('chat summarize what happened -S -N 100');
            expect(result.query).toBe('what happened');
            expect(result.allowSummarizer).toBe(true);
            expect(result.amount).toBe(100);
        });
    });

    describe('backward compatibility', () => {
        it('should handle amount flag without query', () => {
            const result = parseCommandOptions('chat summarize --amount 100');
            expect(result.amount).toBe(100);
            expect(result.query).toBeUndefined();
        });

        it('should handle allow-summarizer flag without query', () => {
            const result = parseCommandOptions('chat summarize -S');
            expect(result.allowSummarizer).toBe(true);
            expect(result.query).toBeUndefined();
        });

        it('should handle combined flags without query', () => {
            const result = parseCommandOptions('chat summarize -S --amount 50');
            expect(result.allowSummarizer).toBe(true);
            expect(result.amount).toBe(50);
            expect(result.query).toBeUndefined();
        });
    });
});
