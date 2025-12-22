"use client";

import { HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { HelpModal } from "@/components/HelpModal";
import { Button } from "@/components/ui/Button";

export function HelpButton() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [section, setSection] = useState("intro");

    useEffect(() => {
        // Map routes to help sections
        if (pathname === "/dashboard") setSection("dashboard");
        else if (pathname === "/signup" || pathname === "/login") setSection("getting-started");
        else if (pathname === "/settings") setSection("settings");
        else setSection("intro");
    }, [pathname]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full shadow-lg transition-all hover:scale-110 group hidden md:block"
                title="Help & Manual"
            >
                <HelpCircle className="w-6 h-6 text-slate-300 group-hover:text-white" />
            </button>

            <HelpModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                initialSection={section}
            />
        </>
    );
}
