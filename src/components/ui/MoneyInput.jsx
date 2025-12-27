import React, { useState, useEffect, useId } from 'react';
import { Lock, Unlock } from 'lucide-react';
import clsx from 'clsx';

export const MoneyInput = ({
    label,
    value,
    onChange,
    placeholder,
    isManual,
    onToggleMode,
    large,
    readOnlyMode,
    showToggle = true
}) => {
    const [display, setDisplay] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const id = useId();

    useEffect(() => {
        if (!isFocused) {
            // Allow decimals in display if present
            setDisplay(value !== undefined && value !== null ?
                new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value)
                : '');
        }
    }, [value, isFocused]);

    const handleChange = (e) => {
        const raw = e.target.value;
        setDisplay(raw); // Keep raw input while typing (don't zero out invalid states visibly)

        // Only pass valid numbers up
        const clean = raw.replace(/,/g, '');
        if (!isNaN(clean) && clean !== '') {
            onChange(parseFloat(clean));
        } else if (clean === '') {
            onChange(0);
        }
    };

    // Ensure disabled is strictly boolean to avoid React warnings
    const isDisabled = Boolean(readOnlyMode || (!isManual && !large && onToggleMode));

    return (
        <div className={clsx("relative transition-all duration-200 group", !isDisabled ? 'opacity-100' : 'opacity-90 hover:opacity-100')}>
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <label
                        htmlFor={id}
                        className={clsx("text-[11px] font-bold uppercase tracking-widest", isManual ? 'text-amber-700' : 'text-gray-500 dark:text-gray-400 group-focus-within:text-primary transition-colors')}
                    >
                        {label}
                    </label>
                    {showToggle && onToggleMode && (
                        <button
                            onClick={onToggleMode}
                            className={clsx("flex items-center gap-1 text-[10px] font-bold uppercase transition-colors px-2 py-1 rounded-md", isManual ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50' : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200')}
                            title={isManual ? "Switch to Auto-Calculation" : "Override Manually"}
                            aria-label={isManual ? "Switch to Auto-Calculation Mode" : "Ensure Manually"}
                            aria-pressed={isManual}
                        >
                            {isManual ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {isManual ? "Manual" : "Auto"}
                        </button>
                    )}
                </div>
            )}
            <div className="relative">
                <span className={clsx("absolute left-4 top-1/2 -translate-y-1/2 font-medium transition-colors pointer-events-none z-10", large ? 'text-2xl text-gray-400 group-focus-within:text-primary' : 'text-sm text-gray-400 group-focus-within:text-primary')}>₹</span>
                <input
                    id={id}
                    type="text"
                    value={display}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isDisabled}
                    placeholder={placeholder || "0"}
                    className={clsx(
                        "w-full pl-10 pr-4 font-semibold bg-white dark:bg-slate-800 border outline-none transition-all rounded-xl",
                        large
                            ? 'py-3 text-3xl text-gray-900 dark:text-gray-50 placeholder-gray-300 dark:placeholder-slate-600 shadow-sm'
                            : 'py-3 text-sm text-gray-900 dark:text-gray-50 placeholder-gray-300 dark:placeholder-slate-600 shadow-sm',
                        isFocused
                            ? 'border-primary ring-4 ring-primary/10 shadow-lg shadow-primary/5'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                        !large && isManual && 'bg-amber-50/30 border-amber-200 text-amber-900 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-amber-900/10 dark:border-amber-800 dark:text-amber-100',
                        !large && !isFocused && !isManual && isDisabled && 'bg-gray-50 text-gray-500 cursor-not-allowed border-dashed dark:bg-slate-900/50 dark:text-slate-500 dark:border-slate-700'
                    )}
                />
            </div>
        </div>
    );
};
