import { describe, it, expect } from 'vitest';
import { OrbitEngine } from '../lib/engine';

describe('Orbit math engine', () => {
    it('evaluates arithmetic, units and user functions', () => {
        const engine = new OrbitEngine();
        expect(engine.evaluate('1 + 1').value).toBe(2);
        expect(engine.evaluate('10 km / (2 h)').text).toBe('5 km / h');
        engine.evaluate('f(x) = x^2');
        expect(engine.evaluate('f(4)').value).toBe(16);
    });
    it('user functions see later variable assignments', () => {
        const engine = new OrbitEngine();
        engine.evaluate('a = 2');
        engine.evaluate('f(x) = a * x');
        engine.evaluate('a = 4');
        expect(engine.evaluate('f(3)').value).toBe(12);
    });
    it('rebuilds scope without leaking removed variables', () => {
        const engine = new OrbitEngine();
        engine.evaluate('a = 10');
        expect(engine.evaluate('a * 2').value).toBe(20);
        engine.clearScope();
        expect(engine.evaluate('a').error).toBeTruthy();
    });
    it('does not keep partial assignments from a failed line', () => {
        const engine = new OrbitEngine();
        expect(engine.evaluate('x = 3; missingVariable + 1').error).toBeTruthy();
        expect(engine.evaluate('x').error).toBeTruthy();
    });
    it('does not mutate a prior matrix when a later line fails', () => {
        const engine = new OrbitEngine();
        engine.evaluate('a = [1, 2]');
        engine.evaluate('a[1] = 8; missingVariable');
        expect(engine.evaluate('a[1]').value).toBe(1);
    });
    it.each(['import', 'f = evaluate', 'createUnit("test")'])('blocks global engine mutation/evaluation access: %s', expression => expect(new OrbitEngine().evaluate(expression).error).toBeTruthy());
    it('handles blank and excessively long expressions', () => {
        const engine = new OrbitEngine();
        expect(engine.evaluate('  ').text).toBe('');
        expect(engine.evaluate('1'.repeat(2001)).error).toBeTruthy();
    });
});
