import { describe, it, expect } from 'vitest';
import { calculateGratuity } from '../../src/utils/calculators/gratuity';
const defaults = {basicPay: 26000, years: 5};
describe('Gratuity eligibility, service and exemption', () => {
    it('uses confirmed wages without inferring them from CTC', () => {
        expect(calculateGratuity({...defaults, totalCTC: 100000}).payable).toBe(75000);
    });
    it('applies the optional floor to qualifying remuneration', () => {
        const r = calculateGratuity({...defaults, qualifyingRemuneration: 104000, applyWageFloor: true});
        expect(r.payable).toBe(150000);
        expect(r.isWageIncreased).toBe(true);
    });
    it.each([4.5, 4.9, 4.99])('does not round %s into eligibility', years => expect(calculateGratuity({...defaults, years}).eligible).toBe(false));
    it('does not round exactly six months up', () => expect(calculateGratuity({...defaults, months: 6}).payable).toBe(75000));
    it('rounds a remainder over six months up', () => expect(calculateGratuity({...defaults, months: 7}).payable).toBe(90000));
    it('pro-rates fixed-term employment after one full year', () => {
        expect(calculateGratuity({...defaults, years: 1, months: 6, isFixedTerm: true}).payable).toBe(22500);
        expect(calculateGratuity({...defaults, years: .99, isFixedTerm: true}).eligible).toBe(false);
    });
    it('caps statutory private payout and separates a better contractual award', () => {
        const r = calculateGratuity({basicPay: 200000, years: 30});
        expect(r.payable).toBe(2000000);
        const actual = calculateGratuity({basicPay: 200000, years: 30, actualPayout: 3000000, priorExemption: 500000});
        expect(actual.payable).toBe(3000000);
        expect(actual.taxExempt).toBe(1500000);
        expect(actual.taxable).toBe(1500000);
    });
    it('uses central-government half-year rules and 25L ceiling', () => {
        expect(calculateGratuity({basicPay: 50000, years: 20, isGovt: true}).payable).toBe(500000);
        const r = calculateGratuity({basicPay: 200000, years: 35, isGovt: true});
        expect(r.payable).toBe(2500000);
        expect(r.taxExempt).toBe(r.payable);
        expect(r.taxable).toBe(0);
    });
    it('limits exemption to actual receipt', () => {
        const r = calculateGratuity({...defaults, actualPayout: 50000});
        expect(r.taxExempt).toBe(50000);
        expect(r.taxable).toBe(0);
    });
    it.each([{years: NaN}, {basicPay: -1}, {months: 12}])('rejects invalid fields %o', extra => expect(calculateGratuity({...defaults,...extra}).error).toBeTruthy());
});
