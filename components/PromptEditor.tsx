import React from 'react';
import { Prompt, PromptStatus } from '../types';
import { EditorHeader } from './EditorHeader';
import { TagManager } from './TagManager';
import { VersionList } from './VersionList';
import { PromptComments } from './PromptComments';
import { StructuredNameEditor } from './StructuredNameEditor';
import { ConfirmationType } from './ConfirmationModal';
import { MessageSquare, History } from 'lucide-react';
import { usePromptEditorState } from '../hooks/usePromptEditorState';

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
  onDirtyChange?: (isDirty: boolean) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onUpdate,
  availableCategories,
  isTitleUnique,
  onShowConfirm,
  onCloseConfirm,
  onDirtyChange
}) => {
  const state = usePromptEditorState({
    prompt,
    onUpdate,
    onShowConfirm,
    onCloseConfirm,
    onDirtyChange
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-canvas-base text-txt-primary">
      <EditorHeader
        title={state.localPrompt.title}
        category={state.localPrompt.category}
        isTitleValid={isTitleUnique(state.localPrompt.title)}
        onTitleChange={(val) => state.handleChange('title', val)}
        onCategoryChange={(val) => state.handleChange('category', val)}
        availableCategories={availableCategories}
        isDirty={state.isDirty}
        copySuccess={state.copySuccess}
        onCopyContent={state.copyToClipboard}
        onExport={state.handleExportSingle}
        showCommitInput={state.showCommitInput}
        setShowCommitInput={state.setShowCommitInput}
        commitNote={state.commitNote}
        setCommitNote={state.setCommitNote}
        onSaveVersion={state.saveVersion}
        isReadOnly={state.isStructuredMode}
        isNamingEnabled={state.isStructuredMode}
        onSave={state.saveChanges}
      />

      {/* Toolbar / Options Bar */}
      <div className="px-6 py-2 border-b border-border-default bg-canvas-subtle flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          {state.isStructuredMode && (
            <div className="flex items-center gap-2 px-2 py-1 bg-accent-1/10 rounded border border-accent-1/20">
              <span className="text-[10px] font-bold text-accent-1 uppercase tracking-wider">
                Structured Naming Active
              </span>
            </div>
          )}

          <div className="h-4 w-px bg-border-default" />

          <select
            value={state.localPrompt.status || 'draft'}
            onChange={(e) => state.handleStatusChange(e.target.value as PromptStatus)}
            className="text-xs font-bold uppercase bg-canvas-base border border-border-default rounded px-2 py-1 outline-none focus:border-accent-1"
          >
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {state.isStructuredMode && (
            <StructuredNameEditor
              metadata={state.localPrompt.metadata || {}}
              onUpdate={(meta, title) => {
                state.handleBulkChange({
                  metadata: meta,
                  title: title
                });
              }}
            />
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-txt-primary">System Instructions</label>
            <textarea
              value={state.localPrompt.systemInstruction}
              onChange={(e) => state.handleChange('systemInstruction', e.target.value)}
              placeholder="You are a helpful assistant..."
              className="w-full h-32 p-4 bg-canvas-card text-txt-primary border border-color-border rounded-xl shadow-sm focus:ring-2 focus:ring-accent-3/20 focus:border-accent-3 text-sm font-mono leading-relaxed resize-y outline-none transition-all placeholder:text-txt-muted"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-txt-primary">User Prompt / Template</label>
            <textarea
              value={state.localPrompt.userPrompt}
              onChange={(e) => state.handleChange('userPrompt', e.target.value)}
              placeholder="Explain {{topic}} in simple terms..."
              className="w-full h-48 p-4 bg-canvas-card text-txt-primary border border-color-border rounded-xl shadow-sm focus:ring-2 focus:ring-accent-3/20 focus:border-accent-3 text-sm font-mono leading-relaxed resize-y outline-none transition-all placeholder:text-txt-muted"
            />
          </div>

          <TagManager
            tags={state.localPrompt.tags}
            tagInput={state.tagInput}
            setTagInput={state.setTagInput}
            onAddTag={state.handleAddTag}
            onRemoveTag={state.removeTag}
          />
        </div>

        {/* Right Side Panel (Tabs) */}
        <div className="w-96 border-l border-color-border bg-canvas-subtle flex flex-col">
          <div className="flex border-b border-color-border">
            <button
              onClick={() => state.setActiveSideTab('versions')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${state.activeSideTab === 'versions' ? 'bg-canvas-base border-b-2 border-accent-1 text-accent-1' : 'text-txt-muted hover:text-txt-primary'}`}
            >
              <History size={14} /> Versions
            </button>
            <button
              onClick={() => state.setActiveSideTab('comments')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${state.activeSideTab === 'comments' ? 'bg-canvas-base border-b-2 border-accent-1 text-accent-1' : 'text-txt-muted hover:text-txt-primary'}`}
            >
              <MessageSquare size={14} /> Comments
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {state.activeSideTab === 'versions' ? (
              <VersionList
                versions={state.localPrompt.versions}
                onRestoreVersion={state.restoreVersion}
              />
            ) : (
              <PromptComments
                comments={state.localPrompt.comments || []}
                onAddComment={state.handleAddComment}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
