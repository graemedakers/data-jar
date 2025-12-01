import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            console.warn("GEMINI_API_KEY is missing. Returning mock data.");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({
                description: "Mock: Picnic in the Park",
                indoor: false,
                duration: "2.0",
                activityLevel: "LOW",
                cost: "FREE",
                timeOfDay: "DAY"
            });
        }

        const prompt = `
        Generate a random, creative, and fun date idea for a couple.
        Return the response as a valid JSON object with the following fields:
        - description: string (a short, catchy title for the date)
        - indoor: boolean (true for indoor, false for outdoor)
        - duration: string (one of: "0.25", "0.5", "1.0", "2.0", "4.0", "8.0")
        - activityLevel: string (one of: "LOW", "MEDIUM", "HIGH")
        - cost: string (one of: "FREE", "$", "$$", "$$$")
        - timeOfDay: string (one of: "ANY", "DAY", "EVENING")

        Example:
        {
            "description": "Stargazing at the Observatory",
            "indoor": false,
            "duration": "2.0",
            "activityLevel": "LOW",
            "cost": "$",
            "timeOfDay": "EVENING"
        }
        
        Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
        `;

        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-2.0-flash"];
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
                    console.warn(`Model ${model} failed: ${response.status} - ${errorText}`);
                    lastError = `Model ${model} failed: ${response.status}`;
                    continue; // Try next model
                }

                const data = await response.json();
                if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                    throw new Error("Invalid API response format");
                }

                const text = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
                const idea = JSON.parse(text);
                return NextResponse.json(idea);

            } catch (e) {
                console.warn(`Error with model ${model}:`, e);
                lastError = e;
            }
        }

        // If we get here, all models failed
        console.error("All Gemini models failed.");

        // Try to list available models to debug
        let availableModels = "Could not fetch models";
        try {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (listRes.ok) {
                const listData = await listRes.json();
                availableModels = listData.models.map((m: any) => m.name).join(", ");
            } else {
                availableModels = `List failed: ${listRes.status}`;
            }
        } catch (e) {
            availableModels = "List fetch error";
        }

        return NextResponse.json({
            error: 'All AI models failed',
            details: `${lastError}. Available models: ${availableModels}`
        }, { status: 500 });

    } catch (error: any) {
        console.error('AI Random Idea error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
