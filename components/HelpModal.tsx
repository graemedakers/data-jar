"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, MapPin, Plus, Sparkles, History, Settings, HelpCircle } from "lucide-react";
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
        { id: "adding-ideas", title: "Adding Ideas", icon: Plus },
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
                            <li><strong>Sign Up:</strong> Create an account with your partner's name and your location.</li>
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
                            <p className="text-slate-300">Stuck? Click "Add Idea" then the <Sparkles className="inline w-4 h-4" /> <strong>Surprise Me</strong> button to let AI generate a creative idea for you.</p>
                        </div>
                    </div>
                );
            case "spinning":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Spinning the Jar</h3>
                        <p className="text-slate-300">Ready for a date? Click <strong>Spin Jar</strong>.</p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300">
                            <li><strong>Filters:</strong> You can filter by Duration, Cost, or Setting before spinning.</li>
                            <li><strong>The Reveal:</strong> The jar picks one random idea matching your filters.</li>
                            <li><strong>Accept:</strong> Click "Accept Date" to move it to your history.</li>
                        </ul>
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
                        <h3 className="text-xl font-bold text-white">Settings & Invites</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300">
                            <li><strong>Invite Partner:</strong> Click the Invite Code on the dashboard to copy a link for your partner.</li>
                            <li><strong>Location:</strong> Update your city in Settings.</li>
                            <li><strong>Empty Jar:</strong> Use the "Danger Zone" to delete all data if needed.</li>
                        </ul>
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
                        className="glass-card w-full max-w-4xl h-[80vh] flex overflow-hidden relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Sidebar */}
                        <div className="w-1/3 border-r border-white/10 bg-black/20 p-4 overflow-y-auto">
                            <div className="flex items-center gap-2 mb-6 px-2">
                                <HelpCircle className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-bold text-white">Help Center</h2>
                            </div>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === section.id
                                            ? "bg-primary/20 text-white border border-primary/30"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <section.icon className="w-4 h-4" />
                                        {section.title}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-white/5 to-transparent">
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
