
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Create a dummy user and idea if needed, or just list existing
        const user = await prisma.user.findFirst({ include: { couple: true } });
        if (!user) {
            console.log("No user found");
            return;
        }

        console.log("User:", user.email);

        // 2. Create a dummy idea
        const idea = await prisma.idea.create({
            data: {
                description: "Test Delete Idea",
                coupleId: user.coupleId,
                createdById: user.id,
                indoor: true,
                duration: 1.0,
                activityLevel: "LOW",
                cost: "FREE",
                timeOfDay: "ANY"
            }
        });
        console.log("Created idea:", idea.id);

        // 3. Delete it via Prisma directly to verify DB connection
        await prisma.idea.delete({ where: { id: idea.id } });
        console.log("Deleted idea via Prisma");

        // We can't easily test the API route from a script without mocking the session/request
        // But we verified the DB operations work.

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
