import React from 'react';
import { Star, ArrowRight, Shield, Zap, History } from 'lucide-react';

interface LandingPageProps {
    onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    return (
        <div className="flex-1 flex flex-col items-center bg-canvas-base overflow-y-auto custom-scrollbar transition-colors duration-500">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-3/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-1/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl w-full px-8 py-20 relative z-10 space-y-32">
                {/* Hero Section */}
                <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-3/10 text-accent-3 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
                        <Star size={14} fill="currentColor" />
                        V1.0 Now Live
                    </div>

                    <h1 className="text-8xl font-black text-txt-primary tracking-tighter leading-[0.9] flex flex-col">
                        <span>Craft the Future</span>
                        <span className="text-accent-3">of Prompting</span>
                    </h1>

                    <p className="text-2xl text-txt-muted max-w-3xl mx-auto leading-relaxed font-medium">
                        PromptForge is the professional workspace for the modern prompt engineer.
                        Build, version, and optimize your AI interactions in a local-first environment.
                    </p>

                    <div className="pt-8 flex justify-center gap-6">
                        <button
                            onClick={onEnter}
                            className="flex items-center gap-3 px-10 py-5 bg-accent-3 text-white rounded-2xl hover:bg-accent-3/90 transition-all font-black text-lg shadow-2xl shadow-accent-3/40 hover:-translate-y-1 active:translate-y-0 active:scale-95 group"
                        >
                            Get Started for Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 overflow-visible">
                    <div className="bg-canvas-card border border-color-border p-10 rounded-3xl shadow-xl space-y-6 hover:border-accent-3/50 transition-all hover:shadow-2xl hover:-translate-y-2 group">
                        <div className="w-16 h-16 bg-accent-3/10 rounded-2xl flex items-center justify-center text-accent-3 group-hover:scale-110 transition-transform">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-txt-primary">Local-First Privacy</h3>
                        <p className="text-txt-muted leading-relaxed font-medium">
                            Your prompts never leave your machine. Full data sovereignty with instant local performance.
                        </p>
                    </div>

                    <div className="bg-canvas-card border border-color-border p-10 rounded-3xl shadow-xl space-y-6 hover:border-accent-2/50 transition-all hover:shadow-2xl hover:-translate-y-2 group">
                        <div className="w-16 h-16 bg-accent-2/10 rounded-2xl flex items-center justify-center text-accent-2 group-hover:scale-110 transition-transform">
                            <History size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-txt-primary">Smart Versioning</h3>
                        <p className="text-txt-muted leading-relaxed font-medium">
                            Never lose a refinement. Snapshot your progress and restore any previous version with a single click.
                        </p>
                    </div>

                    <div className="bg-canvas-card border border-color-border p-10 rounded-3xl shadow-xl space-y-6 hover:border-accent-1/50 transition-all hover:shadow-2xl hover:-translate-y-2 group">
                        <div className="w-16 h-16 bg-accent-1/10 rounded-2xl flex items-center justify-center text-accent-1 group-hover:scale-110 transition-transform">
                            <Zap size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-txt-primary">Fluid Performance</h3>
                        <p className="text-txt-muted leading-relaxed font-medium">
                            Designed for speed. Optimized search, instant theme switching, and zero-latency prompt editing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
