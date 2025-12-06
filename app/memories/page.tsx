"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Star, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RateDateModal } from "@/components/RateDateModal";
import { AddIdeaModal } from "@/components/AddIdeaModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

export default function MemoriesPage() {
    const router = useRouter();
    const [ideas, setIdeas] = useState<any[]>([]);
    const [ratingIdea, setRatingIdea] = useState<any>(null);
    const [duplicatingIdea, setDuplicatingIdea] = useState<any>(null);
    const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);

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
            if (res.ok) fetchIdeas();
        } catch (error) {
            console.error("Error deleting idea:", error);
        } finally {
            setIdeaToDelete(null);
        }
    };

    const handleDuplicate = (idea: any) => {
        // Create a copy of the idea without the ID
        const { id, selectedAt, selectedDate, createdBy, createdAt, updatedAt, ...ideaData } = idea;
        setDuplicatingIdea(ideaData);
    };

    const memories = ideas
        .filter(i => i.selectedAt)
        .sort((a, b) => new Date(a.selectedAt).getTime() - new Date(b.selectedAt).getTime()); // Ascending order

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
                        <h1 className="text-3xl font-bold text-white tracking-tight">Memories</h1>
                        <p className="text-slate-400 text-sm">{memories.length} dates completed</p>
                    </div>
                </div>
            </div>

            {memories.length === 0 ? (
                <div className="glass-card p-12 text-center border-dashed border-white/20 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Memories Yet</h3>
                    <p className="text-slate-400 max-w-xs mx-auto">Spin the jar and complete some dates to see them here!</p>
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                    {memories.map((idea) => (
                        <div key={idea.id} className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 group hover:bg-white/5 transition-colors">
                            <div className="flex flex-col items-center sm:items-start shrink-0 min-w-[120px] text-center sm:text-left">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                    {new Date(idea.selectedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                </span>
                                <span className="text-3xl font-bold text-white">
                                    {new Date(idea.selectedAt).getDate()}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(idea.selectedAt).toLocaleDateString(undefined, { weekday: 'long' })}
                                </span>
                            </div>

                            <div className="w-full sm:w-px h-px sm:h-16 bg-white/10" />

                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-xl font-bold text-white mb-2 line-through decoration-slate-600 decoration-2 text-slate-300">
                                    {idea.description}
                                </h3>
                                <div className="flex items-center justify-center sm:justify-start gap-3">
                                    {idea.rating ? (
                                        <div
                                            className="flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform bg-black/20 px-3 py-1 rounded-full border border-white/5"
                                            onClick={() => setRatingIdea(idea)}
                                        >
                                            <span className="text-sm font-bold mr-1 text-yellow-500">{idea.rating}</span>
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setRatingIdea(idea)}
                                            className="text-sm font-medium text-slate-400 hover:text-yellow-400 transition-colors px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5"
                                        >
                                            Rate Date
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => handleDuplicate(idea)}
                                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                                    title="Add Again"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(idea.id)}
                                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <RateDateModal
                isOpen={!!ratingIdea}
                onClose={() => {
                    setRatingIdea(null);
                    fetchIdeas();
                }}
                idea={ratingIdea}
            />

            <AddIdeaModal
                isOpen={!!duplicatingIdea}
                onClose={() => {
                    setDuplicatingIdea(null);
                    fetchIdeas();
                }}
                initialData={duplicatingIdea}
                isPremium={false} // Assuming duplicate shouldn't trigger premium flow directly
                onUpgrade={() => { }}
            />

            <DeleteConfirmModal
                isOpen={!!ideaToDelete}
                onClose={() => setIdeaToDelete(null)}
                onConfirm={confirmDelete}
            />
        </main>
    );
}
