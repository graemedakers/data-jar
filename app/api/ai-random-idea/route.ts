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

        const { category } = await request.json().catch(() => ({}));

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            console.warn("GEMINI_API_KEY is missing. Returning mock data.");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({
                description: category === 'MEAL' ? "Mock: Dinner at Luigi's" : "Mock: Picnic in the Park",
                details: category === 'MEAL' ? "Enjoy some authentic Italian pasta." : "Bring a checkered blanket and some sandwiches. It's a nice day!",
                indoor: category === 'MEAL',
                duration: "2.0",
                activityLevel: "LOW",
                cost: category === 'MEAL' ? "$$" : "FREE",
                timeOfDay: category === 'MEAL' ? "EVENING" : "DAY",
                category: category || "ACTIVITY"
            });
        }

        const coupleLocation = (user.couple as any)?.location;
        const userHomeTown = user.homeTown;

        // Determine which location to use (randomly mix or use both contextually)
        // For a single idea, we can't "mix" the result, but we can randomly pick one of the two locations to ensure variety over time.
        const locations = [coupleLocation, userHomeTown].filter(Boolean);
        const location = locations.length > 0 ? locations[Math.floor(Math.random() * locations.length)] : "Unknown";

        const userInterests = user.interests ? `User Interests: ${user.interests}` : "";

        let weatherInfo = "Unknown";

        if (location && location !== 'Unknown') {
            try {
                // 1. Geocode the location
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.results && geoData.results.length > 0) {
                        const { latitude, longitude } = geoData.results[0];

                        // 2. Get Weather
                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day`);
                        if (weatherRes.ok) {
                            const weatherData = await weatherRes.json();
                            const temp = weatherData.current.temperature_2m;
                            const code = weatherData.current.weather_code;
                            const isDay = weatherData.current.is_day === 1 ? "Day" : "Night";

                            // Simple WMO code map (optional, but helps context)
                            const wmoMap: Record<number, string> = {
                                0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
                                45: "Fog", 48: "Depositing rime fog",
                                51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
                                61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
                                71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
                                95: "Thunderstorm"
                            };
                            const condition = wmoMap[code] || `WMO Code ${code}`;
                            weatherInfo = `${condition}, ${temp}°C, ${isDay}`;
                        }
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch weather:", e);
            }
        }

        const prompt = `
        Generate a random, creative, and fun date idea for a couple.
        
        CONTEXT:
        - Location: ${location || "Unknown"}
        - Current Weather: ${weatherInfo}
        - ${userInterests}
        - Consider any major local events, festivals, or seasonal activities happening right now in ${location || "the area"} if known.
        ${category ? `- The user specifically wants a date idea in the category: "${category}" (e.g. if MEAL, suggest a specific type of cuisine or restaurant vibe; if ACTIVITY, suggest something active; if EVENT, suggest a show or festival).` : ''}
        
        CONSTRAINTS:
        - The idea MUST be suitable for the current weather conditions and location.
        - It can be an indoor activity (staying at home) or an outdoor activity (going out).
        - Do NOT involve cardboard in any way.
        - Do NOT involve cocktails or alcohol-focused activities.
        - Avoid activities that require significant prior preparation or planning (spontaneous ideas preferred).
        - If the user has listed interests, try to incorporate them if possible, but don't be limited by them.
        ${category ? `- The idea MUST fit the category: ${category}` : ''}
        
        Return the response as a valid JSON object with the following fields:
        - description: string (a short, catchy title for the date)
        - details: string (specific tips, what to wear, where to go, or instructions. Relate this to the weather/location if applicable.)
        - indoor: boolean (true for indoor, false for outdoor)
        - duration: string (one of: "0.25", "0.5", "1.0", "2.0", "4.0", "8.0")
        - activityLevel: string (one of: "LOW", "MEDIUM", "HIGH")
        - cost: string (one of: "FREE", "$", "$$", "$$$")
        - timeOfDay: string (one of: "ANY", "DAY", "EVENING")
        - category: string (must be one of: "ACTIVITY", "MEAL", "EVENT")

        Example:
        {
            "description": "Stargazing at the Observatory",
            "details": "Drive out to the local observatory. Bring a warm blanket and a thermos of hot cocoa as it's a chilly night.",
            "indoor": false,
            "duration": "2.0",
            "activityLevel": "LOW",
            "cost": "$",
            "timeOfDay": "EVENING",
            "category": "ACTIVITY"
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
