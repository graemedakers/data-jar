import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const COST_VALUES: Record<string, number> = { 'FREE': 0, '$': 1, '$$': 2, '$$$': 3 };
const ACTIVITY_VALUES: Record<string, number> = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2 };

export async function POST(request: Request) {
    try {
        const session = await getSession();
        const { maxDuration, maxCost, maxActivityLevel, timeOfDay } = await request.json().catch(() => ({}));

        let ideas = [];
        let coupleId = null;
        let userEmail = null;
        let userName = null;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Authenticated User
        coupleId = session.user.coupleId;
        userEmail = session.user.email;
        userName = session.user.name;

        // Fetch all unselected ideas for this couple
        const allIdeas = await prisma.idea.findMany({
            where: {
                coupleId: session.user.coupleId,
                selectedAt: null,
            },
        });

        // Filter in memory (easier for string enums)
        ideas = allIdeas.filter(idea => {
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
        if (session && coupleId) {
            await prisma.idea.update({
                where: { id: selectedIdea.id },
                data: {
                    selectedAt: new Date(),
                    selectedDate: new Date(), // Assuming selected for 'today'
                },
            });

            // Send Email Notification
            if (userEmail && process.env.RESEND_API_KEY) {
                try {
                    // Find partner's email
                    const partner = await prisma.user.findFirst({
                        where: {
                            coupleId: coupleId,
                            email: { not: userEmail }
                        }
                    });

                    const recipients = [userEmail];
                    if (partner) recipients.push(partner.email);

                    await resend.emails.send({
                        from: 'Date Jar <onboarding@resend.dev>',
                        to: recipients,
                        subject: `Date Night Decided: ${selectedIdea.description}!`,
                        html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ec4899;">It's a Date!</h1>
                <p>The jar has spoken. Your date for tonight is:</p>
                <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; margin: 20px 0;">
                  <h2 style="margin: 0; color: #be185d;">${selectedIdea.description}</h2>
                  <p style="margin: 10px 0 0; color: #6b7280;">
                    ${selectedIdea.indoor ? '🏠 Indoor' : '🌳 Outdoor'} • 
                    ${selectedIdea.duration}h • 
                    ${selectedIdea.cost}
                  </p>
                </div>
                <p>Have a wonderful time!</p>
              </div>
            `
                    });
                } catch (emailError) {
                    console.error('Failed to send email:', emailError);
                }
            }
        }

        return NextResponse.json(selectedIdea);

    } catch (error) {
        console.error('Pick date error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
