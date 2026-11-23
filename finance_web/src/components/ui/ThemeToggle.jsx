import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import clsx from 'clsx';

export const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark' || saved === 'light') return saved;
        } catch { /* Storage may be disabled by the browser. */ }
        if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try { localStorage.setItem('theme', theme); } catch { /* Theme still works without storage. */ }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <button
            onClick={toggleTheme}
            className={clsx(
                "p-2 rounded-xl transition-all duration-300 relative overflow-hidden group border",
                theme === 'dark'
                    ? "bg-slate-800 text-indigo-400 border-slate-700 hover:bg-slate-700"
                    : "bg-white text-amber-500 border-gray-200 hover:bg-gray-50"
            )}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
            aria-pressed={theme === 'dark'}
        >
            <div className="relative z-10">
                {theme === 'dark' ? (
                    <Moon className="w-5 h-5 transition-transform group-hover:rotate-12" />
                ) : (
                    <Sun className="w-5 h-5 transition-transform group-hover:rotate-90" />
                )}
            </div>
        </button>
    );
};
