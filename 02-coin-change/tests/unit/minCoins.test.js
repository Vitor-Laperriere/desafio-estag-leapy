'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { minCoins } = require('../../src/coinchange');

test('calcula o menor número de moedas para um caso clássico', () => {
  const result = minCoins([1, 2, 5], 11);
  assert.equal(result, 3);
});

test('retorna -1 quando o valor é inalcançável com as moedas fornecidas', () => {
  const result = minCoins([2], 3);
  assert.equal(result, -1);
});

test('retorna 0 para valor zero independentemente das moedas', () => {
  assert.equal(minCoins([1, 2, 5], 0), 0);
  assert.equal(minCoins([], 0), 0);
});

test('retorna -1 para valores negativos ou não inteiros', () => {
  assert.equal(minCoins([1, 2], -4), -1);
  assert.equal(minCoins([1, 2], 3.5), -1);
});

test('ignora moedas inválidas e usa apenas as válidas', () => {
  const result = minCoins([1, -2, 2.5], 3);
  assert.equal(result, 3);
});

