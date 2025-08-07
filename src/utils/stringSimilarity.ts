// utils/stringSimilarity.ts
import stringSimilarity from 'string-similarity';

/**
 * Returns the best match from a list of options for a given input string, if above the threshold.
 * @param input The string to match.
 * @param options The list of possible options.
 * @param threshold The minimum similarity (0-1) to consider a match. Default 0.7.
 * @returns The best match string, or null if none above threshold.
 */
export function bestStringMatch(input: string, options: string[], threshold = 0.9): string | null {
    if (options.length === 0) return null;

    const { bestMatch } = stringSimilarity.findBestMatch(input, options);
    if (bestMatch.rating >= threshold) {
        return bestMatch.target;
    }
    return null;
}

/**
 * Returns the best match and its score for a given input string.
 * @param input The string to match.
 * @param options The list of possible options.
 * @returns { target: string, rating: number } for the best match.
 */
export function bestStringMatchWithScore(input: string, options: string[]) {
    if (options.length === 0) return null;

    const { bestMatch } = stringSimilarity.findBestMatch(input, options);
    return bestMatch;
}

/**
 * Searches each line of inputText for the best fuzzy match in options, returns the first match above threshold.
 * @param inputText The text to split into lines and search.
 * @param options The list of possible options.
 * @param threshold The minimum similarity (0-1) to consider a match. Default 0.7.
 * @returns The best match string, or null if none above threshold.
 */
export function bestLineMatch(inputText: string, options: string[], threshold = 0.7): string | null {
    if (options.length === 0) return null;
    const lines = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let bestOverallMatch: { target: string; rating: number } | null = null;

    for (const line of lines) {
        const match = bestStringMatchWithScore(line, options);
        if (match && (!bestOverallMatch || match.rating > bestOverallMatch.rating)) {
            bestOverallMatch = match;
        }
    }

    if (bestOverallMatch && bestOverallMatch.rating >= threshold) {
        return bestOverallMatch.target;
    }
    return null;
}