
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { isCouplePremium, isUserPro } from '@/lib/premium';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.email) return NextResponse.json({ user: null });

        const sessionId = session.user.id?.toString().trim();
        const email = session.user.email?.trim().toLowerCase();

        // 1. Fetch Basic User ONLY (No includes to prevent crash)
        let user: any = null;
        if (sessionId) {
            user = await prisma.user.findUnique({ where: { id: sessionId } });
        }
        if (!user && email) {
            user = await prisma.user.findUnique({ where: { email } });
        }

        if (!user) return NextResponse.json({ user: null });

        // 2. Safely Reconstruct Memberships
        // We cannot use 'include: memberships' because if a jar is missing, Prisma crashes.
        let safeMemberships: any[] = [];

        try {
            // Fetch raw members first (just IDs)
            const rawMemberships = await prisma.jarMember.findMany({
                where: { userId: user.id }
            });

            // Fetch Jars manually for each membership
            const membershipPromises = rawMemberships.map(async (m) => {
                try {
                    const jar = await prisma.jar.findUnique({
                        where: { id: m.jarId },
                        include: {
                            members: {
                                include: { user: { select: { id: true, name: true } } }
                            },
                            achievements: true
                        }
                    });

                    if (jar) {
                        return { ...m, jar };
                    }
                    return null; // Jar is missing (corrupted data)
                } catch (e) {
                    return null; // Error fetching specific jar
                }
            });

            const results = await Promise.all(membershipPromises);
            safeMemberships = results.filter(Boolean); // Remove nulls

        } catch (e) {
            console.warn("Failed to fetch memberships manually", e);
        }

        user.memberships = safeMemberships;

        // 3. Determine Active Jar (Logic Restored)
        let activeJar = null;
        let isCreator = false;
        let hasPartner = false;

        // Priority 1: User's explicitly selected active Jar ID
        if (user.activeJarId) {
            const membership = user.memberships.find((m: any) => m.jarId === user.activeJarId);
            activeJar = membership?.jar || null;
        }

        // Priority 2: Fallback to first available active membership
        if (!activeJar && user.memberships.length > 0) {
            activeJar = user.memberships[0].jar;
        }

        // Priority 3: Legacy Couple fallback
        // Fetch legacy couple safely if not found yet
        if (!activeJar && user.coupleId) {
            try {
                const coupleJar = await prisma.jar.findUnique({
                    where: { id: user.coupleId },
                    include: {
                        members: { include: { user: { select: { id: true } } } },
                        achievements: true
                    }
                });
                if (coupleJar) {
                    // Inject as legacy jar logic if needed
                    activeJar = coupleJar;
                }
            } catch (e) {
                console.warn("Legacy couple fetch failed", e);
            }
        }

        // Priority 4: Orphaned ActiveJarId Recovery (Safe Fetch)
        if (!activeJar && user.activeJarId) {
            try {
                // Check if this specific jar even exists
                const orphanedJar = await prisma.jar.findUnique({
                    where: { id: user.activeJarId },
                    include: {
                        members: {
                            include: { user: { select: { id: true, name: true } } }
                        },
                        achievements: true,
                        legacyUsers: {
                            where: { id: user.id },
                            select: { id: true }
                        }
                    }
                });

                if (orphanedJar) {
                    // Verify membership or legacy status
                    const isMember = orphanedJar.members.some(m => m.userId === user.id);
                    const isLegacy = orphanedJar.legacyUsers.length > 0;
                    if (isMember || isLegacy) {
                        activeJar = orphanedJar;
                    }
                }
            } catch (e) {
                // Ignore if orphaned jar is truly gone
            }
        }

        // 4. Construct Final Response
        const userIsPro = isUserPro(user);

        if (!activeJar) {
            return NextResponse.json({
                user: {
                    ...user,
                    memberships: safeMemberships,
                    isCreator: false,
                    hasPartner: false,
                    isPremium: userIsPro,
                    hasPaid: userIsPro,
                    location: user.homeTown,
                    coupleReferenceCode: null,
                    isTrialEligible: true,
                    coupleCreatedAt: user.createdAt,
                    activeJarId: null,
                    jarName: null,
                    jarType: null,
                    unlockedAchievements: []
                }
            });
        }

        const members = activeJar.members || (activeJar as any).users || [];
        const userDifference = user.memberships.find((m: any) => m.jarId === activeJar?.id);
        isCreator = userDifference?.role === 'ADMIN';
        hasPartner = members.length > 1;

        const jarIsPremium = isCouplePremium(activeJar);
        const effectivePremium = jarIsPremium || userIsPro;

        // Ensure activeJar is in memberships for frontend consistency
        const membershipExists = user.memberships.some((m: any) => m.jarId === activeJar?.id);
        const effectiveMemberships = [...user.memberships];

        if (!membershipExists && activeJar) {
            effectiveMemberships.unshift({
                id: 'legacy-membership',
                userId: user.id,
                jarId: activeJar.id,
                role: isCreator ? 'ADMIN' : 'MEMBER',
                joinedAt: activeJar.createdAt,
                jar: activeJar as any
            } as any);
        }

        return NextResponse.json({
            user: {
                ...user,
                memberships: effectiveMemberships,
                coupleReferenceCode: activeJar.referenceCode,
                location: user.homeTown,
                isPremium: effectivePremium,
                hasPaid: effectivePremium,
                isTrialEligible: activeJar.isTrialEligible,
                coupleCreatedAt: activeJar.createdAt,
                xp: activeJar.xp || 0,
                level: activeJar.level || 1,
                unlockedAchievements: activeJar.achievements?.map((a: any) => a.achievementId) || [],
                activeJarId: activeJar.id,
                jarName: activeJar.name,
                jarType: activeJar.type,
                isCreator,
                hasPartner
            }
        });

    } catch (e) {
        // Global catch for unexpected errors
        console.error("Auth/Me Global Error:", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
