import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Prompt } from '../types';
import { Plus, Search, Trash2, Download, Upload, Folder, FolderOpen, ChevronRight, ChevronDown, SortAsc, Clock, MoreVertical } from 'lucide-react';
import { formatDate } from '../utils';

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
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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

  // Group by category and Sort
  const groupedPrompts = useMemo(() => {
    const groups: Record<string, Prompt[]> = {};

    // 1. Group
    filteredPrompts.forEach(p => {
      const cat = p.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });

    // 2. Sort within groups
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => {
        if (sortMode === 'alpha') {
          return a.title.localeCompare(b.title);
        } else {
          // Recent: compare dates descending
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        }
      });
    });

    return groups;
  }, [filteredPrompts, sortMode]);

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="flex flex-col h-full bg-canvas-card border-r border-slate-200 w-full md:w-80 flex-shrink-0 text-txt-primary z-20 relative">
      <div className="p-4 border-b border-slate-200 space-y-4">
        {/* Header Title & Library Menu */}
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

            {/* Library Options Dropdown */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
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

        {/* Primary Action */}
        <div className="flex gap-2">
          {selectedIds.size > 0 ? (
            <button
              onClick={() => {
                if (window.confirm(`Delete ${selectedIds.size} selected prompts?`)) {
                  onBulkDelete(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }
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

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-2.5 text-txt-muted group-focus-within:text-accent-3 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-3/50 focus:border-accent-3 transition-all placeholder:text-txt-muted shadow-sm"
            />
          </div>
          <button
            onClick={() => setSortMode(prev => prev === 'recent' ? 'alpha' : 'recent')}
            className="p-2 border border-slate-300 rounded-lg bg-white text-txt-secondary hover:text-accent-3 hover:border-accent-3 transition-colors shadow-sm"
            title={`Sort by: ${sortMode === 'recent' ? 'Last Updated' : 'Name (A-Z)'}`}
          >
            {sortMode === 'recent' ? <Clock size={18} /> : <SortAsc size={18} />}
          </button>
        </div>
      </div>

      {/* Prompt List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {Object.keys(groupedPrompts).length === 0 ? (
          <div className="text-center py-10 text-txt-muted text-sm">
            {searchTerm ? 'No matches found' : 'Create your first prompt'}
          </div>
        ) : (
          Object.entries(groupedPrompts).sort().map(([category, items]) => {
            const categoryItems = items as Prompt[];
            return (
              <div key={category} className="mb-2">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-txt-secondary uppercase hover:bg-canvas-hover rounded-md transition-colors"
                >
                  {expandedCategories.has(category) ? <ChevronDown size={14} className="text-accent-2" /> : <ChevronRight size={14} className="text-txt-muted" />}
                  {expandedCategories.has(category) ? <FolderOpen size={14} className="text-accent-2" /> : <Folder size={14} className="text-txt-muted" />}
                  {category} <span className="ml-auto bg-slate-100 text-txt-muted px-2 py-0.5 rounded-full text-[10px]">{categoryItems.length}</span>
                </button>

                {expandedCategories.has(category) && (
                  <div className="pl-2 mt-1 space-y-1">
                    {categoryItems.map(prompt => (
                      <div
                        key={prompt.id}
                        className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all border relative ${selectedId === prompt.id
                          ? 'bg-accent-3/10 border-accent-3 shadow-sm'
                          : 'bg-transparent border-transparent hover:bg-canvas-hover hover:border-slate-200'
                          }`}
                      >
                        <div className="mr-3 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(prompt.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newSet = new Set(selectedIds);
                              if (newSet.has(prompt.id)) newSet.delete(prompt.id);
                              else newSet.add(prompt.id);
                              setSelectedIds(newSet);
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-accent-3 focus:ring-accent-3 accent-accent-3 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-2" onClick={() => onSelect(prompt.id)}>
                          <h3 className={`font-bold text-sm truncate ${selectedId === prompt.id ? 'text-accent-3' : 'text-txt-primary'}`}>
                            {prompt.title || 'Untitled Prompt'}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {prompt.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-txt-secondary border border-slate-200 rounded-md font-medium">
                                {tag}
                              </span>
                            ))}
                            <span className="text-[10px] text-txt-muted ml-1 font-mono">
                              {sortMode === 'recent'
                                ? formatDate(prompt.lastUpdated, 'short')
                                : `v${(prompt.versions?.length || 0) + 1}`
                              }
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, prompt.id)}
                          className={`
                            flex-shrink-0 p-2 rounded-md transition-all z-10 relative
                            ${selectedId === prompt.id
                              ? 'opacity-100 text-txt-muted hover:text-accent-1 hover:bg-red-50'
                              : 'opacity-0 group-hover:opacity-100 text-txt-muted hover:text-accent-1 hover:bg-red-50'}
                          `}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
