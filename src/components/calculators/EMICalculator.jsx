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
        <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* INPUTS */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <Home className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">EMI Calculator</h2>
                    </div>

                    <MoneyInput
                        label="Loan Amount"
                        value={loanAmount}
                        onChange={setLoanAmount}
                        large
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <MoneyInput
                            label="Interest Rate (%)"
                            value={interestRate}
                            onChange={setInterestRate}
                            isManual
                            showToggle={false}
                        />
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tenure (Years)</label>
                            <input type="number" value={tenureYears} onChange={e => setTenureYears(Number(e.target.value))} className="w-full p-2.5 border rounded-xl font-bold text-gray-700 outline-none focus:border-indigo-500 bg-white" />
                        </div>
                    </div>

                    <div>
                        <input
                            type="range"
                            min="1" max="30"
                            value={tenureYears}
                            onChange={(e) => setTenureYears(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <span>1 Year</span>
                            <span>30 Years</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10 w-full flex justify-between items-end">
                        <div>
                            <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Monthly EMI</div>
                            <div className="text-5xl font-bold tracking-tight">{toINR(Math.round(calc.emi))}</div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Total Payment</div>
                            <div className="text-xl font-bold">{toINR(Math.round(calc.totalAmount))}</div>
                        </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Principal Amount</div>
                            <div className="text-2xl font-bold text-gray-900">{toINR(Math.round(loanAmount))}</div>
                            <div className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {Math.round((loanAmount / calc.totalAmount) * 100)}% of Total
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 w-16 h-16 bg-gray-100 rounded-tl-full"></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Interest</div>
                            <div className="text-2xl font-bold text-amber-600">{toINR(Math.round(calc.totalInterest))}</div>
                            <div className="mt-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                                {Math.round((calc.totalInterest / calc.totalAmount) * 100)}% of Total
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 w-16 h-16 bg-amber-50 rounded-tl-full"></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        Amortization Schedule (Yearly)
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Year</th>
                                    <th className="px-6 py-3">Principal Paid</th>
                                    <th className="px-6 py-3">Interest Paid</th>
                                    <th className="px-6 py-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {calc.schedule.map((row) => (
                                    <tr key={row.year} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-gray-600">{row.year}</td>
                                        <td className="px-6 py-3 text-emerald-600 font-medium">{toINR(Math.round(row.principal))}</td>
                                        <td className="px-6 py-3 text-amber-600 font-medium">{toINR(Math.round(row.interest))}</td>
                                        <td className="px-6 py-3 text-right font-mono font-bold text-gray-400">{toINR(Math.round(row.balance))}</td>
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
