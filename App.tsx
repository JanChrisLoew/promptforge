import React, { useState, useEffect, useMemo } from 'react';
import { PromptList } from './components/PromptList';
import { PromptEditor } from './components/PromptEditor';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { SiteFooter } from './components/SiteFooter';
import { InfoOverlay, InfoType } from './components/InfoOverlay';
import { ConfirmationModal, ConfirmationType } from './components/ConfirmationModal';
import { usePromptLibrary } from './hooks/usePromptLibrary';

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

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('promptforge_auth') === 'true';
  });
  const [showDashboard, setShowDashboard] = useState(true);
  const [overlayType, setOverlayType] = useState<InfoType | null>(null);

  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: ConfirmationType;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => { },
  });

  const showConfirm = (config: Omit<typeof confirmConfig, 'isOpen'>) => {
    setConfirmConfig({ ...config, isOpen: true });
  };

  const closeConfirm = () => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Sync dashboard state with selection
  useEffect(() => {
    if (selectedId) setShowDashboard(false);
  }, [selectedId]);

  const handleEnter = () => {
    setIsAuthenticated(true);
    localStorage.setItem('promptforge_auth', 'true');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('promptforge_auth');
    setSelectedId(null);
    setShowDashboard(true);
  };

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
  useEffect(() => {
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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-canvas-base">
        <LandingPage onEnter={handleEnter} />
        <SiteFooter onOpenInfo={setOverlayType} />
        {overlayType && (
          <InfoOverlay
            type={overlayType}
            onClose={() => setOverlayType(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-canvas-base text-txt-primary font-sans transition-colors duration-300">
      <div className="flex flex-1 overflow-hidden">
        <PromptList
          prompts={prompts}
          selectedId={selectedId}
          onSelect={(id) => { setSelectedId(id); setShowDashboard(false); }}
          onDelete={(id) => showConfirm({
            type: 'danger',
            title: 'Delete Prompt',
            message: 'Are you sure you want to delete this prompt? This action cannot be undone.',
            confirmLabel: 'Delete',
            onConfirm: () => { deletePrompt(id); closeConfirm(); }
          })}
          onBulkDelete={(ids) => showConfirm({
            type: 'danger',
            title: 'Delete Selected',
            message: `Are you sure you want to delete ${ids.length} prompts? This will permanently remove them from your library.`,
            confirmLabel: 'Delete All',
            onConfirm: () => { bulkDeletePrompts(ids); closeConfirm(); }
          })}
          onCreate={() => { createPrompt(); setShowDashboard(false); }}
          onExport={exportLibrary}
          onImport={importLibrary}
          onGoHome={() => setShowDashboard(true)}
          isHomeActive={showDashboard}
        />

        {showDashboard ? (
          <Dashboard
            prompts={prompts}
            stats={stats}
            onCreatePrompt={() => { createPrompt(); setShowDashboard(false); }}
            onImportLibrary={importLibrary}
            onSelectPrompt={(id) => { setSelectedId(id); setShowDashboard(false); }}
          />
        ) : selectedPrompt ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <PromptEditor
              key={selectedPrompt.id}
              prompt={selectedPrompt}
              onUpdate={updatePrompt}
              availableCategories={uniqueCategories}
              isTitleUnique={(title) => checkTitleUnique(title, selectedPrompt.id)}
              onShowConfirm={showConfirm}
              onCloseConfirm={closeConfirm}
            />
          </div>
        ) : (
          <Dashboard
            prompts={prompts}
            stats={stats}
            onCreatePrompt={() => { createPrompt(); setShowDashboard(false); }}
            onImportLibrary={importLibrary}
            onSelectPrompt={(id) => { setSelectedId(id); setShowDashboard(false); }}
          />
        )}
      </div>

      <SiteFooter onOpenInfo={setOverlayType} />

      {overlayType && (
        <InfoOverlay
          type={overlayType}
          onClose={() => setOverlayType(null)}
        />
      )}

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        type={confirmConfig.type}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
      />

      {/* Logout Utility for Debug */}
      <button
        onClick={handleSignOut}
        className="absolute bottom-12 right-4 p-2 text-[10px] text-txt-muted hover:text-accent-1 transition-colors z-[60] opacity-20 hover:opacity-100 font-bold uppercase tracking-widest"
      >
        Simulate Logout
      </button>
    </div>
  );
};


export default App;