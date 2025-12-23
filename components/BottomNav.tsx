"use client";

import { Home, Layers, Compass, History } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function BottomNav() {
    const pathname = usePathname();
    const [hasActiveJar, setHasActiveJar] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data?.user?.activeJarId) {
                        setHasActiveJar(true);
                    }
                }
            } catch (e) {
                // ignore
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();
    }, []);

    const tabs = [
        { name: "Jar", href: "/dashboard", icon: Home },
        { name: "List", href: "/jar", icon: Layers, hidden: !hasActiveJar }, // Hide List if no jar
        { name: "Explore", href: "/explore", icon: Compass },
        { name: "Memories", href: "/memories", icon: History },
    ];

    // Hide on landing page
    if (pathname === "/") return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 z-50 md:hidden safe-area-pb">
            <div className="flex items-center justify-around p-3">
                {tabs.map((tab) => {
                    if (tab.hidden) return null;
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${isActive ? "text-pink-400" : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <tab.icon className={`w-6 h-6 ${isActive ? "fill-pink-400/20" : ""}`} />
                            <span className="text-[10px] font-medium">{tab.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
