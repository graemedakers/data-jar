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

    const listModels = () => {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'generativelanguage.googleapis.com',
                path: `/v1beta/models?key=${apiKey}`,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            };

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const data = JSON.parse(body);
                            console.log("✅ AVAILABLE MODELS:");
                            data.models.forEach(m => {
                                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                                    console.log(` - ${m.name}`);
                                }
                            });
                        } catch (e) { console.error("Parse error", e); }
                    } else {
                        console.log(`❌ List Models FAILED: ${res.statusCode} - ${body}`);
                    }
                    resolve();
                });
            });
            req.end();
        });
    };

    listModels();

} catch (error) {
    console.error("Error reading .env file:", error.message);
}
