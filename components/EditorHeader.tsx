import React from 'react';
import { Copy, Check, Download, Lock } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CommitButton } from './CommitButton';
import { CategorySelect } from './CategorySelect';

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
    isReadOnly?: boolean;
    isNamingEnabled?: boolean;
    onSave: () => void;
}

const EditorTitle: React.FC<{
    title: string;
    isReadOnly: boolean;
    isTitleValid: boolean;
    onTitleChange: (val: string) => void;
}> = ({ title, isReadOnly, isTitleValid, onTitleChange }) => (
    <div className="relative group flex-1 flex items-center gap-2">
        {isReadOnly && <div className="text-accent-1"><Lock size={16} /></div>}
        <input
            type="text"
            value={title}
            onChange={(e) => !isReadOnly && onTitleChange(e.target.value)}
            readOnly={isReadOnly}
            className={`w-full text-xl font-bold focus:outline-none focus:ring-0 border-none bg-transparent transition-colors ${!isTitleValid ? 'text-accent-1 decoration-wavy underline decoration-accent-1' : 'text-txt-primary'} ${isReadOnly ? 'cursor-default opacity-80' : ''}`}
            placeholder="Untitled Prompt"
            title={isReadOnly ? "Managed by Structured Naming" : "Edit Title"}
        />
        {!isTitleValid && (
            <div className="absolute top-full left-0 mt-1 bg-accent-1 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-1">
                Name already exists
            </div>
        )}
    </div>
);

const EditorActions: React.FC<{
    isDirty: boolean;
    onSave: () => void;
    copySuccess: boolean;
    onCopyContent: () => void;
    onExport: () => void;
    showCommitInput: boolean;
    setShowCommitInput: (show: boolean) => void;
    commitNote: string;
    setCommitNote: (val: string) => void;
    onSaveVersion: () => void;
}> = ({ isDirty, onSave, copySuccess, onCopyContent, onExport, showCommitInput, setShowCommitInput, commitNote, setCommitNote, onSaveVersion }) => (
    <div className="flex items-center gap-3">
        <div className="mr-2 flex items-center gap-2">
            {isDirty ? (
                <>
                    <div className="flex items-center gap-1.5 text-accent-1 text-xs font-bold">
                        <span className="w-2 h-2 bg-accent-1 rounded-full animate-pulse"></span> Unsaved
                    </div>
                    <button
                        onClick={onSave}
                        className="text-xs bg-accent-1/10 hover:bg-accent-1/20 text-accent-1 px-2 py-1 rounded font-bold border border-accent-1/20 transition-colors"
                    >
                        Save
                    </button>
                </>
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

        <ThemeToggle />

        <div className="h-6 w-px bg-color-border mx-1"></div>

        <CommitButton
            showCommitInput={showCommitInput}
            setShowCommitInput={setShowCommitInput}
            commitNote={commitNote}
            setCommitNote={setCommitNote}
            onSaveVersion={onSaveVersion}
        />
    </div>
);

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
    isReadOnly = false,
    isNamingEnabled = false,
    onSave,
}) => {
    return (
        <div className="h-16 bg-canvas-card border-b border-color-border flex items-center justify-between px-6 flex-shrink-0 gap-4 shadow-sm z-10 transition-colors duration-300">
            <div className="flex-1 flex items-center gap-4 min-w-0">
                <EditorTitle
                    title={title}
                    isReadOnly={isReadOnly}
                    isTitleValid={isTitleValid}
                    onTitleChange={onTitleChange}
                />

                {!isNamingEnabled && (
                    <CategorySelect
                        value={category}
                        onChange={onCategoryChange}
                        categories={availableCategories}
                    />
                )}
            </div>

            <EditorActions
                isDirty={isDirty}
                onSave={onSave}
                copySuccess={copySuccess}
                onCopyContent={onCopyContent}
                onExport={onExport}
                showCommitInput={showCommitInput}
                setShowCommitInput={setShowCommitInput}
                commitNote={commitNote}
                setCommitNote={setCommitNote}
                onSaveVersion={onSaveVersion}
            />
        </div>
    );
};
