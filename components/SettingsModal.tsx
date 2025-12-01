"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteLogModal } from "@/components/DeleteLogModal";
import { X, MapPin, Trash2, History } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation?: string;
}

export function SettingsModal({ isOpen, onClose, currentLocation }: SettingsModalProps) {
    const router = useRouter();
    const [location, setLocation] = useState(currentLocation || "");
    const [isLoading, setIsLoading] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocation(currentLocation || "");
        }
    }, [isOpen, currentLocation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/couple/location', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location }),
                credentials: 'include',
            });

            if (res.ok) {
                onClose();
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Failed to update location: ${data.details || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error updating location");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmptyJar = async () => {
        if (!confirm("Are you sure you want to empty the jar? This will delete ALL ideas, including your history of past dates. This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/couple/reset-jar', {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                onClose();
                router.refresh();
                // Force a hard reload to ensure ideas list is cleared if router.refresh() is insufficient
                window.location.reload();
            } else {
                const data = await res.json();
                alert(`Failed to empty jar: ${data.details || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error emptying jar");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card w-full max-w-md relative"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-primary" />
                                Settings
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Your Location</label>
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. New York, NY"
                                        required
                                    />
                                    <p className="text-xs text-slate-400 ml-1">
                                        Used to find nearby date spots.
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" isLoading={isLoading}>
                                    Save Changes
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full justify-start text-slate-300 hover:text-white"
                                    onClick={() => setIsLogModalOpen(true)}
                                >
                                    <History className="w-4 h-4 mr-2" />
                                    View Deletion History
                                </Button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Danger Zone
                                </h3>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    onClick={handleEmptyJar}
                                    disabled={isLoading}
                                >
                                    Empty Jar (Delete All Ideas)
                                </Button>
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    This will remove ALL ideas, including past dates history.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <DeleteLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
        </>
    );
}
