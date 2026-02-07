import React, { useMemo, useContext } from 'react';
import { Prompt, AppSettings } from '../types';
import { FolderOpen, BarChart2 } from 'lucide-react';
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

    // 2. Prepare Status Data
    const statusData = useMemo(() => {
        const counts: Record<string, number> = {
            'Draft': 0,
            'Review': 0,
            'Approved': 0,
            'Archived': 0
        };
        let maxCount = 0;

        prompts.forEach(p => {
            const status = p.status ? (p.status.charAt(0).toUpperCase() + p.status.slice(1)) : 'Draft';
            const key = Object.keys(counts).find(k => k.toLowerCase() === status.toLowerCase()) || 'Draft';
            counts[key] = (counts[key] || 0) + 1;
        });

        const data = Object.entries(counts).map(([name, value]) => {
            if (value > maxCount) maxCount = value;
            return { name, value };
        });

        return { data, maxCount };
    }, [prompts]);

    return { folderData, statusData };
}

export const DashboardDataViz: React.FC<DashboardDataVizProps> = ({ prompts }) => {
    const context = useContext(SettingsContext);
    const settings = context?.settings || DEFAULT_SETTINGS;

    const { folderData, statusData } = useDashboardData(prompts, settings);

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
                            <span className="text-2xl font-black text-txt-primary">{folderData.total}</span>
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

            {/* Status Distribution (CSS Bar Chart) */}
            <div className="bg-canvas-card border border-color-border rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-sm font-black text-txt-muted uppercase tracking-wider mb-6 flex items-center gap-2">
                    <BarChart2 size={16} />
                    Workflow Status
                </h3>
                <div className="flex-1 flex flex-col justify-center gap-4">
                    {statusData.data.map((item, index) => {
                        const percent = statusData.maxCount > 0 ? (item.value / statusData.maxCount) * 100 : 0;
                        return (
                            <div key={index} className="w-full">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="font-bold text-txt-primary">{item.name}</span>
                                    <span className="text-txt-muted font-mono">{item.value}</span>
                                </div>
                                <div className="h-2 w-full bg-canvas-subtle rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${percent}%`,
                                            backgroundColor: COLORS[index % COLORS.length],
                                            opacity: item.value === 0 ? 0.3 : 1
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
