import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

export const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('promptforge_theme') as Theme;
        if (saved === 'dark' || saved === 'light') return saved;

        // Default to dark mode for PromptForge's aesthetic or check system
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
        localStorage.setItem('promptforge_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 bg-canvas-card border border-color-border rounded-lg shadow-sm text-txt-secondary hover:text-accent-3 hover:border-accent-3 transition-all flex items-center justify-center group"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
            <div className="transition-transform group-hover:scale-110 active:rotate-12">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
        </button>
    );
};
