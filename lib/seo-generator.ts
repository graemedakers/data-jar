
export async function generateSEOMetadata(productName: string, description: string): Promise<{ title: string; description: string }> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined");
    }

    const prompt = `
    Act as an SEO Expert.
    I need an optimized Meta Title and Meta Description for the following product:
    
    Product Name: ${productName}
    Product Description: ${description}

    Constraints:
    1. Meta Title:  Must be under 60 characters (including spaces). catchy and includes the main keyword.
    2. Meta Description: Must be under 160 characters (including spaces). Persuasive, includes a call to action if possible.

    Return ONLY a valid JSON object with no markdown formatting:
    {
        "title": "The generated title",
        "description": "The generated description"
    }
    `;

    // Use a robust model list similar to other parts of the app
    const models = ["gemini-2.0-flash-lite-preview-02-05", "gemini-flash-latest", "gemini-2.0-flash"];

    let lastError = null;

    for (const model of models) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                lastError = `Model ${model} failed: ${response.status} - ${errorText}`;
                console.warn(lastError);
                continue;
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                throw new Error("Invalid response format from AI");
            }

            const text = data.candidates[0].content.parts[0].text
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            try {
                const json = JSON.parse(text);

                // Double check constraints fallback (in case AI hallucinates length)
                if (json.title.length > 60) {
                    json.title = json.title.substring(0, 57) + "...";
                }
                if (json.description.length > 160) {
                    json.description = json.description.substring(0, 157) + "...";
                }

                return {
                    title: json.title,
                    description: json.description
                };
            } catch (e) {
                console.warn("Failed to parse JSON from AI", e);
                // Fallback loop will try next model if this fails, or we could just retry
                continue;
            }

        } catch (error) {
            console.warn(`Error with model ${model}`, error);
            lastError = error;
        }
    }

    throw new Error(`Failed to generate SEO metadata. Last error: ${lastError}`);
}
