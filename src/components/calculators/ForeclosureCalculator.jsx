import React, { useState, useMemo } from 'react';
import {
    XOctagon,
    CheckCircle,
    AlertOctagon,
    Minus
} from 'lucide-react';
import { MoneyInput } from '../ui/MoneyInput';
import { toINR, parseMoney } from '../../utils/formatters';

export default function ForeclosureCalculator() {
    const [outstandingPrincipal, setOutstandingPrincipal] = useState(2000000);
    const [interestRate, setInterestRate] = useState(9);
    const [remainingTenure, setRemainingTenure] = useState(60); // months
    const [foreclosureChargesPercent, setForeclosureChargesPercent] = useState(0);

    const calc = useMemo(() => {
        const p = parseMoney(outstandingPrincipal);
        const r = interestRate / 12 / 100;
        const n = remainingTenure;

        if (p === 0 || n === 0) return {
            foreclosureCost: 0,
            interestIfContinued: 0,
            totalIfContinued: 0,
            emi: 0,
            netSavings: 0
        };

        // 1. If continued
        // EMI
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalAmount = emi * n;
        const interestIfContinued = totalAmount - p;

        // 2. If foreclosed
        const penalty = p * (foreclosureChargesPercent / 100);
        // GST on penalty usually 18% in India, let's include it or just assume usage inputs net percent
        // Let's assume input percent is gross.
        const foreclosureCost = p + penalty;

        // 3. Difference
        const netSavings = totalAmount - foreclosureCost;

        return {
            foreclosureCost,
            penalty,
            interestIfContinued,
            totalIfContinued: totalAmount,
            emi,
            netSavings
        };
    }, [outstandingPrincipal, interestRate, remainingTenure, foreclosureChargesPercent]);

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* INPUTS */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <XOctagon className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Loan Foreclosure</h2>
                    </div>

                    <MoneyInput
                        label="Outstanding Principal"
                        value={outstandingPrincipal}
                        onChange={setOutstandingPrincipal}
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
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remaining Tenure</label>
                            <div className="relative">
                                <input type="number" value={remainingTenure} onChange={e => setRemainingTenure(Number(e.target.value))} className="w-full p-2.5 border rounded-xl font-bold text-gray-700 outline-none focus:border-indigo-500 bg-white" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Months</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Foreclosure Charges</label>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{foreclosureChargesPercent}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="10" step="0.5"
                            value={foreclosureChargesPercent}
                            onChange={(e) => setForeclosureChargesPercent(Number(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <p className="text-[10px] text-gray-400 mt-2">Many banks charge 2-4% penalty on principal if closed early.</p>
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-7 space-y-6">

                {/* VERDICT CARD */}
                <div className={`rounded-2xl p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group transition-colors duration-500 ${calc.netSavings > 0 ? 'bg-emerald-600 shadow-emerald-200' : 'bg-red-500 shadow-red-200'}`}>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            {calc.netSavings > 0
                                ? <CheckCircle className="w-8 h-8 text-emerald-100" />
                                : <AlertOctagon className="w-8 h-8 text-red-100" />
                            }
                            <h2 className="text-xl font-bold tracking-tight">
                                {calc.netSavings > 0
                                    ? `You Save ${toINR(Math.round(calc.netSavings))}!`
                                    : `You Lose ${toINR(Math.round(Math.abs(calc.netSavings)))}!`}
                            </h2>
                        </div>
                        <p className="text-white/80 font-medium leading-relaxed max-w-sm">
                            {calc.netSavings > 0
                                ? "Foreclosing now is financially beneficial despite the penalty charges."
                                : "Foreclosing now is more expensive than continuing the loan due to high penalty or low interest benefit."}
                        </p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-gray-100">
                        <div className="p-6">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">If Costly Continued</div>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-sm text-gray-500">Remaining Interest</span>
                                    <span className="block text-xl font-bold text-amber-600">{toINR(Math.round(calc.interestIfContinued))}</span>
                                </div>
                                <div>
                                    <span className="block text-sm text-gray-500">Total Future Payments</span>
                                    <span className="block text-lg font-bold text-gray-900">{toINR(Math.round(calc.totalIfContinued))}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">If Foreclosed Now</div>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-sm text-gray-500">Penalty Charges</span>
                                    <span className="block text-xl font-bold text-red-500">{toINR(Math.round(calc.penalty))}</span>
                                </div>
                                <div>
                                    <span className="block text-sm text-gray-500">One-time Payment</span>
                                    <span className="block text-lg font-bold text-gray-900">{toINR(Math.round(calc.foreclosureCost))}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Math Summary */}
                    <div className="bg-gray-50 p-4 text-xs font-mono text-center text-gray-500 border-t border-gray-200">
                        {toINR(Math.round(calc.totalIfContinued))} (Future) - {toINR(Math.round(calc.foreclosureCost))} (Now) = {toINR(Math.round(calc.netSavings))}
                    </div>
                </div>
            </div>
        </div>
    );
}
