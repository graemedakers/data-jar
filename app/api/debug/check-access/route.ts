
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const emailA = 'graemedakers@gmail.com';
        const emailB = 'tamara.hatzi@outlook.com';

        const userA = await prisma.user.findFirst({
            where: { email: { equals: emailA, mode: 'insensitive' } },
            include: {
                memberships: {
                    include: { jar: true }
                }
            }
        });

        const userB = await prisma.user.findFirst({
            where: { email: { equals: emailB, mode: 'insensitive' } },
            include: {
                memberships: {
                    include: { jar: true }
                }
            }
        });

        if (!userA) return NextResponse.json({ error: `User ${emailA} not found` });
        if (!userB) return NextResponse.json({ error: `User ${emailB} not found` });

        const jarIdsA = userA.memberships.map(m => m.jarId);
        const jarIdsB = userB.memberships.map(m => m.jarId);

        const sharedJars = userA.memberships
            .filter(m => jarIdsB.includes(m.jarId))
            .map(m => ({
                id: m.jarId,
                name: m.jar.name,
                type: m.jar.type,
                roleA: m.role,
                roleB: userB.memberships.find(mb => mb.jarId === m.jarId)?.role
            }));

        return NextResponse.json({
            userA: { id: userA.id, email: userA.email, jarCount: userA.memberships.length },
            userB: { id: userB.id, email: userB.email, jarCount: userB.memberships.length },
            sharedJars
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
