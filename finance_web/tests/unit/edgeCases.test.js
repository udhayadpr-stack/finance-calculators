import { describe, it, expect } from 'vitest';
import { calculateEMI } from '../../src/utils/calculators/emi';
import { calculateForeclosure } from '../../src/utils/calculators/foreclosure';
import { calculateMF } from '../../src/utils/calculators/mf';
import { parseMoney, percentage, toINR } from '../../src/utils/formatters';
import { scheduleCSV } from '../../src/utils/download';

describe('Loan arithmetic boundaries', () => {
    it.each([0, 1e-12, 8.5, 100])('reconciles every payment at %s percent', interestRate => {
        const r = calculateEMI({loanAmount: 100000, interestRate, tenureYears: 2.5});
        expect(r.error).toBeUndefined();
        expect(r.monthlySchedule).toHaveLength(30);
        expect(r.schedule).toHaveLength(3);
        expect(r.monthlySchedule.at(-1).balance).toBe(0);
        expect(r.monthlySchedule.reduce((sum, row) => sum + row.principal, 0)).toBeCloseTo(100000, 5);
        expect(r.monthlySchedule.reduce((sum, row) => sum + row.payment, 0)).toBeCloseTo(r.totalAmount, 5);
        expect(r.monthlySchedule.every(row => row.principal >= 0 && row.interest >= 0)).toBe(true);
    });
    it.each([-1, NaN, Infinity, 1e100])('rejects unbounded or invalid tenure %s', tenureYears => expect(calculateEMI({loanAmount: 100000, interestRate: 10, tenureYears}).error).toBeTruthy());
    it('remains amortizing at the maximum supported loan duration and rate', () => {
        const r = calculateEMI({loanAmount: 1000000, interestRate: 100, tenureYears: 100});
        expect(r.totalAmount).toBeCloseTo(r.emi * 1200, 3);
        expect(r.monthlySchedule.at(-1).payment).toBeCloseTo(r.emi, 3);
    });
    it('keeps GST in zero-tenure settlement and supports a quoted zero GST rate', () => {
        const input = {outstandingPrincipal: 100000, interestRate: 0, remainingTenure: 0, foreclosureChargesPercent: 2};
        expect(calculateForeclosure(input)).toMatchObject({penaltyBase: 2000, gst: 360, penalty: 2360, netSavings: -2360});
        expect(calculateForeclosure({...input, gstPercent: 0}).foreclosureCost).toBe(102000);
    });
    it('rejects fractional repayment months', () => expect(calculateForeclosure({remainingTenure: 1.5}).error).toBeTruthy());
    it('exports all months with numeric currency values', () => {
        const r = calculateEMI({loanAmount: 1200, interestRate: 0, tenureYears: 1});
        const csv = scheduleCSV(r.monthlySchedule).split('\r\n');
        expect(csv).toHaveLength(13);
        expect(csv[1]).toBe('1,100.00,100.00,0.00,1100.00');
        expect(csv.at(-1)).toBe('12,100.00,100.00,0.00,0.00');
    });
});

describe('Investment boundaries', () => {
    it('retains a lumpsum at time zero', () => expect(calculateMF({type: 'lumpsum', amount: 5000, rate: 12, years: 0})).toMatchObject({invested: 5000, totalValue: 5000, estReturns: 0}));
    it('distinguishes start and end of month contributions', () => {
        const input = {amount: 1000, rate: 12, years: 1 / 12};
        expect(calculateMF(input).totalValue).toBeCloseTo(1010, 5);
        expect(calculateMF({...input, contributionTiming: 'end'}).totalValue).toBeCloseTo(1000, 5);
    });
    it('supports a negative-return scenario', () => {
        const r = calculateMF({type: 'lumpsum', amount: 10000, rate: -10, years: 1});
        expect(r.totalValue).toBe(9000);
        expect(r.estReturns).toBe(-1000);
    });
    it.each([NaN, Infinity, -101])('rejects an invalid rate %s', rate => expect(calculateMF({amount: 1000, rate, years: 1}).error).toBeTruthy());
});

describe('Formatting and zero charts', () => {
    it.each(['-123', 'abc123', '1.2.3', 'Infinity', '1e309'])('does not turn %s into a positive amount', value => expect(parseMoney(value)).toBe(0));
    it('accepts Indian currency grouping', () => expect(parseMoney('₹1,23,456.78')).toBe(123456.78));
    it('formats rupees with Indian grouping', () => expect(toINR(123456)).toBe('₹1,23,456'));
    it('never produces invalid chart widths for zero or loss', () => {
        expect(percentage(0,0)).toBe(0);
        expect(percentage(-1,10)).toBe(0);
        expect(percentage(100,10)).toBe(100);
    });
});
