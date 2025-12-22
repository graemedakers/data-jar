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
        // Fetch current user details to check usage
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

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
            return NextResponse.json({ error: 'Only the jar admin can delete a partner.' }, { status: 403 });
        }

        // Fetch all members of the jar
        const members = await prisma.jarMember.findMany({
            where: { jarId: currentJarId },
            include: { user: true }
        });

        const others = members.filter(m => m.userId !== session.user.id);

        if (others.length === 0) {
            return NextResponse.json({ error: 'No partner found to delete.' }, { status: 404 });
        }

        if (others.length > 1) {
            return NextResponse.json({ error: 'There are multiple members in this Group. Please use the Group Management page to remove specific members.' }, { status: 400 });
        }

        const targetMember = others[0];
        const targetUser = targetMember.user;

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

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Delete ideas created by the partner (target user)
            // Note: We delete ideas where jarId matches AND createdBy matches
            await tx.idea.deleteMany({
                where: {
                    jarId: currentJarId,
                    createdById: targetUser.id
                }
            });

            // 2. Delete ALL history of past dates (ideas with selectedAt != null) in this jar
            //    regardless of who created them, ensuring a clean slate.
            await tx.idea.deleteMany({
                where: {
                    jarId: currentJarId,
                    selectedAt: { not: null }
                }
            });

            // 3. Delete the partner user
            //    This will cascade delete their JarMember record.
            await tx.user.delete({
                where: { id: targetUser.id }
            });

            // 4. Update the jar with the new invite code
            await tx.jar.update({
                where: { id: currentJarId },
                data: { referenceCode: newCode }
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Partner and their history deleted successfully. A new invite code has been generated.',
            newCode: newCode
        });

    } catch (error: any) {
        console.error('Error deleting partner:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
