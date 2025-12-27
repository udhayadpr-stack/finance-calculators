import { useState, useMemo } from 'react';
import { Award, Info, Briefcase } from 'lucide-react';
import { MoneyInput } from '../ui/MoneyInput';
import { toINR, parseMoney } from '../../utils/formatters';

export default function GratuityCalculator() {
    const [basicPay, setBasicPay] = useState(40000); // Basic + DA
    const [totalCTC, setTotalCTC] = useState(100000); // Monthly CTC
    const [years, setYears] = useState(5);
    const [isGovt, setIsGovt] = useState(false); // Toggle for Govt/Private

    const calc = useMemo(() => {
        // Rule: Gratuity = number_of_years * 15/26 * (Higher of Basic+DA OR 50% of CTC)
        // Code on Wages (Effective Nov 2025) mandates Basic >= 50% CTC for social security.

        const salaryInput = parseMoney(basicPay);
        const ctcInput = parseMoney(totalCTC);

        // Derived Wage Basis
        const wageBasis = Math.max(salaryInput, ctcInput * 0.5);
        const isWageIncreased = wageBasis > salaryInput;

        const n = Math.round(years);

        // Limits: Fully exempt for Govt, 20L for Private (as of FY 2025-26)
        const TAX_FREE_LIMIT = isGovt ? Infinity : 2000000;

        if (n < 5) { // Fixed Term employees might be eligible earlier, but standard rule is 5
            return {
                payable: 0,
                eligible: false,
                taxExempt: 0,
                taxable: 0,
                limit: TAX_FREE_LIMIT,
                wageBasis
            };
        }

        const gratuity = (wageBasis * 15 * n) / 26;

        const exempt = Math.min(gratuity, TAX_FREE_LIMIT);
        const taxable = Math.max(0, gratuity - exempt);

        return {
            payable: gratuity,
            eligible: true,
            taxExempt: exempt,
            taxable: taxable,
            limit: TAX_FREE_LIMIT,
            wageBasis,
            isWageIncreased
        };

    }, [basicPay, totalCTC, years, isGovt]);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* INPUTS */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 backdrop-blur-xl space-y-8 relative overflow-hidden">
                    {/* Decorative Top Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-primary"></div>

                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl text-primary ring-1 ring-primary/20">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Gratuity Calculator</h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Estimate your end-of-service benefits</p>
                        </div>
                    </div>

                    {/* Employee Type Toggle */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60">
                        <button onClick={() => setIsGovt(false)} className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-xl transition-all ${!isGovt ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}>Private Sector</button>
                        <button onClick={() => setIsGovt(true)} className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-xl transition-all ${isGovt ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}>Govt. Employee</button>
                    </div>

                    <div className="space-y-6">
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
                        <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                                Code on Wages (Nov 2025): If Basic+DA is less than 50% of CTC, calculation uses 50% of CTC.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-3 px-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Years of Service</label>
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg ring-1 ring-primary/20">{years} Years</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="50"
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                            />
                            {!calc.eligible && (
                                <div className="mt-4 text-xs text-rose-600 font-bold flex items-center gap-2 bg-rose-50 p-3 rounded-xl border border-rose-100">
                                    <Info className="w-4 h-4" />
                                    Minimum 5 years required for eligibility
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-7 space-y-6">
                {/* Main Result Card */}
                <div className="bg-gradient-to-br from-primary to-violet-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8 opacity-90">
                            <Briefcase className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Total Payable Gratuity</span>
                        </div>

                        <div className="mb-8">
                            <div className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2 font-display">
                                {toINR(Math.round(calc.payable))}
                            </div>
                            <div className="text-white/60 font-medium">Estimated amount based on current rules</div>
                        </div>

                        {calc.isWageIncreased && (
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-md mb-6 hover:bg-white/15 transition-colors">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-indigo-200 mt-0.5 shrink-0" />
                                    <div className="text-sm text-indigo-50 leading-relaxed">
                                        <strong className="text-white">Wage Code Impact:</strong> Calculation bases shifted. used <strong className="text-white decoration-2 underline decoration-indigo-300">{toINR(calc.wageBasis)}</strong> (50% CTC) instead of Basic pay.
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-emerald-500/20 rounded-2xl p-4 border border-emerald-400/30 backdrop-blur-md">
                                <div className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-1">Tax Exempt</div>
                                <div className="text-2xl font-bold text-white mb-1">{toINR(Math.round(calc.taxExempt))}</div>
                                <div className="text-[10px] text-emerald-100/70">Max Cap: {toINR(calc.limit)}</div>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                                <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Taxable Portion</div>
                                <div className="text-2xl font-bold text-white">{toINR(Math.round(calc.taxable))}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
