import minimist from 'minimist';
import { ALLOWED_MODELS, type AllowedModel } from '../options';

export interface CommandOptions {
    allowSummarizer: boolean;
    amount?: number;
    query?: string;
    model?: AllowedModel;
}

/**
 * Parses command-line style arguments from a Discord message
 * @param content The message content (e.g., "chat summarize --amount 100 -S")
 * @returns Parsed command options
 */
export function parseCommandOptions(content: string): CommandOptions {
    // Split the content into arguments, handling quotes
    // Remove the trigger phrase "chat summarize" or mentions
    const cleanedContent = content
        .replace(/^chat\s+summarize/i, '')
        .replace(/<@!?\d+>/g, '') // Remove mentions
        .trim();
    
    // If no arguments, return defaults
    if (!cleanedContent) {
        return {
            allowSummarizer: false,
            amount: undefined,
            query: undefined,
            model: undefined
        };
    }

    // Parse arguments using minimist
    const argv = minimist(cleanedContent.split(/\s+/), {
        boolean: ['allow-summarizer', 'S'],
        string: ['model', 'M'],
        alias: {
            'S': 'allow-summarizer',
            'N': 'amount',
            'M': 'model'
        }
    });

    // Extract query from non-flag arguments
    const queryParts = argv._.filter(arg => typeof arg === 'string' && arg.trim());
    const query = queryParts.length > 0 ? queryParts.join(' ').trim() || undefined : undefined;

    // Validate and parse model
    const modelValue = argv.model;
    const model = modelValue && ALLOWED_MODELS.includes(modelValue as AllowedModel)
        ? (modelValue as AllowedModel)
        : undefined;

    return {
        allowSummarizer: argv['allow-summarizer'] || false,
        amount: typeof argv.amount === 'number' ? argv.amount : undefined,
        query,
        model
    };
}
