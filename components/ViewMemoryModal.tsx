import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Calendar, MapPin, DollarSign, Clock, Activity, Star, Quote, X, Utensils, Ticket, Moon } from "lucide-react";

interface ViewMemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    idea: any;
}

export function ViewMemoryModal({ isOpen, onClose, idea }: ViewMemoryModalProps) {
    const [ratings, setRatings] = useState<any[]>([]);

    useEffect(() => {
        if (idea && isOpen) {
            fetch(`/api/ideas/${idea.id}/rate`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setRatings(data);
                })
                .catch(err => console.error(err));
        }
    }, [idea, isOpen]);

    if (!idea) return null;

    const formattedDate = idea.selectedAt
        ? new Date(idea.selectedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : "Unknown Date";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-2 bg-black/20 hover:bg-black/40 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg
                            ${idea.category === 'MEAL' ? 'text-orange-100' :
                                idea.category === 'EVENT' ? 'text-purple-100' :
                                    idea.category === 'PLANNED_DATE' ? 'text-pink-100' :
                                        'text-blue-100'
                            }`}
                        >
                            {idea.category === 'MEAL' && <Utensils className="w-8 h-8" />}
                            {idea.category === 'EVENT' && <Calendar className="w-8 h-8" />}
                            {idea.category === 'PLANNED_DATE' && <Moon className="w-8 h-8" />}
                            {(!idea.category || idea.category === 'ACTIVITY') && <Activity className="w-8 h-8" />}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-1 leading-snug">{idea.description}</h2>
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{formattedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {idea.photoUrls && idea.photoUrls.length > 0 ? (
                    <div className="w-full bg-black/50 border-b border-white/10 overflow-x-auto flex snap-x snap-mandatory">
                        <div className="flex h-80">
                            {idea.photoUrls.map((url: string, i: number) => (
                                <div key={i} className="min-w-[80%] md:min-w-[60%] h-full shrink-0 snap-center relative border-r border-white/10 bg-black first:pl-0">
                                    <img
                                        src={url}
                                        alt={`Memory ${i}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : idea.photoUrl ? (
                    // Fallback for old data
                    <div className="w-full h-64 md:h-80 relative bg-black border-b border-white/10">
                        <img src={idea.photoUrl} alt="Memory" className="w-full h-full object-cover" />
                    </div>
                ) : null}

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto w-full">
                    {/* Ratings Section */}
                    {ratings.length > 0 ? (
                        <div className="space-y-3">
                            <h4 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Couple Ratings</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ratings.map((rating: any, index: number) => (
                                    <div key={index} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm dark:shadow-none">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{rating.user?.name || "Partner"}</div>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <span className="font-bold">{rating.value}</span>
                                                <Star className="w-4 h-4 fill-yellow-500" />
                                            </div>
                                        </div>
                                        {rating.comment && (
                                            <div className="relative pl-3 border-l-2 border-slate-600">
                                                <p className="text-slate-700 dark:text-slate-300 text-xs italic">"{rating.comment}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : idea.rating ? (
                        <div className="flex items-center gap-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-4">
                            <div className="text-yellow-500">
                                <Star className="w-8 h-8 fill-yellow-500" />
                            </div>
                            <div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-500 font-bold uppercase tracking-wider mb-0.5">Rating</div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">{idea.rating}/5</div>
                            </div>
                            {idea.ratingComment && (
                                <div className="flex-1 border-l border-yellow-500/20 pl-4 ml-2">
                                    <Quote className="w-4 h-4 text-yellow-500/50 mb-1" />
                                    <p className="text-slate-600 dark:text-slate-300 text-sm italic">"{idea.ratingComment}"</p>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400 mx-auto mb-1" />
                            <div className="text-xs text-slate-500 uppercase font-bold">Duration</div>
                            <div className="text-slate-900 dark:text-white font-medium">{idea.duration} hours</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <DollarSign className="w-4 h-4 text-green-500 dark:text-green-400 mx-auto mb-1" />
                            <div className="text-xs text-slate-500 uppercase font-bold">Cost</div>
                            <div className="text-slate-900 dark:text-white font-medium">{idea.cost}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <Activity className="w-4 h-4 text-red-500 dark:text-red-400 mx-auto mb-1" />
                            <div className="text-xs text-slate-500 uppercase font-bold">Activity</div>
                            <div className="text-slate-900 dark:text-white font-medium capitalize">{idea.activityLevel?.toLowerCase()}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <MapPin className="w-4 h-4 text-purple-500 dark:text-purple-400 mx-auto mb-1" />
                            <div className="text-xs text-slate-500 uppercase font-bold">Setting</div>
                            <div className="text-slate-900 dark:text-white font-medium">{idea.indoor ? 'Indoor' : 'Outdoor'}</div>
                        </div>
                    </div>

                    {/* Details / Notes */}
                    {(idea.details || idea.notes) && (
                        <div className="space-y-4">
                            {idea.notes && (
                                <div>
                                    <h4 className="text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Notes</h4>
                                    <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 leading-relaxed whitespace-pre-wrap shadow-sm dark:shadow-none">
                                        {idea.notes}
                                    </p>
                                </div>
                            )}

                            {idea.details && (
                                <div>
                                    <h4 className="text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Itinerary / Details</h4>
                                    <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 leading-relaxed whitespace-pre-wrap shadow-sm dark:shadow-none">
                                        {idea.details}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
