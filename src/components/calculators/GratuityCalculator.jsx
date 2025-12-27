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

        // Limits: 25L for Govt (effective Jan 2024), 20L for Private (as of now)
        const TAX_FREE_LIMIT = isGovt ? 2500000 : 2000000;

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
        <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* INPUTS */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <Award className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Gratuity Calculator</h2>
                    </div>

                    {/* Employee Type Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button onClick={() => setIsGovt(false)} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${!isGovt ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Private Sector</button>
                        <button onClick={() => setIsGovt(true)} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${isGovt ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Govt. Employee</button>
                    </div>

                    <div className="space-y-4">
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
                        <p className="text-[10px] text-gray-400">
                            Code on Wages (Active Nov 2025): If Basic+DA is less than 50% of CTC, calculations use 50% of CTC.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Years of Service</label>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{years} Years</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="50"
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            {!calc.eligible && (
                                <div className="mt-2 text-xs text-amber-600 font-bold flex items-center gap-1.5 bg-amber-50 p-2 rounded-lg">
                                    <Info className="w-3 h-3" />
                                    Min. 5 years required for eligibility
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* OUTPUT */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimation</span>
                    </div>

                    <div className="mb-8">
                        <div className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
                            {toINR(Math.round(calc.payable))}
                        </div>
                        <div className="text-sm font-medium text-gray-500">Total Gratuity Payable</div>
                    </div>

                    {calc.isWageIncreased && (
                        <div className="mb-6 bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-xs text-indigo-800 flex items-start gap-2">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <strong>Impact of New Wage Code:</strong><br />
                                Your Basic+DA was less than 50% of CTC. Calculation used <strong>{toINR(calc.wageBasis)}</strong> (50% of CTC) as the base.
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">Tax Exempt</div>
                            <div className="text-xl font-bold text-emerald-700">{toINR(Math.round(calc.taxExempt))}</div>
                            <div className="text-[10px] text-emerald-600 mt-1 opacity-80 max-w-[150px]">Up to {toINR(calc.limit)} is tax-free.</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Taxable Portion</div>
                            <div className="text-xl font-bold text-gray-700">{toINR(Math.round(calc.taxable))}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
