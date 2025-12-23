
import { motion } from "framer-motion";
import { Calendar, Utensils, Wine, Moon, Lock } from "lucide-react";

interface ToolsGridProps {
    isPremium: boolean;
    isSocial: boolean; // Replaces jarType check helper
    onOpenWeekendPlanner: () => void;
    onOpenDining: () => void;
    onOpenBar: () => void;
    onOpenDateNight: () => void;
    onUpgrade: () => void;
}

export function ToolsGrid({
    isPremium,
    isSocial,
    onOpenWeekendPlanner,
    onOpenDining,
    onOpenBar,
    onOpenDateNight,
    onUpgrade
}: ToolsGridProps) {

    // Helper for consistency
    const handleAction = (action: () => void) => {
        if (isPremium) {
            action();
        } else {
            onUpgrade();
        }
    };

    return (
        <div className="hidden md:block">
            <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Concierge & Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <ToolCard
                    icon={Calendar}
                    color="purple"
                    title="Weekend Planner"
                    description="Discover great ideas of what to do in your area this weekend"
                    isLocked={!isPremium}
                    onClick={() => handleAction(onOpenWeekendPlanner)}
                />

                <ToolCard
                    icon={Utensils}
                    color="orange"
                    title="Dining Concierge"
                    description="Find the perfect dining spot for breakfast, lunch or dinner"
                    isLocked={!isPremium}
                    onClick={() => handleAction(onOpenDining)}
                />

                <ToolCard
                    icon={Wine}
                    color="pink"
                    title="Bar Scout"
                    description="Discover top-rated bars and lounges nearby."
                    isLocked={!isPremium}
                    onClick={() => handleAction(onOpenBar)}
                />


                <ToolCard
                    icon={Moon}
                    color="rose"
                    title={isSocial ? "Big Night Planner" : "Date Night Planner"}
                    description="Plan a complete evening: Drinks, Dinner & Event."
                    isLocked={!isPremium}
                    onClick={() => handleAction(onOpenDateNight)}
                />
            </div>
        </div>
    );
}

function ToolCard({ icon: Icon, color, title, description, isLocked, onClick }: any) {
    const colorClasses: any = {
        purple: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20", hover: "hover:border-purple-500/40" },
        orange: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20", hover: "hover:border-orange-500/40" },
        pink: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/20", hover: "hover:border-pink-500/40" },
        rose: { bg: "bg-rose-500/10", text: "text-rose-600", border: "border-rose-500/20", hover: "hover:border-rose-500/40" },
    };

    const c = colorClasses[color] || colorClasses.purple;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-4 cursor-pointer transition-all shadow-lg shadow-black/5 dark:shadow-black/20 border ${c.border} ${c.hover} hover:bg-${color}-50 dark:hover:bg-${color}-900/20`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ring-1 ring-${color}-500/30 ${c.bg} ${c.text} dark:text-${color}-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                {isLocked && <Lock className="w-5 h-5 text-slate-400" />}
            </div>
            <div>
                <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</span>
                <span className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed block group-hover:text-${color}-700 dark:group-hover:text-${color}-200/70 transition-colors`}>{description}</span>
            </div>
        </motion.div>
    );
}
