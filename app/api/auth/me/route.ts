
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

        // 1. Fetch Basic User + Memberships (No deep nesting yet)
        let user: any = null;

        // Define the safe include for memberships (shallow)
        const membershipInclude = {
            memberships: {
                include: {
                    jar: {
                        include: {
                            // Fetch members lighter
                            members: {
                                include: { user: { select: { id: true, name: true } } }
                            },
                            achievements: true
                        }
                    }
                }
            }
        };

        if (sessionId) {
            user = await prisma.user.findUnique({ where: { id: sessionId }, include: membershipInclude });
        }
        if (!user && email) {
            user = await prisma.user.findUnique({ where: { email }, include: membershipInclude });
        }

        if (!user) return NextResponse.json({ user: null });

        // 2. Fetch Legacy Couple Relation (Separately to avoid big query explosion)
        if (user.coupleId) {
            try {
                const coupleJar = await prisma.jar.findUnique({
                    where: { id: user.coupleId },
                    include: {
                        members: { include: { user: { select: { id: true } } } },
                        achievements: true
                    }
                });
                if (coupleJar) {
                    user.couple = coupleJar;
                }
            } catch (e) {
                console.warn("Failed to fetch legacy couple jar", e);
            }
        }

        // 3. Logic: Determine Active Jar
        // ... (Restore previous logic) ...

        // 1. FILTER DELETED JARS SAFEGUARD (Handles null/undefined gracefully)
        if (user.memberships) {
            // TEMPORARILY DISABLED FILTER to debug production user issue
        }

        // 2. DETERMINE ACTIVE JAR
        let activeJar = null;
        let isCreator = false;
        let hasPartner = false;

        // Priority 1: User's explicitly selected active Jar ID
        if (user.activeJarId) {
            const membership = user.memberships.find((m: any) => m.jarId === user.activeJarId);
            activeJar = membership?.jar || null;
        }

        // Priority 2: Fallback to first available active membership if selection is invalid/deleted
        if (!activeJar && user.memberships.length > 0) {
            activeJar = user.memberships[0].jar;
        }

        // Priority 3: Legacy Couple fallback
        if (!activeJar && user.couple) {
            activeJar = user.couple;
        }

        // Priority 4: Orphaned ActiveJarId Recovery
        if (!activeJar && user.activeJarId) {
            try {
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
                    const isMember = orphanedJar.members.some(m => m.userId === user.id);
                    const isLegacy = orphanedJar.legacyUsers.length > 0;

                    if (isMember || isLegacy) {
                        console.log(`[Auth/Me] Recovered orphaned jar ${orphanedJar.id} for user ${user.id}`);
                        activeJar = orphanedJar;
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch orphaned jar", e);
            }
        }

        // Calculate user status
        const userIsPro = isUserPro(user);

        // CASE: User has NO active jars
        if (!activeJar) {
            return NextResponse.json({
                user: {
                    ...user,
                    isCreator: false,
                    hasPartner: false,
                    isPremium: userIsPro,
                    hasPaid: userIsPro,
                    location: user.homeTown,
                    coupleReferenceCode: null,
                    isTrialEligible: true,
                    coupleCreatedAt: user.createdAt,
                    // Active Jar fields null
                    activeJarId: null,
                    jarName: null,
                    jarType: null,
                    unlockedAchievements: []
                }
            });
        }

        // CASE: User HAS active jar
        const members = activeJar.members || (activeJar as any).users || []; // Handle legacy vs new structure

        // Check if creator (Admin role)
        const userDifference = user.memberships.find((m: any) => m.jarId === activeJar?.id);
        isCreator = userDifference?.role === 'ADMIN';

        hasPartner = members.length > 1;

        // Calculate Premium
        const jarIsPremium = isCouplePremium(activeJar);
        const effectivePremium = jarIsPremium || userIsPro;

        // CRITICAL FIX: Ensure activeJar is represented in memberships for frontend consistency
        const membershipExists = user.memberships.some((m: any) => m.jarId === activeJar?.id);
        const effectiveMemberships = [...user.memberships];

        if (!membershipExists && activeJar) {
            effectiveMemberships.unshift({
                id: 'legacy-membership',
                userId: user.id,
                jarId: activeJar.id,
                role: isCreator ? 'ADMIN' : 'MEMBER',
                joinedAt: activeJar.createdAt,
                jar: activeJar as any // Cast to any to fit types
            } as any);
        }

        return NextResponse.json({
            user: {
                ...user,
                memberships: effectiveMemberships,
                // Map Jar fields to legacy Couple fields for frontend compatibility
                coupleReferenceCode: activeJar.referenceCode,
                location: user.homeTown,
                isPremium: effectivePremium,
                hasPaid: effectivePremium,
                isTrialEligible: activeJar.isTrialEligible,
                coupleCreatedAt: activeJar.createdAt,
                xp: activeJar.xp || 0,
                level: activeJar.level || 1,
                unlockedAchievements: activeJar.achievements?.map((a: any) => a.achievementId) || [],

                // Helper flags
                activeJarId: activeJar.id,
                jarName: activeJar.name,
                jarType: activeJar.type,
                isCreator,
                hasPartner
            }
        });

    } catch (e) {
        console.error("Auth/Me Error:", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
