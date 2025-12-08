
const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.join(__dirname, '..', '.env');

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);

    if (!match) {
        console.error("GEMINI_API_KEY not found in .env file");
        process.exit(1);
    }

    const apiKey = match[1].trim();
    console.log(`Using API Key ending in ...${apiKey.slice(-5)}`);

    // Brute force check of ALL available models for this user
    const models = [
        "gemini-2.0-flash-lite-001",
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash-lite-preview-02-05",
        "gemini-2.0-flash-lite-preview",
        "gemini-flash-lite-latest",
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash-lite-preview-09-2025",
        "gemini-2.0-flash-001",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-2.5-flash",
        "gemini-2.5-flash-preview-09-2025"
    ];

    const testModelWithSearch = (model) => {
        return new Promise((resolve) => {
            console.log(`\nTesting ${model} with google_search...`);

            const data = JSON.stringify({
                contents: [{
                    parts: [{ text: "Find a real event happening in Sydney tonight." }]
                }],
                tools: [{ google_search: {} }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            });

            const options = {
                hostname: 'generativelanguage.googleapis.com',
                path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            };

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    console.log(`Status: ${res.statusCode}`);
                    try {
                        const json = JSON.parse(body);
                        if (res.statusCode === 200) {
                            console.log("✅ SUCCESS");
                            if (json.candidates && json.candidates[0].content) {
                                console.log("Content received.");
                            } else {
                                console.log("Response structure odd:", JSON.stringify(json).substring(0, 200));
                            }
                        } else {
                            console.log("❌ FAILED");
                            console.log("Error:", JSON.stringify(json, null, 2));
                        }
                    } catch (e) {
                        console.log("Raw Body:", body);
                    }
                    resolve();
                });
            });

            req.on('error', (e) => {
                console.error("Request Error:", e);
                resolve();
            });

            req.write(data);
            req.end();
        });
    };

    async function run() {
        for (const m of models) {
            await testModelWithSearch(m);
        }
    }

    run();

} catch (error) {
    console.error("Error:", error.message);
}
