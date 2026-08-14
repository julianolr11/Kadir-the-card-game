import {
  applyDamage,
  applyStatusEffect,
  processStatusEffects,
} from '../utils/effectRegistry';

function makeState({ attacker, target } = {}) {
  return {
    player: { field: { slots: [attacker || null, null, null] } },
    ai: { field: { slots: [target || null, null, null] } },
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
});
