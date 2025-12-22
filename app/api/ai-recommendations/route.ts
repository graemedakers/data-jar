import { NextResponse } from 'next/server';
import { reliableGeminiCall } from '@/lib/gemini';


export async function POST(request: Request) {
    try {
        const { description, details, location } = await request.json();

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
                    { title: "Mock Place 1", description: `A great spot for ${description}`, url: "https://google.com" },
                    { title: "Mock Place 2", description: `Another cool place for ${description}`, url: "https://google.com" },
                    { title: "Mock Place 3", description: `Try this for ${description}`, url: "https://google.com" }
                ]
            });
        }

        const prompt = `
        I am planning a date with the following idea: "${description}".
        ${details ? `The plan details are: "${details}".` : ''}
        
        CRITICAL INSTRUCTION:
        - You must find 3 REAL, specific places that fit this date idea.
        - The location of these places MUST be based on the "plan details" provided above.
        - ONLY if the plan details do not specify a location, use the user's general location: ${location ? location : "their local area"}.
        - If the plan details mention a specific city, neighborhood, or venue, IGNORE the user's general location and search there instead.
        
        For each suggestion, provide:
        - title: The name of the place or activity.
        - description: A short, catchy description (1 sentence).
        - url: A valid URL for the place (official website, Ticketmaster, Eventbrite, or a Google Search URL if specific site unknown).
        
        Format the output as a JSON array of objects.
        Example:
        [
            { "title": "Central Park Boathouse", "description": "Rent a rowboat for a romantic afternoon.", "url": "https://centralparkboathouse.com" },
            { "title": "The High Line", "description": "Walk along the elevated park with city views.", "url": "https://www.thehighline.org" }
        ]
        
        Do not include markdown formatting. Just the raw JSON.
        `;

        try {
            const recommendations = await reliableGeminiCall(prompt);
            return NextResponse.json({ recommendations });
        } catch (error) {
            console.error("Gemini failed", error);
            // Fallback empty
            return NextResponse.json({ recommendations: [] });
        }



    } catch (error) {
        console.error('AI Recommendation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
