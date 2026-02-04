import { useState, useEffect, useCallback } from 'react';
import { Prompt } from '../types';
import { generateId, downloadJson } from '../utils';
import { loadLibrary, saveLibrary, processImport, DEFAULT_PROMPT } from '../utils/storage';

export const usePromptLibrary = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    const loadedPrompts = loadLibrary();
    if (loadedPrompts.length > 0) {
      setPrompts(loadedPrompts);
      setSelectedId(loadedPrompts[0].id);
    } else {
      // Create first prompt if empty (but only after first check)
      const newId = generateId();
      const firstPrompt: Prompt = {
        ...DEFAULT_PROMPT,
        id: newId,
        title: 'New Prompt',
        lastUpdated: new Date().toISOString(),
      };
      setPrompts([firstPrompt]);
      setSelectedId(newId);
    }
    setIsLoaded(true);
  }, []);

  // 2. Persist Data (Effect controlled by state change)
  useEffect(() => {
    if (isLoaded) {
      saveLibrary(prompts);
    }
  }, [prompts, isLoaded]);

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
    if (window.confirm(`Are you sure you want to delete ${ids.length} prompts?`)) {
      setPrompts(prev => prev.filter(p => !ids.includes(p.id)));
      if (selectedId && ids.includes(selectedId)) {
        setSelectedId(null);
      }
    }
  }, [selectedId]);

  // Selection safety
  useEffect(() => {
    if (isLoaded && prompts.length > 0) {
      if (selectedId === null || !prompts.find(p => p.id === selectedId)) {
        setSelectedId(prompts[0].id);
      }
    }
  }, [prompts, selectedId, isLoaded]);

  const checkTitleUnique = useCallback((title: string, excludeId: string) => {
    const normalize = (t: string) => t.trim().toLowerCase();
    const target = normalize(title);
    return !prompts.some(p => normalize(p.title) === target && p.id !== excludeId);
  }, [prompts]);

  const exportLibrary = useCallback(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadJson(`prompt_library_full_${timestamp}.json`, prompts);
  }, [prompts]);

  const importLibrary = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const { merged, stats } = processImport(json, prompts);

        if (merged.length > prompts.length || stats.updated > 0) {
          setPrompts(merged);
          alert(`Import Complete:\n• ${stats.new} New Prompts Added\n• ${stats.updated} Updated\n• ${stats.errors} Skipped`);
        } else if (stats.errors > 0) {
          alert(`Import Failed: ${stats.errors} invalid prompts skipped.`);
        }
      } catch (err) {
        console.error(err);
        alert("Invalid JSON file");
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
    bulkDeletePrompts,
    isLoaded
  };
};
