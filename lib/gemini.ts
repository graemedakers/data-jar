
const DEFAULT_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro"
];

interface GenerateOptions {
    apiKey?: string;
    models?: string[];
    temperature?: number;
}

/**
 * reliableGeminiCall
 * 
 * Executes a prompt against a list of Gemini models, handling failover and 429/404 errors automatically.
 * Returns the parsed JSON response.
 */
export async function reliableGeminiCall<T>(prompt: string, options: GenerateOptions = {}): Promise<T> {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined");
    }

    const models = options.models || DEFAULT_MODELS;
    let lastError = null;

    for (const model of models) {
        try {
            // Google Search Tool is only supported on some models, but 1.5-flash and pro support it.
            // gemini-1.0-pro might not support it well with JSON mode, but we will try.

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    tools: [{ google_search: {} }], // Enable Search Grounding
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                const status = response.status;
                throw new Error(`Model ${model} failed with status ${status}: ${errorText}`);
            }

            const data = await response.json();

            // Check if candidates exist
            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                throw new Error(`Model ${model} returned invalid structure.`);
            }

            const text = data.candidates[0].content.parts[0].text;

            // Clean markdown if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanText) as T;

        } catch (error: any) {
            // console.warn(`Gemini attempt failed for ${model}:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }

    throw new Error(`All AI models failed. Last error: ${lastError?.message || lastError}`);
}
