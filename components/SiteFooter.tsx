import React from 'react';
import { InfoType } from './InfoOverlay';

interface SiteFooterProps {
    onOpenInfo: (type: InfoType) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onOpenInfo }) => {
    return (
        <footer className="h-10 bg-canvas-card border-t border-color-border px-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-txt-muted z-50 flex-shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-6">
                <span className="text-txt-primary">Prompt<span className="text-accent-3">Forge</span></span>
                <span className="opacity-40 font-medium">© 2026</span>
            </div>

            <div className="flex items-center gap-8">
                <button
                    onClick={() => onOpenInfo('about')}
                    className="hover:text-accent-3 transition-colors py-1"
                >
                    About Us
                </button>
                <button
                    onClick={() => onOpenInfo('impressum')}
                    className="hover:text-accent-3 transition-colors py-1"
                >
                    Impressum
                </button>
                <button
                    onClick={() => onOpenInfo('security')}
                    className="hover:text-accent-3 transition-colors py-1"
                >
                    Security
                </button>
            </div>

            <div className="hidden md:flex items-center gap-2 opacity-40">
                <div className="w-1 h-1 rounded-full bg-accent-2" />
                <span className="font-medium tracking-normal normal-case">Local-First Workspace</span>
            </div>
        </footer>
    );
};
