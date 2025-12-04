import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, DollarSign, Activity, Sparkles, Loader2, MapPin, ExternalLink, Star, Utensils } from "lucide-react";
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
    // Optional fields for Dining Concierge
    website?: string;
    address?: string;
    openingHours?: string;
    googleRating?: number;
    details?: string;
}

interface DateRevealProps {
    idea: Idea | null;
    onClose: () => void;
    userLocation?: string;
    onFindDining?: (location: string) => void;
}

export function DateReveal({ idea, onClose, userLocation, onFindDining }: DateRevealProps) {
    const [recommendations, setRecommendations] = useState<any[]>([]);
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

                            {/* Dining Details Section */}
                            {(idea.website || idea.address || idea.openingHours) && (
                                <div className="bg-white/5 rounded-xl p-4 space-y-3 text-left">
                                    {idea.address && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white/10 rounded-full shrink-0">
                                                <MapPin className="w-4 h-4 text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium uppercase">Address</p>
                                                <p className="text-sm text-white">{idea.address}</p>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(idea.description + " " + idea.address)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-secondary hover:underline mt-1 inline-block"
                                                >
                                                    View on Google Maps
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {idea.openingHours && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white/10 rounded-full shrink-0">
                                                <Clock className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium uppercase">Opening Hours</p>
                                                <p className="text-sm text-white">{idea.openingHours}</p>
                                            </div>
                                        </div>
                                    )}

                                    {idea.googleRating && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white/10 rounded-full shrink-0">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium uppercase">Google Rating</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-white font-bold">{idea.googleRating} / 5</p>
                                                    <a
                                                        href={`https://www.google.com/search?q=${encodeURIComponent(idea.description + " " + (idea.address || "") + " reviews")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-400 hover:underline"
                                                    >
                                                        Read Reviews
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {idea.website && (
                                        <Button
                                            onClick={() => window.open(idea.website, '_blank')}
                                            className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Make Reservation / Visit Website
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Only show categories and AI if it's NOT a dining concierge result (i.e. no address/website) */}
                            {!(idea.website || idea.address || idea.openingHours) && (
                                <>
                                    {/* Idea Details */}
                                    <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-left">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-secondary" />
                                            The Plan
                                        </h4>
                                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                                            {idea.details ? (
                                                idea.details.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                                                    part.match(/https?:\/\/[^\s]+/) ? (
                                                        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all">
                                                            {part}
                                                        </a>
                                                    ) : part
                                                ))
                                            ) : "No specific details provided. Be spontaneous!"}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                                {idea.duration * 60} mins
                                            </span>
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                                {idea.cost}
                                            </span>
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                                {idea.indoor ? 'Indoor' : 'Outdoor'}
                                            </span>
                                        </div>

                                        {onFindDining && (
                                            <Button
                                                onClick={() => onFindDining(idea.description)}
                                                variant="ghost"
                                                className="w-full mt-4 border border-white/10 hover:bg-white/5 text-orange-300 hover:text-orange-200"
                                            >
                                                <Utensils className="w-4 h-4 mr-2" />
                                                Find food nearby
                                            </Button>
                                        )}
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
                                                Find Specific Places & Tickets
                                            </Button>
                                        ) : (
                                            <div className="bg-white/5 rounded-xl p-4 text-left space-y-3 animate-in fade-in slide-in-from-bottom-4">
                                                <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-yellow-400" />
                                                    Suggested Places
                                                </h4>

                                                {isLoadingAI ? (
                                                    <div className="flex items-center justify-center py-4 text-slate-400 gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span className="text-sm">Scouting locations...</span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {recommendations.map((rec: any, i) => (
                                                            <div key={i} className="bg-black/20 p-3 rounded-lg border border-white/5 hover:bg-black/30 transition-colors">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <div>
                                                                        <h5 className="font-medium text-white text-sm">{rec.title}</h5>
                                                                        <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                                                                    </div>
                                                                    {rec.url && (
                                                                        <a
                                                                            href={rec.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-secondary transition-colors"
                                                                            title="View Info / Tickets"
                                                                        >
                                                                            <ExternalLink className="w-3 h-3" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {recommendations.length === 0 && (
                                                            <p className="text-sm text-slate-400 italic">No specific places found. Try a Google search!</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

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
