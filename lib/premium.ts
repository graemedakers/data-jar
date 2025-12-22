import { Jar, User } from "@prisma/client";

export function isUserPro(user: User | null | undefined): boolean {
    if (!user) return false;

    // 1. Lifetime Pro
    if (user.isLifetimePro) return true;

    // 2. Active Subscription or Trial (including grace period)
    const activeStatuses = ['active', 'trialing', 'past_due'];
    if (user.subscriptionStatus && activeStatuses.includes(user.subscriptionStatus)) {
        return true;
    }

    return false;
}

export function isCouplePremium(jar: Jar | null | undefined): boolean {
    if (!jar) return false;

    // 1. Legacy Grandfathering
    if ((jar as any).isLegacyPremium) return true;

    // 2. Manual Override / Legacy One-Time Payment
    if (jar.isPremium) return true;

    // 3. User-based Premium Check (for associated users)
    // Ideally, we check the user who owns the jar, but we don't have that context here easily 
    // without fetching relations. 
    // For now, rely on legacy fields OR the caller should use isUserPro().

    return false;
}

export function getLimits(user: User | null | undefined) {
    const isPro = isUserPro(user);
    return {
        maxJars: isPro ? 50 : 1,
        maxMembersPerJar: isPro ? 50 : 4,
        aiPlanning: isPro,
        unlimitedIdeas: isPro,
        googlePhotos: isPro,
    };
}
