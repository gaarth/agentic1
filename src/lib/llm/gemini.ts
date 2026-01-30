// LLM Client - Gemini with robust retry logic
// Currently using Gemini 2.0 Flash as the primary and only LLM
// HuggingFace route requires paid providers, so we focus on Gemini

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface GeminiResponse {
    candidates: {
        content: {
            parts: { text: string }[];
        };
    }[];
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate completion with Gemini API
 * Includes aggressive retry logic for rate limiting
 */
export async function generateWithGemini(
    prompt: string,
    systemInstruction?: string,
    maxRetries = 5
): Promise<string> {
    const contents: GeminiMessage[] = [
        { role: 'user', parts: [{ text: prompt }] }
    ];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    systemInstruction: systemInstruction ? {
                        parts: [{ text: systemInstruction }]
                    } : undefined,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    }
                }),
            });

            if (response.status === 429) {
                // Rate limited - exponential backoff with longer waits
                const retryAfter = response.headers.get('retry-after');
                let waitTime: number;

                if (retryAfter) {
                    // Use the server-provided retry time
                    waitTime = parseInt(retryAfter) * 1000;
                } else {
                    // Exponential backoff: 5s, 15s, 45s, 90s, 180s
                    waitTime = Math.min(5000 * Math.pow(3, attempt), 180000);
                }

                console.log(`Gemini rate limited (attempt ${attempt + 1}/${maxRetries}), waiting ${waitTime / 1000}s...`);
                await sleep(waitTime);
                continue;
            }

            if (response.status === 503) {
                // Service unavailable - wait and retry
                const waitTime = 10000 * (attempt + 1);
                console.log(`Gemini service unavailable, waiting ${waitTime / 1000}s...`);
                await sleep(waitTime);
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const data: GeminiResponse = await response.json();
            return data.candidates[0]?.content?.parts[0]?.text || '';
        } catch (error) {
            console.error(`Gemini attempt ${attempt + 1} failed:`, error);
            if (attempt === maxRetries - 1) throw error;
            await sleep(2000 * (attempt + 1));
        }
    }

    throw new Error('Max retries exceeded for Gemini API');
}

/**
 * Generate JSON completion with Gemini API
 * Automatically cleans and parses the response
 */
export async function generateJSONWithGemini<T>(
    prompt: string,
    systemInstruction?: string
): Promise<T> {
    const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON, no markdown or explanation.`;
    const response = await generateWithGemini(jsonPrompt, systemInstruction);

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

    return JSON.parse(cleaned.trim()) as T;
}
