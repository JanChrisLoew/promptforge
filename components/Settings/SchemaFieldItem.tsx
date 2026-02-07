import React, { useState } from 'react';
import { NamingField } from '../../types';
import { Trash2, List } from 'lucide-react';
import { OptionEditorModal } from './OptionEditorModal';

interface SchemaFieldItemProps {
    field: NamingField;
    index: number;
    totalFields: number;
    onMove: (index: number, direction: 'up' | 'down') => void;
    onUpdate: (index: number, updates: Partial<NamingField>) => void;
    onRemove: (index: number) => void;
    onDragStart: (e: React.DragEvent, index: number) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, index: number) => void;
}

export const SchemaFieldItem: React.FC<SchemaFieldItemProps> = ({
    field,
    index,
    totalFields,
    onMove,
    onUpdate,
    onRemove,
    onDragStart,
    onDragOver,
    onDrop
}) => {
    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);

    return (
        <>
            <div
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
                className="flex items-center gap-3 p-3 bg-canvas-base hover:bg-canvas-subtle transition-colors group cursor-move"
            >
                <div className="flex flex-col gap-0.5 text-txt-muted/50 w-6 items-center">
                    <button
                        onClick={() => onMove(index, 'up')}
                        disabled={index === 0}
                        className="hover:text-accent-1 disabled:opacity-30 leading-none h-3 w-3 flex items-center justify-center"
                    >
                        ▲
                    </button>
                    <div className="h-px w-3 bg-border-default/30 my-0.5" />
                    <button
                        onClick={() => onMove(index, 'down')}
                        disabled={index === totalFields - 1}
                        className="hover:text-accent-1 disabled:opacity-30 leading-none h-3 w-3 flex items-center justify-center"
                    >
                        ▼
                    </button>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    {/* Label */}
                    <div className="col-span-4">
                        <input
                            type="text"
                            value={field.label}
                            onChange={(e) => onUpdate(index, { label: e.target.value })}
                            className="w-full bg-transparent border-b border-transparent focus:border-accent-1 hover:border-border-default px-1 py-1 text-sm outline-none transition-colors"
                            placeholder="Field Name"
                        />
                    </div>

                    {/* Type */}
                    <div className="col-span-3">
                        <select
                            value={field.type}
                            onChange={(e) => onUpdate(index, { type: e.target.value as NamingField['type'] })}
                            className="w-full bg-transparent border-b border-transparent focus:border-accent-1 hover:border-border-default px-1 py-1 text-sm outline-none cursor-pointer"
                        >
                            <option value="text">Short Text</option>
                            <option value="select">Dropdown</option>
                            <option value="date">Date</option>
                        </select>
                    </div>

                    {/* Config (Max Length / Options) */}
                    <div className="col-span-5">
                        {field.type === 'text' && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-txt-muted whitespace-nowrap">Max Len:</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={field.maxLength || ''}
                                    onChange={(e) => onUpdate(index, { maxLength: parseInt(e.target.value) || undefined })}
                                    className="w-16 bg-transparent border-b border-transparent focus:border-accent-1 hover:border-border-default px-1 py-1 text-sm outline-none text-center"
                                    placeholder="4"
                                />
                            </div>
                        )}
                        {field.type === 'select' && (
                            <button
                                onClick={() => setIsOptionModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-canvas-base border border-border-default rounded hover:border-accent-1 transition-colors group/btn w-full"
                            >
                                <List size={14} className="text-txt-muted group-hover/btn:text-accent-1 transition-colors" />
                                <span className="text-sm text-txt-primary truncate">
                                    {field.options?.length || 0} Options defined
                                </span>
                            </button>
                        )}
                        {field.type === 'date' && (
                            <span className="text-xs text-txt-muted italic">Format: YYYYMMDD</span>
                        )}
                    </div>
                </div>

                <div className="w-8 flex justify-center">
                    <button
                        onClick={() => onRemove(index)}
                        className="p-1.5 text-txt-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Remove Field"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <OptionEditorModal
                key={isOptionModalOpen ? 'open' : 'closed'}
                isOpen={isOptionModalOpen}
                onClose={() => setIsOptionModalOpen(false)}
                onSave={(newOptions) => onUpdate(index, { options: newOptions })}
                initialOptions={field.options || []}
                fieldLabel={field.label}
            />
        </>
    );
};
