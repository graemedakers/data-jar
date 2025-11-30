"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RateDateModalProps {
    isOpen: boolean;
    onClose: () => void;
    idea: any;
}

export function RateDateModal({ isOpen, onClose, idea }: RateDateModalProps) {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (idea) {
            setRating(idea.rating || 0);
            setNotes(idea.notes || "");
        }
    }, [idea]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`/api/ideas/${idea.id}/rate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, notes }),
                credentials: 'include',
            });

            if (res.ok) {
                onClose();
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Failed to save rating: ${data.details || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error saving rating");
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
                        className="glass-card w-full max-w-md relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">Rate your Date</h2>
                        <p className="text-slate-300 mb-6 font-medium text-lg">"{idea?.description}"</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 text-center">
                                <label className="text-sm font-medium text-slate-400">How was it?</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Private Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="What did you love? What would you do differently?"
                                    className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 resize-none"
                                />
                            </div>

                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Memories
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
