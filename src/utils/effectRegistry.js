// Sistema de Efeitos e Habilidades de Criaturas
// Funções base para execução de habilidades durante batalha

// ===== SISTEMA DE ELEMENTOS E MULTIPLICADORES =====
const ELEMENT_WEAKNESS = {
  fogo: ['agua'],
  agua: ['terra'],
  terra: ['ar'],
  ar: ['fogo'],
  puro: [], // Sem fraquezas
};

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Calcula modificador de elemento vs elemento
 * @returns {object} { modifier: number, hasAdvantage: boolean, hasDisadvantage: boolean }
 */
export function getElementModifier(attackerElement, defenderElement) {
  if (!attackerElement || !defenderElement) {
    return { modifier: 0, hasAdvantage: false, hasDisadvantage: false };
  }

  // Elemento PURO tem vantagem apenas contra PURO
  if (attackerElement === 'puro' && defenderElement === 'puro') {
    return { modifier: 1, hasAdvantage: true, hasDisadvantage: false }; // +1 dano
  }

  // PURO é neutro contra todos os outros elementos
  if (attackerElement === 'puro' || defenderElement === 'puro') {
    return { modifier: 0, hasAdvantage: false, hasDisadvantage: false };
  }

  // Verifica vantagem: se o defensor é fraco contra o atacante
  // Ex: água é fraca contra terra, então terra tem vantagem sobre água
  if (ELEMENT_WEAKNESS[defenderElement]?.includes(attackerElement)) {
    return { modifier: 1, hasAdvantage: true, hasDisadvantage: false }; // +1 dano
  }

  // Verifica desvantagem: se o atacante é fraco contra o defensor
  // Ex: fogo é fraco contra água, então fogo tem desvantagem sobre água
  if (ELEMENT_WEAKNESS[attackerElement]?.includes(defenderElement)) {
    return { modifier: -1, hasAdvantage: false, hasDisadvantage: true }; // -1 dano
  }

  return { modifier: 0, hasAdvantage: false, hasDisadvantage: false }; // Neutro
}

/**
 * Aplica modificadores de buffs/debuffs
 */
export function applyModifiers(baseValue, modifiers = []) {
  let finalValue = baseValue;

  modifiers.forEach(mod => {
    if (mod.type === 'percent') {
      finalValue *= (1 + mod.value);
    } else if (mod.type === 'flat') {
      finalValue += mod.value;
    }
  });

  return Math.max(0, Math.round(finalValue));
}

// ===== FUNÇÕES PRINCIPAIS DE EFEITOS =====

/**
 * Aplica dano a uma criatura
 * @param {object} state - Estado da batalha
 * @param {object} params - { attackerId, targetId, baseDamage, attackerElement, ignoreShield }
 * @returns {object} - { newState, log, damageDealt, hasAdvantage, hasDisadvantage }
 */
export function applyDamage(state, params) {
  const { attackerId, targetId, baseDamage, attackerElement, ignoreShield = false, applyCombatPerks = false } = params;

  const attacker = findCreatureById(state, attackerId);
  const target = findCreatureById(state, targetId);

  if (!target || target.hp <= 0) {
    return { newState: state, log: [], damageDealt: 0, hasAdvantage: false, hasDisadvantage: false, shieldHit: false, shieldBroken: false };
  }

  if (target.firstAttackNegated) {
    const newState = updateCreature(state, targetId, { firstAttackNegated: false });
    return {
      newState,
      log: [`${target.name || 'Alvo'} negou o primeiro ataque recebido.`],
      damageDealt: 0,
      hasAdvantage: false,
      hasDisadvantage: false,
      shieldHit: false,
      shieldBroken: false,
      died: false,
    };
  }

  const isNight = applyCombatPerks && isNightTurn(state);
  const attackerSide = applyCombatPerks ? getCreatureSide(state, attackerId) : null;
  const targetSide = applyCombatPerks ? getCreatureSide(state, targetId) : null;

  // Perks de esquiva total (só se aplicam a ataques reais, não a ticks de status)
  if (applyCombatPerks) {
    const dodgeFromPerk = target.perkEffects?.dodgeChance || 0;
    const dodgeFromBuffs = (target.buffs || [])
      .filter(b => b.stat === 'dodge')
      .reduce((sum, b) => sum + (b.value || 0), 0);
    const dodgeFromNight = isNight ? (target.perkEffects?.nightSelfBuff?.dodge || 0) : 0;
    const totalDodgeChance = dodgeFromPerk + dodgeFromBuffs + dodgeFromNight;
    if (totalDodgeChance > 0 && Math.random() < totalDodgeChance) {
      return {
        newState: state,
        log: [`${target.name || 'Alvo'} esquivou do ataque!`],
        damageDealt: 0,
        hasAdvantage: false,
        hasDisadvantage: false,
        shieldHit: false,
        shieldBroken: false,
        died: false,
        dodged: true,
      };
    }
  }

  // Calcula modificador de elemento
  const { modifier: elementMod, hasAdvantage, hasDisadvantage } = getElementModifier(attackerElement, target.element);

  // Aplica modificadores de buffs/debuffs
  const attackMods = attacker?.buffs?.filter(b => b.stat === 'attack') || [];
  const defenseMods = target.buffs?.filter(b => b.stat === 'defense') || [];

  let damage = baseDamage + elementMod; // Soma/subtrai ao invés de multiplicar
  damage = applyModifiers(damage, attackMods);
  damage = applyModifiers(damage, defenseMods.map(m => ({ ...m, value: -m.value })));

  // Aplica modificador temporário do Elderox: se o lado do atacante tiver o marcador ativo, dobra o dano
  try {
    if (attackerSide && state && state.elderoxDoubleDamage && state.elderoxDoubleDamage[attackerSide]) {
      console.debug('Elderox double-damage marker detected for side', attackerSide);
      damage = damage * 2;
    }
  } catch (e) {
    // ignore
  }

  // Perk de dano crítico (chance de golpe extra)
  let wasCrit = false;
  if (applyCombatPerks && attacker?.perkEffects?.critChance) {
    if (Math.random() < attacker.perkEffects.critChance) {
      wasCrit = true;
      damage += (attacker.perkEffects.critBonus || 0);
    }
  }

  if (applyCombatPerks) {
    // Bônus de ataque noturno do próprio atacante
    if (isNight && attacker?.perkEffects?.nightSelfBuff?.atk) {
      damage += attacker.perkEffects.nightSelfBuff.atk;
    }

    // Auras do lado do atacante: reduzem a defesa inimiga (mais dano) ou reforçam aliados por período (dia/noite)
    if (attackerSide) {
      const allySlots = (state[attackerSide]?.field?.slots || []).filter(c => c && c.hp > 0);
      damage += allySlots.reduce((sum, c) => sum + (c.perkEffects?.enemyDefenseAura || 0), 0);
      if (isNight) {
        damage += allySlots.reduce((sum, c) => sum + (c.perkEffects?.nightAllyAttackAura || 0), 0);
      } else {
        damage += allySlots.reduce((sum, c) => sum + (c.perkEffects?.dayAllyAttackAura || 0), 0);
      }
    }

    // Bônus de dano contra alvo congelado
    if (attacker?.perkEffects?.bonusDamageVsFrozen) {
      const { element: bonusElement, value: bonusValue } = attacker.perkEffects.bonusDamageVsFrozen;
      const targetFrozen = (target.statusEffects || []).some(e => e.type === 'freeze' && e.duration > 0);
      if (targetFrozen && (!bonusElement || attackerElement === bonusElement)) {
        damage += bonusValue;
      }
    }

    // Redução de dano do alvo: fixa, resistência mágica (vantagem elemental), resistência elemental específica
    damage -= (target.perkEffects?.flatDamageReduction || 0);
    if (hasAdvantage) {
      damage -= (target.perkEffects?.magicResistance || 0);
    }
    if (target.perkEffects?.elementDamageReduction && target.perkEffects.elementDamageReduction.element === attackerElement) {
      damage -= target.perkEffects.elementDamageReduction.value;
    }
    damage -= (target.buffs || [])
      .filter(b => b.stat === 'elementResist' && b.element === attackerElement)
      .reduce((sum, b) => sum + (b.value || 0), 0);
    if (target.perkEffects?.defenseWhileShielded && target.shield > 0) {
      damage -= target.perkEffects.defenseWhileShielded;
    }
    if (target.perkEffects?.defenseWhileAboveHalfHp && target.hp > (target.maxHp || target.hp) / 2) {
      damage -= target.perkEffects.defenseWhileAboveHalfHp;
    }

    // Auras do lado do alvo: reduzem o dano recebido por todos os aliados
    if (targetSide) {
      const targetAllySlots = (state[targetSide]?.field?.slots || []).filter(c => c && c.hp > 0);
      damage -= targetAllySlots.reduce((sum, c) => sum + (c.perkEffects?.allyDefenseAura || 0), 0);
      const attackerTypeText = (attacker?.type || '').toLowerCase();
      const isShadowAttacker = attackerTypeText.includes('sombr') || attackerTypeText.includes('shadow');
      if (isShadowAttacker) {
        damage -= targetAllySlots.reduce((sum, c) => sum + (c.perkEffects?.shadowResistAura || 0), 0);
      }
    }
  }

  // Reduz o dano do primeiro ataque recebido a cada turno (consome o "uso" deste turno)
  let firstHitReducedNow = false;
  if (applyCombatPerks && target.perkEffects?.firstHitDamageReduction && !target.firstHitUsedThisTurn) {
    damage -= target.perkEffects.firstHitDamageReduction;
    firstHitReducedNow = true;
  }

  damage = Math.max(1, Math.round(damage)); // Dano mínimo de 1
  let shieldBroken = false;
  const hadShield = !ignoreShield && (target.shield > 0);
  let finalDamage = damage;
  let newShield = target.shield;

  if (hadShield) {
    if (damage >= target.shield) {
      // Dano quebra o escudo e passa para o HP
      finalDamage = damage - target.shield;
      newShield = 0;
      shieldBroken = true;
    } else {
      // Dano não quebra o escudo, só reduz o escudo
      finalDamage = 0;
      newShield = target.shield - damage;
    }
  }

  // Aplica dano
  const newHp = Math.max(0, target.hp - finalDamage);
  const died = newHp === 0;

  let newState = updateCreature(state, targetId, {
    hp: newHp,
    shield: Math.max(0, newShield),
    ...(firstHitReducedNow ? { firstHitUsedThisTurn: true } : {}),
  });

  const log = [
    `${attacker?.name || 'Atacante'} causou ${finalDamage} de dano a ${target.name || 'Alvo'}${wasCrit ? ' (CRÍTICO!)' : ''}${hasAdvantage ? ' (VANTAGEM!)' : ''}${hasDisadvantage ? ' (RESISTÊNCIA!)' : ''}${shieldBroken ? ' (escudo quebrado!)' : ''}`,
    ...(died ? [`${target.name} foi derrotado!`] : [])
  ];

  if (applyCombatPerks && attacker) {
    // Roubo de vida: cura o atacante com base no dano causado
    if (finalDamage > 0 && attacker.perkEffects?.lifestealOnDamage) {
      const freshAttacker = findCreatureById(newState, attackerId);
      if (freshAttacker && freshAttacker.hp > 0) {
        const healResult = applyHeal(newState, { targetId: attackerId, healAmount: attacker.perkEffects.lifestealOnDamage });
        newState = healResult.newState;
        log.push(...healResult.log.map(l => `${l} (roubo de vida)`));
      }
    }

    // Recupera vida ao abater o alvo
    if (died && attacker.perkEffects?.healOnKill) {
      const freshAttacker = findCreatureById(newState, attackerId);
      if (freshAttacker && freshAttacker.hp > 0) {
        const healResult = applyHeal(newState, { targetId: attackerId, healAmount: attacker.perkEffects.healOnKill });
        newState = healResult.newState;
        log.push(...healResult.log);
      }
    }

    // Recupera vida ao abater um alvo que estava sob um status específico (ex: veneno)
    if (died && attacker.perkEffects?.healOnKillIfStatus) {
      const { status, value } = attacker.perkEffects.healOnKillIfStatus;
      const hadStatus = (target.statusEffects || []).some(e => e.type === status && e.duration > 0);
      if (hadStatus) {
        const freshAttacker = findCreatureById(newState, attackerId);
        if (freshAttacker && freshAttacker.hp > 0) {
          const healResult = applyHeal(newState, { targetId: attackerId, healAmount: value });
          newState = healResult.newState;
          log.push(...healResult.log);
        }
      }
    }

    // Recupera essência ao abater o alvo
    if (died && attacker.perkEffects?.essenceOnKill && attackerSide) {
      newState = {
        ...newState,
        [attackerSide]: {
          ...newState[attackerSide],
          essence: (newState[attackerSide]?.essence || 0) + attacker.perkEffects.essenceOnKill,
        },
      };
      log.push(`${attacker.name} recuperou ${attacker.perkEffects.essenceOnKill} de essência.`);
    }

    // Reduz defesa do alvo ao ser atingido por este atacante
    if (!died && attacker.perkEffects?.defenseDebuffOnAttack) {
      const { value, duration } = attacker.perkEffects.defenseDebuffOnAttack;
      const debuffResult = applyDebuff(newState, { targetId, stat: 'defense', value, duration, name: 'Defesa Reduzida' });
      newState = debuffResult.newState;
      log.push(...debuffResult.log);
    }

    // Chance de paralisar o alvo ao atacar
    if (!died && attacker.perkEffects?.paralyzeChanceOnAttack && Math.random() < attacker.perkEffects.paralyzeChanceOnAttack) {
      const statusResult = applyStatusEffect(newState, { targetId, effectType: 'paralyze', duration: 1, attackerId });
      newState = statusResult.newState;
      log.push(...statusResult.log);
    }
  }

  // Efeitos reativos do alvo, disparados sempre que ele sofre dano real
  if (applyCombatPerks && finalDamage > 0) {
    // Ganha ataque ao receber dano
    if (target.perkEffects?.attackOnDamageTaken) {
      const freshTarget = findCreatureById(newState, targetId);
      if (freshTarget && freshTarget.hp > 0) {
        newState = updateCreature(newState, targetId, { atk: (freshTarget.atk || 0) + target.perkEffects.attackOnDamageTaken });
        log.push(`${target.name} ganhou +${target.perkEffects.attackOnDamageTaken} de ataque ao receber dano.`);
      }
    }

    // Reflete parte do dano de volta ao atacante
    if (target.perkEffects?.reflectDamage && attacker) {
      const { element: reflectElement, value: reflectValue } = target.perkEffects.reflectDamage;
      if (!reflectElement || attackerElement === reflectElement) {
        const freshAttacker = findCreatureById(newState, attackerId);
        if (freshAttacker && freshAttacker.hp > 0) {
          newState = updateCreature(newState, attackerId, { hp: Math.max(0, freshAttacker.hp - reflectValue) });
          log.push(`${target.name} refletiu ${reflectValue} de dano em ${attacker.name}.`);
        }
      }
    }

    // Chance de congelar o atacante ao ser atingido
    if (target.perkEffects?.freezeAttackerChance && attacker && Math.random() < target.perkEffects.freezeAttackerChance) {
      const freshAttacker = findCreatureById(newState, attackerId);
      if (freshAttacker && freshAttacker.hp > 0) {
        const statusResult = applyStatusEffect(newState, { targetId: attackerId, effectType: 'freeze', duration: 1, attackerId: targetId });
        newState = statusResult.newState;
        log.push(...statusResult.log);
      }
    }

    // Chance de ganhar escudo ao ser atingido
    if (target.perkEffects?.shieldChanceOnDamageTaken) {
      const { chance, amount } = target.perkEffects.shieldChanceOnDamageTaken;
      if (Math.random() < chance) {
        const shieldResult = applyShield(newState, { targetId, shieldAmount: amount });
        newState = shieldResult.newState;
        log.push(...shieldResult.log);
      }
    }

    // Ganha escudo ao ser atingido, caso fique sem nenhum escudo ativo
    if (target.perkEffects?.shieldOnDamageIfNone) {
      const freshTarget = findCreatureById(newState, targetId);
      if (freshTarget && freshTarget.hp > 0 && (freshTarget.shield || 0) === 0) {
        const shieldResult = applyShield(newState, { targetId, shieldAmount: target.perkEffects.shieldOnDamageIfNone });
        newState = shieldResult.newState;
        log.push(...shieldResult.log);
      }
    }
  }

  return { newState, log, damageDealt: finalDamage, hasAdvantage, hasDisadvantage, shieldHit: hadShield, shieldBroken, died, wasCrit };
}

/**
 * Determina se a rodada atual é "noite" (usado por perks com condição dia/noite).
 * Convenção: rodadas pares são noite, ímpares são dia.
 */
export function isNightTurn(state) {
  return ((state?.turn || 0) % 2) === 0;
}

/**
 * Cura uma criatura
 */
export function applyHeal(state, params) {
  const { targetId, healAmount } = params;
  const target = findCreatureById(state, targetId);

  if (!target || target.hp <= 0) {
    return { newState: state, log: [], healAmount: 0 };
  }

  const maxHp = target.maxHp || target.hp;
  const actualHeal = Math.min(healAmount, maxHp - target.hp);
  const newHp = target.hp + actualHeal;

  const newState = updateCreature(state, targetId, { hp: newHp });
  const log = [`${target.name} recuperou ${actualHeal} HP`];

  return { newState, log, healAmount: actualHeal };
}

/**
 * Aplica buff (aumento temporário de stats)
 */
export function applyBuff(state, params) {
  const { targetId, stat, value, duration, name } = params;
  const target = findCreatureById(state, targetId);

  if (!target || target.hp <= 0) {
    return { newState: state, log: [] };
  }

  const buff = {
    id: `buff_${Date.now()}`,
    name: name || `+${Math.round(value * 100)}% ${stat}`,
    stat,
    value,
    duration,
    type: 'percent',
  };

  const buffs = [...(target.buffs || []), buff];
  const newState = updateCreature(state, targetId, { buffs });
  const log = [`${target.name} recebeu ${buff.name} por ${duration} turnos`];

  return { newState, log };
}

/**
 * Aplica debuff (redução temporária de stats)
 */
export function applyDebuff(state, params) {
  return applyBuff(state, { ...params, value: -Math.abs(params.value) });
}

/**
 * Remove até `count` debuffs (buffs com valor negativo) de uma criatura.
 * @returns {{ buffs: array, removedCount: number }}
 */
export function removeCreatureDebuffs(creature, count = 1) {
  const buffs = [...(creature.buffs || [])];
  let removed = 0;
  const kept = [];
  buffs.forEach((b) => {
    if (removed < count && b.value < 0) {
      removed += 1;
      return;
    }
    kept.push(b);
  });
  return { buffs: kept, removedCount: removed };
}

/**
 * Aplica escudo (absorve dano)
 */
export function applyShield(state, params) {
  const { targetId, shieldAmount, duration } = params;
  const target = findCreatureById(state, targetId);

  if (!target || target.hp <= 0) {
    return { newState: state, log: [] };
  }

  const newShield = (target.shield || 0) + shieldAmount;
  const newState = updateCreature(state, targetId, { shield: newShield });
  const log = [`${target.name} ganhou escudo de ${shieldAmount} HP`];

  return { newState, log };
}

/**
 * Aplica efeito de status (queimadura, paralisia, etc)
 */
export function applyStatusEffect(state, params) {
  const { targetId, effectType, duration, value, attackerId } = params;
  const target = findCreatureById(state, targetId);

  if (!target || target.hp <= 0) {
    return { newState: state, log: [] };
  }

  // Perks que fortalecem o status causado pelo próprio atacante (bônus específico de queimadura + genérico por tipo)
  let finalDuration = duration;
  let finalValue = value;
  const attacker = attackerId ? findCreatureById(state, attackerId) : null;
  if (effectType === 'burn' && attacker?.perkEffects?.burnDamageBonus) {
    finalValue = (Number.isFinite(finalValue) ? finalValue : 1) + attacker.perkEffects.burnDamageBonus;
  }
  if (effectType === 'burn' && attacker?.perkEffects?.burnDurationBonus) {
    finalDuration = (Number.isFinite(finalDuration) ? finalDuration : 0) + attacker.perkEffects.burnDurationBonus;
  }
  if (attacker?.perkEffects?.statusDamageBonus?.[effectType]) {
    finalValue = (Number.isFinite(finalValue) ? finalValue : 1) + attacker.perkEffects.statusDamageBonus[effectType];
  }
  if (attacker?.perkEffects?.statusDurationBonus?.[effectType]) {
    finalDuration = (Number.isFinite(finalDuration) ? finalDuration : 0) + attacker.perkEffects.statusDurationBonus[effectType];
  }

  const effect = {
    id: `status_${Date.now()}`,
    type: effectType,
    duration: finalDuration,
    value: finalValue,
    attackerId: attackerId || null,
  };

  const statusEffects = [...(target.statusEffects || []), effect];
  let newState = updateCreature(state, targetId, { statusEffects });

  // Perk: cura o atacante ao aplicar um efeito contínuo (queimadura/veneno/sangramento)
  if (['burn', 'poison', 'bleed'].includes(effectType) && attacker?.perkEffects?.healOnApplyDot) {
    const freshAttacker = findCreatureById(newState, attackerId);
    if (freshAttacker && freshAttacker.hp > 0) {
      const healResult = applyHeal(newState, { targetId: attackerId, healAmount: attacker.perkEffects.healOnApplyDot });
      newState = healResult.newState;
    }
  }

  const effectNames = {
    burn: 'queimadura',
    poison: 'envenenamento',
    paralyze: 'paralisia',
    freeze: 'congelamento',
    regeneration: 'regeneração',
    sleep: 'sono',
    bleed: 'sangramento',
  };

  const log = [`${target.name} foi afetado por ${effectNames[effectType] || effectType}`];

  return { newState, log };
}

/**
 * Processa efeitos de status no início do turno
 */
export function processStatusEffects(state, creatureId) {
  const creature = findCreatureById(state, creatureId);

  if (!creature || creature.hp <= 0) {
    return { newState: state, log: [] };
  }

  let newState = state;
  let log = [];

  // Perk: ganha escudo no início do turno se um status específico estiver ativo
  const shieldTrigger = creature.perkEffects?.shieldIfStatusActiveOnTurnStart;
  if (shieldTrigger) {
    const hasActiveStatus = (creature.statusEffects || []).some(e => e.type === shieldTrigger.status && e.duration > 0);
    if (hasActiveStatus) {
      const shieldResult = applyShield(newState, { targetId: creatureId, shieldAmount: shieldTrigger.amount });
      newState = shieldResult.newState;
      log = [...log, ...shieldResult.log];
    }
  }

  // Perk: ganha escudo no início de todo turno, incondicionalmente
  if (creature.perkEffects?.shieldEveryTurnStart) {
    const shieldResult = applyShield(newState, { targetId: creatureId, shieldAmount: creature.perkEffects.shieldEveryTurnStart });
    newState = shieldResult.newState;
    log = [...log, ...shieldResult.log];
  }

  // Perk: cura no início do turno se um status específico estiver ativo
  const healTrigger = creature.perkEffects?.healIfStatusActiveOnTurnStart;
  if (healTrigger) {
    const hasActiveStatus = (creature.statusEffects || []).some(e => e.type === healTrigger.status && e.duration > 0);
    if (hasActiveStatus) {
      const healResult = applyHeal(newState, { targetId: creatureId, healAmount: healTrigger.amount });
      newState = healResult.newState;
      log = [...log, ...healResult.log];
    }
  }

  // Perk: ganha escudo no início do turno se um buff específico estiver ativo (ex: ataque, defesa, esquiva)
  const buffShieldTrigger = creature.perkEffects?.shieldIfBuffActiveOnTurnStart;
  if (buffShieldTrigger) {
    const hasActiveBuff = (creature.buffs || []).some(b => b.stat === buffShieldTrigger.stat && b.duration > 0);
    if (hasActiveBuff) {
      const shieldResult = applyShield(newState, { targetId: creatureId, shieldAmount: buffShieldTrigger.amount });
      newState = shieldResult.newState;
      log = [...log, ...shieldResult.log];
    }
  }

  // Perk: remove 1 debuff e ganha escudo no início do turno se o HP estiver baixo
  const lowHpTrigger = creature.perkEffects?.cleanseAndShieldIfLowHp;
  if (lowHpTrigger && creature.hp <= lowHpTrigger.hpThreshold) {
    const { buffs, removedCount } = removeCreatureDebuffs(creature, 1);
    newState = updateCreature(newState, creatureId, { buffs });
    const shieldResult = applyShield(newState, { targetId: creatureId, shieldAmount: lowHpTrigger.shieldAmount });
    newState = shieldResult.newState;
    log = [...log, ...(removedCount > 0 ? [`${creature.name} removeu um efeito negativo.`] : []), ...shieldResult.log];
  }

  // Reseta o consumo do "primeiro golpe do turno" (perks como PROTECTIVE_WISDOM)
  if (creature.perkEffects?.firstHitDamageReduction) {
    newState = updateCreature(newState, creatureId, { firstHitUsedThisTurn: false });
  }

  // Redução de dano contínuo (DoT): perk permanente + buffs temporários (ex: ao entrar em campo)
  const dotReductionFromPerk = (types) => {
    const cfg = creature.perkEffects?.dotDamageReduction;
    if (!cfg) return 0;
    if (cfg.types && !cfg.types.includes(types)) return 0;
    return cfg.value || 0;
  };
  const dotReductionFromBuffs = (types) => (creature.buffs || [])
    .filter(b => b.stat === 'dotResist' && (!b.dotTypes || b.dotTypes.includes(types)))
    .reduce((sum, b) => sum + (b.value || 0), 0);

  const statusEffects = [...(creature.statusEffects || [])];
  const updatedEffects = [];

  statusEffects.forEach(effect => {
    // Aplica efeito por tipo
    if (['burn', 'poison', 'bleed'].includes(effect.type)) {
      const baseDmg = Number.isFinite(effect.value) ? effect.value : 1;
      const dotReduction = dotReductionFromPerk(effect.type) + dotReductionFromBuffs(effect.type);
      const dmg = Math.max(0, baseDmg - dotReduction);
      if (dmg <= 0) {
        log.push(`${creature.name} resistiu ao dano de ${effect.type === 'burn' ? 'queimadura' : effect.type === 'poison' ? 'veneno' : 'sangramento'}.`);
        if (effect.duration > 0) updatedEffects.push(effect);
        return;
      }
      const attackerId = effect.attackerId || null;
      const result = applyDamage(newState, {
        attackerId,
        targetId: creatureId,
        baseDamage: dmg,
        ignoreShield: true,
      });
      // Se a criatura morreu por debuff, registra o kill para o attackerId
      if (result.died && attackerId) {
        // Determina lado do atacante
        let killerSide = null;
        if (newState.player.field.slots.some(slot => slot && slot.id === attackerId)) killerSide = 'player';
        if (newState.ai.field.slots.some(slot => slot && slot.id === attackerId)) killerSide = 'ai';
        // Adiciona ao killFeed
        newState.killFeed = [...(newState.killFeed || []), {
          turn: newState.turn,
          attacker: attackerId,
          attackerId,
          target: creatureId,
          targetId: creatureId,
          byDebuff: effect.type,
        }];
        // Atualiza battleStats
        if (killerSide && newState.battleStats && newState.battleStats[killerSide]) {
          newState.battleStats[killerSide].cardsKilled = [...(newState.battleStats[killerSide].cardsKilled || []), attackerId];
        }
      }
      newState = result.newState;
      const typeName = effect.type === 'burn' ? 'queimadura' : effect.type === 'poison' ? 'veneno' : 'sangramento';
      log.push(`${creature.name} sofreu ${result.damageDealt} de dano por ${typeName}`);
      // NOTE: remoção física da criatura do campo e ajuste de orbes
      // é tratado pelo fluxo de `BattleContext` para permitir animações
      // de morte (não removemos imediatamente aqui).
      // duração será decrementada por rodada completa (ver decrementRoundDurations)
      if (effect.duration > 0) updatedEffects.push(effect);
    } else if (effect.type === 'regeneration') {
      const heal = Number.isFinite(effect.value) ? effect.value : 1;
      const result = applyHeal(newState, {
        targetId: creatureId,
        healAmount: heal,
      });
      newState = result.newState;
      log.push(`${creature.name} regenerou ${result.healAmount} HP`);
      // duração será decrementada por rodada completa
      if (effect.duration > 0) updatedEffects.push(effect);
    } else if (effect.type === 'paralyze' || effect.type === 'sleep') {
      // 20% de chance de remover no início do turno
      const removed = Math.random() < 0.2;
      if (removed) {
        log.push(`${creature.name} se recuperou de ${effect.type === 'paralyze' ? 'paralisia' : 'sono'}.`);
        effect.duration = 0;
      } else {
        // não decrementa aqui; mantém até o tick de rodada
        if (effect.duration > 0) {
          updatedEffects.push(effect);
          log.push(`${creature.name} permanece ${effect.type === 'paralyze' ? 'paralisado' : 'adormecido'}.`);
        }
      }
    } else if (effect.type === 'freeze') {
      // Congelado: não age; apenas reduz a duração
      // duração será decrementada por rodada completa
      if (effect.duration > 0) {
        updatedEffects.push(effect);
        log.push(`${creature.name} permanece congelado.`);
      } else {
        log.push(`${creature.name} não está mais congelado.`);
      }
    }
  });

  newState = updateCreature(newState, creatureId, { statusEffects: updatedEffects });

  return { newState, log };
}

/**
 * Reduz duração de buffs/debuffs
 */
export function processBuffs(state, creatureId) {
  const creature = findCreatureById(state, creatureId);

  if (!creature) {
    return { newState: state, log: [] };
  }

  // Não decrementa a duração aqui; o decremento de duração por rodada completa
  // é feito em `decrementRoundDurations` para que "turnos" signifiquem rodadas.
  const buffs = (creature.buffs || []).filter(buff => buff.duration > 0);

  const expired = (creature.buffs || []).length - buffs.length;
  const log = expired > 0 ? [`${expired} efeito(s) de ${creature.name} expiraram`] : [];

  const newState = updateCreature(state, creatureId, { buffs });

  return { newState, log };
}

/**
 * Decrementa duração de status e buffs uma vez por rodada completa.
 * Deve ser chamado quando uma rodada (player+ai) for concluída.
 */
export function decrementRoundDurations(state) {
  let newState = { ...state };
  let logs = [];

  const processCreature = (c) => {
    if (!c) return c;
    let updated = { ...c };

    // Processa statusEffects
    const se = (c.statusEffects || []).map(effect => ({ ...effect }));
    const newStatus = [];
    se.forEach(effect => {
      effect.duration = (typeof effect.duration === 'number') ? effect.duration - 1 : effect.duration;
      if (effect.duration > 0) {
        newStatus.push(effect);
      } else {
        // efeito expirou
        const typeName = effect.type === 'burn' ? 'queimadura' : effect.type === 'paralyze' ? 'paralisia' : effect.type === 'sleep' ? 'sono' : effect.type;
        logs.push(`${c.name} não está mais afetado por ${typeName}.`);
      }
    });

    // Processa buffs
    const buffs = (c.buffs || []).map(b => ({ ...b }));
    const newBuffs = [];
    buffs.forEach(buff => {
      buff.duration = (typeof buff.duration === 'number') ? buff.duration - 1 : buff.duration;
      if (buff.duration > 0) newBuffs.push(buff);
      else logs.push(`Efeito de ${c.name} expirou.`);
    });

    updated.statusEffects = newStatus;
    updated.buffs = newBuffs;
    return updated;
  };

  // Atualiza player slots
  if (newState.player?.field?.slots) {
    newState.player = {
      ...newState.player,
      field: {
        ...newState.player.field,
        slots: newState.player.field.slots.map(s => processCreature(s)),
      }
    };
  }

  // Atualiza AI slots
  if (newState.ai?.field?.slots) {
    newState.ai = {
      ...newState.ai,
      field: {
        ...newState.ai.field,
        slots: newState.ai.field.slots.map(s => processCreature(s)),
      }
    };
  }

  // Retorna novo estado e logs gerados
  return { newState, log: logs };
}

// ===== FUNÇÕES AUXILIARES =====

/**
 * Encontra criatura por ID no estado
 */
function findCreatureById(state, creatureId) {
  // Procura nos slots do jogador
  for (let slot of state.player?.field?.slots || []) {
    if (slot && slot.id === creatureId) return slot;
  }

  // Procura nos slots da IA
  for (let slot of state.ai?.field?.slots || []) {
    if (slot && slot.id === creatureId) return slot;
  }

  return null;
}

/**
 * Retorna o lado ('player' | 'ai' | null) de uma criatura pelo id
 */
function getCreatureSide(state, creatureId) {
  for (let slot of state.player?.field?.slots || []) {
    if (slot && slot.id === creatureId) return 'player';
  }
  for (let slot of state.ai?.field?.slots || []) {
    if (slot && slot.id === creatureId) return 'ai';
  }
  return null;
}

/**
 * Atualiza dados de uma criatura
 */
export function updateCreature(state, creatureId, updates) {
  const newState = { ...state };

  // Atualiza player slots
  if (newState.player?.field?.slots) {
    newState.player = {
      ...newState.player,
      field: {
        ...newState.player.field,
        slots: newState.player.field.slots.map(slot =>
          slot && slot.id === creatureId ? { ...slot, ...updates } : slot
        )
      }
    };
  }

  // Atualiza AI slots
  if (newState.ai?.field?.slots) {
    newState.ai = {
      ...newState.ai,
      field: {
        ...newState.ai.field,
        slots: newState.ai.field.slots.map(slot =>
          slot && slot.id === creatureId ? { ...slot, ...updates } : slot
        )
      }
    };
  }

  return newState;
}

/**
 * Obtém habilidades desbloqueadas para uma criatura baseado no level
 * @param {object} cardData - Dados da carta
 * @param {number} level - Level atual da criatura
 * @returns {array} Array de habilidades desbloqueadas
 */
export function getUnlockedAbilities(cardData, level) {
  if (!cardData || !cardData.unlockTable) {
    return cardData?.abilities || [];
  }

  const unlockedAbilities = [...(cardData.abilities || [])];
  const unlockedIds = new Set(cardData.abilities?.map(a => a.id || a.name?.pt));

  // Processa unlock table
  (cardData.unlockTable || []).forEach(unlock => {
    if (unlock.level <= level && unlock.type === 'skill') {
      // Se ainda não está na lista, adiciona
      if (!unlockedIds.has(unlock.id)) {
        unlockedAbilities.push({
          id: unlock.id,
          name: unlock.name,
          cost: unlock.cost,
          desc: unlock.desc,
          type: unlock.effectType || unlock.type,
        });
        unlockedIds.add(unlock.id);
      }
    }
  });

  return unlockedAbilities;
}

/**
 * Obtém perks/buffs desbloqueados para uma criatura baseado no level
 * @param {object} cardData - Dados da carta
 * @param {number} level - Level atual da criatura
 * @returns {array} Array de perks desbloqueados
 */
export function getUnlockedPerks(cardData, level) {
  if (!cardData || !cardData.unlockTable) {
    return [];
  }

  const unlockedPerks = [];

  (cardData.unlockTable || []).forEach(unlock => {
    if (unlock.level <= level && unlock.type === 'perk') {
      unlockedPerks.push({
        id: unlock.id,
        name: unlock.name,
        desc: unlock.desc,
      });
    }
  });

  return unlockedPerks;
}


export const fieldCards = {
  // 'purple-field': { name: 'Campo Púrpura', onEnter: (ctx) => {}, onExit: (ctx) => {} },
};
