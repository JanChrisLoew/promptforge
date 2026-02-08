import React, { useState, useMemo } from 'react';
import { Prompt } from '../../types';
import { Tag, Edit2, Trash2, X, Check, Search } from 'lucide-react';

interface GlobalTagManagerProps {
    prompts: Prompt[];
    onUpdatePrompt: (id: string, updates: Partial<Prompt>) => void;
}

export const GlobalTagManager: React.FC<GlobalTagManagerProps> = ({ prompts, onUpdatePrompt }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    // Calculate tag statistics
    const tagStats = useMemo(() => {
        const stats: Record<string, number> = {};
        prompts.forEach(p => {
            if (p.tags) {
                p.tags.forEach(tag => {
                    stats[tag] = (stats[tag] || 0) + 1;
                });
            }
        });
        return Object.entries(stats)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }, [prompts]);

    const filteredTags = useMemo(() => {
        if (!searchQuery) return tagStats;
        return tagStats.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [tagStats, searchQuery]);

    const handleRename = (oldTag: string) => {
        if (!renameValue.trim() || renameValue === oldTag) {
            setEditingTag(null);
            return;
        }

        const newTag = renameValue.trim();

        // 1. Find all prompts with oldTag
        const affectedPrompts = prompts.filter(p => p.tags?.includes(oldTag));

        // 2. Updates
        affectedPrompts.forEach(p => {
            const newTags = (p.tags || [])
                .map(t => t === oldTag ? newTag : t) // Rename
                .filter((t, i, arr) => arr.indexOf(t) === i); // Dedupe if newTag already existed

            onUpdatePrompt(p.id, { tags: newTags });
        });

        setEditingTag(null);
        setRenameValue('');
    };

    const handleDelete = (tagToDelete: string) => {
        if (!window.confirm(`Delete tag "${tagToDelete}" from all prompts?`)) return;

        const affectedPrompts = prompts.filter(p => p.tags?.includes(tagToDelete));

        affectedPrompts.forEach(p => {
            const newTags = (p.tags || []).filter(t => t !== tagToDelete);
            onUpdatePrompt(p.id, { tags: newTags });
        });
    };

    const startEditing = (tag: string) => {
        setEditingTag(tag);
        setRenameValue(tag);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-xl font-bold text-txt-primary mb-2">Tag Manager</h2>
                <p className="text-sm text-txt-muted mb-4">
                    Manage tags globally. Renaming or deleting a tag updates all prompts that use it.
                </p>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-canvas-base border border-border-default rounded-lg pl-9 pr-4 py-2 text-sm focus:border-accent-1 outline-none transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTags.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-txt-muted italic border-2 border-dashed border-border-default rounded-xl">
                        {searchQuery ? 'No tags matching search.' : 'No tags found in library.'}
                    </div>
                ) : (
                    filteredTags.map(({ name, count }) => (
                        <div key={name} className="flex items-center justify-between p-4 bg-canvas-card border border-border-default rounded-xl shadow-sm hover:border-accent-1/30 transition-all group">
                            {editingTag === name ? (
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        className="flex-1 bg-canvas-base border border-accent-1 rounded px-2 py-1 text-sm outline-none"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleRename(name)}
                                    />
                                    <button onClick={() => handleRename(name)} className="p-1 text-green-500 hover:bg-green-500/10 rounded"><Check size={16} /></button>
                                    <button onClick={() => setEditingTag(null)} className="p-1 text-red-500 hover:bg-red-500/10 rounded"><X size={16} /></button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-accent-surface rounded-lg text-accent-1 flex-shrink-0">
                                            <Tag size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-sm text-txt-primary truncate" title={name}>{name}</div>
                                            <div className="text-xs text-txt-muted">{count} prompt{count !== 1 && 's'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEditing(name)}
                                            className="p-2 text-txt-muted hover:text-accent-1 hover:bg-canvas-base rounded-lg transition-colors"
                                            title="Rename Tag"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(name)}
                                            className="p-2 text-txt-muted hover:text-red-500 hover:bg-canvas-base rounded-lg transition-colors"
                                            title="Delete Tag"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
