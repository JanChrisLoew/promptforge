import { Prompt } from '../types';
import { generateId, isValidPrompt } from './index';
import { UNTITLED_PROMPT_TITLE } from '../config';

export interface PromptStorage {
    load(): Prompt[];
    save(prompts: Prompt[]): void;
}

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
        title: (data.title as string) || UNTITLED_PROMPT_TITLE,
        versions: safeVersions
    } as Prompt;

    // Cleanup legacy fields if any (internal cleanup)
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

export class LocalStoragePromptStorage implements PromptStorage {
    private key: string;

    constructor(key: string = STORAGE_KEY) {
        this.key = key;
    }

    load(): Prompt[] {
        const saved = localStorage.getItem(this.key);
        if (!saved) return [];

        try {
            const parsed = JSON.parse(saved);
            const importList = Array.isArray(parsed) ? parsed : [parsed];
            return importList.map((p: unknown) => migratePrompt(p));
        } catch (e) {
            console.error("Failed to load prompts", e);
            return [];
        }
    }

    save(prompts: Prompt[]): void {
        try {
            localStorage.setItem(this.key, JSON.stringify(prompts));
        } catch (e: unknown) {
            if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                throw new Error("Storage Full: Your prompt library is too large for the browser's local storage.");
            } else {
                console.error("Failed to save library", e);
                throw e;
            }
        }
    }
}
