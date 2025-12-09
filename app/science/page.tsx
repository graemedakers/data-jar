import React from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Heart, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SciencePage() {
    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-primary/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                            <span className="font-bold text-lg text-white tracking-tight">Back to Home</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 center w-full h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-accent mx-auto">
                        <Brain className="w-3 h-3" />
                        <span>The Science of Connection</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 tracking-tight leading-tight">
                        Why Quality Dates <br /> Build Stronger Bonds
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        It’s not just about having fun. Scientific research shows that shared novel experiences are the cornerstone of long-term relationship satisfaction. Here is how Date Jar leverages psychology to bring you closer.
                    </p>
                </div>
            </section>

            {/* Content Blocks */}
            <section className="py-16 px-6 max-w-5xl mx-auto space-y-24">

                {/* 1. Novelty & Dopamine */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">The Self-Expansion Theory</h2>
                        <p className="text-slate-400 leading-relaxed">
                            According to Dr. Arthur Aron’s <strong>Self-Expansion Model</strong>, couples are happiest when they engage in "novel and challenging" activities together.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            When you try something new—like a pottery class or a blind taste test—your brain releases <strong>dopamine</strong> and <strong>norepinephrine</strong>. These are the same neurochemicals present during the early "honeymoon phase" of a relationship.
                        </p>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-sm text-slate-300">
                                <strong>How Date Jar Helps:</strong> Our database is curated to push you out of the "Netflix and Chill" routine, injecting synthesized novelty into your relationship on demand.
                            </p>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 relative aspect-square md:aspect-auto h-full min-h-[300px] rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/10">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-[120px] font-black text-white/5 select-none">NEW</div>
                        </div>
                    </div>
                </div>

                {/* 2. Decision Fatigue */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-square md:aspect-auto h-full min-h-[300px] rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/10 order-1">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-[120px] font-black text-white/5 select-none">PICK</div>
                        </div>
                    </div>
                    <div className="space-y-6 order-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Eliminating Decision Fatigue</h2>
                        <p className="text-slate-400 leading-relaxed">
                            The question <em>"What do you want to do?"</em> is one of the most common sources of low-grade friction in relationships. This is known as <strong>Decision Fatigue</strong>.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            By the end of a work week, your executive functioning is depleted. forcing a partner to plan a date often feels like "work," leading to default behaviors (staying home).
                        </p>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-sm text-slate-300">
                                <strong>How Date Jar Helps:</strong> By externalizing the choice to "The Jar," you remove the burden of choice. The decision becomes a shared, gamified moment rather than a negotiation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Emotional Capital */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Building Emotional Capital</h2>
                        <p className="text-slate-400 leading-relaxed">
                            The <strong>Gottman Institute</strong>, famous for their research on marital stability, emphasizes the importance of a "Love Map" — knowing your partner's inner world.
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            Regular, uninterrupted time together (dates) provides the necessary environment to update these Love Maps. It signals to your partner that they are a priority worthy of your most limited resource: time.
                        </p>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-sm text-slate-300">
                                <strong>How Date Jar Helps:</strong> Our "Surprise Me" feature creates dedicated containers of time where the focus is solely on the experience and each other, preventing relationship drift.
                            </p>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 relative aspect-square md:aspect-auto h-full min-h-[300px] rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-800 to-slate-900 border border-white/10">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-[120px] font-black text-white/5 select-none">LOVE</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Put the Science to Work</h2>
                    <p className="text-lg text-slate-400">
                        You don't need a PhD to have a better relationship. You just need a plan.
                    </p>
                    <Link href="/signup">
                        <Button className="h-14 px-10 text-lg bg-white text-slate-900 hover:bg-slate-200 border-none rounded-full">
                            Start Your Free Trial
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 bg-slate-950">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-slate-600" />
                        <span className="font-bold text-slate-400">Date Jar</span>
                    </div>
                    <p className="text-slate-600 text-sm">
                        © {new Date().getFullYear()} Date Jar. Built for love.
                    </p>
                </div>
            </footer>
        </main>
    );
}
