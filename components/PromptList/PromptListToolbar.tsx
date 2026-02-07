import React from 'react';
import { Search, Clock, SortAsc } from 'lucide-react';
import { SortMode } from '../../hooks/usePromptListLogic';

interface PromptListToolbarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortMode: SortMode;
    setSortMode: (mode: SortMode) => void; // Expecting direct setter or wrapper
}

export const PromptListToolbar: React.FC<PromptListToolbarProps> = ({
    searchTerm,
    setSearchTerm,
    sortMode,
    setSortMode
}) => {
    return (
        <div className="flex items-center gap-2">
            <div className="relative group flex-1">
                <Search className="absolute left-3 top-2.5 text-txt-muted group-focus-within:text-accent-3 transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Search library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-canvas-base border border-color-border rounded-lg text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-3/50 focus:border-accent-3 transition-all placeholder:text-txt-muted shadow-sm"
                />
            </div>
            <button
                onClick={() => setSortMode(sortMode === 'recent' ? 'alpha' : 'recent')}
                className="p-2 border border-color-border rounded-lg bg-canvas-base text-txt-secondary hover:text-accent-3 hover:border-accent-3 transition-colors shadow-sm"
                title={`Sort by: ${sortMode === 'recent' ? 'Last Updated' : 'Name (A-Z)'}`}
            >
                {sortMode === 'recent' ? <Clock size={18} /> : <SortAsc size={18} />}
            </button>
        </div>
    );
};
