import React, { useState } from 'react';
import { X, Check, FileText, Plus, Trash2 } from 'lucide-react';

interface OptionEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (options: string[]) => void;
    initialOptions: string[];
    fieldLabel: string;
}

export const OptionEditorModal: React.FC<OptionEditorModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialOptions,
    fieldLabel
}) => {
    const [options, setOptions] = useState<string[]>(initialOptions);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleMoveOption = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === options.length - 1)
        ) {
            return;
        }

        const newOptions = [...options];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
        setOptions(newOptions);
    };

    const handleSave = () => {
        // Filter out empty options
        const cleanedOptions = options.map(s => s.trim()).filter(s => s.length > 0);
        onSave(cleanedOptions);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-canvas-base/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-canvas-card border border-border-default rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-default flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-1/10 rounded-lg text-accent-1">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-txt-primary">Edit Options</h3>
                            <p className="text-xs text-txt-muted font-medium uppercase tracking-wide">
                                Field: {fieldLabel || 'Untitled'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-txt-muted hover:text-txt-primary hover:bg-canvas-hover rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Table Layout */}
                <div className="flex-1 overflow-y-auto p-0 min-h-0">
                    <div className="w-full text-left border-collapse">
                        <div className="sticky top-0 z-10 grid grid-cols-[3rem_1fr_4rem] gap-2 px-6 py-2 bg-canvas-subtle border-b border-border-default text-xs font-bold text-txt-muted uppercase tracking-wider">
                            <div className="text-center">#</div>
                            <div>Value</div>
                            <div className="text-center">Actions</div>
                        </div>

                        <div className="divide-y divide-border-default">
                            {options.map((option, index) => (
                                <div key={index} className="grid grid-cols-[3rem_1fr_4rem] gap-2 px-6 py-2 items-center hover:bg-canvas-subtle/50 transition-colors group">
                                    <div className="flex flex-col gap-0.5 items-center justify-center text-txt-muted/50">
                                        <button
                                            onClick={() => handleMoveOption(index, 'up')}
                                            disabled={index === 0}
                                            className="hover:text-accent-1 disabled:opacity-20 leading-none h-3 w-3 flex items-center justify-center"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => handleMoveOption(index, 'down')}
                                            disabled={index === options.length - 1}
                                            className="hover:text-accent-1 disabled:opacity-20 leading-none h-3 w-3 flex items-center justify-center"
                                        >
                                            ▼
                                        </button>
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent focus:border-accent-1 hover:border-border-default px-2 py-1.5 text-sm outline-none transition-all placeholder:text-txt-muted/30"
                                            placeholder="Enter option value..."
                                            autoFocus={index === options.length - 1 && option === ''}
                                        />
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => handleRemoveOption(index)}
                                            className="p-1.5 text-txt-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove Option"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {options.length === 0 && (
                                <div className="p-8 text-center text-txt-muted text-sm italic">
                                    No options defined. Add one below.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-default bg-canvas-subtle/30 flex justify-between gap-3 rounded-b-2xl flex-shrink-0">
                    <button
                        onClick={handleAddOption}
                        className="flex items-center gap-2 px-4 py-2 bg-canvas-base border border-border-default text-accent-1 font-bold rounded-xl hover:bg-canvas-hover hover:border-accent-1 transition-all text-sm"
                    >
                        <Plus size={16} />
                        Add Option
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-txt-secondary hover:text-txt-primary hover:bg-canvas-hover rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2.5 bg-accent-1 text-white text-sm font-bold rounded-xl hover:bg-accent-1/90 shadow-lg active:scale-95 transition-all"
                        >
                            <Check size={16} />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
