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
    console.log(`Found API Key: ${apiKey.substring(0, 5)}...`);

    const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

    const testModel = (model) => {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                contents: [{
                    parts: [{ text: "Say hello" }]
                }]
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
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`✅ Model ${model} SUCCESS`);
                        resolve(true);
                    } else {
                        console.log(`❌ Model ${model} FAILED: ${res.statusCode}`);
                        console.log(`   Response: ${body}`);
                        resolve(false);
                    }
                });
            });

            req.on('error', (error) => {
                console.error(`❌ Model ${model} ERROR:`, error);
                resolve(false);
            });

            req.write(data);
            req.end();
        });
    };

    async function runTests() {
        for (const model of models) {
            await testModel(model);
        }
    }

    runTests();

} catch (error) {
    console.error("Error reading .env file:", error.message);
}
