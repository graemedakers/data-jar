import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium } from '@/lib/premium';

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

        if (!user || !isCouplePremium(user.couple)) {
            return NextResponse.json({ error: 'Premium required' }, { status: 403 });
        }

        const { drinks, vibe, location, price } = await request.json().catch(() => ({}));

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

        if (isDefaultLocation) {
            const locs = [coupleLocation, userHomeTown].filter(Boolean);
            // Use both locations for the context if available
            if (locs.length > 0) {
                targetLocation = locs.join(" and ");

                if (userHomeTown && coupleLocation && userHomeTown.trim().toLowerCase() !== coupleLocation.trim().toLowerCase()) {
                    extraInstructions += `IMPORTANT: You MUST include at least TWO recommendations located in ${coupleLocation} and at least TWO recommendations located in ${userHomeTown}.\n`;
                } else if (userHomeTown && (!coupleLocation || userHomeTown.trim().toLowerCase() === coupleLocation.trim().toLowerCase())) {
                    // If locations are the same or only home town exists, just treat it normally, no special split needed.
                }
            } else {
                targetLocation = "your local area";
            }
        } else {
            // If a specific location/activity was provided
            extraInstructions += `The user is asking about "${targetLocation}". 
            - If "${targetLocation}" is a specific place or city, find bars near THAT place.
            - CRITICAL: If the input contains a specific address or venue name, prioritize bars within walking distance (5-10 mins) of that location.\n`;
        }

        if (userInterests) {
            extraInstructions += `The user is interested in: ${userInterests}. Consider this when selecting the vibe or drinks if applicable.\n`;
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock response for dev/testing without API key
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                recommendations: [
                    {
                        name: "The Mockingbird Lounge",
                        description: "Lively atmosphere and amazing cocktails.",
                        speciality: "Cocktails",
                        price: "$$$",
                        address: "456 Oak Ave, " + (targetLocation.split(" and ")[0] || "City")
                    },
                    {
                        name: "Mock Pub",
                        description: "Classic pub with a great beer selection.",
                        speciality: "Beer",
                        price: "$",
                        address: "123 Main St, " + (targetLocation.split(" and ")[0] || "City")
                    },
                    {
                        name: "Vineyard Vibes",
                        description: "Cozy wine bar with a fireplace.",
                        speciality: "Wine",
                        price: "$$",
                        address: "789 Pine Ln, " + (userHomeTown || targetLocation.split(" and ")[0] || "City")
                    }
                ]
            });
        }

        const prompt = `
        Act as a local nightlife concierge for ${targetLocation}.
        Recommend 5 distinct bars or places to have a drink based on the following preferences:
        - Drinks Speciality: ${drinks || "Any good local drinks"}
        - Vibe/Atmosphere: ${vibe || "Any"}
        - Price Range: ${price || "Any"}
        
        ${extraInstructions}
        
        IMPORTANT: Perform a check to ensure the bar/venue is currently OPEN for business and has NOT permanently closed. Do NOT exclude any currently operating bar within the location bounds.
        
        For each venue, provide:
        - Name
        - A brief, enticing description (1 sentence)
        - Drinks Speciality (e.g. Wine, Cocktails, Craft Beer, Dive Bar)
        - Price range ($, $$, $$$)
        - Approximate address or neighborhood
        - A likely website URL (or a Google Search URL if specific site unknown)
        - Typical opening hours for evening (e.g. "5pm - 2am")
        - Approximate Google Rating (e.g. 4.5)
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Bar Name",
                    "description": "Great spot for drinks.",
                    "speciality": "Cocktails",
                    "price": "$$",
                    "address": "123 Main St, Neighborhood",
                    "website": "https://example.com",
                    "opening_hours": "5pm - 2am",
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
        console.error('Bar Concierge error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
