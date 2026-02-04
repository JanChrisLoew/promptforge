import React from 'react';
import { AlertCircle, Trash2, RotateCcw, X } from 'lucide-react';

export type ConfirmationType = 'danger' | 'warning' | 'info';

interface ConfirmationModalProps {
    isOpen: boolean;
    type: ConfirmationType;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    type,
    title,
    message,
    confirmLabel,
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <Trash2 className="text-accent-1" size={24} />,
                    iconBg: 'bg-accent-1/10',
                    btnBg: 'bg-accent-1 hover:bg-[#b0301c]',
                    border: 'border-accent-1/20'
                };
            case 'warning':
                return {
                    icon: <RotateCcw className="text-accent-2" size={24} />,
                    iconBg: 'bg-accent-2/10',
                    btnBg: 'bg-accent-2 hover:bg-[#c97b1a]',
                    border: 'border-accent-2/20'
                };
            default:
                return {
                    icon: <AlertCircle className="text-accent-3" size={24} />,
                    iconBg: 'bg-accent-3/10',
                    btnBg: 'bg-accent-3 hover:bg-[#1a886f]',
                    border: 'border-accent-3/20'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-canvas-base/60 backdrop-blur-md"
                onClick={onCancel}
            />

            <div className={`relative w-full max-w-md bg-canvas-card border ${styles.border} rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
                <div className="p-8">
                    <div className="flex items-start gap-5">
                        <div className={`p-4 ${styles.iconBg} rounded-2xl flex-shrink-0`}>
                            {styles.icon}
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-txt-primary tracking-tight leading-none">{title}</h2>
                            <p className="text-txt-secondary leading-relaxed text-sm font-medium">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-canvas-base border border-color-border text-txt-primary font-bold rounded-xl hover:bg-canvas-hover transition-all text-sm"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-6 py-3 ${styles.btnBg} text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 p-2 text-txt-muted hover:text-txt-primary hover:bg-canvas-hover rounded-lg transition-all"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};
