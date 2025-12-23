
import { Jar3D } from "@/components/Jar3D";

interface JarVisualizationProps {
    availableIdeasCount: number;
    isLoadingIdeas: boolean; // Renamed from loading/empty state check
    ideasLength: number;
}

export function JarVisualization({ availableIdeasCount, isLoadingIdeas, ideasLength }: JarVisualizationProps) {
    return (
        <div className="order-1 xl:order-2 flex flex-col items-center justify-center relative">
            <div className="relative w-full aspect-square max-w-[400px] flex items-center justify-center">
                {/* Decorative Glow */}
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />

                <div className="relative z-10 scale-100 transform transition-transform hover:scale-105 duration-700">
                    <Jar3D />
                </div>
            </div>
            <div className="mt-8 relative z-10 text-center">
                {isLoadingIdeas && ideasLength === 0 ? (
                    <p className="text-3xl font-bold text-slate-400 animate-pulse">...</p>
                ) : (
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{availableIdeasCount}</p>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                    {isLoadingIdeas && ideasLength === 0 ? 'Loading Ideas...' : 'Ideas Waiting'}
                </p>
            </div>
        </div>
    );
}
