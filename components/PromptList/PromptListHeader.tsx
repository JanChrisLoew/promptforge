import React, { useState, useRef, useEffect } from 'react';
import { Home, MoreVertical, Upload, Download } from 'lucide-react';

interface PromptListHeaderProps {
    onGoHome: () => void;
    isHomeActive: boolean;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
}

export const PromptListHeader: React.FC<PromptListHeaderProps> = ({
    onGoHome,
    isHomeActive,
    onImport,
    onExport
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    onClick={onGoHome}
                    className={`p-2 rounded-lg transition-all ${isHomeActive ? 'bg-accent-3 text-white shadow-md' : 'text-txt-muted hover:bg-canvas-hover hover:text-txt-primary'}`}
                    title="Dashboard / Home"
                >
                    <Home size={20} />
                </button>
                <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
                    PromptForge
                </h1>
            </div>

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-2 rounded-lg transition-colors ${showMenu ? 'bg-accent-3/10 text-accent-3' : 'text-txt-muted hover:bg-canvas-hover hover:text-txt-primary'}`}
                    title="Library Options"
                >
                    <MoreVertical size={20} />
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-canvas-card rounded-xl shadow-xl border border-color-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="py-1">
                            <label className="flex items-center gap-3 px-4 py-3 text-sm text-txt-primary hover:bg-canvas-hover cursor-pointer transition-colors">
                                <Upload size={16} className="text-accent-3" />
                                <span>Import Library</span>
                                <input type="file" accept=".json" onChange={(e) => { onImport(e); setShowMenu(false); }} className="hidden" />
                            </label>
                            <button
                                onClick={() => { onExport(); setShowMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-txt-primary hover:bg-canvas-hover cursor-pointer transition-colors text-left"
                            >
                                <Download size={16} className="text-accent-3" />
                                <span>Export Library</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
