import { parseMoney } from '../../utils/formatters.js';

// --- CONSTANTS ---
export const SLABS_NEW = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
];

export const SLABS_OLD = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
];

export const STD_DED_NEW = 75000;
export const STD_DED_OLD = 50000;

export const calculateTax = (income, regime) => {
    let tax = 0;
    const slabs = regime === 'new' ? SLABS_NEW : SLABS_OLD;
    let prevLimit = 0;

    for (let slab of slabs) {
        if (income > prevLimit) {
            const amt = Math.min(income, slab.limit) - prevLimit;
            tax += amt * slab.rate;
            prevLimit = slab.limit;
        } else break;
    }

    // Rebate u/s 87A
    // New Regime (FY 25-26): Taxable income <= 12L -> Nullify Tax
    // Note: Marginal relief is not implemented in this MVP but 12L is the hard cutoff for rebate eligibility.
    if (regime === 'new') {
        if (income <= 1200000) return 0;
    }
    // Old Regime: Taxable income <= 5L -> Nullify Tax
    else {
        if (income <= 500000) return 0;
    }

    // Health & Education Cess: 4%
    return tax * 1.04;
};

export const calculateSalary = ({
    ctcInput,
    regime = 'new',
    config = {},
    overrides = {},
    oneOffs = {},
    savers = {}
}) => {
    // Defaults
    const conf = {
        basicRatio: 50,
        hraRatio: 50,
        pfCapped: false,
        metro: false,
        gratuityRate: 4.81,
        includeAdminCharges: true,
        ...config
    };

    const one = {
        bonus: 0,
        insurance: 10000,
        ...oneOffs
    };

    const save = {
        rent: 0,
        sec80c: 150000,
        sec80d: 25000,
        nps: 0,
        ...savers
    };

    // 1. Basis
    const safeCtcInput = Number(ctcInput) || 0;

    // 2. Earnings Structure
    let valBasic = overrides.basic !== undefined ? Number(overrides.basic) : safeCtcInput * (conf.basicRatio / 100);
    let valHRA = overrides.hra !== undefined ? Number(overrides.hra) : valBasic * (conf.hraRatio / 100);
    let valBonus = Number(one.bonus);
    let valInsurance = Number(one.insurance);

    // 3. Ghost Components (Employer Side)
    // PF Limit: 12% of 15000 = 1800/mo = 21600/yr
    let pfBasis = conf.pfCapped ? Math.min(valBasic, 180000) : valBasic; // 15k * 12 = 1.8L
    let valEmpPF = overrides.empPF !== undefined ? Number(overrides.empPF) : pfBasis * 0.12;
    let valGratuity = valBasic * (conf.gratuityRate / 100);
    let valAdmin = conf.includeAdminCharges ? valBasic * 0.0065 : 0;

    // Ghost Total is what the company deducts from CTC but doesn't pay you directly
    let ghostTotal = valEmpPF + valGratuity + valInsurance + valAdmin;

    // 4. Special Allowance (Balancing Figure)
    let valSpecial = 0;
    if (overrides.special !== undefined) {
        valSpecial = Number(overrides.special);
    } else {
        const potentialSpecial = safeCtcInput - (valBasic + valHRA + valBonus + ghostTotal);
        valSpecial = Math.max(0, potentialSpecial);
    }

    // 5. Reconciliation
    const reconciledCTC = valBasic + valHRA + valSpecial + valBonus + ghostTotal;
    const annualGross = valBasic + valHRA + valSpecial + valBonus;
    const ctcVariance = reconciledCTC - safeCtcInput;

    // 6. Deductions (Employee Side)
    // Employee PF usually matches Employer PF unless VPF is present (ignoring VPF for now)
    let valEePF = pfBasis * 0.12;
    let monthlyPT = 0;
    if (overrides.pt !== undefined) {
        monthlyPT = Number(overrides.pt);
    } else {
        // Simple heuristic: If earning > 0, assume standard PT 208 (~2500/yr).
        // Real logic depends on State.
        monthlyPT = annualGross > 0 ? 208 : 0;
    }
    let annualPT = monthlyPT * 12;

    // 7. Tax Calc
    // HRA Exemption (Old Regime Only)
    // Min of:
    // 1. Actual HRA
    // 2. 50% Basic (Metro) or 40% Basic (Non-Metro)
    // 3. Rent Paid - 10% Basic
    let rentInExcess = Math.max(0, save.rent - (valBasic * 0.1));
    let hraLimit = conf.metro ? valBasic * 0.5 : valBasic * 0.4;
    let rentExemption = Math.max(0, Math.min(
        valHRA,
        hraLimit,
        rentInExcess
    ));

    const taxableNew = Math.max(0, annualGross - STD_DED_NEW);

    // Deductions under Chapter VI-A (Old Regime)
    const chap6A = save.sec80c + save.sec80d + save.nps;
    const taxableOld = Math.max(0, annualGross - STD_DED_OLD - rentExemption - annualPT - chap6A);

    const taxNew = calculateTax(taxableNew, 'new');
    const taxOld = calculateTax(taxableOld, 'old');
    const finalTax = regime === 'new' ? taxNew : taxOld;

    // 8. Monthly View
    const monthlyGross = (annualGross - valBonus) / 12;
    // Monthly PF
    const monthlyPF = valEePF / 12;
    const monthlyTax = finalTax / 12;

    const monthlyInHand = monthlyGross - monthlyPF - monthlyPT - monthlyTax;

    const annualNet = annualGross - valEePF - annualPT - finalTax;

    return {
        reconciledCTC,
        ctcVariance,
        safeCtcInput,
        valBasic,
        valHRA,
        valSpecial,
        valBonus,
        ghostTotal,
        valEmpPF,
        valGratuity,
        annualGross,
        finalTax,
        monthlyGross,
        monthlyPF,
        monthlyPT,
        annualPT,
        monthlyTax,
        monthlyInHand,
        taxNew,
        taxOld,
        rentExemption,
        taxableNew,
        taxableOld,
        annualNet,
        valEePF,
        valAdmin
    };
};
