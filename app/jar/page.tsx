"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Lock, Trash2, Activity, Utensils, Calendar, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AddIdeaModal } from "@/components/AddIdeaModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { PremiumModal } from "@/components/PremiumModal";

export default function JarPage() {
    const router = useRouter();
    const [ideas, setIdeas] = useState<any[]>([]);
    const [editingIdea, setEditingIdea] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

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

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data?.user) {
                    setIsPremium(!!data.user.isPremium);
                }
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    useEffect(() => {
        fetchIdeas();
        fetchUser();
    }, []);

    const handleDeleteClick = (id: string) => {
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
            }
        } catch (error: any) {
            alert(`Error deleting idea: ${error.message}`);
        } finally {
            setIdeaToDelete(null);
        }
    };

    const handleGoTonight = async (e: React.MouseEvent, idea: any) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/ideas/${idea.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedAt: new Date().toISOString(),
                    selectedDate: new Date().toISOString()
                }),
                credentials: 'include',
            });

            if (res.ok) {
                // Navigate to dashboard implies selecting it.
                await fetchIdeas();
                router.push('/dashboard');
            } else {
                const err = await res.text();
                console.error("Go Tonight Failed:", err);
                alert("Failed to start date night: " + err);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const activeIdeas = ideas.filter(i => !i.selectedAt);

    return (
        <main className="min-h-screen p-4 md:p-8 relative overflow-hidden w-full max-w-[1600px] mx-auto">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
            </div>

            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-full p-2" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-6 h-6 text-slate-400 hover:text-white" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">In the Jar</h1>
                        <p className="text-slate-400 text-sm">{activeIdeas.length} ideas waiting</p>
                    </div>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Idea
                </Button>
            </div>

            {activeIdeas.length === 0 ? (
                <div className="glass-card p-12 text-center border-dashed border-white/20 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Jar is Empty</h3>
                    <p className="text-slate-400 mb-6 max-w-xs mx-auto">Start adding your favorite date ideas to fill up your jar.</p>
                    <Button onClick={() => setIsModalOpen(true)}>Add First Idea</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeIdeas.map((idea) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={idea.id}
                            onClick={() => !idea.isMasked && setEditingIdea(idea)}
                            className={`glass-card p-5 relative group cursor-pointer hover:border-white/20 transition-all ${idea.isMasked ? 'opacity-75 bg-slate-900/50' : 'hover:-translate-y-1'}`}
                        >
                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!idea.isMasked && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(idea.id);
                                        }}
                                        className="p-1.5 rounded-full bg-black/40 text-slate-400 hover:text-red-400 hover:bg-black/60 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="mb-3 flex items-start justify-between">
                                <div className={`p-2 rounded-lg ${idea.category === 'MEAL' ? 'bg-orange-500/20 text-orange-400' :
                                    idea.category === 'EVENT' ? 'bg-purple-500/20 text-purple-400' :
                                        idea.category === 'PLANNED_DATE' ? 'bg-pink-500/20 text-pink-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {idea.category === 'MEAL' && <Utensils className="w-4 h-4" />}
                                    {idea.category === 'EVENT' && <Calendar className="w-4 h-4" />}
                                    {idea.category === 'PLANNED_DATE' && <Moon className="w-4 h-4" />}
                                    {(!idea.category || idea.category === 'ACTIVITY') && <Activity className="w-4 h-4" />}
                                </div>
                                <div className="flex gap-2 items-center">
                                    {idea.category === 'PLANNED_DATE' && !idea.isMasked && (
                                        <Button
                                            size="sm"
                                            className="h-7 text-[10px] bg-pink-500 hover:bg-pink-600 border-0"
                                            onClick={(e) => handleGoTonight(e, idea)}
                                        >
                                            Go Tonight
                                        </Button>
                                    )}
                                    <div className={`w-2 h-2 rounded-full ${idea.activityLevel === 'HIGH' ? 'bg-red-400' : idea.activityLevel === 'MEDIUM' ? 'bg-yellow-400' : 'bg-green-400'}`} title={`Activity: ${idea.activityLevel}`} />
                                </div>
                            </div>

                            <h3 className={`font-semibold text-white mb-2 line-clamp-2 ${idea.isMasked ? 'italic text-slate-400' : ''}`}>
                                {idea.isMasked ? 'Locked Idea' : idea.description}
                            </h3>

                            {!idea.isMasked && (
                                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                                        {idea.duration}h
                                    </span>
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                                        {idea.cost}
                                    </span>
                                    {idea.category === 'PLANNED_DATE' ? (
                                        <>
                                            {idea.notes && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 w-full text-center mt-1">
                                                    {idea.notes.replace('Planned for: ', '')}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                                            {idea.indoor ? 'Indoor' : 'Outdoor'}
                                        </span>
                                    )}
                                </div>
                            )}

                            {idea.isMasked && (
                                <div className="mt-auto pt-2 flex items-center justify-center">
                                    <Lock className="w-4 h-4 text-slate-500" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            <AddIdeaModal
                isOpen={isModalOpen || !!editingIdea}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingIdea(null);
                    fetchIdeas();
                }}
                initialData={editingIdea}
                isPremium={isPremium}
                onUpgrade={() => {
                    setIsModalOpen(false);
                    setIsPremiumModalOpen(true);
                }}
            />

            <DeleteConfirmModal
                isOpen={!!ideaToDelete}
                onClose={() => setIdeaToDelete(null)}
                onConfirm={confirmDelete}
            />

            <PremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
            />
        </main>
    );
}
