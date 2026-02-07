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
    isDraggable?: boolean;
}

const SelectionCheckbox: React.FC<{
    isBulkSelected: boolean;
    title: string;
    id: string;
    onToggle: (id: string) => void;
}> = ({ isBulkSelected, title, id, onToggle }) => (
    <div className={`mr-2 flex-shrink-0 mt-0.5 ${!isBulkSelected ? 'opacity-0 group-hover:opacity-100 transition-opacity' : 'opacity-100'}`}>
        <input
            type="checkbox"
            checked={isBulkSelected}
            aria-label={`Select ${title || 'Untitled Prompt'}`}
            onChange={(e) => {
                e.stopPropagation();
                onToggle(id);
            }}
            className="w-3.5 h-3.5 rounded border-2 border-txt-muted/50 text-accent-3 focus:ring-0 focus:ring-offset-0 bg-transparent checked:border-accent-3 checked:bg-accent-3 cursor-pointer transition-all"
        />
    </div>
);

const DeleteButton: React.FC<{
    id: string;
    onDelete: (e: React.MouseEvent, id: string) => void;
}> = ({ id, onDelete }) => (
    <button
        onClick={(e) => onDelete(e, id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-txt-muted hover:text-accent-1 hover:bg-accent-1/10 rounded transition-all ml-1"
        title="Delete"
    >
        <Trash2 size={14} />
    </button>
);

export const PromptItem: React.FC<PromptItemProps> = ({
    prompt,
    isSelected,
    isBulkSelected,
    sortMode,
    onSelect,
    onDelete,
    onToggleBulkSelect,
    isDraggable = false,
}) => {
    const handleDragStart = (e: React.DragEvent) => {
        if (!isDraggable) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('application/prompt-id', prompt.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable={isDraggable}
            onDragStart={handleDragStart}
            className={`group flex items-start p-2 rounded-md cursor-pointer transition-all relative select-none ${isSelected
                ? 'bg-accent-3/10'
                : 'bg-transparent hover:bg-canvas-hover'
                } ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
            onClick={() => onSelect(prompt.id)}
        >
            {isSelected && (
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-accent-3 rounded-r-full"></div>
            )}

            <SelectionCheckbox
                isBulkSelected={isBulkSelected}
                title={prompt.title}
                id={prompt.id}
                onToggle={onToggleBulkSelect}
            />

            <div className="flex-1 min-w-0 pr-1">
                <h3 className={`font-semibold text-sm truncate leading-tight mb-1 ${isSelected ? 'text-accent-3' : 'text-txt-primary'}`} title={prompt.title}>
                    {prompt.title || 'Untitled Prompt'}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 opacity-80">
                    {prompt.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-px bg-canvas-base border border-color-border rounded text-txt-secondary tracking-tight">
                            {tag}
                        </span>
                    ))}
                    <span className="text-[10px] text-txt-muted ml-auto font-mono">
                        {sortMode === 'recent'
                            ? formatDate(prompt.lastUpdated, 'short')
                            : `v${(prompt.versions?.length || 0) + 1}`
                        }
                    </span>
                </div>
            </div>

            <DeleteButton id={prompt.id} onDelete={onDelete} />
        </div>
    );
};
