import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { sendDateNotificationEmail } from '@/lib/mailer';
import { awardXp } from '@/lib/gamification';
import { checkAndUnlockAchievements } from '@/lib/achievements';

const COST_VALUES: Record<string, number> = { 'FREE': 0, '$': 1, '$$': 2, '$$$': 3 };
const ACTIVITY_VALUES: Record<string, number> = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2 };

export async function POST(request: Request) {
    try {
        const session = await getSession();
        const { maxDuration, maxCost, maxActivityLevel, timeOfDay, category } = await request.json().catch(() => ({}));

        let ideas = [];
        let coupleId = null;
        let userEmail = null;
        let userName = null;

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Authenticated User - Fetch fresh state from DB
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        coupleId = user.activeJarId || user.coupleId; // Using variable coupleId as generic "JarId"
        const currentJarId = coupleId;

        if (!currentJarId) {
            return NextResponse.json({ error: 'No active jar' }, { status: 400 });
        }

        userEmail = session.user.email;
        userName = session.user.name;

        // Fetch all unselected ideas for this couple (jar)
        const allIdeas = await prisma.idea.findMany({
            where: {
                jarId: currentJarId,
                selectedAt: null,
            },
        });

        // Filter in memory (easier for string enums)
        ideas = allIdeas.filter(idea => {
            // Category filter (if specified and not ANY)
            if (category !== undefined && category !== 'ANY') {
                if (idea.category !== category) return false;
            }

            // EXCLUDE PLANNED DATES from random spins
            if (idea.category === 'PLANNED_DATE') return false;

            // Duration filter (if specified)
            if (maxDuration !== undefined && idea.duration > maxDuration) return false;

            // Cost filter (if specified)
            if (maxCost !== undefined) {
                const ideaCostVal = COST_VALUES[idea.cost] ?? 0;
                const maxCostVal = COST_VALUES[maxCost] ?? 3;
                if (ideaCostVal > maxCostVal) return false;
            }

            // Activity filter (if specified)
            if (maxActivityLevel !== undefined) {
                const ideaActivityVal = ACTIVITY_VALUES[idea.activityLevel] ?? 0;
                const maxActivityVal = ACTIVITY_VALUES[maxActivityLevel] ?? 2;
                if (ideaActivityVal > maxActivityVal) return false;
            }

            // Time of Day filter (if specified and not ANY)
            if (timeOfDay !== undefined && timeOfDay !== 'ANY') {
                // If idea is ANY, it matches everything.
                // If idea is specific (e.g. DAY), it must match the filter.
                if (idea.timeOfDay !== 'ANY' && idea.timeOfDay !== timeOfDay) return false;
            }

            return true;
        });

        if (ideas.length === 0) {
            return NextResponse.json({ error: 'No matching ideas found' }, { status: 404 });
        }

        // Pick a random idea
        const randomIndex = Math.floor(Math.random() * ideas.length);
        const selectedIdea = ideas[randomIndex];

        // Mark as selected (ONLY for authenticated users)
        if (session && currentJarId) {
            await prisma.idea.update({
                where: { id: selectedIdea.id },
                data: {
                    selectedAt: new Date(),
                    selectedDate: new Date(), // Assuming selected for 'today'
                },
            });

            // Send Email Notification to ALL Jar Members
            try {
                const members = await prisma.jarMember.findMany({
                    where: { jarId: currentJarId },
                    include: { user: true }
                });

                const recipients = members
                    .map(m => m.user.email)
                    .filter(email => email) as string[];

                // Ensure unique and present
                const uniqueRecipients = Array.from(new Set(recipients));

                if (uniqueRecipients.length > 0) {
                    await sendDateNotificationEmail(uniqueRecipients, selectedIdea);
                }
            } catch (emailErr) {
                console.error("Error sending notification emails:", emailErr);
            }

            // Gamification: Award 5 XP for spinning/selecting
            // Note: We use try-catch inside the helper so it won't crash if it fails
            await awardXp(currentJarId, 5);
            await checkAndUnlockAchievements(currentJarId);
        }

        return NextResponse.json(selectedIdea);

    } catch (error) {
        console.error('Pick date error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
