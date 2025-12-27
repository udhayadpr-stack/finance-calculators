import React, { useState, useEffect } from 'react';
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
                <div className="flex justify-between items-center mb-1.5">
                    <label className={clsx("text-[10px] font-bold uppercase tracking-widest", isManual ? 'text-amber-700' : 'text-gray-500')}>
                        {label}
                    </label>
                    {showToggle && onToggleMode && (
                        <button
                            onClick={onToggleMode}
                            className={clsx("flex items-center gap-1 text-[10px] font-bold uppercase transition-colors", isManual ? 'text-amber-600 hover:text-amber-800' : 'text-gray-400 hover:text-gray-600')}
                            title={isManual ? "Switch to Auto-Calculation" : "Override Manually"}
                        >
                            {isManual ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {isManual ? "Manual" : "Auto"}
                        </button>
                    )}
                </div>
            )}
            <div className="relative">
                <span className={clsx("absolute left-3 top-1/2 -translate-y-1/2 font-medium", large ? 'text-2xl text-gray-400' : 'text-sm text-gray-400')}>₹</span>
                <input
                    type="text"
                    value={display}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isDisabled}
                    placeholder={placeholder || "0"}
                    className={clsx(
                        "w-full pl-8 pr-3 font-semibold bg-transparent border rounded-xl outline-none transition-all",
                        large ? 'py-2 text-3xl border-gray-200 focus:border-indigo-500 text-gray-900 placeholder-gray-300' : 'py-2.5 text-sm',
                        !large && isManual
                            ? 'bg-amber-50/50 border-amber-200 text-amber-900 focus:ring-2 focus:ring-amber-100 focus:border-amber-300'
                            : !large && 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed select-all'
                    )}
                />
            </div>
        </div>
    );
};
