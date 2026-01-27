import { generateWithGemini, generateJSONWithGemini } from './gemini';
import { generateWithNemotron, generateJSONWithNemotron } from './nemotron';

export type LLMProvider = 'gemini' | 'nemotron';

export interface CompletionOptions {
    provider?: LLMProvider;
    systemInstruction?: string;
    json?: boolean;
}

export async function generateCompletion(prompt: string, options: CompletionOptions = {}): Promise<string> {
    const provider = options.provider || 'gemini';

    if (provider === 'gemini') {
        return generateWithGemini(prompt, options.systemInstruction);
    } else {
        return generateWithNemotron(prompt, options.systemInstruction);
    }
}

export async function generateJSONCompletion<T>(prompt: string, options: CompletionOptions = {}): Promise<T> {
    const provider = options.provider || 'gemini';

    if (provider === 'gemini') {
        return generateJSONWithGemini<T>(prompt, options.systemInstruction);
    } else {
        return generateJSONWithNemotron<T>(prompt, options.systemInstruction);
    }
}
