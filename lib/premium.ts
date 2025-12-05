import { Couple } from "@prisma/client";

export function isCouplePremium(couple: Couple | null | undefined): boolean {
    if (!couple) return false;

    if (couple.isPremium) return true;

    // Check if the couple is eligible for a trial
    // We cast to any because isTrialEligible might not be in the generated type yet if generation failed
    if ((couple as any).isTrialEligible === false) return false;

    const trialDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const now = new Date();
    const createdAt = new Date(couple.createdAt);

    return (now.getTime() - createdAt.getTime()) < trialDuration;
}
