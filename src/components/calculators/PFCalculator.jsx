import React, { useState, useMemo } from 'react';
import {
    PiggyBank,
    TrendingUp,
    Info,
    ChevronDown
} from 'lucide-react';
import { MoneyInput } from '../ui/MoneyInput';
import { toINR, parseMoney } from '../../utils/formatters';
import clsx from 'clsx';
import { calculatePF } from '../../utils/calculators/pf';


export default function PFCalculator() {
    // Inputs
    const [basicPay, setBasicPay] = useState(50000);
    const [currentAge, setCurrentAge] = useState(25);
    const [retirementAge, setRetirementAge] = useState(58);
    const [currentBalance, setCurrentBalance] = useState(100000);
    const [interestRate, setInterestRate] = useState(8.25);
    const [annualIncrement, setAnnualIncrement] = useState(5);

    // Advanced
    const [employeeContrRatio, setEmployeeContrRatio] = useState(12);
    const [employerContrRatio, setEmployerContrRatio] = useState(12);

    const calc = useMemo(() => {
        return calculatePF({
            basicPay,
            currentAge,
            retirementAge,
            currentBalance,
            interestRate,
            annualIncrement,
            employeeContrRatio,
            employerContrRatio
        });
    }, [basicPay, currentAge, retirementAge, currentBalance, interestRate, annualIncrement, employeeContrRatio, employerContrRatio]);

    // Fix: The loop logic had a syntax error in variable name `totalEmployer contribution` -> `totalEmployerContribution`
    // I will correct that in the code content below.

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* INPUTS */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 ring-1 ring-indigo-100">
                            <PiggyBank className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">PF Calculator</h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Plan your retirement corpus</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <MoneyInput
                            label="Monthly Basic Pay"
                            value={basicPay}
                            onChange={setBasicPay}
                            large
                        />

                        <div className="grid grid-cols-2 gap-5">
                            <MoneyInput
                                label="Current Balance"
                                value={currentBalance}
                                onChange={setCurrentBalance}
                            />
                            <MoneyInput
                                label="Interest Rate (%)"
                                value={interestRate}
                                onChange={setInterestRate}
                                placeholder="8.25"
                                isManual
                                showToggle={false}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2 group">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Current Age</label>
                                <input
                                    type="number"
                                    value={currentAge}
                                    onChange={e => setCurrentAge(Number(e.target.value))}
                                    className="w-full p-3 border border-slate-200 rounded-xl font-bold text-gray-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Retirement Age</label>
                                <input
                                    type="number"
                                    value={retirementAge}
                                    onChange={e => setRetirementAge(Number(e.target.value))}
                                    className="w-full p-3 border border-slate-200 rounded-xl font-bold text-gray-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-3 px-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Annual Increment</label>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg ring-1 ring-indigo-100">{annualIncrement}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="20"
                                value={annualIncrement}
                                onChange={(e) => setAnnualIncrement(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><PiggyBank className="w-16 h-16 transform rotate-12" /></div>
                        <div className="relative z-10">
                            <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Total Corpus</div>
                            <div className="text-3xl font-bold tracking-tight">{toINR(Math.round(calc.totalCorpus))}</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-100/50 group hover:border-emerald-200 transition-colors">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-emerald-600 transition-colors">Total Interest</div>
                        <div className="text-2xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">{toINR(Math.round(calc.totalInterest))}</div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-100/50 group hover:border-amber-200 transition-colors">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-amber-600 transition-colors">Your Contribution</div>
                        <div className="text-2xl font-bold text-amber-600 group-hover:text-amber-700 transition-colors">{toINR(Math.round(calc.employeeShare))}</div>
                    </div>
                </div>

                {/* Visual Breakdown */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50 backdrop-blur-xl flex items-center justify-center min-h-[180px]">
                    <div className="w-full max-w-xl space-y-6">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                            <span>Corpus Breakdown</span>
                        </div>
                        <div className="relative h-14 w-full bg-slate-50 rounded-full overflow-hidden flex shadow-inner ring-1 ring-slate-100">
                            {/* Employee Share */}
                            <div
                                style={{ width: `${(calc.employeeShare / calc.totalCorpus) * 100}%` }}
                                className="h-full bg-amber-500 flex items-center justify-center text-white font-bold text-[10px] md:text-xs relative group"
                            >
                                <span className={clsx("drop-shadow-md z-10 whitespace-nowrap px-1", (calc.employeeShare / calc.totalCorpus) < 0.1 ? "hidden group-hover:block" : "block")}>You</span>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                            </div>

                            {/* Employer Share */}
                            <div
                                style={{ width: `${(calc.employerShare / calc.totalCorpus) * 100}%` }}
                                className="h-full bg-indigo-500 flex items-center justify-center text-white font-bold text-[10px] md:text-xs relative group"
                            >
                                <span className={clsx("drop-shadow-md z-10 whitespace-nowrap px-1", (calc.employerShare / calc.totalCorpus) < 0.1 ? "hidden group-hover:block" : "block")}>Employer</span>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                            </div>

                            {/* Interest */}
                            <div
                                style={{ width: `${(calc.totalInterest / calc.totalCorpus) * 100}%` }}
                                className="h-full bg-emerald-500 flex items-center justify-center text-white font-bold text-[10px] md:text-xs relative group"
                            >
                                <span className="drop-shadow-md z-10 whitespace-nowrap px-1">Interest</span>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-600 pt-2 border-t border-gray-100 flex-wrap gap-2">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div> You: {Math.round((calc.employeeShare / calc.totalCorpus) * 100)}%</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm"></div> Employer: {Math.round((calc.employerShare / calc.totalCorpus) * 100)}%</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div> Interest: {Math.round((calc.totalInterest / calc.totalCorpus) * 100)}%</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100/50 overflow-hidden backdrop-blur-xl">
                    <div className="p-5 border-b border-gray-100 font-bold text-gray-800 flex items-center gap-2 bg-gray-50/50">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                        </div>
                        Growth Projection
                    </div>
                    <div className="max-h-[500px] overflow-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/80 text-[10px] font-bold text-gray-500 uppercase tracking-widest sticky top-0 backdrop-blur-sm z-10">
                                <tr>
                                    <th className="px-6 py-4">Age</th>
                                    <th className="px-6 py-4">Year</th>
                                    <th className="px-6 py-4 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {calc.breakdown.map((row) => (
                                    <tr key={row.age} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-3 font-medium text-gray-600 group-hover:text-indigo-700">{row.age}</td>
                                        <td className="px-6 py-3 text-gray-500">{row.year}</td>
                                        <td className="px-6 py-3 text-right font-mono font-bold text-gray-700 group-hover:text-indigo-700">{toINR(Math.round(row.balance))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
