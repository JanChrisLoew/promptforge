import { useState, useMemo, useEffect, useCallback } from 'react';
import { Prompt, AppSettings } from '../types';

export interface GroupNode {
    name: string;
    path: string;
    level: number;
    children: Record<string, GroupNode>;
    items: Prompt[];
}

export const usePromptSearch = (prompts: Prompt[]) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const filteredPrompts = useMemo(() => prompts.filter(p =>
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(debouncedSearch.toLowerCase()))
    ), [prompts, debouncedSearch]);

    return { searchTerm, setSearchTerm, filteredPrompts };
};

export type SortMode = 'alpha' | 'recent';

export const usePromptGrouping = (filteredPrompts: Prompt[], settings: AppSettings) => {
    const [sortMode, setSortMode] = useState<SortMode>('recent');
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['General']));

    const groupedPrompts = useMemo(() => {
        const root: Record<string, GroupNode> = {};
        const isSchemaEnabled = settings.namingSchema.enabled && settings.namingSchema.fields.length > 0;

        filteredPrompts.forEach(p => {
            // Determine path parts
            let parts: string[] = ['General'];

            if (isSchemaEnabled && p.metadata) {
                // Build path from schema fields (excluding description/suffix)
                // LIMIT: Only use the first 2 fields for folder structure per user request
                const schemaParts = settings.namingSchema.fields.slice(0, 2).map((field) => {
                    const val = p.metadata?.[field.id];
                    if (!val) return null;
                    const cleanVal = val.trim();

                    // Configurable Folder Naming Strategy
                    if (settings.namingSchema.folderNamingType === 'valueOnly') {
                        return cleanVal;
                    }

                    // Default: Label + Value
                    return `${field.label} ${cleanVal}`;
                }).filter((part): part is string => Boolean(part));

                if (schemaParts.length > 0) {
                    parts = schemaParts;
                }
            } else if (p.category) {
                // Fallback to legacy category
                parts = [p.category];
            }

            // Build/Traverse Tree
            let currentLevel = root;
            let currentPath = '';

            parts.forEach((part, index) => {
                currentPath = currentPath ? `${currentPath}/${part}` : part;

                if (!currentLevel[part]) {
                    currentLevel[part] = {
                        name: part,
                        path: currentPath,
                        level: index,
                        children: {},
                        items: []
                    };
                }

                // If it's the leaf folder for this prompt, add it
                if (index === parts.length - 1) {
                    currentLevel[part].items.push(p);
                }

                // Move down
                currentLevel = currentLevel[part].children;
            });
        });

        // Sort items within folders
        const sortNodes = (nodes: Record<string, GroupNode>) => {
            Object.values(nodes).forEach(node => {
                node.items.sort((a, b) => {
                    if (sortMode === 'alpha') return a.title.localeCompare(b.title);
                    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
                });
                sortNodes(node.children);
            });
        };

        sortNodes(root);
        return root;
    }, [filteredPrompts, sortMode, settings]);

    const toggleFolder = useCallback((path: string) => {
        setExpandedPaths(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) newSet.delete(path);
            else newSet.add(path);
            return newSet;
        });
    }, []);

    return { sortMode, setSortMode, groupedPrompts, expandedPaths, toggleFolder };
};

export const useBulkSelection = () => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleBulkSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    }, []);

    const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

    return { selectedIds, setSelectedIds, toggleBulkSelect, clearSelection };
};
