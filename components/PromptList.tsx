import React, { useCallback } from 'react';
import { Ghost } from 'lucide-react';
import { Prompt } from '../types';
import { PromptFolder } from './PromptFolder';
import { PromptListHeader } from './PromptList/PromptListHeader';
import { PromptListToolbar } from './PromptList/PromptListToolbar';
import { PromptListActions } from './PromptList/PromptListActions';
import { usePromptSearch, usePromptGrouping, useBulkSelection } from '../hooks/usePromptListLogic';
import { useSettings } from '../hooks/useSettings';

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
  isHomeActive
}) => {
  const { settings } = useSettings();
  const { searchTerm, setSearchTerm, filteredPrompts } = usePromptSearch(prompts);
  const { sortMode, setSortMode, groupedPrompts, expandedPaths, toggleFolder } = usePromptGrouping(filteredPrompts, settings);
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

  return (
    <div className="flex flex-col h-full bg-canvas-card border-r border-color-border w-full md:w-96 flex-shrink-0 text-txt-primary z-20 relative transition-colors duration-300">
      <div className="p-4 border-b border-color-border space-y-4">
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
          onCreate={onCreate}
        />

        <PromptListToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortMode={sortMode}
          setSortMode={setSortMode}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {Object.keys(groupedPrompts).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-txt-muted/50">
            <Ghost size={48} className="mb-4 opacity-50" />
            <p className="text-sm font-medium">{searchTerm ? 'No matches found' : 'Your library is empty'}</p>
            {!searchTerm && <p className="text-xs mt-1">Create a new prompt to get started</p>}
          </div>
        ) : (
          Object.values(groupedPrompts)
            .sort((a, b) => a.name.localeCompare(b.name))
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
  );
};


