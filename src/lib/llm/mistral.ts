// Client for Mistral AI Direct API (Free Experiment Tier)
// https://console.mistral.ai
// With retry logic and Gemini fallback

import { generateWithGemini, generateJSONWithGemini } from './gemini';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Free tier model - Mistral Small is available on free tier
const MISTRAL_MODEL = 'mistral-small-latest';

interface MistralMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface MistralResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate completion using Mistral AI Direct API
 * Falls back to Gemini if Mistral fails or is not configured
 */
export async function generateWithMistral(
    prompt: string,
    systemInstruction?: string,
    maxRetries = 3
): Promise<string> {
    // Get API key at runtime (important for Edge runtime)
    const apiKey = process.env.MISTRAL_API_KEY;

    // If no Mistral API key, fall back to Gemini immediately
    if (!apiKey || apiKey === 'your_mistral_api_key_here') {
        console.log('⚠️ MISTRAL_API_KEY not set or placeholder, using Gemini fallback...');
        return generateWithGemini(prompt, systemInstruction);
    }

    console.log('🚀 Using Mistral AI for completion...');

    const messages: MistralMessage[] = [];

    if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(MISTRAL_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: MISTRAL_MODEL,
                    messages: messages,
                    max_tokens: 2048,
                    temperature: 0.7
                })
            });

            // Handle rate limiting (429)
            if (response.status === 429) {
                const retryAfter = response.headers.get('retry-after');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 2000;
                console.log(`Mistral rate limited, waiting ${waitTime / 1000}s...`);
                await sleep(waitTime);
                continue;
            }

            // Handle service unavailable (503)
            if (response.status === 503) {
                const waitTime = 5000 * (attempt + 1);
                console.log(`Mistral service unavailable, waiting ${waitTime / 1000}s...`);
                await sleep(waitTime);
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
            }

            const data: MistralResponse = await response.json();
            const content = data.choices?.[0]?.message?.content || '';
            console.log('✅ Mistral returned response successfully');
            return content;
        } catch (error) {
            console.error(`Mistral attempt ${attempt + 1} failed:`, error);

            if (attempt === maxRetries - 1) {
                // Fallback to Gemini on final failure
                console.log('Mistral failed, falling back to Gemini...');
                return generateWithGemini(prompt, systemInstruction);
            }
            await sleep(1000 * (attempt + 1));
        }
    }

    // Final fallback to Gemini
    console.log('Max retries exceeded for Mistral, falling back to Gemini...');
    return generateWithGemini(prompt, systemInstruction);
}

/**
 * Generate JSON completion using Mistral AI Direct API
 * Falls back to Gemini if parsing fails
 */
export async function generateJSONWithMistral<T>(
    prompt: string,
    systemInstruction?: string
): Promise<T> {
    // Add explicit JSON instruction
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json. Valid JSON only.`;

    try {
        const response = await generateWithMistral(jsonPrompt, systemInstruction);

        // Clean up response - remove markdown code blocks if present
        let cleaned = response.trim();
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.slice(7);
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.slice(3);
        }
        if (cleaned.endsWith('```')) {
            cleaned = cleaned.slice(0, -3);
        }

        // Extract JSON object from potential surrounding text
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }

        // Remove invalid '+' signs before numbers
        cleaned = cleaned.replace(/(\s|:|")\+(\d+)/g, '$1$2');

        try {
            return JSON.parse(cleaned) as T;
        } catch {
            // If JSON parsing fails, fallback to Gemini
            console.log('Mistral JSON parse failed, falling back to Gemini...');
            return generateJSONWithGemini<T>(prompt, systemInstruction);
        }
    } catch {
        // Fallback to Gemini for any errors
        console.log('Mistral failed, falling back to Gemini for JSON...');
        return generateJSONWithGemini<T>(prompt, systemInstruction);
    }
}

// Alias exports for backward compatibility
export const generateWithPlanning = generateWithMistral;
export const generateJSONWithPlanning = generateJSONWithMistral;
