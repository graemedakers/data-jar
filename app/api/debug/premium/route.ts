import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { isCouplePremium, isUserPro } from '@/lib/premium';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberships: {
                    include: {
                        jar: true
                    }
                },
                couple: true
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determine active jar
        let activeJar = null;
        if (user.activeJarId) {
            const membership = user.memberships.find(m => m.jarId === user.activeJarId);
            activeJar = membership?.jar;
        } else if (user.memberships.length > 0) {
            activeJar = user.memberships[0].jar;
        } else if (user.couple) {
            activeJar = user.couple;
        }

        const userIsPro = isUserPro(user);
        const jarIsPremium = activeJar ? isCouplePremium(activeJar) : false;
        const effectivePremium = jarIsPremium || userIsPro;

        return NextResponse.json({
            debug: {
                userEmail: user.email,
                userId: user.id,

                // User-level premium fields
                userIsLifetimePro: user.isLifetimePro,
                userSubscriptionStatus: user.subscriptionStatus,
                userStripeCustomerId: user.stripeCustomerId,
                userStripeSubscriptionId: user.stripeSubscriptionId,

                // Jar info
                hasActiveJar: !!activeJar,
                activeJarId: activeJar?.id || null,
                jarIsPremium: activeJar?.isPremium || null,
                jarIsLegacyPremium: (activeJar as any)?.isLegacyPremium || null,
                jarSubscriptionStatus: activeJar?.subscriptionStatus || null,

                // Calculated values
                userIsPro,
                jarIsPremium,
                effectivePremium,

                // What the frontend receives
                frontendIsPremium: effectivePremium,
            }
        });
    } catch (error) {
        console.error('Debug endpoint error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
