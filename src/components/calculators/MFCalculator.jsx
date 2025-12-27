import React, { useState, useMemo } from 'react';
import {
    TrendingUp,
    PieChart,
    Target
} from 'lucide-react';
import { MoneyInput } from '../ui/MoneyInput';
import { toINR, parseMoney } from '../../utils/formatters';
import clsx from 'clsx';

import { calculateMF } from '../../utils/calculators/mf';

export default function MFCalculator() {
    const [type, setType] = useState('sip'); // sip | lumpsum
    const [amount, setAmount] = useState(5000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);

    const calc = useMemo(() => {
        return calculateMF({
            type,
            amount: parseMoney(amount),
            rate,
            years
        });
    }, [type, amount, rate, years]);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* INPUTS */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 ring-1 ring-emerald-100">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Mutual Fund Returns</h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Projects your investment growth</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60">
                        <button onClick={() => { setType('sip'); setAmount(5000); }} className={clsx("flex-1 py-2.5 text-xs font-bold uppercase rounded-xl transition-all", type === 'sip' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600')}>SIP</button>
                        <button onClick={() => { setType('lumpsum'); setAmount(100000); }} className={clsx("flex-1 py-2.5 text-xs font-bold uppercase rounded-xl transition-all", type === 'lumpsum' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600')}>Lumpsum</button>
                    </div>

                    <div className="space-y-6">
                        <MoneyInput
                            label={type === 'sip' ? "Monthly Investment" : "Total Investment"}
                            value={amount}
                            onChange={setAmount}
                            large
                        />

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Expected Return Rate (p.a)</label>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg ring-1 ring-emerald-100">{rate}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="1" max="30" step="0.5"
                                    value={rate}
                                    onChange={(e) => setRate(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-500 transition-all"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Time Period</label>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg ring-1 ring-emerald-100">{years} Years</span>
                                </div>
                                <input
                                    type="range"
                                    min="1" max="40"
                                    value={years}
                                    onChange={(e) => setYears(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Target className="w-32 h-32" /></div>

                    <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="text-emerald-100/70 text-xs font-bold uppercase tracking-widest mb-2">Invested Amount</div>
                            <div className="text-3xl font-bold tracking-tight opacity-90">{toINR(Math.round(calc.invested))}</div>
                        </div>
                        <div>
                            <div className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">Est. Returns</div>
                            <div className="text-3xl font-bold tracking-tight text-emerald-200">{toINR(Math.round(calc.estReturns))}</div>
                        </div>
                        <div className="col-span-1 md:col-span-3 pt-6 border-t border-white/10">
                            <div className="text-emerald-100/70 text-xs font-bold uppercase tracking-widest mb-1">Total Value</div>
                            <div className="text-5xl font-bold tracking-tight font-display">{toINR(Math.round(calc.totalValue))}</div>
                        </div>
                    </div>

                    {/* Decorative Blur */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>
                </div>

                {/* VS Chart Representation */}
                <div className="bg-white rounded-3xl p-8 border border-white/60 shadow-xl shadow-slate-100/50 backdrop-blur-xl flex items-center justify-center min-h-[220px]">
                    <div className="w-full max-w-xl space-y-6">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                            <span>Visual Breakdown</span>
                        </div>
                        <div className="relative h-14 w-full bg-slate-50 rounded-full overflow-hidden flex shadow-inner ring-1 ring-slate-100">
                            <div
                                style={{ width: `${(calc.invested / calc.totalValue) * 100}%` }}
                                className="h-full bg-slate-400 flex items-center justify-center text-white font-bold text-xs relative group"
                            >
                                <span className="drop-shadow-md z-10 transition-transform group-hover:scale-110">Invested</span>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                            </div>
                            <div
                                style={{ width: `${(calc.estReturns / calc.totalValue) * 100}%` }}
                                className="h-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs relative group"
                            >
                                <span className="drop-shadow-md z-10 transition-transform group-hover:scale-110">Returns</span>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-600 pt-2 border-t border-gray-100">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400 shadow-sm"></div> Invested: {Math.round((calc.invested / calc.totalValue) * 100)}%</span>
                            <span className="flex items-center gap-2">Returns: {Math.round((calc.estReturns / calc.totalValue) * 100)}% <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
