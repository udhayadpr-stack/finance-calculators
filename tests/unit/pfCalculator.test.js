import { describe, it, expect } from 'vitest';
import { calculatePF } from '../../src/utils/calculators/pf';

describe('PF Calculator Logic', () => {
    // defaults
    const defaults = {
        basicPay: 50000,
        currentAge: 25,
        retirementAge: 58,
        currentBalance: 100000,
        interestRate: 8.25,
        annualIncrement: 5,
        employeeContrRatio: 12,
        employerContrRatio: 12
    };

    it('Vector 1: Baseline (50k, 25yr, 58yr, 1L, 8.25%, 5%)', () => {
        const result = calculatePF(defaults);
        // Expecting ~4.14 Cr
        expect(result.totalCorpus).toBeGreaterThan(40000000);
        expect(result.totalCorpus).toBeLessThan(42000000);
        // Precise check can be added once we have the exact number from referenced implementation
    });

    it('Vector 2: Low Basic (<15k)', () => {
        const result = calculatePF({
            ...defaults,
            basicPay: 10000,
            annualIncrement: 0,
            currentBalance: 0
        });
        // 10k basic -> emp: 1200, er: 1200. Total 2400/mo.
        // EPS: 8.33% of 10k = 833. EPF Er = 367. Total Add: 1567.
        // FV(8.25%/12, 396, -1567, 0) approx 3.2M
        expect(result.totalCorpus).toBeGreaterThan(3100000);
        expect(result.totalCorpus).toBeLessThan(3300000);
    });

    it('Vector 3: No Increment', () => {
        const result = calculatePF({
            ...defaults,
            currentBalance: 0,
            annualIncrement: 0
        });
        // ~2.21 Cr (EPS deduction makes it lower than raw 24% contribution)
        expect(result.totalCorpus).toBeGreaterThan(22000000);
        expect(result.totalCorpus).toBeLessThan(22500000);
    });

    it('Vector 4: Short Term (1yr)', () => {
        const result = calculatePF({
            ...defaults,
            currentAge: 57,
            retirementAge: 58,
            annualIncrement: 0
        });
        // Approx 2.43 L
        expect(result.breakdown.length).toBe(1);
        expect(result.totalCorpus).toBeGreaterThan(240000);
    });

    it('Vector 5: Zero Balance', () => {
        const result = calculatePF({
            ...defaults,
            currentBalance: 0
        });
        // ~3.99 Cr
        expect(result.totalCorpus).toBeGreaterThan(39000000);
    });

    it('Vector 9: Same Age (0mo)', () => {
        const result = calculatePF({
            ...defaults,
            currentAge: 25,
            retirementAge: 25
        });
        expect(result.totalCorpus).toBe(100000); // Just returns balance
        expect(result.breakdown.length).toBe(0);
    });

    // Validating Input Handling
    it('Handles String Inputs Gracefully', () => {
        const result = calculatePF({
            ...defaults,
            basicPay: "50000",
            currentAge: "25"
        });
        expect(result.totalCorpus).not.toBeNaN();
    });
});
