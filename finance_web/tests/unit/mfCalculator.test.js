import { describe, it, expect } from 'vitest';
import { calculateMF } from '../../src/utils/calculators/mf';

describe('MF Calculator Logic', () => {

    it('Vector 1: SIP Baseline ((5000, 12%, 10y)', () => {
        // P=5000, r=12% (1% pm), n=120.
        // FV = 5000 * ((1.01^120 - 1)/0.01) * 1.01
        // 1.01^120 ~ 3.30038
        // (2.30038 / 0.01) * 1.01 = 230.038 * 1.01 ~ 232.339
        // 5000 * 232.339 ~ 11,61,695
        const result = calculateMF({ type: 'sip', amount: 5000, rate: 12, years: 10 });
        expect(Math.round(result.invested)).toBe(600000); // 5k * 120
        expect(Math.round(result.totalValue)).toBeGreaterThan(1160000);
        expect(Math.round(result.totalValue)).toBeLessThan(1165000);
    });

    it('Vector 2: Lumpsum Baseline (1L, 12%, 10y)', () => {
        // P=1L, r=12%, n=10.
        // FV = 1L * (1.12)^10
        // 1.12^10 ~ 3.1058
        // FV ~ 3,10,584
        const result = calculateMF({ type: 'lumpsum', amount: 100000, rate: 12, years: 10 });
        expect(Math.round(result.invested)).toBe(100000);
        expect(Math.round(result.totalValue)).toBeGreaterThan(310000);
        expect(Math.round(result.totalValue)).toBeLessThan(312000);
    });

    it('Vector 4: Zero Rate SIP', () => {
        const result = calculateMF({ type: 'sip', amount: 5000, rate: 0, years: 5 });
        expect(result.totalValue).toBe(result.invested);
        expect(result.estReturns).toBe(0);
    });

    it('Vector 6: Zero Years', () => {
        const result = calculateMF({ type: 'sip', amount: 5000, rate: 12, years: 0 });
        expect(result.totalValue).toBe(0);
    });

    it('Vector 5: High Rate Lumpsum', () => {
        const result = calculateMF({ type: 'lumpsum', amount: 10000, rate: 20, years: 5 });
        // 10000 * 1.2^5 = 10000 * 2.48832 = 24883
        expect(Math.round(result.totalValue)).toBe(24883);
    });
});
