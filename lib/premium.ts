import { Jar, User } from "@prisma/client";

/**
 * Premium Status Determination (Simplified)
 * 
 * Premium features are unlocked if EITHER:
 * 1. User has isLifetimePro = true (user-level premium)
 * 2. User has active subscription (subscriptionStatus = 'active', 'trialing', or 'past_due')
 * 3. Jar has isPremium = true (jar-level premium, for manual overrides)
 * 
 * The effective premium status is: userIsPro OR jarIsPremium
 */

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

    // Check if the jar itself has premium status
    // This covers manual overrides and legacy one-time payments
    return jar.isPremium === true;
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
