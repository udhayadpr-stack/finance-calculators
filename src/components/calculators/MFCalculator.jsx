import React, { useState, useMemo } from 'react';
import {
    TrendingUp,
    PieChart,
    Target
} from 'lucide-react';
import { MoneyInput } from '../ui/MoneyInput';
import { toINR, parseMoney } from '../../utils/formatters';
import clsx from 'clsx';

export default function MFCalculator() {
    const [type, setType] = useState('sip'); // sip | lumpsum
    const [amount, setAmount] = useState(5000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);

    const calc = useMemo(() => {
        const p = parseMoney(amount);
        const r = rate / 100;
        const n = years * 12; // months

        // Monthly rate
        const i = r / 12;

        let invested = 0;
        let estReturns = 0;
        let totalValue = 0;

        if (type === 'sip') {
            // SIP Formula: M = P × ({[1 + i]^n - 1} / i) × (1 + i)
            invested = p * n;
            if (i === 0) {
                totalValue = invested;
            } else {
                totalValue = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            }
        } else {
            // Lumpsum Formula: M = P * (1 + r)^N (Annual Compounding usually) or Monthly?
            // Standard generic calculators often use annual compounding for Lumpsum, monthly for SIP.
            // But to be precise, let's use Annual Compounding for Lumpsum as is standard.
            invested = p;
            // FV = P * (1 + r)^n_years
            totalValue = p * Math.pow(1 + r, years);
        }

        estReturns = totalValue - invested;

        return { invested, estReturns, totalValue };
    }, [type, amount, rate, years]);

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* INPUTS */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Mutual Fund Returns</h2>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button onClick={() => { setType('sip'); setAmount(5000); }} className={clsx("flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all", type === 'sip' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900')}>SIP</button>
                        <button onClick={() => { setType('lumpsum'); setAmount(100000); }} className={clsx("flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all", type === 'lumpsum' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900')}>Lumpsum</button>
                    </div>

                    <MoneyInput
                        label={type === 'sip' ? "Monthly Investment" : "Total Investment"}
                        value={amount}
                        onChange={setAmount}
                        large
                    />

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected Return Rate (p.a)</label>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{rate}%</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="30" step="0.5"
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Period</label>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{years} Years</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="40"
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 text-white shadow-xl shadow-indigo-200 flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">Invested Amount</div>
                            <div className="text-3xl font-bold tracking-tight opacity-90">{toINR(Math.round(calc.invested))}</div>
                        </div>
                        <div>
                            <div className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">Est. Returns</div>
                            <div className="text-3xl font-bold tracking-tight text-emerald-400">{toINR(Math.round(calc.estReturns))}</div>
                        </div>
                        <div className="col-span-1 md:col-span-3 pt-6 border-t border-indigo-700/50">
                            <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Total Value</div>
                            <div className="text-5xl font-bold tracking-tight">{toINR(Math.round(calc.totalValue))}</div>
                        </div>
                    </div>

                    {/* Decorative Blur */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -left-20 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* VS Chart Representation */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex items-center justify-center min-h-[200px]">
                    <div className="w-full max-w-lg space-y-4">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            <span>Breakdown</span>
                        </div>
                        <div className="relative h-12 w-full bg-gray-100 rounded-full overflow-hidden flex">
                            <div
                                style={{ width: `${(calc.invested / calc.totalValue) * 100}%` }}
                                className="h-full bg-gray-400 flex items-center justify-center text-white font-bold text-xs"
                            >
                                Invested
                            </div>
                            <div
                                style={{ width: `${(calc.estReturns / calc.totalValue) * 100}%` }}
                                className="h-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs"
                            >
                                Returns
                            </div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-600">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Invested: {Math.round((calc.invested / calc.totalValue) * 100)}%</span>
                            <span className="flex items-center gap-2">Returns: {Math.round((calc.estReturns / calc.totalValue) * 100)}% <div className="w-3 h-3 rounded-full bg-emerald-500"></div></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
