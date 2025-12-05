"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteLogModal } from "@/components/DeleteLogModal";
import { X, MapPin, Trash2, History, RefreshCw, UserMinus } from "lucide-react";
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
    const [homeTown, setHomeTown] = useState("");
    const [interests, setInterests] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [hasPartner, setHasPartner] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocation(currentLocation || "");
            // Fetch user settings
            fetch('/api/auth/me')
                .then(res => res.json())
                .then(data => {
                    if (data?.user) {
                        setHomeTown(data.user.homeTown || "");
                        setInterests(data.user.interests || "");
                        setIsCreator(!!data.user.isCreator);
                        setHasPartner(!!data.user.hasPartner);
                    }
                });
        }
    }, [isOpen, currentLocation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Update couple location
            const locRes = await fetch('/api/couple/location', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location }),
                credentials: 'include',
            });

            // Update user settings
            const userRes = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ homeTown, interests }),
                credentials: 'include',
            });

            if (locRes.ok && userRes.ok) {
                onClose();
                router.refresh();
            } else {
                alert("Failed to update settings");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating settings");
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

    const handleRegenerateCode = async () => {
        if (!confirm("Are you sure you want to regenerate your invite code? The old code will stop working.")) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/couple/regenerate-code', {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Success! Your new invite code is: ${data.newCode}`);
                // Refresh to update the code in the dashboard
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Failed to regenerate code: ${data.details || data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error regenerating code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePartner = async () => {
        if (!confirm("Are you sure you want to delete your partner? This will remove them from the couple, delete ALL ideas they created, and delete ALL history of past dates. This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/couple/delete-partner', {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                onClose();
                router.refresh();
                window.location.reload();
            } else {
                const data = await res.json();
                alert(`Failed to delete partner: ${data.details || data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting partner");
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
                            className="glass-card w-full max-w-md relative max-h-[90vh] overflow-y-auto"
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
                                    <label className="text-sm font-medium text-slate-300 ml-1">Couple Location</label>
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. New York, NY"
                                        required
                                    />
                                    <p className="text-xs text-slate-400 ml-1">
                                        Used as the default location for date spots.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Your Home Town</label>
                                    <Input
                                        value={homeTown}
                                        onChange={(e) => setHomeTown(e.target.value)}
                                        placeholder="e.g. Brooklyn, NY"
                                    />
                                    <p className="text-xs text-slate-400 ml-1">
                                        Your specific area. Used to refine searches.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Your Interests</label>
                                    <Input
                                        value={interests}
                                        onChange={(e) => setInterests(e.target.value)}
                                        placeholder="e.g. Hiking, Sushi, Jazz, Art"
                                    />
                                    <p className="text-xs text-slate-400 ml-1">
                                        Comma separated. Used to personalize AI suggestions.
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" isLoading={isLoading}>
                                    Save Changes
                                </Button>
                            </form>

                            {isCreator && (
                                <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                                    <h3 className="text-sm font-bold text-white mb-2">Manage Partner</h3>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full justify-start text-slate-300 hover:text-white"
                                        onClick={handleRegenerateCode}
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Regenerate Invite Code
                                    </Button>
                                    <p className="text-xs text-slate-400 ml-1">
                                        Create a new invite code if you need to share it again or invalidate the old one.
                                    </p>
                                </div>
                            )}

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

                            {isCreator && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                                        <Trash2 className="w-4 h-4" />
                                        Danger Zone
                                    </h3>
                                    <div className="space-y-4">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                            onClick={handleEmptyJar}
                                            disabled={isLoading}
                                        >
                                            Empty Jar (Delete All Ideas)
                                        </Button>

                                        {hasPartner && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                onClick={handleDeletePartner}
                                                disabled={isLoading}
                                            >
                                                <UserMinus className="w-4 h-4 mr-2" />
                                                Delete Partner
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 text-center">
                                        These actions are irreversible.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <DeleteLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
        </>
    );
}
