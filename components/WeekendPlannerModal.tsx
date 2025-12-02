import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Sparkles, Calendar, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Suggestion {
    title: string;
    description: string;
    day: string;
    cost: string;
}

interface WeekendPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
}

export function WeekendPlannerModal({ isOpen, onClose, userLocation }: WeekendPlannerModalProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && suggestions.length === 0) {
            generatePlan();
        }
    }, [isOpen]);

    const generatePlan = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai/weekend-planner', { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                setSuggestions(data.suggestions);
            } else {
                setError(data.error || "Failed to generate plan");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-secondary" />
                        Weekend Planner
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {userLocation && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 p-3 rounded-lg">
                            <MapPin className="w-4 h-4" />
                            <span>Planning for: <span className="text-white font-medium">{userLocation}</span></span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-10 h-10 text-secondary animate-spin" />
                            <p className="text-slate-400 animate-pulse">Consulting the oracle...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-400 mb-4">{error}</p>
                            <Button onClick={generatePlan} variant="outline">Try Again</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {suggestions.map((item, idx) => (
                                <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-secondary">{item.title}</h3>
                                        <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">{item.day}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-3 leading-relaxed">{item.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="px-2 py-0.5 bg-slate-800 rounded-full">{item.cost}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    {!isLoading && !error && (
                        <Button onClick={generatePlan} variant="secondary">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Regenerate
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
