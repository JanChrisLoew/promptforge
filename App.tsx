import React, { useState } from 'react';
import { MainWorkspace } from './components/MainWorkspace';
import { LandingPage } from './components/LandingPage';
import { SiteFooter } from './components/SiteFooter';
import { InfoOverlay, InfoType } from './components/InfoOverlay';
import { ConfirmationModal } from './components/ConfirmationModal';
import { usePromptLibrary } from './hooks/usePromptLibrary';
import { useAuthSession } from './hooks/useAuthSession';
import { useConfirmationModal } from './hooks/useConfirmationModal';
import { useLibraryStats } from './hooks/useLibraryStats';
import { useImportHandler } from './hooks/useImportHandler';

const App: React.FC = () => {
  // ... (keep existing usePromptLibrary, useAuthSession, useConfirmationModal)
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

  const { isAuthenticated, login, logout } = useAuthSession();
  const { confirmConfig, showConfirm, closeConfirm } = useConfirmationModal();
  const [showDashboard, setShowDashboard] = useState(true);
  const [overlayType, setOverlayType] = useState<InfoType | null>(null);

  const { uniqueCategories, stats } = useLibraryStats(prompts);
  const handleImport = useImportHandler(importLibrary, showConfirm, closeConfirm);

  const handleSignOut = () => {
    logout();
    setSelectedId(null);
    setShowDashboard(true);
  };



  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-canvas-base">
        <LandingPage onEnter={login} />
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
