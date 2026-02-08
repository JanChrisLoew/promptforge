/* eslint-disable max-lines-per-function */
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Prompt, PromptVersion, PromptStatus, Comment } from '../types';
import { generateId, sanitizeFilename, downloadJson } from '../utils';
import { ConfirmationType } from '../components/ConfirmationModal';
import { SettingsContext } from '../contexts/SettingsContextDefinition';

interface UsePromptEditorStateProps {
    prompt: Prompt;
    onUpdate: (updatedPrompt: Prompt) => void;
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

export const usePromptEditorState = ({
    prompt,
    onUpdate,
    onShowConfirm,
    onCloseConfirm,
    onDirtyChange
}: UsePromptEditorStateProps) => {
    const settingsContext = useContext(SettingsContext);

    // Safety check for SettingsContext
    if (!settingsContext) {
        console.warn('usePromptEditorState must be used within a SettingsProvider');
    }

    const settings = settingsContext?.settings || {
        // Fallback settings if context is missing (e.g. in isolated tests)
        userName: 'Guest',
        theme: 'system',
        namingSchema: { enabled: false, fields: [], folderNamingType: 'labelValue' },
        manualCategories: ['General']
    };

    const [localPrompt, setLocalPrompt] = useState<Prompt>(prompt);
    const [tagInput, setTagInput] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [copySystemSuccess, setCopySystemSuccess] = useState(false);
    const [copyUserSuccess, setCopyUserSuccess] = useState(false);
    const [commitNote, setCommitNote] = useState('');
    const [showCommitInput, setShowCommitInput] = useState(false);
    const [activeSideTab, setActiveSideTab] = useState<'versions' | 'comments'>('versions');
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

    // Derived state for Structured Mode
    const hasSchema = settings.namingSchema.fields.length > 0;
    const isEnabled = settings.namingSchema.enabled;
    const isStructuredMode = hasSchema && isEnabled;

    // Refs for data safety
    const localPromptRef = useRef<Prompt>(prompt);
    const isDirtyRef = useRef(false);

    useEffect(() => {
        localPromptRef.current = localPrompt;
        isDirtyRef.current = isDirty;
        onDirtyChange?.(isDirty);
    }, [localPrompt, isDirty, onDirtyChange]);

    // Safety Flush on Unmount - DISABLED per user request for explicit save
    // (Dead code removed)

    const handleChange = useCallback((field: keyof Prompt, value: Prompt[keyof Prompt]) => {
        setLocalPrompt(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    }, []);

    const handleBulkChange = useCallback((updates: Partial<Prompt>) => {
        setLocalPrompt(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
    }, []);

    const handleStatusChange = (status: PromptStatus) => {
        handleChange('status', status);
    };

    const handleAddComment = (comment: Comment) => {
        handleChange('comments', [...(localPrompt.comments || []), comment]);
    };

    const commitTag = useCallback(() => {
        const input = tagInput.trim();
        if (!input) {
            setTagInput('');
            return null;
        }

        const newTags = input
            .split(',')
            .map(t => t.trim())
            .filter(t => t !== '' && !localPrompt.tags.includes(t));

        if (newTags.length > 0) {
            setLocalPrompt(prev => ({ ...prev, tags: [...prev.tags, ...newTags] }));
            setIsDirty(true);
            setTagInput('');
            return newTags;
        }

        setTagInput('');
        return null;
    }, [tagInput, localPrompt.tags]);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitTag();
        }
    };

    const removeTag = (tagToRemove: string) => {
        handleChange('tags', localPrompt.tags.filter(t => t !== tagToRemove));
    };

    const copyToClipboard = () => {
        const content = `System: ${localPrompt.systemInstruction}\n\nUser: ${localPrompt.userPrompt}`;
        navigator.clipboard.writeText(content)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy to clipboard:', err);
                // Optionally set an error state here
            });
    };

    const copySystemToClipboard = () => {
        navigator.clipboard.writeText(localPrompt.systemInstruction).then(() => {
            setCopySystemSuccess(true);
            setTimeout(() => setCopySystemSuccess(false), 2000);
        });
    };

    const copyUserToClipboard = () => {
        navigator.clipboard.writeText(localPrompt.userPrompt).then(() => {
            setCopyUserSuccess(true);
            setTimeout(() => setCopyUserSuccess(false), 2000);
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
            note: commitNote || `Version ${localPrompt.versions.length + 1}`,
            config: localPrompt.config
        };

        const updated = { ...localPrompt, versions: [newVersion, ...localPrompt.versions], lastUpdated: new Date().toISOString() };
        setLocalPrompt(updated);
        onUpdate(updated);
        setCommitNote('');
        setShowCommitInput(false);
        setIsDirty(false);
    };

    const saveChanges = () => {
        const tag = tagInput.trim();
        let promptToSave = localPrompt;

        if (tag && !localPrompt.tags.includes(tag)) {
            promptToSave = { ...localPrompt, tags: [...localPrompt.tags, tag] };
            setTagInput('');
        }

        const updated = { ...promptToSave, lastUpdated: new Date().toISOString() };
        setLocalPrompt(updated);
        onUpdate(updated);
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
                    config: version.config || localPrompt.config,
                    lastUpdated: new Date().toISOString()
                };

                setLocalPrompt(updated);
                onUpdate(updated);
                setIsDirty(false);
                onCloseConfirm();
            }
        });
    };

    const toggleSidePanel = () => {
        setIsSidePanelOpen(prev => !prev);
    };

    return {
        localPrompt,
        setLocalPrompt,
        isDirty,
        tagInput,
        setTagInput,
        copySuccess,
        copySystemSuccess,
        copyUserSuccess,
        commitNote,
        setCommitNote,
        showCommitInput,
        setShowCommitInput,
        activeSideTab,
        setActiveSideTab,
        isSidePanelOpen,
        toggleSidePanel,
        isStructuredMode,
        handleChange,
        handleBulkChange,
        handleStatusChange,
        handleAddComment,
        handleAddTag,
        commitTag,
        removeTag,
        copyToClipboard,
        copySystemToClipboard,
        copyUserToClipboard,
        handleExportSingle,
        saveVersion,
        saveChanges,
        restoreVersion
    };
};
