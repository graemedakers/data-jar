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
        if (!apiKey) {
            console.warn("No API key found, returning mock data");
            return NextResponse.json({
                suggestions: [
                    { title: "Mock: Local Farmers Market", description: "Visit the local market for fresh produce.", day: "Saturday", cost: "Free", url: "https://www.google.com/search?q=local+farmers+market" },
                    { title: "Mock: Movie Night", description: "Catch the latest blockbuster.", day: "Sunday", cost: "$$", url: "https://www.google.com/search?q=movie+tickets" },
                    { title: "Mock: Brunch at a New Spot", description: "Try that new cafe everyone is talking about.", day: "Sunday", cost: "$$", url: "https://www.google.com/search?q=best+brunch+near+me" },
                    { title: "Mock: Art Gallery Visit", description: "Soak in some culture at a local gallery.", day: "Saturday", cost: "Free", url: "https://www.google.com/search?q=art+galleries+near+me" },
                    { title: "Mock: Sunset Walk", description: "Take a romantic stroll during golden hour.", day: "Any", cost: "Free", url: "https://www.google.com/search?q=best+sunset+spots+near+me" }
                ]
            });
        }

        const prompt = `
        I need 5 distinct date ideas for a couple in ${location} for ${context} (${targetDateStr}).
        
        Focus on SPECIFIC REAL-WORLD EVENTS scheduled for this weekend if possible (e.g., concerts, festivals, markets, special exhibitions). If no specific events are found, suggest high-quality seasonal activities.
        
        Pay particular attention to events that are good for couples (romantic, fun, interactive).
        
        Provide the response as a JSON array of objects. Each object should have the following structure:
        {
            "title": "string", // A concise title for the date idea
            "description": "string", // A brief description of the date idea
            "day": "string", // e.g., "Saturday", "Sunday", "Any"
            "cost": "string", // e.g., "Free", "Low", "$", "$$", "$$$"
            "url": "string" // A URL to buy tickets or get more info (e.g., Ticketmaster, Eventbrite, or a Google Search URL if specific link unavailable)
        }
        
        Do not include markdown formatting. Just the raw JSON.
        `;

        const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
        let errors: string[] = [];

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
                    errors.push(`Model ${model} status ${response.status}: ${errText}`);

                    if (response.status === 429) {
                        // Wait 2s before trying next model
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    continue;
                }

                const data = await response.json();
                if (!data.candidates?.[0]?.content) {
                    console.error(`Model ${model} returned invalid structure`, data);
                    errors.push(`Model ${model} returned invalid structure`);
                    continue;
                }

                const text = data.candidates[0].content.parts[0].text;

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
                        errors.push(`Model ${model} returned JSON but not an array`);
                    }
                } catch (parseError) {
                    console.warn(`JSON parse failed for model ${model}:`, parseError);
                    errors.push(`JSON parse failed for model ${model}: ${parseError}`);
                    continue; // Try next model
                }

            } catch (e: any) {
                console.warn(`Model ${model} failed`, e);
                errors.push(`Model ${model} exception: ${e.message}`);
            }
        }

        // Fallback to mock data if AI fails
        console.warn("All AI models failed, returning mock data. Errors:", errors);

        return NextResponse.json({
            suggestions: [
                { title: "Offline: Local Park Picnic", description: "Pack a basket and enjoy the outdoors. (AI unavailable)", day: "Saturday", cost: "Low", url: "https://www.google.com/search?q=picnic+spots+near+me" },
                { title: "Offline: Stargazing", description: "Find a dark spot and watch the stars. (AI unavailable)", day: "Sunday", cost: "Free", url: "https://www.google.com/search?q=stargazing+near+me" },
                { title: "Offline: Cook a New Recipe", description: "Try making something exotic together. (AI unavailable)", day: "Any", cost: "$$", url: "https://www.google.com/search?q=romantic+dinner+recipes" },
                { title: "Offline: Board Game Night", description: "Dust off those old games and have a friendly competition. (AI unavailable)", day: "Any", cost: "Free", url: "https://www.google.com/search?q=best+board+games+for+couples" },
                { title: "Offline: DIY Spa Night", description: "Pamper yourselves with face masks and relaxation. (AI unavailable)", day: "Sunday", cost: "Low", url: "https://www.google.com/search?q=diy+spa+night+ideas" }
            ],
            debugInfo: errors.join(" | ")
        });

    } catch (error: any) {
        console.error('Weekend Planner error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
