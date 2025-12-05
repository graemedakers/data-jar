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

        // Check if current user is the creator (first user in the couple)
        const creator = currentUser.couple.users[0];
        if (creator.id !== currentUser.id) {
            return NextResponse.json({ error: 'Only the jar creator can delete a partner.' }, { status: 403 });
        }

        // Find the partner (any user in the couple that is not the current user)
        const partner = currentUser.couple.users.find(u => u.id !== currentUser.id);

        if (!partner) {
            return NextResponse.json({ error: 'No partner found to delete.' }, { status: 404 });
        }

        let newCode = generateInviteCode();
        let isUnique = false;

        // Ensure uniqueness (simple loop)
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

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Delete ideas created by the partner
            await tx.idea.deleteMany({
                where: {
                    createdById: partner.id
                }
            });

            // 2. Delete ALL history of past dates (ideas with selectedAt != null)
            await tx.idea.deleteMany({
                where: {
                    coupleId: currentUser.coupleId,
                    selectedAt: { not: null }
                }
            });

            // 3. Delete the partner user
            await tx.user.delete({
                where: { id: partner.id }
            });

            // 4. Update the couple with the new invite code
            await tx.couple.update({
                where: { id: currentUser.coupleId },
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
