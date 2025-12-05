"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Clock, Activity, DollarSign, Home, Trees, Sparkles, Loader2, Lock, Utensils, Calendar, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface AddIdeaModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any; // If provided, we are in "Edit" mode
    isPremium?: boolean;
    onUpgrade?: () => void;
}

export function AddIdeaModal({ isOpen, onClose, initialData, isPremium, onUpgrade }: AddIdeaModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [formData, setFormData] = useState({
        description: "",
        details: "",
        indoor: true,
        duration: "0.5",
        activityLevel: "MEDIUM",
        cost: "$",
        timeOfDay: "ANY",
        category: "ACTIVITY",
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    description: initialData.description,
                    details: initialData.details || "",
                    indoor: initialData.indoor,
                    duration: Number.isInteger(initialData.duration) ? `${initialData.duration}.0` : String(initialData.duration),
                    activityLevel: initialData.activityLevel,
                    cost: initialData.cost,
                    timeOfDay: initialData.timeOfDay || "ANY",
                    category: initialData.category || "ACTIVITY",
                });
            } else {
                setFormData({
                    description: "",
                    details: "",
                    indoor: true,
                    duration: "0.5",
                    activityLevel: "MEDIUM",
                    cost: "$",
                    timeOfDay: "ANY",
                    category: "ACTIVITY",
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSurpriseMe = async () => {
        setIsGeneratingAI(true);
        try {
            const res = await fetch('/api/ai-random-idea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: formData.category,
                    duration: formData.duration,
                    // We can optionally send other fields if we want the AI to respect them too,
                    // but the user specifically asked for category.
                    // Let's send them as "preferences" if they are not default?
                    // For now, just category is the main request.
                })
            });
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    description: data.description,
                    details: (data.details || "") + (data.url ? `\n\nMore Info: ${data.url}` : ""), // Populate details from AI
                    indoor: data.indoor,
                    duration: String(data.duration),
                    activityLevel: data.activityLevel,
                    cost: data.cost,
                    timeOfDay: data.timeOfDay,
                    category: data.category || formData.category || "ACTIVITY",
                });
            } else {
                const errorData = await res.json();
                alert(`Failed to generate idea: ${errorData.details || "Unknown error"}`);
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Error generating idea. Check console for details.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // If initialData has an ID, we are editing. Otherwise we are creating (duplicating).
            const isEditing = initialData && initialData.id;
            const url = isEditing ? `/api/ideas/${initialData.id}` : "/api/ideas";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (res.ok) {
                onClose();
            } else {
                alert("Failed to save idea");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving idea");
        } finally {
            setIsLoading(false);
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
                        className="glass-card w-full max-w-lg relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">
                            {initialData && initialData.id ? "Edit Idea" : initialData ? "Duplicate Idea" : "Add New Idea"}
                        </h2>

                        <div className="max-h-[85vh] overflow-y-auto px-4 pb-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Category</label>
                                    <div className="flex bg-black/20 rounded-xl p-1 border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: 'ACTIVITY' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${formData.category === 'ACTIVITY' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                                        >
                                            <Activity className="w-4 h-4" /> Activity
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: 'MEAL' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${formData.category === 'MEAL' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                                        >
                                            <Utensils className="w-4 h-4" /> Meal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: 'EVENT' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${formData.category === 'EVENT' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                                        >
                                            <Calendar className="w-4 h-4" /> Event
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">
                                        {formData.category === 'MEAL' ? "Meal Idea" : formData.category === 'EVENT' ? "Event Name" : "Activity Description"}
                                    </label>
                                    <Input
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder={
                                            formData.category === 'MEAL' ? "e.g. Try that new Italian place downtown" :
                                                formData.category === 'EVENT' ? "e.g. Jazz in the Park" :
                                                    "e.g. Build a blanket fort"
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Details (Optional)</label>
                                        {formData.details.match(/https?:\/\/[^\s]+/) && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 px-2"
                                                onClick={() => {
                                                    const match = formData.details.match(/https?:\/\/[^\s]+/);
                                                    if (match) window.open(match[0], '_blank');
                                                }}
                                            >
                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                Visit Website
                                            </Button>
                                        )}
                                    </div>
                                    <textarea
                                        value={formData.details}
                                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                        placeholder="Add more info, e.g. what to bring, specific location..."
                                        className="glass-input w-full min-h-[80px] py-2 px-3 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Setting</label>
                                        <div className="flex bg-black/20 rounded-xl p-1 border border-white/10">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, indoor: true })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${formData.indoor ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"
                                                    }`}
                                            >
                                                <Home className="w-4 h-4" /> Indoor
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, indoor: false })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${!formData.indoor ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"
                                                    }`}
                                            >
                                                <Trees className="w-4 h-4" /> Outdoor
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Duration</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className="glass-input pl-10 appearance-none cursor-pointer w-full"
                                            >
                                                <option value="0.25">15 mins</option>
                                                <option value="0.5">30 mins</option>
                                                <option value="1.0">1 hour</option>
                                                <option value="2.0">2 hours</option>
                                                <option value="4.0">Half Day</option>
                                                <option value="8.0">Full Day</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Cost</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                value={formData.cost}
                                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                                className="glass-input pl-10 appearance-none cursor-pointer w-full"
                                            >
                                                <option value="FREE">Free</option>
                                                <option value="$">$ (Cheap)</option>
                                                <option value="$$">$$ (Moderate)</option>
                                                <option value="$$$">$$$ (Expensive)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Energy</label>
                                        <div className="relative">
                                            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                value={formData.activityLevel}
                                                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                                                className="glass-input pl-10 appearance-none cursor-pointer w-full"
                                            >
                                                <option value="LOW">Chill</option>
                                                <option value="MEDIUM">Moderate</option>
                                                <option value="HIGH">Active</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Time of Day</label>
                                    <div className="flex bg-black/20 rounded-xl p-1 border border-white/10">
                                        {['ANY', 'DAY', 'EVENING'].map((time) => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, timeOfDay: time })}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.timeOfDay === time
                                                    ? "bg-secondary text-white shadow-lg"
                                                    : "text-slate-400 hover:text-white"
                                                    }`}
                                            >
                                                {time === 'ANY' ? 'Anytime' : time === 'DAY' ? 'Day' : 'Evening'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="flex-1 relative overflow-hidden py-3"
                                        onClick={() => {
                                            if (!isPremium && onUpgrade) {
                                                onUpgrade();
                                            } else {
                                                handleSurpriseMe();
                                            }
                                        }}
                                        disabled={isLoading || isGeneratingAI}
                                    >
                                        {isGeneratingAI ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {!isPremium && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] z-10">
                                                        <Lock className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col items-center leading-none py-1">
                                                    <div className="flex items-center">
                                                        <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                                                        <span>Surprise {formData.category.charAt(0) + formData.category.slice(1).toLowerCase()}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </Button>
                                    <button
                                        type="submit"
                                        className="flex-[2] inline-flex items-center justify-center transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none glass-button px-8 py-3 text-base"
                                        disabled={isLoading || isGeneratingAI}
                                    >
                                        {isLoading ? (
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : null}
                                        {initialData && initialData.id ? "Save Changes" : <><Plus className="w-5 h-5 mr-2" /> Add to Jar</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
