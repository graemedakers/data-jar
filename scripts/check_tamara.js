const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const email = 'tamara.hatzi@outlook.com';
    console.log(`Checking user: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            couple: true,
            memberships: {
                include: {
                    jar: true
                }
            }
        }
    });

    if (!user) {
        console.log("User not found.");
        return;
    }

    console.log("--- User Info ---");
    console.log(`ID: ${user.id}`);
    console.log(`isLifetimePro: ${user.isLifetimePro}`);
    console.log(`subscriptionStatus: ${user.subscriptionStatus}`);
    console.log(`Stripe Sub ID: ${user.stripeSubscriptionId}`);
    console.log(`Couple ID (Legacy): ${user.coupleId}`);

    console.log("\n--- Premium Check (User Level) ---");
    const activeStatuses = ['active', 'trialing', 'past_due'];
    const isUserPro = user.isLifetimePro || (user.subscriptionStatus && activeStatuses.includes(user.subscriptionStatus));
    console.log(`Final isUserPro: ${isUserPro}`);

    console.log("\n--- Associated Jars ---");
    let jars = [];
    if (user.couple) jars.push(user.couple);
    user.memberships.forEach(m => jars.push(m.jar));

    jars.forEach(jar => {
        console.log(`Jar ID: ${jar.id}`);
        console.log(`  Name: ${jar.name}`);
        console.log(`  isPremium: ${jar.isPremium}`);
        console.log(`  isLegacyPremium: ${jar.isLegacyPremium}`);
        console.log(`  subscriptionStatus: ${jar.subscriptionStatus}`);

        const isJarPremium = jar.isPremium || jar.isLegacyPremium; // Simple check
        console.log(`  -> Jar effective premium: ${isJarPremium}`);
    });
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
