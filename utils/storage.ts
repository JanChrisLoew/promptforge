import { Prompt } from '../types';
import { generateId } from './index';

const STORAGE_KEY = 'promptforge_library';

export const DEFAULT_PROMPT: Prompt = {
    id: '',
    title: '',
    description: '',
    systemInstruction: '',
    userPrompt: '',
    category: 'General',
    tags: [],
    versions: [],
    lastUpdated: '',
};

export const loadLibrary = (): Prompt[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    try {
        const parsed = JSON.parse(saved);
        const importList = Array.isArray(parsed) ? parsed : [parsed];

        return importList.map((p: any) => migratePrompt(p));
    } catch (e) {
        console.error("Failed to load prompts", e);
        return [];
    }
};

export const saveLibrary = (prompts: Prompt[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    } catch (e) {
        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            alert("Storage Full: Your prompt library is too large for the browser's local storage. Please export your library and delete some prompts to save more.");
        } else {
            console.error("Failed to save library", e);
        }
    }
};

export const migratePrompt = (p: any): Prompt => {
    if (!p || typeof p !== 'object') return { ...DEFAULT_PROMPT, id: generateId() };

    const safeVersions = (Array.isArray(p.versions) ? p.versions : []).map((v: any) => ({
        id: v?.id || generateId(),
        timestamp: v?.timestamp || new Date().toISOString(),
        systemInstruction: v?.systemInstruction || '',
        userPrompt: v?.userPrompt || '',
        note: v?.note || ''
    }));

    const sanitized = {
        ...DEFAULT_PROMPT,
        ...p,
        id: p.id || generateId(),
        title: p.title || 'Untitled Prompt',
        versions: safeVersions
    };

    // Cleanup legacy fields
    delete (sanitized as any).parameters;
    delete (sanitized as any).model;

    return sanitized;
};

export const processImport = (json: any, currentPrompts: Prompt[]): {
    merged: Prompt[],
    stats: { new: number, updated: number, errors: number }
} => {
    const importList = Array.isArray(json) ? json : [json];
    const stats = { new: 0, updated: 0, errors: 0 };

    const currentMap = new Map<string, Prompt>();
    currentPrompts.forEach(p => currentMap.set(p.id, p));

    importList.forEach((p: any) => {
        if (!p || typeof p !== 'object') {
            stats.errors++;
            return;
        }

        const sanitizedPrompt = migratePrompt(p);

        if (currentMap.has(sanitizedPrompt.id)) {
            stats.updated++;
            currentMap.set(sanitizedPrompt.id, sanitizedPrompt);
        } else {
            let uniqueTitle = sanitizedPrompt.title;
            let counter = 1;
            const isTitleTaken = (t: string) => Array.from(currentMap.values()).some(existing => existing.title.toLowerCase() === t.toLowerCase());

            while (isTitleTaken(uniqueTitle)) {
                uniqueTitle = `${sanitizedPrompt.title} (${counter})`;
                counter++;
            }

            sanitizedPrompt.title = uniqueTitle;
            stats.new++;
            currentMap.set(sanitizedPrompt.id, sanitizedPrompt);
        }
    });

    return { merged: Array.from(currentMap.values()), stats };
};

