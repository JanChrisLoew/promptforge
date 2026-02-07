import React from 'react';
import { ChevronDown, ChevronRight, FolderOpen, Folder } from 'lucide-react';
import { GroupNode } from '../hooks/usePromptListLogic';
import { PromptItem } from './PromptItem';
import { SortMode } from '../hooks/usePromptListLogic';

interface PromptFolderProps {
    node: GroupNode;
    expandedPaths: Set<string>;
    selectedId: string | null;
    selectedIds: Set<string>;
    sortMode: SortMode;
    onToggle: (path: string) => void;
    onSelect: (id: string) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onToggleBulkSelect: (id: string) => void;
    onMovePrompt: (id: string, category: string) => void;
    isManualMode: boolean;
}

export const PromptFolder: React.FC<PromptFolderProps> = ({
    node,
    expandedPaths,
    selectedId,
    selectedIds,
    sortMode,
    onToggle,
    onSelect,
    onDelete,
    onToggleBulkSelect,
    onMovePrompt,
    isManualMode,
}) => {
    const isExpanded = expandedPaths.has(node.path);
    const [isDragOver, setIsDragOver] = React.useState(false);

    // Recursive count helper
    const getCount = (n: GroupNode): number => {
        return n.items.length + Object.values(n.children).reduce((acc, child) => acc + getCount(child), 0);
    };
    const count = getCount(node);

    const handleDragOver = (e: React.DragEvent) => {
        if (!isManualMode) return;
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!isManualMode) return;
        e.preventDefault();
        setIsDragOver(false);
        const promptId = e.dataTransfer.getData('application/prompt-id');
        if (promptId) {
            // node.path is the full path, e.g. "Work/Project A". 
            // Since we use the category field which is flat-ish or manual, we assume the path maps to the category.
            // For nested manual folders, we might need adjustments, but for now assuming path = category value.
            // Wait, node.path includes parent names. P.category is usually just the prompt's category string.
            // If manual folders are "General", "Work", node.path is "General".
            // If we have nested manual folders? The system supports flat manual categories mostly but let's send node.path.
            // Actually, manual categories are typically single level in this app unless '/' is used in names.
            // Let's use node.path as the target category.
            onMovePrompt(promptId, node.path);
            // Auto expand on drop
            if (!isExpanded) {
                onToggle(node.path);
            }
        }
    };

    return (
        <div className="select-none">
            <button
                onClick={() => onToggle(node.path)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase rounded-md transition-colors group
                    ${isDragOver
                        ? 'bg-accent-surface text-accent-1 ring-1 ring-accent-1/50'
                        : 'text-txt-secondary hover:bg-canvas-hover'
                    }
                `}
            >
                {isExpanded ?
                    <ChevronDown size={14} className={isDragOver ? "text-accent-1" : "text-accent-3 transition-transform duration-200"} /> :
                    <ChevronRight size={14} className={isDragOver ? "text-accent-1" : "text-txt-muted group-hover:text-accent-3 transition-transform duration-200"} />
                }
                {isExpanded ?
                    <FolderOpen size={14} className={isDragOver ? "text-accent-1" : "text-accent-3 transition-colors duration-200"} /> :
                    <Folder size={14} className={isDragOver ? "text-accent-1" : "text-txt-muted group-hover:text-txt-primary transition-colors duration-200"} />
                }
                <span className="truncate">{node.name}</span>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] border font-bold min-w-[24px] text-center transition-colors
                    ${isDragOver
                        ? 'bg-accent-1 text-white border-transparent'
                        : 'bg-canvas-base text-txt-muted border-color-border group-hover:border-accent-3/30'
                    }
                `}>
                    {count}
                </span>
            </button>

            {isExpanded && (
                <div className="flex flex-col ml-2 pl-2 border-l border-color-border/40">
                    {/* Render Subfolders */}
                    {Object.values(node.children)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(childNode => (
                            <PromptFolder
                                key={childNode.path}
                                node={childNode}
                                expandedPaths={expandedPaths}
                                selectedId={selectedId}
                                selectedIds={selectedIds}
                                sortMode={sortMode}
                                onToggle={onToggle}
                                onSelect={onSelect}
                                onDelete={onDelete}
                                onToggleBulkSelect={onToggleBulkSelect}
                                onMovePrompt={onMovePrompt}
                                isManualMode={isManualMode}
                            />
                        ))}

                    {/* Render Items */}
                    <div className="space-y-0.5 pt-0.5">
                        {node.items.map(prompt => (
                            <PromptItem
                                key={`${prompt.id}-${prompt.lastUpdated}`}
                                prompt={prompt}
                                isSelected={selectedId === prompt.id}
                                isBulkSelected={selectedIds.has(prompt.id)}
                                sortMode={sortMode}
                                onSelect={onSelect}
                                onDelete={onDelete}
                                onToggleBulkSelect={onToggleBulkSelect}
                                isDraggable={isManualMode}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
