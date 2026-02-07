import React, { useState } from 'react';
import { Comment } from '../types';
import { Send } from 'lucide-react';
import { generateId } from '../utils';
import { useSettings } from '../hooks/useSettings';

interface PromptCommentsProps {
    comments: Comment[];
    onAddComment: (comment: Comment) => void;
}

export const PromptComments: React.FC<PromptCommentsProps> = ({ comments = [], onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const { settings } = useSettings();

    const handleSend = () => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: generateId(),
            text: newComment.trim(),
            author: settings.userName || 'User',
            timestamp: new Date().toISOString()
        };

        onAddComment(comment);
        setNewComment('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-canvas-base overflow-hidden">
            {/* Header removed as it is redundant with tabs */}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {comments.length === 0 ? (
                    <div className="text-center text-xs text-txt-muted py-8">
                        No comments yet.<br />Start the discussion!
                    </div>
                ) : (
                    comments.map(c => (
                        <div key={c.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="w-8 h-8 rounded-full bg-accent-surface flex items-center justify-center flex-shrink-0 text-accent-1 font-bold text-xs">
                                {c.author.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-txt-primary">{c.author}</span>
                                    <span className="text-[10px] text-txt-muted">
                                        {new Date(c.timestamp).toLocaleString(undefined, {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="text-sm text-txt-secondary bg-canvas-base p-2 rounded-lg border border-border-default">
                                    {c.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 bg-canvas-base border-t border-border-default">
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a comment..."
                        className="flex-1 bg-canvas-subtle border border-border-default rounded-md px-3 py-2 text-sm focus:border-accent-1 outline-none pr-10"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-accent-1 hover:text-accent-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
