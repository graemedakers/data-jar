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

        const { date, location, cost, regenerateSlot, currentSchedule, rejectedVenue } = await request.json().catch(() => ({}));

        const coupleLocation = (user.couple as any)?.location;
        const userHomeTown = user.homeTown;
        const targetLocation = location || coupleLocation || userHomeTown || "your city";

        // Fetch partner preferences
        const partner = await prisma.user.findFirst({
            where: {
                coupleId: user.coupleId,
                NOT: { id: user.id }
            }
        });

        const partnerInterests = partner?.interests || "";
        const userInterests = user.interests || "";

        let prompt = "";
        const isRegen = typeof regenerateSlot === 'number';

        if (isRegen && currentSchedule) {
            // Regeneration Prompt
            const otherItems = currentSchedule.filter((_: any, i: number) => i !== regenerateSlot);
            const slotType = currentSchedule[regenerateSlot].activity_type;
            const slotTime = currentSchedule[regenerateSlot].time;

            prompt = `
            The user wants to REPLACE a specific part of their date night in ${targetLocation}.
            
            Current Plan Context (KEEP these, do not change them, just match their vibe/location):
            ${otherItems.map((item: any) => `- ${item.time}: ${item.venue_name} (${item.activity_type}) at ${item.address}`).join('\n')}
            
            The user REJECTED this venue for the ${slotTime} slot: "${rejectedVenue}".
            
            Task: Suggest a BETTER alternative for the "${slotType}" slot at ${slotTime}.
            
            CRITICAL CONSTRAINTS:
            1. LOCATION: Must be within 5-10 mins walk of the other venues in the plan.
            2. STATUS: Must be currently OPEN for business. Verified.
            3. BUDGET: ${cost || "Medium"}.
            4. VIBE: ${partnerInterests ? `Appeal to: ${partnerInterests}` : "Romantic and fun"}.
            
            Output strictly as a single JSON object for this one slot:
            {
                "time": "${slotTime}",
                "activity_type": "${slotType}",
                "venue_name": "New Venue Name",
                "description": "Why this is a great alternative.",
                "address": "Street address",
                "booking_link": "URL",
                "cost_estimate": "Low/Medium/High"
            }
            `;
        } else {
            // Standard Full Plan Prompt
            prompt = `
            Plan a complete "Date Night" itinerary for a couple in ${targetLocation} on ${date || "an upcoming evening"}.
            Budget: ${cost || "Medium"}.
            
            Date Night Focus: PLEASE PRIORITIZE THE PARTNER'S PREFERENCES below, making it a treat for them, while ensuring the user also enjoys it.
            Partner Preferences (Primary): ${partnerInterests || "Surprise them with something romantic/fun."}
            User Preferences (Secondary): ${userInterests}
            
            CRITICAL INSTRUCTIONS:
            1. LOCALITY: All three venues MUST be within EASY WALKING DISTANCE of each other (max 5-10 minute walk between them). Focus on the town/city center or a dense entertainment district. Do NOT suggest venues that require driving.
            2. FLOW: The evening must follow this schedule:
               - Part 1: Pre-dinner drinks at a nice bar or lounge.
               - Part 2: Dinner at a compatible restaurant.
               - Part 3: An evening event or activity (show, comedy, live music, interactive activity, etc.).
            3. REALITY CHECK: Verify these places exist and are CURRENTLY OPEN for business. Do NOT suggest venues that are "Permanently Closed" or "Temporarily Closed". 
               - SPECIAL CAUTION: Recent years have seen many closures. BE SKEPTICAL.
               - User Report: Venues like "The Butterfly Club" in Melbourne have been reported closed. Do not suggest them.
               - If a venue has ambiguous status, SKIP IT. Pick a safe, established alternative (e.g., major hotel bars, famous landmarks).
            4. TIMING: Provide an approximate schedule (e.g., 6:00 PM, 7:30 PM, 9:30 PM).
    
            Output strictly as a JSON object with this structure:
            {
                "neighborhood": "Name of the locality/area",
                "schedule": [
                    {
                        "time": "String (e.g. 6:00 PM)",
                        "activity_type": "Drinks", // or Dinner or Event
                        "venue_name": "Name",
                        "description": "Short description of the vibe and why it fits.",
                        "address": "Street address",
                        "booking_link": "URL for booking or info",
                        "cost_estimate": "Low/Medium/High"
                    }
                    // ... exactly 3 items for the 3 parts
                ]
            }
            
            Do not include markdown. Just JSON.
            `;
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            // Mock data
            return NextResponse.json({
                neighborhood: "Downtown Mocksville",
                schedule: [
                    {
                        time: "6:00 PM",
                        activity_type: "Drinks",
                        venue_name: "The Mocktail Lounge",
                        description: "Intimate setting with craft cocktails.",
                        address: "123 Main St",
                        booking_link: "https://google.com",
                        cost_estimate: "$$"
                    },
                    {
                        time: "7:30 PM",
                        activity_type: "Dinner",
                        venue_name: "Bistro Fictional",
                        description: "Romantic candlelight dinner.",
                        address: "125 Main St",
                        booking_link: "https://google.com",
                        cost_estimate: "$$$"
                    },
                    {
                        time: "9:30 PM",
                        activity_type: "Event",
                        venue_name: "The Laughing Comedy Club",
                        description: "Stand-up comedy show.",
                        address: "130 Main St",
                        booking_link: "https://google.com",
                        cost_estimate: "$$"
                    }
                ]
            });
        }

        const models = ["gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-2.0-flash"];
        let lastError = null;

        for (const model of models) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                });

                if (!response.ok) {
                    const txt = await response.text();
                    throw new Error(`Model ${model} status ${response.status}: ${txt}`);
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error("No content returned");

                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const json = JSON.parse(cleanText);
                return NextResponse.json(json);

            } catch (e: any) {
                console.warn(`Model ${model} failed`, e);
                lastError = e.message;
            }
        }

        console.error("All AI models failed. Falling back to dynamic mock data. Last error:", lastError);

        // Fallback Mock Data with Dynamic Location
        return NextResponse.json({
            neighborhood: `${targetLocation} (AI Offline Mode)`,
            schedule: [
                {
                    time: "6:00 PM",
                    activity_type: "Drinks",
                    venue_name: `Local Lounge in ${targetLocation.split(',')[0]}`,
                    description: "A cozy spot to start the evening with signature cocktails. (Note: AI service is currently unavailable, this is a placeholder suggestion)",
                    address: `${targetLocation}`,
                    booking_link: `https://www.google.com/search?q=best+bars+in+${encodeURIComponent(targetLocation)}`,
                    cost_estimate: "$$"
                },
                {
                    time: "7:30 PM",
                    activity_type: "Dinner",
                    venue_name: `Top Rated Restaurant`,
                    description: "Enjoy a romantic dinner at one of the city's finest establishments.",
                    address: `${targetLocation}`,
                    booking_link: `https://www.google.com/search?q=romantic+dinner+in+${encodeURIComponent(targetLocation)}`,
                    cost_estimate: "$$$"
                },
                {
                    time: "9:30 PM",
                    activity_type: "Event",
                    venue_name: "Evening Entertainment",
                    description: "Live music, comedy, or a late-night show to wrap up the night.",
                    address: `${targetLocation}`,
                    booking_link: `https://www.google.com/search?q=events+tonight+in+${encodeURIComponent(targetLocation)}`,
                    cost_estimate: "$$"
                }
            ],
            debug_info: lastError
        });



    } catch (error: any) {
        console.error("Date Planner Error:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}
