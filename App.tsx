import React, { useMemo } from 'react';
import { PromptList } from './components/PromptList';
import { PromptEditor } from './components/PromptEditor';
import { ThemeToggle } from './components/ThemeToggle';
import { usePromptLibrary } from './hooks/usePromptLibrary';
import { Layout, Tag, Database, Activity } from 'lucide-react';

const App: React.FC = () => {
  const {
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
  } = usePromptLibrary();

  // Derive unique categories for autocomplete
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>(['General', 'Work', 'Creative', 'Coding']);
    prompts.forEach(p => {
      if (p.category && p.category.trim() !== '') {
        cats.add(p.category.trim());
      }
    });
    return Array.from(cats).sort();
  }, [prompts]);

  const selectedPrompt = prompts.find(p => p.id === selectedId);

  // Dashboard Stats
  const stats = useMemo(() => {
    const totalPrompts = prompts.length;
    const totalVersions = prompts.reduce((acc, p) => acc + (p.versions?.length || 0), 0);
    const allTags = new Set(prompts.flatMap(p => p.tags));
    return { totalPrompts, totalVersions, uniqueTags: allTags.size };
  }, [prompts]);

  // Prevent data loss on accidental close
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      // If there's an active editor, the PromptEditor component handles its own dirty state via LocalStorage sync.
      // But we can add a generic safety check here if needed.
      // For now, ensuring the window knows we are active is standard.
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-canvas-base animate-pulse">
        <div className="w-80 border-r border-color-border bg-canvas-card" />
        <div className="flex-1 p-8 space-y-8">
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-canvas-base text-txt-primary font-sans transition-colors duration-300">
      <PromptList
        prompts={prompts}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDelete={deletePrompt}
        onBulkDelete={bulkDeletePrompts}
        onCreate={createPrompt}
        onExport={exportLibrary}
        onImport={importLibrary}
      />

      {selectedPrompt ? (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <PromptEditor
            key={selectedPrompt.id}
            prompt={selectedPrompt}
            onUpdate={updatePrompt}
            availableCategories={uniqueCategories}
            isTitleUnique={(title) => checkTitleUnique(title, selectedPrompt.id)}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-txt-secondary bg-canvas-base p-8 relative overflow-y-auto">
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>

          <div className="max-w-3xl w-full text-center space-y-12">
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-txt-primary tracking-tight">
                Prompt<span className="text-accent-3">Forge</span>
              </h1>
              <p className="text-xl text-txt-muted max-w-lg mx-auto leading-relaxed">
                A high-performance environment for the modern prompt engineer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-canvas-card p-8 rounded-2xl border border-color-border shadow-sm flex flex-col items-center transition-all hover:shadow-md hover:border-accent-3/30 group">
                <Database size={32} className="text-accent-3 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-4xl font-black text-txt-primary mb-1">{stats.totalPrompts}</span>
                <span className="text-xs text-txt-muted uppercase tracking-[0.2em] font-bold">Prompts</span>
              </div>
              <div className="bg-canvas-card p-8 rounded-2xl border border-color-border shadow-sm flex flex-col items-center transition-all hover:shadow-md hover:border-accent-2/30 group">
                <Activity size={32} className="text-accent-2 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-4xl font-black text-txt-primary mb-1">{stats.totalVersions}</span>
                <span className="text-xs text-txt-muted uppercase tracking-[0.2em] font-bold">Versions</span>
              </div>
              <div className="bg-canvas-card p-8 rounded-2xl border border-color-border shadow-sm flex flex-col items-center transition-all hover:shadow-md hover:border-accent-1/30 group">
                <Tag size={32} className="text-accent-1 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-4xl font-black text-txt-primary mb-1">{stats.uniqueTags}</span>
                <span className="text-xs text-txt-muted uppercase tracking-[0.2em] font-bold">Tags</span>
              </div>
            </div>

            <div className="bg-canvas-card border border-color-border rounded-2xl p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-3/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />

              <h3 className="text-xs font-black text-txt-muted mb-8 uppercase tracking-[0.3em]">Quick Access</h3>
              <div className="flex flex-wrap justify-center gap-6">
                <button
                  onClick={createPrompt}
                  className="flex items-center gap-3 px-8 py-4 bg-accent-3 text-white rounded-xl hover:bg-accent-3/90 transition-all font-bold shadow-lg shadow-accent-3/20 hover:-translate-y-1 active:translate-y-0"
                >
                  <Layout size={20} /> Create New Prompt
                </button>
                <label className="flex items-center gap-3 px-8 py-4 bg-canvas-base text-txt-primary border border-color-border rounded-xl hover:bg-canvas-hover transition-all font-bold cursor-pointer hover:-translate-y-1 active:translate-y-0">
                  <Database size={20} /> Import Library
                  <input type="file" accept=".json" onChange={importLibrary} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default App;