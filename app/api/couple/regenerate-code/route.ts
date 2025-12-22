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
    if (!session || (!session.user.activeJarId && !session.user.coupleId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentJarId = session.user.activeJarId || session.user.coupleId;

    try {
        // Verify ADMIN role
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    jarId: currentJarId,
                    userId: session.user.id
                }
            }
        });

        if (!membership || membership.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Only the jar admin can change the invite code.' }, { status: 403 });
        }

        let newCode = generateInviteCode();
        let isUnique = false;

        // Ensure uniqueness
        while (!isUnique) {
            const existing = await prisma.jar.findUnique({
                where: { referenceCode: newCode }
            });
            if (!existing) {
                isUnique = true;
            } else {
                newCode = generateInviteCode();
            }
        }

        // Update jar with new code
        const updatedJar = await prisma.jar.update({
            where: { id: currentJarId },
            data: { referenceCode: newCode }
        });

        return NextResponse.json({
            success: true,
            newCode: updatedJar.referenceCode,
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
