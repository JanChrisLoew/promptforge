import React from 'react';
import { Plus, Trash2, Download, PanelLeftClose } from 'lucide-react';

interface PromptListActionsProps {
    selectedIdsCount: number;
    onBulkDelete: () => void;
    onBulkDownload: () => void;
    onCreate: () => void;
    onToggle: () => void;
    isOpen: boolean;
}

export const PromptListActions: React.FC<PromptListActionsProps> = ({
    selectedIdsCount,
    onBulkDelete,
    onBulkDownload,
    onCreate,
    onToggle,
    isOpen
}) => {
    return (
        <div className="flex gap-2 items-center">
            {isOpen && (
                <button
                    onClick={onToggle}
                    className="p-1.5 rounded-md transition-all text-txt-muted hover:text-txt-primary hover:bg-canvas-hover"
                    title="Close Library"
                >
                    <PanelLeftClose size={18} />
                </button>
            )}
            {selectedIdsCount > 0 ? (
                <div className="flex-1 flex gap-2">
                    <button
                        onClick={onBulkDownload}
                        className="flex-1 flex items-center justify-center gap-2 bg-accent-3 hover:bg-accent-3/80 text-white py-2.5 px-3 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 animate-in zoom-in-95"
                    >
                        <Download size={16} /> Download
                    </button>
                    <button
                        onClick={onBulkDelete}
                        className="flex-1 flex items-center justify-center gap-2 bg-accent-1 hover:bg-[#b0301c] text-white py-2.5 px-3 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 animate-in zoom-in-95"
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            ) : (
                <button
                    onClick={onCreate}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent-1 hover:bg-[#b0301c] text-white py-2.5 px-3 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95"
                >
                    <Plus size={16} /> New Prompt
                </button>
            )}
        </div>
    );
};
