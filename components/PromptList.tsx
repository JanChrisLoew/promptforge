import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Prompt } from '../types';
import { Plus, Search, Trash2, Download, Upload, SortAsc, Clock, MoreVertical } from 'lucide-react';
import { PromptCategory } from './PromptCategory';

interface PromptListProps {
  prompts: Prompt[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onBulkDelete: (ids: string[]) => void;
}

type SortMode = 'alpha' | 'recent';

export const PromptList: React.FC<PromptListProps> = ({
  prompts,
  selectedId,
  onSelect,
  onDelete,
  onCreate,
  onImport,
  onExport,
  onBulkDelete
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['General']));
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredPrompts = useMemo(() => prompts.filter(p =>
    p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(debouncedSearch.toLowerCase()))
  ), [prompts, debouncedSearch]);

  const groupedPrompts = useMemo(() => {
    const groups: Record<string, Prompt[]> = {};
    filteredPrompts.forEach(p => {
      const cat = p.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });

    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => {
        if (sortMode === 'alpha') return a.title.localeCompare(b.title);
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
    });

    return groups;
  }, [filteredPrompts, sortMode]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  }, [onDelete]);

  const handleToggleBulkSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-canvas-card border-r border-color-border w-full md:w-80 flex-shrink-0 text-txt-primary z-20 relative transition-colors duration-300">
      <div className="p-4 border-b border-color-border space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <span className="w-8 h-8 bg-accent-1 rounded-lg flex items-center justify-center text-white text-lg shadow-md">P</span>
            PromptForge
          </h1>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-lg transition-colors ${showMenu ? 'bg-accent-3/10 text-accent-3' : 'text-txt-muted hover:bg-canvas-hover hover:text-txt-primary'}`}
              title="Library Options"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-canvas-card rounded-xl shadow-xl border border-color-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="py-1">
                  <label className="flex items-center gap-3 px-4 py-3 text-sm text-txt-primary hover:bg-canvas-hover cursor-pointer transition-colors">
                    <Upload size={16} className="text-accent-3" />
                    <span>Import Library</span>
                    <input type="file" accept=".json" onChange={(e) => { onImport(e); setShowMenu(false); }} className="hidden" />
                  </label>
                  <button
                    onClick={() => { onExport(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-txt-primary hover:bg-canvas-hover cursor-pointer transition-colors text-left"
                  >
                    <Download size={16} className="text-accent-3" />
                    <span>Export Library</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {selectedIds.size > 0 ? (
            <button
              onClick={() => {
                onBulkDelete(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-accent-1 hover:bg-[#b0301c] text-white py-2.5 px-3 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 animate-in zoom-in-95"
            >
              <Trash2 size={16} /> Delete Selected ({selectedIds.size})
            </button>
          ) : (
            <button
              onClick={onCreate}
              className="flex-1 flex items-center justify-center gap-2 bg-accent-1 hover:bg-[#b0301c] text-white py-2.5 px-3 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus size={16} /> New Prompt
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-2.5 text-txt-muted group-focus-within:text-accent-3 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-canvas-base border border-color-border rounded-lg text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-3/50 focus:border-accent-3 transition-all placeholder:text-txt-muted shadow-sm"
            />
          </div>
          <button
            onClick={() => setSortMode(prev => prev === 'recent' ? 'alpha' : 'recent')}
            className="p-2 border border-color-border rounded-lg bg-canvas-base text-txt-secondary hover:text-accent-3 hover:border-accent-3 transition-colors shadow-sm"
            title={`Sort by: ${sortMode === 'recent' ? 'Last Updated' : 'Name (A-Z)'}`}
          >
            {sortMode === 'recent' ? <Clock size={18} /> : <SortAsc size={18} />}
          </button>
        </div>
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
              onToggleBulkSelect={handleToggleBulkSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};

