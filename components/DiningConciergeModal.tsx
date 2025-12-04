"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Utensils, MapPin, Loader2, Sparkles, ExternalLink, Plus, Zap } from "lucide-react";
import { Button } from "./ui/Button";

interface DiningConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
}

export function DiningConciergeModal({ isOpen, onClose, userLocation, onIdeaAdded, onGoTonight }: DiningConciergeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [cuisine, setCuisine] = useState("");
    const [vibe, setVibe] = useState("");
    const [recommendations, setRecommendations] = useState<any[]>([]);

    const handleGetRecommendations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/dining-concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cuisine, vibe, location: userLocation }),
            });

            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations);
            } else {
                alert("Failed to get recommendations. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToJar = async (rec: any) => {
        try {
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: rec.name,
                    details: `${rec.description}\n\nAddress: ${rec.address}\nPrice: ${rec.price}\nWebsite: ${rec.website || 'N/A'}`,
                    indoor: true,
                    duration: "2.0",
                    activityLevel: "LOW",
                    cost: rec.price.length > 2 ? "$$$" : rec.price.length > 1 ? "$$" : "$",
                    timeOfDay: "EVENING",
                    category: "MEAL"
                }),
            });

            if (res.ok) {
                if (onIdeaAdded) onIdeaAdded();
                alert("Added to jar!");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to add to jar.");
        }
    };

    const handleGoTonight = async (rec: any) => {
        const ideaData = {
            description: rec.name,
            details: `${rec.description}\n\nAddress: ${rec.address}\nPrice: ${rec.price}\nWebsite: ${rec.website || 'N/A'}\nHours: ${rec.opening_hours || 'N/A'}`,
            indoor: true,
            duration: 2.0,
            activityLevel: "LOW",
            cost: rec.price.length > 2 ? "$$$" : rec.price.length > 1 ? "$$" : "$",
            timeOfDay: "EVENING",
            category: "MEAL"
        };

        try {
            // Save to DB for history
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...ideaData,
                    selectedAt: new Date().toISOString() // Mark as selected immediately
                }),
            });

            let savedIdea = {};
            if (res.ok) {
                savedIdea = await res.json();
                if (onIdeaAdded) onIdeaAdded(); // Refresh dashboard list
            }

            // Pass rich object to DateReveal
            if (onGoTonight) {
                onGoTonight({
                    ...savedIdea,
                    ...ideaData,
                    website: rec.website,
                    address: rec.address,
                    openingHours: rec.opening_hours,
                    // Ensure ID is present if save failed (fallback)
                    id: (savedIdea as any).id || 'temp-' + Date.now(),
                });
                onClose();
            }

        } catch (error) {
            console.error("Failed to save idea", error);
            // Still proceed with showing the modal even if save fails
            if (onGoTonight) {
                onGoTonight({
                    ...ideaData,
                    website: rec.website,
                    address: rec.address,
                    openingHours: rec.opening_hours,
                    id: 'temp-' + Date.now(),
                });
                onClose();
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-2xl relative max-h-[90vh] flex flex-col"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                    <Utensils className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Dining Concierge</h2>
                                    <p className="text-sm text-slate-400">Find the perfect spot for dinner</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-6 px-7">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Cuisine Preference</label>
                                    <input
                                        type="text"
                                        value={cuisine}
                                        onChange={(e) => setCuisine(e.target.value)}
                                        placeholder="e.g. Italian, Sushi, Tacos..."
                                        className="glass-input w-full px-4 py-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Vibe / Atmosphere</label>
                                    <input
                                        type="text"
                                        value={vibe}
                                        onChange={(e) => setVibe(e.target.value)}
                                        placeholder="e.g. Romantic, Lively, Cozy..."
                                        className="glass-input w-full px-4 py-2"
                                    />
                                </div>
                            </div>

                            <div className="py-2">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        console.log("Find Restaurants clicked");
                                        handleGetRecommendations();
                                    }}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Finding Spots...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> Find Restaurants</>
                                    )}
                                </Button>
                            </div>

                            {recommendations.length > 0 && (
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-lg font-semibold text-white">Top Picks for You</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {recommendations.map((rec, index) => (
                                            <div key={index} className="glass p-4 rounded-xl flex flex-col sm:flex-row gap-4 hover:bg-white/5 transition-colors">
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-white text-lg">{rec.name}</h4>
                                                        <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded text-slate-300">{rec.price}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 mt-1">{rec.description}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1"><Utensils className="w-3 h-3" /> {rec.cuisine}</span>
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {rec.address}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row sm:flex-col gap-2 justify-end">
                                                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rec.name + " " + rec.address)}`, '_blank')}>
                                                        <ExternalLink className="w-4 h-4 mr-1" /> Map
                                                    </Button>
                                                    {rec.website && (
                                                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => window.open(rec.website, '_blank')}>
                                                            <ExternalLink className="w-4 h-4 mr-1" /> Web
                                                        </Button>
                                                    )}
                                                    <Button size="sm" onClick={() => handleAddToJar(rec)} className="text-xs bg-white/10 hover:bg-white/20">
                                                        <Plus className="w-4 h-4 mr-1" /> Add
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleGoTonight(rec)} className="text-xs bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-200 border border-yellow-400/30 hover:bg-yellow-400/30">
                                                        <Zap className="w-4 h-4 mr-1" /> Go Tonight
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
