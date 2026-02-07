/* eslint-disable max-lines-per-function */
import React from 'react';
import { NamingSchema, NamingField } from '../../types';
import { Plus } from 'lucide-react';
import { generateId } from '../../utils';
import { SchemaFieldItem } from './SchemaFieldItem';

interface SchemaBuilderProps {
    schema: NamingSchema;
    onUpdate: (schema: NamingSchema) => void;
}

export const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ schema, onUpdate }) => {

    const addField = () => {
        const newField: NamingField = {
            id: generateId(),
            label: 'New Field',
            type: 'text',
            maxLength: 3
        };
        onUpdate({
            ...schema,
            fields: [...schema.fields, newField]
        });
    };

    const removeField = (index: number) => {
        const newFields = [...schema.fields];
        newFields.splice(index, 1);
        onUpdate({ ...schema, fields: newFields });
    };

    const updateField = (index: number, updates: Partial<NamingField>) => {
        const newFields = [...schema.fields];
        newFields[index] = { ...newFields[index], ...updates };
        onUpdate({ ...schema, fields: newFields });
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === schema.fields.length - 1)
        ) return;

        const newFields = [...schema.fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
        onUpdate({ ...schema, fields: newFields });
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (isNaN(sourceIndex)) return;

        const newFields = [...schema.fields];
        const [movedField] = newFields.splice(sourceIndex, 1);
        newFields.splice(targetIndex, 0, movedField);
        onUpdate({ ...schema, fields: newFields });
    };

    return (
        <div className="space-y-6">
            <div className="bg-canvas-subtle p-4 rounded-lg border border-border-default/50">
                <h3 className="text-lg font-semibold text-accent-1 mb-2">Naming Convention</h3>
                <p className="text-sm text-txt-muted mb-6 max-w-2xl">
                    Define the structure of your document codes. Each field represents a segment of the filename.
                </p>

                {/* Master Switch */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-canvas-base border border-border-default rounded-lg">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={schema.enabled}
                            onChange={(e) => onUpdate({ ...schema, enabled: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-canvas-subtle peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-1"></div>
                    </label>
                    <div>
                        <span className="text-sm font-bold text-txt-primary block">Enable Naming Convention</span>
                        <span className="text-xs text-txt-muted">
                            When enabled, the prompt editor will enforce this structure.
                        </span>
                    </div>
                </div>

                {/* Configuration Area - disable if not enabled */}
                <div className={schema.enabled ? '' : 'opacity-50 pointer-events-none grayscale transition-all'}>
                    {/* Global Settings */}
                    <div className="flex items-center gap-4 mb-6">
                        <label className="text-sm font-medium text-txt-secondary">Separator:</label>
                        <select
                            value={schema.separator}
                            onChange={(e) => onUpdate({ ...schema, separator: e.target.value })}
                            className="bg-canvas-base border border-border-default rounded p-1 text-sm focus:border-accent-1 outline-none"
                        >
                            <option value="_">Underscore (_)</option>
                            <option value="-">Dash (-)</option>
                            <option value=".">Dot (.)</option>
                        </select>
                    </div>

                    {/* Fields Table Header */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-canvas-subtle/50 border-b border-border-default text-[10px] font-bold text-txt-muted uppercase tracking-wider">
                        <div className="w-6 text-center">#</div>
                        <div className="flex-1 grid grid-cols-12 gap-4">
                            <div className="col-span-4">Field Label</div>
                            <div className="col-span-3">Type</div>
                            <div className="col-span-5">Configuration</div>
                        </div>
                        <div className="w-8"></div>
                    </div>

                    {/* Folder Naming Type */}
                    <div className="flex items-center gap-4 mt-4 p-3 bg-canvas-base border border-color-border rounded-lg">
                        <span className="text-sm font-medium text-txt-secondary">Folder Display Style:</span>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name="folderNamingType"
                                checked={schema.folderNamingType !== 'valueOnly'} // Default to labelAndValue
                                onChange={() => onUpdate({ ...schema, folderNamingType: 'labelAndValue' })}
                                className="text-accent-3 focus:ring-accent-3"
                            />
                            <span className="text-txt-primary">Label + Value (e.g. "Project A")</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name="folderNamingType"
                                checked={schema.folderNamingType === 'valueOnly'}
                                onChange={() => onUpdate({ ...schema, folderNamingType: 'valueOnly' })}
                                className="text-accent-3 focus:ring-accent-3"
                            />
                            <span className="text-txt-primary">Value Only (e.g. "A")</span>
                        </label>
                    </div>

                    {/* Fields List */}
                    <div className="space-y-0 divide-y divide-border-default border border-border-default rounded-b overflow-hidden">
                        {schema.fields.map((field, index) => (
                            <SchemaFieldItem
                                key={field.id}
                                field={field}
                                index={index}
                                totalFields={schema.fields.length}
                                onMove={moveField}
                                onUpdate={updateField}
                                onRemove={removeField}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            />
                        ))}

                        {/* Static Description Field */}
                        <div className="flex items-center gap-3 p-3 bg-canvas-subtle/30 opacity-70 cursor-not-allowed">
                            <div className="flex flex-col gap-0.5 text-txt-muted/20 w-6 items-center">
                                <span className="h-3 w-3 flex items-center justify-center">●</span>
                            </div>

                            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        value="Description"
                                        disabled
                                        className="w-full bg-transparent border-b border-transparent px-1 py-1 text-sm outline-none text-txt-muted font-bold italic"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <span className="text-sm text-txt-muted italic px-1">Free Text (Suffix)</span>
                                </div>
                                <div className="col-span-5">
                                    <span className="text-xs text-txt-muted italic px-1">Mandatory, Appended automatically</span>
                                </div>
                            </div>

                            <div className="w-8 flex justify-center">
                                {/* No Actions */}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={addField}
                        className="mt-4 flex items-center gap-2 text-xs font-bold text-accent-1 hover:text-accent-2 uppercase tracking-wider"
                    >
                        <Plus size={14} /> Add Pattern Field
                    </button>
                </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg bg-canvas-base border border-dashed border-border-default">
                <h4 className="text-xs font-bold text-txt-muted uppercase mb-2">Example Preview</h4>
                <div className="font-mono text-lg text-txt-primary">
                    {schema.fields.map(f => {
                        if (f.type === 'date') return '20250207';
                        if (f.type === 'select' && f.options && f.options.length > 0) return f.options[0];
                        return f.label.toUpperCase().substring(0, f.maxLength || 4);
                    }).join(schema.separator)}
                    <span className="text-txt-muted/50">{schema.separator}Description</span>
                </div>
            </div>
        </div>
    );
};
