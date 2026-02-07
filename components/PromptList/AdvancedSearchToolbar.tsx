import React, { useState } from 'react';
import { AppSettings, NamingField } from '../../types';
import { Filter, X } from 'lucide-react';

interface AdvancedSearchToolbarProps {
    settings: AppSettings;
    activeFilters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
}

export const AdvancedSearchToolbar: React.FC<AdvancedSearchToolbarProps> = ({
    settings,
    activeFilters,
    onFilterChange,
    onClearFilters,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { enabled, fields } = settings.namingSchema;

    if (!enabled || fields.length === 0) return null;

    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    return (
        <div className="flex flex-col gap-2 mt-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 text-xs font-bold px-2 py-1.5 rounded-md transition-colors w-full
                    ${isExpanded || hasActiveFilters ? 'text-accent-3 bg-accent-3/10' : 'text-txt-muted hover:text-txt-primary hover:bg-canvas-hover'}
                `}
            >
                <Filter size={12} />
                <span>Advanced Filters {hasActiveFilters && `(${Object.keys(activeFilters).length})`}</span>
                {isExpanded && hasActiveFilters && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            onClearFilters();
                        }}
                        className="ml-auto p-0.5 hover:bg-accent-3/20 rounded z-10"
                        title="Clear all filters"
                    >
                        <X size={12} />
                    </span>
                )}
            </button>

            {isExpanded && (
                <div className="grid gap-2 p-2 bg-canvas-base border border-color-border rounded-lg animate-in fade-in slide-in-from-top-1">
                    {/* Dedicated Tags Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-txt-secondary uppercase tracking-wider">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={activeFilters['tags'] || ''}
                            onChange={(e) => onFilterChange('tags', e.target.value)}
                            placeholder="Filter by tags..."
                            className="w-full text-xs bg-canvas-card border border-color-border rounded px-2 py-1.5 focus:outline-none focus:border-accent-3 text-txt-primary placeholder:text-txt-muted"
                        />
                    </div>

                    <div className="h-px bg-border-default/50 my-1" />

                    {fields.map((field: NamingField) => (
                        <div key={field.id} className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-txt-secondary uppercase tracking-wider">
                                {field.label}
                            </label>
                            {field.type === 'select' ? (
                                <select
                                    value={activeFilters[field.id] || ''}
                                    onChange={(e) => onFilterChange(field.id, e.target.value)}
                                    className="w-full text-xs bg-canvas-card border border-color-border rounded px-2 py-1.5 focus:outline-none focus:border-accent-3 text-txt-primary"
                                >
                                    <option value="">All</option>
                                    {field.options?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={activeFilters[field.id] || ''}
                                    onChange={(e) => onFilterChange(field.id, e.target.value)}
                                    placeholder={`Filter by ${field.label}...`}
                                    className="w-full text-xs bg-canvas-card border border-color-border rounded px-2 py-1.5 focus:outline-none focus:border-accent-3 text-txt-primary placeholder:text-txt-muted"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
