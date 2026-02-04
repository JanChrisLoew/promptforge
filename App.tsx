import React, { useState, useMemo } from 'react';
import { MainWorkspace } from './components/MainWorkspace';
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
    bulkDeletePrompts
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

  const stats = useMemo(() => {
    const totalPrompts = prompts.length;
    const totalVersions = prompts.reduce((acc: number, p) => acc + (p.versions?.length || 0), 0);
    const allTags = new Set(prompts.flatMap(p => p.tags));
    return { totalPrompts, totalVersions, uniqueTags: allTags.size };
  }, [prompts]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    importLibrary(
      e,
      (stats) => {
        showConfirm({
          type: 'info',
          title: 'Import Complete',
          message: `Successfully processed your library:\n• ${stats.new} New Prompts\n• ${stats.updated} Updated\n• ${stats.skipped} Already up-to-date\n${stats.errors > 0 ? `• ${stats.errors} Invalid items skipped` : ''}`,
          confirmLabel: 'Great',
          onConfirm: closeConfirm
        });
      },
      (error) => {
        showConfirm({
          type: 'danger',
          title: 'Import Failed',
          message: error,
          confirmLabel: 'Try Again',
          onConfirm: closeConfirm
        });
      }
    );
  };



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
      <MainWorkspace
        prompts={prompts}
        selectedId={selectedId}
        showDashboard={showDashboard}
        stats={stats}
        uniqueCategories={uniqueCategories}
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
        onImport={handleImport}
        onGoHome={() => setShowDashboard(true)}
        onUpdatePrompt={updatePrompt}
        checkTitleUnique={checkTitleUnique}
        onShowConfirm={showConfirm}
        onCloseConfirm={closeConfirm}
      />

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
