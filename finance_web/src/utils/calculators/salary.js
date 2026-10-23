import { numberInRange } from './validation';

// Resident individuals below 60, ordinary salary income, FY 2025-26 / AY 2026-27.
export const SLABS_NEW = [
    { limit: 400000, rate: 0 }, { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 }, { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 }, { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
];
export const SLABS_OLD = [
    { limit: 250000, rate: 0 }, { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 },
];
export const STD_DED_NEW = 75000;
export const STD_DED_OLD = 50000;

function slabTax(income, regime) {
    let previous = 0;
    return (regime === 'new' ? SLABS_NEW : SLABS_OLD).reduce((tax, slab) => {
        const amount = Math.max(0, Math.min(income, slab.limit) - previous);
        previous = slab.limit;
        return tax + amount * slab.rate;
    }, 0);
}

const surchargeRate = (income, regime) => income > 50000000 && regime === 'old' ? 0.37
    : income > 20000000 ? 0.25 : income > 10000000 ? 0.15 : income > 5000000 ? 0.10 : 0;

export function calculateTaxDetails(income, regime = 'new') {
    const taxable = numberInRange(income, 'Taxable income');
    if (!['new', 'old'].includes(regime)) throw new RangeError('Select a valid tax regime.');
    const baseTax = slabTax(taxable, regime);
    const rebate = taxable <= (regime === 'new' ? 1200000 : 500000) ? baseTax : 0;
    const marginalRelief = regime === 'new' && taxable > 1200000
        ? Math.max(0, baseTax - (taxable - 1200000)) : 0;
    const afterRebate = baseTax - rebate - marginalRelief;
    const surcharge = afterRebate * surchargeRate(taxable, regime);
    let surchargeRelief = 0;
    const thresholds = regime === 'new' ? [5000000, 10000000, 20000000] : [5000000, 10000000, 20000000, 50000000];
    const threshold = thresholds.filter(limit => taxable > limit).at(-1);
    if (threshold) {
        const atThreshold = slabTax(threshold, regime) * (1 + surchargeRate(threshold, regime));
        surchargeRelief = Math.max(0, afterRebate + surcharge - atThreshold - (taxable - threshold));
    }
    const beforeCess = afterRebate + surcharge - surchargeRelief;
    const cess = beforeCess * 0.04;
    return { baseTax, rebate, marginalRelief, surcharge, surchargeRelief, cess, total: beforeCess + cess };
}
export const calculateTax = (income, regime = 'new') => calculateTaxDetails(income, regime).total;

const empty = Object.fromEntries([
    'reconciledCTC', 'ctcVariance', 'safeCtcInput', 'valBasic', 'valHRA', 'valSpecial', 'valBonus',
    'ghostTotal', 'valEmpPF', 'valGratuity', 'valInsurance', 'annualGross', 'finalTax', 'monthlyGross',
    'monthlyPF', 'monthlyPT', 'annualPT', 'monthlyTax', 'monthlyInHand', 'taxNew', 'taxOld',
    'rentExemption', 'taxableNew', 'taxableOld', 'annualNet', 'valEePF', 'valAdmin', 'chap6A',
].map(key => [key, 0]));

export const calculateSalary = ({ ctcInput, regime = 'new', config = {}, overrides = {}, oneOffs = {}, savers = {} } = {}) => {
    try {
        if (!['new', 'old'].includes(regime)) throw new RangeError('Select a valid tax regime.');
        const ctc = numberInRange(ctcInput, 'CTC');
        if (!ctc) return { ...empty, taxDetails: calculateTaxDetails(0, regime) };
        const basicRatio = numberInRange(config.basicRatio ?? 40, 'Basic ratio', 0, 100);
        const hraRatio = numberInRange(config.hraRatio ?? 50, 'HRA ratio', 0, 100);
        const gratuityRate = numberInRange(config.gratuityRate ?? 4.81, 'Gratuity provision rate', 0, 100);
        const valBasic = numberInRange(overrides.basic ?? ctc * basicRatio / 100, 'Basic salary');
        const valHRA = numberInRange(overrides.hra ?? valBasic * hraRatio / 100, 'HRA');
        const valBonus = numberInRange(oneOffs.bonus ?? 0, 'Bonus');
        const valInsurance = numberInRange(oneOffs.insurance ?? 10000, 'Insurance');
        const monthlyPFCap = numberInRange(config.pfWageCap ?? 15000, 'PF monthly wage cap');
        const pfBasis = config.pfCapped ? Math.min(valBasic, monthlyPFCap * 12) : valBasic;
        const valEmpPF = numberInRange(overrides.empPF ?? pfBasis * 0.12, 'Employer PF');
        const valEePF = pfBasis * 0.12;
        const valGratuity = valBasic * gratuityRate / 100;
        // Employer-specific CTC provision, not a statutory deduction from employee wages.
        const adminRate = numberInRange(config.adminRate ?? 0.65, 'Employer overhead provision rate', 0, 100);
        const valAdmin = config.includeAdminCharges === false ? 0 : valBasic * adminRate / 100;
        const ghostTotal = valEmpPF + valGratuity + valInsurance + valAdmin;
        const valSpecial = numberInRange(overrides.special ?? Math.max(0, ctc - valBasic - valHRA - valBonus - ghostTotal), 'Special allowance');
        const annualGross = valBasic + valHRA + valSpecial + valBonus;
        const reconciledCTC = annualGross + ghostTotal;
        const monthlyPT = numberInRange(overrides.pt ?? (annualGross > 0 ? 208 : 0), 'Monthly professional tax', 0, 2500 / 12);
        const annualPT = monthlyPT * 12;
        const rent = numberInRange(savers.rent ?? 0, 'Annual rent');
        const rentExemption = Math.max(0, Math.min(valHRA, valBasic * (config.metro ? 0.5 : 0.4), rent - valBasic * 0.1));
        // 80C is the total eligible amount INCLUDING employee EPF; do not count EPF twice.
        const sec80c = Math.min(150000, Math.max(valEePF, numberInRange(savers.sec80c ?? 150000, '80C amount')));
        // 80D input is the eligible aggregate after the user's applicable family/age sublimits.
        const sec80d = Math.min(100000, numberInRange(savers.sec80d ?? 25000, 'Eligible 80D amount'));
        const nps = Math.min(50000, numberInRange(savers.nps ?? 0, 'Additional NPS deduction'));
        const chap6A = sec80c + sec80d + nps;
        const taxableNew = Math.max(0, annualGross - STD_DED_NEW);
        const taxableOld = Math.max(0, annualGross - STD_DED_OLD - rentExemption - annualPT - chap6A);
        const detailsNew = calculateTaxDetails(taxableNew, 'new');
        const detailsOld = calculateTaxDetails(taxableOld, 'old');
        const taxDetails = regime === 'new' ? detailsNew : detailsOld;
        const finalTax = taxDetails.total;
        const monthlyGross = (annualGross - valBonus) / 12;
        const monthlyPF = valEePF / 12;
        const monthlyTax = finalTax / 12;
        return { reconciledCTC, ctcVariance: reconciledCTC - ctc, safeCtcInput: ctc,
            valBasic, valHRA, valSpecial, valBonus, valInsurance, ghostTotal, valEmpPF, valGratuity,
            annualGross, finalTax, monthlyGross, monthlyPF, monthlyPT, annualPT, monthlyTax,
            monthlyInHand: monthlyGross - monthlyPF - monthlyPT - monthlyTax,
            taxNew: detailsNew.total, taxOld: detailsOld.total, taxDetails, rentExemption,
            taxableNew, taxableOld, annualNet: annualGross - valEePF - annualPT - finalTax,
            valEePF, valAdmin, chap6A };
    } catch (error) {
        return { ...empty, taxDetails: calculateTaxDetails(0, regime === 'old' ? 'old' : 'new'), error: error.message };
    }
};
