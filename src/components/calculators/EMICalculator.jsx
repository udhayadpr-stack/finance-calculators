import React, { useState, useMemo } from 'react';
import {
    Home,
    Calendar,
    PieChart
} from 'lucide-react';
import { MoneyInput } from '../ui/MoneyInput';
import { toINR, parseMoney } from '../../utils/formatters';

export default function EMICalculator() {
    const [loanAmount, setLoanAmount] = useState(5000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenureYears, setTenureYears] = useState(20);

    const calc = useMemo(() => {
        const p = parseMoney(loanAmount);
        const r = interestRate / 12 / 100;
        const n = tenureYears * 12;

        if (p === 0 || n === 0) return { emi: 0, totalInterest: 0, totalAmount: 0, schedule: [] };

        // EMI Formula
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

        const totalAmount = emi * n;
        const totalInterest = totalAmount - p;

        // Amortization Schedule (Yearly summary)
        let balance = p;
        let schedule = [];
        let yearlyInterest = 0;
        let yearlyPrincipal = 0;

        for (let m = 1; m <= n; m++) {
            const interestForMonth = balance * r;
            const principalForMonth = emi - interestForMonth;
            balance -= principalForMonth;
            if (balance < 0) balance = 0;

            yearlyInterest += interestForMonth;
            yearlyPrincipal += principalForMonth;

            if (m % 12 === 0 || m === n) {
                schedule.push({
                    year: Math.ceil(m / 12),
                    interest: yearlyInterest,
                    principal: yearlyPrincipal,
                    balance: balance
                });
                yearlyInterest = 0;
                yearlyPrincipal = 0;
            }
        }

        return { emi, totalInterest, totalAmount, schedule };
    }, [loanAmount, interestRate, tenureYears]);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* INPUTS */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>

                    <div className="flex items-center gap-4">
                        <div className="bg-violet-50 p-3 rounded-2xl text-violet-600 ring-1 ring-violet-100">
                            <Home className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">EMI Calculator</h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Plan your loan repayments</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <MoneyInput
                            label="Loan Amount"
                            value={loanAmount}
                            onChange={setLoanAmount}
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
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest group-focus-within:text-violet-600 transition-colors">Tenure (Years)</label>
                                <input
                                    type="number"
                                    value={tenureYears}
                                    onChange={e => setTenureYears(Number(e.target.value))}
                                    className="w-full p-3 border border-slate-200 rounded-xl font-bold text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-3 px-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Loan Tenure</label>
                                <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg ring-1 ring-violet-100">{tenureYears} Years</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="30"
                                value={tenureYears}
                                onChange={(e) => setTenureYears(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600 hover:accent-violet-500 transition-all"
                            />
                            <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">
                                <span>1 Year</span>
                                <span>30 Years</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-200 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><PieChart className="w-24 h-24 transform -rotate-12" /></div>

                    <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-2">Monthly EMI</div>
                            <div className="text-5xl font-bold tracking-tight font-display">{toINR(Math.round(calc.emi))}</div>
                        </div>
                        <div className="text-left md:text-right bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                            <div className="text-violet-100 text-[10px] font-bold uppercase tracking-widest mb-1">Total Amount Payable</div>
                            <div className="text-2xl font-bold">{toINR(Math.round(calc.totalAmount))}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 relative overflow-hidden group hover:border-violet-200 transition-colors">
                        <div className="relative z-10">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-violet-600 transition-colors">Principal Amount</div>
                            <div className="text-2xl font-bold text-gray-900">{toINR(Math.round(loanAmount))}</div>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div style={{ width: `${(loanAmount / calc.totalAmount) * 100}%` }} className="h-full bg-gray-400 rounded-full"></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{Math.round((loanAmount / calc.totalAmount) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 relative overflow-hidden group hover:border-amber-200 transition-colors">
                        <div className="relative z-10">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-amber-600 transition-colors">Total Interest</div>
                            <div className="text-2xl font-bold text-amber-600">{toINR(Math.round(calc.totalInterest))}</div>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div style={{ width: `${(calc.totalInterest / calc.totalAmount) * 100}%` }} className="h-full bg-amber-500 rounded-full"></div>
                                </div>
                                <span className="text-[10px] font-bold text-amber-500 whitespace-nowrap">{Math.round((calc.totalInterest / calc.totalAmount) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100/50 overflow-hidden backdrop-blur-xl">
                    <div className="p-5 border-b border-gray-100 font-bold text-gray-800 flex items-center gap-2 bg-gray-50/50">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
                            <Calendar className="w-4 h-4 text-violet-500" />
                        </div>
                        Amortization Schedule (Yearly)
                    </div>
                    <div className="max-h-[300px] overflow-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/80 text-[10px] font-bold text-gray-500 uppercase tracking-widest sticky top-0 backdrop-blur-sm z-10">
                                <tr>
                                    <th className="px-6 py-4">Year</th>
                                    <th className="px-6 py-4">Principal</th>
                                    <th className="px-6 py-4">Interest</th>
                                    <th className="px-6 py-4 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {calc.schedule.map((row) => (
                                    <tr key={row.year} className="hover:bg-violet-50/30 transition-colors group">
                                        <td className="px-6 py-3 font-medium text-gray-600 group-hover:text-violet-700">{row.year}</td>
                                        <td className="px-6 py-3 text-emerald-600 font-medium">{toINR(Math.round(row.principal))}</td>
                                        <td className="px-6 py-3 text-amber-600 font-medium">{toINR(Math.round(row.interest))}</td>
                                        <td className="px-6 py-3 text-right font-mono font-bold text-gray-400 group-hover:text-violet-600">{toINR(Math.round(row.balance))}</td>
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
