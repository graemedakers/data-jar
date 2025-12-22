const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock the fetch function globally since we are running in node
// global.fetch = require('node-fetch'); // Not needed in Node 18+

async function main() {
    try {
        console.log("Testing Dining Concierge API...");

        // We need to simulate the API call. 
        // Since we can't easily spin up the Next.js server from here, 
        // we will try to replicate the logic of the route handler using the actual Gemini API if key is present,
        // or just verify the mock logic.

        const apiKey = process.env.GEMINI_API_KEY;
        console.log("API Key present:", !!apiKey);

        if (!apiKey) {
            console.log("Using mock logic...");
            const mockResponse = {
                recommendations: [
                    {
                        name: "Mock Bistro",
                        description: "A cozy spot with great pasta.",
                        cuisine: "Italian",
                        price: "$$",
                        address: "123 Main St, Unknown City"
                    }
                ]
            };
            console.log("Mock Response:", JSON.stringify(mockResponse, null, 2));
            return;
        }

        console.log("Calling Gemini API...");
        const prompt = `
        Act as a local dining concierge for Unknown City.
        Recommend 3 distinct restaurants based on the following preferences:
        - Cuisine: Italian
        - Vibe/Atmosphere: Romantic
        
        For each restaurant, provide:
        - Name
        - A brief, appetizing description (1 sentence)
        - Cuisine type
        - Price range ($, $$, $$$)
        - Approximate address or neighborhood
        
        Return the result as a JSON object with a "recommendations" array.
        Example format:
        {
            "recommendations": [
                {
                    "name": "Restaurant Name",
                    "description": "Delicious food in a great setting.",
                    "cuisine": "Italian",
                    "price": "$$",
                    "address": "123 Main St, Neighborhood"
                }
            ]
        }
        Do not include markdown formatting. Just raw JSON.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            console.error(`Gemini API error: ${response.status} - ${await response.text()}`);
            return;
        }

        const data = await response.json();
        console.log("Raw AI Response:", JSON.stringify(data, null, 2));

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log("Parsed Text:", text);
            try {
                const result = JSON.parse(text);
                console.log("Final JSON:", JSON.stringify(result, null, 2));
            } catch (e) {
                console.error("Failed to parse JSON:", e);
            }
        } else {
            console.error("Unexpected AI response structure");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

main();
