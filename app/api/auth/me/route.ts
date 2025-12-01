import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { couple: true },
    });

    if (!user) {
        return NextResponse.json({ user: null });
    }

    // Return user with couple reference code
    return NextResponse.json({
        user: {
            ...user,
            coupleReferenceCode: user.couple.referenceCode,
            location: user.couple.location,
            isPremium: user.couple.isPremium,
        }
    });
}
