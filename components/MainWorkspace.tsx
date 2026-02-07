import React from 'react';
import { PromptList } from './PromptList';
import { Dashboard } from './Dashboard';
import { PromptEditor } from './PromptEditor';
import { Prompt, PromptStats } from '../types';
import { ConfirmationType } from './ConfirmationModal';

interface MainWorkspaceProps {
    prompts: Prompt[];
    selectedId: string | null;
    showDashboard: boolean;
    stats: PromptStats;
    uniqueCategories: string[];
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onBulkDelete: (ids: string[]) => void;
    onCreate: () => void;
    onExport: () => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGoHome: () => void;
    onUpdatePrompt: (updated: Prompt) => void;
    checkTitleUnique: (title: string, id: string) => boolean;
    onShowConfirm: (config: {
        type: ConfirmationType;
        title: string;
        message: string;
        confirmLabel: string;
        onConfirm: () => void;
    }) => void;
    onCloseConfirm: () => void;
    onOpenSettings: () => void;
}

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
    prompts,
    selectedId,
    showDashboard,
    stats,
    uniqueCategories,
    onSelect,
    onDelete,
    onBulkDelete,
    onCreate,
    onExport,
    onImport,
    onGoHome,
    onUpdatePrompt,
    checkTitleUnique,
    onShowConfirm,
    onCloseConfirm,
    onOpenSettings,
}) => {
    const selectedPrompt = prompts.find(p => p.id === selectedId);
    const [isEditorDirty, setIsEditorDirty] = React.useState(false);

    const handleNavigation = (action: () => void) => {
        if (isEditorDirty) {
            onShowConfirm({
                type: 'warning',
                title: 'Unsaved Changes',
                message: 'You have unsaved changes. If you leave now, your changes will be lost.',
                confirmLabel: 'Discard Changes',
                onConfirm: () => {
                    setIsEditorDirty(false);
                    onCloseConfirm();
                    // Small timeout to allow state to clear before action
                    setTimeout(action, 0);
                }
            });
        } else {
            action();
        }
    };

    return (
        <div className="flex flex-1 overflow-hidden">
            <PromptList
                prompts={prompts}
                selectedId={selectedId}
                onSelect={(id) => handleNavigation(() => onSelect(id))}
                onDelete={onDelete}
                onBulkDelete={onBulkDelete}
                onCreate={() => handleNavigation(onCreate)}
                onExport={onExport}
                onImport={onImport}
                onGoHome={() => handleNavigation(onGoHome)}
                onOpenSettings={() => handleNavigation(onOpenSettings)}
                onUpdatePrompt={onUpdatePrompt}
                isHomeActive={showDashboard}
            />

            {showDashboard ? (
                <Dashboard
                    prompts={prompts}
                    stats={stats}
                    onCreatePrompt={onCreate}
                    onImportLibrary={onImport}
                    onSelectPrompt={onSelect}
                />
            ) : selectedPrompt ? (
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <PromptEditor
                        key={selectedPrompt.id}
                        prompt={selectedPrompt}
                        onUpdate={onUpdatePrompt}
                        availableCategories={uniqueCategories}
                        isTitleUnique={(title) => checkTitleUnique(title, selectedPrompt.id)}
                        onShowConfirm={onShowConfirm}
                        onCloseConfirm={onCloseConfirm}
                        onDirtyChange={setIsEditorDirty}
                    />
                </div>
            ) : (
                <Dashboard
                    prompts={prompts}
                    stats={stats}
                    onCreatePrompt={onCreate}
                    onImportLibrary={onImport}
                    onSelectPrompt={onSelect}
                />
            )}
        </div>
    );
};
