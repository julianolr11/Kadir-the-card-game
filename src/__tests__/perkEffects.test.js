import {
  applyDamage,
  applyStatusEffect,
  processStatusEffects,
  isNightTurn,
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
