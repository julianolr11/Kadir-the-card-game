require('ts-node/register/transpile-only');

['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp3', '.MP3', '.wav'].forEach((extension) => {
  require.extensions[extension] = (module, filename) => { module.exports = filename; };
});

const cardPool = require('../src/assets/cards');
const { runSimulationBatch } = require('../src/logic/aiBattleSimulator');

const valueAfter = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? Number(process.argv[index + 1]) : fallback;
};

const result = runSimulationBatch({
  cardPool,
  matches: valueAfter('--matches', 100),
  playerLevel: valueAfter('--player', 5),
  aiLevel: valueAfter('--ai', 5),
  seed: valueAfter('--seed', 1),
  maxTurns: valueAfter('--max-turns', 80),
});

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
