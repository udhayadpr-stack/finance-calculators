import { describe, it, expect } from 'vitest';
import { calculateForeclosure } from '../../src/utils/calculators/foreclosure';

describe('Foreclosure Calculator Logic', () => {

    it('Vector 1: Baseline (20L, 9%, 60m, 0%)', () => {
        // P=20L, r=0.75% pm. n=60.
        // EMI ~ 41517.
        // Total = 41517 * 60 = 24.91L
        // Foreclose = 20L + 0.
        // Savings = 4.91L.
        const result = calculateForeclosure({
            outstandingPrincipal: 2000000,
            interestRate: 9,
            remainingTenure: 60,
            foreclosureChargesPercent: 0
        });
        expect(Math.round(result.netSavings)).toBeGreaterThan(490000);
        expect(Math.round(result.netSavings)).toBeLessThan(492000);
        expect(result.penalty).toBe(0);
    });

    it('Vector 2: High Penalty (10L, 8%, 12m, 5%)', () => {
        // P=10L, r=8%, n=12.
        // EMI ~ 86988.
        // Total = 10,43,861.
        // Foreclose = 10L + 50k = 10.5L.
        // Savings = 10.43 - 10.5 = -6139 approx.
        const result = calculateForeclosure({
            outstandingPrincipal: 1000000,
            interestRate: 8,
            remainingTenure: 12,
            foreclosureChargesPercent: 5
        });
        expect(Math.round(result.netSavings)).toBeLessThan(0);
    });

    it('Vector 6: Zero Rate (1L, 0%, 12m, 2%)', () => {
        // P=1L, Int=0. Total=1L.
        // Foreclose = 1L + 2k.
        // Savings = 1L - 1.02L = -2000.
        const result = calculateForeclosure({
            outstandingPrincipal: 100000,
            interestRate: 0,
            remainingTenure: 12,
            foreclosureChargesPercent: 2
        });
        expect(result.netSavings).toBe(-2000);
        expect(result.emi).toBeCloseTo(8333.33, 1);
    });

    it('Vector 5: Zero Months (Invalid)', () => {
        const result = calculateForeclosure({
            outstandingPrincipal: 100000,
            interestRate: 10,
            remainingTenure: 0,
            foreclosureChargesPercent: 0
        });
        expect(result.netSavings).toBe(0);
        expect(result.foreclosureCost).toBe(100000); // Immediate payment
    });
});
