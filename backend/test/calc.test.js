'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { calculate } = require('../src/calc');

test('calculate adds numbers', () => {
  assert.strictEqual(calculate({ a: 2, b: 3, op: 'add' }), 5);
});

test('calculate subtracts numbers', () => {
  assert.strictEqual(calculate({ a: 10, b: 4, op: 'sub' }), 6);
});

test('calculate multiplies numbers', () => {
  assert.strictEqual(calculate({ a: 6, b: 7, op: 'mul' }), 42);
});

test('calculate divides numbers', () => {
  assert.strictEqual(calculate({ a: 12, b: 3, op: 'div' }), 4);
});

test('division by zero throws', () => {
  assert.throws(() => calculate({ a: 12, b: 0, op: 'div' }), /division_by_zero/);
});

test('invalid operation throws', () => {
  assert.throws(() => calculate({ a: 12, b: 2, op: 'pow' }), /invalid_operation/);
});
