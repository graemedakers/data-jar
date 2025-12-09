import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { description, indoor, duration, activityLevel, cost, timeOfDay, details, category, selectedAt, notes, address, website, googleRating, openingHours } = body;

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const createData: Prisma.IdeaUncheckedCreateInput = {
            description,
            details: details || null,
            indoor: Boolean(indoor),
            duration: typeof duration === 'string' ? parseFloat(duration) : Number(duration),
            activityLevel,
            cost,
            timeOfDay: timeOfDay || 'ANY',
            category: category || 'ACTIVITY',
            selectedAt: selectedAt ? new Date(selectedAt) : null,
            coupleId: session.user.coupleId,
            createdById: session.user.id,
            notes: notes || null,
            address: address || null,
            website: website || null,
            googleRating: googleRating ? parseFloat(String(googleRating)) : null,
            openingHours: openingHours || null,
        };

        const idea = await prisma.idea.create({
            data: createData,
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
        // Use raw query to ensure we get 'isSurprise' even if Prisma Client is stale
        const allIdeas: any[] = await prisma.$queryRaw`
            SELECT i.*, 
                   json_build_object('id', u.id, 'name', u.name) as "createdBy"
            FROM "Idea" i
            LEFT JOIN "User" u ON i."createdById" = u.id
            WHERE i."coupleId" = ${session.user.coupleId}
            ORDER BY i."createdAt" DESC
        `;

        const maskedIdeas = allIdeas.map(idea => {
            const isMyIdea = idea.createdById === session.user.id;
            const isSelected = !!idea.selectedAt;
            const isSurprise = (idea as any).isSurprise; // Typecast because generic Prisma client might not be fully regened in IDE context

            // If it has been selected, show everything.
            if (isSelected) {
                return idea;
            }

            // If it is a "Surprise Idea" created via the specific feature, hide from everyone until selected.
            if (isSurprise) {
                return {
                    ...idea,
                    description: "Surprise Idea",
                    details: "This idea will be revealed when you spin the jar!",
                    isMasked: true,
                    // Keep metadata visible? User said "hide it", but usually filters need metadata.
                    // The jar view uses these to show icons. Keep them.
                };
            }

            // If it's my idea (and not a special surprise), show it.
            if (isMyIdea) {
                return idea;
            }

            // Otherwise (it's partner's unselected normal idea), hide the description
            return {
                ...idea,
                description: "??? (Partner's Idea)",
                isMasked: true,
            };
        });

        return NextResponse.json(maskedIdeas);
    } catch (error) {
        console.error('Error fetching ideas:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
