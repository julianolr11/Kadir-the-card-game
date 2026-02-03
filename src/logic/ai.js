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
      if (!newState.player) newState.player = {};
      newState.player.cardsDrawn = (newState.player.cardsDrawn || 0) + effectCard.effectValue;
      break;

    case 'essence':
      // Adiciona essência ao player
      newState.player = {
        ...newState.player,
        essence: Math.min(10, (newState.player?.essence || 0) + effectCard.effectValue)
      };
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

