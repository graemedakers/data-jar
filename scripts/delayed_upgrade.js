const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upgrade() {
    console.log("Waiting 40 seconds before upgrading users...");
    await new Promise(resolve => setTimeout(resolve, 40000));
    console.log("Upgrading all couples to premium...");
    try {
        await prisma.couple.updateMany({
            data: { isPremium: true }
        });
        console.log("Upgrade complete.");
    } catch (e) {
        console.error("Upgrade failed:", e);
    }
}

upgrade();
