"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, MapPin, Plus, Sparkles, History, Settings, HelpCircle, Calendar, Utensils, Wine } from "lucide-react";
import { useState, useEffect } from "react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSection?: string;
}

export function HelpModal({ isOpen, onClose, initialSection }: HelpModalProps) {
    const [activeSection, setActiveSection] = useState(initialSection || "intro");

    useEffect(() => {
        if (isOpen && initialSection) {
            setActiveSection(initialSection);
        }
    }, [isOpen, initialSection]);

    const sections = [
        { id: "intro", title: "Introduction", icon: BookOpen },
        { id: "getting-started", title: "Getting Started", icon: MapPin },
        { id: "dashboard", title: "The Dashboard", icon: History },
        { id: "dining-concierge", title: "Dining Concierge", icon: Utensils },
        { id: "bar-concierge", title: "Bar Concierge", icon: Wine },
        { id: "adding-ideas", title: "Adding Ideas", icon: Plus },
        { id: "weekend-planner", title: "Weekend Planner", icon: Calendar },
        { id: "spinning", title: "Spinning the Jar", icon: Sparkles },
        { id: "history", title: "History & Logs", icon: History },
        { id: "settings", title: "Settings", icon: Settings },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case "intro":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Welcome to Date Jar</h3>
                        <p className="text-slate-300">
                            Date Jar is designed to spice up your relationship by taking the indecision out of your next date!
                            Create a shared collection of date ideas and let the jar decide for you.
                        </p>
                    </div>
                );
            case "getting-started":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Getting Started</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300">
                            <li><strong>Sign Up:</strong> Create an account with your name and your location.</li>
                            <li><strong>One Account:</strong> You only need one account per couple. Share the login or invite your partner.</li>
                            <li><strong>Location:</strong> Setting your location helps us suggest relevant ideas.</li>
                        </ul>
                    </div>
                );
            case "dashboard":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">The Dashboard</h3>
                        <p className="text-slate-300">Your central hub for your next date.</p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300">
                            <li><strong>The Jar:</strong> Visual representation of your ideas.</li>
                            <li><strong>In the Jar:</strong> Active ideas waiting to be picked.</li>
                            <li><strong>Past Dates:</strong> Ideas you've already completed.</li>
                        </ul>
                    </div>
                );
            case "dining-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Dining Concierge <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-300">
                            Can't decide where to eat? Let our AI Concierge find the perfect spot for you.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300">
                            <li><strong>Preferences:</strong> Enter your craving (e.g., "Sushi", "Italian") and desired vibe (e.g., "Romantic", "Lively").</li>
                            <li><strong>Recommendations:</strong> The AI will find 5 top-rated local restaurants matching your criteria.</li>
                            <li><strong>Go Tonight:</strong> Found a winner? Click <span className="text-yellow-400">Go Tonight</span> to instantly select it as your date. We'll even fetch opening hours and provide a direct link to their website!</li>
                            <li><strong>Add to Jar:</strong> Want to save it for later? Click "Add" to drop it in your jar for a future spin.</li>
                        </ul>
                    </div>
                );
            case "bar-concierge":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Bar Concierge <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full ml-2">PREMIUM</span></h3>
                        <p className="text-slate-300">
                            Looking for a place to grab a drink? The Bar Concierge helps you discover great local spots.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300">
                            <li><strong>Drink Types:</strong> Select what you're in the mood for (e.g., "Cocktails", "Craft Beer", "Wine").</li>
                            <li><strong>Vibe:</strong> Choose the atmosphere (e.g., "Speakeasy", "Rooftop", "Dive Bar").</li>
                            <li><strong>Top Picks:</strong> Get curated recommendations with ratings and reviews.</li>
                            <li><strong>Go Tonight:</strong> Instantly pick a spot for your evening out.</li>
                        </ul>
                    </div>
                );
            case "adding-ideas":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Adding Date Ideas</h3>
                        <div className="space-y-2">
                            <h4 className="font-bold text-primary">Manual Entry</h4>
                            <p className="text-slate-300">Click the <Plus className="inline w-4 h-4" /> button. Fill in details like Description, Setting (Indoor/Outdoor), Cost, and Time.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-secondary">AI Surprise Me</h4>
                            <p className="text-slate-300">Stuck on what to do? The AI can generate custom date ideas tailored to your location and interests.</p>
                            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-sm mt-2">
                                <li>Click <strong>"Add Idea"</strong> from the dashboard.</li>
                                <li>Click the <strong><Sparkles className="inline w-3 h-3 text-yellow-400" /> Surprise Me</strong> button.</li>
                                <li>Select a category (Activity, Meal, or Event).</li>
                                <li>The AI will use your <strong>Interests</strong> (from Settings) to generate a unique plan.</li>
                                <li>Review the idea and click "Add" to drop it in your jar.</li>
                            </ol>
                        </div>
                    </div>
                );
            case "weekend-planner":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Weekend Planner</h3>
                        <p className="text-slate-300">
                            Need a full plan for the upcoming weekend? The AI Weekend Planner creates a curated list of 5 distinct date ideas based on your location and the current day of the week.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300">
                            <li><strong>Smart Timing:</strong> If it's Monday-Thursday, it plans for the upcoming weekend. If it's Friday-Sunday, it plans for the current weekend.</li>
                            <li><strong>Local Context:</strong> Uses your location to find relevant events and weather-appropriate activities.</li>
                            <li><strong>Offline Mode:</strong> Even if the AI is busy, you'll get a set of great fallback suggestions so you're never left without a plan.</li>
                        </ul>
                    </div>
                );
            case "spinning":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Spinning the Jar</h3>
                        <p className="text-slate-300">Ready for a date? Click <strong>Spin Jar</strong> to let fate decide.</p>

                        <div className="space-y-3">
                            <div>
                                <h4 className="font-bold text-white text-sm">Filters</h4>
                                <p className="text-slate-300 text-sm mb-2">Narrow down the random selection to fit your current mood:</p>
                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                                    <li><strong>Category:</strong> Filter by Activity, Meal, or Event.</li>
                                    <li><strong>Duration:</strong> Set a maximum time limit (e.g., "Under 2 hours").</li>
                                    <li><strong>Cost:</strong> Set a budget cap (e.g., "Free" or "$$").</li>
                                    <li><strong>Energy:</strong> Choose how active you want to be (Low, Medium, High).</li>
                                    <li><strong>Time:</strong> Filter for Day or Evening activities.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-white text-sm">The Reveal & Locations</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                                    <li><strong>Accept Date:</strong> Marks the idea as "Selected" and moves it to your history.</li>
                                    <li><strong>Find Places:</strong> For generic ideas (e.g., "Go Bowling"), click <strong>"Find Specific Places"</strong> to let AI find top-rated venues near you.</li>
                                    <li><strong>Find Food:</strong> Planning an activity? Use the <strong>"Find food nearby"</strong> button to instantly search for restaurants near that location using the Dining Concierge.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case "history":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Managing History</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300">
                            <li><strong>Rate:</strong> Give your completed dates a star rating.</li>
                            <li><strong>Repeat:</strong> Click the Copy icon to put an idea back in the jar.</li>
                            <li><strong>Delete:</strong> Click the Trash icon to remove it.</li>
                            <li><strong>Deletion Log:</strong> Check Settings &gt; View Deletion History to see an audit log of removed items.</li>
                        </ul>
                    </div>
                );
            case "settings":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Settings & Configuration</h3>
                        <p className="text-slate-300">Customize your Date Jar experience.</p>

                        <div className="space-y-3">
                            <div>
                                <h4 className="font-bold text-white text-sm">Profile Settings</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                                    <li><strong>Couple Location:</strong> The general city or area for your dates (e.g., "New York, NY"). This is the default search area for the Concierge.</li>
                                    <li><strong>Your Home Town:</strong> Your specific neighborhood (e.g., "Brooklyn"). Helps refine searches to be closer to home.</li>
                                    <li><strong>Your Interests:</strong> A comma-separated list of things you love (e.g., "Sushi, Hiking, Jazz"). The AI uses this to tailor "Surprise Me" suggestions specifically to you.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-white text-sm">Partner Management</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                                    <li><strong>Invite Partner:</strong> Use the code on the dashboard to invite your significant other.</li>
                                    <li><strong>Regenerate Code:</strong> (Creator only) If you need a new invite link or want to invalidate an old one, use this option.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-white text-sm">Data & Privacy</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                                    <li><strong>Deletion History:</strong> View a log of who deleted which date ideas and when.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-red-400 text-sm">Danger Zone (Creator Only)</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                                    <li><strong>Empty Jar:</strong> Permanently deletes ALL ideas and past date history. This cannot be undone.</li>
                                    <li><strong>Delete Partner:</strong> Removes your partner from the jar and deletes all their contributions.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-4xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Sidebar */}
                        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 py-4 md:p-4 shrink-0 flex flex-col md:block">
                            <div className="flex items-center gap-2 mb-4 md:mb-6 px-6 md:px-2 pr-14 md:pr-2">
                                <HelpCircle className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-bold text-white whitespace-nowrap">Help Center</h2>
                            </div>
                            <nav className="flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-1 overflow-x-auto md:overflow-visible px-6 md:px-0 pb-2 md:pb-0 min-h-0 no-scrollbar snap-x">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-full md:rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 snap-start border ${activeSection === section.id
                                            ? "bg-primary/20 text-white border-primary/30"
                                            : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"
                                            }`}
                                    >
                                        <section.icon className="w-4 h-4" />
                                        {section.title}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-white/5 to-transparent">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
