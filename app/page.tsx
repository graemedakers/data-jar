"use client";

import { Jar3D } from "@/components/Jar3D";
import { Button } from "@/components/ui/Button";
import { DateReveal } from "@/components/DateReveal";
import { Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isPicking, setIsPicking] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  // Check login status
  React.useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
          router.push('/dashboard'); // Auto-redirect to dashboard
        }
      })
      .catch(err => console.error("Auth check failed:", err));
  }, [router]);

  const handlePickDate = async () => {
    setIsPicking(true);
    // Simulate jar shaking animation time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const res = await fetch("/api/pick-date", { method: "POST" });
      const data = await res.json();
      setSelectedIdea(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      <DateReveal idea={selectedIdea} onClose={() => setSelectedIdea(null)} />

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
            <Heart className="w-5 h-5 text-secondary fill-secondary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Date Jar</span>
        </div>
        {user ? (
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>Dashboard</Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>Login</Button>
        )}
      </motion.header>

      {/* Main Content */}
      <div className="flex flex-col items-center gap-12 z-10 w-full max-w-md">
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight"
          >
            Spice Up<br />Your Relationship
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-lg"
          >
            No more "I don't know, what do you want to do?"
          </motion.p>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
        >
          <Jar3D />
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full"
        >
          <Button
            onClick={() => {
              if (user) {
                router.push('/dashboard');
              } else {
                router.push('/signup');
              }
            }}
            className="w-full text-lg h-14 shadow-2xl shadow-primary/20 group"
          >
            {user ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                Go to Dashboard
              </>
            ) : (
              <>
                Get Started <Sparkles className="w-5 h-5 ml-2 group-hover:animate-spin" />
              </>
            )}
          </Button>
          <div className="mt-4 text-center">
            <a
              href="https://www.youtube.com/watch?v=placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-white underline decoration-dotted transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play-circle"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
              Watch Demo Video
            </a>
          </div>
        </motion.div>
      </div>
    </main >
  );
}
