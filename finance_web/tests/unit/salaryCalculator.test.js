import { describe, it, expect } from 'vitest';
import { calculateSalary } from '../../src/utils/calculators/salary';

describe('Salary reconciliation', () => {
    it('reconciles the UI default structure and current slab arithmetic', () => {
        const r = calculateSalary({ctcInput: 1700000});
        expect(r.valBasic).toBe(680000);
        expect(r.annualGross).toBe(1571272);
        expect(r.taxNew).toBeCloseTo(108618.432, 3);
        expect(r.ctcVariance).toBe(0);
        expect(r.annualNet + r.valEePF + r.annualPT + r.finalTax + r.ghostTotal).toBeCloseTo(1700000, 4);
    });
    it.each([0, 700000, 1250000])('has no new-regime tax for %s CTC under default structure', ctcInput => expect(calculateSalary({ctcInput}).finalTax).toBe(0));
    it('returns an entirely empty estimate for empty CTC', () => {
        const r = calculateSalary({ctcInput: 0});
        for (const value of Object.values(r)) if (typeof value === 'number') expect(value).toBe(0);
    });
    it('applies non-metro HRA exemption from actual rent', () => {
        const r = calculateSalary({ctcInput: 1200000, regime: 'old', savers: {rent: 240000, sec80c: 0, sec80d: 0}});
        expect(r.valBasic).toBe(480000);
        expect(r.rentExemption).toBe(192000);
        expect(r.chap6A).toBe(r.valEePF);
    });
    it('includes EPF once in 80C and caps deductions', () => {
        const r = calculateSalary({ctcInput: 2000000, savers: {sec80c: '999999', sec80d: '999999', nps: '999999'}});
        expect(r.chap6A).toBe(300000);
        expect(Number.isFinite(r.taxOld)).toBe(true);
    });
    it('increases take-home when PF is capped', () => {
        const normal = calculateSalary({ctcInput: 1000000});
        const capped = calculateSalary({ctcInput: 1000000, config: {pfCapped: true}});
        expect(capped.valEePF).toBe(21600);
        expect(capped.monthlyInHand).toBeGreaterThan(normal.monthlyInHand);
    });
    it('reconciles annual bonus with regular monthly net', () => {
        const r = calculateSalary({ctcInput: 2000000, oneOffs: {bonus: 100000}});
        expect(r.monthlyInHand * 12 + r.valBonus).toBeCloseTo(r.annualNet, 4);
    });
    it('reports overallocated manual components instead of hiding the mismatch', () => {
        const r = calculateSalary({ctcInput: 100000, overrides: {basic: 200000}});
        expect(r.ctcVariance).toBeGreaterThan(0);
        expect(r.valSpecial).toBe(0);
    });
    it.each([NaN, Infinity, -1])('rejects invalid CTC %s', ctcInput => expect(calculateSalary({ctcInput}).error).toBeTruthy());
});
