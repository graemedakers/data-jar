import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create a demo couple
    const couple = await prisma.couple.create({
        data: {
            referenceCode: 'DEMO123',
        }
    })

    // Create a user
    const user = await prisma.user.create({
        data: {
            email: 'demo@example.com',
            name: 'Demo User',
            passwordHash: 'hashed_secret', // In real app, hash this!
            coupleId: couple.id,
            mustChangePassword: false,
        }
    })

    // Create some ideas
    const ideas = [
        { description: 'Cook a new recipe together', indoor: true, duration: 0.5, activityLevel: 'MEDIUM', cost: '$' },
        { description: 'Go for a sunset hike', indoor: false, duration: 0.25, activityLevel: 'HIGH', cost: 'FREE' },
        { description: 'Movie marathon with popcorn', indoor: true, duration: 0.5, activityLevel: 'LOW', cost: '$' },
        { description: 'Visit a local museum', indoor: true, duration: 0.5, activityLevel: 'LOW', cost: '$$' },
        { description: 'Picnic in the park', indoor: false, duration: 0.25, activityLevel: 'LOW', cost: '$' },
    ]

    for (const idea of ideas) {
        await prisma.idea.create({
            data: {
                ...idea,
                coupleId: couple.id,
                createdById: user.id,
            }
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
