import React, { useState, useRef, useEffect } from 'react';
import { Folder, Check, ChevronsUpDown } from 'lucide-react';

interface CategorySelectProps {
    value: string;
    onChange: (value: string) => void;
    categories: string[];
    placeholder?: string;
    disabled?: boolean;
}

const CategoryDropdown: React.FC<{
    categories: string[];
    search: string;
    value: string;
    onSelect: (cat: string) => void;
}> = ({ categories, search, value, onSelect }) => {
    return (
        <div className="absolute top-full left-4 mt-1 w-60 bg-canvas-overlay border border-border-default rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-64">
            <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
                {categories.length === 0 ? (
                    <div className="px-3 py-8 text-center text-txt-muted text-xs">
                        {search ? (
                            <div className="flex flex-col items-center gap-2">
                                <span>Create new category:</span>
                                <span className="font-bold text-accent-1">"{search}"</span>
                            </div>
                        ) : (
                            "No categories found"
                        )}
                    </div>
                ) : (
                    categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => onSelect(cat)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between group transition-colors
                                ${value === cat ? 'bg-accent-surface text-accent-1 font-medium' : 'text-txt-primary hover:bg-canvas-subtle hover:text-txt-primary'}
                            `}
                        >
                            <span>{cat}</span>
                            {value === cat && <Check size={14} />}
                        </button>
                    ))
                )}

                {/* Always show create option if search is not empty and not in list */}
                {search && !categories.some(c => c.toLowerCase() === search.toLowerCase()) && categories.length > 0 && (
                    <div className="border-t border-border-default mt-1 pt-1">
                        <div className="px-3 py-2 text-xs text-txt-muted italic">
                            Press Enter or click outside to create "{search}"
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const CategorySelect: React.FC<CategorySelectProps> = ({
    value,
    onChange,
    categories,
    placeholder = "Select category...",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync search with value initially and when value changes externally
    useEffect(() => {
        setSearch(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = categories.filter(c =>
        c.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (cat: string) => {
        onChange(cat);
        setSearch(cat);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        onChange(val); // Live update for "creatable" behavior
        if (!isOpen) setIsOpen(true);
    };

    return (
        <div className="relative group" ref={containerRef}>
            <div className="flex items-center gap-2 text-txt-muted border-l border-color-border pl-4">
                <Folder size={16} className={isOpen ? "text-accent-1" : ""} />
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={handleInputChange}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="text-sm bg-transparent border border-transparent 
                                 focus:bg-canvas-card focus:border-accent-3 focus:ring-2 focus:ring-accent-3/20 
                                 text-txt-primary placeholder-txt-muted px-3 py-1.5 rounded-md 
                                 transition-all w-52 outline-none font-medium pr-8"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-txt-muted">
                        <ChevronsUpDown size={12} />
                    </div>
                </div>
            </div>

            {isOpen && !disabled && (
                <CategoryDropdown
                    categories={filtered}
                    search={search}
                    value={value}
                    onSelect={handleSelect}
                />
            )}
        </div>
    );
};
