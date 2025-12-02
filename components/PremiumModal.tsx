"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Sparkles, Check } from "lucide-react";
import { useState } from "react";

import { useRouter } from "next/navigation";

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export function PremiumModal({ isOpen, onClose, title, description }: PremiumModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Failed to start checkout");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-md relative overflow-hidden border-primary/50 shadow-2xl shadow-primary/20"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-spin-slow pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8 flex flex-col items-center text-center relative z-10">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                                <Lock className="w-8 h-8 text-white" />
                            </div>

                            <h2 className="text-3xl font-black text-white mb-2">{title || "Unlock Premium"}</h2>
                            <p className="text-slate-300 mb-8">
                                {description || "Upgrade to access exclusive features like AI suggestions and Weekend Planner."}
                            </p>

                            <div className="space-y-4 w-full mb-8 text-left bg-white/5 p-6 rounded-xl border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-1 bg-green-500/20 rounded-full">
                                        <Check className="w-4 h-4 text-green-400" />
                                    </div>
                                    <span className="text-white font-medium">AI "Surprise Me" Ideas</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-1 bg-green-500/20 rounded-full">
                                        <Check className="w-4 h-4 text-green-400" />
                                    </div>
                                    <span className="text-white font-medium">Weekend Planner</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-1 bg-green-500/20 rounded-full">
                                        <Check className="w-4 h-4 text-green-400" />
                                    </div>
                                    <span className="text-white font-medium">Support Future Updates</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleUpgrade}
                                isLoading={isLoading}
                                className="w-full text-lg h-14 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Activate for $5
                            </Button>
                            <p className="text-xs text-slate-500 mt-4 mb-2">
                                One-time payment per couple. No monthly fees.
                            </p>
                            <button
                                onClick={onClose}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </motion.div>
                </div >
            )
            }
        </AnimatePresence >
    );
}
