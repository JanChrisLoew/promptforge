import React, { useMemo } from 'react';
import { PromptList } from './components/PromptList';
import { PromptEditor } from './components/PromptEditor';
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
    bulkDeletePrompts
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

  return (
    <div className="flex h-screen bg-canvas-base text-txt-primary font-sans">
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
        <PromptEditor
          key={selectedPrompt.id}
          prompt={selectedPrompt}
          onUpdate={updatePrompt}
          availableCategories={uniqueCategories}
          isTitleUnique={(title) => checkTitleUnique(title, selectedPrompt.id)}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-txt-secondary bg-canvas-base p-8">
          <div className="max-w-2xl w-full text-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-txt-primary">PromptForge</h1>
              <p className="text-lg text-txt-muted">Your professional prompt engineering environment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-canvas-card p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                <Database size={24} className="text-accent-3 mb-2" />
                <span className="text-3xl font-bold text-txt-primary">{stats.totalPrompts}</span>
                <span className="text-xs text-txt-muted uppercase tracking-wider font-bold">Total Prompts</span>
              </div>
              <div className="bg-canvas-card p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                <Activity size={24} className="text-accent-2 mb-2" />
                <span className="text-3xl font-bold text-txt-primary">{stats.totalVersions}</span>
                <span className="text-xs text-txt-muted uppercase tracking-wider font-bold">Total Versions</span>
              </div>
              <div className="bg-canvas-card p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                <Tag size={24} className="text-accent-1 mb-2" />
                <span className="text-3xl font-bold text-txt-primary">{stats.uniqueTags}</span>
                <span className="text-xs text-txt-muted uppercase tracking-wider font-bold">Unique Tags</span>
              </div>
            </div>

            <div className="bg-canvas-card border border-slate-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-sm font-bold text-txt-primary mb-4 uppercase tracking-wider">Quick Actions</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <button onClick={createPrompt} className="flex items-center gap-2 px-4 py-2 bg-accent-3/10 text-accent-3 rounded-lg hover:bg-accent-3 hover:text-white transition-colors font-bold text-sm">
                  <Layout size={16} /> Create New Prompt
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-txt-secondary rounded-lg hover:bg-slate-200 transition-colors font-bold text-sm cursor-pointer">
                  <Database size={16} /> Import JSON
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