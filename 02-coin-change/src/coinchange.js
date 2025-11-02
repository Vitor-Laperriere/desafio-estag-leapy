// src/coinchange.js
'use strict';

/**
 * Calcula o mínimo número de moedas para formar 'amount'.
 * Retorna -1 se não for possível.
 * @param {number[]} coins
 * @param {number} amount
 * @returns {number}
 */
function minCoins(coins, amount) {
  if (!Number.isInteger(amount) || amount < 0) {
    return -1;
  }
  if (!Array.isArray(coins) || coins.length === 0) {
    return amount === 0 ? 0 : -1;
  }
  if (amount === 0) return 0;

  const INF = amount + 1; // maior que qualquer resposta possível
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (Number.isFinite(c) && c > 0 && Number.isInteger(c) && c <= i) {
        const candidate = dp[i - c] + 1;
        if (candidate < dp[i]) dp[i] = candidate;
      }
    }
  }

  return dp[amount] === INF ? -1 : dp[amount];
}

module.exports = { minCoins };
