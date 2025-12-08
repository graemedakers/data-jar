"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Jar3D() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="relative w-64 h-80 mx-auto perspective-1000" />;
    }

    return (
        <div className="relative w-80 h-80 mx-auto perspective-1000">
            {/* Glow underneath */}
            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-64 h-16 bg-primary/20 blur-3xl rounded-full" />

            {/* Jar Image */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative w-full h-full flex items-center justify-center pt-8"
            >
                <Image
                    src="/jar-3d.png"
                    alt="Date Jar"
                    fill
                    className="object-contain drop-shadow-2xl mix-blend-lighten"
                    sizes="(max-width: 768px) 100vw, 320px"
                    priority
                />
            </motion.div>
        </div>
    );
}
