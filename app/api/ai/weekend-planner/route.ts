import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check premium status
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { couple: true },
        });

        if (!user || !(user.couple as any)?.isPremium) {
            return NextResponse.json({ error: 'Premium required' }, { status: 403 });
        }

        const location = (user.couple as any).location || "your area";
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

        let targetDateStr = "";
        let context = "";

        // Logic:
        // If Mon(1) - Thu(4): Plan for upcoming weekend.
        // If Fri(5): Plan for tomorrow (Sat) and Sun.
        // If Sat(6): Plan for today and tomorrow.
        // If Sun(0): Plan for today.

        if (dayOfWeek >= 1 && dayOfWeek <= 4) {
            // Mon-Thu: Get next Saturday
            const daysUntilSat = 6 - dayOfWeek;
            const nextSat = new Date(today);
            nextSat.setDate(today.getDate() + daysUntilSat);
            const nextSun = new Date(nextSat);
            nextSun.setDate(nextSat.getDate() + 1);
            targetDateStr = `${nextSat.toDateString()} and ${nextSun.toDateString()}`;
            context = "the upcoming weekend";
        } else if (dayOfWeek === 5) { // Friday
            const nextSat = new Date(today);
            nextSat.setDate(today.getDate() + 1);
            const nextSun = new Date(nextSat);
            nextSun.setDate(nextSat.getDate() + 1);
            targetDateStr = `${nextSat.toDateString()} and ${nextSun.toDateString()}`;
            context = "this weekend";
        } else if (dayOfWeek === 6) { // Saturday
            const nextSun = new Date(today);
            nextSun.setDate(today.getDate() + 1);
            targetDateStr = `${today.toDateString()} and ${nextSun.toDateString()}`;
            context = "this weekend";
        } else { // Sunday
            targetDateStr = `${today.toDateString()}`;
            context = "today (Sunday)";
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        console.log("API Key present:", !!apiKey);

        if (!apiKey) {
            console.warn("No API key found, returning mock data");
            return NextResponse.json({
                suggestions: [
                    { title: "Mock: Local Farmers Market", description: "Visit the local market for fresh produce.", day: "Saturday", cost: "Free" },
                    { title: "Mock: Movie Night", description: "Catch the latest blockbuster.", day: "Sunday", cost: "$$" }
                ]
            });
        }

        const prompt = `
        I need 3 distinct date ideas for a couple in ${location} for ${context} (${targetDateStr}).
        
        Consider local events, weather (generally for this time of year), and popular spots in ${location}.
        
        Return the response as a valid JSON array of objects with the following fields:
        - title: string (catchy title)
        - description: string (2-3 sentences describing the activity and why it's good for this weekend)
        - day: string (suggested day, e.g., "Saturday" or "Sunday" or "Any")
        - cost: string (estimated cost)

        Example:
        [
            {
                "title": "Sunset Walk at the Pier",
                "description": "Enjoy the beautiful views...",
                "day": "Saturday",
                "cost": "Free"
            }
        ]
        
        Do not include markdown formatting. Just the raw JSON.
        `;

        const models = ["gemini-1.5-flash", "gemini-pro"];
        let lastError = "";

        for (const model of models) {
            try {
                console.log(`Attempting model: ${model}`);
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.error(`Model ${model} failed with status ${response.status}: ${errText}`);
                    lastError = `Model ${model} status ${response.status}: ${errText}`;

                    if (response.status === 429) {
                        // Wait 1s before trying next model
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    continue;
                }

                const data = await response.json();
                if (!data.candidates?.[0]?.content) {
                    console.error(`Model ${model} returned invalid structure`, data);
                    lastError = `Model ${model} returned invalid structure`;
                    continue;
                }

                const text = data.candidates[0].content.parts[0].text;
                console.log(`Raw AI response (${model}):`, text);

                // Clean up markdown code blocks if present
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

                // Attempt to find the JSON array if there's extra text
                const jsonStart = cleanText.indexOf('[');
                const jsonEnd = cleanText.lastIndexOf(']');

                let jsonString = cleanText;
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    jsonString = cleanText.substring(jsonStart, jsonEnd + 1);
                }

                try {
                    const suggestions = JSON.parse(jsonString);
                    if (Array.isArray(suggestions)) {
                        return NextResponse.json({ suggestions });
                    } else {
                        console.warn(`Model ${model} returned JSON but not an array`);
                        lastError = `Model ${model} returned JSON but not an array`;
                    }
                } catch (parseError) {
                    console.warn(`JSON parse failed for model ${model}:`, parseError);
                    lastError = `JSON parse failed for model ${model}: ${parseError}`;
                    continue; // Try next model
                }

            } catch (e: any) {
                console.warn(`Model ${model} failed`, e);
                lastError = `Model ${model} exception: ${e.message}`;
            }
        }

        // Fallback to mock data if AI fails
        console.warn("All AI models failed, returning mock data. Last error:", lastError);
        return NextResponse.json({
            suggestions: [
                { title: "Offline: Local Park Picnic", description: "Pack a basket and enjoy the outdoors. (AI unavailable)", day: "Saturday", cost: "Low" },
                { title: "Offline: Stargazing", description: "Find a dark spot and watch the stars. (AI unavailable)", day: "Sunday", cost: "Free" },
                { title: "Offline: Cook a New Recipe", description: "Try making something exotic together. (AI unavailable)", day: "Any", cost: "$$" }
            ],
            debugInfo: lastError
        });

    } catch (error: any) {
        console.error('Weekend Planner error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
