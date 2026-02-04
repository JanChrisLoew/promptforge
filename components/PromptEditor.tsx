import React, { useState, useEffect, useRef } from 'react';
import { Prompt, PromptVersion } from '../types';
import { generateId, sanitizeFilename, downloadJson } from '../utils';
import { EditorHeader } from './EditorHeader';
import { TagManager } from './TagManager';
import { VersionList } from '././VersionList';
import { useDebounce } from '../hooks/useDebounce';
import { ConfirmationType } from './ConfirmationModal';

interface PromptEditorProps {
  prompt: Prompt;
  onUpdate: (updatedPrompt: Prompt) => void;
  availableCategories: string[];
  isTitleUnique: (title: string) => boolean;
  onShowConfirm: (config: {
    type: ConfirmationType;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }) => void;
  onCloseConfirm: () => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onUpdate,
  availableCategories,
  isTitleUnique,
  onShowConfirm,
  onCloseConfirm
}) => {
  const [localPrompt, setLocalPrompt] = useState<Prompt>(prompt);
  const [tagInput, setTagInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // UI State
  const [copySuccess, setCopySuccess] = useState(false);
  const [commitNote, setCommitNote] = useState('');
  const [showCommitInput, setShowCommitInput] = useState(false);

  // Refs for data safety
  const localPromptRef = useRef<Prompt>(prompt);
  const isDirtyRef = useRef(false);

  // Sync refs with state for cleanup access
  useEffect(() => {
    localPromptRef.current = localPrompt;
    isDirtyRef.current = isDirty;
  }, [localPrompt, isDirty]);

  // Handle Prompt ID Change
  useEffect(() => {
    if (isDirtyRef.current && localPromptRef.current.id !== prompt.id) {
      onUpdate({ ...localPromptRef.current, lastUpdated: new Date().toISOString() });
    }

    setLocalPrompt(prompt);
    setTagInput('');
    setCommitNote('');
    setShowCommitInput(false);
    setIsDirty(false);
  }, [prompt.id]);

  // Debounced Auto-save
  const debouncedPrompt = useDebounce(localPrompt, 600);

  useEffect(() => {
    if (isDirty && debouncedPrompt.id === localPrompt.id) {
      onUpdate({ ...debouncedPrompt, lastUpdated: new Date().toISOString() });
      setIsDirty(false);
    }
  }, [debouncedPrompt, onUpdate]);

  // Safety Flush on Unmount
  useEffect(() => {
    return () => {
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
    downloadJson(`prompt_${safeTitle}_${shortId}.json`, localPrompt);
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

    onShowConfirm({
      type: 'warning',
      title: 'Restore Version',
      message: 'Are you sure you want to restore this version? All unsaved changes in the current editor will be lost.',
      confirmLabel: 'Restore',
      onConfirm: () => {
        const updated: Prompt = {
          ...localPrompt,
          systemInstruction: version.systemInstruction || '',
          userPrompt: version.userPrompt || '',
          lastUpdated: new Date().toISOString()
        };

        setLocalPrompt(updated);
        onUpdate(updated);
        setIsDirty(false);
        onCloseConfirm();
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-canvas-base text-txt-primary">
      <EditorHeader
        title={localPrompt.title}
        category={localPrompt.category}
        isTitleValid={isTitleUnique(localPrompt.title)}
        onTitleChange={(val) => handleChange('title', val)}
        onCategoryChange={(val) => handleChange('category', val)}
        availableCategories={availableCategories}
        isDirty={isDirty}
        copySuccess={copySuccess}
        onCopyContent={copyToClipboard}
        onExport={handleExportSingle}
        showCommitInput={showCommitInput}
        setShowCommitInput={setShowCommitInput}
        commitNote={commitNote}
        setCommitNote={setCommitNote}
        onSaveVersion={saveVersion}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-txt-primary">System Instructions</label>
            <textarea
              value={localPrompt.systemInstruction}
              onChange={(e) => handleChange('systemInstruction', e.target.value)}
              placeholder="You are a helpful assistant..."
              className="w-full h-32 p-4 bg-canvas-card text-txt-primary border border-color-border rounded-xl shadow-sm focus:ring-2 focus:ring-accent-3/20 focus:border-accent-3 text-sm font-mono leading-relaxed resize-y outline-none transition-all placeholder:text-txt-muted"
            />
            <p className="text-xs text-txt-secondary">Defines the persona and constraints of the model.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-txt-primary">User Prompt / Template</label>
            <textarea
              value={localPrompt.userPrompt}
              onChange={(e) => handleChange('userPrompt', e.target.value)}
              placeholder="Explain {{topic}} in simple terms..."
              className="w-full h-48 p-4 bg-canvas-card text-txt-primary border border-color-border rounded-xl shadow-sm focus:ring-2 focus:ring-accent-3/20 focus:border-accent-3 text-sm font-mono leading-relaxed resize-y outline-none transition-all placeholder:text-txt-muted"
            />
          </div>

          <TagManager
            tags={localPrompt.tags}
            tagInput={tagInput}
            setTagInput={setTagInput}
            onAddTag={handleAddTag}
            onRemoveTag={removeTag}
          />
        </div>

        <VersionList
          versions={localPrompt.versions}
          onRestoreVersion={restoreVersion}
        />
      </div>
    </div>
  );
};
