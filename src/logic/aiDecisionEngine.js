import { resolveAbility } from './abilityResolver';
import { getAiDifficultyProfile } from './aiDifficulty';
import { getElementModifier, getFieldBonusForCreature } from '../utils/effectRegistry';

const living = (slots = []) => slots.filter(card => card && card.hp > 0);
const isIncapacitated = card => (card?.statusEffects || [])
  .some(effect => ['paralyze', 'freeze', 'sleep'].includes(effect.type) && effect.duration > 0);

const findDefinition = (cardId, cardPool = []) => {
  const direct = String(cardId || '');
  const base = direct.includes('-') ? direct.split('-')[0] : direct;
  return cardPool.find(card => card?.id === direct || card?.id === base) || null;
};

const cardName = card => card?.name?.pt || card?.name?.en || card?.name || card?.id || 'Carta';

export const scoreEffectCard = (card, state, side) => {
  const own = state[side] || {};
  const enemySide = side === 'ai' ? 'player' : 'ai';
  const enemies = living(state[enemySide]?.field?.slots);
  const allies = living(own.field?.slots);
  switch (card.effectType) {
    case 'draw': return (own.hand?.length || 0) <= 4 ? 8 : 1;
    case 'essence': return Math.min(card.effectValue || 0, 10 - (own.essence || 0)) * 4;
    case 'heal': return Math.max(0, 5 - (own.orbs || 0)) * 7;
    case 'damageAll': return enemies.reduce((sum, target) => sum + Math.min(target.hp, card.effectValue || 0), 0) * 3;
    case 'destroyAll': return enemies.length >= 2 ? enemies.length * 16 : enemies.length * 3;
    case 'shieldAll': return allies.length * (card.effectValue || 0) * 2;
    case 'shield': return allies.length ? (card.effectValue || 0) * 2 : -10;
    case 'damageBuff': return allies.length ? (card.effectValue || 0) * 2.5 : -10;
    case 'immunity': return allies.some(c => c.hp <= 3) ? 10 : 4;
    case 'drawOpponent': return (state[enemySide]?.deck?.length || 0) > 0 && (own.hand?.length || 0) < 7 ? 5 : -4;
    case 'resurrect': return (own.graveyard?.length || 0) > 0 ? 8 : -8;
    case 'control': return enemies.length ? Math.max(...enemies.map(c => (c.hp || 0) + (c.atk || 0) * 2)) : -10;
    case 'swap': return allies.length && enemies.length ? 5 : -10;
    case 'essenceSacrifice': return (own.hand?.length || 0) >= 2 && (own.essence || 0) < 3 ? 5 : -3;
    default: return 0;
  }
};

export function generateValidActions(state, options = {}) {
  const side = options.side || state.activePlayer || 'ai';
  const enemySide = side === 'ai' ? 'player' : 'ai';
  const cardPool = options.cardPool || [];
  const effectCards = options.effectCards || [];
  const own = state[side] || {};
  const enemy = state[enemySide] || {};
  const actions = [];
  const used = state.creaturesWithUsedAbility || new Set();
  const essence = own.essence || 0;

  living(own.field?.slots).forEach((attacker) => {
    const attackerSlot = (own.field?.slots || []).findIndex(card => card?.id === attacker.id);
    if (isIncapacitated(attacker)) return;
    const alreadyUsed = used.has ? used.has(attacker.id) : false;
    if (alreadyUsed && !(attacker.bonusAbilityUses > 0)) return;
    (attacker.abilities || []).forEach((ability, abilityIndex) => {
      const cost = attacker.freeAbilityUses > 0 ? 0 : (ability.cost || 0);
      if (cost > essence) return;
      living(enemy.field?.slots).forEach((target) => {
        const targetSlot = (enemy.field?.slots || []).findIndex(card => card?.id === target.id);
        const resolved = resolveAbility(ability);
        const elemental = getElementModifier(attacker.element, target.element);
        actions.push({
          type: 'attack', side, enemySide, attackerSlot, targetSlot, abilityIndex,
          attackerId: attacker.id, targetId: target.id, ability, resolved, cost, elemental,
        });
      });
    });
  });

  const canSummon = (state.creaturesInvokedThisTurn?.[side] || 0) < 1;
  const emptySlots = (own.field?.slots || []).map((card, index) => (!card ? index : null)).filter(index => index !== null);
  if (canSummon && emptySlots.length > 0) {
    (own.hand || []).forEach((id, handIndex) => {
      const definition = findDefinition(id, cardPool);
      if (!definition || definition.type === 'field' || definition.type === 'effect') return;
      emptySlots.forEach(slotIndex => actions.push({ type: 'summon', side, handIndex, slotIndex, cardId: id, definition }));
    });
  }

  (own.hand || []).forEach((id, handIndex) => {
    const field = findDefinition(id, cardPool);
    if (field?.type === 'field' || /^f\d{3}$/i.test(id) || String(id).startsWith('field_')) {
      actions.push({ type: 'field', side, handIndex, cardId: id, definition: field });
    }
    const effect = effectCards.find(card => card.id === id);
    if (effect) actions.push({ type: 'effect', side, handIndex, cardId: id, definition: effect });
  });

  if (!state[`${side}SacrificedThisTurn`] && essence < 10 && living(own.field?.slots).length > 1) {
    living(own.field?.slots).forEach((creature) => {
      const definition = findDefinition(creature.baseId || creature.id, cardPool);
      if (definition?.isGuardian) return;
      actions.push({
        type: 'sacrifice', side,
        slotIndex: (own.field?.slots || []).findIndex(card => card?.id === creature.id),
        creature,
      });
    });
  }

  actions.push({ type: 'endTurn', side });
  return actions;
}

export function evaluateState(state, perspective = 'ai') {
  const enemy = perspective === 'ai' ? 'player' : 'ai';
  const own = state[perspective] || {};
  const foe = state[enemy] || {};
  const ownCreatures = living(own.field?.slots);
  const foeCreatures = living(foe.field?.slots);
  const hp = cards => cards.reduce((sum, card) => sum + (card.hp || 0), 0);
  const shields = cards => cards.reduce((sum, card) => sum + (card.shield || 0), 0);
  const harmful = cards => cards.reduce((sum, card) => sum + (card.statusEffects || [])
    .filter(effect => ['burn', 'poison', 'bleed', 'freeze', 'paralyze', 'sleep'].includes(effect.type)).length, 0);
  return ((own.orbs || 0) - (foe.orbs || 0)) * 30
    + (ownCreatures.length - foeCreatures.length) * 8
    + ((own.essence || 0) - (foe.essence || 0)) * 4
    + ((own.hand?.length || 0) - (foe.hand?.length || 0)) * 2
    + (hp(ownCreatures) - hp(foeCreatures)) * 2
    + (shields(ownCreatures) - shields(foeCreatures)) * 1.5
    + (harmful(foeCreatures) - harmful(ownCreatures)) * 2;
}

export function scoreAction(action, state, options = {}) {
  const side = action.side || options.side || 'ai';
  const enemySide = side === 'ai' ? 'player' : 'ai';
  const profile = options.profile || getAiDifficultyProfile(options.level || 0);
  if (action.type === 'attack') {
    const target = state[enemySide]?.field?.slots?.[action.targetSlot];
    const attacker = state[side]?.field?.slots?.[action.attackerSlot];
    const expectedDamage = Math.max(0, action.resolved.damage + (action.elemental.modifier || 0));
    const lethal = target && expectedDamage >= target.hp;
    const statuses = action.resolved.statuses?.length || 0;
    return expectedDamage * 5 + (lethal ? 35 : 0) + statuses * 5
      + (action.elemental.hasAdvantage ? 8 : 0) - (action.elemental.hasDisadvantage ? 7 : 0)
      + (target?.atk || 0) * (lethal ? 2 : 0.3) + (attacker?.freeAbilityUses > 0 ? 3 : 0);
  }
  if (action.type === 'summon') {
    const def = action.definition || {};
    const fieldData = state.sharedField?.active ? state.sharedField.cardData : null;
    const affinity = getFieldBonusForCreature(fieldData, def);
    const abilities = def.defaultSkills?.length ? def.defaultSkills : (def.abilities || []);
    const attackValue = Math.max(0, ...abilities.map(ability => resolveAbility(ability).damage));
    return (def.hp || 0) * 1.3 + attackValue * 2 + affinity.damage * 4 + affinity.hp * 2
      + (def.defaultBlessing ? 7 : 0);
  }
  if (action.type === 'field') {
    const field = action.definition;
    if (!field) return 0;
    const ownBenefit = living(state[side]?.field?.slots)
      .reduce((sum, card) => { const bonus = getFieldBonusForCreature(field, card); return sum + bonus.damage * 3 + bonus.hp * 2; }, 0);
    const enemyBenefit = living(state[enemySide]?.field?.slots)
      .reduce((sum, card) => { const bonus = getFieldBonusForCreature(field, card); return sum + bonus.damage * 3 + bonus.hp * 2; }, 0);
    return ownBenefit - enemyBenefit;
  }
  if (action.type === 'effect') return scoreEffectCard(action.definition, state, side);
  if (action.type === 'sacrifice') {
    const ratio = (action.creature.hp || 0) / Math.max(1, action.creature.maxHp || action.creature.hp || 1);
    const disabled = isIncapacitated(action.creature) ? 5 : 0;
    return (1 - ratio) * 8 + disabled + ((state[side]?.essence || 0) <= 1 ? 3 : 0) - 6;
  }
  return profile.knowledge <= 1 ? 0 : -4;
}

export function chooseActionFromState(state, options = {}) {
  const profile = options.profile || getAiDifficultyProfile(options.level || 0);
  const random = options.random || Math.random;
  const allowedTypes = options.allowedTypes ? new Set(options.allowedTypes) : null;
  const validActions = generateValidActions(state, options)
    .filter(action => !allowedTypes || allowedTypes.has(action.type));
  const actions = validActions.map(action => ({
    ...action,
    score: scoreAction(action, state, { ...options, profile }) + (random() * 2 - 1) * profile.actionNoise,
  })).sort((a, b) => b.score - a.score);
  if (actions.length === 0) return null;
  if (random() <= profile.accuracy || actions.length === 1) return actions[0];
  const alternativeCount = Math.min(actions.length, profile.knowledge < 4 ? 4 : 3);
  return actions[1 + Math.floor(random() * Math.max(1, alternativeCount - 1))] || actions[0];
}

export const describeAction = action => {
  if (!action) return 'sem ação';
  if (action.type === 'attack') return `${cardName(action.ability)} → alvo ${action.targetSlot + 1}`;
  if (action.type === 'summon') return `invocar ${cardName(action.definition)}`;
  if (action.type === 'effect') return `usar ${cardName(action.definition)}`;
  if (action.type === 'field') return `ativar ${cardName(action.definition)}`;
  if (action.type === 'sacrifice') return `sacrificar ${action.creature.name}`;
  return 'encerrar turno';
};
