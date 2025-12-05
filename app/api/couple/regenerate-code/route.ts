import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

function generateInviteCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch current user and their couple info
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { couple: { include: { users: { orderBy: { createdAt: 'asc' } } } } }
        });

        if (!currentUser || !currentUser.couple) {
            return NextResponse.json({ error: 'User or couple not found' }, { status: 404 });
        }

        // Check if current user is the creator
        const creator = currentUser.couple.users[0];
        if (creator.id !== currentUser.id) {
            return NextResponse.json({ error: 'Only the jar creator can change the invite code.' }, { status: 403 });
        }

        let newCode = generateInviteCode();
        let isUnique = false;

        // Ensure uniqueness
        while (!isUnique) {
            const existing = await prisma.couple.findUnique({
                where: { referenceCode: newCode }
            });
            if (!existing) {
                isUnique = true;
            } else {
                newCode = generateInviteCode();
            }
        }

        // Update couple with new code
        const updatedCouple = await prisma.couple.update({
            where: { id: currentUser.coupleId },
            data: { referenceCode: newCode }
        });

        return NextResponse.json({
            success: true,
            newCode: updatedCouple.referenceCode,
            message: 'Invite code regenerated successfully.'
        });

    } catch (error: any) {
        console.error('Error regenerating invite code:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
