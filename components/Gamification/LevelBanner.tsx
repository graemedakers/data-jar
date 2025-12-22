"use client";

import { motion } from "framer-motion";
import { getNextLevelProgress } from "@/lib/gamification-shared";
import { Trophy } from "lucide-react";

interface LevelBannerProps {
    xp: number;
    level: number;
}

export function LevelBanner({ xp, level }: LevelBannerProps) {
    const { progressPercent, nextTitle, currentTitle, xpToNext } = getNextLevelProgress(xp, level);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl p-4 mb-8 shadow-md dark:shadow-none"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 ring-1 ring-yellow-500/30 dark:ring-yellow-500/50">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-none">{currentTitle}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Level {level} • {xp} XP</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Next Rank</span>
                    <p className="text-slate-700 dark:text-slate-300 text-xs font-medium">{nextTitle}</p>
                    <p className="text-slate-500 text-[10px]">{Math.floor(xpToNext)} XP to go</p>
                </div>
            </div>

            <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                />
            </div>
        </motion.div>
    );
}
