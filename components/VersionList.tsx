import React from 'react';
import { History, RotateCcw } from 'lucide-react';
import { PromptVersion } from '../types';
import { formatDate } from '../utils';

interface VersionListProps {
    versions: PromptVersion[];
    onRestoreVersion: (e: React.MouseEvent, version: PromptVersion) => void;
}

export const VersionList: React.FC<VersionListProps> = ({ versions, onRestoreVersion }) => {
    return (
        <div className="w-96 bg-canvas-base border-l border-slate-200 flex flex-col flex-shrink-0">
            <div className="h-16 flex items-center justify-center border-b border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-sm font-bold text-txt-primary uppercase tracking-wider">
                    <History size={16} className="text-accent-2" />
                    Version History
                </div>
            </div>

            <div className="flex-1 overflow-y-auto relative custom-scrollbar p-2 space-y-2">
                {versions?.length === 0 ? (
                    <div className="text-center py-10 text-txt-muted text-xs px-6">
                        <p>No versions saved yet.</p>
                        <p className="mt-2">Use <span className="font-mono bg-slate-200 px-1 rounded">Ctrl+S</span> to save a snapshot.</p>
                    </div>
                ) : (
                    versions.map((v) => (
                        <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-accent-2 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-xs font-bold text-txt-primary truncate max-w-[200px]">{v.note || 'Untitled Version'}</p>
                                    <p className="text-[10px] text-txt-muted">{formatDate(v.timestamp)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => onRestoreVersion(e, v)}
                                    className="text-xs bg-slate-50 hover:bg-accent-2 hover:text-white text-txt-secondary p-1.5 rounded flex items-center gap-1 transition-colors relative z-10 cursor-pointer"
                                    title="Restore this version"
                                >
                                    <RotateCcw size={12} />
                                </button>
                            </div>
                            <div className="text-[10px] text-txt-secondary font-mono bg-canvas-base p-2 rounded truncate border border-slate-100">
                                {v.userPrompt.substring(0, 60)}...
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
