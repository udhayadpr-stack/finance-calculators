import { describe, it, expect } from 'vitest';
import { calculateTax, calculateTaxDetails, STD_DED_NEW } from './salary';

describe('FY 2025-26 resident salary tax', () => {
    it('uses the 75,000 new-regime standard deduction', () => expect(STD_DED_NEW).toBe(75000));
    it.each([0, 400000, 900000, 1200000])('rebates new-regime tax at %s', income => expect(calculateTax(income, 'new')).toBe(0));
    it.each([[1200001, 1.04], [1210000, 10400], [1270000, 72800], [1271000, 73476], [1600000, 124800], [2400000, 312000]])('new-regime tax at %s is %s', (income, expected) => expect(calculateTax(income, 'new')).toBeCloseTo(expected, 2));
    it.each([[500000, 0], [500001, 12500.2 * 1.04], [1000000, 117000]])('old-regime tax at %s', (income, expected) => expect(calculateTax(income, 'old')).toBeCloseTo(expected, 2));
    it.each(['new', 'old'])('limits surcharge jumps in %s regime', regime => {
        const limits = regime === 'new' ? [5000000, 10000000, 20000000] : [5000000, 10000000, 20000000, 50000000];
        for (const limit of limits) {
            expect(calculateTax(limit + 100, regime) - calculateTax(limit, regime)).toBeCloseTo(104, 2);
            expect(calculateTaxDetails(limit + 100, regime).surchargeRelief).toBeGreaterThan(0);
        }
    });
    it('caps the new-regime surcharge at 25 percent', () => {
        const details = calculateTaxDetails(60000000, 'new');
        expect(details.surcharge).toBe(details.baseTax * .25);
    });
    it('rejects non-finite tax inputs', () => expect(() => calculateTax(Infinity)).toThrow(RangeError));
});
