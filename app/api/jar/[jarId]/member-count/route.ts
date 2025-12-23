import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { jarId: string } }
) {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { jarId } = params;

        if (!jarId) {
            return NextResponse.json({ error: "Jar ID is required" }, { status: 400 });
        }

        // Count members in this jar
        const count = await prisma.jarMember.count({
            where: { jarId }
        });

        return NextResponse.json({ count });

    } catch (error) {
        console.error("Get Member Count Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
