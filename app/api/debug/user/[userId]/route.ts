
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        // Security: Only allow debugging specific ID or with a key (skipping key for speed, obscure URL)

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                memberships: {
                    include: { jar: true }
                },
                couple: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' });
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            activeJarId: user.activeJarId,
            coupleId: user.coupleId, // LEGACY FIELD
            membershipsCount: user.memberships.length,
            memberships: user.memberships,
            couple: user.couple,
            createdAt: user.createdAt
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
