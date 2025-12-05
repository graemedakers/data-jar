import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { isCouplePremium } from '@/lib/premium';

export async function GET() {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ user: null });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                couple: {
                    include: {
                        users: {
                            orderBy: { createdAt: 'asc' },
                            select: { id: true }
                        }
                    }
                }
            },
        });

        if (!user || !user.couple) {
            return NextResponse.json({ user: null });
        }

        const isCreator = user.couple.users[0]?.id === user.id;
        const hasPartner = user.couple.users.length > 1;

        // Return user with couple reference code
        return NextResponse.json({
            user: {
                ...user,
                coupleReferenceCode: user.couple.referenceCode,
                location: user.couple.location,
                isPremium: isCouplePremium(user.couple),
                hasPaid: user.couple.isPremium,
                isTrialEligible: (user.couple as any).isTrialEligible,
                coupleCreatedAt: user.couple.createdAt,
                isCreator,
                hasPartner
            }
        });
    } catch (error) {
        console.error("Error fetching user in /api/auth/me:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
