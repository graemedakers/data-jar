import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium } from '@/lib/premium';
import { reliableGeminiCall } from '@/lib/gemini';


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
        // Use the location provided in the request, or fallback to couple's location if empty
        let targetLocation = location;
        if (!targetLocation || targetLocation.trim() === "") {
            targetLocation = coupleLocation || "your local area";
        }

        let extraInstructions = "";

        // Add specific instructions for the location
        extraInstructions += `The user is asking about "${targetLocation}". 
        - Find bars and drink spots located in or very near "${targetLocation}".
        - CRITICAL: If the input contains a specific address or venue name, prioritize bars within walking distance (5-10 mins) of that location.\n`;


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
                        address: "456 Oak Ave, " + (targetLocation || "City")
                    },
                    {
                        name: "Mock Pub",
                        description: "Classic pub with a great beer selection.",
                        speciality: "Beer",
                        price: "$",
                        address: "123 Main St, " + (targetLocation || "City")
                    },
                    {
                        name: "Vineyard Vibes",
                        description: "Cozy wine bar with a fireplace.",
                        speciality: "Wine",
                        price: "$$",
                        address: "789 Pine Ln, " + (targetLocation || "City")
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

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Bar Concierge error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
