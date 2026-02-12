/**
 * AI logic for battle decisions
 * This is a placeholder that will be expanded later
 */
// Import creature definitions and helpers
let creaturesPool = null;
try {
  // es module default or commonjs
  const cp = require('../assets/cards');
  creaturesPool = cp && cp.default ? cp.default : cp;
} catch (e) {
  creaturesPool = [];
}

const { getFieldAffinityBonus } = require('./fieldAffinity');

/**
 * Escolhe ação principal da IA com heurísticas simples.
 * - Prioriza invocar criatura quando estiver com muitas cartas e poucas criaturas.
 * - Escolhe o melhor monstro da mão com base em atk/hp comparado aos inimigos.
 */
export function chooseAction(battleState) {
  try {
    const s = battleState;
    if (!s || s.activePlayer !== 'ai') return { type: 'pass' };

    const hand = Array.isArray(s.ai?.hand) ? s.ai.hand : [];
    const slots = Array.isArray(s.ai?.field?.slots) ? s.ai.field.slots : [null, null, null];
    const enemySlots = Array.isArray(s.player?.field?.slots) ? s.player.field.slots : [];

    const aiCreatureCount = slots.filter(Boolean).length;
    const enemyCreatures = enemySlots.filter(Boolean);

    // If AI has many cards in hand (>=6) and few creatures (<=1), prioritize summoning
    const handThreshold = 6;
    // detect field/effect cards in hand
    const fieldCardIndex = hand.findIndex((c) => c && (/^f\d{3}$/i.test(c) || String(c).toLowerCase().startsWith('field_')));
    const effectCardIndex = hand.findIndex((c) => c && String(c).toLowerCase().startsWith('effect_'));

    if (hand.length >= handThreshold && aiCreatureCount <= 1) {
      // Evaluate each invokable creature in hand
      let best = null;
      for (let i = 0; i < hand.length; i += 1) {
        const cId = hand[i];
        if (!cId) continue;
        const lowered = String(cId).toLowerCase();
        if (lowered.startsWith('effect_') || lowered.startsWith('field_') || /^f\d{3}$/i.test(cId)) continue;

        const baseId = cId.includes('-') ? cId.split('-')[0] : cId;
        const creatureDef = creaturesPool.find(c => c.id === baseId) || null;
        if (!creatureDef) continue;

        // Basic stats
        const atk = typeof creatureDef.atk === 'number' ? creatureDef.atk : (creatureDef.attack || 2);
        const hp = typeof creatureDef.hp === 'number' ? creatureDef.hp : (creatureDef.maxHp || 5);

        // Score vs all enemy creatures
        let score = 0;
        if (enemyCreatures.length === 0) {
          // Prefer high-HP / sustain if no enemies
          score = hp * 0.6 + atk * 0.4;
        } else {
          enemyCreatures.forEach((e) => {
            const eAtk = e.atk || 1;
            const eHp = e.hp || 3;
            // Advantage if our atk > enemy def/atk, and survivability
            score += (atk - (e.def || 0)) * 1.2 + (hp - eHp) * 0.35;
            // small bonus for elemental affinity if sharedField exists
            try {
              const field = s.sharedField && s.sharedField.cardData ? s.sharedField.cardData : (s.sharedField || {});
              const aff = getFieldAffinityBonus(field, creatureDef);
              score += (aff.bonusDano || 0) * 0.8 + (aff.bonusHP || 0) * 0.5;
            } catch (err) {}
          });
        }

        if (!best || score > best.score) {
          best = { score, handIndex: i, baseId, creatureDef };
        }
      }

      if (best) {
        // choose preferred slot: try to align with enemy strongest slot if possible
        let preferredSlot = slots.findIndex(s => !s);
        if (enemyCreatures.length > 0) {
          // strongest enemy by atk+hp
          let strongestIdx = 0;
          let strongestVal = -Infinity;
          enemySlots.forEach((slot, idx) => {
            if (!slot) return;
            const val = (slot.atk || 0) + (slot.hp || 0) * 0.5;
            if (val > strongestVal) { strongestVal = val; strongestIdx = idx; }
          });
          // prefer same index if empty
          if (!slots[strongestIdx]) preferredSlot = strongestIdx;
        }

        // ensure preferredSlot valid
        if (preferredSlot === -1) preferredSlot = slots.findIndex(s => !s) || 0;

        return { type: 'summon', handIndex: best.handIndex, slotIndex: preferredSlot };
      }
    }

    // If not forced by hand size, evaluate whether now is a good moment to summon.
    // Re-evaluate best candidate even if hand < threshold.
    let best = null;
    for (let i = 0; i < hand.length; i += 1) {
      const cId = hand[i];
      if (!cId) continue;
      const lowered = String(cId).toLowerCase();
      if (lowered.startsWith('effect_') || lowered.startsWith('field_') || /^f\d{3}$/i.test(cId)) continue;
      const baseId = cId.includes('-') ? cId.split('-')[0] : cId;
      const creatureDef = creaturesPool.find(c => c.id === baseId) || null;
      if (!creatureDef) continue;
      const atk = typeof creatureDef.atk === 'number' ? creatureDef.atk : (creatureDef.attack || 2);
      const hp = typeof creatureDef.hp === 'number' ? creatureDef.hp : (creatureDef.maxHp || 5);
      let score = 0;
      if (enemyCreatures.length === 0) {
        score = hp * 0.6 + atk * 0.4;
      } else {
        enemyCreatures.forEach((e) => {
          const eAtk = e.atk || 1;
          const eHp = e.hp || 3;
          score += (atk - (e.def || 0)) * 1.2 + (hp - eHp) * 0.35;
          try {
            const field = s.sharedField && s.sharedField.cardData ? s.sharedField.cardData : (s.sharedField || {});
            const aff = getFieldAffinityBonus(field, creatureDef);
            score += (aff.bonusDano || 0) * 0.8 + (aff.bonusHP || 0) * 0.5;
          } catch (err) {}
        });
      }
      if (!best || score > best.score) {
        best = { score, handIndex: i, baseId, creatureDef };
      }
    }

    if (best) {
      // Decision rules for timing
      // - If AI has fewer creatures than enemy, prefer to summon
      if (enemyCreatures.length > aiCreatureCount) {
        const preferredSlot = slots.findIndex(s => !s) || 0;
        return { type: 'summon', handIndex: best.handIndex, slotIndex: preferredSlot };
      }

      // - If the best candidate has positive score (favorable matchup), summon
      if (best.score > 0.5) {
        const preferredSlot = slots.findIndex(s => !s) || 0;
        return { type: 'summon', handIndex: best.handIndex, slotIndex: preferredSlot };
      }

      // - If there is a useful field card in hand and situation not favorable, prefer invoking field
      if (fieldCardIndex >= 0) {
        return { type: 'pass' }; // let performAiTurn handle field invocation in its own priority
      }
    }

    // Fallback: if has pending strong attack options, choose pass for now
    return { type: 'pass' };
  } catch (e) {
    console.warn('chooseAction error', e);
    return { type: 'pass' };
  }
}

export function evaluateGameState(state) {
  // TODO: Implement game state evaluation
  return 0;
}

export function calculateBestMove(state, possibleActions) {
  // TODO: Implement minimax or similar algorithm
  // For now, return the first action
  return possibleActions[0] || { type: 'pass', target: null };
}

/**
 * Executa o efeito de uma carta de efeito durante a batalha
 * @param {Object} state - Estado da batalha
 * @param {Object} effectCard - Carta de efeito sendo jogada
 * @param {Object} targetInfo - Informações do alvo (pode ser null para efeitos sem alvo)
 * @returns {Object} Estado atualizado
 */
export function executeEffectCard(state, effectCard, targetInfo = null) {
  let newState = JSON.parse(JSON.stringify(state)); // Deep copy

  switch (effectCard.effectType) {
    case 'draw':
      // Compra +N cartas do baralho imediatamente para o jogador (respeita limite de mão)
      if (!newState.player) newState.player = {};
      if (newState.player?.deck && Array.isArray(newState.player.deck) && Array.isArray(newState.player.hand)) {
        const deck = [...newState.player.deck];
        const hand = [...newState.player.hand];
        const drawn = [];
        for (let i = 0; i < (effectCard.effectValue || 0); i++) {
          if (deck.length === 0) break;
          if (hand.length >= 7) break; // limite de mão
          const d = deck.shift();
          if (d) {
            hand.push(d);
            drawn.push(d);
          }
        }
        newState.player = {
          ...newState.player,
          deck,
          hand,
        };
        // Atualiza estatísticas de batalha para mostrar quais cartas foram compradas
        if (!newState.battleStats) newState.battleStats = { player: { cardsDrawn: [] }, ai: { cardsDrawn: [] } };
        newState.battleStats.player = {
          ...newState.battleStats.player,
          cardsDrawn: [...(newState.battleStats.player.cardsDrawn || []), ...drawn],
        };
      }
      break;

    case 'essence':
      // Adiciona essência ao player
      newState.player = {
        ...newState.player,
        essence: Math.min(10, (newState.player?.essence || 0) + effectCard.effectValue)
      };
      break;

    case 'essenceSacrifice':
      // Sacrifica uma carta da mao para ganhar +1 essencia
      if (newState.player?.hand && targetInfo?.sacrificeCardId) {
        const hand = [...newState.player.hand];
        const sacrificeIndex = hand.findIndex((id) => id === targetInfo.sacrificeCardId);
        if (sacrificeIndex !== -1) {
          hand.splice(sacrificeIndex, 1);
          newState.player = {
            ...newState.player,
            hand,
            essence: Math.min(10, (newState.player?.essence || 0) + (effectCard.effectValue || 1))
          };
        }
      }
      break;

    case 'heal':
      // Cura o player (adiciona orbes)
      // Determina qual lado recebe o heal baseado no activePlayer
      const healSide = newState.activePlayer || 'player';
      const maxOrbs = 5; // Máximo de orbes
      newState[healSide] = {
        ...newState[healSide],
        orbs: Math.min(
          (newState[healSide]?.orbs || 0) + effectCard.effectValue,
          maxOrbs
        )
      };
      break;

    case 'damageAll':
      // Causa dano a todos os monstros inimigos
      if (newState.ai?.field?.slots && Array.isArray(newState.ai.field.slots)) {
        newState.ai.field.slots = newState.ai.field.slots.map(creature => {
          if (creature) {
            return {
              ...creature,
              hp: Math.max(0, creature.hp - effectCard.effectValue)
            };
          }
          return creature;
        });
      }
      break;

    case 'destroyAll':
      // Manda todos os monstros inimigos ao cemitério
      if (newState.ai?.field?.slots && Array.isArray(newState.ai.field.slots)) {
        const destroyed = newState.ai.field.slots.filter(c => c !== null);
        if (!newState.ai.graveyard) newState.ai.graveyard = [];
        newState.ai.graveyard.push(...destroyed);
        newState.ai.field.slots = newState.ai.field.slots.map(creature => null);
      }
      break;

    case 'drawOpponent':
      // Compra Reversa: puxa cartas do baralho do adversário para a mão do jogador
      if (newState.ai?.deck && newState.player?.hand) {
        const aiDeck = [...newState.ai.deck];
        const playerHand = [...newState.player.hand];

        for (let i = 0; i < effectCard.effectValue; i++) {
          if (aiDeck.length > 0 && playerHand.length < 7) {
            const drawnCard = aiDeck.shift();
            playerHand.push(drawnCard);
          }
        }

        newState.ai = {
          ...newState.ai,
          deck: aiDeck
        };
        newState.player = {
          ...newState.player,
          hand: playerHand
        };
      }
      break;

    case 'shield':
      // Adiciona escudo a uma criatura aliada específica
      if (targetInfo && newState.player?.field?.slots && newState.player.field.slots[targetInfo.allyIndex]) {
        newState.player.field.slots[targetInfo.allyIndex] = {
          ...newState.player.field.slots[targetInfo.allyIndex],
          shield: (newState.player.field.slots[targetInfo.allyIndex].shield || 0) + effectCard.effectValue
        };
      }
      break;

    case 'shieldAll':
      // Adiciona escudo a todas as criaturas aliadas por N turnos
      if (newState.player?.field?.slots && Array.isArray(newState.player.field.slots)) {
        newState.player.field.slots = newState.player.field.slots.map(creature => {
          if (creature) {
            return {
              ...creature,
              shield: (creature.shield || 0) + effectCard.effectValue,
              shieldDuration: effectCard.duration
            };
          }
          return creature;
        });
      }
      break;

    case 'swap':
      // Troca uma criatura aliada por uma criatura inimiga
      if (targetInfo && targetInfo.allyIndex !== undefined && targetInfo.enemyIndex !== undefined) {
        // Garante que os campos existem
        if (!newState.player?.field?.slots || !newState.ai?.field?.slots) break;

        console.log('SWAP - Antes:', {
          playerSlot: targetInfo.allyIndex,
          playerCreature: newState.player.field.slots[targetInfo.allyIndex]?.name,
          aiSlot: targetInfo.enemyIndex,
          aiCreature: newState.ai.field.slots[targetInfo.enemyIndex]?.name
        });

        // Realiza a troca
        const temp = newState.player.field.slots[targetInfo.allyIndex];
        newState.player.field.slots[targetInfo.allyIndex] = newState.ai.field.slots[targetInfo.enemyIndex];
        newState.ai.field.slots[targetInfo.enemyIndex] = temp;

        console.log('SWAP - Depois:', {
          playerSlot: targetInfo.allyIndex,
          playerCreature: newState.player.field.slots[targetInfo.allyIndex]?.name,
          aiSlot: targetInfo.enemyIndex,
          aiCreature: newState.ai.field.slots[targetInfo.enemyIndex]?.name
        });
      }
      break;

    case 'control':
      // Controla uma criatura inimiga por N turnos
      if (targetInfo && newState.ai?.field?.slots && newState.ai.field.slots[targetInfo.enemyIndex]) {
        newState.ai.field.slots[targetInfo.enemyIndex] = {
          ...newState.ai.field.slots[targetInfo.enemyIndex],
          controlledBy: 'player',
          controlDuration: effectCard.duration
        };
      }
      break;

    case 'resurrect':
      // Sepultura do Espectro: permite atacar uma vez do cemitério sem trazer a criatura
      if (targetInfo && newState.player?.graveyard && newState.player.graveyard[targetInfo.graveyardIndex]) {
        const graveyardCreature = newState.player.graveyard[targetInfo.graveyardIndex];

        // Ao invés de trazer ao campo, marca para ataque especial (sem step)
        newState.spectralAttackPending = {
          creatureIndex: targetInfo.graveyardIndex,
          creature: graveyardCreature
          // selectedAbility será definido quando o jogador clicar na habilidade
        };
      }
      break;

    case 'damageBuff':
      // Aumenta dano de uma criatura aliada por N turnos
      if (targetInfo && newState.player?.field?.slots && newState.player.field.slots[targetInfo.allyIndex]) {
        newState.player.field.slots[targetInfo.allyIndex] = {
          ...newState.player.field.slots[targetInfo.allyIndex],
          damageBuff: (newState.player.field.slots[targetInfo.allyIndex].damageBuff || 0) + effectCard.effectValue,
          damageBuffDuration: effectCard.duration
        };
      }
      break;

    default:
      console.warn(`Tipo de efeito não reconhecido: ${effectCard.effectType}`);
  }

  return newState;
}

/**
 * Processa efeitos duradouros no início/fim de cada turno
 * Decrementa duração e remove efeitos que expiraram
 * @param {Object} state - Estado da batalha
 * @returns {Object} Estado atualizado
 */
export function processActiveEffects(state) {
  let newState = JSON.parse(JSON.stringify(state));

  // Processar efeitos nas criaturas aliadas
  if (newState.playerField && Array.isArray(newState.playerField)) {
    newState.playerField = newState.playerField.map(creature => {
      if (!creature) return creature;

      let updated = { ...creature };

      // Decrement durations
      if (updated.shieldDuration && updated.shieldDuration > 0) {
        updated.shieldDuration -= 1;
        if (updated.shieldDuration <= 0) {
          delete updated.shield;
          delete updated.shieldDuration;
        }
      }

      if (updated.damageBuffDuration && updated.damageBuffDuration > 0) {
        updated.damageBuffDuration -= 1;
        if (updated.damageBuffDuration <= 0) {
          delete updated.damageBuff;
          delete updated.damageBuffDuration;
        }
      }

      if (updated.resurrectDuration && updated.resurrectDuration > 0) {
        updated.resurrectDuration -= 1;
        if (updated.resurrectDuration <= 0) {
          // Mover de volta para o cemitério
          updated = null;
        }
      }

      return updated;
    });
  }

  // Processar efeitos nas criaturas inimigas
  if (newState.enemyField && Array.isArray(newState.enemyField)) {
    newState.enemyField = newState.enemyField.map(creature => {
      if (!creature) return creature;

      let updated = { ...creature };

      // Decrement durations
      if (updated.controlDuration && updated.controlDuration > 0) {
        updated.controlDuration -= 1;
        if (updated.controlDuration <= 0) {
          delete updated.controlledBy;
          delete updated.controlDuration;
        }
      }

      return updated;
    });
  }

  return newState;
}

