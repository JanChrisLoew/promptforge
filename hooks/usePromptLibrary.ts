import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Prompt } from '../types';
import { generateId, downloadJson } from '../utils';
import { loadLibrary, saveLibrary, processImport, DEFAULT_PROMPT } from '../utils/storage';

export const usePromptLibrary = () => {
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const loaded = loadLibrary();
    if (loaded.length === 0) {
      return [{
        ...DEFAULT_PROMPT,
        id: generateId(),
        title: 'New Prompt',
        lastUpdated: new Date().toISOString(),
      }];
    }
    return loaded;
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return prompts.length > 0 ? prompts[0].id : null;
  });

  const isMounted = useRef(false);

  // 1. Persistence Effect
  useEffect(() => {
    if (isMounted.current) {
      saveLibrary(prompts);
    } else {
      isMounted.current = true;
    }
  }, [prompts]);

  // Actions
  const createPrompt = useCallback(async () => {
    const newId = generateId();
    setPrompts(prev => {
      const baseTitle = 'New Prompt';
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

  const updatePrompt = useCallback(async (updated: Prompt) => {
    setPrompts(prev => prev.map(p => p.id === updated.id ? updated : p));
  }, []);

  const deletePrompt = useCallback(async (id: string) => {
    setPrompts(prev => {
      const updated = prev.filter(p => p.id !== id);
      // Correction logic: if selectedId was deleted, move selection
      if (selectedId === id) {
        setSelectedId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  }, [selectedId]);

  const bulkDeletePrompts = useCallback(async (ids: string[]) => {
    setPrompts(prev => {
      const updated = prev.filter(p => !ids.includes(p.id));
      // Correction logic: if active selection was in bulk delete
      if (selectedId && ids.includes(selectedId)) {
        setSelectedId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  }, [selectedId]);



  const checkTitleUnique = useCallback((title: string, excludeId: string) => {
    const normalize = (t: string) => t.trim().toLowerCase();
    const target = normalize(title);
    return !prompts.some(p => normalize(p.title) === target && p.id !== excludeId);
  }, [prompts]);

  const exportLibrary = useCallback(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadJson(`prompt_library_full_${timestamp}.json`, prompts);
  }, [prompts]);

  const importLibrary = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (stats: { new: number, updated: number, skipped: number, errors: number }) => void,
    onError: (message: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const { merged, stats } = processImport(json, prompts);

        if (merged.length > prompts.length || stats.updated > 0) {
          setPrompts(merged);
        }
        onComplete(stats);
      } catch (err) {
        console.error(err);
        onError("The selected file is not a valid JSON or may be corrupted.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [prompts]);

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
