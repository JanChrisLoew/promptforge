import React from 'react';

interface TagManagerProps {
    tags: string[];
    tagInput: string;
    setTagInput: (value: string) => void;
    onAddTag: (e: React.KeyboardEvent) => void;
    onBlurTag: () => void;
    onRemoveTag: (tag: string) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({
    tags,
    tagInput,
    setTagInput,
    onAddTag,
    onBlurTag,
    onRemoveTag,
}) => {
    return (
        <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between flex-shrink-0">
                <label className="block text-sm font-bold text-txt-primary">Tags</label>
            </div>
            <div className="flex flex-wrap gap-2 p-2 bg-canvas-card border border-color-border rounded-xl min-h-[42px] focus-within:ring-2 focus-within:ring-accent-3/20 focus-within:border-accent-3 transition-all shadow-sm">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-accent-2/10 text-accent-2 px-2.5 py-1 rounded-md text-xs font-bold border border-accent-2/20">
                        {tag}
                        <button onClick={() => onRemoveTag(tag)} className="hover:text-red-600 ml-1 transition-colors leading-none">&times;</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={onAddTag}
                    onBlur={onBlurTag}
                    placeholder="Add tags (Enter or comma)..."
                    className="flex-1 min-w-[120px] text-sm focus:outline-none bg-transparent text-txt-primary placeholder-txt-muted"
                />
            </div>
        </div>
    );
};
