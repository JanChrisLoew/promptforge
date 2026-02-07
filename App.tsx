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
import { MasterDataPage } from './components/Settings/MasterDataPage';
import { useSettings } from './hooks/useSettings';
import { SettingsProvider } from './contexts/SettingsContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuthSession();
  const { settings } = useSettings();
  const userName = settings.userName;

  // Core Hooks (Lifted state)
  const {
    prompts,
    selectedId,
    setSelectedId,
    updatePrompt,
    createPrompt,
    deletePrompt,
    importLibrary,
    exportLibrary,
    bulkDeletePrompts
  } = usePromptLibrary();

  const { confirmConfig, showConfirm, closeConfirm } = useConfirmationModal();
  const { stats } = useLibraryStats(prompts);
  const { fileInputRef, handleImportClick, handleFileChange } = useImportHandler(importLibrary, showConfirm, closeConfirm);

  // UI State
  const [showDashboard, setShowDashboard] = useState(true);
  const [overlayType, setOverlayType] = useState<InfoType | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  if (!isAuthenticated) {
    return <LandingPage onEnter={login} />;
  }

  if (showSettings) {
    return <MasterDataPage onClose={() => setShowSettings(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-canvas-base text-txt-primary font-sans transition-colors duration-300 relative overflow-hidden">
      <MainWorkspace
        prompts={prompts}
        selectedId={selectedId}
        onSelect={(id) => { setSelectedId(id); setShowDashboard(false); }}
        onUpdatePrompt={updatePrompt}
        onCreate={() => { createPrompt(userName); setShowDashboard(false); }}
        onDelete={(id) => showConfirm({
          type: 'danger',
          title: 'Delete Prompt',
          message: 'Are you sure you want to delete this prompt?',
          confirmLabel: 'Delete',
          onConfirm: () => {
            deletePrompt(id);
            closeConfirm();
          }
        })}
        onBulkDelete={bulkDeletePrompts}
        onImport={handleImportClick}
        onExport={exportLibrary}
        showDashboard={showDashboard}
        onGoHome={() => { setShowDashboard(true); setSelectedId(null); }}
        stats={stats}
        uniqueCategories={Array.from(new Set([
          ...settings.manualCategories,
          ...prompts.map(p => p.category).filter(Boolean)
        ])).sort()}
        checkTitleUnique={(title: string) => !prompts.some(p => p.title.toLowerCase() === title.toLowerCase() && p.id !== selectedId)}
        onShowConfirm={showConfirm}
        onCloseConfirm={closeConfirm}
        onOpenSettings={() => setShowSettings(true)}
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

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />

      {/* Logout Utility for Debug - positioned absolute to not affect layout */}
      <button
        onClick={logout}
        className="absolute bottom-12 right-4 p-2 text-[10px] text-txt-muted hover:text-accent-1 transition-colors z-[60] opacity-20 hover:opacity-100 font-bold uppercase tracking-widest"
      >
        Simulate Logout
      </button>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
