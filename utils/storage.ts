import { Prompt } from '../types';
import { generateId, isValidPrompt } from './index';

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

        return importList.map((p: unknown) => migratePrompt(p));
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

export const migratePrompt = (p: unknown): Prompt => {
    if (!p || typeof p !== 'object') return { ...DEFAULT_PROMPT, id: generateId() };

    const data = p as Record<string, unknown>;
    const versions = Array.isArray(data.versions) ? data.versions : [];

    const safeVersions = versions.map((v: unknown) => {
        const vData = v as Record<string, unknown>;
        return {
            id: (vData.id as string) || generateId(),
            timestamp: (vData.timestamp as string) || new Date().toISOString(),
            systemInstruction: (vData.systemInstruction as string) || '',
            userPrompt: (vData.userPrompt as string) || '',
            note: (vData.note as string) || ''
        };
    });

    const sanitized: Prompt = {
        ...DEFAULT_PROMPT,
        ...data,
        id: (data.id as string) || generateId(),
        title: (data.title as string) || 'Untitled Prompt',
        versions: safeVersions
    } as Prompt;

    // Cleanup legacy fields
    const draft = sanitized as unknown as Record<string, unknown>;
    delete draft.parameters;
    delete draft.model;

    return sanitized;
};

export const processImport = (json: unknown, currentPrompts: Prompt[]): {
    merged: Prompt[],
    stats: { new: number, updated: number, skipped: number, errors: number }
} => {
    const importList = Array.isArray(json) ? json : [json];
    const stats = { new: 0, updated: 0, skipped: 0, errors: 0 };

    const currentMap = new Map<string, Prompt>();
    currentPrompts.forEach(p => currentMap.set(p.id, p));

    importList.forEach((p: unknown) => {
        if (!p || typeof p !== 'object') {
            stats.errors++;
            return;
        }

        const sanitizedPrompt = migratePrompt(p);

        // Final integrity check after migration
        if (!isValidPrompt(sanitizedPrompt)) {
            stats.errors++;
            return;
        }

        if (currentMap.has(sanitizedPrompt.id)) {
            // Check if it's actually different (simple equality check on lastUpdated or content)
            const existing = currentMap.get(sanitizedPrompt.id);
            if (existing &&
                (existing.systemInstruction !== sanitizedPrompt.systemInstruction ||
                    existing.userPrompt !== sanitizedPrompt.userPrompt ||
                    existing.title !== sanitizedPrompt.title)) {
                stats.updated++;
                currentMap.set(sanitizedPrompt.id, sanitizedPrompt);
            } else {
                stats.skipped++;
            }
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

