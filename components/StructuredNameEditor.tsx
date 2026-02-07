import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { NamingSchema } from '../types';
import { LayoutTemplate } from 'lucide-react';

interface StructuredNameEditorProps {
    metadata: Record<string, string>;
    onUpdate: (metadata: Record<string, string>, generatedTitle: string) => void;
}

export const StructuredNameEditor: React.FC<StructuredNameEditorProps> = ({ metadata = {}, onUpdate }) => {
    const { settings } = useSettings();
    const schema = settings.namingSchema;

    // Local state to manage inputs before sync
    // However, for immediate feedback, we might want to lift state or just use props.
    // Let's use props directly to avoid sync issues, assuming parent handles updates fast enough.

    const handleChange = (fieldId: string, value: string) => {
        const newMetadata = { ...metadata, [fieldId]: value };
        const newTitle = generateTitle(newMetadata, schema);
        onUpdate(newMetadata, newTitle);
    };

    // Helper to generate title based on schema
    const generateTitle = (meta: Record<string, string>, schema: NamingSchema): string => {
        const parts = schema.fields.map(field => {
            const val = meta[field.id] || '';
            // If select/date, maybe format? For now assume valid string.
            return val;
        });

        // Add Free Text Suffix (always "description")
        const desc = meta['description'] || '';

        // Filter empty parts if strict? Or keep separators?
        // BIM usually enforces fixed length, so separators are constant.
        // But if a field is empty, do we show "___" or nothing?
        // Let's assume we show what we have.

        const mainPart = parts.join(schema.separator);
        return `${mainPart}${schema.separator}${desc}`;
    };

    // If metadata is empty, should we initialize defaults?
    // Doing it in useEffect might cause loops if not careful.
    // Let's just rely on the user inputting data.

    return (
        <div className="bg-canvas-subtle p-4 rounded-lg border border-border-default space-y-4 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-accent-1 uppercase tracking-wider mb-2">
                <LayoutTemplate size={14} /> Structured Naming
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schema.fields.map((field) => (
                    <div key={field.id} className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-txt-muted">{field.label}</label>
                        {field.type === 'select' ? (
                            <select
                                value={metadata[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="w-full bg-canvas-base border border-border-default rounded px-3 py-2 text-sm focus:border-accent-1 outline-none"
                            >
                                <option value="">Select...</option>
                                {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : field.type === 'date' ? (
                            <input
                                type="date"
                                value={metadata[field.id] || ''}
                                onChange={(e) => {
                                    // Format date to YYYYMMDD for the value, but input needs YYYY-MM-DD
                                    // Wait, input type="date" gives YYYY-MM-DD.
                                    // For the generated title, we might want YYYYMMDD.
                                    // Let's store raw value in metadata, format in generateTitle?
                                    // Or store formatted value?
                                    // Let's store raw YYYY-MM-DD in metadata for the input, and format in generateTitle logic later if needed.
                                    // For now, simple text pass-through suited for manual entry or ISO strings.
                                    handleChange(field.id, e.target.value)
                                }}
                                className="w-full bg-canvas-base border border-border-default rounded px-3 py-2 text-sm focus:border-accent-1 outline-none"
                            />
                        ) : (
                            <input
                                type="text"
                                maxLength={field.maxLength}
                                value={metadata[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                placeholder={field.id.toUpperCase()}
                                className="w-full bg-canvas-base border border-border-default rounded px-3 py-2 text-sm focus:border-accent-1 outline-none font-mono"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Free Text Suffix */}
            <div className="space-y-1 pt-2 border-t border-border-default/50">
                <label className="text-[10px] uppercase font-bold text-txt-muted">Description (Suffix)</label>
                <input
                    type="text"
                    value={metadata['description'] || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter short description..."
                    className="w-full bg-canvas-base border border-border-default rounded px-3 py-2 text-sm focus:border-accent-1 outline-none font-medium"
                />
            </div>
        </div>
    );
};
