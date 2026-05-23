const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const cardsRoot = path.join(projectRoot, 'src', 'assets', 'cards');

for (const ext of ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.mp3', '.wav']) {
  require.extensions[ext] = (module, filename) => {
    module.exports = filename;
  };
}

const cardsModule = require(path.join(cardsRoot, 'index.js'));
const cards = Array.isArray(cardsModule) ? cardsModule : cardsModule.creatures || [];
const rarityText = fs.readFileSync(path.join(projectRoot, 'src', 'assets', 'rarityData.js'), 'utf8');

const rarityNames = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Rara',
  epic: 'Epica',
  legendary: 'Lendaria',
};

const rarityMap = new Map();
const rarityBlock = rarityText.match(/export const creatureRarities = \{([\s\S]*?)\n\};/);
if (rarityBlock) {
  const itemRe = /([a-zA-Z0-9_]+):\s*\{\s*rarity:\s*RARITY_TIERS\.([A-Z]+),\s*value:\s*(\d+)\s*\}/g;
  let match;
  while ((match = itemRe.exec(rarityBlock[1]))) {
    const rarity = match[2].toLowerCase();
    rarityMap.set(match[1], {
      rarity,
      name: rarityNames[rarity] || rarity,
      value: Number(match[3]),
    });
  }
}

const localize = (value, fallback = '') => {
  if (value == null) return fallback;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value.pt || value.ptbr || value.en || fallback;
  }
  return String(value);
};

const normalizeImage = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.default) return value.default;
  return String(Object.values(value)[0] || '');
};

const typeLabel = (card) => {
  if (card.type === 'field') return 'Campo';
  if (card.type === 'effect') return 'Efeito';
  return localize(card.type, 'Criatura');
};

const rarityFor = (card) => {
  if (card.type === 'field') return { rarity: 'field', name: 'Campo', value: 15 };
  if (card.type === 'effect' && card.effectType === 'essence') {
    return { rarity: 'essence', name: 'Essencia', value: 15 };
  }
  if (card.type === 'effect') return { rarity: 'effect', name: 'Efeito', value: 15 };
  return rarityMap.get(card.id) || { rarity: 'common', name: 'Comum', value: 100 };
};

const abilitySummary = (card) => {
  if (Array.isArray(card.abilities) && card.abilities.length) {
    return card.abilities
      .slice(0, 2)
      .map((ability) => localize(ability.name, 'Habilidade'))
      .join(' / ');
  }
  if (card.description) return localize(card.description);
  if (card.fielddesc) return localize(card.fielddesc);
  if (card.lore) return localize(card.lore);
  return '';
};

const data = cards.map((card, index) => {
  const rarity = rarityFor(card);
  return {
    index: index + 1,
    id: card.id || '',
    legacyId: card.legacyId || '',
    number: card.num || '',
    name: localize(card.name || card.title, card.id || `Carta ${index + 1}`),
    title: localize(card.title, ''),
    type: typeLabel(card),
    rawType: typeof card.type === 'string' ? card.type : 'creature',
    element: localize(card.element, 'N/A'),
    fieldType: card.fieldType || '',
    rarity: rarity.rarity,
    rarityName: rarity.name,
    value: rarity.value,
    hp: card.hp || '',
    height: card.height || '',
    weakness: localize(card.weakness, ''),
    cost: card.cost ?? '',
    effectType: card.effectType || '',
    effectValue: card.effectValue ?? '',
    targetType: card.targetType || '',
    duration: card.duration ?? '',
    description: localize(card.description || card.fielddesc || card.lore, ''),
    abilities: Array.isArray(card.abilities)
      ? card.abilities.map((ability) => ({
          name: localize(ability.name, ''),
          desc: localize(ability.desc || ability.description, ''),
          cost: ability.cost ?? '',
          damage: ability.damage ?? '',
          statusEffect: ability.statusEffect || '',
        }))
      : [],
    summary: abilitySummary(card),
    image: normalizeImage(card.img || card.image),
  };
});

const outputDir = path.join(projectRoot, 'output', 'data');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'card_catalog_data.json'), JSON.stringify(data, null, 2), 'utf8');
console.log(`Exported ${data.length} cards to output/data/card_catalog_data.json`);
