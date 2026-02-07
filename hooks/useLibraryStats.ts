import { useMemo } from 'react';
import { Prompt } from '../types';
import { DEFAULT_CATEGORIES } from '../config';

export const useLibraryStats = (prompts: Prompt[]) => {
    const uniqueCategories = useMemo(() => {
        const cats = new Set<string>(DEFAULT_CATEGORIES);
        prompts.forEach(p => {
            if (p.category && p.category.trim() !== '') {
                cats.add(p.category.trim());
            }
        });
        return Array.from(cats).sort();
    }, [prompts]);

    const stats = useMemo(() => {
        const totalPrompts = prompts.length;
        const totalVersions = prompts.reduce((acc: number, p) => acc + (p.versions?.length || 0), 0);
        const allTags = new Set(prompts.flatMap(p => p.tags));
        return { totalPrompts, totalVersions, uniqueTags: allTags.size };
    }, [prompts]);

    return { uniqueCategories, stats };
};
