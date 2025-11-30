import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session?.user?.coupleId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { rating, notes } = await request.json();

    try {
        // Verify ownership
        const idea = await prisma.idea.findUnique({
            where: { id },
        });

        if (!idea || idea.coupleId !== session.user.coupleId) {
            return NextResponse.json({ error: 'Idea not found or unauthorized' }, { status: 404 });
        }

        const updatedIdea = await prisma.idea.update({
            where: { id },
            data: {
                rating,
                notes
            }
        });

        return NextResponse.json(updatedIdea);
    } catch (error: any) {
        console.error('Error updating rating:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
