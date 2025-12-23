
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { isCouplePremium, isUserPro } from '@/lib/premium';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    console.log("[Auth/Me] Session check:", session ? "Session Found" : "No Session");

    if (!session?.user?.email) {
        console.log("[Auth/Me] No email in session");
        return NextResponse.json({ user: null });
    }

    const lookupEmail = session.user.email.trim(); // Keep original case first for strict match, but trim whitespace
    const userSessionId = session.user.id;

    console.log(`[Auth/Me] Looking up user by email: '${lookupEmail}' or ID: ${userSessionId}`);

    try {
        let user = null;

        const commonInclude = {
            memberships: {
                include: {
                    jar: {
                        include: {
                            members: {
                                include: { user: { select: { id: true, name: true } } }
                            },
                            achievements: true
                        }
                    }
                }
            },
            couple: {
                include: {
                    members: {
                        include: { user: { select: { id: true } } }
                    },
                    achievements: true
                }
            }
        };

        // Priority 1: Lookup by ID if available (Most reliable)
        if (userSessionId) {
            user = await prisma.user.findUnique({
                where: { id: userSessionId },
                include: commonInclude
            });
        }

        // Priority 2: Strict Lookup by Email (if no ID or ID lookup failed)
        if (!user) {
            user = await prisma.user.findUnique({
                where: { email: lookupEmail },
                include: commonInclude
            });
        }

        // Priority 3: Case-insensitive fallback
        if (!user) {
            console.log(`[Auth/Me] Strict lookup failed. Trying case-insensitive for: ${lookupEmail}`);
            user = await prisma.user.findFirst({
                where: {
                    email: {
                        equals: lookupEmail,
                        mode: 'insensitive'
                    }
                },
                include: commonInclude
            });
        }

        if (!user) {
            console.log(`[Auth/Me] User not found in DB for email: ${lookupEmail}`);
            return NextResponse.json({ user: null });
        }

        console.log(`[Auth/Me] User found: ${user.id}`);

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
            const membership = user.memberships.find(m => m.jarId === user.activeJarId);
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
                        // Check if user is in legacyUsers list
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
        const userDifference = user.memberships.find(m => m.jarId === activeJar?.id);
        isCreator = userDifference?.role === 'ADMIN';

        hasPartner = members.length > 1;

        // Calculate Premium
        const jarIsPremium = isCouplePremium(activeJar);
        const effectivePremium = jarIsPremium || userIsPro;

        // CRITICAL FIX: Ensure activeJar is represented in memberships for frontend consistency
        const membershipExists = user.memberships.some(m => m.jarId === activeJar?.id);
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

    } catch (error) {
        console.error("Error fetching user in /api/auth/me:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
