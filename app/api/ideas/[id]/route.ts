import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify ownership
        const idea = await prisma.idea.findUnique({
            where: { id },
        });

        if (!idea) {
            return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
        }

        if (idea.coupleId !== session.user.coupleId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.idea.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting idea:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const { description, indoor, duration, activityLevel, cost, timeOfDay } = body;

        // Verify ownership
        const idea = await prisma.idea.findUnique({
            where: { id },
        });

        if (!idea) {
            return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
        }

        if (idea.coupleId !== session.user.coupleId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updatedIdea = await prisma.idea.update({
            where: { id },
            data: {
                description,
                indoor,
                duration: parseFloat(duration),
                activityLevel,
                cost,
                timeOfDay,
            },
        });

        return NextResponse.json(updatedIdea);
    } catch (error) {
        console.error('Error updating idea:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
