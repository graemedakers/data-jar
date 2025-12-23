
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface MobileSpinButtonProps {
    availableIdeasCount: number;
    isSpinning: boolean;
    onSpin: () => void;
}

export function MobileSpinButton({ availableIdeasCount, isSpinning, onSpin }: MobileSpinButtonProps) {
    return (
        <div className="xl:hidden">
            <motion.button
                whileHover={availableIdeasCount > 0 ? { scale: 1.02 } : {}}
                whileTap={availableIdeasCount > 0 ? { scale: 0.95 } : {}}
                onClick={() => availableIdeasCount > 0 && onSpin()}
                className={`w-full relative overflow-hidden rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer border shadow-lg group ${availableIdeasCount > 0
                    ? 'bg-gradient-to-r from-pink-600/20 to-pink-900/40 border-pink-500/30 hover:border-pink-500/50 shadow-pink-900/10'
                    : 'bg-slate-800/20 border-slate-700 opacity-50 grayscale cursor-not-allowed'}`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border transition-transform group-hover:scale-110 ${availableIdeasCount > 0 ? 'bg-pink-500/20 text-pink-200 border-pink-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                        <Sparkles className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="text-left">
                        <span className={`block text-base font-bold transition-colors flex items-center gap-2 ${availableIdeasCount > 0 ? 'text-pink-900 dark:text-white group-hover:text-pink-700 dark:group-hover:text-pink-200' : 'text-slate-400'}`}>
                            {isSpinning ? 'Spinning...' : 'Spin the Jar'}
                        </span>
                    </div>
                </div>

                {/* Right Side Info */}
                <div className="relative z-10 flex items-center gap-2">
                    {!isSpinning && availableIdeasCount > 0 && (
                        <span className="bg-pink-500/30 text-pink-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                            +5 XP
                        </span>
                    )}
                    <Sparkles className="w-4 h-4 text-pink-500/50" />
                </div>
            </motion.button>
        </div>
    );
}
