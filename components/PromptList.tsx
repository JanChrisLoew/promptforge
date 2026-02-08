import React, { useCallback } from 'react';
import { Ghost, PanelRight } from 'lucide-react';
import { Prompt } from '../types';
import { PromptFolder } from './PromptFolder';
import { PromptListHeader } from './PromptList/PromptListHeader';
import { PromptListToolbar } from './PromptList/PromptListToolbar';
import { PromptListActions } from './PromptList/PromptListActions';
import { AdvancedSearchToolbar } from './PromptList/AdvancedSearchToolbar';
import { usePromptSearch, usePromptGrouping, useBulkSelection } from '../hooks/usePromptListLogic';
import { useSettings } from '../hooks/useSettings';
import { downloadJson } from '../utils';

interface PromptListProps {
  prompts: Prompt[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onBulkDelete: (ids: string[]) => void;
  onGoHome: () => void;
  onOpenSettings: () => void;
  onUpdatePrompt: (prompt: Prompt) => void;
  isHomeActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export const PromptList: React.FC<PromptListProps> = ({
  prompts,
  selectedId,
  onSelect,
  onDelete,
  onCreate,
  onImport,
  onExport,
  onBulkDelete,
  onGoHome,
  onOpenSettings,
  onUpdatePrompt,
  isHomeActive,
  isOpen,
  onToggle
}) => {
  const { settings } = useSettings();
  const { searchTerm, setSearchTerm, filteredPrompts, activeFilters, setFilter, clearFilters } = usePromptSearch(prompts);

  const isFilterActive = searchTerm.length > 0 || Object.keys(activeFilters).length > 0;

  const { sortMode, setSortMode, groupedPrompts, expandedPaths, toggleFolder } = usePromptGrouping(filteredPrompts, settings, isFilterActive);
  const { selectedIds, toggleBulkSelect, clearSelection } = useBulkSelection();

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  }, [onDelete]);

  const handleBulkDelete = () => {
    onBulkDelete(Array.from(selectedIds));
    clearSelection();
  };

  const handleMovePrompt = useCallback((promptId: string, targetCategory: string) => {
    // Only allow when naming schema is disabled
    if (settings.namingSchema.enabled) return;

    const prompt = prompts.find(p => p.id === promptId);
    if (prompt && prompt.category !== targetCategory) {
      onUpdatePrompt({
        ...prompt,
        category: targetCategory,
        lastUpdated: new Date().toISOString()
      });
    }
  }, [prompts, settings.namingSchema.enabled, onUpdatePrompt]);

  const handleBulkDownload = () => {
    if (selectedIds.size === 0) return;

    const promptsToDownload = prompts.filter(p => selectedIds.has(p.id));
    const exportFileDefaultName = `promptforge_export_selected_${new Date().toISOString().slice(0, 10)}.json`;

    downloadJson(exportFileDefaultName, promptsToDownload);
    clearSelection();
  };

  return (
    <div className={`flex flex-col h-full bg-canvas-subtle border-r border-color-border flex-shrink-0 transition-all duration-300 ease-in-out relative
      ${isOpen ? 'w-[320px] lg:w-[360px]' : 'w-0 border-r-0'}
    `}>
      {/* Floating Toggle for closed state */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="absolute left-4 top-4 p-1.5 bg-canvas-card border border-color-border rounded-md shadow-lg text-accent-3 hover:text-accent-3 hover:bg-accent-3/10 transition-all z-[100] animate-in fade-in slide-in-from-left-4"
          title="Open Library"
        >
          <PanelRight size={18} />
        </button>
      )}

      <div className={`flex-1 flex flex-col h-full overflow-hidden ${!isOpen ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-opacity duration-200`}>
        <div className="p-3 border-b border-color-border space-y-3 bg-canvas-base/50 backdrop-blur-sm z-10">
          <PromptListHeader
            onGoHome={onGoHome}
            isHomeActive={isHomeActive}
            onImport={onImport}
            onExport={onExport}
            onOpenSettings={onOpenSettings}
          />

          <PromptListActions
            selectedIdsCount={selectedIds.size}
            onBulkDelete={handleBulkDelete}
            onBulkDownload={handleBulkDownload}
            onCreate={onCreate}
            onToggle={onToggle}
            isOpen={isOpen}
          />

          <PromptListToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortMode={sortMode}
            setSortMode={setSortMode}
          />

          <AdvancedSearchToolbar
            settings={settings}
            activeFilters={activeFilters}
            onFilterChange={setFilter}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-txt-muted/50">
              <Ghost size={48} className="mb-4 opacity-50" />
              <p className="text-sm font-medium">{isFilterActive ? 'No matches found' : 'Your library is empty'}</p>
              {!isFilterActive && <p className="text-xs mt-1">Create a new prompt to get started</p>}
            </div>
          ) : (
            Object.values(groupedPrompts)
              .map(node => (
                <PromptFolder
                  key={node.path}
                  node={node}
                  expandedPaths={expandedPaths}
                  selectedId={selectedId}
                  selectedIds={selectedIds}
                  sortMode={sortMode}
                  onToggle={toggleFolder}
                  onSelect={onSelect}
                  onDelete={handleDelete}
                  onToggleBulkSelect={toggleBulkSelect}
                  onMovePrompt={handleMovePrompt}
                  isManualMode={!settings.namingSchema.enabled}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};


