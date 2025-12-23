"use client";

import { Button } from "@/components/ui/Button";
import { getApiUrl } from "@/lib/utils";
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
import { Moon, Heart } from "lucide-react";
import { FavoritesModal } from "@/components/FavoritesModal";
import { SurpriseMeModal } from "@/components/SurpriseMeModal";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LevelBanner } from "@/components/Gamification/LevelBanner";
import { LevelUpModal } from "@/components/Gamification/LevelUpModal";
import { AchievementCase } from "@/components/Gamification/AchievementCase";
import { CollapsibleTrophyCase } from "@/components/Gamification/CollapsibleTrophyCase";
import { ReviewAppModal } from "@/components/ReviewAppModal";
import { HelpModal } from "@/components/HelpModal";
import { HelpCircle } from "lucide-react";
import { JarSwitcher } from "@/components/JarSwitcher";
import { JarControls } from "@/components/dashboard/JarControls";
import { JarVisualization } from "@/components/dashboard/JarVisualization";
import { JarActions } from "@/components/dashboard/JarActions";
import { MobileSpinButton } from "@/components/dashboard/MobileSpinButton";
import { ToolsGrid } from "@/components/dashboard/ToolsGrid";
import { User, Idea } from "@/lib/types";

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
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    const [isSurpriseModalOpen, setIsSurpriseModalOpen] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const router = useRouter();

    const [diningSearchLocation, setDiningSearchLocation] = useState<string | null>(null);

    const [favoritesCount, setFavoritesCount] = useState(0);
    const [userData, setUserData] = useState<User | null>(null);

    // New state for Premium Banner
    const [hasPaid, setHasPaid] = useState(false);
    const [coupleCreatedAt, setCoupleCreatedAt] = useState<string>("");
    const [isTrialEligible, setIsTrialEligible] = useState(true);
    const [xp, setXp] = useState<number | undefined>(undefined);
    const [level, setLevel] = useState(1);
    const [achievements, setAchievements] = useState<string[]>([]);
    const [showLevelUp, setShowLevelUp] = useState(false);

    const fetchIdeas = async () => {
        setIsLoadingIdeas(true);
        try {
            const res = await fetch(getApiUrl('/api/ideas'), { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setIdeas(data);
            }
        } catch (error) {
            console.error('Failed to fetch ideas', error);
        } finally {
            setIsLoadingIdeas(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const res = await fetch(getApiUrl('/api/favorites'), { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setFavoritesCount(data.length);
            }
        } catch (error) {
            console.error('Failed to fetch favorites', error);
        }
    };

    const refreshUser = async () => {
        try {
            const res = await fetch(`${getApiUrl('/api/auth/me')}?_=${Date.now()}`, {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (!res.ok) throw new Error('Failed to fetch user');
            const data = await res.json();

            if (data?.user) {
                setUserData(data.user);
                if (data.user.location) {
                    setUserLocation(data.user.location);
                    localStorage.setItem('datejar_user_location', data.user.location);
                }
                if (data.user.coupleReferenceCode) setInviteCode(data.user.coupleReferenceCode);
                if (data.user.interests) setInterests(data.user.interests);
                const userIsPremium = !!data.user.isPremium;
                setIsPremium(userIsPremium);
                localStorage.setItem('datejar_is_premium', userIsPremium.toString());
            } else {
                // Middleware let us through, but API says invalid. Logout and Redirect.
                console.warn("Invalid session detected on dashboard. Logging out.");
                await fetch(getApiUrl('/api/auth/logout'), { method: 'POST' });
                window.location.href = '/';
                return;
            }

            setHasPaid(!!data.user.hasPaid);
            setCoupleCreatedAt(data.user.coupleCreatedAt);
            setIsTrialEligible(data.user.isTrialEligible !== false);

            if (data.user.xp !== undefined) {
                setXp(data.user.xp);
                localStorage.setItem('datejar_xp', data.user.xp.toString());
            }
            if (data.user.unlockedAchievements) {
                setAchievements(data.user.unlockedAchievements);
                localStorage.setItem('datejar_achievements', JSON.stringify(data.user.unlockedAchievements));
            }
            if (data.user.level !== undefined) {
                const newLevel = data.user.level;
                setLevel(newLevel);

                // Use a jar-specific key to avoid false level-ups when switching jars
                const levelKey = `datejar_level_${data.user.activeJarId || 'common'}`;

                const storedLevelStr = localStorage.getItem(levelKey);
                if (storedLevelStr) {
                    const storedLevel = parseInt(storedLevelStr, 10);
                    if (newLevel > storedLevel) {
                        setShowLevelUp(true);
                        // Don't update localStorage here - wait for modal close, but we track the key to update
                    } else if (newLevel < storedLevel) {
                        // Level went down (different jar or reset), sync it silently
                        localStorage.setItem(levelKey, newLevel.toString());
                    }
                } else {
                    // First time for this jar, store it
                    localStorage.setItem(levelKey, newLevel.toString());
                }
            }
            // End of logic

        } catch (err) {
            console.error("Error fetching user:", err);
        }
    };

    const handleContentUpdate = () => {
        fetchIdeas();
        refreshUser();
    };

    useEffect(() => {
        fetchIdeas();
        fetchFavorites();

        // Check for Stripe success return
        const params = new URLSearchParams(window.location.search);
        const success = params.get('success');
        const sessionId = params.get('session_id');

        const init = async () => {
            // Optimistic Load from Cache
            try {
                const cachedXp = localStorage.getItem('datejar_xp');
                const cachedLevel = localStorage.getItem('datejar_user_level');
                const cachedAch = localStorage.getItem('datejar_achievements');
                const cachedPremium = localStorage.getItem('datejar_is_premium');
                const cachedLocation = localStorage.getItem('datejar_user_location');

                if (cachedXp) setXp(parseInt(cachedXp, 10));
                if (cachedLevel) setLevel(parseInt(cachedLevel, 10));
                if (cachedAch) setAchievements(JSON.parse(cachedAch));
                if (cachedPremium) setIsPremium(cachedPremium === 'true');
                if (cachedLocation) setUserLocation(cachedLocation);
            } catch (e) {
                // Ignore cache errors
            }

            setIsLoadingUser(true);

            if (success && sessionId) {
                try {
                    // Manually sync stripe status immediately
                    await fetch(`${getApiUrl('/api/stripe/sync')}?session_id=${sessionId}`);
                    // Clear params from URL without refresh
                    window.history.replaceState({}, '', '/dashboard');
                } catch (e) {
                    console.error("Sync failed", e);
                }
            }

            await refreshUser();
            setIsLoadingUser(false);
        };

        init();
    }, []);

    const handleCloseLevelUp = () => {
        setShowLevelUp(false);
        const levelKey = `datejar_level_${userData?.activeJarId || 'common'}`;
        localStorage.setItem(levelKey, level.toString());
    };

    const handleLogout = async () => {
        await fetch(getApiUrl('/api/auth/logout'), { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    const checkLocationAndOpen = (openTool: () => void) => {
        if (!userLocation) {
            alert("Please set your location in Settings first, so we can provide personalized recommendations!");
            setIsSettingsModalOpen(true);
            return;
        }
        openTool();
    };

    const handleSpinJar = async (filters: { maxDuration?: number; maxCost?: string; maxActivityLevel?: string; timeOfDay?: string; category?: string } = {}) => {
        if (ideas.length === 0) {
            alert("Add some ideas first!");
            return;
        }
        setIsSpinning(true);
        try {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch (e) {
            // Ignore haptic errors on web
        }
        // Simulate animation
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const res = await fetch(getApiUrl('/api/pick-date'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters),
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedIdea(data);
                handleContentUpdate(); // Refresh to show idea as used (removed from list)
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
        setIdeaToDelete(id);
    };

    const confirmDelete = async () => {
        if (!ideaToDelete) return;

        try {
            const res = await fetch(getApiUrl(`/api/ideas/${ideaToDelete}`), {
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

    const combinedLocation = userLocation || "";

    return (
        <main className="min-h-screen p-4 md:p-8 pb-24 relative overflow-hidden w-full max-w-[1600px] mx-auto">
            <PremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
            />

            <ReviewAppModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
            />

            <HelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
                initialSection="dashboard"
            />


            <FavoritesModal
                isOpen={isFavoritesOpen}
                onClose={() => {
                    setIsFavoritesOpen(false);
                    fetchFavorites();
                }}
            />

            <AddIdeaModal
                isOpen={isModalOpen || !!editingIdea}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingIdea(null);
                    handleContentUpdate(); // Refresh list after adding
                }}
                initialData={editingIdea}
                isPremium={isPremium}
                onUpgrade={() => {
                    setIsModalOpen(false);
                    setIsPremiumModalOpen(true);
                }}
            />

            <SurpriseMeModal
                isOpen={isSurpriseModalOpen}
                onClose={() => setIsSurpriseModalOpen(false)}
                onIdeaAdded={fetchIdeas}
                initialLocation={userLocation || ""}
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
                    fetch(getApiUrl('/api/auth/me'))
                        .then(res => res.json())
                        .then(data => {
                            if (data?.user) {
                                if (data.user.location) setUserLocation(data.user.location);
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
                onIdeaAdded={handleContentUpdate}
            />

            <DiningConciergeModal
                isOpen={isDiningModalOpen}
                onClose={() => {
                    setIsDiningModalOpen(false);
                    setDiningSearchLocation(null);
                }}
                userLocation={diningSearchLocation || combinedLocation || undefined}
                onIdeaAdded={handleContentUpdate}
                onGoTonight={(idea) => {
                    setSelectedIdea(idea);
                }}
                onFavoriteUpdated={fetchFavorites}
            />

            <BarConciergeModal
                isOpen={isBarModalOpen}
                onClose={() => {
                    setIsBarModalOpen(false);
                }}
                userLocation={combinedLocation || undefined}
                onIdeaAdded={handleContentUpdate}
                onGoTonight={(idea) => {
                    setSelectedIdea(idea);
                }}
                onFavoriteUpdated={fetchFavorites}
            />

            <DateNightPlannerModal
                isOpen={isDateNightOpen}
                onClose={() => setIsDateNightOpen(false)}
                userLocation={userLocation || undefined}
                onIdeaAdded={handleContentUpdate}
            />

            <RateDateModal
                isOpen={!!ratingIdea}
                onClose={() => {
                    setRatingIdea(null);
                    handleContentUpdate();
                }}
                idea={ratingIdea}
                isPro={isPremium}
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

            <header className="flex flex-col gap-2 mb-6 md:mb-16">
                <div className="flex flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {!isLoadingUser ? (
                            <JarSwitcher
                                user={userData || { id: '', email: '', name: '', memberships: [], activeJarId: null }}
                                variant="title"
                                className="min-w-0"
                                onSwitch={handleContentUpdate}
                            />
                        ) : (
                            <h1 className="text-lg md:text-3xl font-bold text-slate-400 dark:text-slate-500 tracking-tight flex items-center gap-2">
                                <span className="animate-pulse">Loading jars...</span>
                            </h1>
                        )}
                    </div>

                    <div className="flex gap-2 items-center justify-end">
                        {!isLoadingUser && !isPremium && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-700 dark:text-yellow-200 border-yellow-400/30 hover:bg-yellow-400/30 rounded-full"
                                onClick={() => setIsPremiumModalOpen(true)}
                            >
                                <Sparkles className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Upgrade</span>
                            </Button>
                        )}

                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="!p-2 rounded-full hover:bg-white/10 md:hidden" onClick={() => setIsHelpOpen(true)}>
                                <HelpCircle className="w-5 h-5 text-slate-400" />
                            </Button>
                            <Button variant="ghost" size="sm" className="!p-2 rounded-full hover:bg-white/10 relative" onClick={() => setIsFavoritesOpen(true)}>
                                <Heart className="w-5 h-5 text-pink-400" />
                                {favoritesCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border border-slate-900 pointer-events-none">
                                        {favoritesCount}
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white border border-slate-300 dark:border-white/10 rounded-full px-2 md:px-4"
                                onClick={() => setIsSettingsModalOpen(true)}
                            >
                                <Settings className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Personalise</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="!p-2 rounded-full hover:bg-white/10" onClick={handleLogout}>
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* No Jar Banner */}
            {
                userData && (!userData.memberships || userData.memberships.length === 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-500/20 dark:border-purple-500/30 rounded-2xl"
                    >
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-purple-500" />
                                    Welcome! You're not a member of any jar yet.
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    To start adding and spinning date ideas, you'll need to join an existing jar or create your own.
                                    You can also request an invite from someone who already has a jar.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    onClick={() => {
                                        // Trigger jar switcher to open
                                        const trigger = document.querySelector('[role="combobox"]');
                                        if (trigger) (trigger as HTMLElement).click();
                                    }}
                                    className="bg-purple-500 hover:bg-purple-600 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create or Join a Jar
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )
            }

            {/* Premium Banner */}
            {
                !isLoadingUser && !isPremium && userData && userData.memberships && userData.memberships.length > 0 && (
                    <div className="mb-4">
                        <PremiumBanner hasPaid={hasPaid} coupleCreatedAt={coupleCreatedAt} isTrialEligible={isTrialEligible} />
                    </div>
                )
            }

            {/* Gamification Level Banner */}
            {/* Gamification Level Banner */}
            {
                xp !== undefined ? (
                    <CollapsibleTrophyCase xp={xp} level={level} unlockedIds={achievements} />
                ) : (
                    <div className="w-full mb-6 relative overflow-hidden rounded-xl bg-slate-900/40 border border-white/5 p-4">
                        <div className="flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-slate-800" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-800 rounded w-1/3" />
                                <div className="h-3 bg-slate-800 rounded w-1/4" />
                            </div>
                        </div>
                    </div>
                )
            }

            <LevelUpModal
                isOpen={showLevelUp}
                level={level}
                onClose={handleCloseLevelUp}
            />

            {/* Main Layout Grid */}
            <div className="flex flex-col gap-12 max-w-6xl mx-auto">

                {/* Mobile: Spin Button at Top - Compact Banner Style */}
                <MobileSpinButton
                    availableIdeasCount={availableIdeasCount}
                    isSpinning={isSpinning}
                    onSpin={() => setIsFilterModalOpen(true)}
                />

                {/* Upper Section: Jar Control Center */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-center relative">

                    {/* Left Column: Input & Management */}
                    <JarControls
                        userData={userData}
                        ideasCount={ideas.filter(i => !i.selectedAt).length}
                        onAddIdea={handleAddIdeaClick}
                        onSurpriseMe={() => setIsSurpriseModalOpen(true)}
                        onOpenJar={() => router.push('/jar')}
                    />

                    {/* Center Column: The Visualization */}
                    <JarVisualization
                        availableIdeasCount={availableIdeasCount}
                        isLoadingIdeas={isLoadingIdeas}
                        ideasLength={ideas.length}
                    />

                    {/* Right Column: Action & History */}
                    <JarActions
                        availableIdeasCount={availableIdeasCount}
                        isSpinning={isSpinning}
                        onSpin={() => setIsFilterModalOpen(true)}
                        onOpenMemories={() => router.push('/memories')}
                        memoriesCount={ideas.filter(i => i.selectedAt).length}
                    />
                </div>

                {/* Lower Section: Smart Tools Grid */}
                <ToolsGrid
                    isPremium={isPremium}
                    isSocial={userData?.jarType === 'SOCIAL'}
                    onOpenWeekendPlanner={() => setIsPlannerOpen(true)}
                    onOpenDining={() => setIsDiningModalOpen(true)}
                    onOpenBar={() => setIsBarModalOpen(true)}
                    onOpenDateNight={() => setIsDateNightOpen(true)}
                    onUpgrade={() => setIsPremiumModalOpen(true)}
                />

                {/* Setup / Personalize Prompts (Bottom area if needed) */}

                {/* Footer Review CTA */}
                <div className="text-center pb-8 border-t border-white/5 pt-8 mt-12">
                    <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-pink-400 transition-colors text-sm font-medium group"
                    >
                        <Heart className="w-4 h-4 group-hover:fill-pink-400 transition-colors" />
                        Love Date Jar? Rate the app!
                    </button>
                </div>
            </div>
        </main >
    );
}
