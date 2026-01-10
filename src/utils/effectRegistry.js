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

  // Verifica fraqueza (vantagem)
  if (ELEMENT_WEAKNESS[attackerElement]?.includes(defenderElement)) {
    return { modifier: 1, hasAdvantage: true, hasDisadvantage: false }; // +1 dano
  }

  // Verifica resistência (desvantagem)
  if (ELEMENT_WEAKNESS[defenderElement]?.includes(attackerElement)) {
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
  const { attackerId, targetId, baseDamage, attackerElement, ignoreShield = false } = params;

  const attacker = findCreatureById(state, attackerId);
  const target = findCreatureById(state, targetId);

  if (!target || target.hp <= 0) {
    return { newState: state, log: [], damageDealt: 0, hasAdvantage: false, hasDisadvantage: false, shieldHit: false, shieldBroken: false };
  }

  // Calcula modificador de elemento
  const { modifier: elementMod, hasAdvantage, hasDisadvantage } = getElementModifier(attackerElement, target.element);

  // Aplica modificadores de buffs/debuffs
  const attackMods = attacker?.buffs?.filter(b => b.stat === 'attack') || [];
  const defenseMods = target.buffs?.filter(b => b.stat === 'defense') || [];

  let damage = baseDamage + elementMod; // Soma/subtrai ao invés de multiplicar
  damage = applyModifiers(damage, attackMods);
  damage = applyModifiers(damage, defenseMods.map(m => ({ ...m, value: -m.value })));

  damage = Math.max(1, Math.round(damage)); // Dano mínimo de 1

  // Sistema de escudo
  let finalDamage = damage;
  let shieldBroken = false;
  const hadShield = !ignoreShield && (target.shield > 0);

  if (hadShield) {
    if (damage >= target.shield) {
      finalDamage = damage - target.shield;
      shieldBroken = true;
    } else {
      finalDamage = 0;
    }
  }

  // Aplica dano
  const newHp = Math.max(0, target.hp - finalDamage);
  const died = newHp === 0;

  const newState = updateCreature(state, targetId, {
    hp: newHp,
    shield: shieldBroken ? 0 : Math.max(0, target.shield - damage),
  });

  const log = [
    `${attacker?.name || 'Atacante'} causou ${finalDamage} de dano a ${target.name || 'Alvo'}${hasAdvantage ? ' (VANTAGEM!)' : ''}${hasDisadvantage ? ' (RESISTÊNCIA!)' : ''}${shieldBroken ? ' (escudo quebrado!)' : ''}`,
    ...(died ? [`${target.name} foi derrotado!`] : [])
  ];

  return { newState, log, damageDealt: finalDamage, hasAdvantage, hasDisadvantage, shieldHit: hadShield, shieldBroken };
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
  const { targetId, effectType, duration, value } = params;
  const target = findCreatureById(state, targetId);

  if (!target || target.hp <= 0) {
    return { newState: state, log: [] };
  }

  const effect = {
    id: `status_${Date.now()}`,
    type: effectType,
    duration,
    value,
  };

  const statusEffects = [...(target.statusEffects || []), effect];
  const newState = updateCreature(state, targetId, { statusEffects });

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

  const statusEffects = [...(creature.statusEffects || [])];
  const updatedEffects = [];

  statusEffects.forEach(effect => {
    // Aplica efeito por tipo
    if (['burn', 'poison', 'bleed'].includes(effect.type)) {
      const dmg = Number.isFinite(effect.value) ? effect.value : 1;
      const result = applyDamage(newState, {
        attackerId: null,
        targetId: creatureId,
        baseDamage: dmg,
        ignoreShield: true,
      });
      newState = result.newState;
      const typeName = effect.type === 'burn' ? 'queimadura' : effect.type === 'poison' ? 'veneno' : 'sangramento';
      log.push(`${creature.name} sofreu ${result.damageDealt} de dano por ${typeName}`);
      effect.duration -= 1;
      if (effect.duration > 0) updatedEffects.push(effect);
    } else if (effect.type === 'regeneration') {
      const heal = Number.isFinite(effect.value) ? effect.value : 1;
      const result = applyHeal(newState, {
        targetId: creatureId,
        healAmount: heal,
      });
      newState = result.newState;
      log.push(`${creature.name} regenerou ${result.healAmount} HP`);
      effect.duration -= 1;
      if (effect.duration > 0) updatedEffects.push(effect);
    } else if (effect.type === 'paralyze' || effect.type === 'sleep') {
      // 50% de chance de remover no início do turno
      const removed = Math.random() < 0.5;
      if (removed) {
        log.push(`${creature.name} se recuperou de ${effect.type === 'paralyze' ? 'paralisia' : 'sono'}.`);
        effect.duration = 0;
      } else {
        effect.duration -= 1;
        if (effect.duration > 0) {
          updatedEffects.push(effect);
          log.push(`${creature.name} permanece ${effect.type === 'paralyze' ? 'paralisado' : 'adormecido'}.`);
        }
      }
    } else if (effect.type === 'freeze') {
      // Congelado: não age; apenas reduz a duração
      effect.duration -= 1;
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

  const buffs = (creature.buffs || [])
    .map(buff => ({ ...buff, duration: buff.duration - 1 }))
    .filter(buff => buff.duration > 0);

  const expired = (creature.buffs || []).length - buffs.length;
  const log = expired > 0 ? [`${expired} efeito(s) de ${creature.name} expiraram`] : [];

  const newState = updateCreature(state, creatureId, { buffs });

  return { newState, log };
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
 * Atualiza dados de uma criatura
 */
function updateCreature(state, creatureId, updates) {
  const newState = { ...state };

  // Atualiza player slots
  if (newState.player?.field?.slots) {
    newState.player.field.slots = newState.player.field.slots.map(slot =>
      slot && slot.id === creatureId ? { ...slot, ...updates } : slot
    );
  }

  // Atualiza AI slots
  if (newState.ai?.field?.slots) {
    newState.ai.field.slots = newState.ai.field.slots.map(slot =>
      slot && slot.id === creatureId ? { ...slot, ...updates } : slot
    );
  }

  return newState;
}

// ===== PLACEHOLDERS ANTIGOS (manter compatibilidade) =====

export const effectCards = {
  // 'heal-small': { name: 'Cura Pequena', play: (ctx) => {} },
};

export const fieldCards = {
  // 'purple-field': { name: 'Campo Púrpura', onEnter: (ctx) => {}, onExit: (ctx) => {} },
};
