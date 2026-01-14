'use strict';

const valueA = document.getElementById('value-a');
const valueB = document.getElementById('value-b');
const operation = document.getElementById('operation');
const button = document.getElementById('calc-btn');
const resultValue = document.getElementById('result-value');
const resultError = document.getElementById('result-error');

function setResult(text) {
  resultValue.textContent = text;
}

function setError(message) {
  resultError.textContent = message || '';
}

async function calculate() {
  const a = valueA.value;
  const b = valueB.value;
  const op = operation.value;

  setError('');
  setResult('…');

  const params = new URLSearchParams({ a, b, op });
  try {
    const response = await fetch(`/api/calc?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Request failed');
    }

    setResult(payload.result);
  } catch (error) {
    setResult('—');
    setError(error.message);
  }
}

button.addEventListener('click', calculate);

[valueA, valueB].forEach((input) => {
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      calculate();
    }
  });
});
