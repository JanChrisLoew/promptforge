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
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const filteredPrompts = useMemo(() => {
        const cleanSearch = debouncedSearch.trim().toLowerCase();

        return prompts.filter(p => {
            // Text Search
            const matchesSearch = !cleanSearch ||
                p.title.toLowerCase().includes(cleanSearch) ||
                (p.tags && p.tags.some(t => t.toLowerCase().includes(cleanSearch)));

            if (!matchesSearch) return false;

            // Metadata & Special Filters
            if (Object.keys(activeFilters).length > 0) {
                // Return true only if ALL active filters match
                return Object.entries(activeFilters).every(([key, value]) => {
                    const cleanValue = value.trim().toLowerCase();
                    if (!cleanValue) return true; // Ignore empty filters

                    if (key === 'tags') {
                        return p.tags && p.tags.some(t => t.toLowerCase().includes(cleanValue));
                    }

                    const metaValue = p.metadata?.[key];
                    return metaValue && metaValue.toLowerCase().includes(cleanValue);
                });
            }

            return true;
        });
    }, [prompts, debouncedSearch, activeFilters]);

    const setFilter = useCallback((key: string, value: string) => {
        setActiveFilters(prev => {
            if (!value) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [key]: _removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [key]: value };
        });
    }, []);

    const clearFilters = useCallback(() => setActiveFilters({}), []);

    return { searchTerm, setSearchTerm, filteredPrompts, activeFilters, setFilter, clearFilters };
};

export type SortMode = 'alpha' | 'recent';

export const usePromptGrouping = (filteredPrompts: Prompt[], settings: AppSettings, isFilterActive: boolean = false) => {
    const [sortMode, setSortMode] = useState<SortMode>('recent');
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['General']));

    // Auto-expand "Search Results" when filtering
    useEffect(() => {
        if (isFilterActive) {
            const t = setTimeout(() => {
                setExpandedPaths(new Set(['Search Results']));
            }, 0);
            return () => clearTimeout(t);
        }
    }, [isFilterActive]);

    const groupedPrompts = useMemo(() => {
        if (!settings || !settings.namingSchema) return {}; // Safety check

        const root: Record<string, GroupNode> = {};
        // Robust check for fields array
        const hasFields = Array.isArray(settings.namingSchema.fields) && settings.namingSchema.fields.length > 0;
        const isSchemaEnabled = settings.namingSchema.enabled && hasFields;

        // FLAT VIEW when filtering
        if (isFilterActive) {
            root['Search Results'] = {
                name: 'Search Results',
                path: 'Search Results',
                level: 0,
                children: {},
                items: [...filteredPrompts]
            };
        } else {
            // HIERARCHICAL VIEW
            filteredPrompts.forEach(p => {
                if (!p) return; // Skip invalid prompts

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
        }

        // Sort items within folders
        const sortNodes = (nodes: Record<string, GroupNode>) => {
            Object.values(nodes).forEach(node => {
                if (node.items) {
                    node.items.sort((a, b) => {
                        if (!a || !b) return 0;
                        if (sortMode === 'alpha') return (a.title || '').localeCompare(b.title || '');
                        return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
                    });
                }
                if (node.children) {
                    sortNodes(node.children);
                }
            });
        };

        sortNodes(root);
        return root;
    }, [filteredPrompts, sortMode, settings, isFilterActive]);

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
