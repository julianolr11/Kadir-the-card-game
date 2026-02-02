/**
 * AI logic for battle decisions
 * This is a placeholder that will be expanded later
 */

export function chooseAction(battleState) {
  // TODO: Implement AI decision logic
  // For now, return a simple pass action
  return {
    type: 'pass',
    target: null,
  };
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
      // Compra +N cartas do baralho
      newState.playerDeck.cardsDrawn = (newState.playerDeck.cardsDrawn || 0) + effectCard.effectValue;
      break;

    case 'essence':
      // Adiciona essência ao player
      newState.playerEssence = (newState.playerEssence || 0) + effectCard.effectValue;
      break;

    case 'heal':
      // Cura o player
      newState.playerHP = Math.min(
        newState.playerHP + effectCard.effectValue,
        newState.playerMaxHP || 20
      );
      break;

    case 'damageAll':
      // Causa dano a todos os monstros inimigos
      if (newState.enemyField && Array.isArray(newState.enemyField)) {
        newState.enemyField = newState.enemyField.map(creature => {
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
      if (newState.enemyField && Array.isArray(newState.enemyField)) {
        newState.enemyField = newState.enemyField.map(creature => null);
      }
      if (!newState.graveyard) newState.graveyard = [];
      // Adicionar criaturas ao cemitério inimigo
      break;

    case 'drawOpponent':
      // Compra +N cartas do baralho do adversário
      newState.enemyDeck = newState.enemyDeck || {};
      newState.enemyDeck.cardsDrawn = (newState.enemyDeck.cardsDrawn || 0) + effectCard.effectValue;
      break;

    case 'shield':
      // Adiciona escudo a uma criatura aliada específica
      if (targetInfo && newState.playerField && newState.playerField[targetInfo.allyIndex]) {
        newState.playerField[targetInfo.allyIndex] = {
          ...newState.playerField[targetInfo.allyIndex],
          shield: (newState.playerField[targetInfo.allyIndex].shield || 0) + effectCard.effectValue
        };
      }
      break;

    case 'shieldAll':
      // Adiciona escudo a todas as criaturas aliadas por N turnos
      if (newState.playerField && Array.isArray(newState.playerField)) {
        newState.playerField = newState.playerField.map(creature => {
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
        const temp = newState.playerField[targetInfo.allyIndex];
        newState.playerField[targetInfo.allyIndex] = newState.enemyField[targetInfo.enemyIndex];
        newState.enemyField[targetInfo.enemyIndex] = temp;
      }
      break;

    case 'control':
      // Controla uma criatura inimiga por N turnos
      if (targetInfo && newState.enemyField && newState.enemyField[targetInfo.enemyIndex]) {
        newState.enemyField[targetInfo.enemyIndex] = {
          ...newState.enemyField[targetInfo.enemyIndex],
          controlledBy: 'player',
          controlDuration: effectCard.duration
        };
      }
      break;

    case 'resurrect':
      // Ressuscita uma criatura do cemitério por N turnos
      if (targetInfo && newState.graveyard && newState.graveyard[targetInfo.graveyardIndex]) {
        const resurrectedCreature = {
          ...newState.graveyard[targetInfo.graveyardIndex],
          temporary: true,
          resurrectDuration: effectCard.duration
        };
        // Adicionar ao campo do player
        if (newState.playerField) {
          const emptySlot = newState.playerField.findIndex(slot => !slot);
          if (emptySlot >= 0) {
            newState.playerField[emptySlot] = resurrectedCreature;
          }
        }
      }
      break;

    case 'damageBuff':
      // Aumenta dano de uma criatura aliada por N turnos
      if (targetInfo && newState.playerField && newState.playerField[targetInfo.allyIndex]) {
        newState.playerField[targetInfo.allyIndex] = {
          ...newState.playerField[targetInfo.allyIndex],
          damageBuff: (newState.playerField[targetInfo.allyIndex].damageBuff || 0) + effectCard.effectValue,
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

