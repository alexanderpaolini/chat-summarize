import minimist from 'minimist';

export interface CommandOptions {
    allowSummarizer: boolean;
    amount?: number;
    query?: string;
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
            query: undefined
        };
    }

    // Parse arguments using minimist
    const argv = minimist(cleanedContent.split(/\s+/), {
        boolean: ['allow-summarizer', 'S'],
        alias: {
            'S': 'allow-summarizer',
            'N': 'amount'
        }
    });

    // Extract query from non-flag arguments
    const queryParts = argv._.filter(arg => typeof arg === 'string');
    const query = queryParts.length > 0 ? queryParts.join(' ') : undefined;

    return {
        allowSummarizer: argv['allow-summarizer'] || false,
        amount: typeof argv.amount === 'number' ? argv.amount : undefined,
        query: query
    };
}
