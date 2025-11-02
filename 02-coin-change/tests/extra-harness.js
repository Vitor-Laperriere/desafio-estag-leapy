#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ---- util: carregar runner.yml ----
function loadRunnerConfig() {
  const yaml = require('yaml');
  const runnerPath = path.resolve(process.cwd(), 'runner.yml');
  const content = fs.readFileSync(runnerPath, 'utf8');
  return yaml.parse(content);
}

// ---- util: rodar sua CLI com um input JSON ----
function runCase(command, workdir, input) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, { cwd: workdir, stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Processo saiu com código ${code}. STDERR: ${stderr}`));
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Saída não é JSON válido: ${stdout}`));
      }
    });

    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
}

// ---- DP interno para checar resultado esperado (bottom-up 1D) ----
function expectedMinCoins(coins, amount) {
  if (!Number.isInteger(amount) || amount < 0) return -1;
  if (!Array.isArray(coins) || coins.length === 0) return amount === 0 ? 0 : -1;
  const INF = amount + 1;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (Number.isInteger(c) && c > 0 && c <= i) {
        const candidate = dp[i - c] + 1;
        if (candidate < dp[i]) dp[i] = candidate;
      }
    }
  }
  return dp[amount] === INF ? -1 : dp[amount];
}

// ---- gerar casos aleatórios controlados ----
function genRandomCases(n = 60, maxAmount = 5000, maxCoin = 50) {
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const cases = [];
  for (let i = 0; i < n; i++) {
    const coinCount = rand(1, 8);
    const coins = new Set();
    while (coins.size < coinCount) coins.add(rand(1, maxCoin));
    const coinsArr = Array.from(coins);
    const amount = rand(0, maxAmount);
    cases.push({ coins: coinsArr, amount });
  }
  return cases;
}

// ---- stress tests pesados (rodar quando quiser) ----
function getStressCases() {
  return [
    { coins: [1, 7, 23, 47], amount: 100000 },
    { coins: [2, 3, 7, 11, 19], amount: 123456 },
    { coins: [1, 1000, 10000], amount: 99999 },
    { coins: [1, 7, 13, 29, 50], amount: 200000 }
  ];
}

(async () => {
  const { command, workdir = '.' } = loadRunnerConfig();

  // parâmetros via env
  const RANDOM_N = parseInt(process.env.RANDOM_N || '60', 10);
  const RANDOM_MAX_AMOUNT = parseInt(process.env.RANDOM_MAX_AMOUNT || '5000', 10);
  const RUN_STRESS = (process.env.STRESS || '0') === '1';

  let total = 0;

  // 1) Casos aleatórios (fuzz/property-based)
  const randomCases = genRandomCases(RANDOM_N, RANDOM_MAX_AMOUNT);
  for (const [i, c] of randomCases.entries()) {
    const expected = expectedMinCoins(c.coins, c.amount);
    const out = await runCase(command, path.resolve(process.cwd(), workdir), { coins: c.coins, amount: c.amount });
    const got = out?.minCoins;
    if (expected !== got) {
      console.error(
        `Random Case #${i + 1} falhou.\n  coins=${JSON.stringify(c.coins)} amount=${c.amount}\n  esperado=${expected} obtido=${got}`
      );
      process.exit(1);
    }
    total++;
  }

  // 2) Stress tests (opcionais, só com STRESS=1)
  if (RUN_STRESS) {
    const stressCases = getStressCases();
    for (const [i, c] of stressCases.entries()) {
      const expected = expectedMinCoins(c.coins, c.amount);
      const out = await runCase(command, path.resolve(process.cwd(), workdir), { coins: c.coins, amount: c.amount });
      const got = out?.minCoins;
      if (expected !== got) {
        console.error(
          `Stress Case #${i + 1} falhou.\n  coins=${JSON.stringify(c.coins)} amount=${c.amount}\n  esperado=${expected} obtido=${got}`
        );
        process.exit(1);
      }
      total++;
    }
  }

  console.log(`Extra harness OK! ${total} casos passaram (random=${RANDOM_N}${RUN_STRESS ? ' + stress' : ''}).`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
