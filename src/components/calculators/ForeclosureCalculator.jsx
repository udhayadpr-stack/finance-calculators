import React, { useState, useMemo } from 'react';
import {
    XOctagon,
    CheckCircle,
    AlertOctagon,
    Minus,
    X
} from 'lucide-react';
import { MoneyInput } from '../ui/MoneyInput';
import { toINR, parseMoney } from '../../utils/formatters';

import { calculateForeclosure } from '../../utils/calculators/foreclosure';

export default function ForeclosureCalculator() {
    const [outstandingPrincipal, setOutstandingPrincipal] = useState(2000000);
    const [interestRate, setInterestRate] = useState(9);
    const [remainingTenure, setRemainingTenure] = useState(60); // months
    const [foreclosureChargesPercent, setForeclosureChargesPercent] = useState(0);

    const calc = useMemo(() => {
        return calculateForeclosure({
            outstandingPrincipal: parseMoney(outstandingPrincipal),
            interestRate,
            remainingTenure,
            foreclosureChargesPercent
        });
    }, [outstandingPrincipal, interestRate, remainingTenure, foreclosureChargesPercent]);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* INPUTS */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-white/40 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-xl space-y-8 relative overflow-hidden transition-colors">
                    {/* Decorative Top Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-violet-400"></div>

                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl text-primary ring-1 ring-primary/20 dark:ring-primary/30">
                            <XOctagon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Loan Foreclosure</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Calculate your savings on pre-closing</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <MoneyInput
                            label="Outstanding Principal"
                            value={outstandingPrincipal}
                            onChange={setOutstandingPrincipal}
                            large
                        />

                        <div className="grid grid-cols-2 gap-5">
                            <MoneyInput
                                label="Interest Rate (%)"
                                value={interestRate}
                                onChange={setInterestRate}
                                isManual
                                showToggle={false}
                            />
                            <div className="space-y-2 group">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest group-focus-within:text-primary transition-colors">Remaining Tenure</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={remainingTenure === 0 ? '' : remainingTenure}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setRemainingTenure(val === '' ? 0 : Number(val));
                                        }}
                                        className="w-full pl-4 pr-16 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl font-bold text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 shadow-sm transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded">Months</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex justify-between mb-3 px-1">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Foreclosure Charges</label>
                                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-lg ring-1 ring-primary/20 dark:ring-primary/30">{foreclosureChargesPercent}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="10" step="0.5"
                                value={foreclosureChargesPercent}
                                onChange={(e) => setForeclosureChargesPercent(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                            />
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2.5 flex items-center gap-1.5">
                                <AlertOctagon className="w-3 h-3" />
                                <span>Typical bank penalty is 2-4% on principal</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-7 space-y-6">

                {/* VERDICT CARD */}
                <div className={`rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group transition-all duration-500 transform hover:scale-[1.01] ${calc.netSavings > 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20 dark:shadow-emerald-900/20' : 'bg-gradient-to-br from-red-500 to-rose-700 shadow-red-500/20 dark:shadow-red-900/20'}`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4 max-w-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl backdrop-blur-md bg-white/20 shadow-inner ring-1 ring-white/30`}>
                                    {calc.netSavings > 0
                                        ? <CheckCircle className="w-6 h-6 text-white" />
                                        : <AlertOctagon className="w-6 h-6 text-white" />
                                    }
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest text-white/80">Verdict</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight font-display">
                                {calc.netSavings > 0
                                    ? <span>You Save <br /><span className="text-emerald-50 bg-emerald-900/10 px-2 rounded-lg">{toINR(Math.round(calc.netSavings))}</span></span>
                                    : <span>You Lose <br /><span className="text-red-50 bg-red-900/10 px-2 rounded-lg">{toINR(Math.round(Math.abs(calc.netSavings)))}</span></span>}
                            </h2>

                            <p className="text-white/90 font-medium leading-relaxed text-sm md:text-base border-l-2 border-white/30 pl-4 py-1">
                                {calc.netSavings > 0
                                    ? "Foreclosing now is financially beneficial despite the penalty charges."
                                    : "Foreclosing now is more expensive than continuing the loan."}
                            </p>
                        </div>

                        {/* Visual Circle for Desktop */}
                        <div className="hidden md:flex flex-col items-center justify-center relative w-32 h-32 shrink-0">
                            <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute inset-2 border-4 border-t-white border-r-white/50 border-white/10 rounded-full rotate-45"></div>
                            <span className="text-2xl font-bold">{calc.netSavings > 0 ? "YES" : "NO"}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-70">Close It?</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-white/60 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50 overflow-hidden backdrop-blur-xl transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-slate-700/50">
                        <div className="p-8 hover:bg-gray-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            <div className="flex items-center gap-2 mb-6">
                                <Minus className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">If Continued</div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Remaining Interest</span>
                                    <span className="block text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tracking-tight">{toINR(Math.round(calc.interestIfContinued))}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100/80 dark:border-slate-700/50">
                                    <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Total Future Output</span>
                                    <span className="block text-xl font-bold text-gray-900 dark:text-white">{toINR(Math.round(calc.totalIfContinued))}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 hover:bg-gray-50/50 dark:hover:bg-slate-900/50 transition-colors relative">
                            {/* subtle bg indicator */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 dark:from-primary/10 to-transparent rounded-bl-3xl"></div>

                            <div className="flex items-center gap-2 mb-6">
                                <X className="w-4 h-4 text-primary" />
                                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">If Foreclosed</div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Penalty (+18% GST)</span>
                                    <span className="block text-2xl font-bold text-rose-500 dark:text-rose-400 font-mono tracking-tight">{toINR(Math.round(calc.penalty))}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100/80 dark:border-slate-700/50">
                                    <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">One-time Settlement</span>
                                    <span className="block text-xl font-bold text-gray-900 dark:text-white">{toINR(Math.round(calc.foreclosureCost))}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Math Summary */}
                    <div className="bg-slate-50 dark:bg-slate-900/80 p-4 text-[10px] md:text-xs font-mono text-center text-slate-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-700 flex flex-wrap justify-center gap-2 transition-colors">
                        <span>{toINR(Math.round(calc.totalIfContinued))} (Future)</span>
                        <span>-</span>
                        <span>{toINR(Math.round(calc.foreclosureCost))} (Now)</span>
                        <span>=</span>
                        <span className={calc.netSavings > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>{toINR(Math.round(calc.netSavings))}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
