"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { LEVEL_DEFINITIONS } from "@/lib/gamification-shared";

interface LevelUpModalProps {
    isOpen: boolean;
    level: number;
    onClose: () => void;
}

export function LevelUpModal({ isOpen, level, onClose }: LevelUpModalProps) {
    const levelDef = LEVEL_DEFINITIONS.find(l => l.level === level);
    const title = levelDef?.title || "Unknown Rank";

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#eab308', '#ec4899', '#3b82f6'] // Yellow, Pink, Blue
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#eab308', '#ec4899', '#3b82f6']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="bg-slate-900 border border-yellow-500/50 rounded-2xl p-8 max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(234,179,8,0.3)]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-yellow-500/20 mb-6 ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/20"
                        >
                            <Trophy className="w-10 h-10 text-yellow-400" />
                        </motion.div>

                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold text-white mb-2"
                        >
                            Level Up!
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-400 mb-6"
                        >
                            You have reached Level {level}
                        </motion.p>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-4 mb-8"
                        >
                            <p className="text-yellow-100 text-xs uppercase tracking-wider font-bold mb-1">New Title Unlocked</p>
                            <p className="text-2xl font-bold text-white shadow-sm">{title}</p>
                        </motion.div>

                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            onClick={onClose}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Awesome!
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
