const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        // Delete in order to avoid foreign key constraints
        console.log('Deleting Ideas...')
        await prisma.idea.deleteMany({})

        console.log('Deleting Users...')
        await prisma.user.deleteMany({})

        console.log('Deleting Couples...')
        await prisma.couple.deleteMany({})

        console.log('Database cleared successfully!')
    } catch (error) {
        console.error('Error clearing database:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
