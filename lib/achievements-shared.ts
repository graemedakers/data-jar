export interface AchievementDef {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
    category: 'CREATION' | 'ACTION' | 'COMPLETION';
    targetCount: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
    { id: 'IDEA_1', title: 'Spark Starter', description: 'Add your first date idea', icon: 'Lightbulb', category: 'CREATION', targetCount: 1 },
    { id: 'IDEA_10', title: 'The Architect', description: 'Add 10 date ideas', icon: 'Hammer', category: 'CREATION', targetCount: 10 },
    { id: 'IDEA_25', title: 'Idea Machine', description: 'Add 25 date ideas', icon: 'Warehouse', category: 'CREATION', targetCount: 25 },

    { id: 'SPIN_1', title: 'Roll the Dice', description: 'Spin the date jar for the first time', icon: 'Dices', category: 'ACTION', targetCount: 1 },
    { id: 'SPIN_10', title: 'Fate Tempter', description: 'Spin the jar 10 times', icon: 'RefreshCw', category: 'ACTION', targetCount: 10 },

    { id: 'RATE_1', title: 'Memory Maker', description: 'Complete and rate your first date', icon: 'Heart', category: 'COMPLETION', targetCount: 1 },
    { id: 'RATE_5', title: 'Going Steady', description: 'Complete 5 dates', icon: 'Flame', category: 'COMPLETION', targetCount: 5 },
    { id: 'RATE_20', title: 'Soulmates', description: 'Complete 20 dates', icon: 'Crown', category: 'COMPLETION', targetCount: 20 },
];
