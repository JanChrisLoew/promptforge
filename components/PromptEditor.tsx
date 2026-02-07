/* eslint-disable complexity */
import React from 'react';
import { Prompt, PromptStatus, PromptVersion, Comment } from '../types';
import { EditorHeader } from './EditorHeader';
import { TagManager } from './TagManager';
import { VersionList } from './VersionList';
import { PromptComments } from './PromptComments';
import { StructuredNameEditor } from './StructuredNameEditor';
import { ConfirmationType } from './ConfirmationModal';
import { MessageSquare, History, Copy, Check, PanelRight, PanelRightClose, Maximize2 } from 'lucide-react';
import { usePromptEditorState } from '../hooks/usePromptEditorState';
import { FullscreenPromptModal } from './FullscreenPromptModal';

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

interface PromptFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onCopy: () => void;
  copySuccess: boolean;
  placeholder: string;
  onFullscreen?: () => void;
  className?: string;
}

const PromptField: React.FC<PromptFieldProps> = ({
  label,
  value,
  onChange,
  onCopy,
  copySuccess,
  placeholder,
  onFullscreen,
  className = ""
}) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <div className="flex items-center justify-between flex-shrink-0">
      <label className="block text-sm font-bold text-txt-primary">{label}</label>
      <div className="flex items-center gap-1">
        <button
          onClick={onFullscreen}
          className="p-1.5 hover:bg-accent-3/10 rounded-lg transition-colors text-txt-muted hover:text-accent-3"
          title="Fullscreen Mode"
        >
          <Maximize2 size={14} />
        </button>
        <button
          onClick={onCopy}
          className="p-1.5 hover:bg-accent-3/10 rounded-lg transition-colors text-txt-muted hover:text-accent-3"
          title={`Copy ${label}`}
        >
          {copySuccess ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full flex-1 p-4 bg-canvas-card text-txt-primary border border-color-border rounded-xl shadow-sm focus:ring-2 focus:ring-accent-3/20 focus:border-accent-3 text-sm font-mono leading-relaxed resize-y outline-none transition-all placeholder:text-txt-muted min-h-[120px]"
    />
  </div>
);

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

  const [fullscreenField, setFullscreenField] = React.useState<{
    id: 'system' | 'user';
    label: string;
  } | null>(null);

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

      <EditorOptionsBar
        status={state.localPrompt.status || 'draft'}
        onStatusChange={state.handleStatusChange}
        showSystemInstruction={!!state.localPrompt.config?.showSystemInstruction}
        onToggleSystemInstruction={() => state.handleChange('config', {
          ...state.localPrompt.config,
          showSystemInstruction: !state.localPrompt.config?.showSystemInstruction
        })}
        isSidePanelOpen={state.isSidePanelOpen}
        onToggleSidePanel={state.toggleSidePanel}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {state.isStructuredMode && (
            <StructuredNameEditor
              metadata={state.localPrompt.metadata || {}}
              currentTitle={state.localPrompt.title}
              onUpdate={(meta, title) => {
                state.handleBulkChange({
                  metadata: meta,
                  title: title
                });
              }}
            />
          )}

          {state.localPrompt.config?.showSystemInstruction && (
            <PromptField
              label="System-Prompt"
              value={state.localPrompt.systemInstruction}
              onChange={(val) => state.handleChange('systemInstruction', val)}
              onCopy={state.copySystemToClipboard}
              copySuccess={state.copySystemSuccess}
              placeholder="You are a helpful assistant..."
              className="h-80"
              onFullscreen={() => setFullscreenField({ id: 'system', label: 'System-Prompt' })}
            />
          )}

          <PromptField
            label="User-Prompt"
            value={state.localPrompt.userPrompt}
            onChange={(val) => state.handleChange('userPrompt', val)}
            onCopy={state.copyUserToClipboard}
            copySuccess={state.copyUserSuccess}
            placeholder="Explain {{topic}} in simple terms..."
            className="h-[500px]"
            onFullscreen={() => setFullscreenField({ id: 'user', label: 'User-Prompt' })}
          />

          <TagManager
            tags={state.localPrompt.tags}
            tagInput={state.tagInput}
            setTagInput={state.setTagInput}
            onAddTag={state.handleAddTag}
            onBlurTag={state.commitTag}
            onRemoveTag={state.removeTag}
          />
        </div>

        {state.isSidePanelOpen && (
          <EditorSidePanel
            activeTab={state.activeSideTab}
            setActiveTab={state.setActiveSideTab}
            versions={state.localPrompt.versions}
            comments={state.localPrompt.comments || []}
            onRestoreVersion={state.restoreVersion}
            onAddComment={state.handleAddComment}
          />
        )}
      </div>

      {fullscreenField && (
        <FullscreenPromptModal
          isOpen={!!fullscreenField}
          onClose={() => setFullscreenField(null)}
          title={fullscreenField.label}
          value={fullscreenField.id === 'system' ? state.localPrompt.systemInstruction : state.localPrompt.userPrompt}
          onChange={(val) => state.handleChange(fullscreenField.id === 'system' ? 'systemInstruction' : 'userPrompt', val)}
          onCopy={fullscreenField.id === 'system' ? state.copySystemToClipboard : state.copyUserToClipboard}
          copySuccess={fullscreenField.id === 'system' ? state.copySystemSuccess : state.copyUserSuccess}
        />
      )}
    </div>
  );
};

interface EditorOptionsBarProps {
  status: PromptStatus;
  onStatusChange: (status: PromptStatus) => void;
  showSystemInstruction: boolean;
  onToggleSystemInstruction: () => void;
  isSidePanelOpen: boolean;
  onToggleSidePanel: () => void;
}

const EditorOptionsBar: React.FC<EditorOptionsBarProps> = ({
  status,
  onStatusChange,
  showSystemInstruction,
  onToggleSystemInstruction,
  isSidePanelOpen,
  onToggleSidePanel
}) => (
  <div className="px-6 py-2 border-b border-border-default bg-canvas-subtle flex items-center gap-4 justify-between">
    <div className="flex items-center gap-4">
      <div className="h-4 w-px bg-border-default" />

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as PromptStatus)}
        className="text-xs font-bold uppercase bg-canvas-base border border-border-default rounded px-2 py-1 outline-none focus:border-accent-1"
      >
        <option value="draft">Draft</option>
        <option value="review">Review</option>
        <option value="approved">Approved</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 cursor-pointer group">
        <span className="text-[10px] font-bold text-txt-muted group-hover:text-txt-primary uppercase tracking-wider transition-colors">
          System-Prompt
        </span>
        <div
          onClick={onToggleSystemInstruction}
          className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ${showSystemInstruction ? 'bg-accent-3' : 'bg-border-default'}`}
        >
          <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-200 ${showSystemInstruction ? 'translate-x-3.5' : 'translate-x-0'}`} />
        </div>
      </label>

      <div className="h-4 w-px bg-border-default mx-2" />

      <button
        onClick={onToggleSidePanel}
        className={`p-1.5 rounded-md transition-all ${isSidePanelOpen ? 'text-accent-3 bg-accent-3/10' : 'text-txt-muted hover:text-txt-primary hover:bg-canvas-hover'}`}
        title={isSidePanelOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        {isSidePanelOpen ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
      </button>
    </div>
  </div>
);

interface EditorSidePanelProps {
  activeTab: 'versions' | 'comments';
  setActiveTab: (tab: 'versions' | 'comments') => void;
  versions: PromptVersion[];
  comments: Comment[];
  onRestoreVersion: (e: React.MouseEvent, v: PromptVersion) => void;
  onAddComment: (c: Comment) => void;
}

const EditorSidePanel: React.FC<EditorSidePanelProps> = ({
  activeTab,
  setActiveTab,
  versions,
  comments,
  onRestoreVersion,
  onAddComment
}) => (
  <div className="w-96 border-l border-color-border bg-canvas-subtle flex flex-col">
    <div className="flex border-b border-color-border">
      <button
        onClick={() => setActiveTab('versions')}
        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === 'versions' ? 'bg-canvas-base border-b-2 border-accent-1 text-accent-1' : 'text-txt-muted hover:text-txt-primary'}`}
      >
        <History size={14} /> Versions
      </button>
      <button
        onClick={() => setActiveTab('comments')}
        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === 'comments' ? 'bg-canvas-base border-b-2 border-accent-1 text-accent-1' : 'text-txt-muted hover:text-txt-primary'}`}
      >
        <MessageSquare size={14} /> Comments
      </button>
    </div>

    <div className="flex-1 overflow-hidden relative">
      {activeTab === 'versions' ? (
        <VersionList
          versions={versions}
          onRestoreVersion={onRestoreVersion}
        />
      ) : (
        <PromptComments
          comments={comments}
          onAddComment={onAddComment}
        />
      )}
    </div>
  </div>
);
