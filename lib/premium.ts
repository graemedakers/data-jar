import { Couple } from "@prisma/client";

export function isCouplePremium(couple: Couple | null | undefined): boolean {
    if (!couple) return false;

    // 1. Legacy Grandfathering
    // If they are marked as legacy premium, they have access forever.
    if ((couple as any).isLegacyPremium) return true;

    // 2. Manual Override / Legacy One-Time Payment
    // Keep supporting the old boolean flag for now as a fallback
    if (couple.isPremium) return true;

    // 3. Active Subscription
    const activeStatuses = ['active', 'trialing'];
    if ((couple as any).subscriptionStatus && activeStatuses.includes((couple as any).subscriptionStatus)) {
        return true;
    }

    // 4. Extended Free Trial (14 Days)
    const TRIAL_DAYS = 14;
    const trialDuration = TRIAL_DAYS * 24 * 60 * 60 * 1000;
    const now = new Date();
    const createdAt = new Date(couple.createdAt);

    if ((now.getTime() - createdAt.getTime()) < trialDuration) {
        return true;
    }

    return false;
}
