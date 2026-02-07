import React, { useCallback, useRef } from 'react';

type ImportLibraryFn = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (stats: { new: number, updated: number, skipped: number, errors: number }) => void,
    onError: (message: string) => void
) => void;

type ShowConfirmFn = (config: {
    type: 'info' | 'danger';
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
}) => void;

export const useImportHandler = (
    importLibrary: ImportLibraryFn,
    showConfirm: ShowConfirmFn,
    closeConfirm: () => void
) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        importLibrary(
            e,
            (stats) => {
                showConfirm({
                    type: 'info',
                    title: 'Import Complete',
                    message: `Successfully processed your library:\n• ${stats.new} New Prompts\n• ${stats.updated} Updated\n• ${stats.skipped} Already up-to-date\n${stats.errors > 0 ? `• ${stats.errors} Invalid items skipped` : ''}`,
                    confirmLabel: 'Great',
                    onConfirm: closeConfirm
                });
            },
            (error) => {
                showConfirm({
                    type: 'danger',
                    title: 'Import Failed',
                    message: error,
                    confirmLabel: 'Try Again',
                    onConfirm: closeConfirm
                });
            }
        );
    }, [importLibrary, showConfirm, closeConfirm]);

    return {
        fileInputRef,
        handleImportClick,
        handleFileChange
    };
};
