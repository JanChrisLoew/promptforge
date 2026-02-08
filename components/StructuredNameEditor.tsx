import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { NamingSchema } from '../types';
import { LayoutTemplate, ChevronDown, ChevronRight } from 'lucide-react';

interface StructuredNameEditorProps {
    metadata: Record<string, string>;
    onUpdate: (metadata: Record<string, string>, generatedTitle: string) => void;
    currentTitle?: string;
}

export const StructuredNameEditor: React.FC<StructuredNameEditorProps> = ({ metadata = {}, onUpdate, currentTitle }) => {
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

    // Intelligent Auto-Collapse Logic
    const [isExpanded, setIsExpanded] = React.useState(() => {
        // Default to collapsed if currentTitle matches generated title and has some content
        if (!currentTitle) return true;
        const generated = generateTitle(metadata, schema);
        // If meta has at least description or some fields, check for match
        const hasContent = Object.values(metadata).some(v => v.trim() !== '');
        return !hasContent || generated !== currentTitle;
    });

    const summaryText = schema.fields
        .map(f => metadata[f.id] || '---')
        .join(' · ');

    return (
        <div className="bg-canvas-subtle p-4 rounded-lg border border-border-default space-y-4 transition-colors duration-300">
            <div
                className="flex items-center justify-between cursor-pointer group select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2 text-xs font-bold text-accent-1 uppercase tracking-wider min-w-0 flex-1">
                    <LayoutTemplate size={14} className="flex-shrink-0" />
                    <span className="flex-shrink-0">Naming</span>
                    {!isExpanded && (
                        <span className="ml-2 text-[10px] font-medium text-txt-muted italic truncate px-2 py-0.5 rounded-full border border-border-default bg-canvas-base/40 min-w-0 shrink">
                            {summaryText}
                        </span>
                    )}
                </div>
                <div className="text-txt-muted group-hover:text-accent-3 transition-colors">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
            </div>

            {isExpanded && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-2">
                    <div className="flex flex-wrap gap-4">
                        {schema.fields.map((field) => (
                            <div key={field.id} className="space-y-1 w-[180px] flex-shrink-0">
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
                                        onChange={(e) => handleChange(field.id, e.target.value)}
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

                        <div className="space-y-1 flex-1 min-w-[200px]">
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
                </div>
            )}
        </div>
    );
};
