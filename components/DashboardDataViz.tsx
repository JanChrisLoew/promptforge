import React, { useMemo, useContext } from 'react';
import { Prompt, AppSettings } from '../types';
import { FolderOpen, Tag } from 'lucide-react';
import { SettingsContext } from '../contexts/SettingsContext';
import { DEFAULT_SETTINGS } from '../constants/settings.constants';

interface DashboardDataVizProps {
    prompts: Prompt[];
}

const COLORS = ['#00E5FF', '#2979FF', '#651FFF', '#D500F9', '#F50057', '#FF1744']; // Project accent colors

// Helper to calculate SVG arc path
const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
};

// Helper: Resolve from Naming Schema
const resolveFromSchema = (p: Prompt, settings: AppSettings): string | null => {
    if (!settings.namingSchema?.enabled || !settings.namingSchema.fields?.length || !p.metadata) {
        return null;
    }

    const firstField = settings.namingSchema.fields[0];
    const value = p.metadata[firstField.id];

    if (!value || !value.trim()) {
        return null;
    }

    if (settings.namingSchema.folderNamingType === 'valueOnly') {
        return value.trim();
    }
    const label = firstField.label || '';
    return `${label} ${value.trim()}`.trim();
};

// Helper: Resolve Top-Level Folder
const resolvePromptFolder = (p: Prompt, settings: AppSettings): string => {
    // Strategy 1: Naming Schema (Metadata) - HIGHEST PRIORITY
    // This matches the Sidebar's primary logic for dynamic folders
    const schemaFolder = resolveFromSchema(p, settings);
    if (schemaFolder) return schemaFolder;

    // Strategy 2: Legacy Category (Fallback when Schema disabled or no match)
    if (p.category) {
        return p.category;
    }

    return ''; // Uncategorized
};

/**
 * Custom hook to prepare data for the dashboard.
 * Extracts complexity from the main component.
 */
const useDashboardData = (prompts: Prompt[], settings: AppSettings = DEFAULT_SETTINGS) => {
    // 1. Prepare Folder Data (Top-Level Folders)
    const folderData = useMemo(() => {
        const counts: Record<string, number> = {};
        let total = 0;

        prompts.forEach(p => {
            const topLevel = resolvePromptFolder(p, settings);

            if (topLevel) {
                counts[topLevel] = (counts[topLevel] || 0) + 1;
            } else {
                counts['General'] = (counts['General'] || 0) + 1;
            }
            total++;
        });

        const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

        return {
            data: data.sort((a, b) => b.value - a.value),
            total
        };
    }, [prompts, settings]);

    // 2. Prepare Tag Data (Top 7)
    const tagData = useMemo(() => {
        const counts: Record<string, number> = {};
        prompts.forEach(p => {
            if (p.tags) {
                p.tags.forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            }
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 7);
    }, [prompts]);

    return { folderData, tagData };
}

export const DashboardDataViz: React.FC<DashboardDataVizProps> = ({ prompts }) => {
    const context = useContext(SettingsContext);
    const settings = context?.settings || DEFAULT_SETTINGS;

    const { folderData, tagData } = useDashboardData(prompts, settings);

    // --- Pie Chart Rendering Logic ---
    // Use useMemo to calculate slices safely
    const pieSlices = useMemo(() => {
        if (folderData.total === 0) return [];

        let currentPercent = 0;
        return folderData.data.map((slice, index) => {
            const startPercent = currentPercent;
            const slicePercent = slice.value / folderData.total;
            currentPercent += slicePercent;
            const endPercent = currentPercent;

            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(endPercent);
            const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

            const pathData = [
                `M 0 0`,
                `L ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L 0 0`,
            ].join(' ');

            return { path: pathData, color: COLORS[index % COLORS.length], ...slice };
        });
    }, [folderData]);

    const renderPie = () => {
        if (folderData.total === 0) return null;

        if (pieSlices.length === 1) {
            return <circle cx="0" cy="0" r="1" fill={pieSlices[0].color} />;
        }

        return pieSlices.map((slice, i) => (
            <path key={i} d={slice.path} fill={slice.color} stroke="var(--canvas-card)" strokeWidth="0.05" />
        ));
    };

    if (prompts.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500 delay-100">
            {/* Folder Distribution (Custom SVG Pie) */}
            <div className="bg-canvas-card border border-color-border rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-sm font-black text-txt-muted uppercase tracking-wider mb-6 flex items-center gap-2">
                    <FolderOpen size={16} />
                    Folder Distribution
                </h3>
                <div className="flex-1 flex items-center justify-center gap-8">
                    {/* The Pie */}
                    <div className="w-40 h-40 relative flex-shrink-0">
                        <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
                            {renderPie()}
                            {/* Inner Circle for Donut Effect */}
                            <circle cx="0" cy="0" r="0.6" fill="var(--canvas-card)" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-accent-3">{folderData.total}</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[160px] custom-scrollbar flex-1">
                        {folderData.data.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="font-bold text-txt-secondary truncate max-w-[100px]" title={item.name}>{item.name}</span>
                                </div>
                                <span className="font-mono text-txt-muted opacity-70 ml-2">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Tags (Horizontal Bars) */}
            <div className="bg-canvas-card border border-color-border rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-sm font-black text-txt-muted uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Tag size={16} />
                    Top Tags
                </h3>
                <div className="flex-1 flex flex-col gap-3 justify-center">
                    {tagData.length === 0 ? (
                        <div className="text-center text-txt-muted text-sm italic py-8">No tags used yet</div>
                    ) : (
                        tagData.map((item, index) => {
                            const maxVal = tagData[0].value;
                            const percent = (item.value / maxVal) * 100;
                            return (
                                <div key={item.name} className="flex items-center gap-3 text-xs">
                                    <div className="w-24 text-right truncate font-bold text-txt-secondary" title={item.name}>
                                        {item.name}
                                    </div>
                                    <div className="flex-1 h-2 bg-canvas-base rounded-full overflow-hidden relative">
                                        <div
                                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: COLORS[index % COLORS.length]
                                            }}
                                        />
                                    </div>
                                    <div className="w-6 font-mono text-txt-muted text-right opacity-70">
                                        {item.value}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
