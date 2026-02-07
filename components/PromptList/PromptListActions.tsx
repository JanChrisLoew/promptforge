import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface PromptListActionsProps {
    selectedIdsCount: number;
    onBulkDelete: () => void;
    onCreate: () => void;
}

export const PromptListActions: React.FC<PromptListActionsProps> = ({
    selectedIdsCount,
    onBulkDelete,
    onCreate
}) => {
    return (
        <div className="flex gap-2">
            {selectedIdsCount > 0 ? (
                <button
                    onClick={onBulkDelete}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent-1 hover:bg-[#b0301c] text-white py-2.5 px-3 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 animate-in zoom-in-95"
                >
                    <Trash2 size={16} /> Delete Selected ({selectedIdsCount})
                </button>
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
