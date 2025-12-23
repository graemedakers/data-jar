
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== 'secret123') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const targetUserId = searchParams.get('userId');
    const targetJarId = searchParams.get('jarId');

    let users, jars, members;

    try {
        if (targetUserId) {
            users = await prisma.user.findMany({
                where: { id: targetUserId },
                include: { memberships: true, couple: true }
            });
            members = await prisma.jarMember.findMany({
                where: { userId: targetUserId }
            });
        } else {
            users = await prisma.user.findMany({
                take: 10,
                select: { id: true, email: true, name: true, activeJarId: true }
            });
        }

        if (targetJarId) {
            jars = await prisma.jar.findMany({
                where: { id: targetJarId },
                include: { members: true, legacyUsers: { select: { id: true } } }
            });
        } else {
            jars = await prisma.jar.findMany({
                take: 5,
                select: { id: true, name: true }
            });
        }

        const countUsers = await prisma.user.count();

        return NextResponse.json({
            meta: {
                totalUsers: countUsers,
                dbUrlTruncated: process.env.DATABASE_URL?.substring(0, 20) + '...' // Check if it looks right
            },
            users,
            jars
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
