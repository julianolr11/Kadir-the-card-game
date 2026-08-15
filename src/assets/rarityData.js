/*
 * Sistema de Raridade das Cartas
 *
 * Distribuição (ajustada):
 * - Common (50%): cinza/silver
 * - Uncommon (35%): verde/bronze
 * - Rare (10%): azul
 * - Epic (4.5%): roxo
 * - Legendary (0.5%): ouro/cristal
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
    name: { pt: 'Comum', en: 'Common' },
    color: '#c0c0c0', // Silver
    glowColor: 'rgba(192, 192, 192, 0.5)',
    borderWidth: '2px',
    dropRate: 0.50,
  },
  uncommon: {
    tier: 1,
    name: { pt: 'Incomum', en: 'Uncommon' },
    color: '#a85c33', // Bronze
    glowColor: 'rgba(168, 92, 51, 0.5)',
    borderWidth: '2px',
    dropRate: 0.35,
  },
  rare: {
    tier: 2,
    name: { pt: 'Rara', en: 'Rare' },
    color: '#4a90e2', // Blue
    glowColor: 'rgba(74, 144, 226, 0.5)',
    borderWidth: '3px',
    dropRate: 0.10,
  },
  epic: {
    tier: 3,
    name: { pt: 'Épica', en: 'Epic' },
    color: '#9b59b6', // Purple
    glowColor: 'rgba(155, 89, 182, 0.7)',
    borderWidth: '3px',
    dropRate: 0.045,
  },
  legendary: {
    tier: 4,
    name: { pt: 'Lendária', en: 'Legendary' },
    color: '#f39c12', // Gold
    glowColor: 'rgba(243, 156, 18, 0.8)',
    borderWidth: '4px',
    dropRate: 0.005,
  },
};

/**
 * Mapeamento de criaturas e suas raridades
 * Baseado em análise de balanceamento do jogo
 */
export const creatureRarities = {
  // COMMON (9) - 10 a 30 moedas
  viborom: { rarity: RARITY_TIERS.COMMON, value: 10 },
  arguilia: { rarity: RARITY_TIERS.COMMON, value: 15 },
  leoracal: { rarity: RARITY_TIERS.COMMON, value: 20 },
  drazaq: { rarity: RARITY_TIERS.COMMON, value: 15 },
  alatoy: { rarity: RARITY_TIERS.COMMON, value: 20 },
  terrakhal: { rarity: RARITY_TIERS.COMMON, value: 25 },
  nihil: { rarity: RARITY_TIERS.COMMON, value: 30 },
  virideer: { rarity: RARITY_TIERS.COMMON, value: 15 },

  // UNCOMMON (11) - 20 a 50 moedas
  mawthorn: { rarity: RARITY_TIERS.UNCOMMON, value: 30 },
  griffor: { rarity: RARITY_TIERS.UNCOMMON, value: 25 },
  owlberoth: { rarity: RARITY_TIERS.UNCOMMON, value: 35 },
  elderox: { rarity: RARITY_TIERS.UNCOMMON, value: 40 },
  sunburst: { rarity: RARITY_TIERS.UNCOMMON, value: 30 },
  landor: { rarity: RARITY_TIERS.UNCOMMON, value: 35 },
  raptauros: { rarity: RARITY_TIERS.UNCOMMON, value: 35 },
  faskel: { rarity: RARITY_TIERS.UNCOMMON, value: 40 },
  whalar: { rarity: RARITY_TIERS.UNCOMMON, value: 45 },
  gravhyr: { rarity: RARITY_TIERS.UNCOMMON, value: 50 },
  beoxyr: { rarity: RARITY_TIERS.UNCOMMON, value: 45 },

  // RARE (8) - 40 a 70 moedas
  draak: { rarity: RARITY_TIERS.RARE, value: 50 },
  kael: { rarity: RARITY_TIERS.RARE, value: 45 },
  ignis: { rarity: RARITY_TIERS.RARE, value: 55 },
  digitama: { rarity: RARITY_TIERS.RARE, value: 60 },
  ashfang: { rarity: RARITY_TIERS.RARE, value: 50 },
  roenhell: { rarity: RARITY_TIERS.RARE, value: 70 },
  seract: { rarity: RARITY_TIERS.RARE, value: 65 },
  noctyra: { rarity: RARITY_TIERS.RARE, value: 70 },

  // EPIC (6) - 60 a 90 moedas
  ekeranth: { rarity: RARITY_TIERS.EPIC, value: 70 },
  lunethal: { rarity: RARITY_TIERS.EPIC, value: 75 },
  elythra: { rarity: RARITY_TIERS.EPIC, value: 80 },
  agolir: { rarity: RARITY_TIERS.EPIC, value: 85 },
  ekonos: { rarity: RARITY_TIERS.EPIC, value: 80 },
  ekernoth: { rarity: RARITY_TIERS.EPIC, value: 90 },

  // LEGENDARY (4) - 80 a 150 moedas
  pawferion: { rarity: RARITY_TIERS.LEGENDARY, value: 100 },
  zephyron: { rarity: RARITY_TIERS.LEGENDARY, value: 120 },
  arigus: { rarity: RARITY_TIERS.LEGENDARY, value: 130 },
  moar: { rarity: RARITY_TIERS.LEGENDARY, value: 150 },
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

// Ranges de valor por raridade (min, max)
export const RARITY_RANGES = {
  [RARITY_TIERS.COMMON]: [0, 20],
  [RARITY_TIERS.UNCOMMON]: [10, 30],
  [RARITY_TIERS.RARE]: [25, 50],
  [RARITY_TIERS.EPIC]: [40, 70],
  [RARITY_TIERS.LEGENDARY]: [60, 100],
};

// Ranges específicos para essences e fields
export const ESSENCE_RANGE = [0, 30];
export const FIELD_RANGE = [0, 30];

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Retorna o valor de reciclagem de uma carta (unifica regras)
 * @param {string} cardId - id da carta/creature
 * @param {object} instance - instância da carta { level, isHolo }
 * @param {object} cardMeta - metadados da carta (opcional) usados para detectar type/effectType
 */
export const getCardValue = (cardId, instance = {}, cardMeta = null) => {
  const level = instance?.level || 0;
  const isHolo = !!instance?.isHolo;
  const isFullArt = !!instance?.isFullArt;

  // Detecta tipo da carta
  let type = null;
  let effectType = null;
  if (cardMeta) {
    type = cardMeta.type;
    effectType = cardMeta.effectType;
  }

  // Se type for string, use como indicador (field/effect). Caso contrário, trata como criatura
  const isField = typeof type === 'string' && type === 'field';
  const isEffect = typeof type === 'string' && type === 'effect';
  const isEssence = isEffect && effectType === 'essence';

  // Define range a usar
  let range = null;
  if (isField) range = FIELD_RANGE;
  else if (isEssence) range = ESSENCE_RANGE;
  else {
    const { rarity } = getCreatureRarity(cardId);
    range = RARITY_RANGES[rarity] || RARITY_RANGES[RARITY_TIERS.COMMON];
  }

  const [minRange, maxRange] = range;

  // Valor base: se houver um value explícito nas definições, usar e clamar; senão usar média da faixa
  const explicit = creatureRarities[cardId]?.value;
  const baseCandidate = typeof explicit === 'number' ? explicit : Math.round((minRange + maxRange) / 2);
  const baseValue = clamp(baseCandidate, minRange, maxRange);

  // Bônus por nível: 10% por level (contando desde 0)
  const levelBonus = baseValue * level * 0.1;

  // Bônus holo: flat +30
  const holoBonus = isHolo ? 30 : 0;
  const fullArtBonus = isFullArt ? 150 : 0;

  return Math.floor(baseValue + levelBonus + holoBonus + fullArtBonus);
};

/**
 * Calcula valor com bônus de holo (brilho especial)
 * Cartas holo recebem +50 moedas ao valor base
 * @param {string} creatureId - ID da criatura
 * @param {boolean} isHolo - Se tem efeito holo
 * @returns {number} Valor total da criatura
 */
export const getCreatureValue = (creatureId, isHolo = false) => {
  // Compat wrapper: usa getCardValue para manter cálculo unificado
  return getCardValue(creatureId, { level: 0, isHolo }, null);
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
    { tier: RARITY_TIERS.LEGENDARY, prob: 0.005 },  // 0.50%
    { tier: RARITY_TIERS.EPIC, prob: 0.045 },       // 4.50%
    { tier: RARITY_TIERS.RARE, prob: 0.10 },        // 10.00%
    { tier: RARITY_TIERS.UNCOMMON, prob: 0.35 },    // 35.00%
    { tier: RARITY_TIERS.COMMON, prob: 0.50 },      // 50.00%
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
