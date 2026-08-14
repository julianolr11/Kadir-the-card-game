import {
  applyDamage,
  applyStatusEffect,
  processStatusEffects,
  isNightTurn,
  removeCreatureDebuffs,
  applyHeal,
} from '../utils/effectRegistry';

function makeState({ attacker, target, turn = 1, playerExtras = [], aiExtras = [] } = {}) {
  return {
    turn,
    player: { essence: 0, field: { slots: [attacker || null, ...playerExtras, null, null].slice(0, 3) } },
    ai: { essence: 0, field: { slots: [target || null, ...aiExtras, null, null].slice(0, 3) } },
  };
}

function makeCreature(overrides = {}) {
  return {
    id: 'c1',
    name: 'Creature',
    hp: 10,
    maxHp: 10,
    atk: 2,
    def: 1,
    shield: 0,
    buffs: [],
    statusEffects: [],
    perkEffects: {},
    ...overrides,
  };
}

describe('applyDamage combat perks (applyCombatPerks: true)', () => {
  test('dodge chance fully negates the attack', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', perkEffects: { dodgeChance: 0.5 } });
    const state = makeState({ attacker, target });

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    randomSpy.mockRestore();

    expect(result.dodged).toBe(true);
    expect(result.damageDealt).toBe(0);
  });

  test('dodge is ignored when applyCombatPerks is not set (legacy call sites)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', perkEffects: { dodgeChance: 1 } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, { attackerId: 'atk', targetId: 'tgt', baseDamage: 3 });

    expect(result.dodged).toBeUndefined();
    expect(result.damageDealt).toBe(3);
  });

  test('crit chance adds the crit bonus to damage', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { critChance: 1, critBonus: 2 } });
    const target = makeCreature({ id: 'tgt' });
    const state = makeState({ attacker, target });

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    randomSpy.mockRestore();

    expect(result.wasCrit).toBe(true);
    expect(result.damageDealt).toBe(5);
  });

  test('flat damage reduction (LAVA_SKIN / ARMOR_PLUS_2) lowers damage taken', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', perkEffects: { flatDamageReduction: 2 } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 5, applyCombatPerks: true,
    });

    expect(result.damageDealt).toBe(3);
  });

  test('flat damage reduction never drops damage below the 1-point minimum', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', perkEffects: { flatDamageReduction: 10 } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    expect(result.damageDealt).toBe(1);
  });

  test('magic resistance only reduces damage from attacks with elemental advantage', () => {
    const attacker = makeCreature({ id: 'atk', element: 'terra' });
    const target = makeCreature({ id: 'tgt', element: 'agua', perkEffects: { magicResistance: 1 } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, attackerElement: 'terra', applyCombatPerks: true,
    });

    // terra tem vantagem sobre agua: +1 elemento, -1 resistência mágica = dano base inalterado
    expect(result.hasAdvantage).toBe(true);
    expect(result.damageDealt).toBe(3);
  });

  test('lifesteal heals the attacker based on damage dealt', () => {
    const attacker = makeCreature({ id: 'atk', hp: 5, maxHp: 10, perkEffects: { lifestealOnDamage: 1 } });
    const target = makeCreature({ id: 'tgt' });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    const freshAttacker = result.newState.player.field.slots[0];
    expect(freshAttacker.hp).toBe(6);
  });

  test('heals the attacker on kill', () => {
    const attacker = makeCreature({ id: 'atk', hp: 5, maxHp: 10, perkEffects: { healOnKill: 2 } });
    const target = makeCreature({ id: 'tgt', hp: 1 });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    expect(result.died).toBe(true);
    const freshAttacker = result.newState.player.field.slots[0];
    expect(freshAttacker.hp).toBe(7);
  });

  test('gains attack when taking real damage (WILD_INSTINCT)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', atk: 2, perkEffects: { attackOnDamageTaken: 1 } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    const freshTarget = result.newState.ai.field.slots[0];
    expect(freshTarget.atk).toBe(3);
  });

  test('applies a defense debuff to the target on attack (DEFENSE_REDUCTION)', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { defenseDebuffOnAttack: { value: 1, duration: 2 } } });
    const target = makeCreature({ id: 'tgt', hp: 10 });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    const freshTarget = result.newState.ai.field.slots[0];
    expect(freshTarget.buffs).toHaveLength(1);
    expect(freshTarget.buffs[0]).toMatchObject({ stat: 'defense', value: -1, duration: 2 });
  });

  test('has a chance to paralyze the target on attack (PARALYZE_CHANCE_10)', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { paralyzeChanceOnAttack: 0.5 } });
    const target = makeCreature({ id: 'tgt', hp: 10 });
    const state = makeState({ attacker, target });

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    randomSpy.mockRestore();

    const freshTarget = result.newState.ai.field.slots[0];
    expect(freshTarget.statusEffects).toHaveLength(1);
    expect(freshTarget.statusEffects[0].type).toBe('paralyze');
  });
});

describe('applyStatusEffect burn perks (INCANDESCENT_FURY / PERSISTENT_FLAME)', () => {
  test('boosts burn damage and duration applied by the attacker', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { burnDamageBonus: 1, burnDurationBonus: 1 } });
    const target = makeCreature({ id: 'tgt' });
    const state = makeState({ attacker, target });

    const result = applyStatusEffect(state, {
      targetId: 'tgt', effectType: 'burn', duration: 2, value: 1, attackerId: 'atk',
    });

    const freshTarget = result.newState.ai.field.slots[0];
    expect(freshTarget.statusEffects[0]).toMatchObject({ value: 2, duration: 3 });
  });

  test('does not affect non-burn status effects', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { burnDamageBonus: 1, burnDurationBonus: 1 } });
    const target = makeCreature({ id: 'tgt' });
    const state = makeState({ attacker, target });

    const result = applyStatusEffect(state, {
      targetId: 'tgt', effectType: 'paralyze', duration: 1, attackerId: 'atk',
    });

    const freshTarget = result.newState.ai.field.slots[0];
    expect(freshTarget.statusEffects[0]).toMatchObject({ duration: 1 });
  });
});

describe('processStatusEffects PROTECTIVE_FIRE perk', () => {
  test('grants a shield at the start of the turn while burn is active', () => {
    const creature = makeCreature({
      id: 'c1',
      shield: 0,
      statusEffects: [{ id: 's1', type: 'burn', duration: 2, value: 1, attackerId: null }],
      perkEffects: { shieldIfStatusActiveOnTurnStart: { status: 'burn', amount: 1 } },
    });
    const state = makeState({ attacker: creature, target: null });

    const result = processStatusEffects(state, 'c1');
    const fresh = result.newState.player.field.slots[0];

    expect(fresh.shield).toBeGreaterThanOrEqual(1);
  });

  test('does not grant a shield when the trigger status is not active', () => {
    const creature = makeCreature({
      id: 'c1',
      shield: 0,
      statusEffects: [],
      perkEffects: { shieldIfStatusActiveOnTurnStart: { status: 'burn', amount: 1 } },
    });
    const state = makeState({ attacker: creature, target: null });

    const result = processStatusEffects(state, 'c1');
    const fresh = result.newState.player.field.slots[0];

    expect(fresh.shield).toBe(0);
  });

  test('grants a shield at every turn start unconditionally (SALINE_SHIELD)', () => {
    const creature = makeCreature({ id: 'c1', shield: 0, perkEffects: { shieldEveryTurnStart: 2 } });
    const state = makeState({ attacker: creature, target: null });

    const result = processStatusEffects(state, 'c1');

    expect(result.newState.player.field.slots[0].shield).toBe(2);
  });

  test('heals at turn start while the trigger status is active (DEEP_REGEN)', () => {
    // A cura do início de turno e o tick de sangramento (dano 1) ocorrem na mesma chamada;
    // isolamos o efeito do perk verificando o log de cura em vez do HP líquido.
    const creature = makeCreature({
      id: 'c1',
      hp: 5,
      maxHp: 10,
      statusEffects: [{ id: 's1', type: 'bleed', duration: 2, value: 1 }],
      perkEffects: { healIfStatusActiveOnTurnStart: { status: 'bleed', amount: 1 } },
    });
    const state = makeState({ attacker: creature, target: null });

    const result = processStatusEffects(state, 'c1');

    expect(result.log.some(l => l.includes('recuperou 1 HP'))).toBe(true);
  });

  test('fully resists a weak DoT tick when dotDamageReduction covers it (TOXIC_IMMUNITY)', () => {
    const creature = makeCreature({
      id: 'c1',
      hp: 10,
      statusEffects: [{ id: 's1', type: 'poison', duration: 2, value: 1 }],
      perkEffects: { dotDamageReduction: { value: 1, types: null } },
    });
    const state = makeState({ attacker: creature, target: null });

    const result = processStatusEffects(state, 'c1');

    expect(result.newState.player.field.slots[0].hp).toBe(10);
  });

  test('dotDamageReduction only applies to the configured status types (TOXIC_SKIN)', () => {
    const creature = makeCreature({
      id: 'c1',
      hp: 10,
      statusEffects: [{ id: 's1', type: 'burn', duration: 2, value: 1 }],
      perkEffects: { dotDamageReduction: { value: 1, types: ['poison', 'bleed'] } },
    });
    const state = makeState({ attacker: creature, target: null });

    const result = processStatusEffects(state, 'c1');

    // burn não está coberto por TOXIC_SKIN, então o dano de 1 passa normalmente
    expect(result.newState.player.field.slots[0].hp).toBe(9);
  });
});

describe('água — elemental / reflect / conditional defense perks', () => {
  test('elementDamageReduction only reduces damage from the matching attacker element (DEEP_RESISTANCE)', () => {
    const attacker = makeCreature({ id: 'atk', element: 'agua' });
    const target = makeCreature({ id: 'tgt', perkEffects: { elementDamageReduction: { element: 'agua', value: 1 } } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, attackerElement: 'agua', applyCombatPerks: true,
    });

    expect(result.damageDealt).toBe(2);
  });

  test('reflectDamage sends damage back to the attacker when the element matches (ABYSSAL_REFLEX)', () => {
    const attacker = makeCreature({ id: 'atk', hp: 10, element: 'agua' });
    const target = makeCreature({ id: 'tgt', perkEffects: { reflectDamage: { element: 'agua', value: 1 } } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, attackerElement: 'agua', applyCombatPerks: true,
    });

    expect(result.newState.player.field.slots[0].hp).toBe(9);
  });

  test('defenseWhileShielded only reduces damage while the target has an active shield (DEEP_DEFENSE)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', shield: 2, perkEffects: { defenseWhileShielded: 1 } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    // 3 de dano - 1 (defesa enquanto blindado) = 2; escudo de 2 absorve tudo
    expect(result.damageDealt).toBe(0);
    expect(result.newState.ai.field.slots[0].shield).toBe(0);
  });

  test('freezeAttackerChance freezes the attacker when triggered (INSTINCTIVE_FROST)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', hp: 10, perkEffects: { freezeAttackerChance: 0.5 } });
    const state = makeState({ attacker, target });

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    randomSpy.mockRestore();

    const freshAttacker = result.newState.player.field.slots[0];
    expect(freshAttacker.statusEffects.some(e => e.type === 'freeze')).toBe(true);
  });

  test('shieldOnDamageIfNone grants a shield only when the target has none after the hit (SNOWBOUND_HIDE)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', hp: 10, shield: 0, perkEffects: { shieldOnDamageIfNone: 1 } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    expect(result.newState.ai.field.slots[0].shield).toBe(1);
  });

  test('bonusDamageVsFrozen adds bonus damage only when the target is frozen (FROZEN_ABYSS)', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { bonusDamageVsFrozen: { element: 'agua', value: 1 } } });
    const target = makeCreature({ id: 'tgt', statusEffects: [{ id: 's1', type: 'freeze', duration: 1 }] });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, attackerElement: 'agua', applyCombatPerks: true,
    });

    expect(result.damageDealt).toBe(4);
  });

  test('shieldChanceOnDamageTaken grants a shield on a successful roll (SHADOW_ICE_CORE)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', shield: 0, perkEffects: { shieldChanceOnDamageTaken: { chance: 0.5, amount: 1 } } });
    const state = makeState({ attacker, target });

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    randomSpy.mockRestore();

    expect(result.newState.ai.field.slots[0].shield).toBe(1);
  });

  test('healOnKillIfStatus only heals the attacker when the defeated target had the status (TOXIC_HEAL)', () => {
    const attacker = makeCreature({ id: 'atk', hp: 5, maxHp: 10, perkEffects: { healOnKillIfStatus: { status: 'poison', value: 2 } } });
    const target = makeCreature({ id: 'tgt', hp: 1, statusEffects: [{ id: 's1', type: 'poison', duration: 1 }] });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    expect(result.died).toBe(true);
    expect(result.newState.player.field.slots[0].hp).toBe(7);
  });

  test('essenceOnKill grants essence to the attacker side on a kill (COLD_GRAVE)', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { essenceOnKill: 1 } });
    const target = makeCreature({ id: 'tgt', hp: 1 });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    expect(result.newState.player.essence).toBe(1);
  });
});

describe('água — team auras and day/night perks', () => {
  test('isNightTurn follows even/odd turn parity', () => {
    expect(isNightTurn({ turn: 0 })).toBe(true);
    expect(isNightTurn({ turn: 1 })).toBe(false);
    expect(isNightTurn({ turn: 2 })).toBe(true);
  });

  test('enemyDefenseAura increases damage dealt to the opposing side (CONSTANT_PRESSURE)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const auraAlly = makeCreature({ id: 'ally1', perkEffects: { enemyDefenseAura: 1 } });
    const target = makeCreature({ id: 'tgt' });
    const state = makeState({ attacker, target, playerExtras: [auraAlly] });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    expect(result.damageDealt).toBe(4);
  });

  test('allyDefenseAura reduces damage taken by the whole defending side (PROTECTIVE_TIDE)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt' });
    const auraAlly = makeCreature({ id: 'ally1', perkEffects: { allyDefenseAura: 1 } });
    const state = makeState({ attacker, target, aiExtras: [auraAlly] });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    expect(result.damageDealt).toBe(2);
  });

  test('nightAllyAttackAura only boosts damage during night turns (RISING_LIGHT)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const auraAlly = makeCreature({ id: 'ally1', perkEffects: { nightAllyAttackAura: 1 } });
    const target = makeCreature({ id: 'tgt' });

    const nightState = makeState({ attacker, target, playerExtras: [auraAlly], turn: 2 });
    const nightResult = applyDamage(nightState, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    expect(nightResult.damageDealt).toBe(4);

    const dayState = makeState({ attacker, target, playerExtras: [auraAlly], turn: 1 });
    const dayResult = applyDamage(dayState, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    expect(dayResult.damageDealt).toBe(3);
  });

  test('shadowResistAura reduces damage only from shadow-type attackers (PROTECTIVE_LIGHT)', () => {
    const shadowAttacker = makeCreature({ id: 'atk', type: 'Sombria' });
    const target = makeCreature({ id: 'tgt' });
    const auraAlly = makeCreature({ id: 'ally1', perkEffects: { shadowResistAura: 1 } });
    const state = makeState({ attacker: shadowAttacker, target, aiExtras: [auraAlly] });

    const result = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });

    expect(result.damageDealt).toBe(2);
  });

  test('nightSelfBuff grants attack and dodge only at night (NIGHT_GLEAM / NIGHT_HUNTER)', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { nightSelfBuff: { atk: 1, dodge: 0.15 } } });
    const target = makeCreature({ id: 'tgt' });

    const dayState = makeState({ attacker, target, turn: 1 });
    const dayResult = applyDamage(dayState, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    expect(dayResult.damageDealt).toBe(3);

    const nightState = makeState({ attacker, target, turn: 2 });
    const nightResult = applyDamage(nightState, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    expect(nightResult.damageDealt).toBe(4);
  });
});

describe('applyStatusEffect generic per-type bonuses and healOnApplyDot', () => {
  test('statusDurationBonus extends the duration of the matching status type (PERSISTENT_VENOM)', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { statusDurationBonus: { poison: 1 } } });
    const target = makeCreature({ id: 'tgt' });
    const state = makeState({ attacker, target });

    const result = applyStatusEffect(state, {
      targetId: 'tgt', effectType: 'poison', duration: 2, value: 1, attackerId: 'atk',
    });

    expect(result.newState.ai.field.slots[0].statusEffects[0]).toMatchObject({ duration: 3 });
  });

  test('healOnApplyDot heals the attacker when applying a DoT (HEALING_SPORES)', () => {
    const attacker = makeCreature({ id: 'atk', hp: 5, maxHp: 10, perkEffects: { healOnApplyDot: 1 } });
    const target = makeCreature({ id: 'tgt' });
    const state = makeState({ attacker, target });

    const result = applyStatusEffect(state, {
      targetId: 'tgt', effectType: 'bleed', duration: 2, value: 1, attackerId: 'atk',
    });

    expect(result.newState.player.field.slots[0].hp).toBe(6);
  });
});

describe('puro — conditional defense, first-hit, and cleanse perks', () => {
  test('defenseWhileAboveHalfHp only reduces damage above 50% HP (AURORA_WARD)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const aboveHalf = makeCreature({ id: 'tgt', hp: 6, maxHp: 10, perkEffects: { defenseWhileAboveHalfHp: 1 } });
    const stateAbove = makeState({ attacker, target: aboveHalf });
    const resultAbove = applyDamage(stateAbove, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    expect(resultAbove.damageDealt).toBe(2);

    const belowHalf = makeCreature({ id: 'tgt', hp: 4, maxHp: 10, perkEffects: { defenseWhileAboveHalfHp: 1 } });
    const stateBelow = makeState({ attacker, target: belowHalf });
    const resultBelow = applyDamage(stateBelow, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    expect(resultBelow.damageDealt).toBe(3);
  });

  test('firstHitDamageReduction only applies to the first hit taken this turn (PROTECTIVE_WISDOM)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', hp: 10, perkEffects: { firstHitDamageReduction: 1 } });
    const state = makeState({ attacker, target });

    const firstHit = applyDamage(state, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    expect(firstHit.damageDealt).toBe(2);

    const secondHit = applyDamage(firstHit.newState, {
      attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true,
    });
    expect(secondHit.damageDealt).toBe(3);
  });

  test('processStatusEffects resets firstHitUsedThisTurn at the start of the turn', () => {
    const creature = makeCreature({
      id: 'c1', firstHitUsedThisTurn: true, perkEffects: { firstHitDamageReduction: 1 },
    });
    const state = makeState({ attacker: creature, target: null });

    const result = processStatusEffects(state, 'c1');

    expect(result.newState.player.field.slots[0].firstHitUsedThisTurn).toBe(false);
  });

  test('shieldIfBuffActiveOnTurnStart grants a shield only while the matching buff is active', () => {
    const withBuff = makeCreature({
      id: 'c1',
      buffs: [{ id: 'b1', stat: 'attack', value: 1, duration: 2 }],
      perkEffects: { shieldIfBuffActiveOnTurnStart: { stat: 'attack', amount: 1 } },
    });
    const stateWith = makeState({ attacker: withBuff, target: null });
    expect(processStatusEffects(stateWith, 'c1').newState.player.field.slots[0].shield).toBe(1);

    const withoutBuff = makeCreature({
      id: 'c1', buffs: [], perkEffects: { shieldIfBuffActiveOnTurnStart: { stat: 'attack', amount: 1 } },
    });
    const stateWithout = makeState({ attacker: withoutBuff, target: null });
    expect(processStatusEffects(stateWithout, 'c1').newState.player.field.slots[0].shield).toBe(0);
  });

  test('removeCreatureDebuffs strips only negative-value buffs, up to the requested count', () => {
    const creature = makeCreature({
      buffs: [
        { id: 'b1', stat: 'attack', value: 2 },
        { id: 'b2', stat: 'defense', value: -1 },
        { id: 'b3', stat: 'attack', value: -1 },
      ],
    });

    const { buffs, removedCount } = removeCreatureDebuffs(creature, 1);

    expect(removedCount).toBe(1);
    expect(buffs).toHaveLength(2);
    expect(buffs.some(b => b.value < 0)).toBe(true); // só 1 dos 2 debuffs foi removido
  });

  test('cleanseAndShieldIfLowHp removes a debuff and grants a shield only below the HP threshold', () => {
    const lowHp = makeCreature({
      id: 'c1',
      hp: 2,
      buffs: [{ id: 'b1', stat: 'defense', value: -1 }],
      perkEffects: { cleanseAndShieldIfLowHp: { hpThreshold: 3, shieldAmount: 1 } },
    });
    const stateLow = makeState({ attacker: lowHp, target: null });
    const resultLow = processStatusEffects(stateLow, 'c1');
    expect(resultLow.newState.player.field.slots[0].shield).toBe(1);
    expect(resultLow.newState.player.field.slots[0].buffs).toHaveLength(0);

    const highHp = makeCreature({
      id: 'c1',
      hp: 8,
      buffs: [{ id: 'b1', stat: 'defense', value: -1 }],
      perkEffects: { cleanseAndShieldIfLowHp: { hpThreshold: 3, shieldAmount: 1 } },
    });
    const stateHigh = makeState({ attacker: highHp, target: null });
    const resultHigh = processStatusEffects(stateHigh, 'c1');
    expect(resultHigh.newState.player.field.slots[0].shield).toBe(0);
    expect(resultHigh.newState.player.field.slots[0].buffs).toHaveLength(1);
  });
});

describe('terra — armor stacking, rising fury, dodge/heal reactions, team heal', () => {
  test('armor buffs stack and reduce damage the same way flatDamageReduction does', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', buffs: [{ id: 'a1', stat: 'armor', value: 1, duration: 999 }, { id: 'a2', stat: 'armor', value: 1, duration: 999 }] });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, { attackerId: 'atk', targetId: 'tgt', baseDamage: 5, applyCombatPerks: true });

    expect(result.damageDealt).toBe(3);
  });

  test('armorGrowthIfAboveHalfHp adds an armor buff at turn start only above half HP (GROUNDING_FORCE)', () => {
    const above = makeCreature({ id: 'c1', hp: 8, maxHp: 10, perkEffects: { armorGrowthIfAboveHalfHp: 1 } });
    const stateAbove = makeState({ attacker: above, target: null });
    const resultAbove = processStatusEffects(stateAbove, 'c1');
    expect(resultAbove.newState.player.field.slots[0].buffs.filter(b => b.stat === 'armor')).toHaveLength(1);

    const below = makeCreature({ id: 'c1', hp: 3, maxHp: 10, perkEffects: { armorGrowthIfAboveHalfHp: 1 } });
    const stateBelow = makeState({ attacker: below, target: null });
    const resultBelow = processStatusEffects(stateBelow, 'c1');
    expect(resultBelow.newState.player.field.slots[0].buffs.filter(b => b.stat === 'armor')).toHaveLength(0);
  });

  test('armorOnLowHpThreshold triggers once when HP drops to the threshold (TITAN_STANCE)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', hp: 5, perkEffects: { armorOnLowHpThreshold: { threshold: 4, value: 1 } } });
    const state = makeState({ attacker, target });

    const firstHit = applyDamage(state, { attackerId: 'atk', targetId: 'tgt', baseDamage: 2, applyCombatPerks: true });
    const freshAfterFirst = firstHit.newState.ai.field.slots[0];
    expect(freshAfterFirst.hp).toBe(3);
    expect(freshAfterFirst.buffs.filter(b => b.stat === 'armor')).toHaveLength(1);
    expect(freshAfterFirst.titanStanceTriggered).toBe(true);

    // Um segundo golpe abaixo do limiar não deve empilhar armadura de novo
    const secondHit = applyDamage(firstHit.newState, { attackerId: 'atk', targetId: 'tgt', baseDamage: 1, applyCombatPerks: true });
    expect(secondHit.newState.ai.field.slots[0].buffs.filter(b => b.stat === 'armor')).toHaveLength(1);
  });

  test('risingFuryOnAttack stacks an attack buff on the attacker after each attack (RISING_FURY)', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { risingFuryOnAttack: 1 } });
    const target = makeCreature({ id: 'tgt', hp: 20 });
    const state = makeState({ attacker, target });

    const first = applyDamage(state, { attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true });
    expect(first.newState.player.field.slots[0].buffs.filter(b => b.stat === 'attack')).toHaveLength(1);

    const second = applyDamage(first.newState, { attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true });
    expect(second.newState.player.field.slots[0].buffs.filter(b => b.stat === 'attack')).toHaveLength(2);
    // O segundo ataque já sai +1 mais forte por causa do stack anterior
    expect(second.damageDealt).toBe(4);
  });

  test('dodgeOnDamageTaken permanently stacks dodge chance after taking damage (EVASIVE_INSTINCT)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', perkEffects: { dodgeOnDamageTaken: 0.15 } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, { attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true });

    expect(result.newState.ai.field.slots[0].buffs).toContainEqual(
      expect.objectContaining({ stat: 'dodge', value: 0.15 }),
    );
  });

  test('healOnDodge heals the target when it successfully dodges (GRACEFUL_STEPS)', () => {
    const attacker = makeCreature({ id: 'atk' });
    const target = makeCreature({ id: 'tgt', hp: 5, maxHp: 10, perkEffects: { dodgeChance: 1, healOnDodge: 1 } });
    const state = makeState({ attacker, target });

    const result = applyDamage(state, { attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true });

    expect(result.dodged).toBe(true);
    expect(result.newState.ai.field.slots[0].hp).toBe(6);
  });

  test('blindChanceOnAttack applies blind to the target on a successful roll (SHINING_HORN)', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { blindChanceOnAttack: 0.5 } });
    const target = makeCreature({ id: 'tgt', hp: 10 });
    const state = makeState({ attacker, target });

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const result = applyDamage(state, { attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true });
    randomSpy.mockRestore();

    expect(result.newState.ai.field.slots[0].statusEffects.some(e => e.type === 'blind')).toBe(true);
  });

  test('teamHealOnTurnStart heals every living ally on the same side (MORNING_AURORA)', () => {
    const healer = makeCreature({ id: 'c1', hp: 10, maxHp: 10, perkEffects: { teamHealOnTurnStart: 2 } });
    const ally = makeCreature({ id: 'ally1', hp: 3, maxHp: 10 });
    const state = makeState({ attacker: healer, target: null, playerExtras: [ally] });

    const result = processStatusEffects(state, 'c1');

    expect(result.newState.player.field.slots[1].hp).toBe(5);
  });
});

describe('applyHeal healAmplifyAura (NIGHT_BLESSING fix)', () => {
  test('amplifies healing received by any ally on the same side', () => {
    const amplifier = makeCreature({ id: 'buffer', perkEffects: { healAmplifyAura: 1 } });
    const wounded = makeCreature({ id: 'ally1', hp: 3, maxHp: 10 });
    const state = makeState({ attacker: amplifier, target: null, playerExtras: [wounded] });

    const result = applyHeal(state, { targetId: 'ally1', healAmount: 2 });

    expect(result.newState.player.field.slots[1].hp).toBe(6);
  });
});

describe('regression: applyBuff/applyDebuff must apply flat perk values as flat, not percent', () => {
  test('DEFENSE_REDUCTION-style debuff reduces damage by a flat amount, not by 100% per stack', () => {
    const attacker = makeCreature({ id: 'atk', perkEffects: { defenseDebuffOnAttack: { value: 1, duration: 2 } } });
    const target = makeCreature({ id: 'tgt', hp: 20 });
    const state = makeState({ attacker, target });

    // Primeiro golpe aplica o debuff de -1 defesa no alvo (não afeta este próprio golpe)
    const first = applyDamage(state, { attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true });
    expect(first.damageDealt).toBe(3);

    // O segundo golpe já deve refletir a defesa reduzida: 3 + 1 (defesa em -1) = 4, nunca 6 (o que daria um bug de -100%)
    const second = applyDamage(first.newState, { attackerId: 'atk', targetId: 'tgt', baseDamage: 3, applyCombatPerks: true });
    expect(second.damageDealt).toBe(4);
  });
});
