import { useState, useMemo, useEffect, useCallback } from 'react';
import { Prompt } from '../types';

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

export const usePromptGrouping = (filteredPrompts: Prompt[]) => {
    const [sortMode, setSortMode] = useState<SortMode>('recent');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['General']));

    const groupedPrompts = useMemo(() => {
        const groups: Record<string, Prompt[]> = {};
        filteredPrompts.forEach(p => {
            const cat = p.category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });

        Object.keys(groups).forEach(cat => {
            groups[cat].sort((a, b) => {
                if (sortMode === 'alpha') return a.title.localeCompare(b.title);
                return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
            });
        });

        return groups;
    }, [filteredPrompts, sortMode]);

    const toggleCategory = useCallback((category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) newSet.delete(category);
            else newSet.add(category);
            return newSet;
        });
    }, []);

    return { sortMode, setSortMode, groupedPrompts, expandedCategories, toggleCategory };
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
