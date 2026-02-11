/**
 * Sistema de Raridade das Cartas
 *
 * Distribuição:
 * - Common (40%): cinza/silver - 14 criaturas
 * - Uncommon (30%): verde/bronze - 11 criaturas
 * - Rare (20%): azul/silver - 8 criaturas
 * - Epic (8%): roxo/ouro - 3 criaturas
 * - Legendary (2%): ouro/cristal - 1 criatura
 */

export const RARITY_TIERS = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

export const RARITY_CONFIG = {
  common: {
    tier: 0,
    name: 'Comum',
    color: '#c0c0c0', // Silver
    glowColor: 'rgba(192, 192, 192, 0.5)',
    borderWidth: '2px',
    dropRate: 0.40,
  },
  uncommon: {
    tier: 1,
    name: 'Incomum',
    color: '#a85c33', // Bronze
    glowColor: 'rgba(168, 92, 51, 0.5)',
    borderWidth: '2px',
    dropRate: 0.30,
  },
  rare: {
    tier: 2,
    name: 'Rara',
    color: '#4a90e2', // Blue
    glowColor: 'rgba(74, 144, 226, 0.5)',
    borderWidth: '3px',
    dropRate: 0.20,
  },
  epic: {
    tier: 3,
    name: 'Épica',
    color: '#9b59b6', // Purple
    glowColor: 'rgba(155, 89, 182, 0.7)',
    borderWidth: '3px',
    dropRate: 0.08,
  },
  legendary: {
    tier: 4,
    name: 'Lendária',
    color: '#f39c12', // Gold
    glowColor: 'rgba(243, 156, 18, 0.8)',
    borderWidth: '4px',
    dropRate: 0.02,
  },
};

/**
 * Mapeamento de criaturas e suas raridades
 * Baseado em análise de balanceamento do jogo
 */
export const creatureRarities = {
  // COMMON (14)
  draak: { rarity: RARITY_TIERS.COMMON, value: 100 },
  mawthorn: { rarity: RARITY_TIERS.COMMON, value: 100 },
  kael: { rarity: RARITY_TIERS.COMMON, value: 100 },
  leoracal: { rarity: RARITY_TIERS.COMMON, value: 100 },
  griffor: { rarity: RARITY_TIERS.COMMON, value: 100 },
  ekeranth: { rarity: RARITY_TIERS.COMMON, value: 100 },
  ignis: { rarity: RARITY_TIERS.COMMON, value: 100 },
  drazaq: { rarity: RARITY_TIERS.COMMON, value: 100 },
  owlberoth: { rarity: RARITY_TIERS.COMMON, value: 100 },
  digitama: { rarity: RARITY_TIERS.COMMON, value: 100 },
  virideer: { rarity: RARITY_TIERS.COMMON, value: 100 },
  ashfang: { rarity: RARITY_TIERS.COMMON, value: 100 },
  viborom: { rarity: RARITY_TIERS.COMMON, value: 100 },
  wraith: { rarity: RARITY_TIERS.COMMON, value: 125 },

  // UNCOMMON (11)
  sunburst: { rarity: RARITY_TIERS.UNCOMMON, value: 150 },
  landor: { rarity: RARITY_TIERS.UNCOMMON, value: 150 },
  raptauros: { rarity: RARITY_TIERS.UNCOMMON, value: 150 },
  arguilia: { rarity: RARITY_TIERS.UNCOMMON, value: 175 },
  faskel: { rarity: RARITY_TIERS.UNCOMMON, value: 150 },
  lunethal: { rarity: RARITY_TIERS.UNCOMMON, value: 150 },
  elderox: { rarity: RARITY_TIERS.UNCOMMON, value: 175 },
  pawferion: { rarity: RARITY_TIERS.UNCOMMON, value: 150 },
  alatoy: { rarity: RARITY_TIERS.UNCOMMON, value: 175 },
  whalar: { rarity: RARITY_TIERS.UNCOMMON, value: 175 },
  elythra: { rarity: RARITY_TIERS.UNCOMMON, value: 150 },

  // RARE (8)
  agolir: { rarity: RARITY_TIERS.RARE, value: 250 },
  beoxyr: { rarity: RARITY_TIERS.RARE, value: 300 },
  zephyron: { rarity: RARITY_TIERS.RARE, value: 250 },
  ekonos: { rarity: RARITY_TIERS.RARE, value: 250 },
  terrakhal: { rarity: RARITY_TIERS.RARE, value: 250 },
  gravhyr: { rarity: RARITY_TIERS.RARE, value: 275 },
  ekernoth: { rarity: RARITY_TIERS.RARE, value: 250 },
  arigus: { rarity: RARITY_TIERS.RARE, value: 300 },

  // EPIC (3)
  roenhell: { rarity: RARITY_TIERS.EPIC, value: 500 },
  moar: { rarity: RARITY_TIERS.EPIC, value: 500 },
  nihil: { rarity: RARITY_TIERS.EPIC, value: 500 },

  // LEGENDARY (1)
  seract: { rarity: RARITY_TIERS.LEGENDARY, value: 2500 },

  // NOCTYRA - Será classificada como LEGENDARY também (guardião especial)
  noctyra: { rarity: RARITY_TIERS.LEGENDARY, value: 2500 },
};

/**
 * Obtém a raridade de uma criatura por ID
 * @param {string} creatureId - ID da criatura
 * @returns {object} Dados de raridade e configuração
 */
export const getCreatureRarity = (creatureId) => {
  const rarity = creatureRarities[creatureId];

  if (!rarity) {
    // Default para criaturas não encontradas
    return {
      rarity: RARITY_TIERS.COMMON,
      value: 100,
      config: RARITY_CONFIG[RARITY_TIERS.COMMON],
    };
  }

  return {
    ...rarity,
    config: RARITY_CONFIG[rarity.rarity],
  };
};

/**
 * Calcula multiplicador de holo (brilho especial)
 * Cartas raras com efeito holo tem 1.75x valor
 * @param {string} creatureId - ID da criatura
 * @param {boolean} isHolo - Se tem efeito holo
 * @returns {number} Valor total da criatura
 */
export const getCreatureValue = (creatureId, isHolo = false) => {
  const { value, rarity } = getCreatureRarity(creatureId);
  const holoMultiplier = isHolo && [RARITY_TIERS.RARE, RARITY_TIERS.EPIC, RARITY_TIERS.LEGENDARY].includes(rarity) ? 1.75 : 1;

  return Math.floor(value * holoMultiplier);
};

/**
 * Obtém lista de criaturas por raridade
 * @param {string} rarityTier - Tier de raridade
 * @returns {array} IDs das criaturas do tier
 */
export const getCreaturesByRarity = (rarityTier) => {
  return Object.entries(creatureRarities)
    .filter(([_, data]) => data.rarity === rarityTier)
    .map(([id, _]) => id);
};

/**
 * Calcula raridade aleatória baseada em probabilidades
 * @returns {string} Tier de raridade selecionado
 */
export const getRollRarity = () => {
  const roll = Math.random();
  const tiers = [
    { tier: RARITY_TIERS.LEGENDARY, prob: 0.02 },
    { tier: RARITY_TIERS.EPIC, prob: 0.08 },
    { tier: RARITY_TIERS.RARE, prob: 0.20 },
    { tier: RARITY_TIERS.UNCOMMON, prob: 0.30 },
    { tier: RARITY_TIERS.COMMON, prob: 0.40 },
  ];

  let accumulated = 0;
  for (const { tier, prob } of tiers) {
    accumulated += prob;
    if (roll <= accumulated) {
      return tier;
    }
  }

  return RARITY_TIERS.COMMON;
};

export default creatureRarities;
