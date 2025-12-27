import React from 'react';
import clsx from 'clsx';
import { toINR } from '../../utils/formatters';

export const ResultCard = ({
    label,
    value,
    subtext,
    type = 'primary', // primary (gradient), secondary (white/dark), highlight
    delay = 0
}) => {
    return (
        <div
            className={clsx(
                "relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02]",
                "animate-in fade-in slide-in-from-bottom-4",
                type === 'primary'
                    ? "bg-gradient-to-br from-primary to-violet-600 text-white shadow-xl shadow-primary/20"
                    : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm",
                type === 'highlight' && "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800"
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Pattern for Primary */}
            {type === 'primary' && (
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" />
                        <path d="M50 10 V90 M10 50 H90" stroke="currentColor" strokeWidth="8" />
                    </svg>
                </div>
            )}

            <div className="relative z-10">
                <p className={clsx(
                    "text-xs font-bold uppercase tracking-wider mb-1 opacity-80",
                    type === 'primary' ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"
                )}>
                    {label}
                </p>
                <h3 className={clsx(
                    "font-display font-bold tracking-tight",
                    type === 'primary' ? "text-3xl text-white" : "text-2xl text-gray-900 dark:text-gray-50",
                    type === 'highlight' && "text-amber-700 dark:text-amber-400"
                )}>
                    {typeof value === 'number' ? toINR(value) : value}
                </h3>
                {subtext && (
                    <p className={clsx(
                        "text-xs mt-2 font-medium",
                        type === 'primary' ? "text-indigo-100/80" : "text-gray-400 dark:text-gray-500"
                    )}>
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    );
};
