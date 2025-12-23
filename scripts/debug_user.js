
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const userId = 'edf84cfe-f4e4-43b2-b1b2-38dd41405131';
    console.log(`Checking user: ${userId}`);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            memberships: {
                include: {
                    jar: true
                }
            },
            couple: true
        }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User found:', user.email);
    console.log('Active Jar ID:', user.activeJarId);
    console.log('Couple ID (Legacy):', user.coupleId);
    console.log('Memberships count:', user.memberships.length);

    user.memberships.forEach((m, i) => {
        console.log(`\nMembership ${i + 1}:`);
        console.log(`  Jar ID: ${m.jarId}`);
        console.log(`  Role: ${m.role}`);
        console.log(`  Jar Name: ${m.jar?.name}`);
        console.log(`  Jar Deleted: ${m.jar?.deleted}`);
        console.log(`  Jar DeletedAt: ${m.jar?.deletedAt}`);
    });
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
