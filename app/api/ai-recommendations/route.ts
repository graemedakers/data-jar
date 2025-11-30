import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { description, location } = await request.json();

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            // Mock response if no API key is configured
            console.warn("GEMINI_API_KEY is missing. Returning mock data.");
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
            return NextResponse.json({
                recommendations: [
                    `Mock Recommendation 1 for ${description}`,
                    `Mock Recommendation 2 for ${description}`,
                    `Mock Recommendation 3 for ${description} (Add GEMINI_API_KEY to .env for real AI!)`
                ]
            });
        }

        const prompt = `
        I am planning a date with the following idea: "${description}".
        ${location ? `We are located in or near ${location}. Please suggest 3 REAL, specific places nearby that fit this date idea.` : 'Please suggest 3 creative variations or themes for this date.'}
        
        If a location is provided, try to find actual businesses, parks, or venues in that area.
        If no location is provided or specific places aren't found, suggest creative themes or types of places.
        
        Keep the suggestions concise (max 1 sentence each).
        Format the output as a simple JSON array of strings.
        Example: ["Central Park near the Boathouse", "The High Line Park", "Riverside Park at Sunset"]
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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
            console.error("Gemini API Error:", errorText);
            throw new Error(`Gemini API returned ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        // simple parsing to ensure we get an array
        let recommendations = [];
        try {
            // Try to find JSON array in the text
            const match = text.match(/\[.*\]/s);
            if (match) {
                recommendations = JSON.parse(match[0]);
            } else {
                // Fallback splitting
                recommendations = text.split('\n').filter((line: string) => line.trim().length > 0).slice(0, 3);
            }
        } catch (e) {
            console.error("Failed to parse AI response", e);
            recommendations = ["Could not generate specific recommendations. Try exploring nearby!"];
        }

        return NextResponse.json({ recommendations });

    } catch (error) {
        console.error('AI Recommendation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
