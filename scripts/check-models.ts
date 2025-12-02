const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envFiles = ['.env.local', '.env'];
    for (const file of envFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            content.split('\n').forEach((line: string) => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
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

async function listModels() {
    if (!apiKey) {
        console.error("No API key found in .env or .env.local files.");
        return;
    }

    console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`Failed to fetch models. Status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response:", text);
            return;
        }

        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods?.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.error("Failed to list models:", data);
        }
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
