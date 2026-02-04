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
}) => {
    const selectedPrompt = prompts.find(p => p.id === selectedId);

    return (
        <div className="flex flex-1 overflow-hidden">
            <PromptList
                prompts={prompts}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                onBulkDelete={onBulkDelete}
                onCreate={onCreate}
                onExport={onExport}
                onImport={onImport}
                onGoHome={onGoHome}
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
