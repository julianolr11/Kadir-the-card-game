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
const { getElementModifier } = require('../utils/effectRegistry');

/**
 * Nível de "inteligência" da IA nesta batalha, de 0 (torre iniciante) a 10 (topo da torre).
 * Reaproveita a mesma escala já usada para liberar cartas/perks do oponente (campaignBuildLevel),
 * então a IA fica mais esperta exatamente na mesma cadência em que fica mais forte em stats -
 * distribuindo a dificuldade ao longo dos 11 níveis de cada torre em vez de ser sempre igual.
 * Fora da campanha (partida rápida / PvP local contra bot) usa um nível fixo médio-alto.
 */
export function resolveAiDifficulty(battleState) {
  if (battleState?.ai?.campaignOpponent) {
    if (Number.isFinite(battleState.ai.campaignAiDifficulty)) {
      return Math.max(0, Math.min(10, battleState.ai.campaignAiDifficulty));
    }
    const level = Number.isFinite(battleState.ai.campaignBuildLevel) ? battleState.ai.campaignBuildLevel : 0;
    return Math.max(0, Math.min(10, level));
  }
  return 7;
}

/**
 * Escolhe ação principal da IA com heurísticas de invocação.
 * - Prioriza invocar criatura quando estiver com muitas cartas e poucas criaturas.
 * - Escolhe o melhor monstro da mão considerando atk/hp, vantagem elemental contra o campo
 *   inimigo atual e afinidade de campo compartilhado.
 * - Em dificuldades baixas, adiciona ruído à pontuação (a IA "erra" escolhas com mais frequência
 *   nos primeiros níveis da torre); em dificuldades altas a escolha é quase sempre a ótima.
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
    const difficulty = resolveAiDifficulty(s);
    // Ruído aleatório somado à pontuação de cada candidato: forte em dificuldade 0, quase nulo em 10.
    const noiseAmplitude = Math.max(0, 3 - difficulty * 0.28);

    // If AI has many cards in hand (>=6) and few creatures (<=1), prioritize summoning
    const handThreshold = 6;
    // detect field/effect cards in hand
    const fieldCardIndex = hand.findIndex((c) => c && (/^f\d{3}$/i.test(c) || String(c).toLowerCase().startsWith('field_')));
    const effectCardIndex = hand.findIndex((c) => c && String(c).toLowerCase().startsWith('effect_'));

    const scoreCandidate = (creatureDef) => {
      const atk = typeof creatureDef.atk === 'number' ? creatureDef.atk : (creatureDef.attack || 2);
      const hp = typeof creatureDef.hp === 'number' ? creatureDef.hp : (creatureDef.maxHp || 5);
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
          // Vantagem/desvantagem elemental (mesma tabela usada no cálculo de dano real) - uma
          // criatura que "come" o campo inimigo vale bem mais que uma simplesmente mais forte.
          const { hasAdvantage, hasDisadvantage } = getElementModifier(creatureDef.element, e.element);
          if (hasAdvantage) score += 2.5;
          if (hasDisadvantage) score -= 2.5;
          // small bonus for elemental affinity if sharedField exists
          try {
            const field = s.sharedField && s.sharedField.cardData ? s.sharedField.cardData : (s.sharedField || {});
            const aff = getFieldAffinityBonus(field, creatureDef);
            score += (aff.bonusDano || 0) * 0.8 + (aff.bonusHP || 0) * 0.5;
          } catch (err) {}
        });
      }
      // Ruído: soma um valor aleatório (positivo ou negativo) proporcional à amplitude definida
      // pela dificuldade - simula decisões menos refinadas nos primeiros níveis da torre.
      score += (Math.random() * 2 - 1) * noiseAmplitude;
      return score;
    };

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

        const score = scoreCandidate(creatureDef);
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

        // Campo cheio (nenhum slot vazio) - não retorna 'summon' com slotIndex -1: performAiTurn
        // faz `slots[slotIndex] = criatura`, e como -1 não é um índice válido de array em JS
        // isso criava uma propriedade "-1" na criatura (invisível nos 3 slots renderizados) em
        // vez de bloquear a invocação - a criatura "fantasma" ainda disparava som e bênção de
        // invocação mesmo com o campo visivelmente cheio (bug reportado pelo usuário).
        if (preferredSlot === -1) return { type: 'pass' };

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
      const score = scoreCandidate(creatureDef);
      if (!best || score > best.score) {
        best = { score, handIndex: i, baseId, creatureDef };
      }
    }

    if (best) {
      // Decision rules for timing
      // - If AI has fewer creatures than enemy, prefer to summon
      if (enemyCreatures.length > aiCreatureCount) {
        // Mesmo bug do bloco acima: `findIndex(...) || 0` trocava -1 (campo cheio) por 0
        // incorretamente (-1 é truthy em JS, então `|| 0` nunca disparava).
        const preferredSlot = slots.findIndex(s => !s);
        if (preferredSlot !== -1) {
          return { type: 'summon', handIndex: best.handIndex, slotIndex: preferredSlot };
        }
      }

      // - If the best candidate has positive score (favorable matchup), summon
      if (best.score > 0.5) {
        const preferredSlot = slots.findIndex(s => !s);
        if (preferredSlot !== -1) {
          return { type: 'summon', handIndex: best.handIndex, slotIndex: preferredSlot };
        }
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

// Tipos de carta de efeito que a IA sabe usar sozinha: nenhum deles precisa de seleção manual de
// alvo (compram/curam/blindam o próprio lado, ou atingem todo o campo inimigo de uma vez), então
// dá pra decidir e resolver tudo automaticamente sem reaproveitar o fluxo de targeting feito pra
// jogador humano (Ilusão de Teatro, Sepultura do Espectro, trocas e afins continuam de fora).
const SAFE_AI_EFFECT_TYPES = new Set(['draw', 'essence', 'heal', 'shieldAll', 'damageAll', 'destroyAll']);

/**
 * Decide se vale a pena jogar alguma carta de efeito "sem alvo" da mão da IA agora, e qual.
 * Cada tipo tem sua própria heurística de valor (ex: cura só importa com orbes baixos, Frasco do
 * Vazio só compensa com o campo inimigo cheio). Em dificuldades baixas a IA só age em oportunidades
 * muito óbvias (limiar de pontuação alto); em dificuldades altas aproveita qualquer vantagem.
 * @returns {{handIndex:number, card:object, score:number}|null}
 */
export function chooseAiEffectCardPlay(battleState, difficulty = 0) {
  try {
    const s = battleState;
    const hand = Array.isArray(s?.ai?.hand) ? s.ai.hand : [];
    if (hand.length === 0) return null;

    const effectCards = require('../assets/cards/effectCards');
    const candidates = [];
    hand.forEach((cardId, handIndex) => {
      if (!cardId || !String(cardId).toLowerCase().startsWith('effect_')) return;
      const card = effectCards.find((c) => c.id === cardId);
      if (!card || !SAFE_AI_EFFECT_TYPES.has(card.effectType)) return;
      candidates.push({ handIndex, card });
    });
    if (candidates.length === 0) return null;

    const aiCreatures = (s.ai?.field?.slots || []).filter(Boolean);
    const playerCreatures = (s.player?.field?.slots || []).filter(Boolean);
    const aiOrbs = Number.isFinite(s.ai?.orbs) ? s.ai.orbs : 5;
    const aiHandSize = hand.length;

    let best = null;
    candidates.forEach(({ handIndex, card }) => {
      let score = 0;
      switch (card.effectType) {
        case 'draw':
          // Ramp de cartas: valioso com mão curta, sem sentido perto do limite de 7.
          score = aiHandSize <= 4 ? 6 : 1;
          break;
        case 'essence':
          score = 5; // essência grátis é sempre boa, mas não urgente
          break;
        case 'heal':
          // Vida (orbes) é crítica perto da derrota (máximo 5 orbes).
          score = aiOrbs <= 2 ? 20 : (aiOrbs <= 3 ? 8 : 0);
          break;
        case 'shieldAll':
          // Só compensa havendo criaturas em campo pra proteger.
          score = aiCreatures.length > 0 ? 4 + aiCreatures.length * 2 : 0;
          break;
        case 'damageAll':
          // Meteoro Final: melhor com vários alvos inimigos no campo.
          score = playerCreatures.length * 6;
          break;
        case 'destroyAll':
          // Frasco do Vazio é forte demais pra desperdiçar contra 1 alvo só.
          score = playerCreatures.length >= 2 ? 10 + playerCreatures.length * 8
            : (playerCreatures.length === 1 ? 2 : 0);
          break;
        default:
          score = 0;
      }
      if (score > 0 && (!best || score > best.score)) {
        best = { handIndex, card, score };
      }
    });

    if (!best) return null;

    // Nos primeiros níveis a IA só usa cartas de efeito muito obviamente boas; no topo da torre
    // aproveita qualquer oportunidade positiva.
    const threshold = Math.max(1, 9 - difficulty);
    if (best.score < threshold) return null;

    return best;
  } catch (e) {
    console.warn('chooseAiEffectCardPlay error', e);
    return null;
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
      try {
        const { applyDamage } = require('../utils/effectRegistry');
        if (newState.ai?.field?.slots && Array.isArray(newState.ai.field.slots)) {
          const animations = {};
          let accumulatedLog = [];
          let currState = newState;
          for (let i = 0; i < (currState.ai.field.slots || []).length; i += 1) {
            const creature = currState.ai.field.slots[i];
            if (!creature) continue;
            const targetId = creature.id;
            const res = applyDamage(currState, {
              attackerId: effectCard.id || 'effect',
              targetId,
              baseDamage: effectCard.effectValue || 0,
              attackerElement: effectCard.element || 'puro',
              ignoreShield: false,
            });
            // use the returned newState for next iterations
            currState = res.newState;
            accumulatedLog = [...accumulatedLog, ...res.log];
            animations[targetId] = {
              type: 'damage',
              amount: res.damageDealt,
              hasAdvantage: !!res.hasAdvantage,
              hasDisadvantage: !!res.hasDisadvantage,
              shieldHit: !!res.shieldHit,
              shieldBroken: !!res.shieldBroken,
              attackerId: effectCard.id || null,
              // Final Meteor: mostra o meteoro caindo primeiro, só revela o número/flash de dano
              // depois que ele "impacta" na tela (ver BattleContext.jsx, ~900ms).
              hitPending: effectCard.id === 'effect_final_meteor',
            };
          }
          currState.log = [...(currState.log || []), ...accumulatedLog];
          // Attach animations payload so BattleContext can schedule clearing/removals
          currState.animations = { ...(currState.animations || {}), ...animations };
          newState = currState;
        }
      } catch (e) {
        console.warn('damageAll execution failed', e);
      }
      break;

    case 'destroyAll':
      // Manda todos os monstros inimigos ao cemitério - a Calamidade não tem baralho/mão de
      // verdade e é sempre o único ocupante do slot ai[0]; mandá-la pro cemitério direto faz o
      // chefe sumir sem a vitória disparar (a luta trava). Bloqueado nesse modo.
      if (newState.mode === 'calamity') {
        if (!newState.log) newState.log = [];
        newState.log.push('A Calamidade é imune a esse efeito - só cai lutando!');
      } else if (newState.ai?.field?.slots && Array.isArray(newState.ai.field.slots)) {
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

    case 'control': {
      // Toma o controle de uma criatura inimiga por N turnos: ela realmente muda de lado
      // (sai do campo da IA e entra no campo do jogador), para que o jogador consiga
      // de fato usar as habilidades dela como se fosse sua. Volta ao dono original
      // automaticamente quando a duração expira (ver endTurn em BattleContext.jsx).
      const capturedCreature = newState.ai?.field?.slots?.[targetInfo?.enemyIndex];
      const freeSlotIndex = newState.player?.field?.slots?.findIndex((slot) => !slot);
      if (newState.mode === 'calamity' && capturedCreature?.isCalamityBoss) {
        if (!newState.log) newState.log = [];
        newState.log.push('A Calamidade é imune a esse efeito - só cai lutando!');
      } else if (targetInfo && capturedCreature) {
        if (freeSlotIndex !== undefined && freeSlotIndex !== -1) {
          newState.ai.field.slots[targetInfo.enemyIndex] = null;
          newState.player.field.slots[freeSlotIndex] = {
            ...capturedCreature,
            controlledBy: 'ai',
            controlOriginSlot: targetInfo.enemyIndex,
            controlDuration: effectCard.duration,
          };
        } else {
          // Ilusão de Teatro sem slot livre: em vez de bloquear o efeito, permite um único
          // ataque "ilusório" com a criatura inimiga (igual ao ataque espectral do cemitério).
          // A criatura nunca sai de fato do campo do adversário - só ataca uma vez e volta.
          newState.controlAttackPending = {
            creatureIndex: targetInfo.enemyIndex,
            creature: capturedCreature,
          };
        }
      }
      break;
    }

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

    case 'immunity': {
      // Carta de efeito "Imunidade": bloqueia dano e novos debuffs numa criatura aliada por N
      // turnos (ver applyDamage/applyStatusEffect em effectRegistry.js - checam statusEffects
      // por type:'immune').
      const target = newState.player?.field?.slots?.[targetInfo?.allyIndex];
      if (targetInfo && target) {
        const { applyStatusEffect } = require('../utils/effectRegistry');
        const result = applyStatusEffect(newState, {
          targetId: target.id,
          effectType: 'immune',
          duration: effectCard.duration,
          value: null,
          attackerId: null,
        });
        newState = result.newState;
      }
      break;
    }

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
