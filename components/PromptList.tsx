import React, { useCallback } from 'react';
import { Prompt } from '../types';
import { PromptCategory } from './PromptCategory';
import { PromptListHeader } from './PromptList/PromptListHeader';
import { PromptListToolbar } from './PromptList/PromptListToolbar';
import { PromptListActions } from './PromptList/PromptListActions';
import { usePromptSearch, usePromptGrouping, useBulkSelection } from '../hooks/usePromptListLogic';

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
  isHomeActive
}) => {
  const { searchTerm, setSearchTerm, filteredPrompts } = usePromptSearch(prompts);
  const { sortMode, setSortMode, groupedPrompts, expandedCategories, toggleCategory } = usePromptGrouping(filteredPrompts);
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

  return (
    <div className="flex flex-col h-full bg-canvas-card border-r border-color-border w-full md:w-80 flex-shrink-0 text-txt-primary z-20 relative transition-colors duration-300">
      <div className="p-4 border-b border-color-border space-y-4">
        <PromptListHeader
          onGoHome={onGoHome}
          isHomeActive={isHomeActive}
          onImport={onImport}
          onExport={onExport}
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
          <div className="text-center py-10 text-txt-muted text-sm">
            {searchTerm ? 'No matches found' : 'Create your first prompt'}
          </div>
        ) : (
          Object.entries(groupedPrompts).sort().map(([category, items]) => (
            <PromptCategory
              key={category}
              category={category}
              items={items}
              isExpanded={expandedCategories.has(category)}
              selectedId={selectedId}
              selectedIds={selectedIds}
              sortMode={sortMode}
              onToggle={toggleCategory}
              onSelect={onSelect}
              onDelete={handleDelete}
              onToggleBulkSelect={toggleBulkSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};

