"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sparkles, Check, ArrowLeft, HeartHandshake, Utensils, Calendar, Wine } from "lucide-react";
import { motion } from "framer-motion";

export default function PremiumPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const data = await res.json();

            if (data.success) {
                alert(data.message);
                router.push('/dashboard');
            } else if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "Something went wrong. Please try again.");
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
            icon: Sparkles,
            title: "Unlimited AI Ideas",
            description: "Surprise Me! generated specifically for you, as many times as you want."
        },
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
            title: "Weekend Planner",
            description: "Full multi-part itineraries for special occasions."
        },
        {
            icon: HeartHandshake,
            title: "Support Changes",
            description: "Help us keep the servers running and developing new features."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-4xl w-full mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="mb-8 text-slate-400 hover:text-white pl-0"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Left Column: Pitch */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            <span>Premium Access</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Upgrade your Date Night
                        </h1>

                        <p className="text-lg text-slate-300 leading-relaxed">
                            Unlock the full power of the Date Jar AI. Get personalized, real-time event suggestions and plan perfect weekends effortlessly.
                        </p>

                        <div className="pt-4">
                            <div className="text-3xl font-bold text-white">
                                AU$2.50 <span className="text-lg text-slate-500 font-normal">/ month</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Cancel anytime.</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                onClick={handleSubscribe}
                                isLoading={isLoading}
                                className="h-12 px-8 bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white border-none shadow-lg shadow-yellow-500/20 text-lg"
                            >
                                Subscribe Now
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Features Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 border-yellow-500/20 bg-slate-800/50 backdrop-blur-xl rounded-3xl"
                    >
                        <h3 className="text-xl font-semibold mb-6 text-white">Everything included:</h3>
                        <ul className="space-y-6">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">{feature.title}</h4>
                                        <p className="text-sm text-slate-400 leading-snug">{feature.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
