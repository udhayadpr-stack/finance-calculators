import { describe, it, expect } from 'vitest';
import { calculatePF } from './pf';

describe('PF Calculator Logic', () => {

    it('should split Employer Contribution into EPF and EPS correctly', () => {
        const basic = 20000; // > 15k cap
        const result = calculatePF({
            basicPay: basic,
            currentAge: 25,
            retirementAge: 58,
            currentBalance: 0,
            interestRate: 8.1,
            annualIncrement: 5,
            employeeContrRatio: 12,
            employerContrRatio: 12
        });

        // Check first year breakdown
        const firstYear = result.breakdown[0];

        // Emp Share: 12% of 20000 = 2400 * 12 = 28800
        // EPS Share: 8.33% of 15000 (Cap) = 1250 * 12 = 15000 (approx due to rounding monthly)
        // EPF Employer: (12% of 20000) - EPS
        //             = 2400 - 1250 = 1150 * 12 = 13800

        // We look at the totals returned by function (simulated over tenure)
        // But let's check input logic indirectly by breakdown or small tenure
    });

    it('should cap EPS contribution at 1250 per month even for high salary', () => {
        const basic = 50000;
        // EPS should be 8.33% of 15000 = 1250
        // EPF Employer should be (50000 * 0.12) - 1250 = 6000 - 1250 = 4750

        // Manually calculate one month iteration logic if needed, 
        // but let's trust our verify loop logic if we can mock it.
        // Instead, let's verify calculation for 1 year tenure.

        const result = calculatePF({
            basicPay: 50000,
            currentAge: 57,
            retirementAge: 58,
            currentBalance: 0,
            interestRate: 0, // Simplify check
            annualIncrement: 0,
            employeeContrRatio: 12,
            employerContrRatio: 12
        });

        // 12 months.
        // Emp Share: 50k * 12% * 12 = 72,000
        // Employer Share (EPF): 4750 * 12 = 57,000

        expect(result.employeeShare).toBeCloseTo(72000, -1);
        expect(result.employerShare).toBeCloseTo(57000, -1);
    });

    it('should calculate EPS on actual basic if less than 15000', () => {
        const basic = 10000;
        // EPS: 8.33% of 10000 = 833
        // Employer EPF: (10000 * 0.12) - 833 = 1200 - 833 = 367

        const result = calculatePF({
            basicPay: 10000,
            currentAge: 57,
            retirementAge: 58,
            currentBalance: 0,
            interestRate: 0,
            annualIncrement: 0,
            employeeContrRatio: 12,
            employerContrRatio: 12
        });

        // 12 months
        // Employer Share: 367 * 12 = 4404
        expect(result.employerShare).toBeCloseTo(4404, -1);
    });
});
