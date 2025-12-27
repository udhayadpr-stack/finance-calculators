import { describe, it, expect } from 'vitest';
import { calculateGratuity } from '../../src/utils/calculators/gratuity';

describe('Gratuity Calculator Logic', () => {
    const defaults = {
        basicPay: 40000,
        totalCTC: 100000,
        years: 5,
        isGovt: false
    };

    it('Vector 1: Baseline (Private)', () => {
        const result = calculateGratuity(defaults);
        // Wage = max(40k, 50k) = 50k
        // G = 50k * 15 * 5 / 26 = 144230.77
        expect(Math.round(result.payable)).toBe(144231);
        expect(result.isWageIncreased).toBe(true);
        expect(result.taxExempt).toBe(result.payable);
    });

    it('Vector 2: Govt Employee', () => {
        const result = calculateGratuity({
            basicPay: 50000,
            totalCTC: 80000,
            years: 20,
            isGovt: true
        });
        // Wage = max(50k, 40k) = 50k
        // G = 50k * 15 * 20 / 26 = 576923.07
        expect(Math.round(result.payable)).toBe(576923);
        expect(result.taxExempt).toBe(result.payable); // Full exemption
    });

    it('Vector 3: Low Tenure (<5)', () => {
        const result = calculateGratuity({
            ...defaults,
            years: 4
        });
        expect(result.payable).toBe(0);
        expect(result.eligible).toBe(false);
    });

    it('Vector 4: High Wage (No Shift)', () => {
        const result = calculateGratuity({
            basicPay: 60000,
            totalCTC: 100000,
            years: 10,
            isGovt: false
        });
        // Wage = max(60k, 50k) = 60k
        // G = 60k * 15 * 10 / 26 = 346153.84
        expect(Math.round(result.payable)).toBe(346154);
        expect(result.isWageIncreased).toBe(false);
    });

    it('Vector 5: Tax Limit Hit', () => {
        const result = calculateGratuity({
            basicPay: 200000,
            totalCTC: 400000,
            years: 30,
            isGovt: false
        });
        // Wage = 200k (200k vs 200k)
        // G = 200k * 15 * 30 / 26 = 34,61,538.46
        const expectedGratuity = 3461538;
        expect(Math.round(result.payable)).toBe(expectedGratuity);
        expect(result.taxExempt).toBe(2000000);
        expect(Math.round(result.taxable)).toBe(expectedGratuity - 2000000);
    });

    it('Vector 7: Fixed Term Employment (2 Years)', () => {
        const result = calculateGratuity({
            basicPay: 50000,
            totalCTC: 100000,
            years: 2,
            isGovt: false,
            isFixedTerm: true
        });
        // Logic: Valid due to Fixed Term.
        // G = 50k * 15 * 2 / 26 = 57692.
        expect(result.eligible).toBe(true);
        expect(Math.round(result.payable)).toBe(57692);
    });

    it('Vector 6: Exact 5 Years', () => {
        const result = calculateGratuity({
            basicPay: 26000,
            totalCTC: 50000,
            years: 5,
            isGovt: false
        });
        // Wage = max(26k, 25k) = 26k
        // G = 26k * 15 * 5 / 26 = 75000
        expect(result.payable).toBe(75000);
        expect(result.eligible).toBe(true);
    });

    it('Vector 8: Zero CTC (Invalid input handling)', () => {
        const result = calculateGratuity({
            basicPay: 20000,
            totalCTC: 0,
            years: 10,
            isGovt: false
        });
        // Wage = max(20k, 0) = 20k
        // G = 20k * 15 * 10 / 26 = 115384.61
        expect(Math.round(result.payable)).toBe(115385);
    });
});
