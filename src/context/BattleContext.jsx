import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import creaturesPool from '../assets/cards';
import { chooseAction, resolveAiDifficulty, chooseAiEffectCardPlay } from '../logic/ai';
import { AppContext } from './AppContext';
import fieldChangeSfx from '../assets/sounds/effects/field-change.MP3';
import flipCardSfx from '../assets/sounds/effects/flipcard.MP3';
import airSfx from '../assets/sounds/effects/elements/air.MP3';
import waterSfx from '../assets/sounds/effects/elements/water.MP3';
import earthSfx from '../assets/sounds/effects/elements/earth.MP3';
import battleMusic from '../assets/sounds/music/battle-music.mp3';
import * as effectRegistry from '../utils/effectRegistry';
import { creatureRarities, RARITY_TIERS } from '../assets/rarityData';
import { resolveAbility } from '../logic/abilityResolver';

export const BattleContext = createContext(null);

// Cenário do tabuleiro por elemento da calamidade — usado no lugar do retrato da criatura
// (que não serve como fundo do campo inteiro) quando a calamidade ativa seu campo próprio.
const CALAMITY_FIELD_SCENES = {
  fogo: require('../assets/img/scene-board/vulcanus.png'),
  agua: require('../assets/img/scene-board/ocean.png'),
  terra: require('../assets/img/scene-board/mountain.png'),
  ar: require('../assets/img/scene-board/aerial.png'),
};

// Zera buffs, debuffs, status effects e escudo ao enviar uma criatura para o cemitério -
// esses efeitos são só de combate e não devem persistir na carta morta.
const resetCombatStateForGraveyard = (creature) => ({
  ...creature,
  buffs: [],
  debuffs: [],
  statusEffects: [],
  shield: 0,
  shieldTurns: 0,
});

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

// Timing das bênções de área "cinematográficas" (bola do Grombi, rajada do Ekerion, onda do
// Hipoderion): o efeito varre o campo inteiro por FIELD_FX_DURATION_MS, e o "hit" (dano/morte)
// só aparece perto do fim, em FIELD_FX_HIT_DELAY_MS.
const FIELD_FX_DURATION_MS = 2400;
const FIELD_FX_HIT_DELAY_MS = 1900;
// Onda do Hipoderion: pedida explicitamente com 2s de duração, batendo perto do fim da varredura.
const WAVE_FX_DURATION_MS = 2000;
const WAVE_FX_HIT_DELAY_MS = 1200;

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

// Usado pela bênção do Crogal (conta répteis dos dois lados do campo)
const isReptiloidCreature = (creature) => {
  if (!creature) return false;
  const baseData = creaturesPool.find(c => c.id === creature.baseId || c.id === creature.id) || {};
  const typeText = [creature.type, baseData.type?.pt, baseData.type?.en].filter(Boolean).join(' ').toLowerCase();
  return typeText.includes('reptil') || typeText.includes('reptiloid');
};

// Usado pela bênção do Albot (identifica feras aliadas em campo)
const isBeastCreature = (creature) => {
  if (!creature) return false;
  const baseData = creaturesPool.find(c => c.id === creature.baseId || c.id === creature.id) || {};
  const typeText = [creature.type, baseData.type?.pt, baseData.type?.en].filter(Boolean).join(' ').toLowerCase();
  return typeText.includes('fera') || typeText.includes('beast');
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
  const stealGrabRef = useRef(null);
  const stealResolveRef = useRef(null);
  // Trava de reentrância pro turno da calamidade: runCalamityBossTurn dispara sua própria
  // cadeia de setTimeout (windup -> resolve -> cleanup -> endTurn) sem nenhum cancelamento.
  // Se o efeito que a chama disparasse de novo antes dessa cadeia terminar (ex: alguma
  // referência instável fazendo o useEffect re-rodar), cadeias antigas ficavam órfãs e se
  // acumulavam partida afora - explicava a partida ir ficando lenta com o tempo até travar.
  const calamityTurnRunningRef = useRef(false);

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
    let hasZefriBlessing = false;
    let hasEkerathBlessing = false;
    let hasAldanorBlessing = false;
    let hasGrombiBlessing = false;
    let hasEkerionBlessing = false;
    let hasIgrazarBlessing = false;
    let hasHipoderionBlessing = false;
    let hasCrogalBlessing = false;
    let hasAlbotBlessing = false;
    let galgarElementImmunity = false;
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
      // Para o Zefri: um aliado aleatório dorme por 2 turnos, curando 2 HP em cada um desses turnos
      if (blessing.id === 'zefri_blessing') {
        hasZefriBlessing = true;
      }
      // Para o Ekerath: todos os aliados em campo ganham +1 de escudo e +1 de vida
      if (blessing.id === 'ekerath_blessing') {
        hasEkerathBlessing = true;
      }
      // Para o Aldanor: todas as criaturas em campo (exceto ele) dormem por 2 turnos
      if (blessing.id === 'aldanor_blessing') {
        hasAldanorBlessing = true;
      }
      // Para o Grombi: bola de pedra rolando, 1 de dano a todas as cartas em campo (dos dois lados)
      if (blessing.id === 'grombi_blessing') {
        hasGrombiBlessing = true;
      }
      // Para o Ekerion: rajada de vento, 1 de dano a todas as criaturas em campo (dos dois lados)
      if (blessing.id === 'ekerion_blessing') {
        hasEkerionBlessing = true;
      }
      // Para o Galgar: imunidade permanente a dano de criaturas sombrias ou de fogo
      if (blessing.id === 'galgar_blessing') {
        galgarElementImmunity = true;
      }
      // Para o Arvel: mesmo efeito do Owlberoth (retornar 1 criatura inimiga para a mão)
      if (blessing.id === 'arvel_blessing') {
        hasOwlberothBlessing = true;
      }
      // Para o Igrazar: 1 de dano a uma criatura aleatória no campo adversário
      if (blessing.id === 'igrazar_blessing') {
        hasIgrazarBlessing = true;
      }
      // Para o Hipoderion: 1 de dano a cada carta do campo adversário
      if (blessing.id === 'hipoderion_blessing') {
        hasHipoderionBlessing = true;
      }
      // Para o Crogal: ganha 1 de essência por réptil em campo (dos dois lados)
      if (blessing.id === 'crogal_blessing') {
        hasCrogalBlessing = true;
      }
      // Para o Albot: feras aliadas já em campo ganham +1 de ataque permanente
      if (blessing.id === 'albot_blessing') {
        hasAlbotBlessing = true;
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
    return { atk, def, hp, maxHp, abilities: selectedAbilities, perkEffects: { shieldOnSummon, firstAttackNegated, dragonAllyAttackBonus, ...(galgarElementImmunity ? { immuneToShadowOrFire: true } : {}), ...combatPerkEffects }, hasIgnisBlessing, hasVirideerBlessing, hasEkerenthBlessing, hasOwlberothBlessing, hasNihilBlessing, hasDrazraqBlessing, hasLeoracalBlessing, hasSeractBlessing, hasNoctyraBlessing, hasMawthornBlessing, hasAlatoyBlessing, hasPawferionBlessing, hasEkonosBlessing, hasBeoxyrBlessing, hasArguíliaBlessing, hasKaelBlessing, hasAshfangBlessing, hasZephyronBlessing, hasArigusBlessing, hasRoenhellBlessing, hasMoarBlessing, hasElderoxBlessing, hasGravhyrBlessing, hasDraakBlessing, hasZefriBlessing, hasEkerathBlessing, hasAldanorBlessing, hasGrombiBlessing, hasEkerionBlessing, hasIgrazarBlessing, hasHipoderionBlessing, hasCrogalBlessing, hasAlbotBlessing };
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

  // Toca um efeito sonoro pontual (usado pelas bênções de área "cinematográficas": onda do
  // Hipoderion, bola do Grombi, rajada do Ekerion) sem precisar repetir o try/catch toda vez.
  const playFxSound = useCallback((sfx) => {
    try {
      if (!sfx) return;
      const audio = new Audio(sfx);
      audio.volume = (effectsVolume ?? 50) / 100;
      audio.play().catch(() => {});
    } catch (e) {}
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
    stealCardSelectedIndex: null, // índice escolhido antes da animação de roubo
    stealCardStolenIndex: null, // índice da carta atualmente "voando" para fora do modal
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
        cardsAttacked: [], // Cards que atacaram a calamidade (ver useAbility) - só populado em modo calamity
      },
      ai: {
        cardsDrawn: [],
        cardsSummoned: [],
        cardsKilled: [],
        cardsAssisted: [],
        cardsAttacked: [],
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

    const settledCreature = resetCombatStateForGraveyard({ ...targetCreature, _defeatSettled: true });
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

  // Dano em área usado pelas bênções de Grombi (Bola de Pedra-Alma) e Ekerion (Rajada da Tormenta):
  // atinge todas as criaturas dos dois lados do campo (exceto quem foi invocado), sem checar escudo,
  // no mesmo padrão de dano direto já usado pelas bênções do Kael/Ashfang.
  // Dano em área com uma sequência cinematográfica: o efeito de campo (bola/rajada) toca primeiro,
  // por FIELD_FX_DURATION_MS inteiro, e só perto do fim é que o "hit" (número de dano) aparece em
  // cada carta atingida e as mortes são resolvidas - o HP já muda instantaneamente no state (correto
  // pra lógica de jogo), só a parte visual do impacto é que fica atrasada pra combinar com a animação.
  const damageAllOnField = useCallback((battleState, { amount, sourceName, excludeId, visualId }) => {
    let nextState = { ...battleState };
    const hits = [];

    ['player', 'ai'].forEach((side) => {
      const slots = (nextState[side]?.field?.slots || []).map((slot) => {
        if (!slot || slot.id === excludeId) return slot;
        hits.push({ side, id: slot.id });
        return { ...slot, hp: Math.max(0, slot.hp - amount) };
      });
      nextState[side] = { ...nextState[side], field: { ...nextState[side].field, slots } };
    });

    if (hits.length === 0) return nextState;

    nextState.animations = {
      ...(nextState.animations || {}),
      [`fx_${visualId}`]: { type: 'fieldFx', kind: visualId, side: 'both' },
    };
    nextState.log = [...(nextState.log || []), `${sourceName} causou ${amount} de dano a todas as criaturas em campo!`];

    setTimeout(() => {
      setState((s2) => {
        let updated = {
          ...s2,
          animations: {
            ...(s2.animations || {}),
            ...hits.reduce((acc, { id }) => ({ ...acc, [id]: { type: 'damage', amount } }), {}),
          },
        };
        hits.forEach(({ side, id }) => {
          const creature = (updated[side]?.field?.slots || []).find(c => c?.id === id);
          if (creature && creature.hp <= 0 && !creature._defeatSettled) {
            updated = settleDefeatedCreature(updated, {
              targetSide: side,
              targetId: id,
              killerSide: side === 'player' ? 'ai' : 'player',
              killerId: excludeId,
              killerName: sourceName,
              by: sourceName,
            });
          }
        });
        return updated;
      });
    }, FIELD_FX_HIT_DELAY_MS);

    setTimeout(() => {
      setState((s2) => {
        const anims = { ...(s2.animations || {}) };
        delete anims[`fx_${visualId}`];
        hits.forEach(({ id }) => { if (anims[id]?.type === 'damage') delete anims[id]; });
        return { ...s2, animations: anims };
      });
    }, FIELD_FX_DURATION_MS);

    return nextState;
  }, [settleDefeatedCreature]);

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
    const isCalamityBattle = battleSetup && !Array.isArray(battleSetup) && battleSetup.mode === 'calamity';
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
          player: { cardsDrawn: [], cardsSummoned: [], cardsKilled: [], cardsAssisted: [], cardsAttacked: [] },
          ai: { cardsDrawn: [], cardsSummoned: [], cardsKilled: [], cardsAssisted: [], cardsAttacked: [] },
        },
      });
      return;
    }

    const deckOverride = (isCampaignBattle || isPvpBattle || isCalamityBattle) ? battleSetup.deck : battleSetup;
    const opponent = isCampaignBattle ? battleSetup.opponent : null;
    // Deck do jogador: selecionado pelo modal; sen├úo primeiro deck salvo; sen├úo amostra aleat├│ria
    let playerDeck = (Array.isArray(deckOverride) && deckOverride.length > 0)
      ? deckOverride
      : (pickFirstUserDeck() || sampleDeckFromPool(20));
    // Modo Calamidade: só criaturas entram em jogo — cartas de campo e de efeito ficam de fora
    // (a própria calamidade já entra com a vantagem de campo dela, ver abaixo).
    if (isCalamityBattle) {
      playerDeck = playerDeck.filter((cardId) => {
        const baseId = resolveCollectionBaseId(cardId, cardCollection);
        const cardData = creaturesPool.find((c) => c && c.id === baseId);
        return cardData && typeof cardData.type !== 'string';
      });
    }
    const opponentIndex = Number.isFinite(opponent?.levelIndex)
      ? opponent.levelIndex
      : (Number.isFinite(opponent?.index) ? opponent.index : 0);
    const campaignStage = getCampaignStage(opponentIndex);
    // PvP (anfitrião): usa o baralho real do convidado quando já foi recebido pelo handshake
    // de seleção de baralho (ver PvpLobby); se ainda não chegou, cai numa amostra.
    const pvpOpponentDeck = isPvpBattle && Array.isArray(battleSetup.opponentDeck) && battleSetup.opponentDeck.length > 0
      ? battleSetup.opponentDeck
      : null;

    // Modo Calamidade: o lado "ai" não é um oponente normal — é a calamidade (1 criatura só,
    // vida bufada, 1 orbe só) para que a derrota dela pelo caminho normal de orbes já encerre
    // a partida sem precisar de nenhuma checagem de vitória nova.
    const calamityBossId = isCalamityBattle ? battleSetup.bossId : null;
    const calamityPlayerCount = isCalamityBattle ? Math.max(1, Number(battleSetup.playerCount) || 1) : 1;
    const calamityBossCard = isCalamityBattle ? creaturesPool.find((c) => c && c.id === calamityBossId) : null;
    const calamityPowerScale = calamityBossCard?.calamity?.powerScale?.[calamityPlayerCount] ?? 1;
    const calamityBossMaxHp = calamityBossCard
      ? Math.max(1, Math.round((calamityBossCard.calamity?.baseHp || 1) * calamityPowerScale))
      : 0;
    // A calamidade já entra em campo com a vantagem do próprio campo dela ativa (reaproveita o
    // sistema genérico de bônus de campo por elemento — mesmo mecanismo das cartas de campo comuns).
    const CALAMITY_FIELD_ADVANTAGE = 3;
    const calamityFieldData = calamityBossCard ? {
      ...calamityBossCard,
      // Fundo do tabuleiro: cenário temático do elemento, não o retrato da criatura.
      img: CALAMITY_FIELD_SCENES[calamityBossCard.element] || calamityBossCard.img,
      elementBoosts: { [calamityBossCard.element || 'puro']: CALAMITY_FIELD_ADVANTAGE },
    } : null;
    const calamityBossInstanceBase = calamityBossCard ? {
      id: `${calamityBossId}-calamity-boss`,
      baseId: calamityBossId,
      // Marca pra bloquear mecânicas de remoção (retornar pra mão, cemitério direto, roubo de
      // controle) - o chefe não tem mão/baralho de verdade, e removê-lo do slot ai[0] quebra o
      // loop da luta (o boss some sem a vitória disparar). Ver checagens de isCalamityBoss abaixo.
      isCalamityBoss: true,
      name: calamityBossCard.name?.pt || calamityBossCard.name?.en || calamityBossId,
      type: calamityBossCard.type?.pt || calamityBossCard.type?.en,
      element: calamityBossCard.element || 'puro',
      hp: calamityBossMaxHp,
      maxHp: calamityBossMaxHp,
      atk: 0,
      def: 0,
      abilities: calamityBossCard.abilities || [],
      buffs: [],
      debuffs: [],
      shield: 0,
      shieldTurns: 0,
      statusEffects: [],
      firstAttackNegated: false,
      perkEffects: {},
    } : null;
    const calamityBossInstance = calamityBossInstanceBase
      ? effectRegistry.applyFieldHpBonusToCreature(calamityBossInstanceBase, calamityFieldData)
      : null;

    const aiDeck = isCalamityBattle
      ? []
      : (isCampaignBattle
        ? buildCampaignAiDeck(opponent, campaignStage)
        : (pvpOpponentDeck || sampleDeckFromPool(20)));

    // Embaralhar e comprar m├úo inicial (4 cartas)
    const pShuffled = shuffle(playerDeck);
    const aShuffled = shuffle(aiDeck);
    let pDeck = [...pShuffled];
    let aDeck = [...aShuffled];
    const pHand = [];
    const aHand = [];
    for (let i = 0; i < 4; i += 1) {
      const d1 = drawFromDeck(pDeck); pDeck = d1.nextDeck; if (d1.card) pHand.push(d1.card);
      if (!isCalamityBattle) {
        const d2 = drawFromDeck(aDeck); aDeck = d2.nextDeck; if (d2.card) aHand.push(d2.card);
      }
    }

    // Nº de slots do lado do jogador: 1 por jogador na sala (Fase 1 = solo = 1 slot);
    // fora do modo Calamidade continua 3 como sempre.
    const playerSlotCount = isCalamityBattle ? calamityPlayerCount : 3;

    // Nova partida começando: garante que a trava de reentrância do turno da calamidade
    // (calamityTurnRunningRef) não fique presa em "true" por causa de uma partida anterior
    // encerrada no meio de uma cadeia de setTimeout (crash, abandono, etc.).
    calamityTurnRunningRef.current = false;

    setState({
      phase: 'coinflip',
      turn: 1,
      activePlayer: 'player',
      mode: isCalamityBattle ? 'calamity' : (isPvpBattle ? 'pvp' : (isCampaignBattle ? 'campaign' : 'normal')),
      isHost: isPvpBattle ? (battleSetup.isHost !== false) : null,
      peerSteamId64: isPvpBattle ? (battleSetup.peerSteamId64 || null) : null,
      calamityBossId: isCalamityBattle ? calamityBossId : null,
      calamityPlayerCount,
      calamityAttackKind: 'single',
      calamityBossHealPending: false,
      calamitySacrificedThisTurn: false,
      creaturesInvokedThisTurn: { player: 0, ai: 0 },
      resurrectionPending: null,
      returnCardPending: null,
      poisonPending: null,
      stealCardPending: null,
      swapCardPending: null,
      freezePending: null,
      healPending: null,
      virideerBlessPending: null,
      player: {
        // Modo Calamidade não tem vida/orbes de jogador — a derrota é só por baralho+mão+campo
        // esgotados (ver useEffect de checagem logo abaixo do startBattle). Orbe bem alto aqui
        // só evita que o caminho de derrota por orbes do motor padrão dispare por engano.
        orbs: isCalamityBattle ? 999 : 5,
        essence: 0,
        deck: pDeck,
        hand: pHand,
        field: { slots: Array.from({ length: playerSlotCount }, () => null), effects: Array.from({ length: playerSlotCount }, () => null) },
        graveyard: [],
        fieldGraveyard: [],
      },
      ai: {
        orbs: isCalamityBattle ? 1 : 5,
        essence: 0,
        deck: aDeck,
        hand: aHand,
        field: {
          slots: isCalamityBattle ? [calamityBossInstance, null, null] : [null, null, null],
          effects: [null, null, null],
        },
        graveyard: [],
        fieldGraveyard: [],
        campaignOpponent: opponent || null,
        campaignBuildLevel: isCampaignBattle ? campaignStage.buildLevel : 0,
      },
      sharedField: isCalamityBattle
        ? { active: true, id: calamityBossId, cardData: calamityFieldData, isHolo: false }
        : { active: false, id: null },
      log: [
        isCalamityBattle
          ? `A calamidade ${calamityBossInstance?.name || ''} desperta!`
          : (isCampaignBattle ? `Campanha iniciada contra ${opponent?.name || 'Guardião'}!` : 'Batalha iniciada!'),
      ],
      gameResult: null,
      killFeed: [],
      battleStats: {
        player: {
          cardsDrawn: [...pHand], // Mão inicial
          cardsSummoned: [],
          cardsKilled: [],
          cardsAssisted: [],
          cardsAttacked: [],
        },
        ai: {
          cardsDrawn: [...aHand], // Mão inicial
          cardsSummoned: [],
          cardsKilled: [],
          cardsAssisted: [],
          cardsAttacked: [],
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

      // Modo Calamidade: o jogador terminou o turno de campo vazio de propósito em dois casos -
      // (a) sacrificou a própria criatura em campo (ver sacrificeCreature/calamitySacrificedThisTurn)
      // só pra não deixar nada exposto ao ataque da calamidade, embolsando +1 essência de brinde -
      // isso é sempre deliberado, então conta mesmo se ele também summonou nesse turno (summonar e
      // sacrificar na sequência pra "trocar" a criatura por essência é ainda mais claramente de
      // propósito, não menos); ou (b) tinha carta(s) na mão pra summonar (summonar não custa
      // essência, só 1 por turno - ver summonFromHand - então mão não-vazia = dava pra summonar) e
      // não jogou nenhuma - aqui sim exige invokedThisTurnCount === 0, senão puniria quem summonou
      // e teve a criatura morta em combate no mesmo turno (mesma guarda do -1 orbe acima). Marca a
      // intenção pro turno da calamidade consumir (ver runCalamityBossTurn).
      const calamityBossHealPending = s.mode === 'calamity'
        && currentSide === 'player'
        && !hasCreatures
        && (
          !!s.calamitySacrificedThisTurn
          || (invokedThisTurnCount === 0 && (currentSnapshot.hand || []).length > 0)
        );

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

      // Processa expiração do bônus de dano temporário de cartas de efeito (ex: Ira do Julgamento)
      const processDamageBuffTurns = (slots) => (slots || []).map((c) => {
        if (!c) return c;
        if (typeof c.damageBuffDuration === 'number' && c.damageBuffDuration > 0) {
          const newDuration = c.damageBuffDuration - 1;
          if (newDuration <= 0) {
            const { damageBuff, damageBuffDuration, ...rest } = c;
            return rest;
          }
          return { ...c, damageBuffDuration: newDuration };
        }
        return c;
      });

      const playerSlotsAfterBuffs = processDamageBuffTurns(processAbilityUseBuffs(playerSlots));
      const aiSlotsAfterBuffs = processDamageBuffTurns(processAbilityUseBuffs(aiSlots));

      // Processa criaturas temporárias (ressuscitadas) - decrementa duração e retorna ao cemitério
      const processResurrectedCreatures = (slots, side, newState) => {
        const processedSlots = [];
        let logs = [];

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
                graveyard: [...(newState[side]?.graveyard || []), resetCombatStateForGraveyard(c)]
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

      // Devolve ao adversário as criaturas tomadas pela "Ilusão de Teatro" quando a duração
      // acaba. Isso ocorre ao fim do turno do jogador (nextActive vira 'ai'), já que "controlar
      // por 1 turno" significa o próprio turno em que a criatura foi capturada.
      if (nextActive === 'ai') {
        const controlLogs = [];
        const nextPlayerSlots = playerSlotsAfterResurrect.map((c) => {
          if (!c || c.controlledBy !== 'ai' || typeof c.controlDuration !== 'number') return c;

          const newDuration = c.controlDuration - 1;
          if (newDuration > 0) return { ...c, controlDuration: newDuration };

          // Duração acabou: devolve a criatura para o campo do adversário.
          const { controlledBy, controlOriginSlot, controlDuration, ...restored } = c;
          const aiSlots = [...(stateAfterResurrect.ai?.field?.slots || [])];
          const targetSlot = (typeof controlOriginSlot === 'number' && !aiSlots[controlOriginSlot])
            ? controlOriginSlot
            : aiSlots.findIndex((slot) => !slot);

          if (targetSlot === -1 || targetSlot === undefined) {
            // Sem espaço no campo do adversário: mantém sob controle por mais um turno.
            return { ...c, controlDuration: 1 };
          }

          aiSlots[targetSlot] = restored;
          stateAfterResurrect = {
            ...stateAfterResurrect,
            ai: { ...stateAfterResurrect.ai, field: { ...stateAfterResurrect.ai.field, slots: aiSlots } },
          };
          controlLogs.push(`${restored.name} voltou ao controle do adversário.`);
          return null;
        });
        playerSlotsAfterResurrect = nextPlayerSlots;
        resurrectionLogs = [...resurrectionLogs, ...controlLogs];
      }

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
        const oppositeSideKey = sideKey === 'player' ? 'ai' : 'player';
        let logs = [];
        slots.forEach((c) => {
          if (!c) return;
          const hpBeforeStatus = c.hp;
          const r1 = effectRegistry.processStatusEffects(ns, c.id);
          ns = r1.newState;
          logs = logs.concat(r1.log);

          // Cura por regeneração (ex: bênção do Zefri): mostra a animação de +HP/coração,
          // igual à usada em qualquer outra cura, já que antes ela ticava sem feedback visual.
          const healedCreature = (ns[sideKey]?.field?.slots || []).find(s => s && s.id === c.id);
          const healedAmount = healedCreature ? healedCreature.hp - hpBeforeStatus : 0;
          if (healedAmount > 0) {
            const healId = c.id;
            ns.animations = { ...(ns.animations || {}), [healId]: { type: 'heal', amount: healedAmount, icon: 'heart' } };
            setTimeout(() => {
              setState(s2 => {
                const anims = { ...(s2.animations || {}) };
                delete anims[healId];
                return { ...s2, animations: anims };
              });
            }, 900);
          }

          const r2 = effectRegistry.processBuffs(ns, c.id);
          ns = r2.newState;
          logs = logs.concat(r2.log);

          // Grombi: pulso de dano - por 3 turnos do dono, 1 inimigo aleatório sofre 1 de dano
          const freshSelf = (ns[sideKey]?.field?.slots || []).find(s => s && s.id === c.id);
          if (freshSelf && freshSelf.hp > 0 && (freshSelf.grombiPulseTurns || 0) > 0) {
            const oppositeSlots = ns[oppositeSideKey]?.field?.slots || [];
            const enemyIndices = oppositeSlots
              .map((s, idx) => (s && s.hp > 0 ? idx : null))
              .filter((idx) => idx !== null);
            if (enemyIndices.length > 0) {
              const targetIdx = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
              const targetCreature = oppositeSlots[targetIdx];
              const dmgResult = effectRegistry.applyDamage(ns, {
                attackerId: freshSelf.id,
                targetId: targetCreature.id,
                baseDamage: 1,
              });
              ns = dmgResult.newState;
              logs = logs.concat(dmgResult.log);
              logs.push(`${freshSelf.name} causou 1 de dano em ${targetCreature.name}!`);
            }
            ns = effectRegistry.updateCreature(ns, freshSelf.id, {
              grombiPulseTurns: Math.max(0, (freshSelf.grombiPulseTurns || 0) - 1),
            });
          }
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
            const deadCreature = resetCombatStateForGraveyard({ ...c, _defeatSettled: true });
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

      // Cap no histórico de log: cada turno faz vários spreads em cima do log inteiro
      // (aqui e em várias outras ações durante o turno), então sem limite ele cresce sem
      // parar numa partida longa (Calamidade especialmente, com rodadas curtas e frequentes)
      // e cada cópia fica mais cara que a anterior - contribui pra sessão "pesar" com o tempo
      // e degrada até travar. Mantém só as últimas entradas; nada no jogo lê o histórico
      // completo, só as mais recentes são mostradas na UI.
      const mergedLog = [...(finalState.log || []), ...logEntries, ...resurrectionLogs, ...gravhyrLogs, `Fim do turno de ${s.activePlayer}.`, ...draakLogs, ...processed.logs, ...extraLogs];

      return {
        ...finalState,
        creaturesInvokedThisTurn: { player: 0, ai: 0 }, // Reseta contador de invocações para o próximo turno (por segurança)
        creaturesWithUsedAbility: new Set(), // Reseta criaturas que usaram habilidade
        aiPendingAttack: null,
        aiTurnEnding: false,
        calamityBossHealPending,
        calamitySacrificedThisTurn: false, // Reseta para o turno que está começando agora
        log: mergedLog.length > 300 ? mergedLog.slice(-300) : mergedLog,
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

      const activeFieldData = s.sharedField?.active ? s.sharedField.cardData : null;
      slots[slotIndex] = effectRegistry.applyFieldHpBonusToCreature(creature, activeFieldData);
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
        if (newState.mode === 'calamity') {
          newState.log.push(`${creature.name} tenta retornar a Calamidade para a mão, mas ela é imune - só cai lutando!`);
        } else if (enemyCreatures.length > 0) {
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

      // Se for Mawthorn, congela uma criatura aleatória do adversário ao ser invocado (igual ao
      // que já acontece no lado da IA, ver hasMawthornBlessing em applyAiSummonBlessings). Antes
      // isso ficava pendente de um clique manual do jogador (freezePending/freezeEnemyCard), mas
      // esse clique é o MESMO usado pra selecionar alvo de ataque normal (isFreezeTargetable no
      // onClick do slot em BattleBoard.jsx) - o próximo clique de ataque acabava sendo "roubado"
      // pra aplicar o freeze em vez de atacar, dando a impressão de que o freeze só acontecia ao
      // atacar, nunca ao invocar (reportado 2026-08-19).
      if (build.hasMawthornBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => slot ? idx : null).filter(idx => idx !== null);

        if (enemyIndices.length > 0) {
          const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const targetCreature = aiSlots[randomIndex];

          const freezeStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'freeze');
          const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

          if (freezeStatusEffect) {
            freezeStatusEffect.duration = Math.max(freezeStatusEffect.duration, 3);
          } else {
            newStatusEffects.push({
              type: 'freeze',
              duration: 3,
              source: creature.name,
            });
          }

          aiSlots[randomIndex] = { ...targetCreature, statusEffects: newStatusEffects };
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
          newState.log.push(`${creature.name} congelou ${targetCreature.name} por 3 turnos!`);
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

      // Se for Zefri, faz um aliado aleatório dormir por 2 turnos, curando 2 HP em cada um desses turnos
      if (build.hasZefriBlessing) {
        const playerSlots = [...(newState.player?.field?.slots || [])];
        const allyIndices = playerSlots
          .map((slot, idx) => (slot && slot.hp > 0 && idx !== slotIndex ? idx : null))
          .filter(idx => idx !== null);
        const targetIndex = allyIndices.length > 0
          ? allyIndices[Math.floor(Math.random() * allyIndices.length)]
          : slotIndex;
        const targetCreature = playerSlots[targetIndex];

        if (targetCreature) {
          const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

          const sleepEffect = newStatusEffects.find(e => e.type === 'sleep');
          if (sleepEffect) {
            sleepEffect.duration = Math.max(sleepEffect.duration, 2);
          } else {
            newStatusEffects.push({ type: 'sleep', duration: 2, source: creature.name });
          }

          // Se já está com a vida cheia, a cura seria desperdiçada: em vez disso, soma
          // +2 de vida máxima permanente (mesmo padrão usado pela bênção da Arguilia).
          const isFullHp = targetCreature.hp >= (targetCreature.maxHp || targetCreature.hp);
          let updatedTarget;
          if (isFullHp) {
            updatedTarget = {
              ...targetCreature,
              hp: targetCreature.hp + 2,
              maxHp: (targetCreature.maxHp || targetCreature.hp) + 2,
              statusEffects: newStatusEffects,
            };
            newState.log.push(`${creature.name} fez ${targetCreature.name} dormir por 2 turnos; como já estava com a vida cheia, ganhou +2 de vida máxima!`);
          } else {
            const regenEffect = newStatusEffects.find(e => e.type === 'regeneration');
            if (regenEffect) {
              regenEffect.duration = Math.max(regenEffect.duration, 2);
              regenEffect.value = Math.max(regenEffect.value || 0, 2);
            } else {
              newStatusEffects.push({ type: 'regeneration', duration: 2, value: 2, source: creature.name });
            }
            updatedTarget = { ...targetCreature, statusEffects: newStatusEffects };
            newState.log.push(`${creature.name} fez ${targetCreature.name} dormir por 2 turnos, curando 2 HP a cada turno!`);
          }

          playerSlots[targetIndex] = updatedTarget;
          newState.player = { ...newState.player, field: { ...newState.player.field, slots: playerSlots } };
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

      // Se for Ekerath, todos os aliados em campo ganham +1 de escudo e +1 de vida
      if (build.hasEkerathBlessing) {
        const playerSlots = [...(newState.player?.field?.slots || [])];
        const buffedIds = [];

        const updatedPlayerSlots = playerSlots.map(slot => {
          if (!slot) return slot;
          buffedIds.push(slot.id);
          return {
            ...slot,
            shield: (slot.shield || 0) + 1,
            hp: Math.min(slot.hp + 1, slot.maxHp),
          };
        });

        newState.player = { ...newState.player, field: { ...newState.player.field, slots: updatedPlayerSlots } };
        if (buffedIds.length > 0) {
          newState.log.push(`${creature.name} concedeu +1 de escudo e +1 de vida para ${buffedIds.length} aliado(s)!`);
          newState.animations = {
            ...(newState.animations || {}),
            ...buffedIds.reduce((acc, id) => ({ ...acc, [id]: { type: 'heal', amount: 1, icon: 'heart' } }), {}),
          };
          setTimeout(() => {
            setState(s2 => {
              const anims = { ...(s2.animations || {}) };
              buffedIds.forEach(id => delete anims[id]);
              return { ...s2, animations: anims };
            });
          }, 900);
        }
      }

      // Se for Aldanor, todas as outras criaturas em campo (aliadas e inimigas) dormem por 2 turnos
      if (build.hasAldanorBlessing) {
        const applySleepToSlots = (list, excludeIndex) => {
          const affected = [];
          const updated = list.map((slot, idx) => {
            if (!slot || idx === excludeIndex) return slot;
            const newStatusEffects = slot.statusEffects ? [...slot.statusEffects] : [];
            const sleepEffect = newStatusEffects.find(e => e.type === 'sleep');
            if (sleepEffect) {
              sleepEffect.duration = Math.max(sleepEffect.duration, 2);
            } else {
              newStatusEffects.push({ type: 'sleep', duration: 2, source: creature.name });
            }
            affected.push(slot.id);
            return { ...slot, statusEffects: newStatusEffects };
          });
          return { updated, affected };
        };

        const playerSleepResult = applySleepToSlots(newState.player?.field?.slots || [], slotIndex);
        const aiSleepResult = applySleepToSlots(newState.ai?.field?.slots || [], -1);

        newState.player = { ...newState.player, field: { ...newState.player.field, slots: playerSleepResult.updated } };
        newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSleepResult.updated } };

        const sleepingIds = [...playerSleepResult.affected, ...aiSleepResult.affected];
        if (sleepingIds.length > 0) {
          newState.log.push(`${creature.name} fez todas as outras criaturas em campo dormirem por 2 turnos! Só ele poderá atacar.`);
          newState.animations = {
            ...(newState.animations || {}),
            ...sleepingIds.reduce((acc, id) => ({ ...acc, [id]: { type: 'sleep' } }), {}),
          };
          setTimeout(() => {
            setState(s2 => {
              const anims = { ...(s2.animations || {}) };
              sleepingIds.forEach(id => delete anims[id]);
              return { ...s2, animations: anims };
            });
          }, 1200);
        }
      }

      // Se for Grombi, lança a bola de pedra: 1 de dano a todas as cartas em campo (dos dois lados)
      if (build.hasGrombiBlessing) {
        Object.assign(newState, damageAllOnField(newState, { amount: 1, sourceName: creature.name, excludeId: creature.id, visualId: 'grombi_ball' }));
        playFxSound(earthSfx);
      }

      // Se for Ekerion, solta a rajada de vento: 1 de dano a todas as criaturas em campo (dos dois lados)
      if (build.hasEkerionBlessing) {
        Object.assign(newState, damageAllOnField(newState, { amount: 1, sourceName: creature.name, excludeId: creature.id, visualId: 'ekerion_gust' }));
        playFxSound(airSfx);
      }

      // Se for Igrazar, causa 1 de dano a uma criatura aleatória no campo adversário
      if (build.hasIgrazarBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
        if (enemyIndices.length > 0) {
          const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const targetCreature = { ...aiSlots[randomIndex], hp: Math.max(0, aiSlots[randomIndex].hp - 1) };
          aiSlots[randomIndex] = targetCreature;
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
          newState.log.push(`${creature.name} causou 1 de dano a ${targetCreature.name}!`);
          newState.animations = { ...(newState.animations || {}), [targetCreature.id]: { type: 'damage', amount: 1, attackerId: creature.baseId } };
          setTimeout(() => {
            setState(s2 => {
              const anims = { ...(s2.animations || {}) };
              if (anims[targetCreature.id]?.type === 'damage') delete anims[targetCreature.id];
              return { ...s2, animations: anims };
            });
          }, 900);
          Object.assign(newState, settleDefeatedCreature(newState, {
            targetSide: 'ai',
            targetId: targetCreature.id,
            killerSide: 'player',
            killerId: creature.id,
            killerName: creature.name,
            by: 'Igrazar',
          }));
        }
      }

      // Se for Hipoderion, uma onda varre o campo adversário e depois causa 1 de dano a cada carta
      if (build.hasHipoderionBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const hitIds = [];
        const updatedAiSlots = aiSlots.map(slot => {
          if (!slot) return slot;
          hitIds.push(slot.id);
          return { ...slot, hp: Math.max(0, slot.hp - 1) };
        });
        newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: updatedAiSlots } };
        if (hitIds.length > 0) {
          newState.log.push(`${creature.name} atingiu todo o campo adversário com 1 de dano!`);
          newState.animations = {
            ...(newState.animations || {}),
            fx_hipoderion_wave: { type: 'fieldFx', kind: 'hipoderion_wave', side: 'ai' },
          };
          playFxSound(waterSfx);
          setTimeout(() => {
            setState(s2 => {
              let updated = {
                ...s2,
                animations: {
                  ...(s2.animations || {}),
                  ...hitIds.reduce((acc, id) => ({ ...acc, [id]: { type: 'damage', amount: 1 } }), {}),
                },
              };
              hitIds.forEach((id) => {
                const target = (updated.ai?.field?.slots || []).find(c => c?.id === id);
                if (target && target.hp <= 0 && !target._defeatSettled) {
                  updated = settleDefeatedCreature(updated, {
                    targetSide: 'ai',
                    targetId: id,
                    killerSide: 'player',
                    killerId: creature.id,
                    killerName: creature.name,
                    by: 'Hipoderion',
                  });
                }
              });
              return updated;
            });
          }, WAVE_FX_HIT_DELAY_MS);
          setTimeout(() => {
            setState(s2 => {
              const anims = { ...(s2.animations || {}) };
              delete anims.fx_hipoderion_wave;
              hitIds.forEach(id => { if (anims[id]?.type === 'damage') delete anims[id]; });
              return { ...s2, animations: anims };
            });
          }, WAVE_FX_DURATION_MS);
        }
      }

      // Se for Crogal, ganha 1 de essência por réptil em campo (dos dois lados)
      if (build.hasCrogalBlessing) {
        const reptileCount = [
          ...(newState.player?.field?.slots || []),
          ...(newState.ai?.field?.slots || []),
        ].filter(isReptiloidCreature).length;
        if (reptileCount > 0) {
          newState.player = { ...newState.player, essence: (newState.player.essence || 0) + reptileCount };
          newState.essenceRewardPulse = { side: 'player', id: `player-crogal-${Date.now()}` };
          newState.log.push(`${creature.name} sintonizou com ${reptileCount} réptil(eis) em campo e ganhou ${reptileCount} de essência!`);
        }
      }

      // Se for Albot, feras já em campo (incluindo ele) ganham +1 de ataque permanente
      if (build.hasAlbotBlessing) {
        const buffedIds = [];
        const playerSlots = (newState.player?.field?.slots || []).map(slot => {
          if (!slot || !isBeastCreature(slot)) return slot;
          buffedIds.push(slot.id);
          return { ...slot, atk: (slot.atk || 0) + 1 };
        });
        newState.player = { ...newState.player, field: { ...newState.player.field, slots: playerSlots } };
        if (buffedIds.length > 0) {
          newState.log.push(`${creature.name} concedeu +1 de ataque para ${buffedIds.length} fera(s) em campo!`);
          newState.animations = {
            ...(newState.animations || {}),
            ...buffedIds.reduce((acc, id) => ({ ...acc, [id]: { type: 'status', statusType: 'attackBuff' } }), {}),
          };
          setTimeout(() => {
            setState(s2 => {
              const anims = { ...(s2.animations || {}) };
              buffedIds.forEach(id => delete anims[id]);
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
          const hitIds = new Set();
          if (enemyIndices.length === 1) {
            // Se há apenas 1 criatura, toma 3 de dano direto
            const targetIndex = enemyIndices[0];
            const targetCreature = aiSlots[targetIndex];
            targetCreature.hp = Math.max(0, targetCreature.hp - 3);
            aiSlots[targetIndex] = targetCreature;
            hitIds.add(targetCreature.id);
            newState.log.push(`${creature.name} causou 3 de dano direto a ${targetCreature.name}!`);
          } else {
            // Se há más de 1, faz 1 de dano 3 vezes a criaturas aleatórias
            for (let i = 0; i < 3; i++) {
              const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
              const targetCreature = aiSlots[randomIndex];
              targetCreature.hp = Math.max(0, targetCreature.hp - 1);
              aiSlots[randomIndex] = targetCreature;
              hitIds.add(targetCreature.id);
            }
            newState.log.push(`${creature.name} causou 1 de dano 3 vezes a criaturas aleatórias!`);
          }
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
          // Sem isso, uma criatura derrubada a 0 de vida pela bênção ficava "morta-viva" no campo
          // (sem animação, sem ir pro cemitério, sem custar orbe) - igual ao bug já corrigido no Ashfang.
          hitIds.forEach((targetId) => {
            Object.assign(newState, settleDefeatedCreature(newState, {
              targetSide: 'ai',
              targetId,
              killerSide: 'player',
              killerId: creature.id,
              killerName: creature.name,
              by: 'Kael',
            }));
          });
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
      if (build.hasArigusBlessing && newState.mode === 'calamity') {
        newState.log.push(`${creature.name} tenta empurrar a Calamidade, mas ela é imune - só cai lutando!`);
      } else if (build.hasArigusBlessing) {
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

      const activeFieldData = s.sharedField?.active ? s.sharedField.cardData : null;
      slots[slotIndex] = effectRegistry.applyFieldHpBonusToCreature(creature, activeFieldData);
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
  // Nota: applyAiSummonBlessings é declarada bem mais abaixo neste componente (função grande,
  // usada por vários pontos), então não pode entrar aqui como dependência — o array de deps do
  // useCallback é avaliado na hora, e a referenciaria antes da inicialização (TDZ). O corpo da
  // função ainda a chama normalmente, já que só executa depois que o componente termina de montar.
  }, [resolveCreatureBuild, cardCollection]);

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
      // Ignora buffs/debuffs/status/escudo que a criatura tinha ao morrer (alguns caminhos de morte
      // vão pro cemitério sem passar por resetCombatStateForGraveyard) e volta com vida cheia.
      const restoredCreature = {
        ...ressurectedCreature,
        id: newInstanceId,
        baseId: baseId,
        buffs: [],
        debuffs: [],
        statusEffects: [],
        shield: 0,
        shieldTurns: 0,
        hp: ressurectedCreature.maxHp ?? ressurectedCreature.hp,
      };

      const newLog = [...s.log, `${ressurectedCreature.name} foi ressuscitado!`];
      console.log('RESURRECT - restoring creature', { ressurectedCreature, newInstanceId, targetSlotIndex });

      // Se houver slot disponível
      if (targetSlotIndex >= 0 && targetSlotIndex < 3) {
        const slots = [...s.player.field.slots];
        if (slots[targetSlotIndex]) {
          newLog.push('Slot ocupado!');
          return { ...s, log: newLog };
        }

        // Ressurreição do Ignis é permanente - a criatura volta pro campo como uma invocação
        // normal (a benção não menciona nenhuma duração). `temporary`/`resurrectDuration` são
        // de um mecanismo diferente (Sepultura do Espectro, efeito de 1 turno) - marcar a
        // criatura ressuscitada com eles fazia ela voltar sozinha pro cemitério quase na hora,
        // antes do jogador conseguir usá-la.
        slots[targetSlotIndex] = restoredCreature;
        console.log('RESURRECT - placed in slot', { slotIndex: targetSlotIndex, restoredCreature });
        return {
          ...s,
          player: { ...s.player, graveyard, field: { ...s.player.field, slots } },
          resurrectionPending: null,
          log: newLog,
        };
      }

      // Sem slot disponível, vai para a mão. Usa o baseId puro (sem sufixo de instância) - o
      // newInstanceId gerado acima nunca é registrado em cardCollection, então summonFromHand
      // (que só reconhece um id com "-" como instanceId e tenta achar a base procurando na
      // coleção) não encontrava nada, ficava com baseId corrompido e o summon falhava em
      // silêncio (reportado: criatura ressuscitada não conseguia ser invocada em modo Calamidade,
      // onde o campo de 1 slot solo sempre está ocupado pelo Ignis que acabou de ser invocado -
      // então essa é a única saída possível, nunca o slot direto). Um id sem "-" já é tratado
      // como baseId puro por summonFromHand, então resolve certo.
      const hand = [...s.player.hand, baseId];
      newLog.push(`${ressurectedCreature.name} foi para a mão.`);
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
    // Fase 1: marca a carta escolhida - dispara o "brilho de garra" (CSS is-selected)
    setState((s) => {
      if (!s.stealCardPending || s.stealCardSelectedIndex != null) return s;
      const aiHand = s.ai?.hand || [];
      if (handIndex < 0 || handIndex >= aiHand.length) return s;
      return { ...s, stealCardSelectedIndex: handIndex, stealCardStolenIndex: null };
    });

    if (stealGrabRef.current) clearTimeout(stealGrabRef.current);
    if (stealResolveRef.current) clearTimeout(stealResolveRef.current);

    // Fase 2: dispara a animação de "roubo" (carta gira e é puxada para fora)
    stealGrabRef.current = setTimeout(() => {
      setState((s) => {
        if (!s.stealCardPending || s.stealCardSelectedIndex !== handIndex) return s;
        return { ...s, stealCardStolenIndex: handIndex };
      });
      stealGrabRef.current = null;
    }, 420);

    // Fase 3: resolve de fato a troca de carta, depois que a animação termina
    stealResolveRef.current = setTimeout(() => {
      setState((s) => {
        if (!s.stealCardPending || s.stealCardSelectedIndex !== handIndex) return s;

        const aiHand = [...(s.ai?.hand || [])];
        if (handIndex < 0 || handIndex >= aiHand.length) {
          return { ...s, stealCardPending: null, stealCardSelectedIndex: null, stealCardStolenIndex: null };
        }

        const stolenCard = aiHand[handIndex];
        aiHand.splice(handIndex, 1);
        const playerHand = [...(s.player?.hand || []), stolenCard];

        return {
          ...s,
          player: { ...s.player, hand: playerHand },
          ai: { ...s.ai, hand: aiHand },
          stealCardPending: null,
          stealCardSelectedIndex: null,
          stealCardStolenIndex: null,
          log: [...s.log, `${s.stealCardPending.guardianName} roubou uma carta da mão do oponente!`],
        };
      });
      stealResolveRef.current = null;
    }, 420 + 620);
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
    if (stealGrabRef.current) {
      clearTimeout(stealGrabRef.current);
      stealGrabRef.current = null;
    }
    if (stealResolveRef.current) {
      clearTimeout(stealResolveRef.current);
      stealResolveRef.current = null;
    }
    setState((s) => {
      if (!s.stealCardPending) return s;
      return {
        ...s,
        stealCardPending: null,
        stealCardSelectedIndex: null,
        stealCardStolenIndex: null,
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
        resurrectDuration: undefined,  // Remove duração (se houver)
        buffs: [],
        debuffs: [],
        statusEffects: [],
        shield: 0,
        shieldTurns: 0,
      };

      // Troca: coloca criatura restaurada no campo e envia a antiga para cemitério
      slots[fieldSlotIndex] = restoredCreature;
      graveyard.push(resetCombatStateForGraveyard(fieldCreature));

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
      const fieldState = {
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
      return effectRegistry.refreshFieldHpBonusForAllCreatures(fieldState, cardData);
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
      const fieldState = {
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
      return effectRegistry.refreshFieldHpBonusForAllCreatures(fieldState, cardData);
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

      if (resolvedAbility.randomTargets) {
        // Habilidade de dano em área com alvos aleatórios (ex: "1 de dano a 2 inimigos
        // aleatórios"): sorteia N inimigos vivos do lado alvo e aplica o dano em cada um,
        // em vez de atingir só a criatura que o jogador clicou para confirmar a mira.
        const enemyIndices = (s[targetSide]?.field?.slots || [])
          .map((slot, idx) => (slot && slot.hp > 0 ? idx : null))
          .filter((idx) => idx !== null);
        const chosenIndices = [...enemyIndices].sort(() => Math.random() - 0.5).slice(0, resolvedAbility.randomTargets);

        const attackerDelta = {};
        if (attacker.hasDraakBlessing || attacker.baseId === 'draak') {
          attackerDelta.draakPendingDamageBonus = (attacker.draakPendingDamageBonus || 0) + 1;
        }
        if (hasFree) {
          attackerDelta.freeAbilityUses = (attacker.freeAbilityUses || 2) - 1;
        }
        if (hasBonus) {
          attackerDelta.bonusAbilityUses = (attacker.bonusAbilityUses || 1) - 1;
        }
        const updatedUsedAbilities = new Set(s.creaturesWithUsedAbility || []);
        updatedUsedAbilities.add(attackerId);
        const updatedSlots = s[playerSide].field.slots.map((slot, idx) =>
          idx === slotIndex ? { ...slot, ...attackerDelta } : slot
        );

        const stateWithAttackAnim = {
          ...s,
          [playerSide]: { ...s[playerSide], field: { ...s[playerSide].field, slots: updatedSlots } },
          animations: { ...(s.animations || {}), [attackerId]: { type: 'attacking' } },
        };

        setTimeout(() => {
          setState((s2) => {
            const anims = { ...(s2.animations || {}) };
            if (anims[attackerId]?.type === 'attacking') delete anims[attackerId];
            return { ...s2, animations: anims };
          });
        }, 400);

        setTimeout(() => {
          setState((s2) => {
            let ns = {
              ...s2,
              [playerSide]: { ...s2[playerSide], essence: (s2[playerSide].essence || 0) - cost },
            };
            const hitNames = [];
            const hitIds = [];
            const animationsPayload = { ...(ns.animations || {}) };

            chosenIndices.forEach((idx) => {
              const currentTarget = ns[targetSide]?.field?.slots?.[idx];
              if (!currentTarget || currentTarget.hp <= 0) return;

              const dmgResult = effectRegistry.applyDamage(ns, {
                attackerId,
                targetId: currentTarget.id,
                baseDamage: resolvedAbility.damage,
                attackerElement: attacker.element,
                applyCombatPerks: true,
              });
              ns = dmgResult.newState;
              hitNames.push(currentTarget.name);
              hitIds.push(currentTarget.id);
              animationsPayload[currentTarget.id] = {
                type: 'damage',
                amount: dmgResult.damageDealt,
                hasAdvantage: !!dmgResult.hasAdvantage,
                hasDisadvantage: !!dmgResult.hasDisadvantage,
                shieldHit: !!dmgResult.shieldHit,
                shieldBroken: !!dmgResult.shieldBroken,
              };

              if (dmgResult.died) {
                const deadCreature = ns[targetSide].field.slots.find((slot) => slot?.id === currentTarget.id);
                if (deadCreature) {
                  const cleanedSlots = ns[targetSide].field.slots.map((slot) => (slot?.id === currentTarget.id ? null : slot));
                  const newOrbs = Math.max(0, (ns[targetSide].orbs || 0) - 1);
                  ns = {
                    ...ns,
                    [targetSide]: {
                      ...ns[targetSide],
                      field: { ...ns[targetSide].field, slots: cleanedSlots },
                      graveyard: [...(ns[targetSide].graveyard || []), resetCombatStateForGraveyard(deadCreature)],
                      orbs: newOrbs,
                    },
                    [playerSide]: { ...ns[playerSide], essence: Math.min(10, (ns[playerSide].essence || 0) + 1) },
                    killFeed: [...(ns.killFeed || []), {
                      turn: ns.turn,
                      attacker: attacker.name,
                      attackerId,
                      target: deadCreature.name,
                      targetId: deadCreature.id,
                      hadAdvantage: !!dmgResult.hasAdvantage,
                    }],
                  };
                  if (newOrbs === 0) {
                    const winner = targetSide === 'ai' ? 'player' : 'ai';
                    ns.phase = 'ended';
                    ns.gameResult = { winner, loser: targetSide, kills: ns.killFeed, turns: ns.turn, stats: ns.battleStats };
                  }
                }
              }
            });

            hitIds.forEach((id) => clearAnimAfter(id, 900));

            return {
              ...ns,
              creaturesWithUsedAbility: updatedUsedAbilities,
              log: [
                ...ns.log,
                `${attacker.name} usou ${ability.name?.pt || ability.name?.en || 'habilidade'} (custo: ${cost})`,
                hitNames.length > 0 ? `Atingiu: ${hitNames.join(', ')}.` : 'Nenhum alvo disponível.',
              ],
              animations: animationsPayload,
            };
          });
        }, 300);

        return stateWithAttackAnim;
      }

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
      if (resolvedAbility.selfBuff) {
        // Habilidade de evasão pura: concede esquiva ao próprio usuário, sem causar dano.
        const buffResult = effectRegistry.applyBuff(s, {
          targetId: attackerId,
          stat: resolvedAbility.selfBuff.stat,
          value: resolvedAbility.selfBuff.value,
          duration: resolvedAbility.selfBuff.duration,
          name: ability.name?.pt || ability.name?.en || 'Evasão',
          type: 'flat',
        });
        result = {
          newState: buffResult.newState,
          log: buffResult.log,
          damageDealt: 0,
          hasAdvantage: false,
          hasDisadvantage: false,
          shieldHit: false,
          shieldBroken: false,
          died: false,
        };
      } else {
        result = effectRegistry.applyDamage(s, {
          attackerId,
          targetId,
          baseDamage,
          attackerElement: attacker.element,
          // Nota: removeShield NÃO deve virar ignoreShield aqui - são coisas diferentes.
          // ignoreShield faria o dano atravessar o escudo sem quebrá-lo (e sem disparar o
          // feedback visual de "escudo quebrado"), escondendo do jogador que o escudo caiu.
          // O escudo deve absorver o dano normalmente; a remoção extra é aplicada abaixo.
          ignoreShield: false,
          applyCombatPerks: true,
        });
      }

      // Marca a criatura como tendo usado uma habilidade neste turno
      const updatedUsedAbilities = new Set(s.creaturesWithUsedAbility || []);
      updatedUsedAbilities.add(attackerId);

      // Atualiza bônus temporários (Roenhell) - guarda só o delta, não uma cópia inteira do
      // atacante, para não sobrescrever buffs aplicados a si mesmo (ex: evasão) por uma versão
      // desatualizada de antes da habilidade ser resolvida.
      const attackerDelta = {};
      if (attacker.hasDraakBlessing || attacker.baseId === 'draak') {
        attackerDelta.draakPendingDamageBonus = (attacker.draakPendingDamageBonus || 0) + 1;
      }
      if (hasFree) {
        attackerDelta.freeAbilityUses = (attacker.freeAbilityUses || 2) - 1;
      }
      if (hasBonus) {
        attackerDelta.bonusAbilityUses = (attacker.bonusAbilityUses || 1) - 1;
      }
      const updatedAttacker = { ...attacker, ...attackerDelta };

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
          animPayload = resolvedAbility.selfBuff
            ? {
                type: 'buff',
                stat: resolvedAbility.selfBuff.stat,
                amount: Math.round(resolvedAbility.selfBuff.value * 100),
              }
            : {
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

          if (resolvedAbility.cleanse) {
            const casterSlots = result.newState[playerSide].field.slots;
            const casterSlot = casterSlots.find((slot) => slot?.id === attackerId);
            if (casterSlot) {
              const { buffs, removedCount } = effectRegistry.removeCreatureDebuffs(casterSlot, resolvedAbility.cleanse);
              const updatedCasterSlots = casterSlots.map((slot) =>
                (slot?.id === attackerId ? { ...slot, buffs } : slot));
              result.newState = {
                ...result.newState,
                [playerSide]: { ...result.newState[playerSide], field: { ...result.newState[playerSide].field, slots: updatedCasterSlots } },
              };
              if (removedCount > 0) {
                result.log = [...result.log, `${attacker.name} removeu ${removedCount} efeito(s) negativo(s).`];
              }
            }
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

          if (resolvedAbility.drainEssence) {
            const currentTargetEssence = result.newState[targetSide]?.essence || 0;
            if (currentTargetEssence > 0) {
              const drained = Math.min(resolvedAbility.drainEssence, currentTargetEssence);
              result.newState = {
                ...result.newState,
                [targetSide]: {
                  ...result.newState[targetSide],
                  essence: currentTargetEssence - drained,
                },
              };
              result.log = [...result.log, `${attacker.name} drenou ${drained} de essência do adversário!`];
            }
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

          // Buff em si mesmo (ex: esquiva do Crogal) precisa animar sobre quem usou a
          // habilidade, não sobre o alvo clicado - senão parece que o efeito foi pro inimigo,
          // mesmo o estado (applyBuff acima) já indo pro atacante corretamente.
          const animTargetId = resolvedAbility.selfBuff ? attackerId : targetId;
          let animationsPayload = {
            ...(s2.animations || {}),
            ...(animPayload ? { [animTargetId]: animPayload } : {}),
          };
          // Se aplicou sleep, adiciona animação de sleep
          if (sleepApplied) {
            animationsPayload[targetId] = { ...animationsPayload[targetId], type: 'sleep' };
            // Remove animação de sleep após 1.2s
            clearAnimAfter(targetId, 1200);
          } else if (resolvedAbility.selfBuff) {
            // Remove animação de auto-buff (ex: evasão) após 1.3s
            clearAnimAfter(targetId, 1300);
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
                    ? { ...slot, ...attackerDelta }
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

          // Modo Calamidade: registra que a carta atacou a calamidade, pra ganhar XP por isso no
          // fim da partida (ver calculateCardXp em BattleResultModal.jsx) - sem isso, uma criatura
          // que passa a luta inteira martelando o chefe (que tem HP muito maior que uma criatura
          // normal) só ganhava XP se por acaso desse o golpe de misericórdia (cardsKilled abaixo).
          // Não conta auto-buffs puros (esquiva/armadura) - resolvedAbility.damage é forçado a 0
          // nesses casos (ver abilityResolver.js), então não houve ataque de verdade.
          if (s2.mode === 'calamity' && playerSide === 'player' && !resolvedAbility.selfBuff) {
            stateWithDamage.battleStats = {
              ...stateWithDamage.battleStats,
              player: {
                ...stateWithDamage.battleStats.player,
                cardsAttacked: [...(stateWithDamage.battleStats.player.cardsAttacked || []), attackerId],
              },
            };
          }

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
              stateWithDamage[targetSide].graveyard = [...(stateWithDamage[targetSide].graveyard || []), resetCombatStateForGraveyard(targetCreature)];
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
          graveyard: [...(s[side].graveyard || []), resetCombatStateForGraveyard(creature)],
        },
        essenceRewardPulse: {
          side,
          id: `sacrifice-${creature.id}-${Date.now()}`,
        },
        // Modo Calamidade: sacrificar a própria criatura pra esvaziar o campo de propósito antes
        // do turno dela conta como "evitou o ataque de propósito" em endTurn (calamityBossHealPending)
        // - ver comentário lá.
        calamitySacrificedThisTurn: (s.mode === 'calamity' && side === 'player') ? true : s.calamitySacrificedThisTurn,
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

      // Final Meteor: revela o "hit" (número/flash de dano) só depois que o meteoro impacta na
      // tela (~900ms) - o HP já mudou instantaneamente acima, isso só libera a parte visual.
      if (effectCard.id === 'effect_final_meteor' && newState.animations) {
        const pendingIds = Object.keys(newState.animations).filter(id => newState.animations[id]?.hitPending);
        if (pendingIds.length > 0) {
          setTimeout(() => {
            setState(s2 => {
              const anims = { ...(s2.animations || {}) };
              pendingIds.forEach((id) => {
                if (anims[id]) anims[id] = { ...anims[id], hitPending: false };
              });
              return { ...s2, animations: anims };
            });
          }, 900);
        }
      }

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

        // Limpa animações de dano após 900ms (Final Meteor tem animação maior/mais lenta e
        // usa seu próprio timer mais longo abaixo, então fica de fora dessa limpeza padrão)
        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            animTargets.forEach(id => {
              if (anims[id] && anims[id].type === 'damage' && anims[id].attackerId !== 'effect_final_meteor') {
                delete anims[id];
              }
            });
            return { ...s2, animations: anims };
          });
        }, 900);

        // Limpeza dedicada do Final Meteor (animação de ~1.6s, precisa de mais tempo em tela)
        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            animTargets.forEach(id => {
              if (anims[id] && anims[id].type === 'damage' && anims[id].attackerId === 'effect_final_meteor') {
                delete anims[id];
              }
            });
            return { ...s2, animations: anims };
          });
        }, 1900);

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
                    updated.ai.graveyard = [...(updated.ai.graveyard || []), resetCombatStateForGraveyard(targetCreatureNow)];
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

      // Final Meteor (jogado pelo oponente): revela o "hit" só depois que o meteoro impacta (~900ms)
      if (effectCard.id === 'effect_final_meteor' && newState.animations) {
        const pendingIds = Object.keys(newState.animations).filter(id => newState.animations[id]?.hitPending);
        if (pendingIds.length > 0) {
          setTimeout(() => {
            setState(s2 => {
              const anims = { ...(s2.animations || {}) };
              pendingIds.forEach((id) => {
                if (anims[id]) anims[id] = { ...anims[id], hitPending: false };
              });
              return { ...s2, animations: anims };
            });
          }, 900);
        }
      }

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
              if (anims[id] && anims[id].type === 'damage' && anims[id].attackerId !== 'effect_final_meteor') {
                delete anims[id];
              }
            });
            return { ...s2, animations: anims };
          });
        }, 900);

        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            animTargets.forEach(id => {
              if (anims[id] && anims[id].type === 'damage' && anims[id].attackerId === 'effect_final_meteor') {
                delete anims[id];
              }
            });
            return { ...s2, animations: anims };
          });
        }, 1900);

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
                    updated.player.graveyard = [...(updated.player.graveyard || []), resetCombatStateForGraveyard(targetCreatureNow)];
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

    // Ilusão de Teatro (controlar criatura inimiga): se houver slot livre no seu campo, a
    // criatura controlada realmente muda de lado por N turnos. Sem slot livre, executeEffectCard
    // (ai.js) cai no modo ilusório - um único ataque "fantasma" via controlAttackPending, igual
    // ao ataque espectral do cemitério - então não é preciso bloquear a ativação aqui.

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
        nextState.ai.graveyard = [...(nextState.ai.graveyard || []), resetCombatStateForGraveyard(target)];
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

  // Funções para ataque ilusório (Ilusão de Teatro sem slot livre no campo do jogador)
  const selectControlAbility = useCallback((abilityIndex) => {
    setState(s => ({
      ...s,
      controlAttackPending: {
        ...s.controlAttackPending,
        selectedAbility: abilityIndex
      }
    }));
  }, []);

  const executeControlAttack = useCallback((targetSlotIndex) => {
    setState(s => {
      // Ilusão de Teatro ainda não tem suporte em rede no PvP (mesma limitação do ataque espectral).
      if (s.mode === 'pvp' && s.isHost === false) {
        return { ...s, log: [...s.log, 'Essa ilusão ainda não está disponível no PvP.'] };
      }
      if (!s.controlAttackPending) return s;

      if (s.controlAttackPending.resolving) return s;

      const { creatureIndex, creature, selectedAbility } = s.controlAttackPending;
      const ability = creature.abilities?.[selectedAbility];

      if (!ability) return s;

      // A criatura ilusória não pode atacar a si mesma (ela continua no campo do adversário).
      if (targetSlotIndex === creatureIndex) return s;

      const target = s.ai.field.slots[targetSlotIndex];
      if (!target || target.hp <= 0) return s;

      // Executa o ataque usando a lógica padrão
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
        controlAttackPending: {
          ...s.controlAttackPending,
          selectedAbility: undefined,
          resolving: true,
        },
        log: [...result.newState.log, `${creatureName} foi controlada pela ilusão e atacou com ${abilityName}!`]
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
            const stateWithDeath = {
              ...s2,
              animations: {
                ...(s2.animations || {}),
                [target.id]: { death: true },
              },
            };

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

        nextState.ai.graveyard = [...(nextState.ai.graveyard || []), resetCombatStateForGraveyard(target)];
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

        nextState.killFeed = [...(nextState.killFeed || []), {
          turn: nextState.turn,
          attacker: creature?.name || 'Ilusão',
          attackerId: creature.id,
          target: target.name,
          targetId: target.id,
          hadAdvantage: !!result.hasAdvantage,
        }];

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
          controlAttackPending: null
        }));
      }, result.died ? 1400 : 700);

      return nextState;
    });
  }, []);

  const cancelControlAttack = useCallback(() => {
    setState(s => ({
      ...s,
      controlAttackPending: null
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
    selectControlAbility,
    executeControlAttack,
    cancelControlAttack,
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
  }), [state, startBattle, endTurn, drawPlayerCard, summonFromHand, invokeFieldCard, invokeFieldCardAI, useAbility, sacrificeCreature, resurrectCreature, cancelResurrection, returnEnemyCard, cancelReturnCard, poisonEnemyCard, cancelPoisonCard, stealEnemyCard, revealEnemyCard, cancelStealCard, cancelRevealEnemy, selectFieldCardForSwap, completeSwap, cancelSwap, freezeEnemyCard, cancelFreezeCard, healAllyCard, cancelHealCard, applyVirideerBless, cancelVirideerBless, log, playEffectCard, selectEffectCardTarget, updateEffectCardTarget, cancelEffectCard, cancelDrawOpponent, selectSpectralAbility, executeSpectralAttack, cancelSpectralAttack, selectControlAbility, executeControlAttack, cancelControlAttack]);

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
        aiSlots[fieldIdx] = { ...graveCreature, buffs: [], debuffs: [], statusEffects: [], shield: 0, shieldTurns: 0, hp: graveCreature.maxHp ?? graveCreature.hp };
        aiGraveyard.push(resetCombatStateForGraveyard(fieldCreature));
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

    // Zefri: um aliado aleatório dorme por 2 turnos, curando 2 HP em cada um desses turnos (IA)
    if (build.hasZefriBlessing) {
      const indices = aiSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null && idx !== summonSlotIndex);
      const targetIdx = indices.length > 0 ? getRandomIndex(indices) : summonSlotIndex;
      const target = aiSlots[targetIdx];
      if (target) {
        const newStatusEffects = target.statusEffects ? [...target.statusEffects] : [];

        const sleepEffect = newStatusEffects.find(e => e.type === 'sleep');
        if (sleepEffect) {
          sleepEffect.duration = Math.max(sleepEffect.duration, 2);
        } else {
          newStatusEffects.push({ type: 'sleep', duration: 2, source: creatureName });
        }

        // Se já está com a vida cheia, a cura seria desperdiçada: em vez disso, soma
        // +2 de vida máxima permanente (mesmo padrão usado pela bênção da Arguilia).
        const isFullHp = target.hp >= (target.maxHp || target.hp);
        if (isFullHp) {
          aiSlots[targetIdx] = {
            ...target,
            hp: target.hp + 2,
            maxHp: (target.maxHp || target.hp) + 2,
            statusEffects: newStatusEffects,
          };
          nextLog = [...nextLog, `${creatureName} fez ${aiSlots[targetIdx].name} dormir por 2 turnos; como já estava com a vida cheia, ganhou +2 de vida máxima!`];
        } else {
          const regenEffect = newStatusEffects.find(e => e.type === 'regeneration');
          if (regenEffect) {
            regenEffect.duration = Math.max(regenEffect.duration, 2);
            regenEffect.value = Math.max(regenEffect.value || 0, 2);
          } else {
            newStatusEffects.push({ type: 'regeneration', duration: 2, value: 2, source: creatureName });
          }
          aiSlots[targetIdx] = { ...target, statusEffects: newStatusEffects };
          nextLog = [...nextLog, `${creatureName} fez ${aiSlots[targetIdx].name} dormir por 2 turnos, curando 2 HP a cada turno!`];
        }
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

    // Ekerath: todos os aliados da IA ganham +1 de escudo e +1 de vida
    if (build.hasEkerathBlessing) {
      const buffedIds = [];
      const updated = aiSlots.map((slot) => {
        if (!slot) return slot;
        buffedIds.push(slot.id);
        return {
          ...slot,
          shield: (slot.shield || 0) + 1,
          hp: Math.min(slot.hp + 1, slot.maxHp),
        };
      });
      aiSlots.splice(0, aiSlots.length, ...updated);
      if (buffedIds.length > 0) {
        nextLog = [...nextLog, `${creatureName} concedeu +1 de escudo e +1 de vida para ${buffedIds.length} aliado(s) da IA!`];
        s.animations = {
          ...(s.animations || {}),
          ...buffedIds.reduce((acc, id) => ({ ...acc, [id]: { type: 'heal', amount: 1, icon: 'heart' } }), {}),
        };
        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            buffedIds.forEach(id => delete anims[id]);
            return { ...s2, animations: anims };
          });
        }, 900);
      }
    }

    // Aldanor: todas as outras criaturas em campo (aliadas e inimigas) dormem por 2 turnos
    if (build.hasAldanorBlessing) {
      const aiIndices = aiSlots.map((slot, idx) => (slot && idx !== summonSlotIndex ? idx : null)).filter(idx => idx !== null);
      const sleepingIds = [];
      aiIndices.forEach(idx => {
        aiSlots[idx] = applyStatusEffect(aiSlots[idx], 'sleep', 2, creatureName);
        sleepingIds.push(aiSlots[idx].id);
      });

      const playerSlots = [...(s.player?.field?.slots || [])];
      const updatedPlayerSlots = playerSlots.map(slot => {
        if (!slot) return slot;
        sleepingIds.push(slot.id);
        return applyStatusEffect(slot, 'sleep', 2, creatureName);
      });
      s.player = { ...s.player, field: { ...s.player.field, slots: updatedPlayerSlots } };

      if (sleepingIds.length > 0) {
        nextLog = [...nextLog, `${creatureName} fez todas as outras criaturas em campo dormirem por 2 turnos! Só ele poderá atacar.`];
        s.animations = {
          ...(s.animations || {}),
          ...sleepingIds.reduce((acc, id) => ({ ...acc, [id]: { type: 'sleep' } }), {}),
        };
        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            sleepingIds.forEach(id => delete anims[id]);
            return { ...s2, animations: anims };
          });
        }, 1200);
      }
    }

    // Grombi (IA): lança a bola de pedra, 1 de dano a todas as cartas em campo (dos dois lados)
    if (build.hasGrombiBlessing) {
      Object.assign(s, damageAllOnField(s, { amount: 1, sourceName: creatureName, excludeId: aiSlots?.[summonSlotIndex]?.id, visualId: 'grombi_ball' }));
      nextLog = s.log;
      playFxSound(earthSfx);
    }

    // Ekerion (IA): solta a rajada de vento, 1 de dano a todas as criaturas em campo (dos dois lados)
    if (build.hasEkerionBlessing) {
      Object.assign(s, damageAllOnField(s, { amount: 1, sourceName: creatureName, excludeId: aiSlots?.[summonSlotIndex]?.id, visualId: 'ekerion_gust' }));
      nextLog = s.log;
      playFxSound(airSfx);
    }

    // Igrazar (IA): 1 de dano a uma criatura aleatória no campo do jogador
    if (build.hasIgrazarBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const targetCreature = { ...playerSlots[idx], hp: Math.max(0, playerSlots[idx].hp - 1) };
        playerSlots[idx] = targetCreature;
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 1 de dano a ${targetCreature.name}!`];
        s.animations = { ...(s.animations || {}), [targetCreature.id]: { type: 'damage', amount: 1 } };
        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            if (anims[targetCreature.id]?.type === 'damage') delete anims[targetCreature.id];
            return { ...s2, animations: anims };
          });
        }, 900);
        Object.assign(s, settleDefeatedCreature(s, {
          targetSide: 'player',
          targetId: targetCreature.id,
          killerSide: 'ai',
          killerId: aiSlots?.[summonSlotIndex]?.id,
          killerName: creatureName,
          by: 'Igrazar',
        }));
        nextLog = s.log;
      }
    }

    // Hipoderion (IA): uma onda varre o campo do jogador e depois causa 1 de dano a cada carta
    if (build.hasHipoderionBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const hitIds = [];
      const updated = playerSlots.map((slot) => {
        if (!slot) return slot;
        hitIds.push(slot.id);
        return { ...slot, hp: Math.max(0, slot.hp - 1) };
      });
      s.player = { ...s.player, field: { ...s.player.field, slots: updated } };
      if (hitIds.length > 0) {
        nextLog = [...nextLog, `${creatureName} atingiu todo o seu campo com 1 de dano!`];
        s.animations = {
          ...(s.animations || {}),
          fx_hipoderion_wave: { type: 'fieldFx', kind: 'hipoderion_wave', side: 'player' },
        };
        playFxSound(waterSfx);
        const killerId = aiSlots?.[summonSlotIndex]?.id;
        setTimeout(() => {
          setState(s2 => {
            let updatedState = {
              ...s2,
              animations: {
                ...(s2.animations || {}),
                ...hitIds.reduce((acc, id) => ({ ...acc, [id]: { type: 'damage', amount: 1 } }), {}),
              },
            };
            hitIds.forEach((id) => {
              const target = (updatedState.player?.field?.slots || []).find(c => c?.id === id);
              if (target && target.hp <= 0 && !target._defeatSettled) {
                updatedState = settleDefeatedCreature(updatedState, {
                  targetSide: 'player',
                  targetId: id,
                  killerSide: 'ai',
                  killerId,
                  killerName: creatureName,
                  by: 'Hipoderion',
                });
              }
            });
            return updatedState;
          });
        }, WAVE_FX_HIT_DELAY_MS);
        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            delete anims.fx_hipoderion_wave;
            hitIds.forEach(id => { if (anims[id]?.type === 'damage') delete anims[id]; });
            return { ...s2, animations: anims };
          });
        }, WAVE_FX_DURATION_MS);
      }
    }

    // Crogal (IA): ganha 1 de essência por réptil em campo (dos dois lados)
    if (build.hasCrogalBlessing) {
      const reptileCount = [
        ...(s.player?.field?.slots || []),
        ...(s.ai?.field?.slots || []),
      ].filter(isReptiloidCreature).length;
      if (reptileCount > 0) {
        s.ai = { ...s.ai, essence: (s.ai.essence || 0) + reptileCount };
        s.essenceRewardPulse = { side: 'ai', id: `ai-crogal-${Date.now()}` };
        nextLog = [...nextLog, `${creatureName} sintonizou com ${reptileCount} réptil(eis) em campo e ganhou ${reptileCount} de essência!`];
      }
    }

    // Albot (IA): feras já em campo (incluindo ele) ganham +1 de ataque permanente
    if (build.hasAlbotBlessing) {
      const buffedIds = [];
      const updated = aiSlots.map((slot) => {
        if (!slot || !isBeastCreature(slot)) return slot;
        buffedIds.push(slot.id);
        return { ...slot, atk: (slot.atk || 0) + 1 };
      });
      aiSlots.splice(0, aiSlots.length, ...updated);
      if (buffedIds.length > 0) {
        nextLog = [...nextLog, `${creatureName} concedeu +1 de ataque para ${buffedIds.length} fera(s) da IA!`];
        s.animations = {
          ...(s.animations || {}),
          ...buffedIds.reduce((acc, id) => ({ ...acc, [id]: { type: 'status', statusType: 'attackBuff' } }), {}),
        };
        setTimeout(() => {
          setState(s2 => {
            const anims = { ...(s2.animations || {}) };
            buffedIds.forEach(id => delete anims[id]);
            return { ...s2, animations: anims };
          });
        }, 900);
      }
    }

    // Kael: 1 dano 3 vezes ou 3 de dano direto
    if (build.hasKaelBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      const kaelHitIds = new Set();
      if (indices.length === 1) {
        const idx = indices[0];
        const target = playerSlots[idx];
        target.hp = Math.max(0, target.hp - 3);
        playerSlots[idx] = target;
        kaelHitIds.add(target.id);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 3 de dano direto a ${target.name}!`];
      } else if (indices.length > 1) {
        for (let i = 0; i < 3; i += 1) {
          const idx = getRandomIndex(indices);
          const target = playerSlots[idx];
          target.hp = Math.max(0, target.hp - 1);
          playerSlots[idx] = target;
          kaelHitIds.add(target.id);
        }
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 1 de dano 3 vezes a criaturas aleatórias!`];
      }
      if (kaelHitIds.size > 0) {
        // Sem isso, uma criatura derrubada a 0 de vida pela bênção ficava "morta-viva" no campo
        // (sem animação, sem ir pro cemitério, sem custar orbe) - igual ao bug já corrigido no Ashfang.
        s.log = nextLog;
        kaelHitIds.forEach((targetId) => {
          Object.assign(s, settleDefeatedCreature(s, {
            targetSide: 'player',
            targetId,
            killerSide: 'ai',
            killerId: (aiSlots || [])[summonSlotIndex]?.id || creatureData.id,
            killerName: creatureName,
            by: 'Kael',
          }));
        });
        nextLog = s.log;
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
  }, [settleDefeatedCreature, damageAllOnField, playFxSound]);

  const getAiAttackOption = useCallback((s) => {
    const aiSlots = s.ai?.field?.slots || [];
    const playerSlots = s.player?.field?.slots || [];
    const usedAbilities = s.creaturesWithUsedAbility || new Set();
    const currentEssence = s.ai?.essence || 0;
    const difficulty = resolveAiDifficulty(s);

    const possibleTargets = playerSlots
      .map((slot, idx) => (slot && slot.hp > 0 ? { slotIndex: idx, creature: slot } : null))
      .filter(Boolean);

    if (possibleTargets.length === 0) return null;

    // Monta toda combinação válida (atacante + habilidade + alvo) em vez de travar cedo na
    // "melhor habilidade" contra o alvo com menos vida - assim dá pra pesar vantagem/desvantagem
    // elemental, priorizar finalizar um alvo (kill) e neutralizar a ameaça mais perigosa em campo.
    const combos = [];
    aiSlots.forEach((attackerSlot, attackerIndex) => {
      if (!attackerSlot || attackerSlot.hp <= 0) return;

      const incapacitating = (attackerSlot.statusEffects || []).some(e => ['paralyze', 'freeze', 'sleep'].includes(e.type) && e.duration > 0);
      if (incapacitating) return;

      const alreadyUsedAbility = usedAbilities.has(attackerSlot.id);
      const hasBonus = (attackerSlot.bonusAbilityUses || 0) > 0;
      if (alreadyUsedAbility && !hasBonus) return;

      const hasFree = (attackerSlot.freeAbilityUses || 0) > 0;

      (attackerSlot.abilities || []).forEach((ability, abilityIndex) => {
        const cost = hasFree ? 0 : (ability.cost || 0);
        if (cost > currentEssence) return;
        const baseDamage = typeof ability.damage === 'number' ? ability.damage : (cost * 2 + 1);

        possibleTargets.forEach(({ slotIndex: targetIndex, creature: targetCreature }) => {
          const { modifier, hasAdvantage, hasDisadvantage } = effectRegistry.getElementModifier(attackerSlot.element, targetCreature.element);
          const effectiveDamage = Math.max(0, baseDamage + modifier);
          const isLethal = effectiveDamage >= targetCreature.hp;

          let score = effectiveDamage * 10;
          if (hasAdvantage) score += 18;
          if (hasDisadvantage) score -= 22;
          if (isLethal) score += 120 + (targetCreature.atk || 0) * 4 + (targetCreature.hp || 0) * 1.5;
          // Neutralizar quem bate mais forte vale mais que só encostar em qualquer um.
          score += (targetCreature.atk || 0) * 1.4;
          // Prioriza finalizar alvos que já estão fracos, mesmo sem matar nesta ação.
          score += Math.max(0, 8 - targetCreature.hp) * 1.2;

          combos.push({
            attackerSlot: attackerIndex,
            targetSlot: targetIndex,
            abilityIndex,
            attackerName: attackerSlot.name,
            score,
          });
        });
      });
    });

    if (combos.length === 0) return null;

    combos.sort((a, b) => b.score - a.score);

    // Dificuldade baixa (níveis iniciais da torre) = maior chance de a IA "errar" a jogada ótima
    // e escolher uma combinação aleatória entre as válidas; no topo da torre (10) ela quase
    // sempre acerta a melhor jogada disponível.
    const mistakeChance = Math.max(0, 0.55 - difficulty * 0.055);
    const chosen = Math.random() < mistakeChance
      ? combos[Math.floor(Math.random() * combos.length)]
      : combos[0];

    return {
      attackerSlot: chosen.attackerSlot,
      targetSlot: chosen.targetSlot,
      abilityIndex: chosen.abilityIndex,
      attackerName: chosen.attackerName,
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

  // Turno da Calamidade (modo "calamity"): substitui performAiTurn/continueAiCombat inteiramente —
  // o chefe não decide nada, só alterna entre um ataque individual (na primeira criatura viva do
  // jogador) e um ataque em área (em todas), com dano fixo definido em `calamity.attacks` da carta
  // e escalado por `calamityPlayerCount`. A vitória do jogador já acontece sozinha pelo caminho
  // normal de orbes: o chefe é a única criatura do lado "ai", que começa com 1 orbe só.
  //
  // Fases por % de vida (pedido do usuário, 2026-08-18): abaixo de 50% e 10% de HP o chefe fica
  // mais "apelão" — dano escalado por FASE_DAMAGE_MULTIPLIER, e a partir da fase 2 ele passa a
  // usar os dois tipos de ataque (individual E área) no mesmo turno em vez de alternar um só.
  const CALAMITY_PHASE_DAMAGE_MULTIPLIER = { 1: 1, 2: 1.35, 3: 1.75 };
  // Fração da vida máxima que a calamidade recupera quando o jogador termina o turno de campo
  // vazio de propósito (tinha carta pra summonar e não jogou - ver calamityBossHealPending em
  // endTurn) só pra não ter nada a perder no turno dela. Sem isso, ficar de campo vazio era de
  // graça: o ataque simplesmente não achava alvo e não acontecia nada.
  const CALAMITY_EMPTY_FIELD_HEAL_PCT = 0.08;
  // A onda de área (.field-fx-calamity_wave, ver effects.css) varre a tela por 1600ms. Se o
  // número de dano nasce e some (900ms, mesmo padrão do resto do jogo) ao mesmo tempo que a
  // onda começa, ele fica "perdido" no meio do efeito maior e o jogador não percebe - reportado
  // como "às vezes não mostra o dano" (2026-08-19). O Hipoderion já resolve isso revelando o
  // número só depois que a onda varreu boa parte da tela (WAVE_FX_HIT_DELAY_MS/WAVE_FX_DURATION_MS
  // lá em cima); aqui é o mesmo esquema, só com os tempos proporcionais aos 1600ms desta onda.
  const CALAMITY_WAVE_HIT_DELAY_MS = 900;
  const CALAMITY_WAVE_CLEANUP_MS = 1800;
  const getCalamityPhase = (hp, maxHp) => {
    const pct = maxHp > 0 ? hp / maxHp : 1;
    if (pct <= 0.1) return 3;
    if (pct <= 0.5) return 2;
    return 1;
  };
  // Cor (RGB) da onda cinematográfica do ataque em área, por elemento do chefe.
  const CALAMITY_FX_RGB = {
    fogo: '255,110,40',
    agua: '70,180,255',
    terra: '150,210,90',
    ar: '210,240,255',
    puro: '230,200,255',
  };
  const runCalamityBossTurn = useCallback(() => {
    // Se uma cadeia de turno já está rodando (windup/resolve/cleanup/endTurn ainda pendentes),
    // não inicia outra por cima - ver comentário na declaração de calamityTurnRunningRef.
    if (calamityTurnRunningRef.current) return;
    calamityTurnRunningRef.current = true;
    setTimeout(() => {
      // Pose de investida: o chefe "carrega" o golpe antes de acertar (mesma classe visual
      // slot-attacking que toda criatura já usa - só precisava ser alimentada aqui).
      // runCalamityBossTurn substitui o fluxo normal de turno da IA inteiro (ver comentário
      // acima), então nunca herdou a checagem de incapacitação (paralisia/congelamento/sono)
      // que toda outra criatura já respeita antes de agir - por isso o chefe atacava mesmo
      // paralisado. Checa aqui igual ao resto do motor: (creature.statusEffects||[]).some(...).
      setState((s) => {
        if (s.mode !== 'calamity' || s.phase !== 'playing' || s.activePlayer !== 'ai') return s;
        const boss = (s.ai.field.slots || [])[0];
        if (!boss || boss.hp <= 0) return s;
        const incapacitating = (boss.statusEffects || []).some(e => ['paralyze', 'freeze', 'sleep'].includes(e.type) && e.duration > 0);
        if (incapacitating) return s;
        return { ...s, animations: { ...(s.animations || {}), [boss.id]: { type: 'attacking' } } };
      });

      setTimeout(() => {
        let hitAnimTargets = [];
        let usedAreaThisTurn = false;
        setState((s) => {
          if (s.mode !== 'calamity' || s.phase !== 'playing' || s.activePlayer !== 'ai') return s;
          const boss = (s.ai.field.slots || [])[0];
          if (!boss || boss.hp <= 0) return s;

          const incapacitating = (boss.statusEffects || []).some(e => ['paralyze', 'freeze', 'sleep'].includes(e.type) && e.duration > 0);
          if (incapacitating) {
            const statusName = boss.statusEffects.find(e => ['paralyze', 'freeze', 'sleep'].includes(e.type))?.type;
            const statusLabel = statusName === 'freeze' ? 'congelado' : statusName === 'sleep' ? 'dormindo' : 'paralisado';
            const clearedAnims = { ...(s.animations || {}) };
            delete clearedAnims[boss.id];
            return {
              ...s,
              animations: clearedAnims,
              log: [...(s.log || []), `${boss.name} está ${statusLabel} e não conseguiu atacar!`],
            };
          }

          const bossCardData = creaturesPool.find((c) => c && c.id === boss.baseId);
          const calamityData = bossCardData?.calamity;
          const scale = calamityData?.powerScale?.[s.calamityPlayerCount || 1] ?? 1;
          const phase = getCalamityPhase(boss.hp, boss.maxHp);
          const phaseMult = CALAMITY_PHASE_DAMAGE_MULTIPLIER[phase] || 1;
          const kind = s.calamityAttackKind || 'single';
          const nextKind = kind === 'single' ? 'area' : 'single';
          // Fase 1: alterna um tipo por turno (comportamento original). Fase 2+: usa os dois no
          // mesmo turno - o chefe fica genuinamente mais perigoso, não só com números maiores.
          const kindsThisTurn = phase >= 2 ? ['single', 'area'] : [kind];

          const animsAfterWindup = { ...(s.animations || {}) };
          delete animsAfterWindup[boss.id]; // encerra a pose de investida, o golpe já vai acertar
          let current = { ...s, animations: animsAfterWindup };
          const previousPhase = s.calamityPhaseReached || 1;
          if (phase > previousPhase) {
            const phaseLog = phase === 3
              ? `${boss.name} está agonizante e desesperado - seus ataques ficam ainda mais violentos!`
              : `${boss.name} entra em fúria com a vida baixa - os ataques ficam mais fortes!`;
            current = { ...current, calamityPhaseReached: phase, log: [...(current.log || []), phaseLog] };
          }

          let anyTargetsHit = false;
          const deferredAreaHits = [];
          kindsThisTurn.forEach((atkKind) => {
            const attackDef = calamityData?.attacks?.[atkKind];
            const dmg = Math.max(1, Math.round((attackDef?.baseDamage || 1) * scale * phaseMult));
            const attackName = attackDef?.name?.pt || (atkKind === 'area' ? 'Ataque em área' : 'Ataque individual');

            const aliveTargets = (current.player.field.slots || []).filter((c) => c && c.hp > 0);
            const targets = atkKind === 'area' ? aliveTargets : aliveTargets.slice(0, 1);
            if (targets.length === 0) return;
            anyTargetsHit = true;

            current = { ...current, log: [...(current.log || []), `${boss.name} usa ${attackName}!`] };

            // Onda cinematográfica varrendo o campo do jogador, no mesmo padrão visual já usado
            // pelas bênçãos de área (Grombi/Ekerion/Hipoderion) - só que colorida pelo elemento
            // do chefe, já que os 4 Ekers cobrem os 4 elementos.
            const isArea = atkKind === 'area';
            if (isArea) {
              usedAreaThisTurn = true;
              current = {
                ...current,
                animations: {
                  ...(current.animations || {}),
                  fx_calamity_wave: {
                    type: 'fieldFx',
                    kind: 'calamity_wave',
                    side: 'player',
                    elementRgb: CALAMITY_FX_RGB[boss.element] || CALAMITY_FX_RGB.puro,
                  },
                },
              };
            }

            const hits = [];
            targets.forEach((creature) => {
              const res = effectRegistry.applyDamage(current, {
                attackerId: boss.id,
                targetId: creature.id,
                baseDamage: dmg,
                attackerElement: boss.element || 'puro',
                ignoreShield: false,
                applyCombatPerks: false,
              });
              current = { ...res.newState, log: [...(res.newState.log || []), ...(res.log || [])] };
              hits.push({ id: creature.id, res });
            });

            hits.forEach(({ id, res }) => {
              const animPayload = {
                type: 'damage',
                amount: res.damageDealt,
                hasAdvantage: !!res.hasAdvantage,
                hasDisadvantage: !!res.hasDisadvantage,
                shieldHit: !!res.shieldHit,
                shieldBroken: !!res.shieldBroken,
              };
              if (isArea) {
                // Só adia a REVELAÇÃO do número - o dano em si (hp, morte) já foi aplicado acima,
                // na hora certa. Sem isso o "-N" nasce e some junto com o início da onda (1600ms)
                // e passa despercebido.
                deferredAreaHits.push({ id, animPayload });
              } else {
                current = { ...current, animations: { ...(current.animations || {}), [id]: animPayload } };
                hitAnimTargets.push(id);
              }
              current = settleDefeatedCreature(current, {
                targetSide: 'player',
                targetId: id,
                killerSide: 'ai',
                killerId: boss.id,
                killerName: boss.name,
                by: boss.name,
              });
            });
          });

          if (deferredAreaHits.length > 0) {
            setTimeout(() => {
              setState((s2) => {
                const anims = { ...(s2.animations || {}) };
                deferredAreaHits.forEach(({ id, animPayload }) => {
                  anims[id] = animPayload;
                  hitAnimTargets.push(id);
                });
                return { ...s2, animations: anims };
              });
            }, CALAMITY_WAVE_HIT_DELAY_MS);
          }

          if (!anyTargetsHit) {
            current = { ...current, log: [...(current.log || []), `${boss.name} não encontra alvos.`] };

            if (current.calamityBossHealPending) {
              const bossSlots = current.ai.field.slots || [];
              const bossSlot = bossSlots[0];
              if (bossSlot && bossSlot.hp > 0) {
                const maxHp = bossSlot.maxHp || boss.maxHp || bossSlot.hp;
                const healAmount = Math.max(1, Math.round(maxHp * CALAMITY_EMPTY_FIELD_HEAL_PCT));
                const healedHp = Math.min(maxHp, bossSlot.hp + healAmount);
                const actualHealed = healedHp - bossSlot.hp;
                const updatedBossSlots = bossSlots.map((slot, idx) => (idx === 0 ? { ...slot, hp: healedHp } : slot));
                hitAnimTargets.push(boss.id);
                current = {
                  ...current,
                  ai: { ...current.ai, field: { ...current.ai.field, slots: updatedBossSlots } },
                  animations: {
                    ...(current.animations || {}),
                    [boss.id]: { type: 'heal', amount: actualHealed },
                  },
                  log: [...current.log, `${boss.name} sente a covardia do adversário e recupera ${actualHealed} de vida!`],
                };
              }
            }
          }

          return { ...current, calamityAttackKind: nextKind, calamityBossHealPending: false };
        });

        // Limpa os flashes de impacto e a onda de área depois que dá tempo de ver. Quando teve
        // ataque em área, o número de dano só é revelado em CALAMITY_WAVE_HIT_DELAY_MS (ver
        // acima) - a limpeza precisa esperar isso + o tempo normal de exibição, senão apaga o
        // número antes dele sequer aparecer.
        const cleanupDelay = usedAreaThisTurn ? CALAMITY_WAVE_CLEANUP_MS : 900;
        setTimeout(() => {
          setState((s2) => {
            const anims = { ...(s2.animations || {}) };
            hitAnimTargets.forEach((id) => { delete anims[id]; });
            delete anims.fx_calamity_wave;
            return { ...s2, animations: anims };
          });
        }, cleanupDelay);

        setTimeout(() => {
          calamityTurnRunningRef.current = false;
          endTurn();
        }, cleanupDelay + 50);
      }, 500);
    }, 900);
  }, [endTurn, settleDefeatedCreature]);

  // Executa a jogada de carta de efeito escolhida por chooseAiEffectCardPlay (PRIORIDADE 0.5 de
  // performAiTurn). Só cobre os tipos "sem alvo" de SAFE_AI_EFFECT_TYPES (ai.js) - draw/essence/
  // heal/shieldAll afetam o próprio lado da IA, damageAll/destroyAll afetam o campo do jogador.
  // Não reaproveita executeEffectCard (ai.js) porque essa função assume caster='player'/alvo='ai'
  // fixo; aqui os lados são invertidos por definição (quem joga é a IA).
  const applyAiEffectCard = useCallback((s, effectPlay, logEntries) => {
    const { handIndex, card } = effectPlay;
    const hand = [...(s.ai?.hand || [])];
    if (hand[handIndex] !== card.id) return null; // mão mudou entre a decisão e a execução

    hand.splice(handIndex, 1);
    const cardName = typeof card.name === 'object' ? (card.name.pt || card.name.en) : card.name;
    let nextState = {
      ...s,
      ai: { ...s.ai, hand },
      log: [...logEntries, `IA usou a carta de efeito ${cardName}!`],
    };

    switch (card.effectType) {
      case 'draw': {
        const deck = [...(nextState.ai.deck || [])];
        const aiHand = [...nextState.ai.hand];
        for (let i = 0; i < (card.effectValue || 1); i += 1) {
          if (deck.length === 0 || aiHand.length >= 7) break;
          aiHand.push(deck.shift());
        }
        nextState.ai = { ...nextState.ai, deck, hand: aiHand };
        break;
      }
      case 'essence': {
        nextState.ai = { ...nextState.ai, essence: Math.min(10, (nextState.ai.essence || 0) + (card.effectValue || 0)) };
        break;
      }
      case 'heal': {
        nextState.ai = { ...nextState.ai, orbs: Math.min(5, (nextState.ai.orbs || 0) + (card.effectValue || 0)) };
        break;
      }
      case 'shieldAll': {
        const slots = (nextState.ai.field.slots || []).map((slot) => {
          if (!slot) return slot;
          return {
            ...slot,
            shield: (slot.shield || 0) + (card.effectValue || 0),
            shieldTurns: Math.max(slot.shieldTurns || 0, card.duration || 0),
          };
        });
        nextState.ai = { ...nextState.ai, field: { ...nextState.ai.field, slots } };
        break;
      }
      case 'damageAll': {
        const targets = (nextState.player?.field?.slots || []).filter(Boolean);
        let current = nextState;
        const hitIds = [];
        targets.forEach((creature) => {
          const res = effectRegistry.applyDamage(current, {
            attackerId: card.id,
            targetId: creature.id,
            baseDamage: card.effectValue || 0,
            attackerElement: card.element || 'puro',
            ignoreShield: false,
          });
          current = { ...res.newState, log: [...(res.newState.log || []), ...res.log] };
          hitIds.push(creature.id);
        });
        nextState = current;
        hitIds.forEach((targetId) => {
          Object.assign(nextState, settleDefeatedCreature(nextState, {
            targetSide: 'player',
            targetId,
            killerSide: 'ai',
            killerId: card.id,
            killerName: cardName,
            by: cardName,
          }));
        });
        break;
      }
      case 'destroyAll': {
        const targets = (nextState.player?.field?.slots || []).filter(Boolean);
        if (targets.length > 0) {
          const graveyard = [
            ...(nextState.player.graveyard || []),
            ...targets.map((creature) => resetCombatStateForGraveyard(creature)),
          ];
          nextState.player = {
            ...nextState.player,
            graveyard,
            field: { ...nextState.player.field, slots: nextState.player.field.slots.map(() => null) },
            orbs: Math.max(0, (nextState.player.orbs || 0) - targets.length),
          };
          nextState.ai = { ...nextState.ai, essence: Math.min(10, (nextState.ai.essence || 0) + targets.length) };
          nextState.killFeed = [
            ...(nextState.killFeed || []),
            ...targets.map((creature) => ({
              turn: nextState.turn,
              attacker: cardName,
              attackerId: card.id,
              target: creature.name,
              targetId: creature.id,
              byEffect: cardName,
            })),
          ];
          nextState.log = [...nextState.log, `${cardName} mandou ${targets.length} criatura(s) do adversário para o cemitério!`];
          if (nextState.player.orbs === 0) {
            nextState.phase = 'ended';
            nextState.gameResult = {
              winner: 'ai',
              loser: 'player',
              kills: nextState.killFeed,
              turns: nextState.turn,
              stats: nextState.battleStats,
            };
          }
        }
        break;
      }
      default:
        return null;
    }

    return nextState;
  }, [settleDefeatedCreature]);

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
          const summonedCreature = {
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
          const activeFieldData = s.sharedField?.active ? s.sharedField.cardData : null;
          slots[emptySlotIndex] = effectRegistry.applyFieldHpBonusToCreature(summonedCreature, activeFieldData);

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

      // PRIORIDADE 0.5: joga uma carta de efeito "sem alvo" (compra, essência, cura, escudo em
      // área, dano em área, cemitério em massa) quando o momento é claramente bom - a IA nunca
      // usava as cartas de efeito antes, então elas ficavam mortas na mão. Só entra em jogo a
      // partir de dificuldade média (torre Adepto+) pra não sobrecarregar os primeiros níveis.
      const difficultyForEffects = resolveAiDifficulty(s);
      if (difficultyForEffects >= 3) {
        const effectPlay = chooseAiEffectCardPlay(s, difficultyForEffects);
        if (effectPlay) {
          const effectState = applyAiEffectCard(s, effectPlay, logEntries);
          if (effectState) return effectState;
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

        const fieldState = {
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
        return effectRegistry.refreshFieldHpBonusForAllCreatures(fieldState, cardData);
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
            const summonedCreature = {
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
            const activeFieldData = s.sharedField?.active ? s.sharedField.cardData : null;
            slots[slotIndex] = effectRegistry.applyFieldHpBonusToCreature(summonedCreature, activeFieldData);
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
          const summonedCreature = {
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
        const activeFieldData = s.sharedField?.active ? s.sharedField.cardData : null;
        slots[emptyIndex] = effectRegistry.applyFieldHpBonusToCreature(summonedCreature, activeFieldData);
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
  }, [applyAiSummonBlessings, applyAiEffectCard, continueAiCombat]);

  useEffect(() => {
    if (state.mode === 'pvp') return; // No PvP, o lado "ai" é o convidado humano — não roda ai.js
    if (state.phase === 'playing' && state.activePlayer === 'ai') {
      // Adiciona delay de 1.5s antes da IA (ou da Calamidade) agir
      const aiDelayTimer = setTimeout(() => {
        if (state.mode === 'calamity') {
          runCalamityBossTurn();
        } else {
          performAiTurn();
        }
      }, 1500);
      return () => clearTimeout(aiDelayTimer);
    }
  }, [state.mode, state.phase, state.activePlayer, performAiTurn, runCalamityBossTurn]);

  // Processa ataque pendente da IA (não se aplica ao modo Calamidade, que nunca usa aiPendingAttack)

  useEffect(() => {
    if (state.mode === 'pvp' || state.mode === 'calamity') return;
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

  // Modo Calamidade: não há vida/orbes de jogador — a derrota é só quando baralho, mão e campo
  // ficam todos vazios ao mesmo tempo (sem mais criaturas pra invocar).
  useEffect(() => {
    if (state.mode !== 'calamity' || state.phase !== 'playing') return;
    const { deck, hand, field } = state.player;
    const hasCreaturesLeft = (deck?.length || 0) > 0 || (hand?.length || 0) > 0 || (field?.slots || []).some(Boolean);
    if (hasCreaturesLeft) return;
    setState((s) => {
      if (s.phase !== 'playing') return s;
      return {
        ...s,
        phase: 'ended',
        gameResult: { winner: 'ai', loser: 'player', kills: s.killFeed, turns: s.turn, stats: s.battleStats },
        log: [...(s.log || []), 'Seu baralho, mão e campo ficaram vazios. FIM DE JOGO!'],
      };
    });
  }, [state.mode, state.phase, state.player.deck, state.player.hand, state.player.field]);

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
