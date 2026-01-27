// Client for Nemotron via OpenRouter

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_ID = 'nvidia/nemotron-3-nano-30b-a3b'; // User requested this specific model

interface OpenRouterMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

interface OpenRouterResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

export async function generateWithNemotron(
    prompt: string,
    systemInstruction?: string,
    maxRetries = 3
): Promise<string> {
    const messages: OpenRouterMessage[] = [];

    if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
    }

    messages.push({ role: 'user', content: prompt });

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://mapn-demo.com', // Required by OpenRouter
                    'X-Title': 'Mapn Portfolio Negotiator',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: MODEL_ID,
                    messages,
                    temperature: 0.7,
                    max_tokens: 4096,
                }),
            });

            if (response.status === 429) {
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`Nemotron rate limited, waiting ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
            }

            const data: OpenRouterResponse = await response.json();
            return data.choices[0]?.message?.content || '';
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }

    throw new Error('Max retries exceeded for Nemotron API');
}

export async function generateJSONWithNemotron<T>(
    prompt: string,
    systemInstruction?: string
): Promise<T> {
    // Nemotron prompts often benefit from explicit JSON instruction in system or end of user prompt
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json. Valid JSON only.`;

    const response = await generateWithNemotron(jsonPrompt, systemInstruction);

    // Clean up response - remove markdown code blocks in case model adds them despite instructions
    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
    }

    // Try to find the first '{' and last '}' to handle preamble/postscript text
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // Robustness fix: Remove '+' signs before numbers which invalidates JSON
    // e.g., "+2" -> "2", " : +2" -> " : 2"
    cleaned = cleaned.replace(/(\s|:|")\+(\d+)/g, '$1$2');

    try {
        return JSON.parse(cleaned) as T;
    } catch (e) {
        // console.error("Failed to parse JSON from Nemotron:", cleaned); // Silenced for cleaner demo logging
        throw e;
    }
}
