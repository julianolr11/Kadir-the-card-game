require('ts-node/register/transpile-only');

['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp3', '.MP3', '.wav'].forEach((extension) => {
  require.extensions[extension] = (module, filename) => { module.exports = filename; };
});

const cardPool = require('../src/assets/cards');
const { runSimulationBatch } = require('../src/logic/aiBattleSimulator');
const { CAMPAIGN_FLOOR_CURVE } = require('../src/logic/campaignDifficulty');

const valueAfter = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? Number(process.argv[index + 1]) : fallback;
};

const matches = Math.max(1, valueAfter('--matches', 40));
const playerLevel = Math.max(0, Math.min(10, valueAfter('--player', 5)));
const seed = valueAfter('--seed', 20260821);
const maxTurns = Math.max(10, valueAfter('--max-turns', 80));

const rows = CAMPAIGN_FLOOR_CURVE.map((floor, index) => {
  const result = runSimulationBatch({
    cardPool,
    matches,
    playerLevel,
    aiLevel: floor.aiLevel,
    seed: seed + index * 10000,
    maxTurns,
  });
  return {
    andar: index + 1,
    ia: floor.aiLevel,
    deck: floor.deckTier,
    vitoriasIA: `${Math.round((result.wins.ai / matches) * 100)}%`,
    vitoriasReferencia: `${Math.round((result.wins.player / matches) * 100)}%`,
    empates: result.wins.draw,
    turnos: result.averageTurns,
    essenciaDesperdicada: result.metrics.essenceWasted,
    ataquesPulados: result.metrics.skippedAttacks,
  };
});

process.stdout.write(`\nValidação da campanha: ${matches} partidas por andar, jogador de referência nível ${playerLevel}\n\n`);
console.table(rows);

const winRates = rows.map(row => Number(row.vitoriasIA.replace('%', '')));
const seriousRegressions = winRates.slice(1).reduce((issues, rate, index) => {
  if (rate + 15 < winRates[index]) issues.push(`andar ${index + 2} (${rate}%) caiu mais de 15 pontos em relação ao anterior (${winRates[index]}%)`);
  return issues;
}, []);

if (seriousRegressions.length) {
  process.stderr.write(`Possível regressão na curva:\n- ${seriousRegressions.join('\n- ')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('Curva sem regressões graves. Compare esta tabela após cada lote de cartas novas.\n');
}
