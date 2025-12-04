import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { description, indoor, duration, activityLevel, cost, timeOfDay, details, category } = body;

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const idea = await prisma.idea.create({
            data: {
                description,
                details: details || null, // Ensure it's null if undefined/empty string
                indoor: Boolean(indoor), // Ensure boolean
                duration: typeof duration === 'string' ? parseFloat(duration) : duration,
                activityLevel,
                cost,
                timeOfDay: timeOfDay || 'ANY',
                category: category || 'ACTIVITY',
                coupleId: session.user.coupleId,
                createdById: session.user.id,
            },
        });

        return NextResponse.json(idea);
    } catch (error) {
        console.error('Error creating idea:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all ideas for the couple


        // Filter out partner's unselected ideas just to be safe/explicit, 
        // though the OR clause above handles it:
        // - If it's my idea, it's included (selected or not).
        // - If it's partner's idea, it's ONLY included if selectedAt is NOT null.
        // So partner's unselected ideas are excluded.

        // Wait, actually we WANT to include partner's unselected ideas so we can count them,
        // but we want to hide their details (description).

        // Let's re-fetch to get ALL unselected ideas for the couple, but we'll mask the ones not created by me.
        const allIdeas = await prisma.idea.findMany({
            where: {
                coupleId: session.user.coupleId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                createdBy: {
                    select: { name: true, id: true },
                },
            },
        });

        const maskedIdeas = allIdeas.map(idea => {
            // If it's my idea OR it has been selected, show everything
            if (idea.createdById === session.user.id || idea.selectedAt) {
                return idea;
            }

            // Otherwise (it's partner's unselected idea), hide the description
            return {
                ...idea,
                description: "??? (Surprise)",
                isMasked: true,
                indoor: idea.indoor, // Keep these visible for filtering context
            };
        });

        return NextResponse.json(maskedIdeas);
    } catch (error) {
        console.error('Error fetching ideas:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
