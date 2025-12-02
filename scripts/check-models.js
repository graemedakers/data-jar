const fs = require('fs');
const path = require('path');
const https = require('https');

function loadEnv() {
    const envFiles = ['.env.local', '.env'];
    for (const file of envFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            content.split('\n').forEach((line) => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, '');
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            });
        }
    }
}

loadEnv();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found.");
    process.exit(1);
}

console.log(`Checking models with key: ${apiKey.substring(0, 5)}...`);

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error);
            } else if (json.models) {
                console.log("Available Models:");
                json.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${m.name}`);
                    }
                });
            } else {
                console.log("Unexpected response:", json);
            }
        } catch (e) {
            console.error("Parse error:", e);
            console.log("Raw data:", data);
        }
    });
}).on('error', (e) => {
    console.error("Request error:", e);
});
