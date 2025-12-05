"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sparkles, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumBannerProps {
    hasPaid: boolean;
    coupleCreatedAt: string;
    isTrialEligible?: boolean;
}

export function PremiumBanner({ hasPaid, coupleCreatedAt, isTrialEligible = true }: PremiumBannerProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [discountCode, setDiscountCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState<number>(0);

    useEffect(() => {
        if (!isTrialEligible) {
            setDaysRemaining(0);
            return;
        }

        if (coupleCreatedAt) {
            const created = new Date(coupleCreatedAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - created.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const remaining = 7 - diffDays;
            setDaysRemaining(remaining > 0 ? remaining : 0);
        }
    }, [coupleCreatedAt, isTrialEligible]);

    if (hasPaid) return null; // Don't show if already paid

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discountCode }),
            });
            const data = await res.json();

            if (data.success) {
                alert(data.message);
                window.location.reload(); // Refresh to update state
            } else if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mb-8">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card relative overflow-hidden p-6 border-yellow-500/30"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 text-yellow-400 font-bold">
                                    <Sparkles className="w-5 h-5" />
                                    <span>
                                        {daysRemaining > 0
                                            ? `Premium Trial Active: ${daysRemaining} days remaining`
                                            : "Premium Trial Expired"}
                                    </span>
                                </div>
                                <p className="text-slate-300 text-sm max-w-xl">
                                    Unlock unlimited AI date ideas, the Dining Concierge, Weekend Planner, and more.
                                    One-time payment for lifetime access.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                {isExpanded ? (
                                    <div className="flex flex-col gap-3 w-full sm:w-auto animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Discount Code"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value)}
                                                className="h-10 bg-black/20 border-white/10 text-sm w-full sm:w-40"
                                            />
                                            <Button
                                                onClick={handleUpgrade}
                                                isLoading={isLoading}
                                                className="h-10 bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white border-none whitespace-nowrap"
                                            >
                                                Pay Now
                                            </Button>
                                        </div>
                                        <button
                                            onClick={() => setIsExpanded(false)}
                                            className="text-xs text-slate-500 hover:text-slate-400 self-end sm:self-center"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => setIsExpanded(true)}
                                        className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white border-none shadow-lg shadow-yellow-500/20"
                                    >
                                        Upgrade to Premium
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
