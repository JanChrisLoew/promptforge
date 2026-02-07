import React from 'react';
import { GitCommit } from 'lucide-react';

interface CommitButtonProps {
    showCommitInput: boolean;
    setShowCommitInput: (show: boolean) => void;
    commitNote: string;
    setCommitNote: (note: string) => void;
    onSaveVersion: () => void;
}

export const CommitButton: React.FC<CommitButtonProps> = ({
    showCommitInput,
    setShowCommitInput,
    commitNote,
    setCommitNote,
    onSaveVersion
}) => {
    return (
        <div className="relative">
            {showCommitInput && (
                <div className="absolute right-0 top-12 z-10 bg-canvas-card shadow-xl border border-color-border p-3 rounded-lg w-72 animate-in slide-in-from-top-2">
                    <input
                        autoFocus
                        className="w-full text-xs p-2 border border-color-border rounded mb-2 focus:ring-2 focus:ring-accent-3 focus:border-accent-3 outline-none text-txt-primary bg-canvas-base"
                        placeholder="What changed? (Press Enter to save)"
                        value={commitNote}
                        onChange={e => setCommitNote(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onSaveVersion()}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowCommitInput(false)} className="text-xs text-txt-secondary hover:text-txt-primary font-bold">Cancel</button>
                        <button onClick={onSaveVersion} className="text-xs bg-accent-3 hover:bg-accent-3/90 text-white px-3 py-1.5 rounded-md font-bold transition-all active:scale-95 shadow-sm">Save Snapshot</button>
                    </div>
                </div>
            )}
            <button
                onClick={() => setShowCommitInput(!showCommitInput)}
                className={`flex items-center gap-2 border hover:border-accent-3 hover:text-accent-3 py-2 px-3 rounded-lg text-sm font-bold transition-all shadow-sm ${showCommitInput ? 'bg-accent-3 text-white border-accent-3 hover:text-white' : 'bg-canvas-card text-txt-secondary border-color-border'}`}
                title="Save Version (Ctrl+S)"
            >
                <GitCommit size={16} /> Save Version
            </button>
        </div>
    );
};
