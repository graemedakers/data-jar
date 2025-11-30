import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session?.user?.coupleId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { location } = await request.json();

        await prisma.couple.update({
            where: { id: session.user.coupleId },
            data: { location },
        });

        return NextResponse.json({ success: true, location });
    } catch (error: any) {
        console.error('Error updating location:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
