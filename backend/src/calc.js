'use strict';

function toNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error('invalid_number');
  }
  return num;
}

function calculate({ a, b, op }) {
  const left = toNumber(a);
  const right = toNumber(b);

  switch (op) {
    case 'add':
      return left + right;
    case 'sub':
      return left - right;
    case 'mul':
      return left * right;
    case 'div':
      if (right === 0) {
        throw new Error('division_by_zero');
      }
      return left / right;
    default:
      throw new Error('invalid_operation');
  }
}

module.exports = {
  calculate,
  toNumber
};
