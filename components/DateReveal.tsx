import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, DollarSign, Activity, Sparkles, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";
import { useState } from "react";
import { Confetti } from "./Confetti";

interface Idea {
    id: string;
    description: string;
    indoor: boolean;
    duration: number;
    activityLevel: string;
    cost: string;
    timeOfDay: string;
}

interface DateRevealProps {
    idea: Idea | null;
    onClose: () => void;
    userLocation?: string;
}

export function DateReveal({ idea, onClose, userLocation }: DateRevealProps) {
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [showAI, setShowAI] = useState(false);

    const handleGetAI = async () => {
        if (!idea) return;
        setIsLoadingAI(true);
        setShowAI(true);
        try {
            const res = await fetch('/api/ai-recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: idea.description,
                    location: userLocation
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations || []);
            }
        } catch (error) {
            console.error("Failed to get AI recommendations", error);
        } finally {
            setIsLoadingAI(false);
        }
    };

    // Reset state when modal closes or idea changes
    if (!idea && (recommendations.length > 0 || showAI)) {
        setRecommendations([]);
        setShowAI(false);
        setIsLoadingAI(false);
    }

    return (
        <AnimatePresence>
            {idea && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <Confetti />
                    <motion.div
                        initial={{ scale: 0.8, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 50, opacity: 0 }}
                        className="glass-card w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 blur-[50px] rounded-full -z-10" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center space-y-6 pt-8 px-6 pb-6 overflow-y-auto custom-scrollbar">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 shrink-0"
                            >
                                <Calendar className="w-10 h-10 text-white" />
                            </motion.div>

                            <div>
                                <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">It's a Date!</h2>
                                <h3 className="text-3xl font-black text-white leading-tight">
                                    {idea.description}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/10">
                                <div className="flex flex-col items-center gap-2">
                                    <Clock className="w-5 h-5 text-accent" />
                                    <span className="text-sm text-slate-300">{idea.duration * 60} mins</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-green-400" />
                                    <span className="text-sm text-slate-300">{idea.cost}</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <Activity className="w-5 h-5 text-pink-400" />
                                    <span className="text-sm text-slate-300">{idea.activityLevel}</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm text-slate-300">
                                        {idea.timeOfDay === 'ANY' ? 'Anytime' : idea.timeOfDay === 'DAY' ? 'Day' : 'Evening'}
                                    </span>
                                </div>
                            </div>

                            {/* AI Recommendations Section */}
                            <div className="space-y-4">
                                {!showAI ? (
                                    <Button
                                        onClick={handleGetAI}
                                        variant="ghost"
                                        className="w-full border border-white/10 hover:bg-white/5 text-slate-300"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                                        Get AI Recommendations
                                    </Button>
                                ) : (
                                    <div className="bg-white/5 rounded-xl p-4 text-left space-y-3 animate-in fade-in slide-in-from-bottom-4">
                                        <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-yellow-400" />
                                            AI Suggestions
                                        </h4>

                                        {isLoadingAI ? (
                                            <div className="flex items-center justify-center py-4 text-slate-400 gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">Thinking...</span>
                                            </div>
                                        ) : (
                                            <ul className="space-y-2">
                                                {recommendations.map((rec, i) => (
                                                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                                                        <span className="text-primary">•</span>
                                                        {rec}
                                                    </li>
                                                ))}
                                                {recommendations.length === 0 && (
                                                    <li className="text-sm text-slate-400 italic">No specific recommendations found.</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button onClick={onClose} variant="secondary" className="w-full">
                                    Close
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
