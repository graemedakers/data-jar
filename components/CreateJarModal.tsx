"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Users, Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CreateJarModalProps {
    isOpen: boolean;
    onClose: () => void;
    hasRomanticJar: boolean;
    isPro: boolean;
    currentJarCount: number;
}

export function CreateJarModal({ isOpen, onClose, hasRomanticJar, isPro, currentJarCount }: CreateJarModalProps) {
    const [name, setName] = useState("");
    // Default to SOCIAL if user already has a romantic jar, otherwise ROMANTIC
    const [type, setType] = useState<"ROMANTIC" | "SOCIAL">(hasRomanticJar ? "SOCIAL" : "ROMANTIC");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const maxJars = isPro ? 50 : 1;
    const isLimitReached = currentJarCount >= maxJars;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/jar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type }),
            });

            if (res.ok) {
                setSuccess(true);
                // Delay reload to show success message
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to create jar");
                setIsLoading(false); // Only stop loading on error
            }
        } catch (error) {
            console.error("Error creating jar:", error);
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <Dialog open={isOpen} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-[425px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                        <span className="text-3xl">🎉</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold mb-2">Jar Created!</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400 mb-6">
                        Setting up your new jar...
                    </DialogDescription>
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </DialogContent>
            </Dialog>
        );
    }

    if (isLimitReached) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <span>Limit Reached</span>
                            <span className="text-2xl">🔒</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400">
                            You have reached the maximum number of Jars for your current plan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 text-center space-y-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Current Usage</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentJarCount} / {maxJars} Jars</p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            To create more jars, please upgrade to Pro or leave an existing jar.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0"
                            onClick={() => {
                                // Close this modal, and let the user find the upgrade button in dashboard 
                                // (or we could trigger a callback to open premium modal)
                                onClose();
                            }}
                        >
                            Got it
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <span>New Jar</span>
                        <span className="text-2xl">✨</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Create a new collection of date ideas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreate} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Jar Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Weekend Adventures, Summer 2024"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                        {error && (
                            <p className="text-sm text-red-400 mt-1">{error}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label>Jar Type</Label>
                        <RadioGroup value={type} onValueChange={(val) => setType(val as "ROMANTIC" | "SOCIAL")} className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="ROMANTIC" id="romantic" className="peer sr-only" disabled={hasRomanticJar} />
                                <Label
                                    htmlFor="romantic"
                                    className={cn(
                                        "flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all h-full text-center hover:bg-slate-100 dark:hover:bg-slate-800/50",
                                        type === 'ROMANTIC'
                                            ? "border-pink-500 bg-pink-500/10 text-slate-900 dark:text-white"
                                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600",
                                        hasRomanticJar && "opacity-50 cursor-not-allowed hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                                    )}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Heart className={cn("w-6 h-6", type === 'ROMANTIC' ? "text-pink-400 fill-pink-400/20" : "text-slate-400")} />
                                        <div>
                                            <div className="font-bold text-lg">Romantic</div>
                                            <div className="text-xs text-slate-400">For you and your partner</div>
                                        </div>
                                        {hasRomanticJar && (
                                            <div className="text-[10px] bg-red-500/20 text-red-200 px-2 py-0.5 rounded-full font-medium mt-1">
                                                Already Exists
                                            </div>
                                        )}
                                    </div>
                                </Label>
                            </div>

                            <div>
                                <RadioGroupItem value="SOCIAL" id="social" className="peer sr-only" />
                                <Label
                                    htmlFor="social"
                                    className={cn(
                                        "flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all h-full text-center hover:bg-slate-100 dark:hover:bg-slate-800/50",
                                        type === 'SOCIAL'
                                            ? "border-blue-500 bg-blue-500/10 text-slate-900 dark:text-white"
                                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600"
                                    )}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className={cn("w-6 h-6", type === 'SOCIAL' ? "text-blue-400 fill-blue-400/20" : "text-slate-400")} />
                                        <div>
                                            <div className="font-bold text-lg">Group</div>
                                            <div className="text-xs text-slate-400">For friends & circle</div>
                                        </div>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={type === 'ROMANTIC' ? "bg-pink-600 hover:bg-pink-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Jar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
