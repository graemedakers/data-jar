import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const result = await prisma.$queryRaw`PRAGMA table_info(Idea);`;
        // Also try to fetch one idea to see if it works
        const ideas = await prisma.idea.findMany({ take: 1 });
        return NextResponse.json({ tableInfo: result, ideas });
    } catch (error) {
        console.error('Debug DB error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
