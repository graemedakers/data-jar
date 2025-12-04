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

        const { cuisine, vibe, location } = await request.json().catch(() => ({}));

        const coupleLocation = (user.couple as any)?.location;
        const userHomeTown = (user as any).homeTown;
        const userInterests = (user as any).interests;

        // If user manually provided a location in the request, use that.
        // Otherwise, use couple location.
        let targetLocation = location;
        let extraInstructions = "";

        // Check if the requested location is effectively the default couple location (or empty)
        // We normalize strings to be safe (trim, lowercase)
        const isDefaultLocation = !location || (coupleLocation && location.trim().toLowerCase() === coupleLocation.trim().toLowerCase());

        let contextLocation = "";
        if (coupleLocation || userHomeTown) {
            contextLocation = [coupleLocation, userHomeTown].filter(Boolean).join(" or ");
        }

        if (isDefaultLocation) {
            const locs = [coupleLocation, userHomeTown].filter(Boolean);
            // Use both locations for the context if available
            if (locs.length > 0) {
                targetLocation = locs.join(" and ");

                if (userHomeTown && userHomeTown !== coupleLocation) {
                    extraInstructions += `IMPORTANT: You MUST include at least one recommendation located in or very near to ${userHomeTown}.\n`;
                }
            } else {
                targetLocation = "your local area";
            }
        } else {
            // If a specific location/activity was provided (e.g. "Hiking" or "The Alamo"), 
            // provide the user's base location as context so the AI can resolve generic activities.
            extraInstructions += `The user is asking about "${targetLocation}". 
            Context: The user is based in ${contextLocation}. 
            - If "${targetLocation}" is a specific place or city (e.g. "The Alamo", "Paris"), find restaurants near THAT place.
            - If "${targetLocation}" is a generic activity (e.g. "Hiking", "Picnic"), find restaurants near suitable spots for that activity in or near ${contextLocation}.\n`;
        }

        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}. Consider this when selecting the vibe or cuisine if applicable.\n`;
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock response for dev/testing without API key
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                recommendations: [
                    {
                        name: "Mock Bistro",
                        description: "A cozy spot with great pasta.",
                        cuisine: cuisine || "Italian",
                        price: "$$",
                        address: "123 Main St, " + (targetLocation.split(" and ")[0] || "City")
                    },
                    {
                        name: "The Mockingbird",
                        description: "Lively atmosphere and amazing cocktails.",
                        cuisine: "Modern American",
                        price: "$$$",
                        address: "456 Oak Ave, " + (targetLocation.split(" and ")[0] || "City")
                    },
                    {
                        name: "Home Town Taco",
                        description: "Best street tacos in town.",
                        cuisine: "Mexican",
                        price: "$",
                        address: "789 Pine Ln, " + (userHomeTown || targetLocation.split(" and ")[0] || "City")
                    }
                ]
            });
        }

        const prompt = `
        Act as a local dining concierge for ${targetLocation}.
        Recommend 3 distinct restaurants based on the following preferences:
        - Cuisine: ${cuisine || "Any good local food"}
        - Vibe/Atmosphere: ${vibe || "Any"}
        
        ${extraInstructions}
        
        For each restaurant, provide:
        - Name
        - A brief, appetizing description (1 sentence)
        - Cuisine type
        - Price range ($, $$, $$$)
        - Approximate address or neighborhood
        - A likely website URL (or a Google Search URL if specific site unknown)
        - Typical opening hours for dinner (e.g. "5pm - 10pm")
        - Approximate Google Rating (e.g. 4.5)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Restaurant Name",
                    "description": "Delicious food in a great setting.",
                    "cuisine": "Italian",
                    "price": "$$",
                    "address": "123 Main St, Neighborhood",
                    "website": "https://example.com",
                    "opening_hours": "5pm - 10pm",
                    "google_rating": 4.5
                }
            ]
        }
        Do not include markdown formatting. Just raw JSON.
        `;

        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-2.0-flash"];
        let lastError = null;

        for (const model of models) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn(`Model ${model} failed: ${response.status} - ${errorText}`);
                    lastError = `Model ${model} failed: ${response.status}`;
                    continue;
                }

                const data = await response.json();
                if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                    throw new Error("Invalid API response format");
                }

                const text = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
                const result = JSON.parse(text);

                return NextResponse.json(result);

            } catch (e) {
                console.warn(`Error with model ${model}:`, e);
                lastError = e;
            }
        }

        throw new Error(`All models failed. Last error: ${lastError}`);

    } catch (error: any) {
        console.error('Dining Concierge error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
