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
        let year = new Date().getFullYear();
        let balance = parseMoney(currentBalance);
        let monthlyBasic = parseMoney(basicPay);
        let age = currentAge;

        // Trackers
        let totalInvestedEmployee = 0;
        let totalInvestedEmployer = 0;
        let totalInterest = 0;

        const breakdown = [];

        // EPS Cap is 15000 usually for calculation splitting
        const WAGE_CAP = 15000;

        let totalMonths = (retirementAge - currentAge) * 12;

        for (let m = 0; m < totalMonths; m++) {
            // Annual Increment logic (apply every 12th month relative to start)
            if (m > 0 && m % 12 === 0) {
                monthlyBasic = monthlyBasic * (1 + (annualIncrement / 100));
                year++;
                age++;
            }

            // Calculate Contributions
            // Employee: Straight % of Basic
            let empShare = monthlyBasic * (employeeContrRatio / 100);

            // Employer: Split into EPS and EPF
            // EPS is 8.33% of Basic (capped at 15000 usually)
            let epsShare = 0;
            let epfShareEmployer = 0;

            // Standard rule: Employer pays 12%. 
            // 8.33% to EPS (max 1250), rest to EPF.
            let totalEmployerContribution = monthlyBasic * (employerContrRatio / 100);

            // EPS Calculation
            // If basic > 15000, EPS is calculated on 15000 -> 1250
            // If basic < 15000, EPS is 8.33% of basic
            let epsBasis = Math.min(monthlyBasic, WAGE_CAP);
            epsShare = epsBasis * 0.0833;

            // EPF Employer = Total Employer Contribution - EPS
            epfShareEmployer = totalEmployerContribution - epsShare;

            // Add to balance logic
            // Interest is usually credited annually on the opening balance + monthly additions
            // Simplified: Monthly interest compounding (though practically it's annual credit)
            // Rate is annual. Monthly rate = rate / 1200
            let monthlyInterest = (balance + empShare + epfShareEmployer) * (interestRate / 100 / 12);

            // Update trackers
            totalInvestedEmployee += empShare;
            totalInvestedEmployer += epfShareEmployer;
            totalInterest += monthlyInterest;

            balance += empShare + epfShareEmployer + monthlyInterest;

            // Record annual snapshot
            if ((m + 1) % 12 === 0 || m === totalMonths - 1) {
                breakdown.push({
                    age,
                    year,
                    basic: monthlyBasic,
                    balance,
                    interest: totalInterest,
                    empShare: totalInvestedEmployee,
                    employerShare: totalInvestedEmployer
                });
            }
        }

        return {
            totalCorpus: balance,
            employeeShare: currentBalance + totalInvestedEmployee, // Include initial balance in attribution? Partially. Let's just track additions.
            employerShare: totalInvestedEmployer,
            totalInterest,
            breakdown
        };

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

                {/* Simple Chart / Table */}
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
