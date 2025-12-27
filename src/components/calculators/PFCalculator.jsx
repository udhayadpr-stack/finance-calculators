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
        <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* INPUTS */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <PiggyBank className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">PF Calculator</h2>
                    </div>

                    <MoneyInput
                        label="Monthly Basic Pay"
                        value={basicPay}
                        onChange={setBasicPay}
                        large
                    />

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Age</label>
                            <input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} className="w-full p-2 border rounded-xl font-bold text-gray-700 outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Retirement Age</label>
                            <input type="number" value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value))} className="w-full p-2 border rounded-xl font-bold text-gray-700 outline-none focus:border-indigo-500" />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Annual Increment</label>
                            <span className="text-xs font-bold text-indigo-600">{annualIncrement}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="20"
                            value={annualIncrement}
                            onChange={(e) => setAnnualIncrement(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Corpus</div>
                        <div className="text-2xl font-bold text-indigo-600">{toINR(Math.round(calc.totalCorpus))}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Interest</div>
                        <div className="text-2xl font-bold text-emerald-600">{toINR(Math.round(calc.totalInterest))}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your Contribution</div>
                        <div className="text-2xl font-bold text-amber-600">{toINR(Math.round(calc.employeeShare))}</div>
                    </div>
                </div>

                {/* Simple Chart / Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        Growth Projection
                    </div>
                    <div className="max-h-[400px] overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Age</th>
                                    <th className="px-6 py-3">Year</th>
                                    <th className="px-6 py-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {calc.breakdown.map((row) => (
                                    <tr key={row.age} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-gray-600">{row.age}</td>
                                        <td className="px-6 py-3 text-gray-500">{row.year}</td>
                                        <td className="px-6 py-3 text-right font-mono font-bold text-indigo-600">{toINR(Math.round(row.balance))}</td>
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
