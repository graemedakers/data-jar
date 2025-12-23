import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { jarId } = await request.json();

        if (!jarId) {
            return NextResponse.json({ error: "Jar ID is required" }, { status: 400 });
        }

        // Find Membership
        const membership = await prisma.jarMember.findUnique({
            where: {
                userId_jarId: {
                    jarId,
                    userId: session.user.id
                }
            },
            include: { jar: true }
        });

        if (!membership) {
            return NextResponse.json({ error: "You are not a member of this jar" }, { status: 404 });
        }

        // Check member count of this jar
        const memberCount = await prisma.jarMember.count({
            where: { jarId }
        });

        // Check if this is the user's only jar - prevent leaving if so
        const userJarCount = await prisma.jarMember.count({
            where: { userId: session.user.id }
        });

        if (userJarCount <= 1) {
            return NextResponse.json({
                error: "You cannot leave your only jar. Please join or create another jar first."
            }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // Delete membership
            await tx.jarMember.delete({
                where: {
                    userId_jarId: {
                        jarId,
                        userId: session.user.id
                    }
                }
            });

            // If last member, delete the Jar and all related data
            if (memberCount <= 1) {
                // Delete all related records first (in correct order to avoid FK violations)

                // Delete ideas (which will cascade delete ratings if configured)
                await tx.idea.deleteMany({
                    where: { jarId }
                });

                // Delete achievements
                await tx.unlockedAchievement.deleteMany({
                    where: { jarId }
                });

                // Delete favorites
                await tx.favoriteVenue.deleteMany({
                    where: { jarId }
                });

                // Delete deleted logs
                await tx.deletedLog.deleteMany({
                    where: { jarId }
                });

                // Finally delete the Jar
                await tx.jar.delete({
                    where: { id: jarId }
                });
            } else {
                // If Jar remains, and it is Romantic, regenerate code for security
                // This prevents the ex-partner from rejoining with an old link/code
                if (membership.jar.type === 'ROMANTIC') {
                    // Generate new 6-char code
                    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

                    await tx.jar.update({
                        where: { id: jarId },
                        data: { referenceCode: newCode }
                    });
                }
            }

            // Update user activeJarId to null since they're leaving
            await tx.user.update({
                where: { id: session.user.id },
                data: { activeJarId: null }
            });
            // The /api/auth/me endpoint will switch to another jar if available on next load
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Leave Jar Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
