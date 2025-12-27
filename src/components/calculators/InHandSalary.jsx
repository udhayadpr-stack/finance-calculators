import React, { useState, useMemo } from 'react';
import {
    Building2,
    RefreshCw, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Settings, MapPin, Info
} from 'lucide-react';
import { MoneyInput } from '../ui/MoneyInput';
import { toINR, parseMoney } from '../../utils/formatters';

// --- CONSTANTS: FY 2025-26 ---
const SLABS_NEW = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
];

const SLABS_OLD = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
];

// --- SUB COMPONENTS ---
const Row = ({ label, val, color }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">{label}</span>
        <span className={`font-mono font-medium ${color || 'text-gray-900'}`}>{val}</span>
    </div>
);

const SlipRow = ({ label, val, highlight }) => (
    <div className={`flex justify-between items-center px-5 py-3 ${highlight ? 'bg-indigo-50/20 text-indigo-900 font-medium' : 'text-gray-600'}`}>
        <span>{label}</span>
        <span className="font-mono">{toINR(val)}</span>
    </div>
);

const Bar = ({ height, color, val, label, txtColor }) => (
    <div className="flex-1 flex flex-col justify-end gap-2 group h-full">
        <span className={`opacity-100 font-mono text-[10px] sm:text-xs ${txtColor || 'text-gray-900'}`}>{val}</span>
        <div className={`w-full ${color} rounded-t-lg relative transition-all hover:brightness-110`} style={{ height }}></div>
        <span className="text-gray-400 uppercase text-[10px] tracking-wider">{label}</span>
    </div>
);

export default function InHandSalaryCalculator() {

    // --- STATE ---
    const [ctcInput, setCtcInput] = useState(1700000);
    const [regime, setRegime] = useState('new');

    // COMPONENT OVERRIDES
    const [overrides, setOverrides] = useState({});

    // Structure Config
    const [config, setConfig] = useState({
        basicRatio: 40,
        hraRatio: 50,
        pfCapped: false,
        metro: false,
        gratuityRate: 4.81,
        includeAdminCharges: true, // New Toggle
    });

    // Tax Savers
    const [savers, setSavers] = useState({
        rent: 0, sec80c: 150000, sec80d: 25000, nps: 0,
    });

    // One-offs
    const [oneOffs, setOneOffs] = useState({
        bonus: 0, insurance: 10000,
    });

    // UI State
    const [showExplanation, setShowExplanation] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // --- CALCULATION CORE ---
    const calc = useMemo(() => {
        // 1. Basis
        const safeCtcInput = parseMoney(ctcInput);

        // 2. Earnings Structure
        let valBasic = overrides.basic !== undefined ? parseMoney(overrides.basic) : safeCtcInput * (config.basicRatio / 100);
        let valHRA = overrides.hra !== undefined ? parseMoney(overrides.hra) : valBasic * (config.hraRatio / 100);
        let valBonus = parseMoney(oneOffs.bonus);
        let valInsurance = parseMoney(oneOffs.insurance);

        // 3. Ghost Components
        let pfBasis = config.pfCapped ? Math.min(valBasic, 180000) : valBasic;
        let valEmpPF = overrides.empPF !== undefined ? parseMoney(overrides.empPF) : pfBasis * 0.12;
        let valGratuity = valBasic * (config.gratuityRate / 100);
        // Conditional Admin Charges
        let valAdmin = config.includeAdminCharges ? valBasic * 0.0065 : 0;

        let ghostTotal = valEmpPF + valGratuity + valInsurance + valAdmin;

        // 4. Special Allowance
        let valSpecial = 0;
        if (overrides.special !== undefined) {
            valSpecial = parseMoney(overrides.special);
        } else {
            const potentialSpecial = safeCtcInput - (valBasic + valHRA + valBonus + ghostTotal);
            valSpecial = Math.max(0, potentialSpecial);
        }

        // 5. Reconciliation
        const reconciledCTC = valBasic + valHRA + valSpecial + valBonus + ghostTotal;
        const annualGross = valBasic + valHRA + valSpecial + valBonus;
        const ctcVariance = reconciledCTC - safeCtcInput;

        // 6. Deductions
        let valEePF = pfBasis * 0.12;
        let monthlyPT = overrides.pt !== undefined ? parseMoney(overrides.pt) : 208;
        let annualPT = monthlyPT * 12;

        // 7. Tax Calc
        let rentExemption = Math.max(0, Math.min(
            valHRA,
            config.metro ? valBasic * 0.5 : valBasic * 0.4,
            savers.rent > valBasic * 0.1 ? savers.rent - (valBasic * 0.1) : 0
        ));

        const stdDedNew = 75000;
        const stdDedOld = 50000;

        const taxableNew = Math.max(0, annualGross - stdDedNew);
        const taxableOld = Math.max(0, annualGross - stdDedOld - rentExemption - annualPT - savers.sec80c - savers.sec80d - savers.nps);

        const calculateTax = (income, r) => {
            let tax = 0;
            const slabs = r === 'new' ? SLABS_NEW : SLABS_OLD;
            let prevLimit = 0;
            for (let slab of slabs) {
                if (income > prevLimit) {
                    const amt = Math.min(income, slab.limit) - prevLimit;
                    tax += amt * slab.rate;
                    prevLimit = slab.limit;
                } else break;
            }
            if (r === 'new') {
                if (income <= 1200000) return 0;
                if (income > 1200000) {
                    const excess = income - 1200000;
                    if (tax > excess) tax = excess;
                }
            } else {
                if (income <= 500000) return 0;
            }
            return tax * 1.04;
        };

        const taxNew = calculateTax(taxableNew, 'new');
        const taxOld = calculateTax(taxableOld, 'old');
        const finalTax = regime === 'new' ? taxNew : taxOld;

        // 8. Monthly View
        const monthlyGross = (annualGross - valBonus) / 12;
        const monthlyPF = valEePF / 12;
        const monthlyTax = finalTax / 12;
        const monthlyInHand = monthlyGross - monthlyPF - monthlyPT - monthlyTax;

        const annualNet = annualGross - valEePF - annualPT - finalTax;

        return {
            reconciledCTC, ctcVariance, safeCtcInput,
            valBasic, valHRA, valSpecial, valBonus,
            ghostTotal, valEmpPF, valGratuity, annualGross, finalTax,
            monthlyGross, monthlyPF, monthlyPT, annualPT, monthlyTax, monthlyInHand,
            taxNew, taxOld, rentExemption, taxableNew, taxableOld,
            annualNet, valEePF,
            valAdmin
        };

    }, [ctcInput, config, overrides, savers, oneOffs, regime]);


    // --- HANDLERS ---
    const handleOverride = (key, val) => {
        setOverrides(prev => ({ ...prev, [key]: val }));
    };

    const toggleMode = (key) => {
        if (overrides[key] !== undefined) {
            const newO = { ...overrides };
            delete newO[key];
            setOverrides(newO);
        } else {
            let currVal = 0;
            if (key === 'basic') currVal = calc.valBasic;
            else if (key === 'hra') currVal = calc.valHRA;
            else if (key === 'special') currVal = calc.valSpecial;
            else if (key === 'pt') currVal = calc.monthlyPT;

            setOverrides(prev => ({ ...prev, [key]: currVal }));
        }
    };

    const handleReset = () => {
        setConfig({
            basicRatio: 40,
            hraRatio: 50,
            pfCapped: false,
            metro: false,
            gratuityRate: 4.81,
            includeAdminCharges: true,
        });
        setOverrides({});
        setOneOffs({ bonus: 0, insurance: 10000 });
        setSavers({ rent: 0, sec80c: 150000, sec80d: 25000, nps: 0 });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* --- LEFT: INPUTS --- */}
            <div className="lg:col-span-5 space-y-6">

                {/* 1. MASTER INPUT */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Annual CTC Input</label>
                        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                            <button onClick={() => setRegime('new')} className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${regime === 'new' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>New Regime</button>
                            <button onClick={() => setRegime('old')} className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${regime === 'old' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Old Regime</button>
                        </div>
                    </div>
                    <div className="relative mb-6">
                        <MoneyInput
                            value={ctcInput}
                            onChange={setCtcInput}
                            placeholder="0"
                            large
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setConfig(p => ({ ...p, pfCapped: false }))}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${!config.pfCapped ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                        >
                            Actual PF (12%)
                        </button>
                        <button
                            onClick={() => setConfig(p => ({ ...p, pfCapped: true }))}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${config.pfCapped ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                        >
                            Capped PF (₹1,800)
                        </button>
                    </div>
                </div>

                {/* WARNING: CTC VARIANCE */}
                {Math.abs(calc.ctcVariance) > 100 && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                        <div>
                            <strong className="block mb-1 font-bold uppercase tracking-wider text-[10px]">Mismatch Detected</strong>
                            {calc.ctcVariance > 0
                                ? `Your components exceed the input by ${toINR(calc.ctcVariance)}.`
                                : `Your components sum to ${toINR(Math.abs(calc.ctcVariance))} less than input.`}
                            <div className="mt-1 opacity-80">Calculations below use the sum: <strong>{toINR(calc.reconciledCTC)}</strong>.</div>
                        </div>
                    </div>
                )}

                {/* 2. STRUCTURE CONFIG */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-700">Earnings & Structure</h3>
                        <button onClick={handleReset} className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold uppercase tracking-wider">
                            <RefreshCw className="w-3 h-3" /> Reset All
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    <span>Basic Ratio: {config.basicRatio}%</span>
                                    {overrides.basic !== undefined && <span className="text-amber-600 bg-amber-50 px-2 rounded border border-amber-100">Manual Override</span>}
                                </div>
                                <input
                                    type="range"
                                    min="30" max="60"
                                    value={config.basicRatio}
                                    onChange={(e) => setConfig({ ...config, basicRatio: parseInt(e.target.value) })}
                                    disabled={overrides.basic !== undefined}
                                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${overrides.basic !== undefined ? 'bg-gray-100' : 'bg-gray-200 accent-indigo-600'}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <MoneyInput label="Basic Salary" value={calc.valBasic} onChange={(v) => handleOverride('basic', v)} isManual={overrides.basic !== undefined} onToggleMode={() => toggleMode('basic')} />

                                <div>
                                    <MoneyInput label="HRA" value={calc.valHRA} onChange={(v) => handleOverride('hra', v)} isManual={overrides.hra !== undefined} onToggleMode={() => toggleMode('hra')} />
                                    <button
                                        onClick={() => setConfig(p => ({ ...p, metro: !p.metro }))}
                                        className={`mt-2 w-full text-[10px] py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${config.metro ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <MapPin className="w-3 h-3" /> {config.metro ? "Metro (50%)" : "Non-Metro (40%)"}
                                    </button>
                                </div>

                                <MoneyInput label="Special Allow." value={calc.valSpecial} onChange={(v) => handleOverride('special', v)} isManual={overrides.special !== undefined} onToggleMode={() => toggleMode('special')} />
                                <MoneyInput label="Annual Bonus" value={oneOffs.bonus} onChange={(v) => setOneOffs({ ...oneOffs, bonus: v })} isManual={true} showToggle={false} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. DEDUCTIONS & ADVANCED */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between">
                        <h3 className="text-sm font-bold text-gray-700">Deductions & Benefits</h3>
                        <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                            <Settings className="w-3 h-3" /> Advanced
                        </button>
                    </div>

                    {showAdvanced && (
                        <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-3 text-xs flex gap-4 items-center animate-in slide-in-from-top-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
                                <input type="checkbox" checked={config.includeAdminCharges} onChange={(e) => setConfig({ ...config, includeAdminCharges: e.target.checked })} className="rounded text-indigo-600 focus:ring-0" />
                                Include PF Admin Charges (0.65%)
                            </label>
                        </div>
                    )}

                    <div className="p-6 grid grid-cols-2 gap-5">
                        <MoneyInput
                            label="Monthly PT"
                            value={calc.monthlyPT}
                            onChange={(v) => handleOverride('pt', v)}
                            isManual={overrides.pt !== undefined}
                            onToggleMode={() => toggleMode('pt')}
                            placeholder="208"
                        />
                        <MoneyInput label="Employer Ins." value={oneOffs.insurance} onChange={(v) => setOneOffs({ ...oneOffs, insurance: v })} isManual={true} showToggle={false} />

                        {regime === 'old' && (
                            <>
                                <div className="col-span-2 mt-4 pt-4 border-t border-gray-100 text-xs font-bold text-indigo-600 uppercase tracking-widest text-center">Old Regime Tax Savers</div>
                                <MoneyInput label="Rent Paid (Yr)" value={savers.rent} onChange={(v) => setSavers({ ...savers, rent: v })} isManual={true} showToggle={false} />
                                <MoneyInput label="80C (LIC/PPF)" value={savers.sec80c} onChange={(v) => setSavers({ ...savers, sec80c: v })} isManual={true} showToggle={false} />
                                <MoneyInput label="80D (Medical)" value={savers.sec80d} onChange={(v) => setSavers({ ...savers, sec80d: v })} isManual={true} showToggle={false} />
                                <MoneyInput label="NPS (80CCD1B)" value={savers.nps} onChange={(v) => setSavers({ ...savers, nps: v })} isManual={true} showToggle={false} />
                            </>
                        )}
                    </div>
                </div>

            </div>

            {/* --- RIGHT: OUTPUT --- */}
            <div className="lg:col-span-7 space-y-6">

                {/* 1. HERO CARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Monthly In-Hand</div>
                            <div className="text-4xl font-bold tracking-tight">{toINR(calc.monthlyInHand)}</div>
                            <div className="mt-6 flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-indigo-200/80 uppercase tracking-wider font-bold">
                                    <span>CTC Realization</span>
                                    <span>{calc.reconciledCTC > 0 ? Math.round((calc.annualNet / calc.reconciledCTC) * 100) : 0}%</span>
                                </div>
                                <div className="w-full bg-indigo-900/30 h-1.5 rounded-full overflow-hidden">
                                    <div style={{ width: `${calc.reconciledCTC > 0 ? (calc.annualNet / calc.reconciledCTC) * 100 : 0}%` }} className="h-full bg-indigo-300"></div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center gap-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Deductions</span>
                        </div>
                        <div className="space-y-3">
                            <Row label="Income Tax (Avg)" val={toINR(calc.monthlyTax)} color="text-red-500" />
                            <Row label="PF (Your Share)" val={toINR(calc.monthlyPF)} color="text-amber-600" />
                            <Row label="Professional Tax" val={toINR(calc.monthlyPT)} color="text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* 2. WATERFALL CHART */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-sm font-bold text-gray-800">Salary Waterfall</h3>
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">ANNUAL VIEW</span>
                    </div>
                    <div className="flex items-end h-40 gap-4 text-xs font-bold text-center">
                        <Bar height="100%" color="bg-gray-200" val={toINR(calc.reconciledCTC)} label="CTC" />
                        <div className="pb-8 text-gray-300"><ChevronDown className="w-4 h-4" /></div>
                        <Bar
                            height={`${calc.reconciledCTC > 0 ? (calc.annualNet / calc.reconciledCTC) * 100 : 0}%`}
                            color="bg-emerald-500"
                            val={toINR(calc.annualNet)}
                            label="Net Pay"
                            txtColor="text-emerald-600"
                        />
                        <Bar
                            height={`${calc.reconciledCTC > 0 ? (calc.finalTax / calc.reconciledCTC) * 100 : 0}%`}
                            color="bg-red-500"
                            val={toINR(calc.finalTax)}
                            label="Tax"
                            txtColor="text-red-500"
                        />
                        <Bar
                            height={`${calc.reconciledCTC > 0 ? ((calc.valEePF + calc.ghostTotal) / calc.reconciledCTC) * 100 : 0}%`}
                            color="bg-amber-500"
                            val={toINR(calc.valEePF + calc.ghostTotal)}
                            label="PF & Benefits"
                            txtColor="text-amber-500"
                        />
                    </div>
                </div>

                {/* 3. TAX EXPLANATION DRAWER */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
                            <HelpCircle className="w-4 h-4" />
                            Explain {regime === 'new' ? 'New' : 'Old'} Regime Tax
                        </div>
                        {showExplanation ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {showExplanation && (
                        <div className="p-6 bg-white border-t border-gray-200 space-y-4 text-sm animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                                <div>
                                    <span className="text-xs text-gray-500 block mb-1">Gross Salary (Annual)</span>
                                    <span className="font-bold">{toINR(calc.annualGross)}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block mb-1">Standard Deduction</span>
                                    <span className="font-bold text-emerald-600">-{toINR(regime === 'new' ? 75000 : 50000)}</span>
                                </div>

                                {/* Show PT deduction only if it applies */}
                                {calc.annualPT > 0 && (
                                    <div>
                                        <span className="text-xs text-gray-500 block mb-1">Professional Tax (Annual)</span>
                                        <span className="font-bold text-emerald-600">-{toINR(calc.annualPT)}</span>
                                    </div>
                                )}

                                {regime === 'old' && (
                                    <>
                                        <div>
                                            <span className="text-xs text-gray-500 block mb-1">HRA Exemption</span>
                                            <span className="font-bold text-emerald-600">-{toINR(calc.rentExemption)}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block mb-1">Sec 80C/80D/NPS</span>
                                            <span className="font-bold text-emerald-600">-{toINR(savers.sec80c + savers.sec80d + savers.nps)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-gray-700">Taxable Income</span>
                                <span className="font-mono font-bold text-lg text-gray-900">{toINR(regime === 'new' ? calc.taxableNew : calc.taxableOld)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700">Calculated Tax (inc. Cess)</span>
                                <span className="font-mono font-bold text-lg text-red-600">{toINR(calc.finalTax)}</span>
                            </div>
                            {regime === 'new' && calc.taxableNew <= 1200000 && (
                                <div className="bg-emerald-50 text-emerald-700 text-xs p-2 rounded mt-2 text-center font-bold">
                                    🎉 Zero Tax under New Regime (Income ≤ ₹12L)
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. PAYSLIP TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-gray-400" />
                            <div className="text-xs font-bold text-gray-700 uppercase tracking-widest">Monthly Payslip View</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Payable</div>
                            <div className="text-lg font-bold text-gray-900">{toINR(calc.monthlyInHand)}</div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row text-xs">
                        <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200">
                            <div className="bg-emerald-50/50 px-5 py-2 font-bold text-emerald-800 uppercase tracking-widest border-b border-emerald-100">Earnings</div>
                            <div className="divide-y divide-gray-50">
                                <SlipRow label="Basic Salary" val={calc.valBasic / 12} />
                                <SlipRow label="HRA" val={calc.valHRA / 12} />
                                <SlipRow label="Special Allowance" val={calc.valSpecial / 12} highlight />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="bg-red-50/50 px-5 py-2 font-bold text-red-800 uppercase tracking-widest border-b border-red-100">Deductions</div>
                            <div className="divide-y divide-gray-50">
                                <SlipRow label="PF Contribution" val={calc.monthlyPF} />
                                <SlipRow label="Professional Tax" val={calc.monthlyPT} />
                                <SlipRow label="Income Tax" val={calc.monthlyTax} highlight />
                            </div>
                        </div>
                    </div>
                    {calc.valBonus > 0 && (
                        <div className="bg-gray-50 border-t border-gray-200 p-3 text-xs flex justify-between text-gray-600">
                            <span className="font-bold flex items-center gap-2"><Info className="w-3 h-3" /> Annual Bonus Excluded</span>
                            <span className="font-mono">{toINR(calc.valBonus)} / year</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
