import React from 'react';
import { ChevronDown, ChevronRight, FolderOpen, Folder } from 'lucide-react';
import { Prompt } from '../types';
import { PromptItem } from './PromptItem';

interface PromptCategoryProps {
    category: string;
    items: Prompt[];
    isExpanded: boolean;
    selectedId: string | null;
    selectedIds: Set<string>;
    sortMode: 'alpha' | 'recent';
    onToggle: (category: string) => void;
    onSelect: (id: string) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onToggleBulkSelect: (id: string) => void;
}

export const PromptCategory: React.FC<PromptCategoryProps> = React.memo(({
    category,
    items,
    isExpanded,
    selectedId,
    selectedIds,
    sortMode,
    onToggle,
    onSelect,
    onDelete,
    onToggleBulkSelect,
}) => {
    return (
        <div className="mb-2">
            <button
                onClick={() => onToggle(category)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-txt-secondary uppercase hover:bg-canvas-hover rounded-md transition-colors"
            >
                {isExpanded ? <ChevronDown size={14} className="text-accent-2" /> : <ChevronRight size={14} className="text-txt-muted" />}
                {isExpanded ? <FolderOpen size={14} className="text-accent-2" /> : <Folder size={14} className="text-txt-muted" />}
                {category} <span className="ml-auto bg-slate-100 text-txt-muted px-2 py-0.5 rounded-full text-[10px]">{items.length}</span>
            </button>

            {isExpanded && (
                <div className="pl-2 mt-1 space-y-1">
                    {items.map(prompt => (
                        <PromptItem
                            key={prompt.id}
                            prompt={prompt}
                            isSelected={selectedId === prompt.id}
                            isBulkSelected={selectedIds.has(prompt.id)}
                            sortMode={sortMode}
                            onSelect={onSelect}
                            onDelete={onDelete}
                            onToggleBulkSelect={onToggleBulkSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
