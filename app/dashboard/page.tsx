"use client";

import { Button } from "@/components/ui/Button";
import { AddIdeaModal } from "@/components/AddIdeaModal";
import { motion } from "framer-motion";
import { Plus, Settings, LogOut, Sparkles, Lock, Trash2, Copy, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Jar3D } from "@/components/Jar3D";
import { useRouter } from "next/navigation";
import { DateReveal } from "@/components/DateReveal";
import { SpinFiltersModal } from "@/components/SpinFiltersModal";
import { SettingsModal } from "@/components/SettingsModal";
import { WeekendPlannerModal } from "@/components/WeekendPlannerModal";

import { Check, Star } from "lucide-react";
import { RateDateModal } from "@/components/RateDateModal";
import { PremiumModal } from "@/components/PremiumModal";

function InviteCodeDisplay({ mobile }: { mobile?: boolean }) {
    const [code, setCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data?.user?.coupleReferenceCode) {
                    setCode(data.user.coupleReferenceCode);
                }
            });
    }, []);

    const copyToClipboard = () => {
        if (!code) return;
        const url = `${window.location.origin}/signup?code=${code}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!code) return null;

    if (mobile) {
        return (
            <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 active:scale-95 transition-all"
            >
                <span className="text-xs text-slate-400">Invite Partner:</span>
                <span className="text-sm font-mono text-white font-bold">{code}</span>
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>
        );
    }

    return (
        <button onClick={copyToClipboard} className="flex items-center gap-2 hover:text-white transition-colors group" title="Click to copy invite link">
            <span>{code}</span>
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-500 group-hover:text-white" />}
        </button>
    );
}

export default function DashboardPage() {
    const [ideas, setIdeas] = useState<any[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingIdea, setEditingIdea] = useState<any>(null);
    const [ratingIdea, setRatingIdea] = useState<any>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const router = useRouter();

    const fetchIdeas = async () => {
        try {
            const res = await fetch('/api/ideas', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setIdeas(data);
            }
        } catch (error) {
            console.error('Failed to fetch ideas', error);
        }
    };

    useEffect(() => {
        fetchIdeas();
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data?.user) {
                    if (data.user.location) setUserLocation(data.user.location);
                    const userIsPremium = !!data.user.isPremium;
                    setIsPremium(userIsPremium);
                }
            })
            .finally(() => {
                setIsLoadingUser(false);
            });
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    const handleSpinJar = async (filters: { maxDuration?: number; maxCost?: string; maxActivityLevel?: string; timeOfDay?: string } = {}) => {
        if (ideas.length === 0) {
            alert("Add some ideas first!");
            return;
        }
        setIsSpinning(true);
        // Simulate animation
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const res = await fetch('/api/pick-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters),
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedIdea(data);
                fetchIdeas(); // Refresh to show idea as used (removed from list)
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to pick a date. Try adding more ideas!");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSpinning(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this idea?")) return;

        try {
            const res = await fetch(`/api/ideas/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                fetchIdeas();
            } else {
                alert("Failed to delete idea");
            }
        } catch (error) {
            console.error("Error deleting idea:", error);
        }
    };

    const handleDuplicate = (idea: any) => {
        // Create a copy of the idea without the ID, so the modal treats it as a new entry
        const { id, selectedAt, selectedDate, createdBy, createdAt, updatedAt, ...ideaData } = idea;
        setEditingIdea(ideaData);
    };

    const handleAddIdeaClick = () => {
        setIsModalOpen(true);
    };

    const availableIdeasCount = ideas.filter(i => !i.selectedAt).length;

    return (
        <main className="min-h-screen p-4 md:p-6 pb-24 relative overflow-hidden">
            <PremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
            />

            <AddIdeaModal
                isOpen={isModalOpen || !!editingIdea}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingIdea(null);
                    fetchIdeas(); // Refresh list after adding
                }}
                initialData={editingIdea}
                isPremium={isPremium}
                onUpgrade={() => {
                    setIsModalOpen(false);
                    setIsPremiumModalOpen(true);
                }}
            />

            <SpinFiltersModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onSpin={handleSpinJar}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => {
                    setIsSettingsModalOpen(false);
                    // Refresh location
                    fetch('/api/auth/me')
                        .then(res => res.json())
                        .then(data => {
                            if (data?.user?.location) {
                                setUserLocation(data.user.location);
                            }
                        });
                }}
                currentLocation={userLocation ?? undefined}
            />

            <WeekendPlannerModal
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                userLocation={userLocation ?? undefined}
                onIdeaAdded={fetchIdeas}
            />

            <RateDateModal
                isOpen={!!ratingIdea}
                onClose={() => {
                    setRatingIdea(null);
                    fetchIdeas();
                }}
                idea={ratingIdea}
            />

            <DateReveal idea={selectedIdea} onClose={() => setSelectedIdea(null)} userLocation={userLocation ?? undefined} />

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
                <div>
                    <h1 className="text-2xl font-bold text-white">Your Jar</h1>
                    <p className="text-slate-400 text-sm">Manage your date ideas</p>
                </div>
                <div className="flex gap-2 items-center w-full md:w-auto justify-between md:justify-end">
                    {/* Invite Code Badge */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                        <span className="text-xs text-slate-400">Invite Code:</span>
                        <span className="text-xs font-mono text-white select-all">
                            {/* We need to fetch this from the user object */}
                            <InviteCodeDisplay />
                        </span>
                    </div>

                    {/* Mobile Invite Code Button (Icon only) */}
                    <div className="md:hidden">
                        <InviteCodeDisplay mobile />
                    </div>

                    {!isLoadingUser && !isPremium && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-200 border-yellow-400/30 hover:bg-yellow-400/30"
                            onClick={() => setIsPremiumModalOpen(true)}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Upgrade
                        </Button>
                    )}

                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="!p-2" onClick={() => setIsSettingsModalOpen(true)}>
                            <Settings className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!p-2" onClick={handleLogout}>
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Stats / Jar Preview */}
            <div className="flex flex-col items-center justify-center py-8 mb-8">
                <div className="scale-75 origin-center">
                    <Jar3D />
                </div>
                <p className="text-center text-slate-400 mt-[-40px]">
                    {availableIdeasCount} ideas in the jar
                </p>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddIdeaClick}
                    className="glass-card flex flex-col items-center justify-center gap-3 p-6 cursor-pointer group hover:bg-white/10"
                >
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-medium text-white text-center">Add Idea</span>
                </motion.div>

                <motion.div
                    whileHover={availableIdeasCount > 0 ? { scale: 1.02 } : {}}
                    whileTap={availableIdeasCount > 0 ? { scale: 0.98 } : {}}
                    onClick={() => availableIdeasCount > 0 && setIsFilterModalOpen(true)}
                    className={`glass-card flex flex-col items-center justify-center gap-3 p-6 transition-all group ${availableIdeasCount > 0
                        ? "cursor-pointer hover:bg-white/10"
                        : "opacity-50 cursor-not-allowed grayscale"
                        }`}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${availableIdeasCount > 0
                        ? "bg-secondary/20 group-hover:bg-secondary/30"
                        : "bg-slate-700"
                        }`}>
                        <Sparkles className={`w-6 h-6 ${availableIdeasCount > 0 ? "text-secondary" : "text-slate-500"} ${isSpinning ? 'animate-spin' : ''}`} />
                    </div>
                    <span className={`font-medium ${availableIdeasCount > 0 ? "text-white" : "text-slate-500"} text-center`}>
                        {isSpinning ? 'Spinning...' : 'Spin Jar'}
                    </span>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        if (isPremium) {
                            setIsPlannerOpen(true);
                        } else {
                            setIsPremiumModalOpen(true);
                        }
                    }}
                    className="glass-card flex flex-col items-center justify-center gap-3 p-6 cursor-pointer group hover:bg-white/10 sm:col-span-2 md:col-span-1 relative overflow-hidden"
                >
                    {!isPremium && (
                        <div className="absolute top-3 right-3">
                            <Lock className="w-4 h-4 text-slate-500" />
                        </div>
                    )}
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                        <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="font-medium text-white text-center">Weekend Plan</span>
                </motion.div>
            </div>

            {/* Ideas Lists */}
            <div className="mt-8 max-w-md mx-auto space-y-8">

                {/* Active Ideas */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span>In the Jar</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                            {ideas.filter(i => !i.selectedAt).length}
                        </span>
                    </h3>
                    <div className="space-y-3">
                        {ideas.filter(i => !i.selectedAt).length === 0 ? (
                            <p className="text-slate-400 text-center py-4 text-sm">No ideas in the jar. Add some!</p>
                        ) : (
                            ideas.filter(i => !i.selectedAt).map((idea) => (
                                <div
                                    key={idea.id}
                                    onClick={() => !idea.isMasked && setEditingIdea(idea)}
                                    className={`glass p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 group transition-colors ${idea.isMasked ? 'opacity-75 bg-white/5 cursor-default' : 'hover:bg-white/5 cursor-pointer'}`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {idea.isMasked && <Lock className="w-3 h-3 text-slate-400" />}
                                            <p className={`font-medium ${idea.isMasked ? 'text-slate-400 italic' : 'text-white'}`}>{idea.description}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {idea.indoor ? 'Indoor' : 'Outdoor'} • {idea.duration}h • {idea.cost} • {idea.timeOfDay === 'ANY' ? 'Anytime' : idea.timeOfDay === 'DAY' ? 'Day' : 'Evening'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                                        <div className={`w-2 h-2 rounded-full ${idea.activityLevel === 'HIGH' ? 'bg-red-400' : idea.activityLevel === 'MEDIUM' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                        {!idea.isMasked && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(idea.id);
                                                }}
                                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors sm:opacity-0 group-hover:opacity-100"
                                                title="Delete Idea"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Past Dates */}
                {ideas.filter(i => i.selectedAt).length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>Past Dates</span>
                            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                                {ideas.filter(i => i.selectedAt).length}
                            </span>
                        </h3>
                        <div className="space-y-3">
                            {ideas.filter(i => i.selectedAt).map((idea) => (
                                <div key={idea.id} className="glass p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 opacity-75 hover:opacity-100 transition-opacity">
                                    <div>
                                        <p className="text-white font-medium line-through text-slate-400">{idea.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Selected on {new Date(idea.selectedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto">
                                        <div className="text-xs text-secondary font-medium px-2 py-1 bg-secondary/10 rounded-md flex items-center gap-2">
                                            <span>Completed</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDuplicate(idea);
                                                }}
                                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                                                title="Add to Jar Again"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                            <div className="w-px h-3 bg-slate-700 mx-1" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(idea.id);
                                                }}
                                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-red-400"
                                                title="Delete from History"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {idea.rating ? (
                                            <div
                                                className="flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                                                onClick={() => setRatingIdea(idea)}
                                            >
                                                {[...Array(idea.rating)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setRatingIdea(idea)}
                                                className="text-xs text-slate-400 hover:text-yellow-400 underline decoration-dotted transition-colors"
                                            >
                                                Rate this date
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
