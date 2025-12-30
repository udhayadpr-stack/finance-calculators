import { describe, it, expect } from 'vitest';
import { calculateSalary, calculateTax, STD_DED_NEW } from './salary';

describe('Salary Calculator Logic (FY 25-26)', () => {

    it('should apply Standard Deduction of 75,000 for New Regime', () => {
        expect(STD_DED_NEW).toBe(75000);
    });

    describe('Tax Calculation (New Regime)', () => {
        it('should have 0 tax for income <= 3L', () => {
            expect(calculateTax(300000, 'new')).toBe(0);
        });

        it('should apply 5% slab for income 3L-7L', () => {
            // 4L income: 3L nil, 1L @ 5% = 5000 + Cess
            // However, 87A rebate applies for taxable income <= 7L.
            // So effective tax should be 0.
            expect(calculateTax(400000, 'new')).toBe(0);
        });

        it('should apply 87A rebate for taxable income exactly 7L', () => {
            // Taxable 7L implies Gross ~7.75L
            expect(calculateTax(700000, 'new')).toBe(0);
        });

        it('should apply slabs correctly for income > 7L', () => {
            // Taxable: 9,00,000
            // 0-3L: 0
            // 3-7L: 4L * 5% = 20,000
            // 7-9L: 2L * 10% = 20,000
            // Total Tax: 40,000
            // Cess 4%: 1,600
            // Final: 41,600
            expect(calculateTax(900000, 'new')).toBe(41600);
        });

        it('should apply 30% slab for income > 15L', () => {
            // Taxable: 16,00,000
            // 0-3L: 0
            // 3-7L: 4L * 5% = 20,000
            // 7-10L: 3L * 10% = 30,000
            // 10-12L: 2L * 15% = 30,000
            // 12-15L: 3L * 20% = 60,000
            // 15-16L: 1L * 30% = 30,000
            // Total: 1,70,000
            // Cess: 6,800
            // Final: 1,76,800
            expect(calculateTax(1600000, 'new')).toBe(176800);
        });
    });

    describe('Full Salary Calculation', () => {
        it('should calculate monthly in-hand correctly', () => {
            // Mock Input: 12L CTC
            const result = calculateSalary({ ctcInput: 1200000 });
            expect(result.annualGross).toBeGreaterThan(0);
            expect(result.monthlyInHand).toBeLessThan(result.monthlyGross);
        });
    });
});
