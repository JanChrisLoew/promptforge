import React from 'react';
import { Folder, Copy, Check, Download, GitCommit } from 'lucide-react';

interface EditorHeaderProps {
    title: string;
    category: string;
    isTitleValid: boolean;
    onTitleChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    availableCategories: string[];
    isDirty: boolean;
    copySuccess: boolean;
    onCopyContent: () => void;
    onExport: () => void;
    showCommitInput: boolean;
    setShowCommitInput: (show: boolean) => void;
    commitNote: string;
    setCommitNote: (note: string) => void;
    onSaveVersion: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
    title,
    category,
    isTitleValid,
    onTitleChange,
    onCategoryChange,
    availableCategories,
    isDirty,
    copySuccess,
    onCopyContent,
    onExport,
    showCommitInput,
    setShowCommitInput,
    commitNote,
    setCommitNote,
    onSaveVersion,
}) => {
    return (
        <div className="h-16 bg-canvas-card border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 gap-4 shadow-sm z-10">
            <div className="flex-1 flex items-center gap-4 min-w-0">
                <div className="relative group">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
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
                        value={category}
                        onChange={(e) => onCategoryChange(e.target.value)}
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
                            <span className="w-2 h-2 bg-accent-2 rounded-full"></span> Saving...
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-txt-muted text-xs font-medium opacity-50">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Saved
                        </div>
                    )}
                </div>

                <button
                    onClick={onCopyContent}
                    className="p-2 text-txt-muted hover:bg-canvas-base hover:text-accent-3 rounded-lg transition-colors"
                    title="Copy Prompt Content"
                >
                    {copySuccess ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>

                <button
                    onClick={onExport}
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
                                onKeyDown={e => e.key === 'Enter' && onSaveVersion()}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowCommitInput(false)} className="text-xs text-txt-secondary hover:text-txt-primary">Cancel</button>
                                <button onClick={onSaveVersion} className="text-xs bg-accent-3 hover:bg-[#007da0] text-white px-3 py-1.5 rounded-md font-semibold transition-colors">Save Snapshot</button>
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
    );
};
