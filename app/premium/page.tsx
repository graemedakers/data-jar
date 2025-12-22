"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sparkles, Check, ArrowLeft, HeartHandshake, Utensils, Calendar, Wine, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { PRICING } from "@/lib/config";

export default function PremiumPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (priceType: 'price_monthly' | 'price_lifetime') => {
        setIsLoading(true);
        try {
            // In a real app, map these to env vars
            const priceId = priceType === 'price_lifetime'
                ? process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME
                : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                body: JSON.stringify({ priceId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (res.status === 401) {
                // Not logged in
                const returnUrl = encodeURIComponent('/premium');
                router.push(`/login?redirect=${returnUrl}`);
                return;
            }

            const data = await res.json();

            // ...

            if (data.success) {
                alert(data.message);
                router.push('/dashboard');
            } else if (data.url) {
                window.location.href = data.url;
            } else {
                alert(`Error: ${data.error || "Unknown error"}\n${data.details || ""}`);
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: Utensils,
            title: "Dining Concierge",
            description: "Smart restaurant recommendations that exclude places you've already been."
        },
        {
            icon: Wine,
            title: "Bar Scout",
            description: "Find the perfect spot for pre-dinner drinks or a night cap."
        },
        {
            icon: Calendar,
            title: "Date Night Planner",
            description: "Plan your date step-by-step with a custom interactive timeline."
        },
        {
            icon: MapPin,
            title: "Weekend Itineraries",
            description: "Receive a curated list of the best events and activities for your weekend."
        },
        {
            icon: HeartHandshake,
            title: "Support Future Updates",
            description: "Help us keep the servers running and developing new features."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-6xl w-full mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="mb-8 text-slate-400 hover:text-white pl-0"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>

                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
                        Complete Your Toolset
                    </h1>
                    <p className="text-lg text-slate-300">
                        Unlock unlimited jars, AI-powered planning, and more with Decision Jar Pro.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Monthly Subscription */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col relative"
                    >
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Monthly Pro</h3>
                            <p className="text-slate-400">Flexible & Low Cost</p>
                        </div>
                        <div className="mb-8">
                            <span className="text-4xl font-bold text-white">{PRICING.MONTHLY}</span>
                            <span className="text-slate-400">/month</span>
                            <div className="mt-2 inline-block px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full">
                                ✨ {PRICING.TRIAL_DAYS}-Day Free Trial
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-accent shrink-0" />
                                <span>Cancel anytime</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-accent shrink-0" />
                                <span>Unlimited Jars & Members</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-accent shrink-0" />
                                <span>Dining Concierge & Bar Scout</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-accent shrink-0" />
                                <span>Weekend & Date Night Planner</span>
                            </li>
                        </ul>

                        <Button
                            onClick={() => handleSubscribe('price_monthly')} // Replace with valid env logic if needed
                            isLoading={isLoading}
                            className="w-full h-12 bg-white/10 hover:bg-white/20 text-white border-none"
                        >
                            Start 14-Day Free Trial
                        </Button>
                    </motion.div>

                    {/* Lifetime Access */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 rounded-3xl border border-yellow-500/50 flex flex-col relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
                            BEST VALUE
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Lifetime Pro</h3>
                            <p className="text-slate-400">Pay Once, Own Forever</p>
                        </div>
                        <div className="mb-8">
                            <span className="text-4xl font-bold text-white">{PRICING.LIFETIME}</span>
                            <span className="text-slate-400">/one-time</span>
                            <div className="mt-2 text-xs text-yellow-500/80">
                                Equivalent to ~15 months of subscription
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-yellow-500 shrink-0" />
                                <span>No monthly fees ever</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-yellow-500 shrink-0" />
                                <span>Unlimited Jars & Members</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-yellow-500 shrink-0" />
                                <span>All Current & Future AI Features</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-yellow-500 shrink-0" />
                                <span>Support Indie Development ❤️</span>
                            </li>
                        </ul>

                        <Button
                            onClick={() => handleSubscribe('price_lifetime')} // Replace with env logic
                            isLoading={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white border-none shadow-lg shadow-yellow-500/20"
                        >
                            Get Lifetime Access
                        </Button>
                    </motion.div>
                </div>

                <p className="text-center text-slate-500 text-sm mt-12">
                    Secure payment via Stripe. You can restore your purchase or manage your subscription at any time.
                </p>
            </div>
        </div>
    );
}
