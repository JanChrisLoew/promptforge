import React, { useEffect, useRef } from 'react';
import { X, Maximize2, Copy, Check } from 'lucide-react';

interface FullscreenPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    value: string;
    onChange: (val: string) => void;
    onCopy: () => void;
    copySuccess: boolean;
    placeholder?: string;
}

export const FullscreenPromptModal: React.FC<FullscreenPromptModalProps> = ({
    isOpen,
    onClose,
    title,
    value,
    onChange,
    onCopy,
    copySuccess,
    placeholder = "Type your prompt here..."
}) => {
    const textareaRef = useRef<React.ElementRef<'textarea'>>(null);
    const lineNumbersRef = useRef<React.ElementRef<'div'>>(null);

    // Sync scroll
    const handleScroll = () => {
        if (textareaRef.current && lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    // Handle Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const lineCount = value.split('\n').length || 1;
    const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-canvas-base/80 backdrop-blur-md cursor-pointer"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full h-full bg-canvas-card border border-border-default rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-canvas-subtle flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-3/10 rounded-lg text-accent-3">
                            <Maximize2 size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-txt-primary tracking-tight leading-none">{title}</h2>
                            <p className="text-[10px] text-txt-muted uppercase font-bold tracking-widest mt-1">Fullscreen Editor</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onCopy}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${copySuccess
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-canvas-base border border-border-default text-txt-primary hover:bg-canvas-hover'
                                }`}
                        >
                            {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                            {copySuccess ? 'Copied!' : 'Copy'}
                        </button>

                        <div className="w-px h-6 bg-border-default mx-2" />

                        <button
                            onClick={onClose}
                            className="p-2 text-txt-muted hover:text-txt-primary hover:bg-canvas-hover rounded-xl transition-all"
                            title="Close (Esc)"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex overflow-hidden bg-canvas-base relative">
                    {/* Line Numbers Sidebar (IDE Style) */}
                    <div
                        ref={lineNumbersRef}
                        className="w-16 bg-canvas-subtle/50 border-r border-border-default pt-10 flex flex-col items-end px-4 overflow-hidden select-none"
                    >
                        {lines.map(num => (
                            <div
                                key={num}
                                className="text-[12px] font-mono font-bold leading-[32px] h-[32px] transition-colors text-accent-3"
                            >
                                {num}
                            </div>
                        ))}
                    </div>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        autoFocus
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onScroll={handleScroll}
                        placeholder={placeholder}
                        className="flex-1 p-10 bg-transparent text-txt-primary border-none focus:ring-0 text-lg font-mono leading-[32px] resize-none outline-none transition-all placeholder:text-txt-muted custom-scrollbar selection:bg-accent-3/20"
                    />
                </div>

                {/* Footer / Status */}
                <div className="px-8 py-3 bg-canvas-subtle border-t border-border-default flex justify-between items-center flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-txt-muted uppercase tracking-wider italic">
                            Real-time synchronization active
                        </span>
                        <div className="h-2 w-2 rounded-full bg-accent-3 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold text-txt-muted uppercase tracking-wider bg-canvas-base px-2 py-0.5 rounded border border-border-default">
                            {value.length} Chars
                        </span>
                        <span className="text-[10px] font-bold text-accent-3 uppercase tracking-wider bg-accent-3/10 px-2 py-0.5 rounded border border-accent-3/20">
                            {lineCount} Lines
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
