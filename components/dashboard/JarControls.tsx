
import { motion } from "framer-motion";
import { Plus, Sparkles, Layers, ArrowRight } from "lucide-react";

interface JarControlsProps {
    userData: any;
    ideasCount: number;
    onAddIdea: () => void;
    onSurpriseMe: () => void;
    onOpenJar: () => void;
}

export function JarControls({ userData, ideasCount, onAddIdea, onSurpriseMe, onOpenJar }: JarControlsProps) {
    const hasJar = userData && userData.memberships && userData.memberships.length > 0;

    return (
        <div className="space-y-6 order-2 xl:order-1">
            <motion.button
                whileHover={hasJar ? { scale: 1.02 } : {}}
                whileTap={hasJar ? { scale: 0.95 } : {}}
                onClick={hasJar ? onAddIdea : undefined}
                disabled={!hasJar}
                className={`w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 transition-all bg-gradient-to-br from-violet-600/20 to-violet-900/40 border border-violet-500/30 shadow-lg shadow-violet-900/10 group ${!hasJar
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:border-violet-500/50'
                    }`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 shrink-0 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-200 group-hover:scale-110 transition-transform relative z-10 border border-violet-500/30">
                    <Plus className="w-6 h-6" />
                </div>
                <div className="text-left relative z-10">
                    <span className="block text-lg font-bold text-violet-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-200 transition-colors flex items-center gap-2">
                        Add Idea
                        <span className="bg-violet-500/30 text-violet-700 dark:text-violet-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">+15 XP</span>
                    </span>
                    <span className="text-sm text-violet-700 dark:text-violet-200/60 group-hover:text-violet-900 dark:group-hover:text-violet-200/80 transition-colors leading-tight">Fill your jar</span>
                </div>
            </motion.button>

            {userData?.jarType !== 'SOCIAL' && (
                <motion.button
                    whileHover={hasJar ? { scale: 1.02 } : {}}
                    whileTap={hasJar ? { scale: 0.95 } : {}}
                    onClick={hasJar ? onSurpriseMe : undefined}
                    disabled={!hasJar}
                    className={`w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 transition-all bg-gradient-to-br from-yellow-500/20 to-orange-600/40 border border-yellow-500/30 shadow-lg shadow-yellow-900/10 group ${!hasJar
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:border-yellow-500/50'
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 shrink-0 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-200 group-hover:scale-110 transition-transform relative z-10 border border-yellow-500/30">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="text-left relative z-10">
                        <span className="block text-lg font-bold text-yellow-900 dark:text-white group-hover:text-yellow-700 dark:group-hover:text-yellow-200 transition-colors flex items-center gap-2">
                            Surprise Me
                            <span className="bg-yellow-500/30 text-yellow-700 dark:text-yellow-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">+15 XP</span>
                        </span>
                        <span className="text-sm text-yellow-700 dark:text-yellow-200/60 group-hover:text-yellow-900 dark:group-hover:text-yellow-200/80 transition-colors leading-tight">Add a secret idea</span>
                    </div>
                </motion.button>
            )}

            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenJar}
                className="glass-card p-6 hidden md:flex items-center gap-4 cursor-pointer group hover:bg-white/10"
            >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 transition-colors shrink-0">
                    <Layers className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Open Jar</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">View {ideasCount} ideas</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </motion.div>

        </div>
    );
}
