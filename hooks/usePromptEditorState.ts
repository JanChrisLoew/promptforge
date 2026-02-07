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
    const { settings } = useContext(SettingsContext)!;
    const [localPrompt, setLocalPrompt] = useState<Prompt>(prompt);
    const [tagInput, setTagInput] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [commitNote, setCommitNote] = useState('');
    const [showCommitInput, setShowCommitInput] = useState(false);
    const [activeSideTab, setActiveSideTab] = useState<'versions' | 'comments'>('versions');

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

    // Debounced Auto-save - DISABLED for manual save workflow
    /*
    const debouncedPrompt = useDebounce(localPrompt, 300);

    useEffect(() => {
        if (isDirty && debouncedPrompt.id === localPrompt.id) {
            onUpdate({ ...debouncedPrompt, lastUpdated: new Date().toISOString() });
            const timer = setTimeout(() => setIsDirty(false), 0);
            return () => clearTimeout(timer);
        }
    }, [debouncedPrompt, onUpdate, isDirty, localPrompt.id]);
    */

    // Safety Flush on Unmount - DISABLED per user request for explicit save
    /*
    useEffect(() => {
        return () => {
            if (isDirtyRef.current) {
                onUpdate({ ...localPromptRef.current, lastUpdated: new Date().toISOString() });
            }
        };
    }, [onUpdate]);
    */

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

    const saveChanges = () => {
        const updated = { ...localPrompt, lastUpdated: new Date().toISOString() };
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
                    lastUpdated: new Date().toISOString()
                };

                setLocalPrompt(updated);
                onUpdate(updated);
                setIsDirty(false);
                onCloseConfirm();
            }
        });
    };

    return {
        localPrompt,
        setLocalPrompt,
        isDirty,
        tagInput,
        setTagInput,
        copySuccess,
        commitNote,
        setCommitNote,
        showCommitInput,
        setShowCommitInput,
        activeSideTab,
        setActiveSideTab,
        isStructuredMode,
        handleChange,
        handleBulkChange,
        handleStatusChange,
        handleAddComment,
        handleAddTag,
        removeTag,
        copyToClipboard,
        handleExportSingle,
        saveVersion,
        saveChanges,
        restoreVersion
    };
};
