import { chooseActionFromState, generateValidActions } from './aiDecisionEngine';

export const seededRandom = (seed = 1) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const shuffle = (items, random) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const instantiate = (definition, serial) => ({
  ...definition,
  id: `${definition.id}-${serial}`,
  baseId: definition.id,
  hp: definition.hp || 5,
  maxHp: definition.hp || 5,
  abilities: definition.defaultSkills?.length ? definition.defaultSkills : (definition.abilities || []),
  statusEffects: [],
  shield: 0,
});

export function createSimulationState(cardPool, random = Math.random) {
  const creatures = cardPool.filter(card => card && card.type !== 'field' && card.type !== 'effect');
  const makeSide = () => {
    const deck = shuffle(creatures, random).slice(0, 20).map(card => card.id);
    return { orbs: 5, essence: 0, hand: deck.splice(0, 5), deck, graveyard: [], field: { slots: [null, null, null] } };
  };
  return {
    activePlayer: 'player', turn: 0, player: makeSide(), ai: makeSide(), sharedField: null,
    creaturesWithUsedAbility: new Set(), creaturesInvokedThisTurn: { player: 0, ai: 0 },
    playerSacrificedThisTurn: false, aiSacrificedThisTurn: false, serial: 1,
  };
}

const removeDefeated = (state, side) => {
  state[side].field.slots = state[side].field.slots.map(card => {
    if (!card || card.hp > 0) return card;
    state[side].graveyard.push(card.baseId || card.id);
    state[side].orbs = Math.max(0, state[side].orbs - 1);
    return null;
  });
};

export function applySimulationAction(state, action, options = {}) {
  const side = action.side;
  const enemy = side === 'ai' ? 'player' : 'ai';
  const metrics = options.metrics;
  metrics.actions[action.type] = (metrics.actions[action.type] || 0) + 1;
  if (action.type === 'summon') {
    state[side].hand.splice(action.handIndex, 1);
    state[side].field.slots[action.slotIndex] = instantiate(action.definition, state.serial++);
    state.creaturesInvokedThisTurn[side] += 1;
  } else if (action.type === 'field') {
    state[side].hand.splice(action.handIndex, 1);
    state.sharedField = { active: true, cardData: action.definition, owner: side };
  } else if (action.type === 'effect') {
    state[side].hand.splice(action.handIndex, 1);
    const effect = action.definition;
    if (effect.effectType === 'essence') {
      const before = state[side].essence;
      state[side].essence = Math.min(10, before + (effect.effectValue || 0));
      metrics.essenceGenerated += state[side].essence - before;
    } else if (effect.effectType === 'heal') {
      state[side].orbs = Math.min(5, state[side].orbs + (effect.effectValue || 0));
    } else if (effect.effectType === 'draw') {
      for (let i = 0; i < (effect.effectValue || 1) && state[side].deck.length && state[side].hand.length < 7; i += 1) state[side].hand.push(state[side].deck.shift());
    } else if (effect.effectType === 'damageAll') {
      state[enemy].field.slots.forEach(card => { if (card) card.hp -= effect.effectValue || 0; });
      removeDefeated(state, enemy);
    } else if (effect.effectType === 'destroyAll') {
      state[enemy].field.slots.forEach(card => { if (card) card.hp = 0; });
      removeDefeated(state, enemy);
    }
  } else if (action.type === 'attack') {
    const attacker = state[side].field.slots[action.attackerSlot];
    const target = state[enemy].field.slots[action.targetSlot];
    if (!attacker || !target) return;
    const damage = Math.max(0, (action.resolved.damage || 0) + (action.elemental.modifier || 0));
    const absorbed = Math.min(target.shield || 0, damage);
    target.shield = Math.max(0, (target.shield || 0) - absorbed);
    target.hp -= damage - absorbed;
    state[side].essence -= action.cost;
    metrics.essenceSpent += action.cost;
    state.creaturesWithUsedAbility.add(attacker.id);
    removeDefeated(state, enemy);
  } else if (action.type === 'sacrifice') {
    const card = state[side].field.slots[action.slotIndex];
    if (!card) return;
    state[side].graveyard.push(card.baseId || card.id);
    state[side].field.slots[action.slotIndex] = null;
    state[side].essence = Math.min(10, state[side].essence + 1);
    state[`${side}SacrificedThisTurn`] = true;
    metrics.essenceGenerated += 1;
  } else if (action.type === 'endTurn') {
    const attacks = generateValidActions(state, { ...options, side }).filter(candidate => candidate.type === 'attack');
    if (attacks.length) metrics.skippedAttacks += 1;
  }
}

export function simulateBattle(options = {}) {
  const random = options.random || seededRandom(options.seed || 1);
  const cardPool = options.cardPool || [];
  const levels = { player: options.playerLevel ?? 5, ai: options.aiLevel ?? 5 };
  const state = createSimulationState(cardPool, random);
  const metrics = { actions: {}, essenceSpent: 0, essenceGenerated: 0, essenceWasted: 0, skippedAttacks: 0 };
  const maxTurns = options.maxTurns || 80;
  while (state.player.orbs > 0 && state.ai.orbs > 0 && state.turn < maxTurns) {
    const side = state.activePlayer;
    const own = state[side];
    state.turn += 1;
    const before = own.essence;
    own.essence = Math.min(10, own.essence + 1);
    metrics.essenceGenerated += own.essence - before;
    if (before === 10) metrics.essenceWasted += 1;
    if (own.deck.length && own.hand.length < 7) own.hand.push(own.deck.shift());
    state.creaturesWithUsedAbility = new Set();
    state.creaturesInvokedThisTurn[side] = 0;
    state[`${side}SacrificedThisTurn`] = false;
    let steps = 0;
    while (steps < 12) {
      const action = chooseActionFromState(state, { side, level: levels[side], cardPool, random });
      if (!action || action.type === 'endTurn') {
        if (action) applySimulationAction(state, action, { side, cardPool, metrics });
        break;
      }
      applySimulationAction(state, action, { side, cardPool, metrics });
      if (state.player.orbs <= 0 || state.ai.orbs <= 0) break;
      steps += 1;
    }
    state.activePlayer = side === 'ai' ? 'player' : 'ai';
  }
  return { winner: state.player.orbs === state.ai.orbs ? 'draw' : (state.player.orbs > state.ai.orbs ? 'player' : 'ai'), turns: state.turn, metrics };
}

export function runSimulationBatch(options = {}) {
  const matches = options.matches || 100;
  const summary = { matches, wins: { player: 0, ai: 0, draw: 0 }, averageTurns: 0, metrics: { essenceSpent: 0, essenceGenerated: 0, essenceWasted: 0, skippedAttacks: 0 }, actions: {} };
  for (let i = 0; i < matches; i += 1) {
    const result = simulateBattle({ ...options, seed: (options.seed || 1) + i });
    summary.wins[result.winner] += 1;
    summary.averageTurns += result.turns;
    Object.keys(summary.metrics).forEach(key => { summary.metrics[key] += result.metrics[key]; });
    Object.entries(result.metrics.actions).forEach(([key, value]) => { summary.actions[key] = (summary.actions[key] || 0) + value; });
  }
  summary.averageTurns = Number((summary.averageTurns / matches).toFixed(2));
  Object.keys(summary.metrics).forEach(key => { summary.metrics[key] = Number((summary.metrics[key] / matches).toFixed(2)); });
  return summary;
}
