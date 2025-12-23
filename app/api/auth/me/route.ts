import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { isCouplePremium, isUserPro } from '@/lib/premium';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session?.user?.email) {
        return NextResponse.json({ user: null });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                // Fetch ALL memberships including deleted ones (we filter in code)
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
                // Legacy fallback support for migration
                couple: {
                    include: {
                        members: {
                            include: { user: { select: { id: true } } }
                        },
                        achievements: true
                    }
                }
            },
        });

        if (!user) {
            return NextResponse.json({ user: null });
        }

        // 1. FILTER DELETED JARS SAFEGUARD (Handles null/undefined gracefully)
        // This ensures existing users with null 'deleted' fields (from early migration) are treated as active
        if (user.memberships) {
            user.memberships = user.memberships.filter(m => {
                // Keep if jar exists AND (deleted is false OR deleted is null/undefined)
                const jar = m.jar as any;
                return jar && (jar.deleted === false || jar.deleted === null || jar.deleted === undefined);
            });
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
        // If the user has an active jar (e.g. legacy couple) but it's not in memberships list (migration gap), add it.
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
