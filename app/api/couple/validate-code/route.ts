import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 });
        }

        const couple = await prisma.couple.findUnique({
            where: { referenceCode: code },
            include: { users: true }
        });

        if (!couple) {
            return NextResponse.json({ valid: false, error: 'Invalid invite code' });
        }

        if (couple.users.length >= 2) {
            return NextResponse.json({ valid: false, error: 'This jar is already full' });
        }

        return NextResponse.json({ valid: true });

    } catch (error: any) {
        console.error('Error validating code:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
