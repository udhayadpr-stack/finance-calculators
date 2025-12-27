
import { describe, it, expect } from 'vitest';
import { calculateSalary, STD_DED_NEW } from '../../src/utils/calculators/salary';

describe('Salary Calculator Logic', () => {

    it('Vector 1: Baseline New Regime (17L)', () => {
        // 17L CTC. 
        // Taxable ~ 14.96L (Gross 15.71L - 75k Std Ded).
        // Tax Calc: 
        // 0-3: 0
        // 3-7: 20k
        // 7-10: 30k
        // 10-12: 30k
        // 12-14.96: ~59k
        // Total Base: ~1.4L + Cess.
        const result = calculateSalary({ ctcInput: 1700000, regime: 'new' });
        expect(result.safeCtcInput).toBe(1700000);
        expect(result.taxNew).toBeGreaterThan(130000); // Corrected from 100000
        expect(result.taxNew).toBeLessThan(150000);    // Corrected from 120000
        expect(result.monthlyInHand).toBeGreaterThan(90000); // Adjusted lower bound
    });

    it('Vector 2: Rebate Limit New (7L)', () => {
        // 7L CTC. 
        // Taxable <= 7L. Tax 0.
        const result = calculateSalary({ ctcInput: 700000, regime: 'new' });
        expect(result.finalTax).toBe(0);
    });

    it('Vector 2b: Above Rebate Limit (12.5L)', () => {
        // 12.5L CTC. Taxable > 7L. Tax should apply.
        const result = calculateSalary({ ctcInput: 1250000, regime: 'new' });
        expect(result.finalTax).toBeGreaterThan(0);
    });

    it('Vector 4: Old Regime HRA', () => {
        // 12L CTC. Rent 20k/mo = 2.4L.
        // Basic ratio 40% = 4.8L.
        // HRA limit = 40% of 4.8L = 1.92L (Non-metro).
        // Rent - 10% Basic = 2.4L - 48k = 1.92L.
        // Exemption should be 1.92L (min of HRA(2.4L), Limit(1.92L), Excess(1.92L)).
        // Wait, HRA received is 50% basic = 2.4L.
        const result = calculateSalary({
            ctcInput: 1200000,
            regime: 'old',
            savers: { rent: 240000, sec80c: 0, sec80d: 0, nps: 0 }
        });

        expect(result.valBasic).toBeCloseTo(480000, -2); // Approx Check logic
        expect(result.rentExemption).toBeCloseTo(192000, -2);
    });

    it('Vector 6: Capped PF', () => {
        // 10L CTC. Basic 4L.
        // Actual PF: 12% of 4L = 48k.
        // Capped PF: 12% of 1.8L = 21.6k.
        // InHand should be higher with Capped PF.
        const normal = calculateSalary({ ctcInput: 1000000, config: { pfCapped: false } });
        const capped = calculateSalary({ ctcInput: 1000000, config: { pfCapped: true } });

        expect(capped.monthlyInHand).toBeGreaterThan(normal.monthlyInHand);
        expect(capped.valEePF).toBeLessThan(normal.valEePF); // 21600 vs 48000
    });

    it('Vector 8: Zero CTC', () => {
        const result = calculateSalary({ ctcInput: 0 });
        expect(result.monthlyInHand).toBe(0);
        expect(result.finalTax).toBe(0);
    });

    it('Vector 10: Std Deduction Limit', () => {
        // Gross 5L. New Regime.
        // Taxable = 5L - 75k = 4.25L.
        // Tax 0.
        const result = calculateSalary({ ctcInput: 500000, regime: 'new' });
        expect(result.finalTax).toBe(0);
    });

});
