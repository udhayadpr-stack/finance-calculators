import { useState, useMemo } from 'react';
import { Award, Info, Briefcase } from 'lucide-react';
import { MoneyInput } from '../ui/MoneyInput';
import { ResultCard } from '../ui/ResultCard'; // New Import
import { toINR, parseMoney } from '../../utils/formatters';
import clsx from 'clsx';

import { calculateGratuity } from '../../utils/calculators/gratuity';

export default function GratuityCalculator() {
    const [basicPay, setBasicPay] = useState(40000); // Basic + DA
    const [totalCTC, setTotalCTC] = useState(100000); // Monthly CTC
    const [years, setYears] = useState(5);
    const [isGovt, setIsGovt] = useState(false); // Toggle for Govt/Private
    const [isFixedTerm, setIsFixedTerm] = useState(false);

    const calc = useMemo(() => {
        return calculateGratuity({
            basicPay: parseMoney(basicPay),
            totalCTC: parseMoney(totalCTC),
            years,
            isGovt,
            isFixedTerm
        });
    }, [basicPay, totalCTC, years, isGovt, isFixedTerm]);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* INPUTS */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-white/40 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-xl space-y-8 relative overflow-hidden transition-colors">
                    {/* Decorative Top Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-primary"></div>

                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl text-primary ring-1 ring-primary/20 dark:ring-primary/30">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Gratuity Calculator</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Estimate your end-of-service benefits</p>
                        </div>
                    </div>

                    {/* Employee Type Toggle */}
                    <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700 mb-4 transition-colors">
                        <button onClick={() => setIsGovt(false)} className={clsx("flex-1 py-2.5 text-xs font-bold uppercase rounded-xl transition-all", !isGovt ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300')}>Private Sector</button>
                        <button onClick={() => setIsGovt(true)} className={clsx("flex-1 py-2.5 text-xs font-bold uppercase rounded-xl transition-all", isGovt ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300')}>Govt. Employee</button>
                    </div>

                    {/* Fixed Term Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                        <div className="space-y-0.5">
                            <span className="block text-xs font-bold text-gray-600 dark:text-gray-300">Fixed Term Employment?</span>
                            <span className="block text-[10px] text-gray-400 dark:text-gray-500">Lowers eligibility to 1 year</span>
                        </div>
                        <button
                            onClick={() => setIsFixedTerm(!isFixedTerm)}
                            className={clsx("w-11 h-6 rounded-full transition-colors relative", isFixedTerm ? "bg-amber-500" : "bg-gray-300 dark:bg-slate-600")}
                        >
                            <span className={clsx("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm", isFixedTerm ? "translate-x-5" : "translate-x-0")} />
                        </button>
                    </div>

                    <div className="space-y-6 pt-4">
                        <MoneyInput
                            label="Monthly Basic + DA"
                            value={basicPay}
                            onChange={setBasicPay}
                            large
                        />
                        <MoneyInput
                            label="Monthly Gross CTC"
                            value={totalCTC}
                            onChange={setTotalCTC}
                        />
                        <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-100 dark:border-amber-800 flex items-start gap-2.5 transition-colors">
                            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
                                Code on Wages (Nov 2025): If Basic+DA is less than 50% of CTC, calculation uses 50% of CTC.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-3 px-1">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Years of Service</label>
                                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-lg ring-1 ring-primary/20 dark:ring-primary/30">{years} Years</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="50"
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                            />
                            {!calc.eligible && (
                                <div className="mt-4 text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 transition-colors">
                                    <Info className="w-4 h-4" />
                                    Minimum {isFixedTerm ? '1 year' : '5 years'} required for eligibility
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-7 space-y-6">
                {/* Result Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <ResultCard
                            label="Total Payable Gratuity"
                            value={Math.round(calc.payable)}
                            subtext="Estimated end-of-service benefit"
                            type="primary"
                        />
                    </div>
                    <ResultCard
                        label="Tax Exempt"
                        value={Math.round(calc.taxExempt)}
                        subtext={`Max Cap: ${toINR(calc.limit)}`}
                        type="secondary"
                        delay={100}
                    />
                    <ResultCard
                        label="Taxable Portion"
                        value={Math.round(calc.taxable)}
                        type="highlight"
                        delay={200}
                    />
                </div>

                {calc.isWageIncreased && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800 flex items-start gap-3 transition-colors">
                        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                        <div className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
                            <strong className="block mb-1 text-indigo-900 dark:text-indigo-100">Wage Code Impact</strong>
                            Calculation used <strong className="decoration-2 underline decoration-indigo-300 dark:decoration-indigo-600">{toINR(calc.wageBasis)}</strong> (50% CTC) as the basis instead of Basic pay, resulting in a higher gratuity.
                        </div>
                    </div>
                )}

                {/* Visual Breakdown */}
                {calc.payable > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-100/50 dark:shadow-slate-900/50 backdrop-blur-xl flex items-center justify-center min-h-[180px] transition-colors">
                        <div className="w-full max-w-xl space-y-6">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                                <span>Tax Breakdown</span>
                            </div>
                            <div className="relative h-14 w-full bg-slate-50 dark:bg-slate-900/50 rounded-full overflow-hidden flex shadow-inner ring-1 ring-slate-100 dark:ring-slate-700">
                                <div
                                    style={{ width: `${(calc.taxExempt / calc.payable) * 100}%` }}
                                    className="h-full bg-emerald-500 flex items-center justify-center text-white font-bold text-[10px] md:text-xs relative group"
                                >
                                    <span className="drop-shadow-md z-10 whitespace-nowrap px-1">Tax Free</span>
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                                </div>
                                <div
                                    style={{ width: `${(calc.taxable / calc.payable) * 100}%` }}
                                    className="h-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center text-white font-bold text-[10px] md:text-xs relative group"
                                >
                                    <span className={clsx("drop-shadow-md z-10 whitespace-nowrap px-1", (calc.taxable / calc.payable) < 0.1 ? "hidden group-hover:block" : "block")}>Taxable</span>
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-700 flex-wrap gap-2">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div> Exempt: {Math.round((calc.taxExempt / calc.payable) * 100)}%</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-600 shadow-sm"></div> Taxable: {Math.round((calc.taxable / calc.payable) * 100)}%</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
