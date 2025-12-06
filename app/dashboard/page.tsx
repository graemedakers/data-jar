"use client";

import { Button } from "@/components/ui/Button";
import { AddIdeaModal } from "@/components/AddIdeaModal";
import { motion } from "framer-motion";
import { Plus, Settings, LogOut, Sparkles, Lock, Trash2, Copy, Calendar, Activity, Utensils, Check, Star, ArrowRight, History, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { Jar3D } from "@/components/Jar3D";
import { useRouter } from "next/navigation";
import { DateReveal } from "@/components/DateReveal";
import { SpinFiltersModal } from "@/components/SpinFiltersModal";
import { SettingsModal } from "@/components/SettingsModal";
import { WeekendPlannerModal } from "@/components/WeekendPlannerModal";
import { RateDateModal } from "@/components/RateDateModal";
import { PremiumModal } from "@/components/PremiumModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { DiningConciergeModal } from "@/components/DiningConciergeModal";
import { BarConciergeModal } from "@/components/BarConciergeModal";
import { Wine } from "lucide-react";
import { PremiumBanner } from "@/components/PremiumBanner";
import { DateNightPlannerModal } from "@/components/DateNightPlannerModal";
import { Moon } from "lucide-react";

function InviteCodeDisplay({ mobile, code }: { mobile?: boolean; code: string | null }) {
    const [copied, setCopied] = useState(false);

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
    const [homeTown, setHomeTown] = useState<string | null>(null);
    const [interests, setInterests] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingIdea, setEditingIdea] = useState<any>(null);
    const [ratingIdea, setRatingIdea] = useState<any>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [isDiningModalOpen, setIsDiningModalOpen] = useState(false);
    const [isBarModalOpen, setIsBarModalOpen] = useState(false);
    const [isDateNightOpen, setIsDateNightOpen] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const router = useRouter();

    const [diningSearchLocation, setDiningSearchLocation] = useState<string | null>(null);

    // New state for Premium Banner
    const [hasPaid, setHasPaid] = useState(false);
    const [coupleCreatedAt, setCoupleCreatedAt] = useState<string>("");
    const [isTrialEligible, setIsTrialEligible] = useState(true);

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
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch user');
                return res.json();
            })
            .then(data => {
                if (data?.user) {
                    if (data.user.location) setUserLocation(data.user.location);
                    if (data.user.homeTown) setHomeTown(data.user.homeTown);
                    if (data.user.coupleReferenceCode) setInviteCode(data.user.coupleReferenceCode);
                    if (data.user.interests) setInterests(data.user.interests);
                    const userIsPremium = !!data.user.isPremium;
                    setIsPremium(userIsPremium);

                    // Set premium banner data
                    setHasPaid(!!data.user.hasPaid);
                    setCoupleCreatedAt(data.user.coupleCreatedAt);
                    // Default to true if undefined (backward compatibility)
                    setIsTrialEligible(data.user.isTrialEligible !== false);
                }
            })
            .catch(err => console.error("Error fetching user:", err))
            .finally(() => {
                setIsLoadingUser(false);
            });
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    const handleSpinJar = async (filters: { maxDuration?: number; maxCost?: string; maxActivityLevel?: string; timeOfDay?: string; category?: string } = {}) => {
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

    const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        console.log("Delete clicked for id:", id);
        setIdeaToDelete(id);
    };

    const confirmDelete = async () => {
        if (!ideaToDelete) return;

        try {
            const res = await fetch(`/api/ideas/${ideaToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                fetchIdeas();
            } else {
                const data = await res.json();
                alert(`Failed to delete idea: ${data.error || "Unknown error"}`);
                console.error("Delete failed:", data);
            }
        } catch (error: any) {
            console.error("Error deleting idea:", error);
            alert(`Error deleting idea: ${error.message}`);
        } finally {
            setIdeaToDelete(null);
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

    const combinedLocation = [userLocation, homeTown].filter(Boolean).join(" and ");

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24 relative overflow-hidden w-full max-w-[1600px] mx-auto">
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
                            if (data?.user) {
                                if (data.user.location) setUserLocation(data.user.location);
                                if (data.user.homeTown) setHomeTown(data.user.homeTown);
                                if (data.user.interests) setInterests(data.user.interests);
                            }
                        });
                }}
                currentLocation={userLocation ?? undefined}
            />

            <WeekendPlannerModal
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                userLocation={combinedLocation || undefined}
                onIdeaAdded={fetchIdeas}
            />

            <DiningConciergeModal
                isOpen={isDiningModalOpen}
                onClose={() => {
                    setIsDiningModalOpen(false);
                    setDiningSearchLocation(null);
                }}
                userLocation={diningSearchLocation || combinedLocation || undefined}
                onIdeaAdded={fetchIdeas}
                onGoTonight={(idea) => {
                    setSelectedIdea(idea);
                }}
            />

            <BarConciergeModal
                isOpen={isBarModalOpen}
                onClose={() => {
                    setIsBarModalOpen(false);
                }}
                userLocation={combinedLocation || undefined}
                onIdeaAdded={fetchIdeas}
                onGoTonight={(idea) => {
                    setSelectedIdea(idea);
                }}
            />

            <DateNightPlannerModal
                isOpen={isDateNightOpen}
                onClose={() => setIsDateNightOpen(false)}
                userLocation={combinedLocation || undefined}
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

            <DateReveal
                idea={selectedIdea}
                onClose={() => setSelectedIdea(null)}
                userLocation={userLocation ?? undefined}
                onFindDining={(location) => {
                    setDiningSearchLocation(location);
                    setIsDiningModalOpen(true);
                    setSelectedIdea(null);
                }}
            />

            <DeleteConfirmModal
                isOpen={!!ideaToDelete}
                onClose={() => setIdeaToDelete(null)}
                onConfirm={confirmDelete}
            />

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Your Jar</h1>
                    <p className="text-slate-400 text-sm">Manage your date ideas</p>
                </div>
                <div className="flex gap-2 items-center w-full md:w-auto justify-between md:justify-end">
                    {/* Invite Code Badge */}
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                        <span className="text-xs text-slate-400 font-medium">Invite Code:</span>
                        <span className="text-xs font-mono text-white select-all">
                            {/* We need to fetch this from the user object */}
                            <InviteCodeDisplay code={inviteCode} />
                        </span>
                    </div>

                    {/* Mobile Invite Code Button (Icon only) */}
                    <div className="md:hidden">
                        <InviteCodeDisplay mobile code={inviteCode} />
                    </div>

                    {!isLoadingUser && !isPremium && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-200 border-yellow-400/30 hover:bg-yellow-400/30 rounded-full"
                            onClick={() => setIsPremiumModalOpen(true)}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Upgrade
                        </Button>
                    )}

                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="!p-2 rounded-full hover:bg-white/10" onClick={() => setIsSettingsModalOpen(true)}>
                            <Settings className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="!p-2 rounded-full hover:bg-white/10" onClick={handleLogout}>
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Premium Banner */}
            {!isLoadingUser && (
                <div className="mb-8">
                    <PremiumBanner hasPaid={hasPaid} coupleCreatedAt={coupleCreatedAt} isTrialEligible={isTrialEligible} />
                </div>
            )}

            {/* Main Layout Grid */}
            <div className="flex flex-col gap-12 max-w-6xl mx-auto">

                {/* Upper Section: Jar Control Center */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-center relative">

                    {/* Left Column: Input & Management */}
                    <div className="space-y-6 order-2 xl:order-1">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddIdeaClick}
                            className="w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 cursor-pointer transition-all bg-gradient-to-br from-violet-600/20 to-violet-900/40 border border-violet-500/30 hover:border-violet-500/50 shadow-lg shadow-violet-900/10 group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 shrink-0 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-200 group-hover:scale-110 transition-transform relative z-10 border border-violet-500/30">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div className="text-left relative z-10">
                                <span className="block text-lg font-bold text-white group-hover:text-violet-200 transition-colors">Add Idea</span>
                                <span className="text-sm text-violet-200/60 group-hover:text-violet-200/80 transition-colors leading-tight">Fill your jar</span>
                            </div>
                        </motion.button>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/jar')}
                            className="glass-card p-6 flex items-center gap-4 cursor-pointer group hover:bg-white/10"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 transition-colors shrink-0">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">Open Jar</h3>
                                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">View {ideas.filter(i => !i.selectedAt).length} ideas</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                        </motion.div>
                    </div>

                    {/* Center Column: The Visualization */}
                    <div className="order-1 xl:order-2 flex flex-col items-center justify-center relative">
                        <div className="relative w-full aspect-square max-w-[400px] flex items-center justify-center">
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />

                            <div className="relative z-10 scale-125 transform transition-transform hover:scale-130 duration-700">
                                <Jar3D />
                            </div>
                        </div>
                        <div className="mt-[-20px] relative z-10 text-center">
                            <p className="text-3xl font-bold text-white">{availableIdeasCount}</p>
                            <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">Ideas Waiting</p>
                        </div>
                    </div>

                    {/* Right Column: Action & History */}
                    <div className="space-y-6 order-3 xl:order-3">
                        <motion.button
                            whileHover={availableIdeasCount > 0 ? { scale: 1.02 } : {}}
                            whileTap={availableIdeasCount > 0 ? { scale: 0.95 } : {}}
                            onClick={() => availableIdeasCount > 0 && setIsFilterModalOpen(true)}
                            className={`w-full relative overflow-hidden rounded-2xl p-6 flex flex-row items-center justify-start gap-4 transition-all cursor-pointer border shadow-lg group ${availableIdeasCount > 0
                                ? 'bg-gradient-to-br from-pink-600/20 to-pink-900/40 border-pink-500/30 hover:border-pink-500/50 shadow-pink-900/10'
                                : 'bg-slate-800/20 border-slate-700 opacity-50 grayscale cursor-not-allowed'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center relative z-10 border transition-transform group-hover:scale-110 ${availableIdeasCount > 0 ? 'bg-pink-500/20 text-pink-200 border-pink-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                <Sparkles className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
                            </div>
                            <div className="text-left relative z-10">
                                <span className={`block text-lg font-bold transition-colors ${availableIdeasCount > 0 ? 'text-white group-hover:text-pink-200' : 'text-slate-400'}`}>{isSpinning ? 'Spinning...' : 'Spin the Jar'}</span>
                                <span className={`text-sm transition-colors leading-tight ${availableIdeasCount > 0 ? 'text-pink-200/60 group-hover:text-pink-200/80' : 'text-slate-500'}`}>Let fate decide</span>
                            </div>
                        </motion.button>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/memories')}
                            className="glass-card p-6 flex items-center gap-4 cursor-pointer group hover:bg-white/10"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors shrink-0">
                                <History className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">Memories</h3>
                                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{ideas.filter(i => i.selectedAt).length} dates done</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                        </motion.div>
                    </div>
                </div>

                {/* Lower Section: Smart Tools Grid */}
                <div>
                    <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Concierge & Tools</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-slate-900/40 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer hover:bg-purple-900/20 hover:border-purple-500/40 transition-all shadow-lg shadow-black/20"
                            onClick={() => isPremium ? setIsPlannerOpen(true) : setIsPremiumModalOpen(true)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 ring-1 ring-purple-500/30">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                {!isPremium && <Lock className="w-5 h-5 text-slate-500" />}
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-white mb-2">Weekend Planner</span>
                                <span className="text-sm text-slate-400 leading-relaxed block group-hover:text-purple-200/70 transition-colors">Let AI build a full weekend itinerary automatically.</span>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-slate-900/40 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer hover:bg-orange-900/20 hover:border-orange-500/40 transition-all shadow-lg shadow-black/20"
                            onClick={() => isPremium ? setIsDiningModalOpen(true) : setIsPremiumModalOpen(true)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-300 ring-1 ring-orange-500/30">
                                    <Utensils className="w-6 h-6" />
                                </div>
                                {!isPremium && <Lock className="w-5 h-5 text-slate-500" />}
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-white mb-2">Dining Concierge</span>
                                <span className="text-sm text-slate-400 leading-relaxed block group-hover:text-orange-200/70 transition-colors">Find the perfect dinner spot for tonight.</span>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-slate-900/40 backdrop-blur-md border border-pink-500/20 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer hover:bg-pink-900/20 hover:border-pink-500/40 transition-all shadow-lg shadow-black/20"
                            onClick={() => isPremium ? setIsBarModalOpen(true) : setIsPremiumModalOpen(true)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-300 ring-1 ring-pink-500/30">
                                    <Wine className="w-6 h-6" />
                                </div>
                                {!isPremium && <Lock className="w-5 h-5 text-slate-500" />}
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-white mb-2">Bar Scout</span>
                                <span className="text-sm text-slate-400 leading-relaxed block group-hover:text-pink-200/70 transition-colors">Discover top-rated bars and lounges nearby.</span>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-slate-900/40 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer hover:bg-rose-900/20 hover:border-rose-500/40 transition-all shadow-lg shadow-black/20"
                            onClick={() => isPremium ? setIsDateNightOpen(true) : setIsPremiumModalOpen(true)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300 ring-1 ring-rose-500/30">
                                    <Moon className="w-6 h-6" />
                                </div>
                                {!isPremium && <Lock className="w-5 h-5 text-slate-500" />}
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-white mb-2">Date Night Planner</span>
                                <span className="text-sm text-slate-400 leading-relaxed block group-hover:text-rose-200/70 transition-colors">Plan a complete evening: Drinks, Dinner & Event.</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Setup / Personalize Prompts (Bottom area if needed) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
                    {!isLoadingUser && !userLocation && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 hover:bg-blue-500/20 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-white">Setup Profile</span>
                                <span className="text-xs text-blue-200/70">Add location for better suggestions</span>
                            </div>
                        </motion.button>
                    )}
                    {!isLoadingUser && userLocation && !interests && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3 hover:bg-purple-500/20 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Star className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-white">Personalize</span>
                                <span className="text-xs text-purple-200/70">Add interests for smart ideas</span>
                            </div>
                        </motion.button>
                    )}
                </div>

            </div>
        </main>
    );
}
