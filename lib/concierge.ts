import { prisma } from '@/lib/prisma';

/**
 * reliableGeminiCall
 * 
 * Executes a prompt against a list of Gemini models, handling failover and 429/404 errors automatically.
 * Returns the parsed JSON response.
 */
export async function getExcludedNames(jarId: string, limit = 20): Promise<string[]> {
    // 1. Fetch recent 'Idea' titles created by this couple to identify places they likely already know
    const recentIdeas = await prisma.idea.findMany({
        where: { jarId: jarId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { description: true }
    });

    // 2. Fetch all 'FavoriteVenue' names for this couple
    const favorites = await prisma.favoriteVenue.findMany({
        where: { jarId: jarId },
        select: { name: true }
    });

    // Combine and cleanup
    return Array.from(new Set([
        ...recentIdeas.map(i => i.description),
        ...favorites.map(f => f.name)
    ])).filter(Boolean);
}
