import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import creaturesPool from '../assets/cards';
import { chooseAction } from '../logic/ai';
import { AppContext } from './AppContext';
import fieldChangeSfx from '../assets/sounds/effects/field-change.MP3';
import flipCardSfx from '../assets/sounds/effects/flipcard.MP3';
import airSfx from '../assets/sounds/effects/elements/air.MP3';
import battleMusic from '../assets/sounds/music/battle-music.mp3';
import * as effectRegistry from '../utils/effectRegistry';
import { creatureRarities, RARITY_TIERS } from '../assets/rarityData';
import { resolveAbility } from '../logic/abilityResolver';

export const BattleContext = createContext(null);

const drawFromDeck = (deck) => {
  if (!deck || deck.length === 0) return { card: null, nextDeck: [] };
  const next = [...deck];
  const card = next.shift();
  return { card, nextDeck: next };
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const sampleDeckFromPool = (size = 20) => {
  const pool = Array.isArray(creaturesPool) ? creaturesPool : [];
  const shuffled = shuffle(pool);
  const base = shuffled.slice(0, Math.min(size, shuffled.length));
  // duplica para formar deck simples de criaturas (efeitos/field vir├úo depois)
  const cards = base.map((c) => c.id || c.name || 'unknown');
  // Por enquanto o deck ├® apenas IDs de criaturas
  return shuffle(cards.concat(cards)).slice(0, size);
};

const RARITY_ORDER = {
  [RARITY_TIERS.COMMON]: 0,
  [RARITY_TIERS.UNCOMMON]: 1,
  [RARITY_TIERS.RARE]: 2,
  [RARITY_TIERS.EPIC]: 3,
  [RARITY_TIERS.LEGENDARY]: 4,
};

const CAMPAIGN_BUILD_STAGES = [
  { maxRarity: RARITY_TIERS.COMMON, maxValue: 20, buildLevel: 0, deckSize: 20 },
  { maxRarity: RARITY_TIERS.UNCOMMON, maxValue: 35, buildLevel: 1, deckSize: 20 },
  { maxRarity: RARITY_TIERS.UNCOMMON, maxValue: 45, buildLevel: 2, deckSize: 20 },
  { maxRarity: RARITY_TIERS.RARE, maxValue: 50, buildLevel: 3, deckSize: 20 },
  { maxRarity: RARITY_TIERS.RARE, maxValue: 65, buildLevel: 4, deckSize: 20 },
  { maxRarity: RARITY_TIERS.RARE, maxValue: 75, buildLevel: 5, deckSize: 20 },
  { maxRarity: RARITY_TIERS.EPIC, maxValue: 80, buildLevel: 6, deckSize: 20 },
  { maxRarity: RARITY_TIERS.EPIC, maxValue: 90, buildLevel: 7, deckSize: 20 },
  { maxRarity: RARITY_TIERS.LEGENDARY, maxValue: 110, buildLevel: 8, deckSize: 20 },
  { maxRarity: RARITY_TIERS.LEGENDARY, maxValue: 130, buildLevel: 9, deckSize: 20 },
  { maxRarity: RARITY_TIERS.LEGENDARY, maxValue: 150, buildLevel: 10, deckSize: 20 },
];

const getCampaignStage = (index = 0) => CAMPAIGN_BUILD_STAGES[Math.max(0, Math.min(CAMPAIGN_BUILD_STAGES.length - 1, index))];

const normalizeCampaignType = (value) => {
  const text = typeof value === 'string' ? value : (value?.pt || value?.en || '');
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
};

const getCreaturePowerScore = (card) => {
  const rarity = creatureRarities[card.id] || { rarity: RARITY_TIERS.COMMON, value: 10 };
  return (RARITY_ORDER[rarity.rarity] || 0) * 100 + (rarity.value || 0) + (card.atk || 0) * 8 + (card.hp || 0) * 4 + (card.def || 0) * 5;
};

const buildCampaignAiDeck = (opponent, stage) => {
  const maxRarityRank = RARITY_ORDER[stage.maxRarity] || 0;
  const typeKey = opponent?.typeKey ? normalizeCampaignType(opponent.typeKey) : null;
  const validCreatures = (Array.isArray(creaturesPool) ? creaturesPool : [])
    .filter((card) => card?.id && card.type !== 'field' && card.type !== 'effect');
  const allCreatures = validCreatures
    .filter((card) => {
      if (typeKey && normalizeCampaignType(card.type) !== typeKey) return false;
      return true;
    })
    .sort((a, b) => getCreaturePowerScore(a) - getCreaturePowerScore(b));

  const pool = allCreatures
    .filter((card) => {
      const rarity = creatureRarities[card.id] || { rarity: RARITY_TIERS.COMMON, value: 10 };
      return (RARITY_ORDER[rarity.rarity] || 0) <= maxRarityRank && (rarity.value || 0) <= stage.maxValue;
    })
    .sort((a, b) => getCreaturePowerScore(a) - getCreaturePowerScore(b));

  const opponentCardId = opponent?.guardianId || opponent?.id;
  const opponentCard = opponentCardId && creaturesPool.find(card => card.id === opponentCardId);
  const selected = opponentCard ? [opponentCard.id] : [];
  const sourcePool = pool.length > 0 ? pool : allCreatures;
  const minimumUniqueCards = Math.ceil(stage.deckSize / 2);
  const windowSize = Math.max(minimumUniqueCards, 4 + stage.buildLevel);
  const candidateIds = [
    ...sourcePool,
    ...allCreatures,
    ...validCreatures.sort((a, b) => getCreaturePowerScore(a) - getCreaturePowerScore(b)),
  ].map(card => card.id);
  const candidates = [...new Set(candidateIds)].slice(0, windowSize);
  const copyCounts = selected.reduce((counts, cardId) => {
    counts[cardId] = (counts[cardId] || 0) + 1;
    return counts;
  }, {});

  let cursor = 0;
  while (selected.length < stage.deckSize && candidates.length > 0) {
    const cardId = candidates[cursor % candidates.length];
    if ((copyCounts[cardId] || 0) < 2) {
      selected.push(cardId);
      copyCounts[cardId] = (copyCounts[cardId] || 0) + 1;
    }
    cursor += 1;
    if (cursor >= candidates.length * 2) break;
  }

  return shuffle(selected);
};

const scoreUnlock = (unlock) => {
  if (!unlock) return 0;
  let score = 0;
  if (unlock.type === 'perk') score += 18;
  if (unlock.type === 'skill') score += 10;
  score += (unlock.damage || 0) * 8;
  score += (unlock.cost ? Math.max(0, 4 - unlock.cost) : 2);
  if (unlock.statusEffect || unlock.coinStatusEffect) score += 16;
  if (unlock.removeShield) score += 14;
  if (unlock.healOnKill) score += 10;
  if (unlock.value) score += Math.abs(unlock.value) * 4;
  score += (unlock.level || 0) * 3;
  return score;
};

const createAiLoadout = (creatureData, maxLevel) => {
  const unlocks = Array.isArray(creatureData.unlockTable) ? creatureData.unlockTable : [];
  const skills = [
    ...(Array.isArray(creatureData.defaultSkills) ? creatureData.defaultSkills.map(skill => ({ ...skill, level: 0 })) : []),
    ...unlocks.filter(unlock => unlock.type === 'skill'),
  ].filter(skill => (skill.level || 0) <= maxLevel);
  const perks = unlocks.filter(unlock => unlock.type === 'perk' && (unlock.level || 0) <= maxLevel);

  return {
    selectedSkills: skills.sort((a, b) => scoreUnlock(b) - scoreUnlock(a)).slice(0, 2).map(skill => skill.id),
    selectedPerk: perks.sort((a, b) => scoreUnlock(b) - scoreUnlock(a))[0]?.id || null,
  };
};

const getAiBuildOptions = (battleState, creatureData) => {
  if (!battleState?.ai?.campaignOpponent) return {};
  const maxLevel = battleState.ai.campaignBuildLevel || 0;
  return {
    maxLevel,
    loadout: createAiLoadout(creatureData, maxLevel),
  };
};

const normalizeAffinityText = (value) => String(value || '')
  .replace(/Ã¡/g, 'a')
  .replace(/Ã /g, 'a')
  .replace(/Ã¢/g, 'a')
  .replace(/Ã£/g, 'a')
  .replace(/Ã©/g, 'e')
  .replace(/Ãª/g, 'e')
  .replace(/Ã­/g, 'i')
  .replace(/Ã³/g, 'o')
  .replace(/Ã´/g, 'o')
  .replace(/Ãµ/g, 'o')
  .replace(/Ãº/g, 'u')
  .replace(/Ã§/g, 'c')
  .replace(/Ã/g, 'a')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const getBaseCardId = (cardId) => {
  if (!cardId) return cardId;
  const text = String(cardId);
  return text.includes('-') ? text.split('-')[0] : text;
};

const resolveCollectionBaseId = (cardId, collection) => {
  if (!cardId) return cardId;
  if (collection && collection[cardId]) return cardId;
  for (const [baseId, instances] of Object.entries(collection || {})) {
    if (Array.isArray(instances) && instances.some((inst) => inst.instanceId === cardId)) {
      return baseId;
    }
  }
  return getBaseCardId(cardId);
};

const normalizeFieldId = (cardId) => String(getBaseCardId(cardId) || '').toLowerCase();

const resolveFieldCardData = (cardId) => {
  const fieldId = normalizeFieldId(cardId);
  if (!fieldId) return null;

  try {
    const fieldCardsModule = require('../assets/cards/field/exampleFieldCards');
    const fieldCards = fieldCardsModule.default || fieldCardsModule;
    const found = fieldCards.find((c) =>
      normalizeFieldId(c.id) === fieldId
      || normalizeFieldId(c.legacyId) === fieldId
    );
    if (found) return found;
  } catch (e) {
    // fallback below
  }

  try {
    const mod = require(`../assets/cards/booster1/${fieldId}.js`);
    const field = mod.default || mod;
    if (field) {
      return {
        ...field,
        legacyId: field.legacyId || field.id,
        img: field.img || field.image,
        description: field.description || field.effect,
      };
    }
  } catch (e) {
    // ignore
  }

  return null;
};

const getFieldBuffedCreatureIds = (state, fieldData) => {
  if (!fieldData) return [];
  const elementBoostKeys = Object.keys(fieldData.elementBoosts || {}).map(normalizeAffinityText);
  const typeBoostKeys = Object.keys(fieldData.cardTypeBoosts || {}).map(normalizeAffinityText);
  const fieldElement = normalizeAffinityText(fieldData.element);
  const fieldType = normalizeAffinityText(fieldData.fieldType);
  const ids = [];

  ['player', 'ai'].forEach((side) => {
    (state?.[side]?.field?.slots || []).forEach((creature) => {
      if (!creature?.id || creature.hp <= 0) return;
      const creatureElement = normalizeAffinityText(creature.element);
      const creatureType = normalizeAffinityText(creature.type);
      const matchesElement = elementBoostKeys.includes(creatureElement) || (!!fieldElement && creatureElement === fieldElement);
      const matchesType = typeBoostKeys.some(type => creatureType.includes(type) || type.includes(creatureType))
        || (!!fieldType && (creatureType.includes(fieldType) || fieldType.includes(creatureType)))
        || (creatureType.includes('dracon') && (fieldType.includes('dracon') || typeBoostKeys.some(type => type.includes('dracon'))))
        || ((creatureType.includes('drag') || creatureType.includes('dragon')) && (fieldType.includes('dracon') || fieldType.includes('drag') || typeBoostKeys.some(type => type.includes('dracon') || type.includes('drag'))));
      if (matchesElement || matchesType) ids.push(creature.id);
    });
  });

  return ids;
};

const isDragonCreature = (creature) => {
  if (!creature) return false;
  const baseData = creaturesPool.find(c => c.id === creature.baseId || c.id === creature.id) || {};
  const typeText = [
    creature.type,
    baseData.type?.pt,
    baseData.type?.en,
    baseData.name?.pt,
    baseData.name?.en,
  ].filter(Boolean).join(' ').toLowerCase();
  return typeText.includes('drac') || typeText.includes('dragon') || typeText.includes('dragão') || typeText.includes('dragao');
};

// Monta os buffs iniciais de uma criatura recém-invocada (esquiva/defesa/resistências temporárias de perks de summon)
const buildInitialBuffs = (build) => {
  const buffs = [];
  const perks = build?.perkEffects || {};

  if (perks.evasionOnSummon) {
    buffs.push({
      id: `buff_evasion_summon_${Date.now()}`,
      name: 'Esquiva ao Invocar',
      stat: 'dodge',
      value: perks.evasionOnSummon.value,
      duration: perks.evasionOnSummon.duration,
      type: 'flat',
    });
  }

  if (perks.defenseBuffOnSummon) {
    buffs.push({
      id: `buff_defense_summon_${Date.now()}`,
      name: 'Defesa ao Invocar',
      stat: 'defense',
      value: perks.defenseBuffOnSummon.value,
      duration: perks.defenseBuffOnSummon.duration,
      type: 'flat',
    });
  }

  if (perks.elementResistOnSummon) {
    buffs.push({
      id: `buff_element_resist_summon_${Date.now()}`,
      name: 'Resistência Elemental ao Invocar',
      stat: 'elementResist',
      element: perks.elementResistOnSummon.element,
      value: perks.elementResistOnSummon.value,
      duration: perks.elementResistOnSummon.duration,
      type: 'flat',
    });
  }

  if (perks.dotResistOnSummon) {
    buffs.push({
      id: `buff_dot_resist_summon_${Date.now()}`,
      name: 'Resistência a Efeitos ao Invocar',
      stat: 'dotResist',
      dotTypes: perks.dotResistOnSummon.types,
      value: perks.dotResistOnSummon.value,
      duration: perks.dotResistOnSummon.duration,
      type: 'flat',
    });
  }

  return buffs;
};

// PvP (convidado): o motor do anfitrião sempre chama o convidado de "ai" e a si mesmo de
// "player". O convidado, porém, deve se ver sempre como "player" (embaixo) e o anfitrião
// como "ai" (em cima) — o mesmo princípio de visão espelhada que já vale pro modo campanha.
// Esta função traduz o estado bruto recebido do anfitrião para essa perspectiva local.
const swapPerspective = (s) => {
  const swapSide = (val) => (val === 'ai' ? 'player' : (val === 'player' ? 'ai' : val));
  const swappedAnimations = {};
  Object.entries(s.animations || {}).forEach(([id, anim]) => {
    swappedAnimations[id] = anim && anim.owner ? { ...anim, owner: swapSide(anim.owner) } : anim;
  });
  return {
    ...s,
    player: s.ai,
    ai: s.player,
    activePlayer: swapSide(s.activePlayer),
    creaturesInvokedThisTurn: {
      player: s.creaturesInvokedThisTurn?.ai || 0,
      ai: s.creaturesInvokedThisTurn?.player || 0,
    },
    battleStats: {
      player: s.battleStats?.ai,
      ai: s.battleStats?.player,
    },
    elderoxDoubleDamage: s.elderoxDoubleDamage
      ? { player: s.elderoxDoubleDamage.ai, ai: s.elderoxDoubleDamage.player }
      : s.elderoxDoubleDamage,
    animations: swappedAnimations,
    creaturesWithUsedAbility: new Set(Array.isArray(s.creaturesWithUsedAbility) ? s.creaturesWithUsedAbility : []),
    gameResult: s.gameResult
      ? { ...s.gameResult, winner: swapSide(s.gameResult.winner), loser: swapSide(s.gameResult.loser) }
      : s.gameResult,
  };
};

export function BattleProvider({ children }) {
  const { decks, cardCollection, effectsVolume, musicVolume, loadGuardianLoadout } = useContext(AppContext);
  const battleAudioRef = useRef(null);
  const revealTimeoutRef = useRef(null);
  const revealDelayRef = useRef(null);

  // Resolve habilidades selecionadas (2 slots) e aplica perk simples
  const resolveCreatureBuild = useCallback((creatureData, options = {}) => {
    const loadout = options.loadout || (loadGuardianLoadout ? loadGuardianLoadout(creatureData.id) : null);

    // Base stats
    const baseHp = creatureData.hp || 5;
    let atk = creatureData.atk || 2;
    let def = creatureData.def || 1;
    let hpBoost = 0;
    let shieldOnSummon = null; // { amount, duration }
    let firstAttackNegated = false;
    let dragonAllyAttackBonus = false;

    // Determina nível máximo desbloqueado a partir da coleção (para fallback de perk)
    const instances = cardCollection?.[creatureData.id] || [];
    const collectionMaxLevel = instances.length > 0 ? Math.max(...instances.map(i => i.level || 0)) : 0;
    const maxLevel = Number.isFinite(options.maxLevel) ? options.maxLevel : collectionMaxLevel;

    // Seleciona perk: ou a do loadout ou a primeira desbloqueada por nível
    let selectedPerkId = loadout?.selectedPerk || null;
    if (!selectedPerkId) {
      const unlockedPerks = (Array.isArray(creatureData.unlockTable) ? creatureData.unlockTable : [])
        .filter(x => x.type === 'perk' && typeof x.level === 'number' && x.level <= maxLevel);
      if (unlockedPerks.length > 0) {
        selectedPerkId = unlockedPerks[0].id;
      }
    }

    // Efeitos de combate genéricos concedidos por perks (consumidos por effectRegistry/BattleContext)
    const combatPerkEffects = {};

    // Aplica perks conhecidos
    switch (selectedPerkId) {
      case 'ATTACK_PLUS_1':
        atk += 1;
        break;
      case 'HP_PLUS_1':
        hpBoost += 1;
        break;
      case 'HP_PLUS_2':
        hpBoost += 2;
        break;
      case 'FIRST_ROUND_SHIELD':
        shieldOnSummon = { amount: 1, duration: 1 };
        break;
      case 'SHIELD_1_TURN':
      case 'SHIELD_ON_SUMMON_1':
        shieldOnSummon = { amount: 1, duration: 1 };
        break;
      case 'PROTECTIVE_SCALES':
        firstAttackNegated = true;
        break;
      case 'EXTRA_STAMINA':
        dragonAllyAttackBonus = true;
        break;
      // Fogo — Ashfang
      case 'LAVA_SKIN':
        combatPerkEffects.flatDamageReduction = 1;
        break;
      case 'VOLCANIC_BREATH':
        combatPerkEffects.healOnKill = 1;
        break;
      case 'INCANDESCENT_FURY':
        combatPerkEffects.burnDamageBonus = 1;
        break;
      case 'WILD_INSTINCT':
        combatPerkEffects.attackOnDamageTaken = 1;
        break;
      // Fogo — Digitama
      case 'AGILE_SPIRIT':
        combatPerkEffects.evasionOnSummon = { value: 0.15, duration: 2 };
        break;
      case 'PERSISTENT_FLAME':
        combatPerkEffects.burnDurationBonus = 1;
        break;
      case 'MYSTIC_BREATH':
        combatPerkEffects.healOnKill = 1;
        break;
      case 'PROTECTIVE_FIRE':
        combatPerkEffects.shieldIfStatusActiveOnTurnStart = { status: 'burn', amount: 1 };
        break;
      // Fogo — Ekeranth
      case 'ARMOR_PLUS_2':
        combatPerkEffects.flatDamageReduction = 2;
        break;
      // Perks genéricos compartilhados por vários guardiões
      case 'CRIT_CHANCE':
        combatPerkEffects.critChance = 0.15;
        combatPerkEffects.critBonus = 2;
        break;
      case 'DODGE_INCREASE':
        combatPerkEffects.dodgeChance = 0.15;
        break;
      case 'EVASION_BONUS':
        combatPerkEffects.dodgeChance = 0.2;
        break;
      case 'EVASION_PLUS_8':
        combatPerkEffects.dodgeChance = 0.08;
        break;
      case 'DEFENSE_REDUCTION':
        combatPerkEffects.defenseDebuffOnAttack = { value: 1, duration: 2 };
        break;
      case 'LIFESTEAL_INCREASE':
        combatPerkEffects.lifestealOnDamage = 1;
        break;
      case 'MAGIC_RESISTANCE':
        combatPerkEffects.magicResistance = 1;
        break;
      case 'PARALYZE_CHANCE_10':
        combatPerkEffects.paralyzeChanceOnAttack = 0.1;
        break;

      // Água — Arguilia
      case 'ANCIENT_FLUIDITY':
        combatPerkEffects.evasionOnSummon = { value: 0.15, duration: 2 };
        break;
      case 'TOXIC_IMMUNITY':
        combatPerkEffects.dotDamageReduction = { value: 1, types: null };
        break;
      case 'HEALING_RIVER':
        combatPerkEffects.healOnKill = 1;
        break;
      case 'PERSISTENT_POISON':
        combatPerkEffects.statusDurationBonus = { ...(combatPerkEffects.statusDurationBonus || {}), slow: 1 };
        break;

      // Água — Alatoy
      case 'ABYSSAL_SKIN':
        combatPerkEffects.defenseBuffOnSummon = { value: 1, duration: 2 };
        break;
      case 'DEEP_DEFENSE':
        combatPerkEffects.defenseWhileShielded = 1;
        break;
      case 'ABYSSAL_REFLEX':
        combatPerkEffects.reflectDamage = { element: 'agua', value: 1 };
        break;
      case 'INSTINCTIVE_FROST':
        combatPerkEffects.freezeAttackerChance = 0.5;
        break;

      // Água — Arigus
      case 'FROST_RESOLVE':
        combatPerkEffects.flatDamageReduction = 1;
        break;
      case 'ICEHORN_GUARD':
        shieldOnSummon = { amount: 1, duration: 1 };
        break;
      case 'SNOWBOUND_HIDE':
        combatPerkEffects.shieldOnDamageIfNone = 1;
        break;

      // Água — Ekernoth
      case 'ABYSSAL_CARAPACE':
        combatPerkEffects.defenseBuffOnSummon = { value: 2, duration: 2 };
        break;
      case 'SALINE_SHIELD':
        combatPerkEffects.shieldEveryTurnStart = 2;
        break;
      case 'ABYSSAL_FURY':
        combatPerkEffects.healOnKill = 2;
        break;
      case 'CONSTANT_PRESSURE':
        combatPerkEffects.enemyDefenseAura = 1;
        break;

      // Água — Kael
      case 'FROST_SKIN':
        combatPerkEffects.defenseBuffOnSummon = { value: 1, duration: 2 };
        break;
      case 'FROST_REFLECT':
        combatPerkEffects.reflectDamage = { element: 'agua', value: 1 };
        break;
      case 'DEEP_RESISTANCE':
        combatPerkEffects.elementDamageReduction = { element: 'agua', value: 1 };
        break;
      case 'ARCTIC_BREATH':
        combatPerkEffects.healOnKill = 1;
        break;

      // Água — Lunethal
      case 'LUNAR_AURA':
        combatPerkEffects.teamBuffOnSummon = { stat: 'defense', value: 1, duration: 2 };
        break;
      case 'MOON_REFLECT':
        combatPerkEffects.reflectDamage = { element: 'puro', value: 1 };
        break;
      case 'NIGHT_BLESSING':
        combatPerkEffects.healAmplifyAura = 1;
        break;
      case 'RISING_LIGHT':
        combatPerkEffects.nightAllyAttackAura = 1;
        break;

      // Água — Mawthorn
      case 'ABYSSAL_THORNS':
        combatPerkEffects.teamDebuffOnSummon = { status: 'bleed', duration: 2, value: 1 };
        break;
      case 'DEEP_REGEN':
        combatPerkEffects.healIfStatusActiveOnTurnStart = { status: 'bleed', amount: 1 };
        break;
      case 'TOXIC_SKIN':
        combatPerkEffects.dotDamageReduction = { value: 1, types: ['poison', 'bleed'] };
        break;
      case 'HEALING_SPORES':
        combatPerkEffects.healOnApplyDot = 1;
        break;

      // Água — Seract
      case 'FROZEN_ABYSS':
        combatPerkEffects.bonusDamageVsFrozen = { element: 'agua', value: 1 };
        break;
      case 'SHADOW_ICE_CORE':
        combatPerkEffects.shieldChanceOnDamageTaken = { chance: 0.5, amount: 1 };
        break;
      case 'COLD_GRAVE':
        combatPerkEffects.essenceOnKill = 1;
        break;

      // Água — Sunburst
      case 'NIGHT_GLEAM':
        combatPerkEffects.nightSelfBuff = { atk: 1, dodge: 0.15 };
        break;
      case 'SOLAR_RADIANCE':
        combatPerkEffects.dayAllyAttackAura = 1;
        break;
      case 'PROTECTIVE_LIGHT':
        combatPerkEffects.shadowResistAura = 1;
        break;
      case 'PERSISTENT_LIGHT':
        combatPerkEffects.healOnKill = 1;
        break;

      // Água — Viborom
      case 'VENOM_SKIN':
        combatPerkEffects.dotResistOnSummon = { types: ['poison'], value: 1, duration: 2 };
        break;
      case 'TOXIC_RESISTANCE':
        combatPerkEffects.dotDamageReduction = { value: 1, types: ['poison'] };
        break;
      case 'PERSISTENT_VENOM':
        combatPerkEffects.statusDurationBonus = { ...(combatPerkEffects.statusDurationBonus || {}), poison: 1 };
        break;
      case 'TOXIC_HEAL':
        combatPerkEffects.healOnKillIfStatus = { status: 'poison', value: 2 };
        break;

      // Água — Whalar
      case 'NIGHT_HUNTER':
        combatPerkEffects.nightSelfBuff = { atk: 1, dodge: 0.15 };
        break;
      case 'ABYSSAL_RESISTANCE':
        combatPerkEffects.elementResistOnSummon = { element: 'agua', value: 1, duration: 2 };
        break;
      case 'DEEP_BREATH':
        combatPerkEffects.healOnKill = 1;
        break;
      case 'PROTECTIVE_TIDE':
        combatPerkEffects.allyDefenseAura = 1;
        break;

      // Puro — Griffor
      case 'SUMMON_FEROCITY':
        atk += 1;
        break;
      case 'PROTECTIVE_CLAWS':
        combatPerkEffects.flatDamageReduction = 1;
        break;
      case 'PROTECTIVE_CLAWS_RALLY':
        combatPerkEffects.shieldIfBuffActiveOnTurnStart = { stat: 'attack', amount: 1 };
        break;

      // Puro — Moar
      case 'AURORA_WARD':
        combatPerkEffects.defenseWhileAboveHalfHp = 1;
        break;
      case 'PURE_HORIZON':
        combatPerkEffects.teamCleanseOnSummon = { count: 1 };
        break;
      case 'WHITE_VIGIL':
        combatPerkEffects.cleanseAndShieldIfLowHp = { hpThreshold: 3, shieldAmount: 1 };
        break;

      // Puro — Nihil
      case 'VOID_ESSENCE':
        def += 1;
        break;
      case 'PROTECTIVE_VOID':
        combatPerkEffects.elementDamageReduction = { element: 'puro', value: 1 };
        break;
      case 'VOID_BREATH':
        combatPerkEffects.healOnKill = 1;
        break;
      case 'PROTECTIVE_ESSENCE':
        combatPerkEffects.shieldIfBuffActiveOnTurnStart = { stat: 'defense', amount: 1 };
        break;

      // Puro — Owlberoth
      case 'PIERCING_GAZE':
        combatPerkEffects.singleEnemyDebuffOnSummon = { stat: 'attack', value: 1, duration: 1 };
        break;
      case 'PROTECTIVE_WISDOM':
        combatPerkEffects.firstHitDamageReduction = 1;
        break;
      case 'NIGHT_BREATH':
        combatPerkEffects.healOnKill = 1;
        break;

      // Puro — Pawferion
      case 'FELINE_INSTINCT':
        combatPerkEffects.dodgeChance = 0.15;
        break;
      case 'AGILE_REFLEXES':
        combatPerkEffects.flatDamageReduction = 1;
        break;
      case 'WILD_BREATH':
        combatPerkEffects.healOnKill = 1;
        break;
      case 'PROTECTIVE_CLAWS_EVASION':
        combatPerkEffects.shieldIfBuffActiveOnTurnStart = { stat: 'dodge', amount: 1 };
        break;

      // Terra — Roenhell
      case 'HARDENED_HIDE':
        combatPerkEffects.flatDamageReduction = 1;
        break;
      case 'GROUNDING_FORCE':
        combatPerkEffects.armorGrowthIfAboveHalfHp = 1;
        break;
      case 'TITAN_STANCE':
        combatPerkEffects.armorOnLowHpThreshold = { threshold: 4, value: 1 };
        break;

      // Terra — Raptauros
      case 'TOUGH_HIDE':
        combatPerkEffects.flatDamageReduction = 1;
        break;
      case 'RISING_FURY':
        combatPerkEffects.risingFuryOnAttack = 1;
        break;
      case 'EVASIVE_INSTINCT':
        combatPerkEffects.dodgeOnDamageTaken = 0.15;
        break;

      // Terra — Virideer
      case 'GRACEFUL_STEPS':
        combatPerkEffects.healOnDodge = 1;
        break;
      case 'SHINING_HORN':
        combatPerkEffects.blindChanceOnAttack = 0.5;
        break;
      case 'MORNING_AURORA':
        combatPerkEffects.teamHealOnTurnStart = 1;
        break;

      // Ar — Landor
      // (AGILE_FLIGHT não é implementado: "velocidade" não tem mecânica correspondente no motor)
      case 'NATURAL_HEAL':
        combatPerkEffects.healIfBelowHalfHpOnTurnStart = 1;
        break;
      case 'VERDANT_INSPIRATION':
        combatPerkEffects.airAllyAttackBuffOnAllySummon = { value: 1, duration: 1 };
        break;
      case 'PROTECTIVE_BARK':
        combatPerkEffects.flatDamageReduction = 1;
        break;

      default:
        break;
    }

    // Aplica benção do guardião se existir
    let blessingEffect = null;
    let hasIgnisBlessing = false;
    let hasVirideerBlessing = false;
    let hasEkerenthBlessing = false;
    let hasOwlberothBlessing = false;
    let hasNihilBlessing = false;
    let hasDrazraqBlessing = false;
    let hasLeoracalBlessing = false;
    let hasSeractBlessing = false;
    let hasNoctyraBlessing = false;
    let hasMawthornBlessing = false;
    let hasAlatoyBlessing = false;
    let hasPawferionBlessing = false;
    let hasEkonosBlessing = false;
    let hasBeoxyrBlessing = false;
    let hasArguíliaBlessing = false;
    let hasKaelBlessing = false;
    let hasAshfangBlessing = false;
    let hasZephyronBlessing = false;
    let hasArigusBlessing = false;
    let hasRoenhellBlessing = false;
    let hasMoarBlessing = false;
    let hasElderoxBlessing = false;
    let hasGravhyrBlessing = false;
    let hasDraakBlessing = false;
    if (creatureData.isGuardian && creatureData.defaultBlessing) {
      const blessing = creatureData.defaultBlessing;
      if (blessing.id === 'virideer_blessing') {
        hasVirideerBlessing = true;
      }
      // Para o Griffor: escudo por 3 turnos
      if (blessing.id === 'griffor_blessing') {
        blessingEffect = { amount: 3, duration: 3 };
        // Combina com shield do perk se houver
        if (shieldOnSummon) {
          shieldOnSummon.amount += blessingEffect.amount;
          shieldOnSummon.duration = Math.max(shieldOnSummon.duration, blessingEffect.duration);
        } else {
          shieldOnSummon = blessingEffect;
        }
      }
      // Para o Ignis: ressurreição de criatura do cemitério
      if (blessing.id === 'ignis_blessing') {
        hasIgnisBlessing = true;
      }
      // Para o Ekeranth: queimadura em todos os inimigos por 2 turnos
      if (blessing.id === 'ekeranth_blessing') {
        hasEkerenthBlessing = true;
      }
      // Para o Owlberoth: retornar uma criatura inimiga para a mão
      if (blessing.id === 'owlberoth_blessing') {
        hasOwlberothBlessing = true;
      }
      // Para o Nihil: envenenar uma criatura inimiga por 2 turnos
      if (blessing.id === 'nihil_blessing') {
        hasNihilBlessing = true;
      }
      // Para o Drazraq: roubar uma carta da mão do adversário
      if (blessing.id === 'drazaq_blessing') {
        hasDrazraqBlessing = true;
      }
      // Para o Leoracal (visão): revelar carta da mão do adversário
      if (blessing.id === 'leoracal_blessing_vision' || blessing.id === 'leoracal_blessing') {
        hasLeoracalBlessing = true;
      }
      // Para o Seract: trocar uma criatura em campo por uma do cemitério
      if (blessing.id === 'seract_blessing') {
        hasSeractBlessing = true;
      }
      // Para o Noctyra: drena 1 vida do adversário
      if (blessing.id === 'noctyra_blessing') {
        hasNoctyraBlessing = true;
      }
      // Para o Mawthorn: congela uma criatura adversária por 3 turnos
      if (blessing.id === 'mawthorn_blessing') {
        hasMawthornBlessing = true;
      }
      // Para o Alatoy: paralisa uma criatura aleatória por 2 turnos
      if (blessing.id === 'alatoy_blessing') {
        hasAlatoyBlessing = true;
      }
      // Para o Pawferion: imunidade a debuffs para todas as criaturas aliadas por 3 turnos
      if (blessing.id === 'pawferion_blessing') {
        hasPawferionBlessing = true;
      }
      // Para o Ekonos: concede +2 HP a uma criatura aliada
      if (blessing.id === 'ekonos_blessing') {
        hasEkonosBlessing = true;
      }
      // Para o Beoxyr: dano e queimadura em uma criatura aleatória
      if (blessing.id === 'beoxyr_blessing') {
        hasBeoxyrBlessing = true;
      }
      // Para o Arguilia: +1 HP para todas as criaturas de água
      if (blessing.id === 'arguilia_blessing') {
        hasArguíliaBlessing = true;
      }
      // Para o Kael: dano múltiplo a criaturas aleatórias
      if (blessing.id === 'kael_blessing') {
        hasKaelBlessing = true;
      }
      // Para o Ashfang: dano e queimadura a uma criatura aleatória
      if (blessing.id === 'ashfang_blessing') {
        hasAshfangBlessing = true;
      }
      // Para o Zephyron: paralisa todas as criaturas adversárias por 1 turno
      if (blessing.id === 'zephyron_blessing') {
        hasZephyronBlessing = true;
      }
      // Para o Arigus: retorna criatura adversária aleatória para a mão
      if (blessing.id === 'arigus_blessing') {
        hasArigusBlessing = true;
      }
      // Para o Roenhell: pode atacar 2 vezes sem gastar mana
      if (blessing.id === 'roenhell_blessing') {
        hasRoenhellBlessing = true;
      }
      // Para o Moar: congela todos os oponentes por 2 turnos
      if (blessing.id === 'moar_blessing') {
        hasMoarBlessing = true;
      }
      // Para o Elderox: concede double damage para aliados no mesmo turno de invocação
      if (blessing.id === 'elderox_blessing') {
        // marca presença da benção para tratarmos no fluxo de summon
        hasElderoxBlessing = true;
      }
      // Para o Gravhyr: se encerrar o turno sem atacar, ganha +1 de vida
      if (blessing.id === 'gravhyr_blessing') {
        hasGravhyrBlessing = true;
      }
      // Para o Draak: ganha +1 de dano depois de cada ataque
      if (blessing.id === 'draak_blessing') {
        hasDraakBlessing = true;
      }
    }

    // Monta habilidades selecionadas (fallback: primeiras 2 habilidades básicas)
    let selectedAbilities = [];
    if (Array.isArray(loadout?.selectedSkills) && loadout.selectedSkills.length > 0) {
      const skillsPool = [
        ...(Array.isArray(creatureData.defaultSkills) ? creatureData.defaultSkills : []),
        ...(Array.isArray(creatureData.unlockTable) ? creatureData.unlockTable.filter(x => x.type === 'skill') : []),
      ];
      selectedAbilities = loadout.selectedSkills
        .map(skillId => skillsPool.find(s => s.id === skillId))
        // Filtra apenas habilidades cujo nível requerido foi desbloqueado (defaultSkills assumem nível 0)
        .filter((s) => {
          if (!s) return false;
          const required = typeof s.level === 'number' ? s.level : 0;
          return required <= maxLevel;
        })
        .slice(0, 2)
        .map((s) => ({ ...s, cost: s.cost || 1, _skillId: s.id }));
    }
    if (selectedAbilities.length === 0) {
      selectedAbilities = (creatureData.abilities || []).slice(0, 2);
    }

    const hp = baseHp + hpBoost;
    const maxHp = hp;
    return { atk, def, hp, maxHp, abilities: selectedAbilities, perkEffects: { shieldOnSummon, firstAttackNegated, dragonAllyAttackBonus, ...combatPerkEffects }, hasIgnisBlessing, hasVirideerBlessing, hasEkerenthBlessing, hasOwlberothBlessing, hasNihilBlessing, hasDrazraqBlessing, hasLeoracalBlessing, hasSeractBlessing, hasNoctyraBlessing, hasMawthornBlessing, hasAlatoyBlessing, hasPawferionBlessing, hasEkonosBlessing, hasBeoxyrBlessing, hasArguíliaBlessing, hasKaelBlessing, hasAshfangBlessing, hasZephyronBlessing, hasArigusBlessing, hasRoenhellBlessing, hasMoarBlessing, hasElderoxBlessing, hasGravhyrBlessing, hasDraakBlessing };
  }, [loadGuardianLoadout, cardCollection]);

  const playFieldChangeSound = useCallback(() => {
    try {
      if (!fieldChangeSfx) return;
      const audio = new Audio(fieldChangeSfx);
      audio.volume = (effectsVolume ?? 50) / 100;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('Erro ao tocar som de campo:', e);
    }
  }, [effectsVolume]);

  const playFlipCardSound = useCallback(() => {
    try {
      if (!flipCardSfx) return;
      const audio = new Audio(flipCardSfx);
      audio.volume = (effectsVolume ?? 50) / 100;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('Erro ao tocar som de carta:', e);
    }
  }, [effectsVolume]);

  const [state, setState] = useState({
    phase: 'idle', // 'idle' | 'coinflip' | 'playing' | 'ended'
    turn: 1,
    activePlayer: 'player', // 'player' | 'ai'
    creaturesInvokedThisTurn: { player: 0, ai: 0 }, // Contador de criaturas invocadas no turno atual por lado
    creaturesWithUsedAbility: new Set(), // Criaturas que já usaram habilidade este turno
    resurrectionPending: null, // { guardianId, guardianName, availableSlots } se Ignis foi invocado e há cemitério
    returnCardPending: null, // { guardianId, guardianName } se Owlberoth foi invocado
    poisonPending: null, // { guardianId, guardianName } se Nihil foi invocada
    stealCardPending: null, // { guardianId, guardianName } se Drazraq foi invocado
    revealOpponentPending: null, // { guardianId, guardianName } se Leoracal foi invocado
    revealOpponentSelectedIndex: null, // índice escolhido antes da virada
    revealedOpponentIndex: null, // índice da carta atualmente revelada no modal
    swapCardPending: null, // { guardianId, guardianName, step, selectedFieldSlot } se Seract foi invocado
    freezePending: null, // { guardianId, guardianName } se Mawthorn foi invocado
    healPending: null, // { guardianId, guardianName, amount } se Ekonos foi invocado
    virideerBlessPending: null, // { guardianId, guardianName, amount } se Virideer foi invocado
    effectCardPending: null, // { cardId, requiresTarget, targetType } se cartade efeito foi jogada
    drawOpponentPending: null, // { handIndex, baseId } se Compra Reversa foi jogada
    player: {
      orbs: 5,
      essence: 0,
      deck: [],
      hand: [],
      field: { slots: [null, null, null], effects: [null, null, null] },
      fieldGraveyard: [],
      graveyard: [],
    },
    ai: {
      orbs: 5,
      essence: 0,
      deck: [],
      hand: [],
      field: { slots: [null, null, null], effects: [null, null, null] },
      fieldGraveyard: [],
      graveyard: [],
    },
    sharedField: { active: false, id: null },
    activeEffects: [], // Array de efeitos duradouros: { type, turn, duration, targetIndex, player }
    log: [],
    animations: {},
    gameResult: null, // { winner: 'player' | 'ai', kills: [{ attacker: id, target: id }, ...], playerStats, aiStats }
    killFeed: [], // [{ turn, attacker, target }, ...]
    battleStats: {
      player: {
        cardsDrawn: [], // Cards que foram compradas para a mão
        cardsSummoned: [], // Cards que foram invocadas
        cardsKilled: [], // Cards que abateram inimigos
        cardsAssisted: [], // Cards que deram assistência (dano sem matar)
      },
      ai: {
        cardsDrawn: [],
        cardsSummoned: [],
        cardsKilled: [],
        cardsAssisted: [],
      },
    },
    lastDiscardedEffectCard: null, // Armazena id da última carta de efeito descartada (para animação)
  });

  const settleDefeatedCreature = useCallback((battleState, {
    targetSide,
    targetId,
    killerSide,
    killerId,
    killerName,
    by = 'efeito',
  }) => {
    if (!targetSide || !targetId || !battleState?.[targetSide]) return battleState;

    const targetSlots = [...(battleState[targetSide]?.field?.slots || [])];
    const targetIndex = targetSlots.findIndex(slot => slot?.id === targetId);
    const targetCreature = targetIndex >= 0 ? targetSlots[targetIndex] : null;
    if (!targetCreature || targetCreature.hp > 0 || targetCreature._defeatSettled) return battleState;

    const settledCreature = { ...targetCreature, _defeatSettled: true };
    targetSlots[targetIndex] = settledCreature;

    const nextState = {
      ...battleState,
      [targetSide]: {
        ...battleState[targetSide],
        field: {
          ...battleState[targetSide].field,
          slots: targetSlots,
        },
        graveyard: [...(battleState[targetSide].graveyard || []), settledCreature],
        orbs: Math.max(0, (battleState[targetSide].orbs || 0) - 1),
      },
      animations: {
        ...(battleState.animations || {}),
        [targetId]: { death: true },
      },
      log: [
        ...(battleState.log || []),
        `${targetCreature.name} foi derrotado por ${killerName || by}! ${((battleState[targetSide].orbs || 0) - 1) <= 0 ? 'FIM DE JOGO!' : '-1 orbe'}`,
      ],
      killFeed: [
        ...(battleState.killFeed || []),
        {
          turn: battleState.turn,
          attacker: killerName || killerId || by,
          attackerId: killerId,
          target: targetCreature.name,
          targetId: targetCreature.id,
          byEffect: by,
        },
      ],
    };

    if (killerSide && nextState[killerSide]) {
      nextState[killerSide] = {
        ...nextState[killerSide],
        essence: (nextState[killerSide].essence || 0) + 1,
      };
      nextState.essenceRewardPulse = {
        side: killerSide,
        id: `${killerSide}-${targetId}-${Date.now()}`,
      };
      nextState.battleStats = {
        ...nextState.battleStats,
        [killerSide]: {
          ...nextState.battleStats?.[killerSide],
          cardsKilled: [...(nextState.battleStats?.[killerSide]?.cardsKilled || []), killerId || by],
        },
      };
    }

    if (nextState[targetSide].orbs === 0) {
      const winner = targetSide === 'ai' ? 'player' : 'ai';
      nextState.phase = 'ended';
      nextState.gameResult = {
        winner,
        loser: targetSide,
        kills: nextState.killFeed,
        turns: nextState.turn,
        stats: nextState.battleStats,
      };
    }

    setTimeout(() => {
      setState((s2) => {
        const updatedSlots = (s2[targetSide]?.field?.slots || []).map(slot => (slot?.id === targetId ? null : slot));
        const anims = { ...(s2.animations || {}) };
        delete anims[targetId];
        return {
          ...s2,
          [targetSide]: {
            ...s2[targetSide],
            field: {
              ...s2[targetSide].field,
              slots: updatedSlots,
            },
          },
          animations: anims,
        };
      });
    }, 850);

    return nextState;
  }, []);

  // DEBUG helper: expõe função no window para disparar animação Elderox via console
  try {
    // eslint-disable-next-line no-param-reassign
    // assign on each render (safe) to avoid conditional hooks mismatch
    window.triggerElderoxAnimation = (side = 'player', slotIndex = 0) => {
      setState((s) => {
        try {
          const slots = s[side]?.field?.slots || [];
          const slot = slots[slotIndex];
          if (!slot) return s;
          console.debug('triggerElderoxAnimation called for', side, 'slot', slotIndex, 'instance', slot.id);
          const anims = { ...(s.animations || {}) };
          anims[slot.id] = { type: 'elderoxDouble', owner: side, slotIndex };
          // schedule removal (shorter so effect disappears earlier)
          setTimeout(() => {
            console.debug('Removing elderox animation (trigger) for', slot.id);
            setState((s2) => {
              const a = { ...(s2.animations || {}) };
              delete a[slot.id];
              return { ...s2, animations: a };
            });
          }, 1200);
          return { ...s, animations: anims };
        } catch (e) {
          return s;
        }
      });
    };
  } catch (e) {
    // ignore (non-browser env)
  }

  // Controla música de fundo da batalha
  useEffect(() => {
    if (state.phase === 'playing') {
      if (!battleAudioRef.current) {
        battleAudioRef.current = new Audio(battleMusic);
        battleAudioRef.current.loop = true;
        battleAudioRef.current.volume = (musicVolume ?? 50) / 100;
      }
      battleAudioRef.current.play().catch(() => {});
    } else {
      if (battleAudioRef.current) {
        battleAudioRef.current.pause();
        battleAudioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (battleAudioRef.current) {
        battleAudioRef.current.pause();
        battleAudioRef.current = null;
      }
    };
  }, [state.phase]);

  useEffect(() => {
    if (battleAudioRef.current) {
      battleAudioRef.current.volume = (musicVolume ?? 50) / 100;
    }
  }, [musicVolume]);

  const log = useCallback((msg) => {
    setState((s) => ({ ...s, log: [...s.log, msg] }));
  }, []);

  // Dispara animação arbitrária (útil para debugging / console)
  const triggerAnimation = useCallback(({ type, owner, slotIndex, creatureId, duration = 2000 }) => {
    setState((s) => {
      // resolve creature id se não fornecido
      let id = creatureId;
      if (!id) {
        const slots = owner === 'ai' ? (s.ai?.field?.slots || []) : (s.player?.field?.slots || []);
        const slot = (typeof slotIndex === 'number' && slotIndex >= 0) ? slots[slotIndex] : null;
        id = slot?.id;
      }
      if (!id) return s;

      const newAnims = { ...(s.animations || {}), [id]: { type, owner, slotIndex } };

      // agenda remoção após duration
      setTimeout(() => {
        setState((s2) => {
          const anims = { ...(s2.animations || {}) };
          delete anims[id];
          return { ...s2, animations: anims };
        });
      }, duration);

      return { ...s, animations: newAnims };
    });
  }, []);

  const pickFirstUserDeck = useCallback(() => {
    const ids = Object.keys(decks || {});
    if (ids.length === 0) return null;
    const first = decks[ids[0]];
    if (!first || !Array.isArray(first.cards) || first.cards.length === 0) return null;
    return first.cards;
  }, [decks]);

  const startBattle = useCallback((battleSetup = null) => {
    const isCampaignBattle = battleSetup && !Array.isArray(battleSetup) && battleSetup.mode === 'campaign';
    const isPvpBattle = battleSetup && !Array.isArray(battleSetup) && battleSetup.mode === 'pvp';
    const isPvpGuest = isPvpBattle && battleSetup.isHost === false;

    if (isPvpGuest) {
      // O convidado não simula a partida localmente: só monta uma casca de estado e espera
      // o primeiro broadcast do anfitrião (ver useEffect de recebimento de estado, mais abaixo)
      // preencher player/ai de verdade.
      setState({
        phase: 'coinflip',
        turn: 1,
        activePlayer: 'player',
        mode: 'pvp',
        isHost: false,
        peerSteamId64: battleSetup.peerSteamId64 || null,
        creaturesInvokedThisTurn: { player: 0, ai: 0 },
        creaturesWithUsedAbility: new Set(),
        resurrectionPending: null,
        returnCardPending: null,
        poisonPending: null,
        stealCardPending: null,
        swapCardPending: null,
        freezePending: null,
        healPending: null,
        virideerBlessPending: null,
        player: { orbs: 5, essence: 0, deck: [], hand: [], field: { slots: [null, null, null], effects: [null, null, null] }, graveyard: [], fieldGraveyard: [] },
        ai: { orbs: 5, essence: 0, deck: [], hand: [], field: { slots: [null, null, null], effects: [null, null, null] }, graveyard: [], fieldGraveyard: [] },
        sharedField: { active: false, id: null },
        log: ['Aguardando o anfitrião iniciar a partida...'],
        gameResult: null,
        killFeed: [],
        animations: {},
        battleStats: {
          player: { cardsDrawn: [], cardsSummoned: [], cardsKilled: [], cardsAssisted: [] },
          ai: { cardsDrawn: [], cardsSummoned: [], cardsKilled: [], cardsAssisted: [] },
        },
      });
      return;
    }

    const deckOverride = (isCampaignBattle || isPvpBattle) ? battleSetup.deck : battleSetup;
    const opponent = isCampaignBattle ? battleSetup.opponent : null;
    // Deck do jogador: selecionado pelo modal; sen├úo primeiro deck salvo; sen├úo amostra aleat├│ria
    const playerDeck = (Array.isArray(deckOverride) && deckOverride.length > 0)
      ? deckOverride
      : (pickFirstUserDeck() || sampleDeckFromPool(20));
    const opponentIndex = Number.isFinite(opponent?.levelIndex)
      ? opponent.levelIndex
      : (Number.isFinite(opponent?.index) ? opponent.index : 0);
    const campaignStage = getCampaignStage(opponentIndex);
    // PvP (anfitrião): usa o baralho real do convidado quando já foi recebido pelo handshake
    // de seleção de baralho (ver PvpLobby); se ainda não chegou, cai numa amostra.
    const pvpOpponentDeck = isPvpBattle && Array.isArray(battleSetup.opponentDeck) && battleSetup.opponentDeck.length > 0
      ? battleSetup.opponentDeck
      : null;
    const aiDeck = isCampaignBattle
      ? buildCampaignAiDeck(opponent, campaignStage)
      : (pvpOpponentDeck || sampleDeckFromPool(20));

    // Embaralhar e comprar m├úo inicial (4 cartas)
    const pShuffled = shuffle(playerDeck);
    const aShuffled = shuffle(aiDeck);
    let pDeck = [...pShuffled];
    let aDeck = [...aShuffled];
    const pHand = [];
    const aHand = [];
    for (let i = 0; i < 4; i += 1) {
      const d1 = drawFromDeck(pDeck); pDeck = d1.nextDeck; if (d1.card) pHand.push(d1.card);
      const d2 = drawFromDeck(aDeck); aDeck = d2.nextDeck; if (d2.card) aHand.push(d2.card);
    }

    setState({
      phase: 'coinflip',
      turn: 1,
      activePlayer: 'player',
      mode: isPvpBattle ? 'pvp' : (isCampaignBattle ? 'campaign' : 'normal'),
      isHost: isPvpBattle ? (battleSetup.isHost !== false) : null,
      peerSteamId64: isPvpBattle ? (battleSetup.peerSteamId64 || null) : null,
      creaturesInvokedThisTurn: { player: 0, ai: 0 },
      resurrectionPending: null,
      returnCardPending: null,
      poisonPending: null,
      stealCardPending: null,
      swapCardPending: null,
      freezePending: null,
      healPending: null,
      virideerBlessPending: null,
      player: { orbs: 5, essence: 0, deck: pDeck, hand: pHand, field: { slots: [null, null, null], effects: [null, null, null] }, graveyard: [], fieldGraveyard: [] },
      ai: {
        orbs: 5,
        essence: 0,
        deck: aDeck,
        hand: aHand,
        field: { slots: [null, null, null], effects: [null, null, null] },
        graveyard: [],
        fieldGraveyard: [],
        campaignOpponent: opponent || null,
        campaignBuildLevel: isCampaignBattle ? campaignStage.buildLevel : 0,
      },
      sharedField: { active: false, id: null },
      log: [isCampaignBattle ? `Campanha iniciada contra ${opponent?.name || 'Guardião'}!` : 'Batalha iniciada!'],
      gameResult: null,
      killFeed: [],
      battleStats: {
        player: {
          cardsDrawn: [...pHand], // Mão inicial
          cardsSummoned: [],
          cardsKilled: [],
          cardsAssisted: [],
        },
        ai: {
          cardsDrawn: [...aHand], // Mão inicial
          cardsSummoned: [],
          cardsKilled: [],
          cardsAssisted: [],
        },
      },
    });
  }, [pickFirstUserDeck]);

  const endTurn = useCallback(() => {
    setState((s) => {
      // No PvP, o convidado não roda o motor localmente: envia a jogada pro anfitrião simular.
      if (s.mode === 'pvp' && s.isHost === false) {
        window.electron?.ipcRenderer?.sendP2PMessage?.(s.peerSteamId64, { type: 'action', action: 'endTurn' });
        return s;
      }
      const currentSide = s.activePlayer;
      const nextActive = s.activePlayer === 'player' ? 'ai' : 'player';
      const nextTurn = s.turn + (nextActive === 'player' ? 1 : 0);

      let logEntries = [...s.log];

      // penalidade por finalizar turno sem criaturas
      const currentSnapshot = { ...s[currentSide] };
      const hasCreatures = currentSnapshot.field?.slots?.some(Boolean);
      // Não aplica penalidade se o lado já invocou uma criatura neste turno (evita penalizar na primeira jogada)
      const invokedThisTurnCount = (s.creaturesInvokedThisTurn && s.creaturesInvokedThisTurn[currentSide]) ? s.creaturesInvokedThisTurn[currentSide] : 0;
      if (!hasCreatures && currentSnapshot.orbs > 0 && invokedThisTurnCount === 0) {
        currentSnapshot.orbs = Math.max(0, (currentSnapshot.orbs || 0) - 1);
        logEntries.push(`${currentSide === 'player' ? 'Você' : 'IA'} terminou sem criaturas. -1 orbe.`);
        // Verifica se o jogo acabou após perder orb
        if (currentSnapshot.orbs === 0) {
          const winner = currentSide === 'player' ? 'ai' : 'player';
          return {
            ...s,
            phase: 'ended',
            [currentSide]: currentSnapshot,
            gameResult: {
              winner,
              loser: currentSide,
              kills: s.killFeed,
            },
            log: [...logEntries, `⚰️ ${currentSide === 'player' ? 'Você perdeu' : 'IA perdeu'} todos os orbes! FIM DE JOGO!`],
          };
        }
      }

      // compra 1 carta (limite de 7; overflow: volta para o deck e embaralha)
      const side = nextActive;
      const sideData = { ...(s[side]) };
      let { deck, hand, essence, field, orbs } = sideData;

      // +1 ess├¬ncia por turno, limite 10 padr├úo
      essence = Math.min(10, (essence || 0) + 1);

      // compra autom├ítica apenas para IA; o jogador compra manualmente no deck-draw
      if (side === 'ai') {
        playFlipCardSound(); // Som de flip quando IA compra
        const d = drawFromDeck(deck);
        deck = d.nextDeck;
        if (d.card) {
          if ((hand?.length || 0) >= 7) {
            deck = shuffle([d.card, ...deck]);
            logEntries.push(`M├úo cheia (${side}). Carta devolvida ao baralho.`);
          } else {
            hand = [...hand, d.card];            // Registra carta comprada pela IA
            s.battleStats.ai.cardsDrawn = [...s.battleStats.ai.cardsDrawn, d.card];          }
        }
      }

      // Processa expiração de escudos por 1 turno em ambos os lados
      const processShieldTurns = (slots) => (slots || []).map((c) => {
        if (!c) return c;
        const turns = typeof c.shieldTurns === 'number' ? c.shieldTurns : 0;
        if (turns > 0) {
          const newTurns = turns - 1;
          return {
            ...c,
            shieldTurns: newTurns,
            // Apenas zera o shield se a duração acabou E o shield ainda existe
            shield: newTurns <= 0 ? 0 : c.shield,
          };
        }
        // Se não tem shieldTurns ativo, mantém o shield como está (pode ter sido reduzido em combate)
        return c;
      });

      const playerSlots = processShieldTurns(s.player.field.slots);
      const aiSlots = processShieldTurns(s.ai.field.slots);

      // Processa expiração de buffs temporários (Roenhell: bonusAbilityUses)
      const processAbilityUseBuffs = (slots) => (slots || []).map((c) => {
        if (!c) return c;
        if (typeof c.abilityUseBuffTurns === 'number' && c.abilityUseBuffTurns > 0) {
          const newBuffTurns = c.abilityUseBuffTurns - 1;
          return {
            ...c,
            abilityUseBuffTurns: newBuffTurns,
            // Limpa os bônus quando a duração termina
            bonusAbilityUses: newBuffTurns <= 0 ? 0 : c.bonusAbilityUses,
            freeAbilityUses: newBuffTurns <= 0 ? 0 : c.freeAbilityUses,
          };
        }
        return c;
      });

      const playerSlotsAfterBuffs = processAbilityUseBuffs(playerSlots);
      const aiSlotsAfterBuffs = processAbilityUseBuffs(aiSlots);

      // Processa criaturas temporárias (ressuscitadas) - decrementa duração e retorna ao cemitério
      const processResurrectedCreatures = (slots, side, newState) => {
        const processedSlots = [];
        let logs = [];
        console.log(`PROCESS RESURRECT CHECK for side=${side}`, slots);

        (slots || []).forEach(c => {
          if (!c) {
            processedSlots.push(null);
            return;
          }

          if (c.temporary && typeof c.resurrectDuration === 'number') {
            const newDuration = c.resurrectDuration - 1;
            if (newDuration <= 0) {
              // Duração acabou, retorna ao cemitério
              console.log(`PROCESS RESURRECT: ${c.name} duration ended, returning to graveyard`, { side, creature: c });
              newState[side] = {
                ...newState[side],
                graveyard: [...(newState[side]?.graveyard || []), c]
              };
              logs.push(`${c.name} retornou ao cemitério!`);
              processedSlots.push(null);
            } else {
              // Ainda tem duração, decrementa
              processedSlots.push({
                ...c,
                resurrectDuration: newDuration
              });
            }
          } else {
            processedSlots.push(c);
          }
        });

        return { processedSlots, logs, newState };
      };

      // Aplica processamento de ressurreição em ambos os lados
      let resurrectionResult = processResurrectedCreatures(playerSlotsAfterBuffs, 'player', { ...s });
      let playerSlotsAfterResurrect = resurrectionResult.processedSlots;
      let resurrectionLogs = resurrectionResult.logs;
      let stateAfterResurrect = resurrectionResult.newState;

      resurrectionResult = processResurrectedCreatures(aiSlotsAfterBuffs, 'ai', stateAfterResurrect);
      let aiSlotsAfterResurrect = resurrectionResult.processedSlots;
      resurrectionLogs = [...resurrectionLogs, ...resurrectionResult.logs];
      stateAfterResurrect = resurrectionResult.newState;

      // Processa status e buffs para o próximo lado (início do turno)
      // Gravhyr: ao encerrar um turno sem atacar, ganha +1 de vida permanente.
      const applyGravhyrStillness = (slots, sideKey) => {
        if (sideKey !== currentSide) return { slots, logs: [] };
        const usedAbilities = s.creaturesWithUsedAbility || new Set();
        const logs = [];
        const nextSlots = (slots || []).map((c) => {
          if (!c) return c;
          const isGravhyr = c.baseId === 'gravhyr' || c.hasGravhyrBlessing;
          const attackedThisTurn = usedAbilities.has(c.id);
          if (!isGravhyr || attackedThisTurn || c.hp <= 0) return c;
          logs.push(`${c.name} permaneceu imóvel e recebeu +1 de vida.`);
          return {
            ...c,
            hp: (c.hp || 0) + 1,
            maxHp: (c.maxHp || c.hp || 0) + 1,
          };
        });
        return { slots: nextSlots, logs };
      };

      const gravhyrPlayer = applyGravhyrStillness(playerSlotsAfterResurrect, 'player');
      playerSlotsAfterResurrect = gravhyrPlayer.slots;
      const gravhyrAi = applyGravhyrStillness(aiSlotsAfterResurrect, 'ai');
      aiSlotsAfterResurrect = gravhyrAi.slots;
      const gravhyrLogs = [...gravhyrPlayer.logs, ...gravhyrAi.logs];
      if (currentSide === 'player') {
        currentSnapshot.field = { ...(currentSnapshot.field || {}), slots: playerSlotsAfterResurrect };
      } else {
        currentSnapshot.field = { ...(currentSnapshot.field || {}), slots: aiSlotsAfterResurrect };
      }

      const activateDraakPendingDamage = (slots, sideKey) => {
        if (sideKey !== nextActive) return { slots, logs: [] };
        const logs = [];
        const nextSlots = (slots || []).map((c) => {
          if (!c) return c;
          const pendingBonus = c.draakPendingDamageBonus || 0;
          const isDraak = c.baseId === 'draak' || c.hasDraakBlessing;
          if (!isDraak || pendingBonus <= 0 || c.hp <= 0) return c;
          logs.push(`${c.name} concentrou seu olhar: +${pendingBonus} de dano nos prÃ³ximos ataques.`);
          return {
            ...c,
            draakDamageBonus: (c.draakDamageBonus || 0) + pendingBonus,
            draakPendingDamageBonus: 0,
          };
        });
        return { slots: nextSlots, logs };
      };

      const draakPlayer = activateDraakPendingDamage(playerSlotsAfterResurrect, 'player');
      playerSlotsAfterResurrect = draakPlayer.slots;
      const draakAi = activateDraakPendingDamage(aiSlotsAfterResurrect, 'ai');
      aiSlotsAfterResurrect = draakAi.slots;
      const draakLogs = [...draakPlayer.logs, ...draakAi.logs];
      field = {
        ...(field || {}),
        slots: side === 'player' ? playerSlotsAfterResurrect : aiSlotsAfterResurrect,
      };
      if (currentSide === 'player') {
        currentSnapshot.field = { ...(currentSnapshot.field || {}), slots: playerSlotsAfterResurrect };
      } else {
        currentSnapshot.field = { ...(currentSnapshot.field || {}), slots: aiSlotsAfterResurrect };
      }

      const processSideStart = (curState, sideKey) => {
        let ns = { ...curState };
        const slots = ns[sideKey]?.field?.slots || [];
        let logs = [];
        slots.forEach((c) => {
          if (!c) return;
          const r1 = effectRegistry.processStatusEffects(ns, c.id);
          ns = r1.newState;
          logs = logs.concat(r1.log);
          const r2 = effectRegistry.processBuffs(ns, c.id);
          ns = r2.newState;
          logs = logs.concat(r2.log);
        });
        return { ns, logs };
      };

      const baseNextState = {
        ...stateAfterResurrect,
        activePlayer: nextActive,
        turn: nextTurn,
        player: { ...stateAfterResurrect.player, field: { ...stateAfterResurrect.player.field, slots: playerSlotsAfterResurrect } },
        ai: { ...stateAfterResurrect.ai, field: { ...stateAfterResurrect.ai.field, slots: aiSlotsAfterResurrect } },
        [currentSide]: { ...currentSnapshot },
        [side]: { ...stateAfterResurrect[side], deck, hand, essence, field, orbs },
      };
      const processed = processSideStart({
        ...baseNextState,
        log: [...(baseNextState.log || []), ...draakLogs],
      }, side);

      // Limpa slots com criaturas mortas (hp <= 0) após processar status/buffs
      // E adiciona criaturas mortas ao graveyard
      const moveDeadToGraveyard = (slots, side, newState) => {
        const cleanedSlots = [];
        const deadCreatures = [];

        (slots || []).forEach(c => {
          if (c && c.hp <= 0) {
            const deadCreature = { ...c, _defeatSettled: true };
            deadCreatures.push(deadCreature);
            // mantemos a criatura na slot por enquanto para permitir a animação de morte
            cleanedSlots.push(deadCreature);
            // marca animação de morte para a UI
            newState.animations = { ...(newState.animations || {}), [deadCreature.id]: { death: true } };
            // agenda remoção real da criatura após a duração da animação (400ms antes + 600ms animação = 1000ms)
            (function(deadId, ownerSide, deadCreature) {
              setTimeout(() => {
                setState((s2) => {
                  try {
                    const updated = { ...s2 };
                    // remove a criatura da slot
                    updated[ownerSide] = {
                      ...updated[ownerSide],
                      field: {
                        ...updated[ownerSide].field,
                        slots: (updated[ownerSide].field.slots || []).map(slot => (slot && slot.id === deadId) ? null : slot),
                      },
                    };
                    // limpa animação
                    const anims = { ...(updated.animations || {}) };
                    delete anims[deadId];
                    updated.animations = anims;
                    return updated;
                  } catch (e) {
                    return s2;
                  }
                });
              }, 1000);
            })(deadCreature.id, side, deadCreature);
          } else {
            cleanedSlots.push(c);
          }
        });

        // Adiciona criaturas mortas ao graveyard do lado correspondente (reflete que morreram; remoção física virá após animação)
        if (deadCreatures.length > 0) {
          const killerSide = side === 'player' ? 'ai' : 'player';
          const existingGraveyardIds = new Set((newState[side]?.graveyard || []).map(creature => creature?.id));
          const newDeadCreatures = deadCreatures.filter(creature => !existingGraveyardIds.has(creature.id));
          newState[side] = {
            ...newState[side],
            graveyard: [...(newState[side]?.graveyard || []), ...newDeadCreatures],
            orbs: Math.max(0, (newState[side]?.orbs || 0) - newDeadCreatures.length),
          };
          if (newDeadCreatures.length > 0 && newState[killerSide]) {
            newState[killerSide] = {
              ...newState[killerSide],
              essence: (newState[killerSide]?.essence || 0) + newDeadCreatures.length,
            };
            newState.essenceRewardPulse = {
              side: killerSide,
              id: `${killerSide}-debuff-${Date.now()}`,
            };
          }
          newState.killFeed = [
            ...(newState.killFeed || []),
            ...newDeadCreatures.map(creature => ({
              turn: newState.turn,
              attacker: 'Debuff',
              attackerId: 'debuff',
              target: creature.name,
              targetId: creature.id,
              byDebuff: true,
            })),
          ];
          newState.log = [
            ...(newState.log || []),
            ...newDeadCreatures.map(creature => `${creature.name} foi derrotado por debuff! ${newState[side].orbs === 0 ? 'FIM DE JOGO!' : '-1 orbe'}`),
          ];
          if (newState[side].orbs === 0) {
            const winner = side === 'ai' ? 'player' : 'ai';
            newState.phase = 'ended';
            newState.gameResult = {
              winner,
              loser: side,
              kills: newState.killFeed,
              turns: newState.turn,
              stats: newState.battleStats,
            };
          }
          newState._orbPenaltyFromStatus = { ...(newState._orbPenaltyFromStatus || {}), [side]: true };
          // aplica penalidade de orbe imediatamente caso após remoção o lado fique sem criaturas
          try {
            const futureSlots = (slots || []).map(s => (s && s.hp > 0) ? s : null).map(slot => (deadCreatures.some(d => slot && slot.id === d.id) ? null : slot));
            const hasCreaturesAfter = futureSlots.some(Boolean);
            if (false && !hasCreaturesAfter && (newState[side].orbs || 0) > 0) {
              newState[side].orbs = Math.max(0, (newState[side].orbs || 0) - 1);
              newState.log = [...(newState.log || []), `${side === 'player' ? 'Você' : 'IA'} perdeu 1 orbe por ficar sem criaturas!`];
              newState._orbPenaltyFromStatus = { ...(newState._orbPenaltyFromStatus || {}), [side]: true };
            }
          } catch (e) {
            // ignore
          }
        }

        return { cleanedSlots, newState };
      };

      const r1 = moveDeadToGraveyard(processed.ns.player.field.slots, 'player', { ...processed.ns });
      let nsCleaned = { ...r1.newState };
      const playerSlotsAfterGrave = r1.cleanedSlots;

      const r2 = moveDeadToGraveyard(nsCleaned.ai.field.slots, 'ai', nsCleaned);
      nsCleaned = { ...r2.newState };
      const aiSlotsAfterGrave = r2.cleanedSlots;

      // Apply orb penalty centrally after removing dead creatures from slots
      // If a side has no creatures and hasn't already received an orb penalty from status processing,
      // decrement orbs and add a log entry.
      const applyOrbPenaltyIfNeeded = (stateObj, sideKey) => {
        const slots = (sideKey === 'player' ? playerSlotsAfterGrave : aiSlotsAfterGrave) || [];
        const hasCreaturesNow = slots.some(Boolean);
        const alreadyApplied = stateObj._orbPenaltyFromStatus && stateObj._orbPenaltyFromStatus[sideKey];
        if (!hasCreaturesNow && (stateObj[sideKey].orbs || 0) > 0 && !alreadyApplied) {
          stateObj[sideKey].orbs = Math.max(0, (stateObj[sideKey].orbs || 0) - 1);
          stateObj.log = [...(stateObj.log || []), `${sideKey === 'player' ? 'Você' : 'IA'} perdeu 1 orbe por ficar sem criaturas!`];
          stateObj._orbPenaltyFromStatus = { ...(stateObj._orbPenaltyFromStatus || {}), [sideKey]: true };
        }
      };

      // Clone processed.ns to avoid mutating originals
      nsCleaned = { ...nsCleaned };
      // Aplica penalidade de orbe apenas para o lado que está finalizando o turno
      applyOrbPenaltyIfNeeded(nsCleaned, currentSide);

      nsCleaned = {
        ...nsCleaned,
        player: {
          ...nsCleaned.player,
          field: {
            ...nsCleaned.player.field,
            slots: playerSlotsAfterGrave,
          },
        },
        ai: {
          ...nsCleaned.ai,
          field: {
            ...nsCleaned.ai.field,
            slots: aiSlotsAfterGrave,
          },
        },
      };

      // Se completamos uma rodada (voltando para o jogador), decrementa durações de status/buffs uma vez
      let finalState = { ...nsCleaned };
      let extraLogs = [];
      if (nextActive === 'player') {
        try {
          const rr = effectRegistry.decrementRoundDurations(finalState);
          finalState = rr.newState;
          extraLogs = rr.log || [];
        } catch (e) {
          console.warn('Erro ao decrementar durações por rodada', e);
        }
      }

      // Limpa marcador temporário do Elderox para o lado que terminou o turno (expira quando o oponente começa)
      try {
        if (finalState.elderoxDoubleDamage) {
          finalState.elderoxDoubleDamage = { ...finalState.elderoxDoubleDamage, [currentSide]: false };
        }
      } catch (e) {
        console.warn('Erro ao limpar marcador Elderox', e);
      }

      return {
        ...finalState,
        creaturesInvokedThisTurn: { player: 0, ai: 0 }, // Reseta contador de invocações para o próximo turno (por segurança)
        creaturesWithUsedAbility: new Set(), // Reseta criaturas que usaram habilidade
        aiPendingAttack: null,
        aiTurnEnding: false,
        log: [...(finalState.log || []), ...logEntries, ...resurrectionLogs, ...gravhyrLogs, `Fim do turno de ${s.activePlayer}.`, ...draakLogs, ...processed.logs, ...extraLogs],
      };
    });
  }, [log]);

  const drawPlayerCard = useCallback(() => {
    playFlipCardSound();
    setState((s) => {
      // No PvP, o convidado compra automaticamente pelo motor do anfitrião (endTurn) — nada a fazer aqui.
      if (s.mode === 'pvp' && s.isHost === false) return s;
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'player') return s;

      const deck = [...(s.player.deck || [])];
      const hand = [...(s.player.hand || [])];

      if (deck.length === 0) return s;
      if (hand.length >= 7) return s;

      const d = drawFromDeck(deck);
      if (!d.card) return s;

      return {
        ...s,
        player: {
          ...s.player,
          deck: d.nextDeck,
          hand: [...hand, d.card],
        },        battleStats: {
          ...s.battleStats,
          player: {
            ...s.battleStats.player,
            cardsDrawn: [...s.battleStats.player.cardsDrawn, d.card],
          },
        },        log: [...s.log, 'Voc├¬ comprou uma carta.'],
      };
    });
  }, []);

  const summonFromHand = useCallback((index, slotIndex) => {
    playFlipCardSound();
    setState((s) => {
      // No PvP, o convidado não roda o motor localmente: envia a jogada pro anfitrião simular.
      if (s.mode === 'pvp' && s.isHost === false) {
        window.electron?.ipcRenderer?.sendP2PMessage?.(s.peerSteamId64, { type: 'action', action: 'summon', index, slotIndex });
        return s;
      }
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'player') return s; // por enquanto s├│ jogador manual

      const hand = [...s.player.hand];
      const cardId = hand[index];
      console.log('summonFromHand called:', { index, slotIndex, cardId });
      if (!cardId) return s;

      // Extrai baseId se for instanceId
      let baseId = cardId;
      if (cardId.includes('-')) {
        // É um instanceId; busca o baseId na coleção
        for (const [base, instances] of Object.entries(cardCollection || {})) {
          if (instances.find(inst => inst.instanceId === cardId)) {
            baseId = base;
            break;
          }
        }
      }
      console.log('summonFromHand resolved baseId:', baseId);

      const sourceInstance = (cardCollection?.[baseId] || []).find(
        (inst) => inst.instanceId === cardId
      );

      // Verifica se é carta de efeito - NÃO PODE SER INVOCADA
      if (String(baseId).toLowerCase().startsWith('effect_')) {
        return {
          ...s,
          log: [...s.log, 'Cartas de efeito não podem ser invocadas em slots!'],
        };
      }

      // Verifica se é carta de campo - NÃO PODE SER INVOCADA EM SLOT NORMAL
      if (/^f\d{3}$/i.test(baseId) || String(baseId).toLowerCase().startsWith('field_')) {
        return {
          ...s,
          log: [...s.log, 'Cartas de campo devem ser invocadas com o botão específico!'],
        };
      }

      // Verifica se já invocou 1 criatura neste turno
      if ((s.creaturesInvokedThisTurn?.player || 0) >= 1) {
        return {
          ...s,
          log: [...s.log, 'Você já invocou 1 criatura neste turno!'],
        };
      }

      const slots = [...s.player.field.slots];
      if (slots[slotIndex]) return s; // slot ocupado

      // Busca dados da criatura no creaturesPool usando baseId
      const creatureData = creaturesPool.find(c => c.id === baseId);
      if (!creatureData) {
        console.warn(`Criatura ${baseId} não encontrada no pool`);
        return s;
      }

      // Resolve build com perks e loadout
      const build = resolveCreatureBuild(creatureData);
      console.log('resolveCreatureBuild result for', baseId, { hasElderoxBlessing: build.hasElderoxBlessing });
      const summonAtk = build.atk + (
        build.perkEffects?.dragonAllyAttackBonus && slots.some(slot => isDragonCreature(slot)) ? 1 : 0
      );

      // Cria estrutura completa da criatura
      const creature = {
        id: cardId, // Mantém o instanceId original para identificação única
        baseId: baseId, // ID da base da criatura para carregar dados
        // Preserva a variante visual no estado da batalha para campo e previews.
        isHolo: Boolean(sourceInstance?.isHolo),
        isFullArt: Boolean(sourceInstance?.isFullArt),
        name: creatureData.name?.pt || creatureData.name?.en || baseId,
        type: creatureData.type?.pt || creatureData.type?.en,
        element: creatureData.element || 'puro',
        hp: build.hp,
        maxHp: build.maxHp,
        atk: summonAtk,
        def: build.def,
        abilities: build.abilities,
        buffs: buildInitialBuffs(build),
        debuffs: [],
        shield: build.perkEffects?.shieldOnSummon?.amount || 0,
        shieldTurns: build.perkEffects?.shieldOnSummon?.duration || 0,
        statusEffects: [],
        firstAttackNegated: !!build.perkEffects?.firstAttackNegated,
        perkEffects: build.perkEffects || {},
        hasGravhyrBlessing: !!build.hasGravhyrBlessing,
        hasDraakBlessing: !!build.hasDraakBlessing,
      };

      slots[slotIndex] = creature;
      hand.splice(index, 1);

      const newState = {
        ...s,
        creaturesInvokedThisTurn: {
          ...(s.creaturesInvokedThisTurn || { player: 0, ai: 0 }),
          player: (s.creaturesInvokedThisTurn?.player || 0) + 1,
        },
        player: {
          ...s.player,
          hand,
          field: { ...s.player.field, slots },
        },
        battleStats: {
          ...s.battleStats,
          player: {
            ...s.battleStats.player,
            cardsSummoned: [...s.battleStats.player.cardsSummoned, cardId],
          },
        },
        log: [...s.log, `Invocou ${creature.name} no slot ${slotIndex + 1}.`],
      };

      // Se for Elderox, marca double-damage temporário para o lado do jogador (válido só neste turno)
      if (build.hasElderoxBlessing) {
        // marca double-damage imediatamente
        newState.elderoxDoubleDamage = { ...(s.elderoxDoubleDamage || {}), player: true };
        newState.log = [...newState.log, `${creature.name} concede DOBRO de dano para aliados neste turno!`];
        console.log('Elderox blessing (player summon) activated double-damage marker');
        // Adiciona animação visual ligeiramente depois para garantir que o DOM e refs dos slots existam
        const animId = creature.id;
        setTimeout(() => {
          console.log('Adding elderox animation (player) for', animId, 'slotIndex', slotIndex);
          setState(s3 => {
            const anims = { ...(s3.animations || {}) };
            anims[animId] = { type: 'elderoxDouble', owner: 'player', slotIndex };
            console.log('State update: elderox animation added (player) for', animId);
            return { ...s3, animations: anims };
          });
          // schedule removal
          setTimeout(() => {
            console.log('Removing elderox animation (player) for', animId);
            setState(s4 => {
              const anims2 = { ...(s4.animations || {}) };
              delete anims2[animId];
              return { ...s4, animations: anims2 };
            });
          }, 1200);
        }, 1000);
        console.log('Elderox animation scheduled (player) for', animId, 'slotIndex', slotIndex, 'will run in ~1s');
      }

      // Perk de um aliado JÁ em campo: buffa criaturas de ar recém-invocadas (ex: VERDANT_INSPIRATION)
      if (creature.element === 'ar') {
        const inspirer = newState.player.field.slots.find(
          (slot) => slot && slot.id !== creature.id && slot.hp > 0 && slot.perkEffects?.airAllyAttackBuffOnAllySummon
        );
        if (inspirer) {
          const { value, duration } = inspirer.perkEffects.airAllyAttackBuffOnAllySummon;
          const buffedSlots = newState.player.field.slots.map((slot) => (slot && slot.id === creature.id
            ? { ...slot, buffs: [...(slot.buffs || []), { id: `buff_air_${Date.now()}`, name: inspirer.name, stat: 'attack', value, duration, type: 'flat' }] }
            : slot));
          newState.player = { ...newState.player, field: { ...newState.player.field, slots: buffedSlots } };
          newState.log = [...newState.log, `${inspirer.name} inspirou ${creature.name}!`];
        }
      }

      // Perk de time: concede um bônus a todos os aliados ao entrar em campo (ex: LUNAR_AURA)
      if (build.perkEffects?.teamBuffOnSummon) {
        const { stat, value, duration } = build.perkEffects.teamBuffOnSummon;
        const buffedSlots = newState.player.field.slots.map((slot) => {
          if (!slot || slot.hp <= 0) return slot;
          const buff = { id: `buff_team_${Date.now()}_${slot.id}`, name: creature.name, stat, value, duration, type: 'flat' };
          return { ...slot, buffs: [...(slot.buffs || []), buff] };
        });
        newState.player = { ...newState.player, field: { ...newState.player.field, slots: buffedSlots } };
        newState.log = [...newState.log, `${creature.name} concedeu um bônus a todos os aliados!`];
      }

      // Perk de time: aplica um status a todos os inimigos ao entrar em campo (ex: ABYSSAL_THORNS)
      if (build.perkEffects?.teamDebuffOnSummon) {
        const { status, duration, value } = build.perkEffects.teamDebuffOnSummon;
        let tsAfterDebuff = newState;
        (tsAfterDebuff.ai.field.slots || []).forEach((slot) => {
          if (!slot || slot.hp <= 0) return;
          const statusResult = effectRegistry.applyStatusEffect(tsAfterDebuff, {
            targetId: slot.id, effectType: status, duration, value, attackerId: creature.id,
          });
          tsAfterDebuff = statusResult.newState;
        });
        newState.ai = tsAfterDebuff.ai;
        newState.log = [...newState.log, `${creature.name} afetou todos os inimigos!`];
      }

      // Perk de time: remove debuffs de todos os aliados ao entrar em campo (ex: PURE_HORIZON)
      if (build.perkEffects?.teamCleanseOnSummon) {
        const { count } = build.perkEffects.teamCleanseOnSummon;
        const cleansedSlots = newState.player.field.slots.map((slot) => {
          if (!slot || slot.hp <= 0) return slot;
          const { buffs } = effectRegistry.removeCreatureDebuffs(slot, count);
          return { ...slot, buffs };
        });
        newState.player = { ...newState.player, field: { ...newState.player.field, slots: cleansedSlots } };
        newState.log = [...newState.log, `${creature.name} purificou os aliados!`];
      }

      // Perk: aplica um debuff a 1 inimigo aleatório ao entrar em campo (ex: PIERCING_GAZE)
      if (build.perkEffects?.singleEnemyDebuffOnSummon) {
        const { stat, value, duration } = build.perkEffects.singleEnemyDebuffOnSummon;
        const enemyIndices = newState.ai.field.slots
          .map((slot, idx) => (slot && slot.hp > 0 ? idx : null))
          .filter((idx) => idx !== null);
        if (enemyIndices.length > 0) {
          const targetIdx = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const targetSlot = newState.ai.field.slots[targetIdx];
          const debuffResult = effectRegistry.applyDebuff(newState, {
            targetId: targetSlot.id, stat, value, duration, name: 'Enfraquecido', type: 'flat',
          });
          newState.ai = debuffResult.newState.ai;
          newState.log = [...newState.log, `${creature.name} enfraqueceu ${targetSlot.name}!`];
        }
      }

      // Se for Ignis, ativa o efeito de ressurreição
      if (build.hasIgnisBlessing) {
        if ((s.player.graveyard || []).length > 0) {
          const availableSlots = slots.reduce((acc, slot, idx) => {
            if (!slot) acc.push(idx);
            return acc;
          }, []);

          newState.resurrectionPending = {
            guardianId: baseId,
            guardianName: creature.name,
            availableSlots,
          };
          newState.log.push(`${creature.name} oferece ressuscitar uma criatura do cemitério!`);
        } else {
          newState.log.push(`${creature.name} tenta ressuscitar uma criatura, mas o cemitério está vazio.`);
        }
      }

      // Se for Ekeranth, aplica queimadura em todos os inimigos
      if (build.hasEkerenthBlessing) {
        const aiSlots = newState.ai?.field?.slots || [];
        const updatedAiSlots = aiSlots.map(slot => {
          if (!slot) return slot;
          const burnStatusEffect = slot.statusEffects?.find(e => e.type === 'burn');
          const newStatusEffects = slot.statusEffects ? [...slot.statusEffects] : [];

          if (burnStatusEffect) {
            // Atualiza queimadura existente
            burnStatusEffect.duration = Math.max(burnStatusEffect.duration, 2);
          } else {
            // Adiciona nova queimadura
            newStatusEffects.push({
              type: 'burn',
              duration: 2,
              source: creature.name,
            });
          }

          return { ...slot, statusEffects: newStatusEffects };
        });

        newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: updatedAiSlots } };
        newState.log.push(`Todos os inimigos foram queimados por 2 turnos!`);
      }

      // Se for Owlberoth, ativa o efeito de retornar uma criatura
      if (build.hasOwlberothBlessing) {
        const enemyCreatures = (newState.ai?.field?.slots || []).filter(slot => slot !== null && slot !== undefined);
        if (enemyCreatures.length > 0) {
          newState.returnCardPending = {
            guardianId: baseId,
            guardianName: creature.name,
          };
          newState.log.push(`${creature.name} permite que você retorne uma criatura do oponente para a mão!`);
        }
      }

      // Se for Nihil, ativa o efeito de envenenamento
      if (build.hasNihilBlessing) {
        const enemyCreatures = (newState.ai?.field?.slots || []).filter(slot => slot !== null && slot !== undefined);
        if (enemyCreatures.length > 0) {
          newState.poisonPending = {
            guardianId: baseId,
            guardianName: creature.name,
          };
          newState.log.push(`${creature.name} oferece envenenar uma criatura do oponente por 2 turnos!`);
        }
      }

      // Se for Drazraq, ativa o efeito de roubo de carta
      if (build.hasDrazraqBlessing) {
        const aiHand = newState.ai?.hand || [];
        if (aiHand.length > 0) {
          newState.stealCardPending = {
            guardianId: baseId,
            guardianName: creature.name,
          };
          newState.log.push(`${creature.name} oferece roubar uma carta da mão do oponente!`);
        }
      }

      // Se for Leoracal (Visão além do alcance), ativa o efeito de revelar carta da mão
      if (build.hasLeoracalBlessing) {
        const aiHand = newState.ai?.hand || [];
        if (aiHand.length > 0) {
          newState.revealOpponentPending = {
            guardianId: baseId,
            guardianName: creature.name,
          };
          newState.log.push(`${creature.name} oferece revelar uma carta da mão do oponente!`);
        }
      }

      // Se for Seract, ativa o efeito de troca de essência
      if (build.hasSeractBlessing) {
        const graveyard = newState.player?.graveyard || [];
        const fieldWithCreatures = slots.reduce((acc, slot, idx) => {
          if (slot !== null && slot !== undefined) acc.push(idx);
          return acc;
        }, []);

        if (graveyard.length > 0 && fieldWithCreatures.length > 0) {
          newState.swapCardPending = {
            guardianId: baseId,
            guardianName: creature.name,
            step: 'selectField', // 'selectField' ou 'selectGraveyard'
            selectedFieldSlot: null,
          };
          newState.log.push(`${creature.name} oferece trocar uma criatura em campo por uma do cemitério!`);
        }
      }

      // Se for Noctyra, drena 1 vida do adversário se o jogador não tiver 5 orbs
      if (build.hasNoctyraBlessing) {
        const currentPlayerOrbs = newState.player?.orbs || 0;
        const currentAiOrbs = newState.ai?.orbs || 0;

        if (currentPlayerOrbs < 5 && currentAiOrbs > 0) {
          // Rouba 1 vida do adversário e adiciona ao jogador
          newState.player.orbs = Math.min(currentPlayerOrbs + 1, 5);
          newState.ai.orbs = Math.max(currentAiOrbs - 1, 0);
          if (newState.ai.orbs === 0) {
            newState.phase = 'ended';
            newState.gameResult = {
              winner: 'player',
              loser: 'ai',
              kills: newState.killFeed,
              turns: newState.turn,
              stats: newState.battleStats,
            };
            newState.log.push('A Noctyra drenou o último orbe do adversário! FIM DE JOGO!');
          }
          newState.log.push(`${creature.name} drenou 1 vida do adversário!`);
        } else if (currentPlayerOrbs >= 5) {
          newState.log.push(`${creature.name} não pode drenar vida - você já está com vida máxima!`);
        } else if (currentAiOrbs <= 0) {
          newState.log.push(`${creature.name} não pode drenar vida - adversário sem vida!`);
        }
      }

      // Se for Mawthorn, ativa o efeito de congelamento
      if (build.hasMawthornBlessing) {
        const enemyCreatures = (newState.ai?.field?.slots || []).filter(slot => slot !== null && slot !== undefined);
        if (enemyCreatures.length > 0) {
          newState.freezePending = {
            guardianId: baseId,
            guardianName: creature.name,
          };
          newState.log.push(`${creature.name} oferece congelar uma criatura do oponente por 3 turnos!`);
        }
      }

      // Se for Alatoy, aplica paralisia em uma criatura aleatória do adversário
      if (build.hasAlatoyBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => slot ? idx : null).filter(idx => idx !== null);

        if (enemyIndices.length > 0) {
          // Escolhe uma criatura aleatória
          const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const targetCreature = aiSlots[randomIndex];

          // Aplica paralisia
          const paralyzeStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'paralyze');
          const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

          if (paralyzeStatusEffect) {
            // Atualiza paralisia existente
            paralyzeStatusEffect.duration = Math.max(paralyzeStatusEffect.duration, 2);
          } else {
            // Adiciona nova paralisia
            newStatusEffects.push({
              type: 'paralyze',
              duration: 2,
              source: creature.name,
            });
          }

          aiSlots[randomIndex] = { ...targetCreature, statusEffects: newStatusEffects };
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
          newState.log.push(`${creature.name} paralisou ${targetCreature.name} por 2 turnos!`);
        }
      }

      // Se for Pawferion, concede imunidade a debuffs para todas as criaturas aliadas por 3 turnos
      if (build.hasPawferionBlessing) {
        const playerSlots = [...(newState.player?.field?.slots || [])];
        const updatedPlayerSlots = playerSlots.map(slot => {
          if (!slot) return slot;

          // Adiciona imunidade a debuffs
          return {
            ...slot,
            debuffImmunity: 3, // Duração de 3 turnos
          };
        });

        newState.player = { ...newState.player, field: { ...newState.player.field, slots: updatedPlayerSlots } };
        newState.log.push(`${creature.name} concedeu imunidade a debuffs para todas as criaturas aliadas por 3 turnos!`);
      }

      // Se for Ekonos, ativa o efeito de cura
      if (build.hasEkonosBlessing) {
        const playerSlots = [...(newState.player?.field?.slots || [])];
        const alliedCreatures = playerSlots.filter((slot, idx) => slot !== null && slot !== undefined && idx !== slotIndex); // Exclui o próprio Ekonos

        if (alliedCreatures.length > 0) {
          // Tem outras criaturas, permite escolher
          newState.healPending = {
            guardianId: baseId,
            guardianName: creature.name,
            amount: 2,
            ekonosSlot: slotIndex,
          };
          newState.log.push(`${creature.name} oferece curar uma criatura aliada em +2 HP!`);
        } else {
          // Não tem outras criaturas, cura a si mesmo
          const ekonosCreature = playerSlots[slotIndex];
          if (ekonosCreature) {
            ekonosCreature.hp = Math.min(ekonosCreature.hp + 2, ekonosCreature.maxHp);
            playerSlots[slotIndex] = ekonosCreature;
            newState.player = { ...newState.player, field: { ...newState.player.field, slots: playerSlots } };
            newState.log.push(`${creature.name} curou a si mesmo em +2 HP!`);
          }
        }
      }

      // Se for Virideer, permite escolher uma criatura aliada para receber +1 HP
      if (build.hasVirideerBlessing) {
        const playerSlots = [...(newState.player?.field?.slots || [])];
        const alliedCreatures = playerSlots.filter((slot, idx) => slot !== null && slot !== undefined && idx !== slotIndex); // Exclui o próprio Virideer

        if (alliedCreatures.length > 0) {
          // Permite escolha pelo jogador
            newState.virideerBlessPending = {
              guardianId: baseId,
              guardianName: creature.name,
              amount: 2,
              virideerSlot: slotIndex,
            };
          newState.log.push(`${creature.name} oferece conceder +1 HP a uma criatura aliada!`);
        } else {
          // Sem outras criaturas, aplica a si mesmo
          const virCreature = playerSlots[slotIndex];
          if (virCreature) {
            virCreature.hp = Math.min(virCreature.hp + 2, virCreature.maxHp);
            playerSlots[slotIndex] = virCreature;
            newState.player = { ...newState.player, field: { ...newState.player.field, slots: playerSlots } };
            newState.log.push(`${creature.name} concedeu +1 HP para si mesmo!`);
          }
        }
      }

      // Se for Beoxyr, aplica dano e queimadura em uma criatura aleatória do adversário
      if (build.hasBeoxyrBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => slot ? idx : null).filter(idx => idx !== null);

        if (enemyIndices.length > 0) {
          // Escolhe uma criatura aleatória
          const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const targetCreature = aiSlots[randomIndex];

          // Aplica dano
          targetCreature.hp = Math.max(0, targetCreature.hp - 2);

          // Aplica queimadura
          const burnStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'burn');
          const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

          if (burnStatusEffect) {
            // Atualiza queimadura existente
            burnStatusEffect.duration = Math.max(burnStatusEffect.duration, 2);
          } else {
            // Adiciona nova queimadura
            newStatusEffects.push({
              type: 'burn',
              duration: 2,
              source: creature.name,
            });
          }

          targetCreature.statusEffects = newStatusEffects;
          aiSlots[randomIndex] = targetCreature;
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
          newState.log.push(`${creature.name} causou 2 de dano e queimou ${targetCreature.name} por 2 turnos!`);
        }
      }

      // Se for Arguilia, concede +1 HP para todas as criaturas de água em campo
      if (build.hasArguíliaBlessing) {
        const playerSlots = [...(newState.player?.field?.slots || [])];
        const healedIds = [];

        const updatedPlayerSlots = playerSlots.map(slot => {
          if (!slot) return slot;

          // Verifica se a criatura é de água
          if (slot.element === 'agua' || (creaturesPool.find(c => c.id === baseId || c.id.split('-')[0] === baseId)?.element === 'agua')) {
            healedIds.push(slot.id);
            // Se o HP está no máximo, aumenta ambos. Senão, apenas o HP até o máximo
            if (slot.hp >= slot.maxHp) {
              return {
                ...slot,
                hp: slot.hp + 1,
                maxHp: slot.maxHp + 1,
              };
            } else {
              return {
                ...slot,
                hp: Math.min(slot.hp + 1, slot.maxHp),
              };
            }
          }
          return slot;
        });

        newState.player = { ...newState.player, field: { ...newState.player.field, slots: updatedPlayerSlots } };
        if (healedIds.length > 0) {
          newState.log.push(`${creature.name} concedeu +1 HP para ${healedIds.length} criatura(s) de água!`);
          // Animação de +1 sobre as criaturas curadas
          newState.animations = {
            ...(newState.animations || {}),
            ...healedIds.reduce((acc, id) => ({ ...acc, [id]: { type: 'heal', amount: 1, icon: 'heart' } }), {}),
          };
          // Remove animação após 900ms
          setTimeout(() => {
            setState(s2 => {
              const anims = { ...(s2.animations || {}) };
              healedIds.forEach(id => delete anims[id]);
              return { ...s2, animations: anims };
            });
          }, 900);
        }
      }

      // Se for Kael, aplica dano múltiplo a criaturas aleatórias
      if (build.hasKaelBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => slot ? idx : null).filter(idx => idx !== null);

        if (enemyIndices.length > 0) {
          if (enemyIndices.length === 1) {
            // Se há apenas 1 criatura, toma 3 de dano direto
            const targetIndex = enemyIndices[0];
            const targetCreature = aiSlots[targetIndex];
            targetCreature.hp = Math.max(0, targetCreature.hp - 3);
            aiSlots[targetIndex] = targetCreature;
            newState.log.push(`${creature.name} causou 3 de dano direto a ${targetCreature.name}!`);
          } else {
            // Se há más de 1, faz 1 de dano 3 vezes a criaturas aleatórias
            for (let i = 0; i < 3; i++) {
              const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
              const targetCreature = aiSlots[randomIndex];
              targetCreature.hp = Math.max(0, targetCreature.hp - 1);
              aiSlots[randomIndex] = targetCreature;
            }
            newState.log.push(`${creature.name} causou 1 de dano 3 vezes a criaturas aleatórias!`);
          }
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
        }
      }

      // Se for Ashfang, aplica dano e queimadura a uma criatura aleatória
      if (build.hasAshfangBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => slot ? idx : null).filter(idx => idx !== null);

        if (enemyIndices.length > 0) {
          // Escolhe uma criatura aleatória
          const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const targetCreature = aiSlots[randomIndex];

          // Aplica dano
          targetCreature.hp = Math.max(0, targetCreature.hp - 1);

          // Aplica queimadura por 3 turnos
          console.debug('Ashfang blessing (player summon) applying to AI target', { targetId: targetCreature?.id, targetName: targetCreature?.name });
          const burnStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'burn');
          const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

          if (burnStatusEffect) {
            // Atualiza queimadura existente
            burnStatusEffect.duration = Math.max(burnStatusEffect.duration, 3);
          } else {
            // Adiciona nova queimadura
            newStatusEffects.push({
              type: 'burn',
              duration: 3,
              source: creature.name,
            });
          }

          targetCreature.statusEffects = newStatusEffects;
          aiSlots[randomIndex] = targetCreature;
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
          newState.log.push(`${creature.name} causou 1 de dano e queimou ${targetCreature.name} por 3 turnos!`);
          Object.assign(newState, settleDefeatedCreature(newState, {
            targetSide: 'ai',
            targetId: targetCreature.id,
            killerSide: 'player',
            killerId: creature.id,
            killerName: creature.name,
            by: 'Ashfang',
          }));
        }
      }

      // Se for Zephyron, paralisa todas as criaturas adversárias por 2 turnos
      if (build.hasZephyronBlessing) {
        const aiSlots = newState.ai?.field?.slots || [];
        const updatedAiSlots = aiSlots.map(slot => {
          if (!slot) return slot;
          const paralyzeStatusEffect = slot.statusEffects?.find(e => e.type === 'paralyze');
          const newStatusEffects = slot.statusEffects ? [...slot.statusEffects] : [];

          if (paralyzeStatusEffect) {
            // Atualiza paralisia existente
            paralyzeStatusEffect.duration = Math.max(paralyzeStatusEffect.duration, 2);
          } else {
            // Adiciona nova paralisia
            newStatusEffects.push({
              type: 'paralyze',
              duration: 2,
              source: creature.name,
            });
          }

          return { ...slot, statusEffects: newStatusEffects };
        });

        newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: updatedAiSlots } };
        newState.log.push(`${creature.name} paralisou todas as criaturas adversárias por 2 turnos!`);
      }

      // Se for Moar, congela todas as criaturas do oponente por 2 turnos
      if (build.hasMoarBlessing) {
        const aiSlots = newState.ai?.field?.slots || [];
        const updatedAiSlots = aiSlots.map(slot => {
          if (!slot) return slot;
          const freezeStatusEffect = slot.statusEffects?.find(e => e.type === 'freeze');
          const newStatusEffects = slot.statusEffects ? [...slot.statusEffects] : [];

          if (freezeStatusEffect) {
            freezeStatusEffect.duration = Math.max(freezeStatusEffect.duration, 2);
          } else {
            newStatusEffects.push({
              type: 'freeze',
              duration: 2,
              source: creature.name,
            });
          }

          return { ...slot, statusEffects: newStatusEffects };
        });

        newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: updatedAiSlots } };
        newState.log.push(`${creature.name} congelou todas as criaturas adversárias por 2 turnos!`);
      }

      // Se for Arigus, retorna uma criatura adversária aleatória para a mão
      if (build.hasArigusBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => slot ? idx : null).filter(idx => idx !== null);

        if (enemyIndices.length > 0) {
          const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const returnedCreature = aiSlots[randomIndex];
          if (returnedCreature) {
            const creatureId = returnedCreature.id;
            // don't remove immediately; trigger return animation and finalize after delay
            newState.animations = { ...(newState.animations || {}), [creatureId]: { type: 'returningToHand', owner: 'player', slotIndex: randomIndex, source: 'arigus' } };
            newState.log.push(`${creature.name} empurrou ${returnedCreature.name}, retornando-o à mão do oponente.`);

            // play wind SFX
            try {
              const audio = new Audio(airSfx);
              audio.volume = (effectsVolume ?? 50) / 100;
              audio.play().catch(() => {});
            } catch (e) {}

            // finalize after animation duration
            const delayMs = 1050;
            setTimeout(() => {
              setState((s2) => {
                const aiSlotsNow = [...(s2.ai?.field?.slots || [])];
                const slotCreature = aiSlotsNow[randomIndex];
                const anims = { ...(s2.animations || {}) };

                let aiHand = [...(s2.ai?.hand || [])];
                if (slotCreature && slotCreature.id === creatureId) {
                  aiSlotsNow[randomIndex] = null;
                  aiHand = [...aiHand, slotCreature.id];
                }

                delete anims[creatureId];

                return {
                  ...s2,
                  ai: { ...s2.ai, hand: aiHand, field: { ...s2.ai.field, slots: aiSlotsNow } },
                  animations: anims,
                  log: [...s2.log, `${returnedCreature.name} foi retornado para a mão do oponente.`],
                };
              });
            }, delayMs);
          }
        }
      }

      // Se for Roenhell, permite atacar 2 vezes neste turno sem gastar mana
      if (build.hasRoenhellBlessing) {
        creature.bonusAbilityUses = 1;
        creature.freeAbilityUses = 2;
        creature.abilityUseBuffTurns = 1;
        newState.log.push(`${creature.name} pode atacar 2 vezes neste turno sem consumir mana!`);
      }

      return newState;
    });
  }, [resolveCreatureBuild, cardCollection, settleDefeatedCreature]);

  // Invocação equivalente a summonFromHand, mas para o lado 'ai' (usada no modo PvP para
  // aplicar a jogada de invocação recebida do jogador convidado pela rede).
  //
  // Cobre stats/habilidades/perks (idêntico ao summonFromHand) e reaproveita
  // applyAiSummonBlessings — a mesma função já usada pelas invocações da IA local — para as
  // ~24 bênçãos exclusivas de guardião. Isso resolve as bênçãos automaticamente (mesma lógica
  // que já vale contra a IA), sem exigir um fluxo de escolha interativa pelo convidado.
  const summonFromHandForOpponent = useCallback((index, slotIndex) => {
    playFlipCardSound();
    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'ai') return s;

      const hand = [...s.ai.hand];
      const cardId = hand[index];
      if (!cardId) return s;

      let baseId = cardId;
      if (cardId.includes('-')) {
        for (const [base, instances] of Object.entries(cardCollection || {})) {
          if (instances.find(inst => inst.instanceId === cardId)) {
            baseId = base;
            break;
          }
        }
      }

      const sourceInstance = (cardCollection?.[baseId] || []).find(
        (inst) => inst.instanceId === cardId
      );

      if (String(baseId).toLowerCase().startsWith('effect_')) {
        return { ...s, log: [...s.log, 'Cartas de efeito não podem ser invocadas em slots!'] };
      }
      if (/^f\d{3}$/i.test(baseId) || String(baseId).toLowerCase().startsWith('field_')) {
        return { ...s, log: [...s.log, 'Cartas de campo devem ser invocadas com o botão específico!'] };
      }
      if ((s.creaturesInvokedThisTurn?.ai || 0) >= 1) {
        return { ...s, log: [...s.log, 'O oponente já invocou 1 criatura neste turno!'] };
      }

      const slots = [...s.ai.field.slots];
      if (slots[slotIndex]) return s;

      const creatureData = creaturesPool.find(c => c.id === baseId);
      if (!creatureData) {
        console.warn(`Criatura ${baseId} não encontrada no pool`);
        return s;
      }

      const build = resolveCreatureBuild(creatureData);
      const summonAtk = build.atk + (
        build.perkEffects?.dragonAllyAttackBonus && slots.some(slot => isDragonCreature(slot)) ? 1 : 0
      );

      const creature = {
        id: cardId,
        baseId,
        isHolo: Boolean(sourceInstance?.isHolo),
        isFullArt: Boolean(sourceInstance?.isFullArt),
        name: creatureData.name?.pt || creatureData.name?.en || baseId,
        type: creatureData.type?.pt || creatureData.type?.en,
        element: creatureData.element || 'puro',
        hp: build.hp,
        maxHp: build.maxHp,
        atk: summonAtk,
        def: build.def,
        abilities: build.abilities,
        buffs: buildInitialBuffs(build),
        debuffs: [],
        shield: build.perkEffects?.shieldOnSummon?.amount || 0,
        shieldTurns: build.perkEffects?.shieldOnSummon?.duration || 0,
        statusEffects: [],
        firstAttackNegated: !!build.perkEffects?.firstAttackNegated,
        perkEffects: build.perkEffects || {},
        hasGravhyrBlessing: !!build.hasGravhyrBlessing,
        hasDraakBlessing: !!build.hasDraakBlessing,
      };

      slots[slotIndex] = creature;
      hand.splice(index, 1);

      const newState = {
        ...s,
        creaturesInvokedThisTurn: {
          ...(s.creaturesInvokedThisTurn || { player: 0, ai: 0 }),
          ai: (s.creaturesInvokedThisTurn?.ai || 0) + 1,
        },
        ai: {
          ...s.ai,
          hand,
          field: { ...s.ai.field, slots },
        },
        battleStats: {
          ...s.battleStats,
          ai: {
            ...s.battleStats.ai,
            cardsSummoned: [...s.battleStats.ai.cardsSummoned, cardId],
          },
        },
        log: [...s.log, `Oponente invocou ${creature.name} no slot ${slotIndex + 1}.`],
      };

      // Bênçãos de guardião (mesma lógica usada pela IA local) — muta newState.ai/newState.player
      // diretamente e pode agendar animações via setState (idêntico ao caminho da IA).
      const aiBlessingResult = applyAiSummonBlessings(newState, build, creatureData, slotIndex, slots, newState.log);
      newState.log = aiBlessingResult.logEntries;

      // Perk de um aliado JÁ em campo: buffa criaturas de ar recém-invocadas (ex: VERDANT_INSPIRATION)
      if (creature.element === 'ar') {
        const inspirer = newState.ai.field.slots.find(
          (slot) => slot && slot.id !== creature.id && slot.hp > 0 && slot.perkEffects?.airAllyAttackBuffOnAllySummon
        );
        if (inspirer) {
          const { value, duration } = inspirer.perkEffects.airAllyAttackBuffOnAllySummon;
          const buffedSlots = newState.ai.field.slots.map((slot) => (slot && slot.id === creature.id
            ? { ...slot, buffs: [...(slot.buffs || []), { id: `buff_air_${Date.now()}`, name: inspirer.name, stat: 'attack', value, duration, type: 'flat' }] }
            : slot));
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: buffedSlots } };
          newState.log = [...newState.log, `${inspirer.name} inspirou ${creature.name}!`];
        }
      }

      // Perk de time: concede um bônus a todos os aliados ao entrar em campo (ex: LUNAR_AURA)
      if (build.perkEffects?.teamBuffOnSummon) {
        const { stat, value, duration } = build.perkEffects.teamBuffOnSummon;
        const buffedSlots = newState.ai.field.slots.map((slot) => {
          if (!slot || slot.hp <= 0) return slot;
          const buff = { id: `buff_team_${Date.now()}_${slot.id}`, name: creature.name, stat, value, duration, type: 'flat' };
          return { ...slot, buffs: [...(slot.buffs || []), buff] };
        });
        newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: buffedSlots } };
        newState.log = [...newState.log, `${creature.name} concedeu um bônus a todos os aliados!`];
      }

      // Perk de time: aplica um status a todos os inimigos ao entrar em campo (ex: ABYSSAL_THORNS)
      if (build.perkEffects?.teamDebuffOnSummon) {
        const { status, duration, value } = build.perkEffects.teamDebuffOnSummon;
        let tsAfterDebuff = newState;
        (tsAfterDebuff.player.field.slots || []).forEach((slot) => {
          if (!slot || slot.hp <= 0) return;
          const statusResult = effectRegistry.applyStatusEffect(tsAfterDebuff, {
            targetId: slot.id, effectType: status, duration, value, attackerId: creature.id,
          });
          tsAfterDebuff = statusResult.newState;
        });
        newState.player = tsAfterDebuff.player;
        newState.log = [...newState.log, `${creature.name} afetou todos os inimigos!`];
      }

      // Perk de time: remove debuffs de todos os aliados ao entrar em campo (ex: PURE_HORIZON)
      if (build.perkEffects?.teamCleanseOnSummon) {
        const { count } = build.perkEffects.teamCleanseOnSummon;
        const cleansedSlots = newState.ai.field.slots.map((slot) => {
          if (!slot || slot.hp <= 0) return slot;
          const { buffs } = effectRegistry.removeCreatureDebuffs(slot, count);
          return { ...slot, buffs };
        });
        newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: cleansedSlots } };
        newState.log = [...newState.log, `${creature.name} purificou os aliados!`];
      }

      // Perk: aplica um debuff a 1 inimigo aleatório ao entrar em campo (ex: PIERCING_GAZE)
      if (build.perkEffects?.singleEnemyDebuffOnSummon) {
        const { stat, value, duration } = build.perkEffects.singleEnemyDebuffOnSummon;
        const enemyIndices = newState.player.field.slots
          .map((slot, idx) => (slot && slot.hp > 0 ? idx : null))
          .filter((idx) => idx !== null);
        if (enemyIndices.length > 0) {
          const targetIdx = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const targetSlot = newState.player.field.slots[targetIdx];
          const debuffResult = effectRegistry.applyDebuff(newState, {
            targetId: targetSlot.id, stat, value, duration, name: 'Enfraquecido', type: 'flat',
          });
          newState.player = debuffResult.newState.player;
          newState.log = [...newState.log, `${creature.name} enfraqueceu ${targetSlot.name}!`];
        }
      }

      return newState;
    });
  }, [resolveCreatureBuild, cardCollection, applyAiSummonBlessings]);

  // Ressuscita uma criatura do cemitério (benção do Ignis)
  const resurrectCreature = useCallback((graveyardIndex, targetSlotIndex) => {
    setState((s) => {
      if (!s.resurrectionPending) return s;

      const graveyard = [...(s.player.graveyard || [])];
      if (graveyardIndex < 0 || graveyardIndex >= graveyard.length) return s;

      const ressurectedCreature = graveyard[graveyardIndex];
      graveyard.splice(graveyardIndex, 1);

      // Gera novo instanceId mas preserva o baseId
      const baseId = ressurectedCreature.baseId || ressurectedCreature.id;
      const newInstanceId = `${baseId}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      const restoredCreature = { ...ressurectedCreature, id: newInstanceId, baseId: baseId };

      const newLog = [...s.log, `${ressurectedCreature.name} foi ressuscitado!`];
      console.log('RESURRECT - restoring creature', { ressurectedCreature, newInstanceId, targetSlotIndex });

      // Se houver slot disponível
      if (targetSlotIndex >= 0 && targetSlotIndex < 3) {
        const slots = [...s.player.field.slots];
        if (slots[targetSlotIndex]) {
          newLog.push('Slot ocupado!');
          return { ...s, log: newLog };
        }

        // Marca como temporária para que retorne ao cemitério após N turnos
        slots[targetSlotIndex] = { ...restoredCreature, temporary: true, resurrectDuration: 2 };
        console.log('RESURRECT - placed in slot', { slotIndex: targetSlotIndex, restoredCreature });
        return {
          ...s,
          player: { ...s.player, graveyard, field: { ...s.player.field, slots } },
          resurrectionPending: null,
          log: newLog,
        };
      }

      // Sem slot disponível, vai para a mão
      const hand = [...s.player.hand, newInstanceId];
      newLog.push(`${ressurectedCreature.name} foi??ara a mão.`);
      return {
        ...s,
        player: { ...s.player, graveyard, hand },
        resurrectionPending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela ressurreição
  const cancelResurrection = useCallback(() => {
    setState((s) => {
      if (!s.resurrectionPending) return s;
      return {
        ...s,
        resurrectionPending: null,
        log: [...s.log, 'Ressurreição cancelada.'],
      };
    });
  }, []);

  // Retorna uma criatura inimiga para a mão (benção do Owlberoth)
  const returnEnemyCard = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.returnCardPending) return s;

      const aiSlots = [...(s.ai?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= aiSlots.length) return s;

      const returnedCreature = aiSlots[slotIndex];
      if (!returnedCreature) return s;

      // Prepare animation on the slot (don't remove yet so animation can render)
      const creatureId = returnedCreature.id;
      const newAnimations = {
        ...(s.animations || {}),
        [creatureId]: { type: 'returningToHand', owner: 'player', slotIndex }
      };

      const newLog = [...s.log, `${returnedCreature.name} será retornado para a mão do adversário.`];

      // Play wind sound
      try {
        const audio = new Audio(airSfx);
        audio.volume = (effectsVolume ?? 50) / 100;
        audio.play().catch(() => {});
      } catch (e) {
        // ignore
      }

      // After delay (match animation duration), remove the creature from slot and add to player's hand, then clear animation
      const delayMs = 2000; // total 2s to match animation (1.8s + 0.2s)
      setTimeout(() => {
        setState((s2) => {
          const aiSlotsNow = [...(s2.ai?.field?.slots || [])];
          // make sure slot still contains the same creature id before removing
          const slotCreature = aiSlotsNow[slotIndex];
          const anims = { ...(s2.animations || {}) };

          // Return to owner (AI) hand
          let aiHand = [...(s2.ai?.hand || [])];
          if (slotCreature && slotCreature.id === creatureId) {
            aiSlotsNow[slotIndex] = null;
            aiHand = [...aiHand, slotCreature.id];
          }

          // clear animation
          delete anims[creatureId];

          return {
            ...s2,
            ai: { ...s2.ai, hand: aiHand, field: { ...s2.ai.field, slots: aiSlotsNow } },
            animations: anims,
            log: [...s2.log, `${returnedCreature.name} foi retornado para a mão do adversário!`],
          };
        });
      }, delayMs);

      // Return intermediate state with animation active
      return {
        ...s,
        ai: { ...s.ai, field: { ...s.ai.field, slots: aiSlots } },
        returnCardPending: null,
        animations: newAnimations,
        log: newLog,
      };
    });
  }, []);

  // Cancela retorno de carta
  const cancelReturnCard = useCallback(() => {
    setState((s) => {
      if (!s.returnCardPending) return s;
      return {
        ...s,
        returnCardPending: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Aplica envenenamento em uma criatura inimiga (benção do Nihil)
  const poisonEnemyCard = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.poisonPending) return s;

      const aiSlots = [...(s.ai?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= aiSlots.length) return s;

      const targetCreature = aiSlots[slotIndex];
      if (!targetCreature) return s;

      // Aplica envenenamento
      const poisonStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'poison');
      const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

      if (poisonStatusEffect) {
        // Atualiza envenenamento existente
        poisonStatusEffect.duration = Math.max(poisonStatusEffect.duration, 2);
      } else {
        // Adiciona novo envenenamento
        newStatusEffects.push({
          type: 'poison',
          duration: 2,
          source: s.poisonPending.guardianName,
        });
      }

      aiSlots[slotIndex] = { ...targetCreature, statusEffects: newStatusEffects };

      const newLog = [...s.log, `${targetCreature.name} foi envenenado por 2 turnos!`];

      return {
        ...s,
        ai: { ...s.ai, field: { ...s.ai.field, slots: aiSlots } },
        poisonPending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela envenenamento
  const cancelPoisonCard = useCallback(() => {
    setState((s) => {
      if (!s.poisonPending) return s;
      return {
        ...s,
        poisonPending: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Rouba uma carta da mão do inimigo (benção do Drazraq)
  const stealEnemyCard = useCallback((handIndex) => {
    setState((s) => {
      if (!s.stealCardPending) return s;

      const aiHand = [...(s.ai?.hand || [])];
      if (handIndex < 0 || handIndex >= aiHand.length) return s;

      const stolenCard = aiHand[handIndex];
      if (!stolenCard) return s;

      // Remove a carta da mão do inimigo
      aiHand.splice(handIndex, 1);

      // Adiciona à mão do jogador
      const playerHand = [...(s.player?.hand || []), stolenCard];

      const newLog = [...s.log, `${s.stealCardPending.guardianName} roubou uma carta da mão do oponente!`];

      return {
        ...s,
        player: { ...s.player, hand: playerHand },
        ai: { ...s.ai, hand: aiHand },
        stealCardPending: null,
        log: newLog,
      };
    });
  }, []);

  // Revela uma carta da mão do inimigo (benção do Leoracal)
  const revealEnemyCard = useCallback((handIndex) => {
    setState((s) => {
      if (!s.revealOpponentPending) return s;

      const aiHand = [...(s.ai?.hand || [])];
      if (handIndex < 0 || handIndex >= aiHand.length) return s;

      const revealedCard = aiHand[handIndex];
      if (!revealedCard) return s;

      const newLog = [...s.log, `${s.revealOpponentPending.guardianName} revelou uma carta da mão do oponente!`];

      // Marca qual índice foi revelado, mantendo o modal aberto até o jogador fechar
      return {
        ...s,
        revealOpponentSelectedIndex: handIndex,
        revealedOpponentIndex: handIndex,
        log: newLog,
      };
    });
    // agenda fechamento automático após 5 segundos
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    revealTimeoutRef.current = setTimeout(() => {
      setState((s) => ({
        ...s,
        revealOpponentPending: null,
        revealOpponentSelectedIndex: null,
        revealedOpponentIndex: null,
        log: [...s.log, 'Revelação encerrada.'],
      }));
      revealTimeoutRef.current = null;
    }, 5000);
  }, []);

  const cancelRevealEnemy = useCallback(() => {
    if (revealDelayRef.current) {
      clearTimeout(revealDelayRef.current);
      revealDelayRef.current = null;
    }
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    setState((s) => {
      if (!s.revealOpponentPending && s.revealedOpponentIndex === null) return s;
      return {
        ...s,
        revealOpponentPending: null,
        revealOpponentSelectedIndex: null,
        revealedOpponentIndex: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Cancela roubo de carta
  const cancelStealCard = useCallback(() => {
    setState((s) => {
      if (!s.stealCardPending) return s;
      return {
        ...s,
        stealCardPending: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Seleciona a criatura em campo para trocar (benção do Seract) - Passo 1
  const selectFieldCardForSwap = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.swapCardPending) return s;
      if (s.swapCardPending.step !== 'selectField') return s;

      const slots = [...(s.player?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= slots.length) return s;

      const selectedCreature = slots[slotIndex];
      if (!selectedCreature) return s;

      return {
        ...s,
        swapCardPending: {
          ...s.swapCardPending,
          step: 'selectGraveyard',
          selectedFieldSlot: slotIndex,
          selectedCreatureName: selectedCreature.name,
        },
        log: [...s.log, `Selecionou ${selectedCreature.name} para trocar. Escolha uma criatura do cemitério.`],
      };
    });
  }, []);

  // Executa a troca de criatura (benção do Seract) - Passo 2
  const completeSwap = useCallback((graveyardIndex) => {
    setState((s) => {
      if (!s.swapCardPending) return s;
      if (s.swapCardPending.step !== 'selectGraveyard') return s;

      const graveyard = [...(s.player?.graveyard || [])];
      if (graveyardIndex < 0 || graveyardIndex >= graveyard.length) return s;

      const fieldSlotIndex = s.swapCardPending.selectedFieldSlot;
      const slots = [...(s.player?.field?.slots || [])];
      if (fieldSlotIndex < 0 || fieldSlotIndex >= slots.length) return s;

      const graveyardCreature = graveyard[graveyardIndex];
      const fieldCreature = slots[fieldSlotIndex];

      if (!graveyardCreature || !fieldCreature) return s;

      // Remove do cemitério
      graveyard.splice(graveyardIndex, 1);

      // Gera novo instanceId para a criatura do cemitério, mas preserva o baseId
      const baseId = graveyardCreature.baseId || graveyardCreature.id;
      const newInstanceId = `${baseId}-${Date.now()}-${Math.floor(Math.random()*1000)}`;

      // Encontra a definição da criatura para restaurar life ao máximo
      const creatureDefinition = Object.values(require('../assets/creaturesData'))
        .flat()
        .find(c => c.id === baseId);
      const maxHp = creatureDefinition?.hp || graveyardCreature.maxHp || graveyardCreature.hp || 10;

      const restoredCreature = {
        ...graveyardCreature,
        id: newInstanceId,
        baseId: baseId,
        hp: maxHp,  // Restaura vida ao máximo
        maxHp: maxHp,
        temporary: false,  // Remove flag de temporária (se houver)
        resurrectDuration: undefined  // Remove duração (se houver)
      };

      // Troca: coloca criatura restaurada no campo e envia a antiga para cemitério
      slots[fieldSlotIndex] = restoredCreature;
      graveyard.push(fieldCreature);

      console.log('SERACT SWAP - Criatura trocada:', {
        novaCreatura: graveyardCreature.name,
        criaturaDescartada: fieldCreature.name
      });

      const newLog = [...s.log, `${graveyardCreature.name} foi trazido do cemitério, e ${fieldCreature.name} foi enviado para o cemitério!`];

      return {
        ...s,
        player: { ...s.player, graveyard, field: { ...s.player.field, slots } },
        swapCardPending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela a troca de criatura
  const cancelSwap = useCallback(() => {
    setState((s) => {
      if (!s.swapCardPending) return s;
      return {
        ...s,
        swapCardPending: null,
        log: [...s.log, 'Troca cancelada.'],
      };
    });
  }, []);

  // Aplica congelamento em uma criatura inimiga (benção do Mawthorn)
  const freezeEnemyCard = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.freezePending) return s;

      const aiSlots = [...(s.ai?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= aiSlots.length) return s;

      const targetCreature = aiSlots[slotIndex];
      if (!targetCreature) return s;

      // Aplica congelamento
      const freezeStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'freeze');
      const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

      if (freezeStatusEffect) {
        // Atualiza congelamento existente
        freezeStatusEffect.duration = Math.max(freezeStatusEffect.duration, 3);
      } else {
        // Adiciona novo congelamento
        newStatusEffects.push({
          type: 'freeze',
          duration: 3,
          source: s.freezePending.guardianName,
        });
      }

      aiSlots[slotIndex] = { ...targetCreature, statusEffects: newStatusEffects };

      const newLog = [...s.log, `${targetCreature.name} foi congelado por 3 turnos!`];

      return {
        ...s,
        ai: { ...s.ai, field: { ...s.ai.field, slots: aiSlots } },
        freezePending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela congelamento
  const cancelFreezeCard = useCallback(() => {
    setState((s) => {
      if (!s.freezePending) return s;
      return {
        ...s,
        freezePending: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Cura uma criatura aliada (benção do Ekonos)
  const healAllyCard = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.healPending) return s;

      const playerSlots = [...(s.player?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= playerSlots.length) return s;

      const targetCreature = playerSlots[slotIndex];
      if (!targetCreature) return s;

      // Aplica cura
      const healAmount = s.healPending.amount || 2;
      targetCreature.hp = Math.min(targetCreature.hp + healAmount, targetCreature.maxHp);
      playerSlots[slotIndex] = targetCreature;

      const newLog = [...s.log, `${targetCreature.name} foi curado em +${healAmount} HP!`];

      return {
        ...s,
        player: { ...s.player, field: { ...s.player.field, slots: playerSlots } },
        healPending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela cura
  const cancelHealCard = useCallback(() => {
    setState((s) => {
      if (!s.healPending) return s;
      return {
        ...s,
        healPending: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Aplica benção do Virideer (+1 HP a criatura escolhida)
  const applyVirideerBless = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.virideerBlessPending) return s;

      const playerSlots = [...(s.player?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= playerSlots.length) return s;

      const targetCreature = playerSlots[slotIndex];
      if (!targetCreature) return s;

      // Aplica +1 HP
      const healAmount = s.virideerBlessPending.amount || 2;
      targetCreature.hp = Math.min(targetCreature.hp + healAmount, targetCreature.maxHp);
      playerSlots[slotIndex] = targetCreature;

      const newLog = [...s.log, `${targetCreature.name} recebeu +${healAmount} HP pela benção de ${s.virideerBlessPending.guardianName}!`];

      // Animação de cura simples
      const animations = {
        ...(s.animations || {}),
        ...(targetCreature.id ? { [targetCreature.id]: { type: 'heal', amount: healAmount } } : {}),
      };

      return {
        ...s,
        player: { ...s.player, field: { ...s.player.field, slots: playerSlots } },
        virideerBlessPending: null,
        animations,
        log: newLog,
      };
    });
  }, []);

  // Cancela benção do Virideer
  const cancelVirideerBless = useCallback(() => {
    setState((s) => {
      if (!s.virideerBlessPending) return s;
      return {
        ...s,
        virideerBlessPending: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Invoca carta de campo (field) para o sharedField

  const invokeFieldCard = useCallback((handIndex) => {
    playFieldChangeSound();
    setState((s) => {
      // No PvP, o convidado não roda o motor localmente: envia a jogada pro anfitrião simular.
      if (s.mode === 'pvp' && s.isHost === false) {
        window.electron?.ipcRenderer?.sendP2PMessage?.(s.peerSteamId64, { type: 'action', action: 'field', handIndex });
        return s;
      }
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'player') return s;

      const hand = [...s.player.hand];
      const cardId = hand[handIndex];
      if (!cardId) return s;
      const fieldId = resolveCollectionBaseId(cardId, cardCollection);
      // Deriva flag de holo se vier de instância
      let isHolo = false;
      if (cardCollection) {
        if (cardId.includes('-')) {
          for (const [baseId, instances] of Object.entries(cardCollection)) {
            const inst = instances.find((x) => x.instanceId === cardId);
            if (inst) { isHolo = !!inst.isHolo; break; }
          }
        } else if (Array.isArray(cardCollection[cardId]) && cardCollection[cardId].length > 0) {
          isHolo = !!cardCollection[cardId][0].isHolo;
        }
      }
      const cardData = resolveFieldCardData(fieldId);
      const sharedFieldId = cardData?.id || fieldId;
      // Remove carta da mão
      hand.splice(handIndex, 1);
      // Substitui campo anterior (se houver) e envia para o cemitério de campos
      let newFieldGraveyard = Array.isArray(s.player.fieldGraveyard) ? [...s.player.fieldGraveyard] : [];
      if (s.sharedField?.active && s.sharedField?.id) {
        newFieldGraveyard.push({
          id: s.sharedField.id,
          isHolo: s.sharedField.isHolo,
          cardData: s.sharedField.cardData,
        });
      }
      const buffedCreatureIds = getFieldBuffedCreatureIds(s, cardData);
      const fieldBuffAnimations = buffedCreatureIds.reduce((acc, id) => ({
        ...acc,
        [id]: { type: 'fieldBuff' },
      }), {});
      if (buffedCreatureIds.length > 0) {
        setTimeout(() => {
          setState((s2) => {
            const anims = { ...(s2.animations || {}) };
            buffedCreatureIds.forEach((id) => {
              if (anims[id]?.type === 'fieldBuff') delete anims[id];
            });
            return { ...s2, animations: anims };
          });
        }, 2400);
      }
      return {
        ...s,
        player: {
          ...s.player,
          hand,
          fieldGraveyard: newFieldGraveyard,
        },
        sharedField: {
          active: true,
          id: sharedFieldId,
          isHolo,
          cardData,
        },
        animations: {
          ...(s.animations || {}),
          ...fieldBuffAnimations,
        },
        log: [...s.log, `Campo ${cardId} foi invocado!`],
      };
    });
  }, [playFieldChangeSound]);

  // Invoca carta de campo da IA para o sharedField
  const invokeFieldCardAI = useCallback((handIndex) => {
    playFieldChangeSound();
    setState((s) => {
      if (s.phase !== 'playing') return s;

      const hand = [...s.ai.hand];
      const cardId = hand[handIndex];
      if (!cardId) return s;
      const fieldId = resolveCollectionBaseId(cardId, cardCollection);
      const cardData = resolveFieldCardData(fieldId);
      const sharedFieldId = cardData?.id || fieldId;
      // Remove carta da mão
      hand.splice(handIndex, 1);
      // Substitui campo anterior (se houver) e envia para o cemitério de campos
      let newFieldGraveyard = Array.isArray(s.ai.fieldGraveyard) ? [...s.ai.fieldGraveyard] : [];
      if (s.sharedField?.active && s.sharedField?.id) {
        newFieldGraveyard.push({
          id: s.sharedField.id,
          isHolo: s.sharedField.isHolo,
          cardData: s.sharedField.cardData,
        });
      }
      const buffedCreatureIds = getFieldBuffedCreatureIds(s, cardData);
      const fieldBuffAnimations = buffedCreatureIds.reduce((acc, id) => ({
        ...acc,
        [id]: { type: 'fieldBuff' },
      }), {});
      if (buffedCreatureIds.length > 0) {
        setTimeout(() => {
          setState((s2) => {
            const anims = { ...(s2.animations || {}) };
            buffedCreatureIds.forEach((id) => {
              if (anims[id]?.type === 'fieldBuff') delete anims[id];
            });
            return { ...s2, animations: anims };
          });
        }, 2400);
      }
      return {
        ...s,
        ai: {
          ...s.ai,
          hand,
          fieldGraveyard: newFieldGraveyard,
        },
        sharedField: {
          active: true,
          id: sharedFieldId,
          isHolo: false,
          cardData,
        },
        animations: {
          ...(s.animations || {}),
          ...fieldBuffAnimations,
        },
        log: [...s.log, `IA invocou o campo ${cardId}!`],
      };
    });
  }, [playFieldChangeSound]);

  // ===== SISTEMA DE HABILIDADES =====
  const useAbility = useCallback((playerSide, slotIndex, abilityIndex, targetSide, targetSlotIndex) => {
    const clearAnimAfter = (creatureId, timeoutMs = 900) => {
      setTimeout(() => {
        setState((s2) => {
          const anims = { ...(s2.animations || {}) };
          if (anims[creatureId]) {
            delete anims[creatureId];
          }
          return { ...s2, animations: anims };
        });
      }, timeoutMs);
    };

    setState((s) => {
      // No PvP, o convidado não roda o motor localmente: envia a jogada pro anfitrião simular.
      if (s.mode === 'pvp' && s.isHost === false) {
        window.electron?.ipcRenderer?.sendP2PMessage?.(s.peerSteamId64, {
          type: 'action', action: 'attack', attackerSlot: slotIndex, abilityIndex, targetSlot: targetSlotIndex,
        });
        return s;
      }
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== playerSide) return s; // Só pode usar habilidade no seu turno

      const attacker = s[playerSide].field.slots[slotIndex];
      if (!attacker || attacker.hp <= 0) return s;

      // Verifica se a criatura já usou uma habilidade este turno
      const alreadyUsedAbility = s.creaturesWithUsedAbility && s.creaturesWithUsedAbility.has(attacker.id);
      const hasBonus = (attacker.bonusAbilityUses || 0) > 0;

      if (alreadyUsedAbility && !hasBonus) {
        return {
          ...s,
          log: [...s.log, `${attacker.name} já usou uma habilidade neste turno!`],
        };
      }

      // Bloqueia ação se incapacitado
      const incapacitating = (attacker.statusEffects || []).some(e => ['paralyze', 'freeze', 'sleep'].includes(e.type) && e.duration > 0);
      if (incapacitating) {
        return { ...s, log: [...s.log, `${attacker.name} está incapacitado e não pode agir.`] };
      }

      const ability = attacker.abilities[abilityIndex];
      if (!ability) return s;

      // Valida custo de essência
      const essence = s[playerSide].essence || 0;
      const normalCost = ability.cost || 0;
      const hasFree = (attacker.freeAbilityUses || 0) > 0;
      const cost = hasFree ? 0 : normalCost;

      if (essence < cost) {
        return {
          ...s,
          log: [...s.log, `Essência insuficiente! Necessário: ${cost}, Disponível: ${essence}`],
        };
      }

      // Encontra criatura alvo
      const target = s[targetSide].field.slots[targetSlotIndex];
      if (!target || target.hp <= 0) {
        return {
          ...s,
          log: [...s.log, 'Alvo inválido!'],
        };
      }

      // Usa IDs das criaturas instanciadas
      const attackerId = attacker.id;
      const targetId = target.id;

      console.log('ATAQUE - Criatura:', {
        nome: attacker.name,
        id: attackerId,
        hp: attacker.hp,
        alvo: target.name,
        targetId: targetId,
        danoBase: typeof ability.damage === 'number' ? ability.damage : (ability.cost * 2 + 1),
        habilidade: ability.name?.pt || ability.name?.en || 'Desconhecida'
      });

      // Parsing simples de efeitos pela descrição
      const descText = (ability.desc?.pt || ability.desc?.en || '').toLowerCase();
      const mappings = [
        { key: 'venen', type: 'poison', duration: 2, value: 1 },
        { key: 'poison', type: 'poison', duration: 2, value: 1 },
        { key: 'queim', type: 'burn', duration: 2, value: 1 },
        { key: 'burn', type: 'burn', duration: 2, value: 1 },
        { key: 'congel', type: 'freeze', duration: 1 },
        { key: 'freeze', type: 'freeze', duration: 1 },
        { key: 'paralis', type: 'paralyze', duration: 1 },
        { key: 'stun', type: 'paralyze', duration: 1 },
        { key: 'sono', type: 'sleep', duration: 2 },
        { key: 'sleep', type: 'sleep', duration: 2 },
        { key: 'sangr', type: 'bleed', duration: 2, value: 1 },
        { key: 'bleed', type: 'bleed', duration: 2, value: 1 },
      ];
      const match = ability.coinStatusEffect
        ? null
        : (ability.statusEffect
          ? {
              type: ability.statusEffect === 'stun' ? 'paralyze' : ability.statusEffect,
              duration: ability.duration || 1,
              value: ability.value,
            }
          : mappings.find(m => descText.includes(m.key)));
      const resolvedAbility = resolveAbility(ability);
      let result;
      let animPayload = null;

      // Aplica dano: prioriza campo 'damage' da habilidade, senão usa fórmula genérica
      const draakDamageBonus = attacker.hasDraakBlessing || attacker.baseId === 'draak'
        ? (attacker.draakDamageBonus || 0)
        : 0;
      const coinIsHeads = ability.coinExtraDamage || ability.coinSelfDamage || ability.coinStatusEffect
        ? Math.random() < 0.5
        : null;
      const coinDamageBonus = coinIsHeads && ability.coinExtraDamage ? ability.coinExtraDamage : 0;
      const baseDamage = resolvedAbility.damage + draakDamageBonus + coinDamageBonus;
      result = effectRegistry.applyDamage(s, {
        attackerId,
        targetId,
        baseDamage,
        attackerElement: attacker.element,
        ignoreShield: !!ability.removeShield,
        applyCombatPerks: true,
      });

      // Marca a criatura como tendo usado uma habilidade neste turno
      const updatedUsedAbilities = new Set(s.creaturesWithUsedAbility || []);
      updatedUsedAbilities.add(attackerId);

      // Atualiza bônus temporários (Roenhell)
      const updatedAttacker = { ...attacker };
      if (attacker.hasDraakBlessing || attacker.baseId === 'draak') {
        updatedAttacker.draakPendingDamageBonus = (updatedAttacker.draakPendingDamageBonus || 0) + 1;
      }
      if (hasFree) {
        updatedAttacker.freeAbilityUses = (updatedAttacker.freeAbilityUses || 2) - 1;
      }
      if (hasBonus) {
        updatedAttacker.bonusAbilityUses = (updatedAttacker.bonusAbilityUses || 1) - 1;
      }

      // Atualiza o attacker nos slots do jogador
      const updatedSlots = s[playerSide].field.slots.map((slot, idx) =>
        idx === slotIndex ? updatedAttacker : slot
      );

      // PASSO 1: Mostra animação de ataque no atacante
      const stateWithAttackAnim = {
        ...s,
        [playerSide]: { ...s[playerSide], field: { ...s[playerSide].field, slots: updatedSlots } },
        animations: {
          ...(s.animations || {}),
          [attackerId]: { type: 'attacking' },
        },
      };

      // Remove animação do atacante após 400ms
      setTimeout(() => {
        setState((s2) => {
          const anims = { ...(s2.animations || {}) };
          if (anims[attackerId]?.type === 'attacking') {
            delete anims[attackerId];
          }
          return { ...s2, animations: anims };
        });
      }, 400);

      // PASSO 2: Após delay, aplica dano e mostra animação de dano
      setTimeout(() => {

        setState((s2) => {
          animPayload = {
            type: 'damage',
            amount: result.damageDealt,
            hasAdvantage: !!result.hasAdvantage,
            hasDisadvantage: !!result.hasDisadvantage,
            shieldHit: !!result.shieldHit,
            shieldBroken: !!result.shieldBroken,
          };

          // Se tiver status effect na descrição, aplica também
          let sleepApplied = false;
          if (!ability.coinStatusEffect) resolvedAbility.statuses.forEach((status) => {
            console.log('Aplicando status effect adicional:', status.type);
            const statusResult = effectRegistry.applyStatusEffect(result.newState, {
              targetId,
              effectType: status.type,
              duration: status.duration,
              value: status.value,
              attackerId,
            });
            // Detecta se foi aplicado sleep
            if (status.type === 'sleep') {
              // Verifica se o status foi realmente aplicado (duração > 0)
              const targetAfter = statusResult.newState[targetSide].field.slots.find(slot => slot?.id === targetId);
              if (targetAfter && (targetAfter.statusEffects || []).some(e => e.type === 'sleep' && e.duration > 0)) {
                sleepApplied = true;
              }
            }
            result.newState = statusResult.newState;
            result.log = [...result.log, ...statusResult.log];
          });

          // Deduz essência e aplica animação de dano
          if (resolvedAbility.heal) {
            const healResult = effectRegistry.applyHeal(result.newState, {
              targetId: attackerId,
              healAmount: resolvedAbility.heal,
            });
            result.newState = healResult.newState;
            result.log = [...result.log, ...healResult.log];
          }

          if (resolvedAbility.shield) {
            const shieldResult = effectRegistry.applyShield(result.newState, {
              targetId: attackerId,
              shieldAmount: resolvedAbility.shield,
              duration: ability.duration || 1,
            });
            result.newState = shieldResult.newState;
            result.log = [...result.log, ...shieldResult.log];
          }

          if (ability.coinStatusEffect && coinIsHeads) {
            const statusResult = effectRegistry.applyStatusEffect(result.newState, {
              targetId,
              effectType: ability.coinStatusEffect,
              duration: ability.coinStatusDuration || 1,
              value: ability.coinStatusValue,
              attackerId,
            });
            result.newState = statusResult.newState;
            result.log = [...result.log, 'Moeda: cara.', ...statusResult.log];
          } else if (ability.coinStatusEffect) {
            result.log = [...result.log, 'Moeda: coroa. O efeito adicional não ativou.'];
          }

          if (ability.removeShield && (target.shield || 0) > 0) {
            result.newState = effectRegistry.updateCreature(result.newState, targetId, { shield: 0, shieldTurns: 0 });
            result.log = [...result.log, `${target.name} perdeu o escudo ativo.`];
          }

          if (ability.coinExtraDamage || ability.coinSelfDamage) {
            result.log = [...result.log, coinIsHeads ? 'Moeda: cara. Dano aumentado.' : 'Moeda: coroa. Draak sofre o recuo.'];
            if (!coinIsHeads && ability.coinSelfDamage) {
              const selfDamageResult = effectRegistry.applyDamage(result.newState, {
                attackerId: targetId,
                targetId: attackerId,
                baseDamage: ability.coinSelfDamage,
                attackerElement: target.element,
                ignoreShield: false,
              });
              result.newState = selfDamageResult.newState;
              result.log = [...result.log, ...selfDamageResult.log];
            }
          }

          let animationsPayload = {
            ...(s2.animations || {}),
            ...(animPayload ? { [targetId]: animPayload } : {}),
          };
          // Se aplicou sleep, adiciona animação de sleep
          if (sleepApplied) {
            animationsPayload[targetId] = { ...animationsPayload[targetId], type: 'sleep' };
            // Remove animação de sleep após 1.2s
            clearAnimAfter(targetId, 1200);
          } else {
            // Remove animação de dano após 900ms
            clearAnimAfter(targetId, 900);
          }

          const stateWithDamage = {
            ...result.newState,
            creaturesWithUsedAbility: updatedUsedAbilities,
            [playerSide]: {
              ...result.newState[playerSide],
              essence: essence - cost,
              field: {
                ...result.newState[playerSide].field,
                slots: (result.newState[playerSide].field.slots || []).map((slot, idx) =>
                  idx === slotIndex && slot?.id === attackerId
                    ? { ...slot, ...updatedAttacker, hp: slot.hp, maxHp: slot.maxHp }
                    : slot
                ),
              },
            },
            log: [
              ...result.newState.log,
              `${attacker.name} usou ${ability.name?.pt || ability.name?.en || 'habilidade'} (custo: ${cost})`,
              ...result.log,
            ],
            animations: animationsPayload,
          };

          // PASSO 3: Se a criatura morreu, adiciona delay antes da animação de morte
          if (result.died) {
            const targetCreature = stateWithDamage[targetSide].field.slots.find(slot => slot?.id === targetId);
            if (targetCreature) {
              // Delay adicional antes da animação de morte
              setTimeout(() => {
                setState((s3) => {
                  // Adiciona animação de morte
                  const stateWithDeath = {
                    ...s3,
                    animations: {
                      ...(s3.animations || {}),
                      [targetId]: { death: true },
                    },
                  };

                  // Aguarda 600ms (duração da animação de morte) para remover do campo
                  setTimeout(() => {
                    setState((s4) => {
                      const updated = { ...s4 };
                      updated[targetSide].field.slots = updated[targetSide].field.slots.map(slot => slot?.id === targetId ? null : slot);
                      return updated;
                    });
                  }, 600);

                  return stateWithDeath;
                });
              }, 400); // Delay de 400ms antes da animação de morte

              // Prepara estado final (sem remover do campo ainda)
              stateWithDamage[targetSide].graveyard = [...(stateWithDamage[targetSide].graveyard || []), targetCreature];
              stateWithDamage[targetSide].orbs = Math.max(0, (stateWithDamage[targetSide].orbs || 5) - 1);
              stateWithDamage[playerSide] = {
                ...stateWithDamage[playerSide],
                essence: (stateWithDamage[playerSide].essence || 0) + 1,
              };
              if (ability.healOnKill) {
                const healResult = effectRegistry.applyHeal(stateWithDamage, {
                  targetId: attackerId,
                  healAmount: ability.healOnKill,
                });
                Object.assign(stateWithDamage, healResult.newState);
                stateWithDamage.log = [...stateWithDamage.log, ...healResult.log];
              }
              stateWithDamage.essenceRewardPulse = {
                side: playerSide,
                id: `${playerSide}-${targetId}-${Date.now()}`,
              };

              // Adiciona ao killFeed
              stateWithDamage.killFeed = [...(stateWithDamage.killFeed || []), {
                turn: stateWithDamage.turn,
                attacker: attacker?.name || 'Atacante',
                attackerId,
                target: targetCreature.name,
                targetId: targetCreature.id,
                hadAdvantage: !!result.hasAdvantage,
              }];

              // Registra o kill nas estatísticas
              stateWithDamage.battleStats = {
                ...stateWithDamage.battleStats,
                [playerSide]: {
                  ...stateWithDamage.battleStats[playerSide],
                  cardsKilled: [...stateWithDamage.battleStats[playerSide].cardsKilled, attackerId],
                },
              };

              stateWithDamage.log.push(`${targetCreature.name} foi derrotado! ${stateWithDamage[targetSide].orbs === 0 ? '⚰️ FIM DE JOGO!' : '⚰️ -1 orbe'}`);

              // Verifica se o jogo acabou
              if (stateWithDamage[targetSide].orbs === 0) {
                const winner = targetSide === 'ai' ? 'player' : 'ai';
                stateWithDamage.phase = 'ended';
                stateWithDamage.gameResult = {
                  winner,
                  loser: targetSide,
                  kills: stateWithDamage.killFeed,
                  turns: stateWithDamage.turn,
                  stats: stateWithDamage.battleStats,
                };
              }
            }
          }

          return stateWithDamage;
        });
      }, 300); // Delay de 300ms antes de aplicar o dano

      // Retorna estado inicial com animação de ataque
      return stateWithAttackAnim;
    });
  }, []);

  // Funções para gerenciar cartas de efeito
  const sacrificeCreature = useCallback((side, slotIndex) => {
    setState((s) => {
      // No PvP, o convidado não roda o motor localmente: envia a jogada pro anfitrião simular.
      if (s.mode === 'pvp' && s.isHost === false) {
        window.electron?.ipcRenderer?.sendP2PMessage?.(s.peerSteamId64, { type: 'action', action: 'sacrifice', slotIndex });
        return s;
      }
      if (s.phase !== 'playing') return s;
      // Fora do PvP, só o jogador humano sacrifica por essa ação (a IA nunca chamou isso).
      // No PvP, o anfitrião também aplica sacrifícios do lado 'ai' (o convidado).
      if (side !== 'player' && !(s.mode === 'pvp' && side === 'ai')) return s;
      if (s.activePlayer !== side) return s;

      const slots = [...(s[side]?.field?.slots || [])];
      const creature = slots[slotIndex];
      if (!creature || creature.hp <= 0) return s;

      slots[slotIndex] = null;

      return {
        ...s,
        [side]: {
          ...s[side],
          essence: (s[side].essence || 0) + 1,
          field: {
            ...s[side].field,
            slots,
          },
          graveyard: [...(s[side].graveyard || []), creature],
        },
        essenceRewardPulse: {
          side,
          id: `sacrifice-${creature.id}-${Date.now()}`,
        },
        log: [...(s.log || []), `${creature.name} foi sacrificado. +1 essência.`],
      };
    });
  }, []);

  const playEffectCard = useCallback((handIndex, targetInfo = null) => {
    setState((s) => {
      // No PvP, o convidado não roda o motor localmente: envia a jogada pro anfitrião simular.
      // targetInfo já vem resolvido pela seleção local (selectEffectCardTarget/updateEffectCardTarget
      // rodam só no cliente, sem mutar o estado real — por isso não precisam de rede).
      if (s.mode === 'pvp' && s.isHost === false) {
        window.electron?.ipcRenderer?.sendP2PMessage?.(s.peerSteamId64, { type: 'action', action: 'effect', handIndex, targetInfo });
        return s;
      }
      let newState = JSON.parse(JSON.stringify(s));
      const cardId = s.player.hand[handIndex];

      if (!cardId) return s;

      // Busca o baseId: pode ser direto um baseId ou um instanceId
      let baseId = null;

      // Primeiro, verifica se é um baseId direto (effect_xxx)
      if (String(cardId).toLowerCase().startsWith('effect_')) {
        baseId = cardId;
      } else {
        // Senão, busca no cardCollection
        Object.keys(cardCollection).forEach(key => {
          const instances = cardCollection[key];
          if (instances.some(inst => inst.instanceId === cardId)) {
            baseId = key;
          }
        });
      }

      if (!baseId) {
        console.warn(`BaseId not found for instance: ${cardId}`);
        return s;
      }

      // Encontra a carta de efeito no arquivo correto
      let effectCard = null;
      if (String(baseId).toLowerCase().startsWith('effect_')) {
        try {
          const effectCards = require('../assets/cards/effectCards');
          effectCard = effectCards.find(c => c.id === baseId);
        } catch (e) {
          console.warn(`Effect card not found in playEffectCard: ${baseId}`, e);
          return s;
        }
      }

      if (!effectCard) {
        console.warn(`Effect card is null: ${baseId}`);
        return s;
      }

      // Executa o efeito
      const { executeEffectCard } = require('../logic/ai');
      newState = executeEffectCard(newState, effectCard, targetInfo);

      // Restaura creaturesWithUsedAbility como Set (foi perdido em JSON.parse/stringify)
      newState.creaturesWithUsedAbility = new Set(s.creaturesWithUsedAbility || []);

      // Limpa pendência da Compra Reversa (se houver)
      newState.drawOpponentPending = null;

      // Remove a carta da mao
      if (targetInfo?.sacrificeCardId) {
        const effectIndex = newState.player.hand.indexOf(cardId);
        if (effectIndex !== -1) {
          newState.player.hand.splice(effectIndex, 1);
        }
      } else {
        newState.player.hand = newState.player.hand.filter((_, idx) => idx !== handIndex);
      }

      // Limpa state de espera
      newState.effectCardPending = null;

      // Armazena a última carta descartada para animação
      newState.lastDiscardedEffectCard = cardId;

      // Remove a flag de animação após 800ms (duração da animação)
      setTimeout(() => {
        setState(s => ({
          ...s,
          lastDiscardedEffectCard: null
        }));
      }, 800);

      // Log
      const effectName = typeof effectCard.name === 'object' ? effectCard.name.pt : effectCard.name;
      log(`Jogou ${effectName}`);

      // Se o executeEffectCard anexou animações (ex: damageAll), agenda limpeza e remoção de mortos
      if (newState.animations && Object.keys(newState.animations).length > 0) {
        const animTargets = Object.keys(newState.animations);

        // Limpa animações de dano após 900ms
        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            animTargets.forEach(id => {
              if (anims[id] && anims[id].type === 'damage') {
                delete anims[id];
              }
            });
            return { ...s2, animations: anims };
          });
        }, 900);

        // Para cada target que morreu, anima morte e remove depois
        animTargets.forEach((targetId) => {
          const targetCreature = (newState.ai?.field?.slots || []).find(slot => slot?.id === targetId);
          if (targetCreature && targetCreature.hp <= 0) {
            // Adiciona animação de morte após pequeno delay
            setTimeout(() => {
              setState(s3 => ({
                ...s3,
                animations: { ...(s3.animations || {}), [targetId]: { death: true } }
              }));

              // Remove a criatura do campo após 600ms e atualiza cemitério/orbs/killfeed
              setTimeout(() => {
                setState(s4 => {
                  const updated = { ...s4 };
                  const targetCreatureNow = updated.ai.field.slots.find(slot => slot?.id === targetId);
                  if (targetCreatureNow) {
                    updated.ai.field.slots = updated.ai.field.slots.map(slot => slot?.id === targetId ? null : slot);
                    updated.ai.graveyard = [...(updated.ai.graveyard || []), targetCreatureNow];
                    updated.ai.orbs = Math.max(0, (updated.ai.orbs || 5) - 1);
                    updated.player = {
                      ...updated.player,
                      essence: (updated.player.essence || 0) + 1,
                    };
                    updated.essenceRewardPulse = {
                      side: 'player',
                      id: `player-${targetId}-${Date.now()}`,
                    };
                    updated.killFeed = [...(updated.killFeed || []), {
                      turn: updated.turn,
                      attacker: effectName || 'Effect',
                      attackerId: effectCard.id,
                      target: targetCreatureNow.name,
                      targetId: targetCreatureNow.id,
                      hadAdvantage: false,
                    }];

                    updated.battleStats = {
                      ...updated.battleStats,
                      player: {
                        ...updated.battleStats.player,
                        cardsKilled: [...(updated.battleStats.player.cardsKilled || []), effectCard.id],
                      },
                    };

                    updated.log = [...updated.log, `${targetCreatureNow.name} foi derrotado! ${updated.ai.orbs === 0 ? '⚰️ FIM DE JOGO!' : '⚰️ -1 orbe'}`];

                    if (updated.ai.orbs === 0) {
                      updated.phase = 'ended';
                      updated.gameResult = {
                        winner: 'player',
                        loser: 'ai',
                        kills: updated.killFeed,
                        turns: updated.turn,
                        stats: updated.battleStats,
                      };
                    }
                  }
                  return updated;
                });
              }, 600);
            }, 300);
          }
        });
      }

      return newState;
    });
  }, [cardCollection, log]);

  // Versão de playEffectCard para o lado 'ai' (usada no modo PvP para aplicar uma carta de
  // efeito jogada pelo convidado). executeEffectCard (ai.js) assume caster="player"/alvo="ai"
  // em todos os tipos de efeito — em vez de duplicar a lógica de cada um, invertemos
  // player<->ai (e battleStats.player<->battleStats.ai) só na chamada, e desfazemos a troca
  // no resultado. O resto da função (descarte da mão, limpeza de animação, morte por
  // damageAll, recompensa de essência, fim de jogo) é o mesmo código de playEffectCard com
  // "player" e "ai" trocados.
  const playEffectCardForOpponent = useCallback((handIndex, targetInfo = null) => {
    setState((s) => {
      let newState = JSON.parse(JSON.stringify(s));
      const cardId = s.ai.hand[handIndex];

      if (!cardId) return s;

      let baseId = null;
      if (String(cardId).toLowerCase().startsWith('effect_')) {
        baseId = cardId;
      } else {
        Object.keys(cardCollection).forEach(key => {
          const instances = cardCollection[key];
          if (instances.some(inst => inst.instanceId === cardId)) {
            baseId = key;
          }
        });
      }

      if (!baseId) {
        console.warn(`BaseId not found for instance: ${cardId}`);
        return s;
      }

      let effectCard = null;
      if (String(baseId).toLowerCase().startsWith('effect_')) {
        try {
          const effectCards = require('../assets/cards/effectCards');
          effectCard = effectCards.find(c => c.id === baseId);
        } catch (e) {
          console.warn(`Effect card not found in playEffectCardForOpponent: ${baseId}`, e);
          return s;
        }
      }

      if (!effectCard) {
        console.warn(`Effect card is null: ${baseId}`);
        return s;
      }

      // Executa o efeito com player/ai (e battleStats) invertidos
      const { executeEffectCard } = require('../logic/ai');
      const swappedIn = {
        ...newState,
        player: newState.ai,
        ai: newState.player,
        activePlayer: 'player',
        battleStats: { ...newState.battleStats, player: newState.battleStats.ai, ai: newState.battleStats.player },
      };
      const swappedOut = executeEffectCard(swappedIn, effectCard, targetInfo);
      newState = {
        ...swappedOut,
        player: swappedOut.ai,
        ai: swappedOut.player,
        activePlayer: s.activePlayer,
        battleStats: { ...swappedOut.battleStats, player: swappedOut.battleStats.ai, ai: swappedOut.battleStats.player },
      };

      newState.creaturesWithUsedAbility = new Set(s.creaturesWithUsedAbility || []);
      newState.drawOpponentPending = null;

      if (targetInfo?.sacrificeCardId) {
        const effectIndex = newState.ai.hand.indexOf(cardId);
        if (effectIndex !== -1) {
          newState.ai.hand.splice(effectIndex, 1);
        }
      } else {
        newState.ai.hand = newState.ai.hand.filter((_, idx) => idx !== handIndex);
      }

      newState.effectCardPending = null;
      newState.lastDiscardedEffectCard = cardId;

      setTimeout(() => {
        setState(s2 => ({ ...s2, lastDiscardedEffectCard: null }));
      }, 800);

      const effectName = typeof effectCard.name === 'object' ? effectCard.name.pt : effectCard.name;
      newState.log = [...(newState.log || []), `Oponente jogou ${effectName}`];

      if (newState.animations && Object.keys(newState.animations).length > 0) {
        const animTargets = Object.keys(newState.animations);

        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            animTargets.forEach(id => {
              if (anims[id] && anims[id].type === 'damage') {
                delete anims[id];
              }
            });
            return { ...s2, animations: anims };
          });
        }, 900);

        animTargets.forEach((targetId) => {
          const targetCreature = (newState.player?.field?.slots || []).find(slot => slot?.id === targetId);
          if (targetCreature && targetCreature.hp <= 0) {
            setTimeout(() => {
              setState(s3 => ({
                ...s3,
                animations: { ...(s3.animations || {}), [targetId]: { death: true } },
              }));

              setTimeout(() => {
                setState(s4 => {
                  const updated = { ...s4 };
                  const targetCreatureNow = updated.player.field.slots.find(slot => slot?.id === targetId);
                  if (targetCreatureNow) {
                    updated.player.field.slots = updated.player.field.slots.map(slot => slot?.id === targetId ? null : slot);
                    updated.player.graveyard = [...(updated.player.graveyard || []), targetCreatureNow];
                    updated.player.orbs = Math.max(0, (updated.player.orbs || 5) - 1);
                    updated.ai = {
                      ...updated.ai,
                      essence: (updated.ai.essence || 0) + 1,
                    };
                    updated.essenceRewardPulse = {
                      side: 'ai',
                      id: `ai-${targetId}-${Date.now()}`,
                    };
                    updated.killFeed = [...(updated.killFeed || []), {
                      turn: updated.turn,
                      attacker: effectName || 'Effect',
                      attackerId: effectCard.id,
                      target: targetCreatureNow.name,
                      targetId: targetCreatureNow.id,
                      hadAdvantage: false,
                    }];

                    updated.battleStats = {
                      ...updated.battleStats,
                      ai: {
                        ...updated.battleStats.ai,
                        cardsKilled: [...(updated.battleStats.ai.cardsKilled || []), effectCard.id],
                      },
                    };

                    updated.log = [...updated.log, `${targetCreatureNow.name} foi derrotado! ${updated.player.orbs === 0 ? '⚰️ FIM DE JOGO!' : '⚰️ -1 orbe'}`];

                    if (updated.player.orbs === 0) {
                      updated.phase = 'ended';
                      updated.gameResult = {
                        winner: 'ai',
                        loser: 'player',
                        kills: updated.killFeed,
                        turns: updated.turn,
                        stats: updated.battleStats,
                      };
                    }
                  }
                  return updated;
                });
              }, 600);
            }, 300);
          }
        });
      }

      return newState;
    });
  }, [cardCollection]);

  const selectEffectCardTarget = useCallback((handIndex) => {
    const cardId = state.player.hand[handIndex];
    console.log('1. selectEffectCardTarget chamado. handIndex:', handIndex, 'cardId:', cardId);

    // Busca o baseId: pode ser direto um baseId ou um instanceId
    let baseId = null;

    // Primeiro, verifica se é um baseId direto (effect_xxx)
    if (String(cardId).toLowerCase().startsWith('effect_')) {
      baseId = cardId;
      console.log('2. BaseId encontrado direto:', baseId);
    } else {
      // Senão, busca no cardCollection
      Object.keys(cardCollection).forEach(key => {
        const instances = cardCollection[key];
        if (instances.some(inst => inst.instanceId === cardId)) {
          baseId = key;
        }
      });
      console.log('2. BaseId encontrado na coleção:', baseId);
    }

    // Busca carta de efeito no arquivo correto
    let effectCard = null;
    if (baseId && String(baseId).toLowerCase().startsWith('effect_')) {
      try {
        const effectCards = require('../assets/cards/effectCards');
        effectCard = effectCards.find(c => c.id === baseId);
        console.log('3. Carta de efeito encontrada:', effectCard);
      } catch (e) {
        console.warn(`Effect card not found: ${baseId}`, e);
        return;
      }
    }

    if (!effectCard) {
      console.warn(`Effect card not found for baseId: ${baseId}`);
      return;
    }

    // Compra Reversa: aguarda clique no baralho do adversário
    if (effectCard.effectType === 'drawOpponent') {
      setState(s => ({
        ...s,
        drawOpponentPending: { handIndex, baseId }
      }));
      return;
    }

    console.log('4. targetType:', effectCard.targetType);

    if (effectCard.targetType === 'self' || effectCard.targetType === 'allAllies' || effectCard.targetType === 'allEnemies' || effectCard.targetType === 'opponent') {
      // Não requer seleção de alvo, jogar direto
      console.log('5. Jogando carta diretamente (sem alvo)');
      playEffectCard(handIndex);
    } else {
      // Requer seleção de alvo
      console.log('5. Setando effectCardPending:', {
        handIndex,
        baseId,
        requiresTarget: true,
        targetType: effectCard.targetType
      });
      setState(s => {
        console.log('6. setState executado. Estado anterior effectCardPending:', s.effectCardPending);
        return {
          ...s,
          effectCardPending: {
            handIndex,
            baseId,
            requiresTarget: true,
            targetType: effectCard.targetType
          }
        };
      });
    }
  }, [state.player.hand, cardCollection, playEffectCard]);

  const cancelEffectCard = useCallback(() => {
    setState(s => ({
      ...s,
      effectCardPending: null
    }));
  }, []);

  const cancelDrawOpponent = useCallback(() => {
    setState(s => ({
      ...s,
      drawOpponentPending: null
    }));
  }, []);

  const updateEffectCardTarget = useCallback((allyIndex) => {
    setState(s => ({
      ...s,
      effectCardPending: {
        ...s.effectCardPending,
        selectedAllyIndex: allyIndex
      }
    }));
  }, []);

  // Funções para ataque espectral (Sepultura do Espectro)
  const selectSpectralAbility = useCallback((abilityIndex) => {
    setState(s => ({
      ...s,
      spectralAttackPending: {
        ...s.spectralAttackPending,
        selectedAbility: abilityIndex
      }
    }));
  }, []);

  const executeSpectralAttack = useCallback((targetSlotIndex) => {
    setState(s => {
      // Sepultura do Espectro ainda não tem suporte em rede no PvP (carta rara, fatia futura).
      if (s.mode === 'pvp' && s.isHost === false) {
        return { ...s, log: [...s.log, 'Esse ataque espectral ainda não está disponível no PvP.'] };
      }
      if (!s.spectralAttackPending) return s;

      if (s.spectralAttackPending.resolving) return s;

      const { creature, selectedAbility } = s.spectralAttackPending;
      const ability = creature.abilities?.[selectedAbility];

      if (!ability) return s;

      // Executa o ataque usando a lógica padrão
      const target = s.ai.field.slots[targetSlotIndex];
      if (!target || target.hp <= 0) return s;

      // Aplica dano do ataque espectral
      const baseDamage = typeof ability.damage === 'number' ? ability.damage : (ability.cost * 2 + 1);
      const result = effectRegistry.applyDamage(s, {
        attackerId: creature.id,
        targetId: target.id,
        baseDamage,
        attackerElement: creature.element,
        ignoreShield: false,
      });

      const abilityName = typeof ability.name === 'object' ? ability.name.pt : ability.name;
      const creatureName = typeof creature.name === 'object' ? creature.name.pt : creature.name;

      const nextState = {
        ...result.newState,
        spectralAttackPending: {
          ...s.spectralAttackPending,
          selectedAbility: undefined,
          resolving: true,
        },
        log: [...result.newState.log, `${creatureName} atacou do cemitério com ${abilityName}!`]
      };

      // Mostra animação de dano
      const animPayload = {
        type: 'damage',
        amount: result.damageDealt,
        hasAdvantage: !!result.hasAdvantage,
        hasDisadvantage: !!result.hasDisadvantage,
        shieldHit: !!result.shieldHit,
        shieldBroken: !!result.shieldBroken,
      };

      nextState.animations = {
        ...nextState.animations,
        [target.id]: animPayload,
      };

      // Remove animação de dano após 900ms
      setTimeout(() => {
        setState(s2 => {
          const anims = { ...(s2.animations || {}) };
          if (anims[target.id]?.type === 'damage') {
            delete anims[target.id];
          }
          return { ...s2, animations: anims };
        });
      }, 900);

      // Processa morte se necessário
      if (result.died) {
        setTimeout(() => {
          setState(s2 => {
            // Adiciona animação de morte
            const stateWithDeath = {
              ...s2,
              animations: {
                ...(s2.animations || {}),
                [target.id]: { death: true },
              },
            };

            // Aguarda 600ms (duração da animação de morte) para remover do campo
            setTimeout(() => {
              setState(s3 => {
                const updated = { ...s3 };
                updated.ai.field.slots = updated.ai.field.slots.map(slot => slot?.id === target.id ? null : slot);
                return updated;
              });
            }, 600);

            return stateWithDeath;
          });
        }, 400);

        // Adiciona ao cemitério e diminui orbs
        nextState.ai.graveyard = [...(nextState.ai.graveyard || []), target];
        nextState.ai.orbs = Math.max(0, (nextState.ai.orbs || 5) - 1);
        nextState.player = {
          ...nextState.player,
          essence: (nextState.player.essence || 0) + 1,
        };
        nextState.essenceRewardPulse = {
          side: 'player',
          id: `player-${target.id}-${Date.now()}`,
        };
        nextState.log.push(`${target.name} foi derrotado! ${nextState.ai.orbs === 0 ? '⚰️ FIM DE JOGO!' : '⚰️ -1 orbe'}`);

        // Adiciona ao killFeed
        nextState.killFeed = [...(nextState.killFeed || []), {
          turn: nextState.turn,
          attacker: creature?.name || 'Espectro',
          attackerId: creature.id,
          target: target.name,
          targetId: target.id,
          hadAdvantage: !!result.hasAdvantage,
        }];

        // Verifica se o jogo acabou
        if (nextState.ai.orbs === 0) {
          nextState.phase = 'ended';
          nextState.gameResult = {
            winner: 'player',
            loser: 'ai',
            kills: nextState.killFeed,
            turns: nextState.turn,
            stats: nextState.battleStats,
          };
        }
      }

      setTimeout(() => {
        setState(s2 => ({
          ...s2,
          spectralAttackPending: null
        }));
      }, result.died ? 1400 : 700);

      return nextState;
    });
  }, []);

  const cancelSpectralAttack = useCallback(() => {
    setState(s => ({
      ...s,
      spectralAttackPending: null
    }));
  }, []);

  const value = useMemo(() => ({
    state,
    startBattle,
    endTurn,
    drawPlayerCard,
    summonFromHand,
    invokeFieldCard,
    invokeFieldCardAI,
    useAbility,
    sacrificeCreature,
    resurrectCreature,
    cancelResurrection,
    returnEnemyCard,
    cancelReturnCard,
    poisonEnemyCard,
    cancelPoisonCard,
    stealEnemyCard,
    revealEnemyCard,
    cancelStealCard,
    cancelRevealEnemy,
    selectFieldCardForSwap,
    completeSwap,
    cancelSwap,
    freezeEnemyCard,
    cancelFreezeCard,
    healAllyCard,
    cancelHealCard,
    applyVirideerBless,
    cancelVirideerBless,
    log,
    playEffectCard,
    selectEffectCardTarget,
    updateEffectCardTarget,
    cancelEffectCard,
    cancelDrawOpponent,
    selectSpectralAbility,
    executeSpectralAttack,
    cancelSpectralAttack,
    triggerAnimation,
    startPlaying: (firstPlayer) => {
      setState(s => {
        // No PvP, quem decide o primeiro a jogar é o anfitrião — o convidado só espera o
        // broadcast real (evita que os dois lados sorteiem vencedores diferentes do coinflip).
        if (s.mode === 'pvp' && s.isHost === false) return s;
        return {
          ...s,
          phase: 'playing',
          activePlayer: firstPlayer === 'player' ? 'player' : 'ai',
        };
      });
    },
  }), [state, startBattle, endTurn, drawPlayerCard, summonFromHand, invokeFieldCard, invokeFieldCardAI, useAbility, sacrificeCreature, resurrectCreature, cancelResurrection, returnEnemyCard, cancelReturnCard, poisonEnemyCard, cancelPoisonCard, stealEnemyCard, revealEnemyCard, cancelStealCard, cancelRevealEnemy, selectFieldCardForSwap, completeSwap, cancelSwap, freezeEnemyCard, cancelFreezeCard, healAllyCard, cancelHealCard, applyVirideerBless, cancelVirideerBless, log, playEffectCard, selectEffectCardTarget, updateEffectCardTarget, cancelEffectCard, cancelDrawOpponent, selectSpectralAbility, executeSpectralAttack, cancelSpectralAttack]);

  // Expose a debug helper on window to trigger the Owlberoth return animation from the console
  React.useEffect(() => {
    try {
      window.showOwlberothAnim = (slotIndex) => {
        console.log('[debug] showOwlberothAnim called for slot', slotIndex);
        try {
          // Log slot element if present
          const playerSlots = document.querySelectorAll('.slots-player .slot, .slots-slots-player .slot');
          const el = playerSlots && playerSlots[slotIndex] ? playerSlots[slotIndex] : null;
          console.log('[debug] resolved slot element:', el);
        } catch (e) {
          console.log('[debug] cannot resolve slot element:', e);
        }
        triggerAnimation({ type: 'returningToHand', owner: 'player', slotIndex, duration: 2000 });
      };
      // Direct DOM injector for quick visual test (no state changes)
      window.debugWindBlow = (slotIndexOrSelector) => {
        try {
          let slotEl = null;
          if (typeof slotIndexOrSelector === 'number') {
            const playerSlots = document.querySelectorAll('.slots-player .slot, .slots-slots-player .slot');
            slotEl = playerSlots && playerSlots[slotIndexOrSelector] ? playerSlots[slotIndexOrSelector] : null;
          } else if (typeof slotIndexOrSelector === 'string') {
            slotEl = document.querySelector(slotIndexOrSelector);
          }
          if (!slotEl) slotEl = document.querySelector('.slot.occupied');
          if (!slotEl) return console.warn('No slot element found to inject wind-blow');
          const div = document.createElement('div');
          div.className = 'wind-blow wind-blow-player';
          slotEl.style.overflow = 'visible';
          slotEl.appendChild(div);
          setTimeout(() => div.remove(), 2000);
        } catch (err) {
          console.error('debugWindBlow error', err);
        }
      };
    } catch (e) {
      // ignore in non-browser environments
    }
    return () => {
      try { delete window.showOwlberothAnim; } catch (e) {}
      try { delete window.debugWindBlow; } catch (e) {}
    };
  }, [triggerAnimation]);

  const applyAiSummonBlessings = useCallback((s, build, creatureData, summonSlotIndex, aiSlots, logEntries) => {
    const creatureName = creatureData.name?.pt || creatureData.name?.en || creatureData.id;
    let nextLog = logEntries;

    const applyStatusEffect = (targetCreature, type, duration, sourceName) => {
      const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];
      const existing = newStatusEffects.find(e => e.type === type);
      if (existing) {
        existing.duration = Math.max(existing.duration, duration);
      } else {
        newStatusEffects.push({ type, duration, source: sourceName });
      }
      return { ...targetCreature, statusEffects: newStatusEffects };
    };

    const getRandomIndex = (indices) => indices[Math.floor(Math.random() * indices.length)];

    if (creatureData.defaultBlessing?.id === 'griffor_blessing') {
      const summoned = aiSlots?.[summonSlotIndex];
      if (summoned) {
        aiSlots[summonSlotIndex] = {
          ...summoned,
          shield: Math.max(summoned.shield || 0, 3),
          shieldTurns: Math.max(summoned.shieldTurns || 0, 3),
        };
        s.ai = { ...s.ai, field: { ...s.ai.field, slots: aiSlots } };
        nextLog = [...nextLog, `${creatureName} recebeu Escudo Celestial por 3 turnos!`];
      }
    }

    // Ekeranth: queimadura em todos os inimigos (jogador)
    if (build.hasEkerenthBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const updated = playerSlots.map((slot) => {
        if (!slot) return slot;
        return applyStatusEffect(slot, 'burn', 2, creatureName);
      });
      s.player = { ...s.player, field: { ...s.player.field, slots: updated } };
      nextLog = [...nextLog, 'Todos os seus inimigos foram queimados por 2 turnos!'];
    }

    // Elderox (IA): concede double-damage temporário para aliados da IA neste turno
    if (build.hasElderoxBlessing) {
      s.elderoxDoubleDamage = { ...(s.elderoxDoubleDamage || {}), ai: true };
      nextLog = [...nextLog, `${creatureName} concedeu DOBRO de dano para as criaturas da IA neste turno!`];
      console.log('Elderox blessing (AI summon) activated double-damage marker');
      // Animação: agendamos a ativação da animação no instanceId (usando aiSlots local passado) para
      // rodar depois do render — garante que os refs dos slots existam quando o portal calcular posições
      try {
        const inst = (aiSlots || [])[summonSlotIndex];
        if (inst && inst.id) {
          const instId = inst.id;
          setTimeout(() => {
            console.log('Adding elderox animation (ai) for', instId, 'slotIndex', summonSlotIndex);
            setState(s2 => {
              const anims = { ...(s2.animations || {}) };
              anims[instId] = { type: 'elderoxDouble', owner: 'ai', slotIndex: summonSlotIndex };
              console.log('State update: elderox animation added (ai) for', instId);
              return { ...s2, animations: anims };
            });
            // schedule removal
            setTimeout(() => {
              console.log('Removing elderox animation (ai) for', instId);
              setState(s3 => {
                const anims2 = { ...(s3.animations || {}) };
                delete anims2[instId];
                return { ...s3, animations: anims2 };
              });
            }, 1200);
          }, 1000);
          console.log('Elderox animation scheduled (ai) for', instId, 'slotIndex', summonSlotIndex, 'will run in ~1s');
        }
      } catch (e) {
        // ignore
      }
    }

    // Owlberoth: retorna criatura inimiga (jogador) para a mão
    if (build.hasOwlberothBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const returned = playerSlots[idx];

        // Prepare animation on the player's slot — don't remove yet so animation can render
        try {
          s.animations = { ...(s.animations || {}), [returned.id]: { type: 'returningToHand', owner: 'player', slotIndex: idx } };
        } catch (e) {}

        nextLog = [...nextLog, `${creatureName} retornará ${returned.name} para a mão do jogador!`];

        // Play wind sound
        try {
          const audio = new Audio(airSfx);
          audio.volume = (effectsVolume ?? 50) / 100;
          audio.play().catch(() => {});
        } catch (e) {}

        // After delay, remove from slot and add to player's hand, then clear animation
        const delayMs = 2000;
        setTimeout(() => {
          setState((s2) => {
            const playerSlotsNow = [...(s2.player?.field?.slots || [])];
            const slotCreature = playerSlotsNow[idx];
            const anims = { ...(s2.animations || {}) };
            let playerHand = [...(s2.player?.hand || [])];
            if (slotCreature && slotCreature.id === returned.id) {
              playerSlotsNow[idx] = null;
              playerHand = [...playerHand, slotCreature.id];
            }
            delete anims[returned.id];
            return {
              ...s2,
              player: { ...s2.player, hand: playerHand, field: { ...s2.player.field, slots: playerSlotsNow } },
              animations: anims,
              log: [...(s2.log || []), `${returned.name} foi retornado para a mão do jogador!`],
            };
          });
        }, delayMs);
      }
    }

    // Nihil: envenena criatura inimiga (jogador)
    if (build.hasNihilBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const target = playerSlots[idx];
        playerSlots[idx] = applyStatusEffect(target, 'poison', 2, creatureName);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} envenenou ${target.name} por 2 turnos!`];
      }
    }

    // Leoracal (visão): revela carta da mão do oponente
    if (build.hasLeoracalBlessing) {
      const playerHand = [...(s.player?.hand || [])];
      if (playerHand.length > 0) {
        const indices = playerHand.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
        if (indices.length > 0) {
          const idx = getRandomIndex(indices);
          // mark reveal pending with owner 'ai' so UI shows player's hand as target
          s.revealOpponentPending = {
            guardianId: creatureData.id || creatureName,
            guardianName: creatureName,
            owner: 'ai',
          };
          s.revealOpponentSelectedIndex = idx;
          s.revealedOpponentIndex = null;
          nextLog = [...nextLog, `${creatureName} revelou uma carta da mão do jogador!`];

          // schedule automatic closing of reveal after 5s
          try {
            if (revealDelayRef.current) clearTimeout(revealDelayRef.current);
            if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
          } catch (e) {}
          revealDelayRef.current = setTimeout(() => {
            setState((s2) => ({
              ...s2,
              revealedOpponentIndex: idx,
            }));
            revealDelayRef.current = null;
          }, 950);
          revealTimeoutRef.current = setTimeout(() => {
            setState((s2) => ({
              ...s2,
              revealOpponentPending: null,
              revealOpponentSelectedIndex: null,
              revealedOpponentIndex: null,
              log: [...(s2.log || []), 'Revelação encerrada.'],
            }));
            revealTimeoutRef.current = null;
          }, 5000);
        }
      }
    }

    // Drazraq: rouba carta da mão do jogador
    if (build.hasDrazraqBlessing) {
      const playerHand = [...(s.player?.hand || [])];
      if (playerHand.length > 0) {
        const idx = Math.floor(Math.random() * playerHand.length);
        const stolen = playerHand[idx];
        playerHand.splice(idx, 1);
        const aiHand = [...(s.ai?.hand || []), stolen];
        s.player = { ...s.player, hand: playerHand };
        s.ai = { ...s.ai, hand: aiHand };
        nextLog = [...nextLog, `${creatureName} roubou uma carta da sua mão!`];
      }
    }

    // Seract: troca uma criatura em campo por uma do cemitério (lado IA)
    if (build.hasSeractBlessing) {
      const aiGraveyard = [...(s.ai?.graveyard || [])];
      const indices = aiSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (aiGraveyard.length > 0 && indices.length > 0) {
        const fieldIdx = getRandomIndex(indices);
        const graveIdx = Math.floor(Math.random() * aiGraveyard.length);
        const fieldCreature = aiSlots[fieldIdx];
        const graveCreature = aiGraveyard[graveIdx];
        aiGraveyard.splice(graveIdx, 1);
        aiSlots[fieldIdx] = graveCreature;
        aiGraveyard.push(fieldCreature);
        s.ai = { ...s.ai, graveyard: aiGraveyard, field: { ...s.ai.field, slots: aiSlots } };
        nextLog = [...nextLog, `${creatureName} trocou ${fieldCreature.name} pelo retorno de ${graveCreature.name}!`];
      }
    }

    // Noctyra: drena 1 vida do jogador se IA não estiver com 5 orbs
    if (build.hasNoctyraBlessing) {
      const aiOrbs = s.ai?.orbs || 0;
      const playerOrbs = s.player?.orbs || 0;
      if (aiOrbs < 5 && playerOrbs > 0) {
        s.ai = { ...s.ai, orbs: Math.min(aiOrbs + 1, 5) };
        s.player = { ...s.player, orbs: Math.max(playerOrbs - 1, 0) };
        if (s.player.orbs === 0) {
          s.phase = 'ended';
          s.gameResult = {
            winner: 'ai',
            loser: 'player',
            kills: s.killFeed,
            turns: s.turn,
            stats: s.battleStats,
          };
          nextLog = [...nextLog, 'A Noctyra drenou seu último orbe! FIM DE JOGO!'];
        }
        nextLog = [...nextLog, `${creatureName} drenou 1 vida do seu guardião!`];
      }
    }

    // Mawthorn: congela criatura inimiga (jogador)
    if (build.hasMawthornBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const target = playerSlots[idx];
        playerSlots[idx] = applyStatusEffect(target, 'freeze', 3, creatureName);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} congelou ${target.name} por 3 turnos!`];
      }
    }

    // Alatoy: paralisa criatura inimiga (jogador)
    if (build.hasAlatoyBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const target = playerSlots[idx];
        console.log('ALATOY BLESSING - applying paralyze', { targetId: target?.id, targetName: target?.name, duration: 3, source: creatureName });
        playerSlots[idx] = applyStatusEffect(target, 'paralyze', 3, creatureName);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} paralisou ${target.name} por 2 turnos!`];
      }
    }

    // Roenhell (IA): permite atacar 2 vezes sem gastar mana
    if (build.hasRoenhellBlessing) {
      // A criatura já foi criada, apenas marca para ter bônus
      const creature = creatureData;
      creature.bonusAbilityUses = 1;
      creature.freeAbilityUses = 2;
      creature.abilityUseBuffTurns = 1;
      nextLog = [...nextLog, `${creatureName} pode atacar 2 vezes neste turno sem consumir mana!`];
    }

    // Moar (IA): congela todas as criaturas do jogador por 2 turnos
    if (build.hasMoarBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const updated = playerSlots.map(slot => {
        if (!slot) return slot;
        const freezeStatusEffect = slot.statusEffects?.find(e => e.type === 'freeze');
        const newStatusEffects = slot.statusEffects ? [...slot.statusEffects] : [];

        if (freezeStatusEffect) {
          freezeStatusEffect.duration = Math.max(freezeStatusEffect.duration, 2);
        } else {
          newStatusEffects.push({
            type: 'freeze',
            duration: 2,
            source: creatureName,
          });
        }
        return { ...slot, statusEffects: newStatusEffects };
      });
      s.player = { ...s.player, field: { ...s.player.field, slots: updated } };
      nextLog = [...nextLog, `${creatureName} congelou todas as suas criaturas por 2 turnos!`];
    }

    // Arigus (IA): retorna criatura aleatória do jogador para a mão
    if (build.hasArigusBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const returned = playerSlots[idx];
        const returnedId = returned.id;
        s.animations = {
          ...(s.animations || {}),
          [returnedId]: { type: 'returningToHand', owner: 'ai', slotIndex: idx, source: 'arigus' },
        };
        try {
          const audio = new Audio(airSfx);
          audio.volume = (effectsVolume ?? 50) / 100;
          audio.play().catch(() => {});
        } catch (e) {}
        setTimeout(() => {
          setState((s2) => {
            const playerSlotsNow = [...(s2.player?.field?.slots || [])];
            const slotCreature = playerSlotsNow[idx];
            const anims = { ...(s2.animations || {}) };
            let playerHand = [...(s2.player?.hand || [])];

            if (slotCreature && slotCreature.id === returnedId) {
              playerSlotsNow[idx] = null;
              playerHand = [...playerHand, slotCreature.id];
            }

            delete anims[returnedId];

            return {
              ...s2,
              player: { ...s2.player, hand: playerHand, field: { ...s2.player.field, slots: playerSlotsNow } },
              animations: anims,
              log: [...(s2.log || []), `${returned.name} foi empurrado de volta para a sua mao!`],
            };
          });
        }, 1050);
        nextLog = [...nextLog, `${creatureName} retornou ${returned.name} para a sua mão!`];
      }
    }

    // Pawferion: imunidade a debuffs para aliados (IA)
    if (build.hasPawferionBlessing) {
      const updated = aiSlots.map(slot => (slot ? { ...slot, debuffImmunity: 3 } : slot));
      aiSlots.splice(0, aiSlots.length, ...updated);
      nextLog = [...nextLog, `${creatureName} concedeu imunidade a debuffs para a IA por 3 turnos!`];
    }

    // Ekonos: cura criatura aliada (IA)
    if (build.hasEkonosBlessing) {
      const indices = aiSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null && idx !== summonSlotIndex);
      let targetIdx = summonSlotIndex;
      if (indices.length > 0) {
        targetIdx = getRandomIndex(indices);
      }
      const target = aiSlots[targetIdx];
      if (target) {
        aiSlots[targetIdx] = { ...target, hp: Math.min((target.hp || 0) + 2, target.maxHp || target.hp || 0) };
        nextLog = [...nextLog, `${creatureName} curou ${aiSlots[targetIdx].name} em +2 HP!`];
      }
    }

    // Beoxyr: dano + queimadura em criatura inimiga (jogador)
    if (build.hasBeoxyrBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const target = playerSlots[idx];
        target.hp = Math.max(0, target.hp - 2);
        playerSlots[idx] = applyStatusEffect(target, 'burn', 2, creatureName);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 2 de dano e queimou ${target.name} por 2 turnos!`];
      }
    }

    // Arguilia: +1 HP para criaturas de água (IA)
    if (build.hasArguíliaBlessing) {
      const healedIds = [];
      const updated = aiSlots.map((slot) => {
        if (!slot) return slot;
        if (slot.element === 'agua') {
          healedIds.push(slot.id);
          if (slot.hp >= slot.maxHp) {
            return { ...slot, hp: slot.hp + 1, maxHp: slot.maxHp + 1 };
          }
          return { ...slot, hp: Math.min(slot.hp + 1, slot.maxHp) };
        }
        return slot;
      });
      aiSlots.splice(0, aiSlots.length, ...updated);
      if (healedIds.length > 0) {
        nextLog = [...nextLog, `${creatureName} concedeu +1 HP para ${healedIds.length} criatura(s) de água da IA!`];
        s.animations = {
          ...(s.animations || {}),
          ...healedIds.reduce((acc, id) => ({ ...acc, [id]: { type: 'heal', amount: 1, icon: 'heart' } }), {}),
        };
        // Remove animação após 900ms
        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            healedIds.forEach(id => delete anims[id]);
            return { ...s2, animations: anims };
          });
        }, 900);
      }
    }

    // Kael: 1 dano 3 vezes ou 3 de dano direto
    if (build.hasKaelBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length === 1) {
        const idx = indices[0];
        const target = playerSlots[idx];
        target.hp = Math.max(0, target.hp - 3);
        playerSlots[idx] = target;
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 3 de dano direto a ${target.name}!`];
      } else if (indices.length > 1) {
        for (let i = 0; i < 3; i += 1) {
          const idx = getRandomIndex(indices);
          const target = playerSlots[idx];
          target.hp = Math.max(0, target.hp - 1);
          playerSlots[idx] = target;
        }
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 1 de dano 3 vezes a criaturas aleatórias!`];
      }
    }

    // Zephyron: paralisa todas as criaturas do jogador por 2 turnos
    if (build.hasZephyronBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const updated = playerSlots.map((slot) => {
        if (!slot) return slot;
        return applyStatusEffect(slot, 'paralyze', 2, creatureName);
      });
      s.player = { ...s.player, field: { ...s.player.field, slots: updated } };
      nextLog = [...nextLog, `${creatureName} paralisou todas as suas criaturas por 2 turnos!`];
    }

    // Ashfang: 1 de dano + queimadura 3 turnos
    if (build.hasAshfangBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const target = playerSlots[idx];
        console.debug('Ashfang blessing (AI summon) applying to player target', { targetId: target?.id, targetName: target?.name });
        target.hp = Math.max(0, target.hp - 1);
        playerSlots[idx] = applyStatusEffect(target, 'burn', 3, creatureName);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 1 de dano e queimou ${target.name} por 3 turnos!`];
        s.log = nextLog;
        Object.assign(s, settleDefeatedCreature(s, {
          targetSide: 'player',
          targetId: target.id,
          killerSide: 'ai',
          killerId: (aiSlots || [])[summonSlotIndex]?.id || creatureData.id,
          killerName: creatureName,
          by: 'Ashfang',
        }));
        nextLog = s.log;
      }
    }

    // Perk de um aliado da IA JÁ em campo: buffa criaturas de ar recém-invocadas (ex: VERDANT_INSPIRATION)
    if (creatureData.element === 'ar') {
      const summoned = (aiSlots || [])[summonSlotIndex];
      const inspirer = (aiSlots || []).find(
        (slot) => slot && slot !== summoned && slot.hp > 0 && slot.perkEffects?.airAllyAttackBuffOnAllySummon
      );
      if (summoned && inspirer) {
        const { value, duration } = inspirer.perkEffects.airAllyAttackBuffOnAllySummon;
        aiSlots[summonSlotIndex] = {
          ...summoned,
          buffs: [...(summoned.buffs || []), { id: `buff_air_${Date.now()}`, name: inspirer.name, stat: 'attack', value, duration, type: 'flat' }],
        };
        s.ai = { ...s.ai, field: { ...s.ai.field, slots: aiSlots } };
        nextLog = [...nextLog, `${inspirer.name} inspirou ${creatureName}!`];
      }
    }

    // Perk de time: concede um bônus a todos os aliados da IA ao entrar em campo (ex: LUNAR_AURA)
    if (build.perkEffects?.teamBuffOnSummon) {
      const { stat, value, duration } = build.perkEffects.teamBuffOnSummon;
      const buffedSlots = (aiSlots || []).map((slot) => {
        if (!slot || slot.hp <= 0) return slot;
        const buff = { id: `buff_team_${Date.now()}_${slot.id}`, name: creatureName, stat, value, duration, type: 'flat' };
        return { ...slot, buffs: [...(slot.buffs || []), buff] };
      });
      s.ai = { ...s.ai, field: { ...s.ai.field, slots: buffedSlots } };
      nextLog = [...nextLog, `${creatureName} concedeu um bônus a todos os aliados!`];
    }

    // Perk de time: aplica um status a todos os inimigos (jogador) ao entrar em campo (ex: ABYSSAL_THORNS)
    if (build.perkEffects?.teamDebuffOnSummon) {
      const { status, duration } = build.perkEffects.teamDebuffOnSummon;
      const playerSlots = [...(s.player?.field?.slots || [])];
      const updated = playerSlots.map((slot) => {
        if (!slot || slot.hp <= 0) return slot;
        return applyStatusEffect(slot, status, duration, creatureName);
      });
      s.player = { ...s.player, field: { ...s.player.field, slots: updated } };
      nextLog = [...nextLog, `${creatureName} afetou todos os inimigos!`];
    }

    // Perk de time: remove debuffs de todos os aliados da IA ao entrar em campo (ex: PURE_HORIZON)
    if (build.perkEffects?.teamCleanseOnSummon) {
      const { count } = build.perkEffects.teamCleanseOnSummon;
      const cleansedSlots = (aiSlots || []).map((slot) => {
        if (!slot || slot.hp <= 0) return slot;
        const { buffs } = effectRegistry.removeCreatureDebuffs(slot, count);
        return { ...slot, buffs };
      });
      s.ai = { ...s.ai, field: { ...s.ai.field, slots: cleansedSlots } };
      nextLog = [...nextLog, `${creatureName} purificou os aliados!`];
    }

    // Perk: aplica um debuff a 1 inimigo (jogador) aleatório ao entrar em campo (ex: PIERCING_GAZE)
    if (build.perkEffects?.singleEnemyDebuffOnSummon) {
      const { stat, value, duration } = build.perkEffects.singleEnemyDebuffOnSummon;
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot && slot.hp > 0 ? idx : null)).filter((idx) => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const debuffResult = effectRegistry.applyDebuff(s, {
          targetId: playerSlots[idx].id, stat, value, duration, name: 'Enfraquecido', type: 'flat',
        });
        s.player = debuffResult.newState.player;
        nextLog = [...nextLog, `${creatureName} enfraqueceu ${playerSlots[idx].name}!`];
      }
    }

    return { logEntries: nextLog };
  }, [settleDefeatedCreature]);

  const getAiAttackOption = useCallback((s) => {
    const aiSlots = s.ai?.field?.slots || [];
    const playerSlots = s.player?.field?.slots || [];
    const usedAbilities = s.creaturesWithUsedAbility || new Set();
    const currentEssence = s.ai?.essence || 0;

    const possibleTargets = playerSlots
      .map((slot, idx) => (slot && slot.hp > 0 ? { slotIndex: idx, creature: slot } : null))
      .filter(Boolean);

    if (possibleTargets.length === 0) return null;

    const possibleAttackers = aiSlots
      .map((slot, idx) => {
        if (!slot || slot.hp <= 0) return null;

        const incapacitating = (slot.statusEffects || []).some(e => ['paralyze', 'freeze', 'sleep'].includes(e.type) && e.duration > 0);
        if (incapacitating) return null;

        const alreadyUsedAbility = usedAbilities.has(slot.id);
        const hasBonus = (slot.bonusAbilityUses || 0) > 0;
        if (alreadyUsedAbility && !hasBonus) return null;

        const hasFree = (slot.freeAbilityUses || 0) > 0;
        const affordableAbilities = (slot.abilities || [])
          .map((ability, abilityIndex) => ({
            abilityIndex,
            cost: hasFree ? 0 : (ability.cost || 0),
            damage: typeof ability.damage === 'number' ? ability.damage : ((ability.cost || 0) * 2 + 1),
          }))
          .filter(option => option.cost <= currentEssence);

        if (affordableAbilities.length === 0) return null;

        affordableAbilities.sort((a, b) => b.damage - a.damage || b.cost - a.cost);
        return {
          slotIndex: idx,
          creature: slot,
          ability: affordableAbilities[0],
        };
      })
      .filter(Boolean);

    if (possibleAttackers.length === 0) return null;

    possibleAttackers.sort((a, b) => b.ability.damage - a.ability.damage || b.creature.hp - a.creature.hp);
    possibleTargets.sort((a, b) => (a.creature.hp || 0) - (b.creature.hp || 0));

    const attacker = possibleAttackers[0];
    const target = possibleTargets[0];

    return {
      attackerSlot: attacker.slotIndex,
      targetSlot: target.slotIndex,
      abilityIndex: attacker.ability.abilityIndex,
      attackerName: attacker.creature.name,
    };
  }, []);

  const continueAiCombat = useCallback((delayMs = 900) => {
    setTimeout(() => {
      let shouldEndTurn = false;

      setState((s) => {
        if (s.phase !== 'playing' || s.activePlayer !== 'ai') return s;
        if (s.aiPendingAttack || s.aiTurnEnding) return s;

        const nextAttack = getAiAttackOption(s);
        if (nextAttack) {
          return {
            ...s,
            aiPendingAttack: {
              attackerSlot: nextAttack.attackerSlot,
              targetSlot: nextAttack.targetSlot,
              abilityIndex: nextAttack.abilityIndex,
            },
            log: [...(s.log || []), `IA está preparando um ataque com ${nextAttack.attackerName}!`],
          };
        }

        shouldEndTurn = true;
        return { ...s, aiTurnEnding: true };
      });

      if (shouldEndTurn) {
        setTimeout(() => {
          endTurn();
        }, 350);
      }
    }, delayMs);
  }, [endTurn, getAiAttackOption]);

  const performAiTurn = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'ai') return s;

      let hand = [...s.ai.hand];
      let slots = [...s.ai.field.slots];
      let updated = false;
      let logEntries = [...s.log];

      // PRIORIDADE 0: Se a IA ainda não invocou neste turno, pode invocar 1 criatura (se houver slot e carta)
      // Limite: AI pode invocar no máximo 1 criatura por turno
      const canInvokeCreatureInitially = (s.creaturesInvokedThisTurn?.ai || 0) < 1;
      if (canInvokeCreatureInitially) {
        // procura a carta invocável na mão (pula efeitos e cartas de campo)
        let cardToInvoke = null;
        let cardIndex = -1;
        for (let i = 0; i < hand.length; i += 1) {
          const cId = hand[i];
          if (!cId) continue;
          if (String(cId).toLowerCase().startsWith('effect_') || /^f\d{3}$/i.test(cId) || String(cId).toLowerCase().startsWith('field_')) continue;
          cardToInvoke = cId;
          cardIndex = i;
          break;
        }

        const emptySlotIndex = slots.findIndex((slot) => !slot);
        if (cardToInvoke && emptySlotIndex >= 0) {
          hand.splice(cardIndex, 1);
          const creatureData = creaturesPool.find(c => c.id === cardToInvoke) || {};
          const build = resolveCreatureBuild(creatureData, getAiBuildOptions(s, creatureData));
          const instanceId = `${cardToInvoke}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const summonAtk = build.atk + (
            build.perkEffects?.dragonAllyAttackBonus && slots.some(slot => isDragonCreature(slot)) ? 1 : 0
          );
          slots[emptySlotIndex] = {
            id: instanceId,
            baseId: cardToInvoke,
            name: creatureData.name?.pt || creatureData.name?.en || cardToInvoke,
            type: creatureData.type?.pt || creatureData.type?.en,
            element: creatureData.element || 'puro',
            hp: build.hp,
            maxHp: build.maxHp,
            atk: summonAtk,
            def: build.def,
            abilities: build.abilities,
            buffs: buildInitialBuffs(build),
            debuffs: [],
            shield: build.perkEffects?.shieldOnSummon?.amount || 0,
            shieldTurns: build.perkEffects?.shieldOnSummon?.duration || 0,
            statusEffects: [],
            firstAttackNegated: !!build.perkEffects?.firstAttackNegated,
            perkEffects: build.perkEffects || {},
            hasGravhyrBlessing: !!build.hasGravhyrBlessing,
            hasDraakBlessing: !!build.hasDraakBlessing,
          };

          const aiBlessingResult = applyAiSummonBlessings(s, build, creatureData, emptySlotIndex, slots, logEntries);
          logEntries = aiBlessingResult.logEntries;
          updated = true;
          logEntries = [...logEntries, `IA priorizou invocar ${cardToInvoke} no slot ${emptySlotIndex + 1} para evitar perda de orbe.`];
          s.battleStats.ai.cardsSummoned = [...s.battleStats.ai.cardsSummoned, cardToInvoke];

          // Agendamos um ataque logo após a invocação, se houver alvos, para permitir que a IA ataque
          if (false) setTimeout(() => {
            try {
              setState((s2) => {
                if (s2.phase !== 'playing' || s2.activePlayer !== 'ai') return s2;
                const aiSlotsNow = s2.ai.field.slots || [];
                const enemySlotsNow = s2.player.field.slots || [];
                // encontra um atacante válido (tem abilities e não está incapacitado)
                const possibleAttackers = aiSlotsNow.map((slot, idx) => {
                  if (!slot || slot.hp <= 0) return null;
                  const incapacitating = (slot.statusEffects || []).some(e => ['paralyze', 'freeze', 'sleep'].includes(e.type) && e.duration > 0);
                  if (incapacitating) return null;
                  if (!slot.abilities || slot.abilities.length === 0) return null;
                  return { slotIndex: idx, creature: slot };
                }).filter(Boolean);
                const possibleTargets = enemySlotsNow.map((slot, idx) => (slot && slot.hp > 0) ? { slotIndex: idx, creature: slot } : null).filter(Boolean);
                if (possibleAttackers.length > 0 && possibleTargets.length > 0) {
                  const attacker = possibleAttackers[Math.floor(Math.random() * possibleAttackers.length)];
                  const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
                  const abilityIndex = Math.floor(Math.random() * (attacker.creature.abilities.length || 1));
                  return { ...s2, aiPendingAttack: { attackerSlot: attacker.slotIndex, targetSlot: target.slotIndex, abilityIndex }, };
                }
                return s2;
              });
            } catch (e) {
              // ignore
            }
          }, 300);

          // Retorna estado atualizado imediatamente, priorizando a invocação
          return {
            ...s,
            creaturesInvokedThisTurn: {
              ...(s.creaturesInvokedThisTurn || { player: 0, ai: 0 }),
              ai: (s.creaturesInvokedThisTurn?.ai || 0) + 1,
            },
            ai: {
              ...s.ai,
              hand,
              field: { ...s.ai.field, slots },
            },
            log: logEntries,
          };
        }
      }

      // PRIORIDADE 1: Verifica se há criaturas da IA que podem atacar
      const aiCreaturesWithAbilities = slots.map((slot, i) => {
        if (!slot || slot.hp <= 0) return null;
        // Verifica se está incapacitado
        const incapacitating = (slot.statusEffects || []).some(e => ['paralyze', 'freeze', 'sleep'].includes(e.type) && e.duration > 0);
        if (incapacitating) return null;
        // Verifica se tem habilidades
        if (!slot.abilities || slot.abilities.length === 0) return null;
        return { slotIndex: i, creature: slot };
      }).filter(Boolean);

      // Se houver criaturas que podem atacar E inimigos para atacar
      const enemyCreatures = s.player.field.slots.map((slot, i) => {
        if (!slot || slot.hp <= 0) return null;
        return { slotIndex: i, creature: slot };
      }).filter(Boolean);

      if (false && aiCreaturesWithAbilities.length > 0 && enemyCreatures.length > 0) {
        // Escolhe uma criatura aleatória da IA para atacar
        const attacker = aiCreaturesWithAbilities[Math.floor(Math.random() * aiCreaturesWithAbilities.length)];
        // Escolhe um inimigo aleatório
        const target = enemyCreatures[Math.floor(Math.random() * enemyCreatures.length)];
        // Escolhe uma habilidade aleatória
        const abilityIndex = Math.floor(Math.random() * attacker.creature.abilities.length);

        // Usa a habilidade (vai fazer ataque dentro do setState)
        // Precisamos chamar useAbility aqui, mas é complexo porque está dentro de performAiTurn
        // Solução: retornamos o state normalmente e deixamos que o useAbility seja chamado depois
        logEntries = [...logEntries, `IA está preparando um ataque com ${attacker.creature.name}!`];

        // Armazena a intenção de ataque para processar depois
        return {
          ...s,
          aiPendingAttack: {
            attackerSlot: attacker.slotIndex,
            targetSlot: target.slotIndex,
            abilityIndex,
          },
          log: logEntries,
        };
      }

      // PRIORIDADE 2: Verifica se há cartas de campo na mão da IA
      const fieldCardIndex = hand.findIndex((cardId) => cardId && (/^f\d{3}$/i.test(cardId) || String(cardId).toLowerCase().startsWith('field_')));

      if (fieldCardIndex >= 0) {
        // IA tem uma carta de campo, invoca ela no sharedField (sobrescreve a anterior)
        const cardId = hand[fieldCardIndex];
        const fieldId = getBaseCardId(cardId);
        const cardData = resolveFieldCardData(fieldId);
        const sharedFieldId = cardData?.id || fieldId;
        const buffedCreatureIds = getFieldBuffedCreatureIds(s, cardData);
        const fieldBuffAnimations = buffedCreatureIds.reduce((acc, id) => ({
          ...acc,
          [id]: { type: 'fieldBuff' },
        }), {});
        if (buffedCreatureIds.length > 0) {
          setTimeout(() => {
            setState((s2) => {
              const anims = { ...(s2.animations || {}) };
              buffedCreatureIds.forEach((id) => {
                if (anims[id]?.type === 'fieldBuff') delete anims[id];
              });
              return { ...s2, animations: anims };
            });
          }, 2400);
        }
        hand.splice(fieldCardIndex, 1);
        logEntries = [...logEntries, `IA invocou o campo ${cardId}!`];

        return {
          ...s,
          ai: {
            ...s.ai,
            hand,
          },
          sharedField: {
            active: true,
            id: sharedFieldId,
            isHolo: false,
            cardData,
          },
          animations: {
            ...(s.animations || {}),
            ...fieldBuffAnimations,
          },
          log: logEntries,
        };
      }

      // PRIORIDADE 3: Se nao tem carta de campo, invoca criaturas (máximo 1 por turno)
      const action = chooseAction(s);
      const emptyIndex = slots.findIndex((slot) => !slot);
      const canInvokeCreature = (s.creaturesInvokedThisTurn?.ai || 0) < 1;

      if (canInvokeCreature && action?.type === 'summon' && typeof action.handIndex === 'number' && typeof action.slotIndex === 'number') {
        const { handIndex, slotIndex } = action;
        if (hand[handIndex] && !slots[slotIndex]) {
          const cardId = hand[handIndex];
          hand.splice(handIndex, 1);
            const creatureData = creaturesPool.find(c => c.id === cardId) || {};
            const build = resolveCreatureBuild(creatureData, getAiBuildOptions(s, creatureData));
            const instanceId = `${cardId}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            const summonAtk = build.atk + (
              build.perkEffects?.dragonAllyAttackBonus && slots.some(slot => isDragonCreature(slot)) ? 1 : 0
            );
            slots[slotIndex] = {
            id: instanceId,
            baseId: cardId,
            name: creatureData.name?.pt || creatureData.name?.en || cardId,
            type: creatureData.type?.pt || creatureData.type?.en,
            element: creatureData.element || 'puro',
            hp: build.hp,
            maxHp: build.maxHp,
            atk: summonAtk,
            def: build.def,
            abilities: build.abilities,
            buffs: buildInitialBuffs(build),
            debuffs: [],
            shield: build.perkEffects?.shieldOnSummon?.amount || 0,
            shieldTurns: build.perkEffects?.shieldOnSummon?.duration || 0,
            statusEffects: [],
            firstAttackNegated: !!build.perkEffects?.firstAttackNegated,
            perkEffects: build.perkEffects || {},
            hasGravhyrBlessing: !!build.hasGravhyrBlessing,
            hasDraakBlessing: !!build.hasDraakBlessing,
          };
          const aiBlessingResult = applyAiSummonBlessings(s, build, creatureData, slotIndex, slots, logEntries);
          logEntries = aiBlessingResult.logEntries;
          updated = true;
          logEntries = [...logEntries, `IA invocou ${cardId} no slot ${slotIndex + 1}.`];
          // Registra invocação nas estatísticas
          s.battleStats.ai.cardsSummoned = [...s.battleStats.ai.cardsSummoned, cardId];
        }
      } else if (emptyIndex >= 0 && hand.length > 0 && canInvokeCreature) {
        // Procura a primeira carta que NÃO seja de campo ou efeito
        let cardToInvoke = null;
        let cardIndex = -1;

        for (let i = 0; i < hand.length; i++) {
          const cId = hand[i];
          // Pula cartas de efeito e campo
          if (String(cId).toLowerCase().startsWith('effect_') || /^f\d{3}$/i.test(cId) || String(cId).toLowerCase().startsWith('field_')) {
            continue;
          }
          cardToInvoke = cId;
          cardIndex = i;
          break;
        }

        if (cardToInvoke) {
          hand.splice(cardIndex, 1);
          const creatureData = creaturesPool.find(c => c.id === cardToInvoke) || {};
          const build = resolveCreatureBuild(creatureData, getAiBuildOptions(s, creatureData));
          const instanceId = `${cardToInvoke}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
          const summonAtk = build.atk + (
            build.perkEffects?.dragonAllyAttackBonus && slots.some(slot => isDragonCreature(slot)) ? 1 : 0
          );
          slots[emptyIndex] = {
            id: instanceId,
            baseId: cardToInvoke,
            name: creatureData.name?.pt || creatureData.name?.en || cardToInvoke,
            type: creatureData.type?.pt || creatureData.type?.en,
            element: creatureData.element || 'puro',
            hp: build.hp,
            maxHp: build.maxHp,
            atk: summonAtk,
            def: build.def,
            abilities: build.abilities,
            buffs: buildInitialBuffs(build),
            debuffs: [],
          shield: build.perkEffects?.shieldOnSummon?.amount || 0,
          shieldTurns: build.perkEffects?.shieldOnSummon?.duration || 0,
          statusEffects: [],
          firstAttackNegated: !!build.perkEffects?.firstAttackNegated,
          perkEffects: build.perkEffects || {},
          hasGravhyrBlessing: !!build.hasGravhyrBlessing,
          hasDraakBlessing: !!build.hasDraakBlessing,
        };
        const aiBlessingResult = applyAiSummonBlessings(s, build, creatureData, emptyIndex, slots, logEntries);
        logEntries = aiBlessingResult.logEntries;
        updated = true;
        logEntries = [...logEntries, `IA invocou ${cardToInvoke} no slot ${emptyIndex + 1}.`];
        // Registra invocação nas estatísticas
        s.battleStats.ai.cardsSummoned = [...s.battleStats.ai.cardsSummoned, cardToInvoke];
        }
      } else {
        logEntries = [...logEntries, 'IA nao fez acao.'];
      }

      if (!updated) {
        return { ...s, log: logEntries };
      }

      return {
        ...s,
        creaturesInvokedThisTurn: {
          ...(s.creaturesInvokedThisTurn || { player: 0, ai: 0 }),
          ai: (s.creaturesInvokedThisTurn?.ai || 0) + 1,
        },
        ai: {
          ...s.ai,
          hand,
          field: { ...s.ai.field, slots },
        },
        log: logEntries,
      };
    });

    continueAiCombat(850);
  }, [applyAiSummonBlessings, continueAiCombat]);

  useEffect(() => {
    if (state.mode === 'pvp') return; // No PvP, o lado "ai" é o convidado humano — não roda ai.js
    if (state.phase === 'playing' && state.activePlayer === 'ai') {
      // Adiciona delay de 1.5s antes da IA agir
      const aiDelayTimer = setTimeout(() => {
        performAiTurn();
      }, 1500);
      return () => clearTimeout(aiDelayTimer);
    }
  }, [state.mode, state.phase, state.activePlayer, performAiTurn]);

  // Processa ataque pendente da IA

  useEffect(() => {
    if (state.mode === 'pvp') return;
    if (state.aiPendingAttack && state.phase === 'playing' && state.activePlayer === 'ai') {
      const attackTimer = setTimeout(() => {
        useAbility('ai', state.aiPendingAttack.attackerSlot, state.aiPendingAttack.abilityIndex, 'player', state.aiPendingAttack.targetSlot);
        setState(s => ({
          ...s,
          aiPendingAttack: null,
        }));
        continueAiCombat(1450);
      }, 500);
      return () => clearTimeout(attackTimer);
    }
  }, [state.mode, state.aiPendingAttack, state.phase, state.activePlayer, useAbility, continueAiCombat]);

  // --- PvP: lado do anfitrião — aplica ações recebidas do convidado por P2P e transmite o
  // estado da partida (redigido) de volta para ele.
  useEffect(() => {
    if (state.mode !== 'pvp' || !state.isHost) return undefined;
    const unsubscribe = window.electron?.ipcRenderer?.onP2PMessage?.(({ fromSteamId64, message }) => {
      if (!message || message.type !== 'action') return;
      if (state.peerSteamId64 && fromSteamId64 !== state.peerSteamId64) {
        console.warn(`[PvP] Ação de ${fromSteamId64} ignorada: não é o adversário esperado (${state.peerSteamId64}).`);
        return;
      }
      if (state.phase !== 'playing' || state.activePlayer !== 'ai') {
        console.warn(`[PvP] Ação "${message.action}" ignorada: phase=${state.phase} activePlayer=${state.activePlayer} (esperado: playing/ai).`);
        return;
      }
      console.log(`[PvP] Aplicando ação do convidado: ${message.action}`, message);

      if (message.action === 'summon') {
        summonFromHandForOpponent(message.index, message.slotIndex);
      } else if (message.action === 'attack') {
        useAbility('ai', message.attackerSlot, message.abilityIndex, 'player', message.targetSlot);
      } else if (message.action === 'endTurn') {
        endTurn();
      } else if (message.action === 'sacrifice') {
        sacrificeCreature('ai', message.slotIndex);
      } else if (message.action === 'field') {
        invokeFieldCardAI(message.handIndex);
      } else if (message.action === 'effect') {
        playEffectCardForOpponent(message.handIndex, message.targetInfo);
      }
    });
    return () => unsubscribe?.();
  }, [state.mode, state.isHost, state.peerSteamId64, state.phase, state.activePlayer, summonFromHandForOpponent, useAbility, endTurn, sacrificeCreature, invokeFieldCardAI, playEffectCardForOpponent]);

  useEffect(() => {
    if (state.mode !== 'pvp' || !state.isHost || !state.peerSteamId64) return;
    const { player, ...rest } = state;
    const redactedState = {
      ...rest,
      player: { ...player, hand: (player.hand || []).map(() => 'hidden') },
      creaturesWithUsedAbility: Array.from(state.creaturesWithUsedAbility || []),
    };
    window.electron?.ipcRenderer?.sendP2PMessage?.(state.peerSteamId64, { type: 'state', state: redactedState });
  }, [state]);

  // --- PvP: lado do convidado — recebe o estado transmitido pelo anfitrião e o adota como
  // verdade local (thin-client: o convidado nunca roda o motor de batalha, só espelha).
  useEffect(() => {
    if (state.mode !== 'pvp' || state.isHost !== false) return undefined;
    const unsubscribe = window.electron?.ipcRenderer?.onP2PMessage?.(({ fromSteamId64, message }) => {
      if (!message || message.type !== 'state') return;
      if (state.peerSteamId64 && fromSteamId64 !== state.peerSteamId64) {
        console.warn(`[PvP] Estado de ${fromSteamId64} ignorado: não é o anfitrião esperado (${state.peerSteamId64}).`);
        return;
      }
      console.log(`[PvP] Estado recebido do anfitrião: phase=${message.state?.phase} turn=${message.state?.turn} activePlayer=${message.state?.activePlayer}`);
      setState((s) => swapPerspective({ ...message.state, mode: s.mode, isHost: s.isHost, peerSteamId64: s.peerSteamId64 }));
    });
    return () => unsubscribe?.();
  }, [state.mode, state.isHost, state.peerSteamId64]);

  // <-- FECHAMENTO DE BLOCO ADICIONADO CASO FALTANDO

  return (
    <BattleContext.Provider value={value}>{children}</BattleContext.Provider>
  );
}

export const useBattle = () => React.useContext(BattleContext);
