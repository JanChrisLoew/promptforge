import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { SchemaBuilder } from './SchemaBuilder';
import { GlobalTagManager } from './GlobalTagManager';
import { Settings, Database, Tag } from 'lucide-react';
import { Prompt } from '../../types';

interface MasterDataPageProps {
    onClose: () => void;
    prompts: Prompt[];
    onUpdatePrompt: (id: string, updates: Partial<Prompt>) => void;
}

export const MasterDataPage: React.FC<MasterDataPageProps> = ({ onClose, prompts, onUpdatePrompt }) => {
    const { settings, updateNamingSchema, updateManualCategories } = useSettings();
    const [activeTab, setActiveTab] = React.useState<'naming' | 'categories' | 'tags'>('naming');
    const [newCategory, setNewCategory] = React.useState('');

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCategory.trim();
        if (trimmed && !settings.manualCategories.includes(trimmed)) {
            updateManualCategories([...settings.manualCategories, trimmed].sort());
            setNewCategory('');
        }
    };

    const handleDeleteCategory = (cat: string) => {
        updateManualCategories(settings.manualCategories.filter(c => c !== cat));
    };

    const isNamingEnabled = settings.namingSchema.enabled;

    return (
        <div className="flex flex-col h-full bg-canvas-base animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-default">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-surface rounded-lg">
                        <Database className="w-6 h-6 text-accent-1" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-txt-primary">Master Data</h1>
                        <p className="text-sm text-txt-secondary">Configure naming conventions and library standards.</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-txt-muted hover:text-txt-primary text-sm font-bold uppercase tracking-wide">
                    Close
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-border-default bg-canvas-subtle p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('naming')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'naming' ? 'bg-accent-surface text-accent-1' : 'text-txt-secondary hover:bg-canvas-base hover:text-txt-primary'
                            }`}
                    >
                        <Settings size={18} /> Naming Convention
                    </button>
                    {!isNamingEnabled && (
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-accent-surface text-accent-1' : 'text-txt-secondary hover:bg-canvas-base hover:text-txt-primary'
                                }`}
                        >
                            <Database size={18} /> Category Manager
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('tags')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tags' ? 'bg-accent-surface text-accent-1' : 'text-txt-secondary hover:bg-canvas-base hover:text-txt-primary'
                            }`}
                    >
                        <Tag size={18} /> Tag Manager
                    </button>
                </div>

                {/* Panel */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'naming' && (
                        <div className="max-w-4xl mx-auto">
                            <SchemaBuilder
                                schema={settings.namingSchema}
                                onUpdate={updateNamingSchema}
                            />
                        </div>
                    )}

                    {activeTab === 'categories' && !isNamingEnabled && (
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-txt-primary mb-2">Manual Categories</h2>
                                <p className="text-sm text-txt-muted">
                                    Define standard categories for your prompts. These will appear as suggestions when creating or editing prompts.
                                </p>
                            </div>

                            <div className="bg-canvas-card border border-border-default rounded-xl p-6 shadow-sm">
                                <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="New Category Name (e.g. 'Marketing')"
                                        className="flex-1 bg-canvas-base border border-border-default rounded-lg px-4 py-2 text-sm text-txt-primary focus:ring-2 focus:ring-accent-1/20 focus:border-accent-1 outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newCategory.trim()}
                                        className="bg-accent-1 hover:bg-accent-1/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add
                                    </button>
                                </form>

                                <div className="space-y-2">
                                    {settings.manualCategories.length === 0 ? (
                                        <div className="text-center py-8 text-txt-muted text-sm italic">
                                            No manual categories defined.
                                        </div>
                                    ) : (
                                        settings.manualCategories.map((cat) => (
                                            <div key={cat} className="flex items-center justify-between p-3 bg-canvas-base border border-border-default rounded-lg group hover:border-accent-1/50 transition-colors">
                                                <span className="font-medium text-txt-primary">{cat}</span>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    className="text-txt-muted hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Remove Category"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tags' && (
                        <div className="max-w-4xl mx-auto">
                            <GlobalTagManager prompts={prompts} onUpdatePrompt={onUpdatePrompt} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
