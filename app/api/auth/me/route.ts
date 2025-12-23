
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ user: null });
        }

        const sessionId = session.user.id?.trim();
        const email = session.user.email?.trim().toLowerCase();

        console.log(`[Auth/Me] Lookup. ID: ${sessionId}, Email: ${email}`);

        let user = null;

        if (sessionId) {
            user = await prisma.user.findUnique({ where: { id: sessionId } });
        }

        if (!user && email) {
            user = await prisma.user.findUnique({ where: { email } });
        }

        if (!user) {
            console.log("User not found (simple lookup).");
            return NextResponse.json({ user: null });
        }

        // Return bare user to diagnose connection
        return NextResponse.json({
            user: {
                ...user,
                // Add dummy fields to prevent frontend crash
                activeJarId: user.activeJarId,
                memberships: [],
                isCreator: false,
                hasPartner: false,
                isPremium: false,
                isTrialEligible: false,
                unlockedAchievements: []
            }
        });

    } catch (e) {
        console.error("Auth/Me Error:", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
