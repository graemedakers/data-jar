"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Jar3D() {
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

    useEffect(() => {
        setMounted(true);
        // Generate random particles
        const colors = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b"];
        const newParticles = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 80 + 10, // 10% to 90%
            y: Math.random() * 80 + 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 5,
        }));
        setParticles(newParticles);
    }, []);

    if (!mounted) {
        return <div className="relative w-64 h-80 mx-auto perspective-1000" />;
    }

    return (
        <div className="relative w-64 h-80 mx-auto perspective-1000">
            {/* Jar Body */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative w-full h-full"
            >
                {/* Glass Container */}
                <div className="absolute inset-0 rounded-[3rem] border-4 border-white/20 bg-white/5 backdrop-blur-sm shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden z-10">
                    {/* Reflections */}
                    <div className="absolute top-4 left-4 w-8 h-20 rounded-full bg-gradient-to-b from-white/20 to-transparent blur-md" />
                    <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-primary/20 blur-xl" />

                    {/* Floating Particles (Date Ideas) */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            className="absolute w-8 h-8 rounded-lg shadow-lg"
                            style={{
                                backgroundColor: p.color,
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                boxShadow: `0 0 15px ${p.color}`
                            }}
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 180, 360],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 2,
                                repeat: Infinity,
                                delay: p.delay,
                                ease: "easeInOut",
                            }}
                        >
                            {/* Star shape or Folded Paper look */}
                            <div className="w-full h-full bg-white/30 skew-x-12" />
                        </motion.div>
                    ))}
                </div>

                {/* Jar Lid */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg border-b-4 border-slate-900 shadow-xl z-20">
                    <div className="absolute inset-0 bg-white/5 rounded-lg" />
                </div>

                {/* Jar Neck */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-8 bg-white/5 backdrop-blur-md border-x-2 border-white/10 z-10" />
            </motion.div>

            {/* Glow underneath */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-10 bg-primary/30 blur-3xl rounded-full" />
        </div>
    );
}
