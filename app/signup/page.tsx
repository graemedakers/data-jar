"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Lock, Mail, User, Users, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteCode = searchParams.get("code");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const location = formData.get("location") as string;


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            setIsLoading(false);
            return;
        }



        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    inviteCode,
                    location
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    router.push("/");
                }
            } else {
                alert(data.error || "Signup failed");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md mb-4"
                >
                    <Users className="w-8 h-8 text-accent fill-accent" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    {inviteCode ? "Join Your Partner" : "Create Account"}
                </h1>
                <p className="text-slate-400">
                    {inviteCode ? "Enter your details to connect" : "Start your journey together"}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Your Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            className="pl-12"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-12"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-12"
                            required
                        />
                    </div>
                </div>

                {!inviteCode && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Your Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                name="location"
                                type="text"
                                placeholder="e.g. New York, NY"
                                className="pl-12"
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-400 ml-1">Used to find date spots near you.</p>
                    </div>
                )}



                <Button
                    type="submit"
                    className="w-full h-12 text-lg shadow-lg shadow-accent/25 mt-4"
                    isLoading={isLoading}
                >
                    {inviteCode ? "Join Jar" : "Get Started"} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-accent hover:text-accent/80 font-bold transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                    <SignupForm />
                </Suspense>
            </motion.div>
        </main>
    );
}
