export const LEVEL_DEFINITIONS = [
    { level: 1, minXp: 0, title: "New Lovebirds" },
    { level: 2, minXp: 100, title: "Curious Couple" },
    { level: 3, minXp: 300, title: "Date Night Explorers" },
    { level: 4, minXp: 600, title: "Adventure Seekers" },
    { level: 5, minXp: 1000, title: "Romance Pros" },
    { level: 6, minXp: 1500, title: "Soulmates" },
    { level: 7, minXp: 2200, title: "Date Night Masters" },
    { level: 8, minXp: 3000, title: "Legends of Love" },
    { level: 9, minXp: 4000, title: "Eternal Flames" },
    { level: 10, minXp: 5500, title: "Universe Duo" },
];

export function getNextLevelProgress(currentXp: number, currentLevel: number) {
    const currentLevelDef = LEVEL_DEFINITIONS.find(l => l.level === currentLevel);
    const nextLevelDef = LEVEL_DEFINITIONS.find(l => l.level === currentLevel + 1);

    if (!nextLevelDef) {
        // Max level reached
        return {
            progressPercent: 100,
            xpToNext: 0,
            nextTitle: "Max Level Reached",
            currentTitle: currentLevelDef?.title || "Max Level",
            nextLevelXp: currentXp
        };
    }

    const xpRequiredForNext = nextLevelDef.minXp;

    // Safety check if level def is missing
    const baseLevelXp = currentLevelDef ? currentLevelDef.minXp : 0;

    const xpIntoLevel = currentXp - baseLevelXp;
    const range = xpRequiredForNext - baseLevelXp;

    const progressPercent = Math.min(100, Math.max(0, (xpIntoLevel / range) * 100));

    return {
        progressPercent,
        xpToNext: xpRequiredForNext - currentXp,
        nextTitle: nextLevelDef.title,
        currentTitle: currentLevelDef?.title || "Unknown",
        nextLevelXp: xpRequiredForNext
    };
}
