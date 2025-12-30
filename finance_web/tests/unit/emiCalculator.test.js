import { describe, it, expect } from 'vitest';
import { calculateEMI } from '../../src/utils/calculators/emi';

describe('EMI Calculator Logic', () => {

    it('Vector 1: Baseline (50L, 8.5%, 20y)', () => {
        const result = calculateEMI({ loanAmount: 5000000, interestRate: 8.5, tenureYears: 20 });
        // Expected EMI ~ 43391
        expect(Math.round(result.emi)).toBe(43391);
        expect(result.schedule.length).toBe(20);
        expect(Math.round(result.schedule[19].balance)).toBe(0);
    });

    it('Vector 2: Short Tenure (1L, 10%, 1y)', () => {
        const result = calculateEMI({ loanAmount: 100000, interestRate: 10, tenureYears: 1 });
        // EMI = 100000 * (10/1200) * (1.00833)^12 / ...
        // ~ 8791.5
        expect(Math.round(result.emi)).toBe(8792);
        expect(Math.round(result.totalInterest)).toBe(5499);
    });

    it('Vector 3: Zero Interest (1L, 0%, 1y)', () => {
        const result = calculateEMI({ loanAmount: 100000, interestRate: 0, tenureYears: 1 });
        // EMI = 100000 / 12 = 8333.33
        expect(result.emi).toBeCloseTo(8333.33, 1);
        expect(result.totalInterest).toBe(0);
    });

    it('Vector 7: Zero Tenure', () => {
        const result = calculateEMI({ loanAmount: 100000, interestRate: 10, tenureYears: 0 });
        expect(result.emi).toBe(0);
    });

    it('Vector 6: Zero Principal', () => {
        const result = calculateEMI({ loanAmount: 0, interestRate: 10, tenureYears: 5 });
        expect(result.emi).toBe(0);
        expect(result.totalAmount).toBe(0);
    });

    it('Vector 4: High Rate (1L, 24%, 3y)', () => {
        // 3 years = 36 months.
        const result = calculateEMI({ loanAmount: 100000, interestRate: 24, tenureYears: 3 });
        // r = 2% per month.
        // EMI = 100000 * 0.02 * (1.02)^36 / ((1.02)^36 - 1)
        // (1.02)^36 ~ 2.0399
        // EMI ~ 100000 * 0.02 * 2.0399 / 1.0399 ~ 2000 * 1.9616 ~ 3923.
        expect(Math.round(result.emi)).toBe(3923);
    });
});
