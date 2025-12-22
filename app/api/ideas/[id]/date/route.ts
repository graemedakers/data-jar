import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { awardXp } from '@/lib/gamification';
import { checkAndUnlockAchievements } from '@/lib/achievements';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Updated to match Next.js 15+ async params
) {
    try {
        const session = await getSession();
        if (!session?.user?.id || (!session.user.activeJarId && !session.user.coupleId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const currentJarId = session.user.activeJarId || session.user.coupleId;

        const resolvedParams = await params;
        const id = resolvedParams.id;
        const { date } = await request.json();

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        // Verify ownership (or couple membership)
        const idea = await prisma.idea.findUnique({
            where: { id },
            select: { jarId: true }
        });

        if (!idea) {
            return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
        }

        if (idea.jarId !== currentJarId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updatedIdea = await prisma.idea.update({
            where: { id },
            data: {
                selectedDate: dateObj
            }
        });

        // Gamification: Award 20 XP for committing to a date!
        await awardXp(currentJarId, 20);
        await checkAndUnlockAchievements(currentJarId);

        return NextResponse.json(updatedIdea);

    } catch (error: any) {
        console.error("Error updating idea date:", error);
        return NextResponse.json({ error: "Failed to update date" }, { status: 500 });
    }
}
