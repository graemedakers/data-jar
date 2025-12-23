
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== 'secret123') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            take: 10,
            select: { id: true, email: true, name: true, activeJarId: true }
        });

        const jars = await prisma.jar.findMany({
            take: 5,
            select: { id: true, name: true, deleted: true }
        });

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
