import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.coupleId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Delete ALL ideas for this couple (including past dates)
        const result = await prisma.idea.deleteMany({
            where: {
                coupleId: session.user.coupleId
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
