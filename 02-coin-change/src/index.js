// src/index.js
'use strict';

const fs = require('fs');
const { minCoins } = require('./coinchange');

function readAllStdin() {
  return fs.readFileSync(0, 'utf-8'); // lê tudo do STDIN
}

function main() {
  try {
    const raw = readAllStdin().trim();
    if (!raw) {
      // Entrada vazia => contrato exige JSON válido; retornamos erro de execução.
      process.stderr.write('Entrada vazia. Esperado JSON com { "coins": number[], "amount": number }.\n');
      process.exit(1);
    }

    const parsed = JSON.parse(raw);
    const coins = parsed?.coins;
    const amount = parsed?.amount;

    const result = minCoins(coins, amount);

    // Saída ESTRITAMENTE no formato exigido
    const out = { minCoins: result };
    process.stdout.write(JSON.stringify(out));
  } catch (err) {
    // Nunca escreva mensagens no stdout aqui; apenas stderr + exit code
    process.stderr.write(`Erro ao processar a entrada: ${String(err.message || err)}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
