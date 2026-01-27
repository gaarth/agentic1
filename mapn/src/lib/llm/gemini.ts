// Gemini 2.0 Flash client for planning and supervision tasks

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

export async function generateWithGemini(
    prompt: string,
    systemInstruction?: string,
    maxRetries = 3
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
                // Rate limited - exponential backoff
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`Gemini rate limited, waiting ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data: GeminiResponse = await response.json();
            return data.candidates[0]?.content?.parts[0]?.text || '';
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }

    throw new Error('Max retries exceeded for Gemini API');
}

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

    return JSON.parse(cleaned.trim()) as T;
}
