import React, { useState, useEffect, useRef } from 'react';
import { Prompt, PromptVersion } from '../types';
import { Copy, Check, History, RotateCcw, GitCommit, Folder, Download, Cloud, CloudOff } from 'lucide-react';
import { generateId, sanitizeFilename, downloadJson, formatDate } from '../utils';

interface PromptEditorProps {
  prompt: Prompt;
  onUpdate: (updatedPrompt: Prompt) => void;
  availableCategories: string[];
  isTitleUnique: (title: string) => boolean;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onUpdate, availableCategories, isTitleUnique }) => {
  const [localPrompt, setLocalPrompt] = useState<Prompt>(prompt);
  const [tagInput, setTagInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  
  // UI State
  const [copySuccess, setCopySuccess] = useState(false);
  const [commitNote, setCommitNote] = useState('');
  const [showCommitInput, setShowCommitInput] = useState(false);

  // Refs for data safety
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localPromptRef = useRef<Prompt>(prompt); // Keep a ref to always have latest state in cleanup
  const isDirtyRef = useRef(false); // Ref for dirty state to access in cleanup
  const isMounted = useRef(false);

  // Sync refs with state
  useEffect(() => {
    localPromptRef.current = localPrompt;
    isDirtyRef.current = isDirty;
  }, [localPrompt, isDirty]);

  // 1. Safety Flush & Sync on Prompt ID Change
  useEffect(() => {
    // If we are switching prompts and the previous one was dirty, save it immediately!
    if (isDirtyRef.current && localPromptRef.current.id !== prompt.id) {
        // Critical: Update with the OLD localPrompt data before switching
        // We calculate the timestamp here to ensure it's marked as updated
        onUpdate({ ...localPromptRef.current, lastUpdated: new Date().toISOString() });
    }

    // Now reset for the new prompt
    setLocalPrompt(prompt);
    localPromptRef.current = prompt;
    setTagInput('');
    setCommitNote('');
    setShowCommitInput(false);
    setIsDirty(false);
    isDirtyRef.current = false;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [prompt.id]); // Only run when ID changes (user clicks different prompt)

  // 2. Handle Debounced Saving (Auto-save while typing)
  useEffect(() => {
    if (!isMounted.current) {
        isMounted.current = true;
        return;
    }

    if (isDirty) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        timeoutRef.current = setTimeout(() => {
            onUpdate({ ...localPrompt, lastUpdated: new Date().toISOString() });
            setIsDirty(false);
        }, 600);
    }

    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [localPrompt, isDirty, onUpdate]);

  // 3. Safety Flush on Unmount (e.g. closing tab/navigating away)
  useEffect(() => {
      return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (isDirtyRef.current) {
              onUpdate({ ...localPromptRef.current, lastUpdated: new Date().toISOString() });
          }
      };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        setShowCommitInput(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isTitleValid = isTitleUnique(localPrompt.title);

  const handleChange = (field: keyof Prompt, value: any) => {
    setLocalPrompt(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!localPrompt.tags.includes(tagInput.trim())) {
        handleChange('tags', [...localPrompt.tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleChange('tags', localPrompt.tags.filter(t => t !== tagToRemove));
  };

  const copyToClipboard = () => {
    const content = `System: ${localPrompt.systemInstruction}\n\nUser: ${localPrompt.userPrompt}`;
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleExportSingle = () => {
    const safeTitle = sanitizeFilename(localPrompt.title);
    const shortId = localPrompt.id.split('-')[0] || 'id';
    const fileName = `prompt_${safeTitle}_${shortId}.json`;
    downloadJson(fileName, localPrompt);
  };

  const saveVersion = () => {
    const newVersion: PromptVersion = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      systemInstruction: localPrompt.systemInstruction,
      userPrompt: localPrompt.userPrompt,
      note: commitNote || `Version ${localPrompt.versions.length + 1}`
    };

    const updated = { ...localPrompt, versions: [newVersion, ...localPrompt.versions], lastUpdated: new Date().toISOString() };
    setLocalPrompt(updated);
    onUpdate(updated);
    
    setCommitNote('');
    setShowCommitInput(false);
    setIsDirty(false);
  };

  const restoreVersion = (e: React.MouseEvent, version: PromptVersion) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("Restore this version? Unsaved changes in the editor will be lost.")) {
      const updated: Prompt = {
        ...localPrompt,
        systemInstruction: version.systemInstruction || '',
        userPrompt: version.userPrompt || '',
        lastUpdated: new Date().toISOString()
      };
      
      setLocalPrompt(updated);
      onUpdate(updated);
      setIsDirty(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-canvas-base text-txt-primary">
      {/* Header */}
      <div className="h-16 bg-canvas-card border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 gap-4 shadow-sm z-10">
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="relative group">
            <input
              type="text"
              value={localPrompt.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`text-xl font-bold focus:outline-none focus:ring-0 border-none bg-transparent min-w-[200px] transition-colors ${!isTitleValid ? 'text-accent-1 decoration-wavy underline decoration-accent-1' : 'text-txt-primary'}`}
              placeholder="Untitled Prompt"
            />
            {!isTitleValid && (
               <div className="absolute top-full left-0 mt-1 bg-accent-1 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-1">
                  Name already exists
               </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-txt-muted border-l border-slate-200 pl-4 group relative">
            <Folder size={16} />
            <input 
              type="text" 
              value={localPrompt.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Enter category..."
              className="text-sm bg-transparent border border-transparent group-hover:border-slate-300 focus:border-accent-3 focus:bg-white focus:ring-2 focus:ring-accent-3/20 text-txt-secondary focus:text-txt-primary placeholder-txt-muted px-2 py-1 rounded transition-all w-48 outline-none font-medium"
              list="categories-list"
            />
            <datalist id="categories-list">
                {availableCategories.map(cat => (
                   <option key={cat} value={cat} />
                ))}
            </datalist>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="mr-2">
            {isDirty ? (
                <div className="flex items-center gap-1.5 text-accent-2 text-xs font-medium animate-pulse">
                    <CloudOff size={14} /> Saving...
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-txt-muted text-xs font-medium opacity-50">
                    <Cloud size={14} /> Saved
                </div>
            )}
          </div>

          <button
            onClick={copyToClipboard}
            className="p-2 text-txt-muted hover:bg-canvas-base hover:text-accent-3 rounded-lg transition-colors"
            title="Copy Prompt Content"
          >
            {copySuccess ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
          </button>

          <button
            onClick={handleExportSingle}
            className="p-2 text-txt-muted hover:bg-canvas-base hover:text-accent-3 rounded-lg transition-colors"
            title="Export this Prompt (JSON)"
          >
             <Download size={20} />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <div className="relative">
             {showCommitInput && (
                <div className="absolute right-0 top-12 z-10 bg-white shadow-xl border border-slate-200 p-3 rounded-lg w-72 animate-in slide-in-from-top-2">
                    <input 
                       autoFocus
                       className="w-full text-xs p-2 border border-slate-300 rounded mb-2 focus:ring-2 focus:ring-accent-3 focus:border-accent-3 outline-none text-txt-primary bg-white" 
                       placeholder="What changed? (Press Enter to save)"
                       value={commitNote}
                       onChange={e => setCommitNote(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && saveVersion()}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowCommitInput(false)} className="text-xs text-txt-secondary hover:text-txt-primary">Cancel</button>
                        <button onClick={saveVersion} className="text-xs bg-accent-3 hover:bg-[#007da0] text-white px-3 py-1.5 rounded-md font-semibold transition-colors">Save Snapshot</button>
                    </div>
                </div>
             )}
            <button
                onClick={() => setShowCommitInput(!showCommitInput)}
                className={`flex items-center gap-2 border hover:border-accent-3 hover:text-accent-3 py-2 px-3 rounded-lg text-sm font-bold transition-all shadow-sm ${showCommitInput ? 'bg-accent-3 text-white border-accent-3 hover:text-white' : 'bg-white text-txt-secondary border-slate-200'}`}
                title="Save Version (Ctrl+S)"
            >
                <GitCommit size={16} /> Save Version
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-txt-primary">System Instructions</label>
            <div className="relative">
              <textarea
                value={localPrompt.systemInstruction}
                onChange={(e) => handleChange('systemInstruction', e.target.value)}
                placeholder="You are a helpful assistant..."
                className="w-full h-32 p-4 bg-white text-txt-primary border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-accent-3/20 focus:border-accent-3 text-sm font-mono leading-relaxed resize-y outline-none transition-all placeholder:text-txt-muted"
              />
            </div>
            <p className="text-xs text-txt-secondary">Defines the persona and constraints of the model.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-txt-primary">User Prompt / Template</label>
            <textarea
              value={localPrompt.userPrompt}
              onChange={(e) => handleChange('userPrompt', e.target.value)}
              placeholder="Explain {{topic}} in simple terms..."
              className="w-full h-48 p-4 bg-white text-txt-primary border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-accent-3/20 focus:border-accent-3 text-sm font-mono leading-relaxed resize-y outline-none transition-all placeholder:text-txt-muted"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-txt-primary">Tags</label>
              <div className="flex flex-wrap gap-2 p-2 bg-white border border-slate-300 rounded-xl min-h-[42px] focus-within:ring-2 focus-within:ring-accent-3/20 focus-within:border-accent-3 transition-all shadow-sm">
                {localPrompt.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-accent-2/10 text-accent-2 px-2.5 py-1 rounded-md text-xs font-bold border border-accent-2/20">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-600 ml-1 transition-colors">&times;</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag..."
                  className="flex-1 min-w-[80px] text-sm focus:outline-none bg-transparent text-txt-primary placeholder-txt-muted"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-96 bg-canvas-base border-l border-slate-200 flex flex-col flex-shrink-0">
          <div className="h-16 flex items-center justify-center border-b border-slate-200 bg-white">
             <div className="flex items-center gap-2 text-sm font-bold text-txt-primary uppercase tracking-wider">
                <History size={16} className="text-accent-2" />
                Version History
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto relative custom-scrollbar p-2 space-y-2">
            {localPrompt.versions?.length === 0 ? (
                <div className="text-center py-10 text-txt-muted text-xs px-6">
                    <p>No versions saved yet.</p>
                    <p className="mt-2">Use <span className="font-mono bg-slate-200 px-1 rounded">Ctrl+S</span> to save a snapshot.</p>
                </div>
            ) : (
                localPrompt.versions.map((v) => (
                    <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-accent-2 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-xs font-bold text-txt-primary">{v.note || 'Untitled Version'}</p>
                                <p className="text-[10px] text-txt-muted">{formatDate(v.timestamp)}</p>
                            </div>
                            <button 
                                type="button"
                                onClick={(e) => restoreVersion(e, v)}
                                className="text-xs bg-slate-50 hover:bg-accent-2 hover:text-white text-txt-secondary p-1.5 rounded flex items-center gap-1 transition-colors relative z-10 cursor-pointer"
                                title="Restore this version"
                            >
                                <RotateCcw size={12} />
                            </button>
                        </div>
                        <div className="text-[10px] text-txt-secondary font-mono bg-canvas-base p-2 rounded truncate border border-slate-100">
                            {v.userPrompt.substring(0, 60)}...
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};