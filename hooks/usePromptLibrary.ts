import { useState, useEffect, useCallback } from 'react';
import { Prompt } from '../types';
import { generateId, downloadJson, isValidPrompt } from '../utils';

const STORAGE_KEY = 'promptforge_library';

const DEFAULT_PROMPT: Prompt = {
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

export const usePromptLibrary = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 1. Load & Migrate Data on Mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep Migration: Ensure structure conforms to current type
        const migrated = parsed.map((p: any) => {
          const safeVersions = (Array.isArray(p.versions) ? p.versions : []).map((v: any) => ({
            id: v.id || generateId(),
            timestamp: v.timestamp || new Date().toISOString(),
            systemInstruction: v.systemInstruction || '',
            userPrompt: v.userPrompt || '',
            note: v.note || ''
          }));

          const sanitized = {
            ...DEFAULT_PROMPT,
            ...p,
            versions: safeVersions
          };

          // Cleanup legacy fields
          delete sanitized.parameters;
          delete sanitized.model;

          return sanitized;
        });

        setPrompts(migrated);
        if (migrated.length > 0) setSelectedId(migrated[0].id);
      } catch (e) {
        console.error("Failed to load prompts", e);
      }
    } else {
      createPrompt(); // Init with one empty prompt
    }
  }, []);

  // 2. Persist Data on Change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  }, [prompts]);

  // Actions
  const createPrompt = useCallback(() => {
    const newId = generateId();
    setPrompts(prev => {
      let baseTitle = 'New Prompt';
      let title = baseTitle;
      let counter = 1;
      while (prev.some(p => p.title.toLowerCase() === title.toLowerCase())) {
        title = `${baseTitle} (${counter})`;
        counter++;
      }

      const newPrompt: Prompt = {
        ...DEFAULT_PROMPT,
        id: newId,
        title: title,
        lastUpdated: new Date().toISOString(),
      };
      return [newPrompt, ...prev];
    });
    setSelectedId(newId);
  }, []);

  const updatePrompt = useCallback((updated: Prompt) => {
    setPrompts(prev => prev.map(p => p.id === updated.id ? updated : p));
  }, []);

  const deletePrompt = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      setPrompts(prev => prev.filter(p => p.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    }
  }, [selectedId]);

  const bulkDeletePrompts = useCallback((ids: string[]) => {
    setPrompts(prev => prev.filter(p => !ids.includes(p.id)));
    if (selectedId && ids.includes(selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId]);

  // Fix Selection after delete
  useEffect(() => {
    if (prompts.length > 0 && selectedId === null) {
      // If nothing is selected (e.g. after delete), select the first one
      setSelectedId(prompts[0].id);
    } else if (prompts.length > 0 && !prompts.find(p => p.id === selectedId)) {
      // If selected ID no longer exists
      setSelectedId(prompts[0].id);
    }
  }, [prompts, selectedId]);

  const checkTitleUnique = useCallback((title: string, excludeId: string) => {
    const normalize = (t: string) => t.trim().toLowerCase();
    const target = normalize(title);
    return !prompts.some(p => normalize(p.title) === target && p.id !== excludeId);
  }, [prompts]);

  const exportLibrary = useCallback(() => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadJson(`prompt_library_full_${timestamp}.json`, prompts);
  }, [prompts]);

  const importLibrary = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const importList = Array.isArray(json) ? json : [json];
        if (importList.length === 0) return;

        let newCount = 0;
        let updateCount = 0;
        let errorCount = 0;

        setPrompts(prev => {
          const currentMap = new Map<string, Prompt>();
          prev.forEach(p => currentMap.set(p.id, p));

          importList.forEach((p: any) => {
            if (!isValidPrompt(p)) {
              // If simple structure check fails, try to salvage key fields or skip
              // For strict safety, we might skip, but let's try to apply defaults if ID exists
              if (!p.id) {
                errorCount++;
                return;
              }
            }

            if (!p.id) p.id = generateId();
            const safeVersions = (Array.isArray(p.versions) ? p.versions : []).map((v: any) => ({
              id: v.id || generateId(),
              timestamp: v.timestamp || new Date().toISOString(),
              systemInstruction: v.systemInstruction || '',
              userPrompt: v.userPrompt || '',
              note: v.note || ''
            }));

            const sanitizedPrompt = { ...DEFAULT_PROMPT, ...p, versions: safeVersions };
            // Cleanup legacy
            delete sanitizedPrompt.parameters;
            delete sanitizedPrompt.model;

            if (currentMap.has(p.id)) {
              updateCount++;
              currentMap.set(p.id, sanitizedPrompt);
            } else {
              let uniqueTitle = sanitizedPrompt.title;
              let counter = 1;
              const isTitleTaken = (t: string) => Array.from(currentMap.values()).some(existing => existing.title.toLowerCase() === t.toLowerCase());
              while (isTitleTaken(uniqueTitle)) {
                uniqueTitle = `${sanitizedPrompt.title} (${counter})`;
                counter++;
              }
              sanitizedPrompt.title = uniqueTitle;
              newCount++;
              currentMap.set(p.id, sanitizedPrompt);
            }
          });

          if (errorCount > 0) {
            console.warn(`Skipped ${errorCount} invalid prompts during import.`);
          }

          return Array.from(currentMap.values());
        });
        alert(`Import Complete:\n• ${newCount} New Prompts Added\n• ${updateCount} Updated\n• ${errorCount} Skipped (Invalid Format)`);
      } catch (err) {
        console.error(err);
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  return {
    prompts,
    selectedId,
    setSelectedId,
    createPrompt,
    updatePrompt,
    deletePrompt,
    checkTitleUnique,
    exportLibrary,
    importLibrary,
    bulkDeletePrompts
  };
};