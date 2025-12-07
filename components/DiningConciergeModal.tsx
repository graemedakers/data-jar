"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Utensils, MapPin, Loader2, Sparkles, ExternalLink, Plus, Zap, Star, Heart } from "lucide-react";
import { Button } from "./ui/Button";

interface DiningConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
}

export function DiningConciergeModal({ isOpen, onClose, userLocation, onIdeaAdded, onGoTonight, onFavoriteUpdated }: DiningConciergeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [location, setLocation] = useState(userLocation || "");
    const [price, setPrice] = useState("any");
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Constants for selection options
    const CUISINE_OPTIONS = [
        "Italian", "Japanese", "Mexican", "Thai", "Indian", "Chinese",
        "Australian", "Burgers", "Pizza", "Seafood", "Steak", "Vegan", "Dessert", "Breakfast / Cafe", "Coffee"
    ];

    const VIBE_OPTIONS = [
        "Romantic", "Casual", "Lively", "Cozy", "Upscale", "Hidden Gem",
        "Outdoor", "Quiet", "Trendy", "Kid Friendly", "Late Night", "Live Music"
    ];

    // Using a ref to track if we have initialized for this open session
    const [prevOpen, setPrevOpen] = useState(false);

    if (isOpen && !prevOpen) {
        setLocation(userLocation || "");
        setSelectedCuisines([]);
        setSelectedVibes([]);
        setRecommendations([]);
        setPrevOpen(true);
    } else if (!isOpen && prevOpen) {
        setPrevOpen(false);
    }

    useEffect(() => {
        if (recommendations.length > 0 && resultsRef.current) {
            // Small timeout to ensure DOM is ready
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [recommendations]);

    const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleGetRecommendations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/dining-concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cuisine: selectedCuisines.join(", "),
                    vibe: selectedVibes.join(", "),
                    location,
                    price
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations);
            } else {
                const errorData = await res.json().catch(() => ({}));
                const errorMessage = errorData.error || "Failed to get recommendations.";
                const errorDetails = errorData.details ? `\n\nDetails: ${errorData.details}` : "";
                alert(errorMessage + errorDetails);
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
            details: `${rec.description}\n\nAddress: ${rec.address}\nPrice: ${rec.price}\nWebsite: ${rec.website || 'N/A'}\nHours: ${rec.opening_hours || 'N/A'}\nRating: ${rec.google_rating || 'N/A'}`,
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
                    googleRating: rec.google_rating,
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
                    googleRating: rec.google_rating,
                    id: 'temp-' + Date.now(),
                });
                onClose();
            }
        }
    };

    const handleFavorite = async (rec: any) => {
        try {
            if (rec.isFavorite) {
                // Remove favorite
                const res = await fetch(`/api/favorites?name=${encodeURIComponent(rec.name)}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setRecommendations(prev => prev.map(item =>
                        item.name === rec.name ? { ...item, isFavorite: false } : item
                    ));
                    if (onFavoriteUpdated) onFavoriteUpdated();
                } else {
                    alert("Failed to remove favorite.");
                }
            } else {
                // Add favorite
                const res = await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: rec.name,
                        address: rec.address,
                        description: rec.description,
                        websiteUrl: rec.website,
                        googleRating: rec.google_rating,
                        type: "RESTAURANT"
                    }),
                });

                if (res.ok) {
                    setRecommendations(prev => prev.map(item =>
                        item.name === rec.name ? { ...item, isFavorite: true } : item
                    ));
                    if (onFavoriteUpdated) onFavoriteUpdated();
                } else {
                    alert("Failed to save favorite.");
                }
            }
        } catch (error) {
            console.error(error);
            alert("Error updating favorite.");
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
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Location to Search</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Current location, Neighborhood, or City"
                                            className="glass-input w-full pl-9 pr-4 py-2"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Edit this to search in a specific area.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Cuisine Preference (Select multiple)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CUISINE_OPTIONS.map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => toggleSelection(c, selectedCuisines, setSelectedCuisines)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCuisines.includes(c)
                                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                                        }`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Vibe / Atmosphere (Select multiple)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {VIBE_OPTIONS.map((v) => (
                                                <button
                                                    key={v}
                                                    onClick={() => toggleSelection(v, selectedVibes, setSelectedVibes)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedVibes.includes(v)
                                                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                                        }`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Price Range</label>
                                    <div className="flex gap-2">
                                        {['any', 'cheap', 'moderate', 'expensive'].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPrice(p)}
                                                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${price === p
                                                    ? 'bg-orange-500/20 border-orange-500 text-orange-200'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {p === 'any' ? 'Any' : p.charAt(0).toUpperCase() + p.slice(1)} {p !== 'any' && `(${p === 'cheap' ? '$' : p === 'moderate' ? '$$' : '$$$'})`}
                                            </button>
                                        ))}
                                    </div>
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
                                <div ref={resultsRef} className="space-y-4 pt-4">
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
                                                        {rec.google_rating && (
                                                            <span className="flex items-center gap-1 text-yellow-400">
                                                                <Star className="w-3 h-3 fill-yellow-400" /> {rec.google_rating}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {rec.google_rating && (
                                                        <button
                                                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(rec.name + " " + rec.address + " reviews")}`, '_blank')}
                                                            className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 text-left"
                                                        >
                                                            Read Google Reviews
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap sm:flex-col gap-2 justify-start sm:justify-end">
                                                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rec.name + " " + rec.address)}`, '_blank')}>
                                                        <ExternalLink className="w-4 h-4 mr-1" /> Map
                                                    </Button>
                                                    {rec.website && (
                                                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => window.open(rec.website, '_blank')}>
                                                            <ExternalLink className="w-4 h-4 mr-1" /> Web
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleFavorite(rec)}
                                                        className={`text-xs ${rec.isFavorite
                                                            ? 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30'
                                                            : 'bg-white/10 hover:bg-white/20 text-pink-400'}`}
                                                    >
                                                        <Heart className={`w-4 h-4 mr-1 ${rec.isFavorite ? 'fill-current' : ''}`} />
                                                        {rec.isFavorite ? 'Saved' : 'Save'}
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleAddToJar(rec)} className="text-xs bg-white/10 hover:bg-white/20">
                                                        <Plus className="w-4 h-4 mr-1" /> Jar
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
