const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const token = 'test_token_' + Date.now();
        const email = 'test_' + Date.now() + '@example.com';
        console.log('Creating user with email:', email);

        // Use a subset of fields to avoid missing column errors if possible
        const newUser = await prisma.user.create({
            data: {
                email,
                name: 'Test User',
                passwordHash: 'hash',
                verificationToken: token,
                emailVerified: null
            },
            select: {
                id: true,
                verificationToken: true
            }
        });

        console.log('User created. Verification token in DB:', newUser.verificationToken);

        const foundUser = await prisma.user.findFirst({
            where: { verificationToken: token },
            select: { id: true, email: true, verificationToken: true }
        });

        console.log('Search result:', JSON.stringify(foundUser));
        console.log('Token matches:', foundUser?.verificationToken === token);

        // Cleanup
        await prisma.user.delete({ where: { id: newUser.id } });
        console.log('Test user deleted.');

    } catch (e) {
        console.error('Error:', e.message);
        if (e.message.includes('User.activeJarId')) {
            console.log('CONFIRMED: Database is missing activeJarId column!');
        }
    } finally {
        await prisma.$disconnect();
    }
}

test();
