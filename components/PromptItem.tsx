import React from 'react';
import { Trash2 } from 'lucide-react';
import { Prompt } from '../types';
import { formatDate } from '../utils';

interface PromptItemProps {
    prompt: Prompt;
    isSelected: boolean;
    isBulkSelected: boolean;
    sortMode: 'alpha' | 'recent';
    onSelect: (id: string) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onToggleBulkSelect: (id: string) => void;
}

export const PromptItem: React.FC<PromptItemProps> = React.memo(({
    prompt,
    isSelected,
    isBulkSelected,
    sortMode,
    onSelect,
    onDelete,
    onToggleBulkSelect,
}) => {
    return (
        <div
            className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all border relative ${isSelected
                ? 'bg-accent-3/10 border-accent-3 shadow-sm'
                : 'bg-transparent border-transparent hover:bg-canvas-hover hover:border-slate-200'
                }`}
        >
            <div className="mr-3 flex-shrink-0">
                <input
                    type="checkbox"
                    checked={isBulkSelected}
                    aria-label={`Select ${prompt.title || 'Untitled Prompt'}`}
                    onChange={(e) => {
                        e.stopPropagation();
                        onToggleBulkSelect(prompt.id);
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-accent-3 focus:ring-accent-3 accent-accent-3 cursor-pointer"
                />
            </div>
            <div className="flex-1 min-w-0 pr-2" onClick={() => onSelect(prompt.id)}>
                <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-accent-3' : 'text-txt-primary'}`}>
                    {prompt.title || 'Untitled Prompt'}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {prompt.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-txt-secondary border border-slate-200 rounded-md font-medium">
                            {tag}
                        </span>
                    ))}
                    <span className="text-[10px] text-txt-muted ml-1 font-mono">
                        {sortMode === 'recent'
                            ? formatDate(prompt.lastUpdated, 'short')
                            : `v${(prompt.versions?.length || 0) + 1}`
                        }
                    </span>
                </div>
            </div>
            <button
                onClick={(e) => onDelete(e, prompt.id)}
                className={`
          flex-shrink-0 p-2 rounded-md transition-all z-10 relative
          ${isSelected
                        ? 'opacity-100 text-txt-muted hover:text-accent-1 hover:bg-red-50'
                        : 'opacity-0 group-hover:opacity-100 text-txt-muted hover:text-accent-1 hover:bg-red-50'}
        `}
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}, (prev, next) => {
    return (
        prev.isSelected === next.isSelected &&
        prev.isBulkSelected === next.isBulkSelected &&
        prev.sortMode === next.sortMode &&
        prev.prompt.id === next.prompt.id &&
        prev.prompt.title === next.prompt.title &&
        prev.prompt.lastUpdated === next.prompt.lastUpdated &&
        prev.prompt.tags === next.prompt.tags &&
        prev.prompt.versions?.length === next.prompt.versions?.length
    );
});
