import { describe, it, expect } from 'vitest';
import { calculatePF } from '../../src/utils/calculators/pf';

const defaults = {basicPay: 50000, currentAge: 25, retirementAge: 26, currentBalance: 100000, interestRate: 8.25, annualIncrement: 0, employeeContrRatio: 12, employerContrRatio: 12, startYear: 2026, startMonth: 4};
describe('EPF annual credit model', () => {
    it('credits opening balances for 12 months and deposits for 11+10+...+0 months', () => {
        const r = calculatePF(defaults);
        const interest = 100000 * .0825 + 10750 * 66 * .0825 / 12;
        expect(r.totalInterest).toBeCloseTo(interest, 6);
        expect(r.totalCorpus).toBeCloseTo(100000 + 129000 + interest, 6);
        expect(r.employeeShare).toBe(72000);
        expect(r.employerShare).toBe(57000);
        expect(r.epsContribution).toBe(15000);
        expect(r.breakdown[0]).toMatchObject({age: 26, year: 2027, month: 3});
    });
    it('compounds interest only after financial year end', () => {
        const r = calculatePF({...defaults, basicPay: 0, retirementAge: 27});
        expect(r.totalCorpus).toBeCloseTo(100000 * 1.0825 ** 2, 6);
    });
    it('handles a mid-year start and partial final year', () => {
        const r = calculatePF({...defaults, startMonth: 10});
        const firstInterest = 100000 * .0825 / 2 + 10750 * 15 * .0825 / 12;
        const marchBalance = 100000 + 64500 + firstInterest;
        const lastInterest = marchBalance * .0825 / 2 + 10750 * 15 * .0825 / 12;
        expect(r.totalCorpus).toBeCloseTo(marchBalance + 64500 + lastInterest, 5);
        expect(r.breakdown.map(x => x.month)).toEqual([3, 9]);
    });
    it('keeps opening balance distinct when there are no projection months', () => {
        const r = calculatePF({...defaults, retirementAge: 25});
        expect(r.totalCorpus).toBe(100000);
        expect(r.employeeShare).toBe(0);
        expect(r.openingBalance).toBe(100000);
    });
    it('never subtracts more EPS than the employer contributes', () => {
        const r = calculatePF({...defaults, employerContrRatio: 0});
        expect(r.employerShare).toBe(0);
        expect(r.epsContribution).toBe(0);
    });
    it('routes the entire employer contribution to EPF for non-EPS members and after 58', () => {
        for (const extra of [{epsEligible: false}, {currentAge: 58, retirementAge: 59}]) {
            const r = calculatePF({...defaults, ...extra});
            expect(r.employerShare).toBe(72000);
            expect(r.epsContribution).toBe(0);
        }
    });
    it('reconciles components over a long projection with increments', () => {
        const r = calculatePF({...defaults, retirementAge: 58, annualIncrement: 5});
        expect(r.totalCorpus).toBeCloseTo(r.openingBalance + r.employeeShare + r.employerShare + r.totalInterest, 4);
        expect(r.breakdown).toHaveLength(33);
    });
    it.each([{retirementAge: Infinity}, {retirementAge: 24}, {interestRate: -1}, {startMonth: 1.5}])('rejects invalid inputs %o', extra => expect(calculatePF({...defaults, ...extra}).error).toBeTruthy());
});
