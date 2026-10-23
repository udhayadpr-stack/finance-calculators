import { describe, it, expect } from 'vitest';
import { calculatePF } from './pf';
const input = {currentAge: 25, retirementAge: 26, currentBalance: 0, interestRate: 0, annualIncrement: 0, employeeContrRatio: 12, employerContrRatio: 12, startMonth: 4};
describe('EPS allocation', () => {
    it.each([[20000, 28800, 13800], [50000, 72000, 57000], [10000, 14400, 4404]])('splits contributions at basic %s', (basicPay, employee, employer) => {
        const result = calculatePF({...input, basicPay});
        expect(result.employeeShare).toBe(employee);
        expect(result.employerShare).toBe(employer);
        expect(result.breakdown[0].empShare).toBe(employee);
        expect(result.totalCorpus).toBe(employee + employer);
    });
});
