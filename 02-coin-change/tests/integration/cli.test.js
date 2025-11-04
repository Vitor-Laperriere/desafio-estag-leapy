'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..', '..');

function runCli(input) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['src/index.js'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() });
    });

    if (typeof input === 'string') {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}

test('produz saída JSON válida para input correto', async () => {
  const payload = JSON.stringify({ coins: [1, 2, 5], amount: 11 });
  const { code, stdout, stderr } = await runCli(payload);

  assert.equal(code, 0);
  assert.equal(stderr, '');
  assert.deepEqual(JSON.parse(stdout), { minCoins: 3 });
});

test('retorna erro quando o JSON é inválido', async () => {
  const { code, stdout, stderr } = await runCli('{"coins": [1, 2], "amount": }');

  assert.notEqual(code, 0);
  assert.equal(stdout, '');
  assert.ok(stderr.includes('Erro ao processar a entrada'));
});

test('retorna erro para entrada vazia', async () => {
  const { code, stdout, stderr } = await runCli('');

  assert.notEqual(code, 0);
  assert.equal(stdout, '');
  assert.ok(stderr.includes('Entrada vazia'));
});

