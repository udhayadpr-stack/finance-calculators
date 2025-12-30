import { OrbitEngine } from '../lib/engine';
import assert from 'assert';

console.log('Running Engine Tests...');

const engine = new OrbitEngine();

// Test 1: Basic Arithmetic
let res = engine.evaluate('1 + 1');
assert.strictEqual(res.value, 2);
console.log('Test 1 Passed: 1 + 1 = 2');

// Test 2: Variables
engine.evaluate('a = 10');
res = engine.evaluate('a * 2');
assert.strictEqual(res.value, 20);
console.log('Test 2 Passed: Variables (a=10, a*2=20)');

// Test 3: Units
res = engine.evaluate('10 km / 2 h');
// Mathjs unit objects are complex, checking string output
assert.strictEqual(res.text, '5 km / h');
console.log('Test 3 Passed: Units (10 km / 2 h = 5 km / h)');

// Test 4: Functions
engine.evaluate('f(x) = x^2');
res = engine.evaluate('f(4)');
assert.strictEqual(res.value, 16);
console.log('Test 4 Passed: Functions (f(x)=x^2, f(4)=16)');

// Test 5: Re-evaluation Scope Persistence
engine.clearScope();
res = engine.evaluate('a');
assert.ok(res.error, 'Should error after clearScope');
console.log('Test 5 Passed: Scope clearing');

console.log('All Engine Tests Passed!');
