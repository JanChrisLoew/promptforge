import React, { useMemo } from 'react';
import { Layout, Database, Activity, Tag, Clock, ArrowRight } from 'lucide-react';
import { Prompt } from '../types';
import { formatDate } from '../utils';
import { DashboardDataViz } from './DashboardDataViz';

interface DashboardProps {
    prompts: Prompt[];
    stats: {
        totalPrompts: number;
        totalVersions: number;
        uniqueTags: number;
    };
    onCreatePrompt: () => void;
    onImportLibrary: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectPrompt: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    prompts,
    stats,
    onCreatePrompt,
    onImportLibrary,
    onSelectPrompt
}) => {
    const recentPrompts = useMemo(() => {
        return [...prompts]
            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
            .slice(0, 5);
    }, [prompts]);

    return (
        <div className="flex-1 flex flex-col items-center bg-canvas-base p-8 relative overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
            <div className="max-w-6xl w-full space-y-10">
                {/* Compact Header */}
                <div className="flex items-end justify-between border-b border-color-border pb-6">
                    <div>
                        <h2 className="text-xs font-black text-accent-3 uppercase tracking-[0.4em] mb-2">Library Overview</h2>
                        <h1 className="text-4xl font-black text-txt-primary tracking-tight">Dashboard</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCreatePrompt}
                            className="flex items-center gap-2 px-4 py-2.5 bg-accent-3 text-white rounded-xl hover:bg-accent-3/90 transition-all font-bold text-sm shadow-md"
                        >
                            <Layout size={18} /> New Prompt
                        </button>
                    </div>
                </div>

                {/* Stats Grid - more compact */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-canvas-card p-6 rounded-2xl border border-color-border shadow-sm flex items-center gap-6 transition-all hover:border-accent-3/30 group">
                        <div className="w-12 h-12 bg-accent-3/10 rounded-xl flex items-center justify-center text-accent-3 group-hover:scale-110 transition-transform">
                            <Database size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-txt-primary">{stats.totalPrompts}</p>
                            <p className="text-[10px] text-txt-muted uppercase tracking-wider font-bold">Total Prompts</p>
                        </div>
                    </div>
                    <div className="bg-canvas-card p-6 rounded-2xl border border-color-border shadow-sm flex items-center gap-6 transition-all hover:border-accent-2/30 group">
                        <div className="w-12 h-12 bg-accent-2/10 rounded-xl flex items-center justify-center text-accent-2 group-hover:scale-110 transition-transform">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-txt-primary">{stats.totalVersions}</p>
                            <p className="text-[10px] text-txt-muted uppercase tracking-wider font-bold">Versions</p>
                        </div>
                    </div>
                    <div className="bg-canvas-card p-6 rounded-2xl border border-color-border shadow-sm flex items-center gap-6 transition-all hover:border-accent-1/30 group">
                        <div className="w-12 h-12 bg-accent-1/10 rounded-xl flex items-center justify-center text-accent-1 group-hover:scale-110 transition-transform">
                            <Tag size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-txt-primary">{stats.uniqueTags}</p>
                            <p className="text-[10px] text-txt-muted uppercase tracking-wider font-bold">Unique Tags</p>
                        </div>
                    </div>
                </div>

                {/* Data Visualization */}
                <DashboardDataViz prompts={prompts} />

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Prompts */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-sm font-black text-txt-muted uppercase tracking-wider flex items-center gap-2">
                            <Clock size={16} />
                            Recent Activity
                        </h3>
                        <div className="space-y-2">
                            {recentPrompts.length === 0 ? (
                                <div className="bg-canvas-card border border-dashed border-color-border rounded-xl p-8 text-center text-txt-muted italic text-sm">
                                    No activity yet. Select a prompt to get started.
                                </div>
                            ) : (
                                recentPrompts.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => onSelectPrompt(p.id)}
                                        className="w-full flex items-center justify-between p-4 bg-canvas-card border border-color-border rounded-xl hover:border-accent-3 hover:translate-x-1 transition-all group"
                                    >
                                        <div className="flex flex-col items-start min-w-0 pr-4 text-left">
                                            <span className="font-bold text-sm text-txt-primary truncate group-hover:text-accent-3 transition-colors">{p.title || 'Untitled Prompt'}</span>
                                            <span className="text-[10px] text-txt-muted mt-1">{formatDate(p.lastUpdated)}</span>
                                        </div>
                                        <ArrowRight size={14} className="text-txt-muted group-hover:text-accent-3 transition-colors" />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Library Health / Tips */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-txt-muted uppercase tracking-wider">Quick Actions</h3>
                        <div className="bg-canvas-card border border-color-border rounded-2xl p-6 space-y-4">
                            <label className="flex items-center gap-3 w-full px-4 py-3 bg-canvas-base border border-color-border rounded-xl hover:bg-canvas-hover transition-all font-bold text-xs cursor-pointer text-txt-primary">
                                <Database size={16} className="text-accent-3" /> Import JSON Library
                                <input type="file" accept=".json" onChange={onImportLibrary} className="hidden" />
                            </label>

                            <div className="pt-4 border-t border-color-border space-y-3">
                                <div className="p-3 bg-accent-1/5 rounded-xl border border-accent-1/10 border-l-4">
                                    <p className="text-[10px] font-bold text-accent-1 uppercase mb-1">Backup Reminder</p>
                                    <p className="text-[10px] text-txt-muted leading-relaxed">Everything is stored locally. Export often to keep your data safe across sessions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
