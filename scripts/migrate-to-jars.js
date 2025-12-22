const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting migration to Jars...');

    // 1. Fetch all users who have a coupleId (Jar connection)
    // We explicitly select coupleId because we made it optional/legacy
    const users = await prisma.user.findMany({
        where: {
            coupleId: {
                not: null,
            },
        },
    });

    console.log(`Found ${users.length} users to migrate.`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
        if (!user.coupleId) continue;

        try {
            // 2. Check if they are already a member (idempotency)
            const existingMember = await prisma.jarMember.findUnique({
                where: {
                    userId_jarId: {
                        userId: user.id,
                        jarId: user.coupleId,
                    },
                },
            });

            if (!existingMember) {
                // 3. Create the Membership
                // We make everyone an ADMIN for now so they don't lose access/privileges
                await prisma.jarMember.create({
                    data: {
                        userId: user.id,
                        jarId: user.coupleId, // The old coupleId is now the jarId
                        role: 'ADMIN',
                    },
                });

                // 4. Update activeJarId
                await prisma.user.update({
                    where: { id: user.id },
                    data: { activeJarId: user.coupleId }
                });

                process.stdout.write('.');
                successCount++;
            } else {
                process.stdout.write('-'); // Already migrated
            }
        } catch (error) {
            console.error(`\n❌ Failed to migrate user ${user.id}:`, error);
            errorCount++;
        }
    }

    console.log('\n\n✅ Migration Complete!');
    console.log(`Success: ${successCount}`);
    console.log(`Skipped/Existing: ${users.length - successCount - errorCount}`);
    console.log(`Errors: ${errorCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
