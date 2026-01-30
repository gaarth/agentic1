import { generateWithGemini, generateJSONWithGemini } from './gemini';
import { generateWithMistral, generateJSONWithMistral } from './mistral';

export type LLMProvider = 'gemini' | 'mistral';

export interface CompletionOptions {
    provider?: LLMProvider;
    systemInstruction?: string;
    json?: boolean;
}

/**
 * Generate a completion using the specified LLM provider
 * Default: gemini (recommended - no additional setup required)
 * Alternative: mistral (requires HuggingFace paid provider)
 */
export async function generateCompletion(prompt: string, options: CompletionOptions = {}): Promise<string> {
    const provider = options.provider || 'gemini';

    if (provider === 'mistral') {
        return generateWithMistral(prompt, options.systemInstruction);
    } else {
        return generateWithGemini(prompt, options.systemInstruction);
    }
}

/**
 * Generate a JSON completion using the specified LLM provider
 * Default: gemini (recommended - no additional setup required)
 * Alternative: mistral (requires HuggingFace paid provider)
 */
export async function generateJSONCompletion<T>(prompt: string, options: CompletionOptions = {}): Promise<T> {
    const provider = options.provider || 'gemini';

    if (provider === 'mistral') {
        return generateJSONWithMistral<T>(prompt, options.systemInstruction);
    } else {
        return generateJSONWithGemini<T>(prompt, options.systemInstruction);
    }
}

// Re-export individual functions for direct access
export { generateWithGemini, generateJSONWithGemini } from './gemini';
export { generateWithMistral, generateJSONWithMistral } from './mistral';
