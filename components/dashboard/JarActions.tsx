
import { motion } from "framer-motion";
import { Sparkles, History, ArrowRight } from "lucide-react";

interface JarActionsProps {
    availableIdeasCount: number;
    isSpinning: boolean;
    onSpin: () => void;
    onOpenMemories: () => void;
    memoriesCount: number;
}

export function JarActions({ availableIdeasCount, isSpinning, onSpin, onOpenMemories, memoriesCount }: JarActionsProps) {
    return (
        <div className="space-y-6 order-3 xl:order-3">
            {/* Desktop Spin Button (Hidden on Mobile) */}
            <div className="hidden xl:block">
                <motion.button
                    whileHover={availableIdeasCount > 0 ? { scale: 1.02 } : {}}
                    whileTap={availableIdeasCount > 0 ? { scale: 0.95 } : {}}
                    onClick={availableIdeasCount > 0 ? onSpin : undefined}
                    className={`w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 transition-all cursor-pointer border shadow-lg group ${availableIdeasCount > 0
                        ? 'bg-gradient-to-br from-pink-600/20 to-pink-900/40 border-pink-500/30 hover:border-pink-500/50 shadow-pink-900/10'
                        : 'bg-slate-800/20 border-slate-700 opacity-50 grayscale cursor-not-allowed'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center relative z-10 border transition-transform group-hover:scale-110 ${availableIdeasCount > 0 ? 'bg-pink-500/20 text-pink-200 border-pink-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                        <Sparkles className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="text-left relative z-10">
                        <span className={`block text-lg font-bold transition-colors flex items-center gap-2 ${availableIdeasCount > 0 ? 'text-pink-900 dark:text-white group-hover:text-pink-700 dark:group-hover:text-pink-200' : 'text-slate-400'}`}>
                            {isSpinning ? 'Spinning...' : 'Spin the Jar'}
                            {!isSpinning && availableIdeasCount > 0 && <span className="bg-pink-500/30 text-pink-700 dark:text-pink-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">+5 XP</span>}
                        </span>
                        <span className={`text-sm transition-colors leading-tight ${availableIdeasCount > 0 ? 'text-pink-700 dark:text-pink-200/60 group-hover:text-pink-900 dark:group-hover:text-pink-200/80' : 'text-slate-500'}`}>Let fate decide</span>
                    </div>
                </motion.button>
            </div>

            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenMemories}
                className="glass-card p-6 hidden md:flex items-center gap-4 cursor-pointer group hover:bg-white/10"
            >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors shrink-0">
                    <History className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Memories</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">{memoriesCount} dates done</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </motion.div>
        </div>
    );
}
