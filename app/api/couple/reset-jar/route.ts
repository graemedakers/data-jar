import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch current user and their couple info to verify creator status
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { couple: { include: { users: { orderBy: { createdAt: 'asc' } } } } }
        });

        if (!currentUser || !currentUser.couple) {
            return NextResponse.json({ error: 'User or couple not found' }, { status: 404 });
        }

        // Check if current user is the creator (first user in the couple)
        const creator = currentUser.couple.users[0];
        if (creator.id !== currentUser.id) {
            return NextResponse.json({ error: 'Only the jar creator can empty the jar.' }, { status: 403 });
        }

        // Delete ALL ideas for this couple (including past dates)
        const result = await prisma.idea.deleteMany({
            where: {
                coupleId: currentUser.coupleId
            }
        });

        return NextResponse.json({
            success: true,
            message: `Cleared ${result.count} ideas from the jar.`,
            count: result.count
        });
    } catch (error: any) {
        console.error('Error resetting jar:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
