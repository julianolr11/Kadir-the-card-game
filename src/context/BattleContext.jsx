import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import creaturesPool from '../assets/cards';
import { chooseAction } from '../logic/ai';
import { AppContext } from './AppContext';
import fieldChangeSfx from '../assets/sounds/effects/field-change.MP3';
import flipCardSfx from '../assets/sounds/effects/flipcard.MP3';
import battleMusic from '../assets/sounds/music/battle-music.mp3';
import * as effectRegistry from '../utils/effectRegistry';

export const BattleContext = createContext(null);

const drawFromDeck = (deck) => {
  if (!deck || deck.length === 0) return { card: null, nextDeck: [] };
  const next = [...deck];
  const card = next.shift();
  return { card, nextDeck: next };
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const sampleDeckFromPool = (size = 20) => {
  const pool = Array.isArray(creaturesPool) ? creaturesPool : [];
  const shuffled = shuffle(pool);
  const base = shuffled.slice(0, Math.min(size, shuffled.length));
  // duplica para formar deck simples de criaturas (efeitos/field vir├úo depois)
  const cards = base.map((c) => c.id || c.name || 'unknown');
  // Por enquanto o deck ├® apenas IDs de criaturas
  return shuffle(cards.concat(cards)).slice(0, size);
};

export function BattleProvider({ children }) {
  const { decks, cardCollection, effectsVolume, loadGuardianLoadout } = useContext(AppContext);
  const battleAudioRef = useRef(null);

  // Resolve habilidades selecionadas (2 slots) e aplica perk simples
  const resolveCreatureBuild = useCallback((creatureData) => {
    const loadout = loadGuardianLoadout ? loadGuardianLoadout(creatureData.id) : null;

    // Base stats
    const baseHp = creatureData.hp || 5;
    let atk = creatureData.atk || 2;
    let def = creatureData.def || 1;
    let hpBoost = 0;
    let shieldOnSummon = null; // { amount, duration }

    // Determina nível máximo desbloqueado a partir da coleção (para fallback de perk)
    const instances = cardCollection?.[creatureData.id] || [];
    const maxLevel = instances.length > 0 ? Math.max(...instances.map(i => i.level || 0)) : 0;

    // Seleciona perk: ou a do loadout ou a primeira desbloqueada por nível
    let selectedPerkId = loadout?.selectedPerk || null;
    if (!selectedPerkId) {
      const unlockedPerks = (Array.isArray(creatureData.unlockTable) ? creatureData.unlockTable : [])
        .filter(x => x.type === 'perk' && typeof x.level === 'number' && x.level <= maxLevel);
      if (unlockedPerks.length > 0) {
        selectedPerkId = unlockedPerks[0].id;
      }
    }

    // Aplica perks conhecidos
    switch (selectedPerkId) {
      case 'ATTACK_PLUS_1':
        atk += 1;
        break;
      case 'HP_PLUS_1':
        hpBoost += 1;
        break;
      case 'HP_PLUS_2':
        hpBoost += 2;
        break;
      case 'FIRST_ROUND_SHIELD':
        shieldOnSummon = { amount: 1, duration: 1 };
        break;
      case 'SHIELD_1_TURN':
      case 'SHIELD_ON_SUMMON_1':
        shieldOnSummon = { amount: 1, duration: 1 };
        break;
      default:
        break;
    }

    // Monta habilidades selecionadas (fallback: primeiras 2 habilidades básicas)
    let selectedAbilities = [];
    if (Array.isArray(loadout?.selectedSkills) && loadout.selectedSkills.length > 0) {
      const skillsPool = [
        ...(Array.isArray(creatureData.defaultSkills) ? creatureData.defaultSkills : []),
        ...(Array.isArray(creatureData.unlockTable) ? creatureData.unlockTable.filter(x => x.type === 'skill') : []),
      ];
      selectedAbilities = loadout.selectedSkills
        .map(skillId => skillsPool.find(s => s.id === skillId))
        // Filtra apenas habilidades cujo nível requerido foi desbloqueado (defaultSkills assumem nível 0)
        .filter((s) => {
          if (!s) return false;
          const required = typeof s.level === 'number' ? s.level : 0;
          return required <= maxLevel;
        })
        .slice(0, 2)
        .map((s) => ({
          name: s.name,
          cost: s.cost || 1,
          desc: s.desc,
          _skillId: s.id,
        }));
    }
    if (selectedAbilities.length === 0) {
      selectedAbilities = (creatureData.abilities || []).slice(0, 2);
    }

    const hp = baseHp + hpBoost;
    const maxHp = hp;
    return { atk, def, hp, maxHp, abilities: selectedAbilities, perkEffects: { shieldOnSummon } };
  }, [loadGuardianLoadout, cardCollection]);

  const playFieldChangeSound = useCallback(() => {
    try {
      if (!fieldChangeSfx) return;
      const audio = new Audio(fieldChangeSfx);
      audio.volume = (effectsVolume ?? 50) / 100;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('Erro ao tocar som de campo:', e);
    }
  }, [effectsVolume]);

  const playFlipCardSound = useCallback(() => {
    try {
      if (!flipCardSfx) return;
      const audio = new Audio(flipCardSfx);
      audio.volume = (effectsVolume ?? 50) / 100;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('Erro ao tocar som de carta:', e);
    }
  }, [effectsVolume]);

  const [state, setState] = useState({
    phase: 'idle', // 'idle' | 'coinflip' | 'playing' | 'ended'
    turn: 1,
    activePlayer: 'player', // 'player' | 'ai'
    creaturesInvokedThisTurn: 0, // Contador de criaturas invocadas no turno atual
    creaturesWithUsedAbility: new Set(), // Criaturas que já usaram habilidade este turno
    player: {
      orbs: 5,
      essence: 0,
      deck: [],
      hand: [],
      field: { slots: [null, null, null], effects: [null, null, null] },
      fieldGraveyard: [],
    },
    ai: {
      orbs: 5,
      essence: 0,
      deck: [],
      hand: [],
      field: { slots: [null, null, null], effects: [null, null, null] },
      fieldGraveyard: [],
    },
    sharedField: { active: false, id: null },
    log: [],
    animations: {},
    gameResult: null, // { winner: 'player' | 'ai', kills: [{ attacker: id, target: id }, ...], playerStats, aiStats }
    killFeed: [], // [{ turn, attacker, target }, ...]
    battleStats: {
      player: {
        cardsDrawn: [], // Cards que foram compradas para a mão
        cardsSummoned: [], // Cards que foram invocadas
        cardsKilled: [], // Cards que abateram inimigos
        cardsAssisted: [], // Cards que deram assistência (dano sem matar)
      },
      ai: {
        cardsDrawn: [],
        cardsSummoned: [],
        cardsKilled: [],
        cardsAssisted: [],
      },
    }
  });

  // Controla música de fundo da batalha
  useEffect(() => {
    if (state.phase === 'playing') {
      if (!battleAudioRef.current) {
        battleAudioRef.current = new Audio(battleMusic);
        battleAudioRef.current.loop = true;
        battleAudioRef.current.volume = 0.3;
      }
      battleAudioRef.current.play().catch(() => {});
    } else {
      if (battleAudioRef.current) {
        battleAudioRef.current.pause();
        battleAudioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (battleAudioRef.current) {
        battleAudioRef.current.pause();
        battleAudioRef.current = null;
      }
    };
  }, [state.phase]);

  const log = useCallback((msg) => {
    setState((s) => ({ ...s, log: [...s.log, msg] }));
  }, []);

  const pickFirstUserDeck = useCallback(() => {
    const ids = Object.keys(decks || {});
    if (ids.length === 0) return null;
    const first = decks[ids[0]];
    if (!first || !Array.isArray(first.cards) || first.cards.length === 0) return null;
    return first.cards;
  }, [decks]);

  const startBattle = useCallback((deckOverride = null) => {
    // Deck do jogador: selecionado pelo modal; sen├úo primeiro deck salvo; sen├úo amostra aleat├│ria
    const playerDeck = (Array.isArray(deckOverride) && deckOverride.length > 0)
      ? deckOverride
      : (pickFirstUserDeck() || sampleDeckFromPool(20));
    const aiDeck = sampleDeckFromPool(20);

    // Embaralhar e comprar m├úo inicial (4 cartas)
    const pShuffled = shuffle(playerDeck);
    const aShuffled = shuffle(aiDeck);
    let pDeck = [...pShuffled];
    let aDeck = [...aShuffled];
    const pHand = [];
    const aHand = [];
    for (let i = 0; i < 4; i += 1) {
      const d1 = drawFromDeck(pDeck); pDeck = d1.nextDeck; if (d1.card) pHand.push(d1.card);
      const d2 = drawFromDeck(aDeck); aDeck = d2.nextDeck; if (d2.card) aHand.push(d2.card);
    }

    setState({
      phase: 'coinflip',
      turn: 1,
      activePlayer: 'player',
      creaturesInvokedThisTurn: 0,
      player: { orbs: 5, essence: 0, deck: pDeck, hand: pHand, field: { slots: [null, null, null], effects: [null, null, null] }, graveyard: [], fieldGraveyard: [] },
      ai: { orbs: 5, essence: 0, deck: aDeck, hand: aHand, field: { slots: [null, null, null], effects: [null, null, null] }, graveyard: [], fieldGraveyard: [] },
      sharedField: { active: false, id: null },
      log: ['Batalha iniciada!'],
      gameResult: null,
      killFeed: [],
      battleStats: {
        player: {
          cardsDrawn: [...pHand], // Mão inicial
          cardsSummoned: [],
          cardsKilled: [],
          cardsAssisted: [],
        },
        ai: {
          cardsDrawn: [...aHand], // Mão inicial
          cardsSummoned: [],
          cardsKilled: [],
          cardsAssisted: [],
        },
      },
    });
  }, [pickFirstUserDeck]);

  const endTurn = useCallback(() => {
    setState((s) => {
      const currentSide = s.activePlayer;
      const nextActive = s.activePlayer === 'player' ? 'ai' : 'player';
      const nextTurn = s.turn + (nextActive === 'player' ? 1 : 0);

      let logEntries = [...s.log];

      // penalidade por finalizar turno sem criaturas
      const currentSnapshot = { ...s[currentSide] };
      const hasCreatures = currentSnapshot.field?.slots?.some(Boolean);
      if (!hasCreatures && currentSnapshot.orbs > 0) {
        currentSnapshot.orbs = Math.max(0, (currentSnapshot.orbs || 0) - 1);
        logEntries.push(`${currentSide === 'player' ? 'Voc├¬' : 'IA'} terminou sem criaturas. -1 orbe.`);
        // Verifica se o jogo acabou após perder orb
        if (currentSnapshot.orbs === 0) {
          const winner = currentSide === 'player' ? 'ai' : 'player';
          return {
            ...s,
            phase: 'ended',
            [currentSide]: currentSnapshot,
            gameResult: {
              winner,
              loser: currentSide,
              kills: s.killFeed,
            },
            log: [...logEntries, `⚰️ ${currentSide === 'player' ? 'Você perdeu' : 'IA perdeu'} todos os orbes! FIM DE JOGO!`],
          };
        }      }

      // compra 1 carta (limite de 7; overflow: volta para o deck e embaralha)
      const side = nextActive;
      const sideData = { ...(s[side]) };
      let { deck, hand, essence, field, orbs } = sideData;

      // +1 ess├¬ncia por turno, limite 10 padr├úo
      essence = Math.min(10, (essence || 0) + 1);

      // compra autom├ítica apenas para IA; o jogador compra manualmente no deck-draw
      if (side === 'ai') {
        playFlipCardSound(); // Som de flip quando IA compra
        const d = drawFromDeck(deck);
        deck = d.nextDeck;
        if (d.card) {
          if ((hand?.length || 0) >= 7) {
            deck = shuffle([d.card, ...deck]);
            log(`M├úo cheia (${side}). Carta devolvida ao baralho.`);
          } else {
            hand = [...hand, d.card];            // Registra carta comprada pela IA
            s.battleStats.ai.cardsDrawn = [...s.battleStats.ai.cardsDrawn, d.card];          }
        }
      }

      // Processa expiração de escudos por 1 turno em ambos os lados
      const processShieldTurns = (slots) => (slots || []).map((c) => {
        if (!c) return c;
        const turns = typeof c.shieldTurns === 'number' ? c.shieldTurns : 0;
        if (turns > 0) {
          const newTurns = turns - 1;
          return {
            ...c,
            shieldTurns: newTurns,
            shield: newTurns <= 0 ? 0 : c.shield,
          };
        }
        return c;
      });

      const playerSlots = processShieldTurns(s.player.field.slots);
      const aiSlots = processShieldTurns(s.ai.field.slots);

      // Processa status e buffs para o próximo lado (início do turno)
      const processSideStart = (curState, sideKey) => {
        let ns = { ...curState };
        const slots = ns[sideKey]?.field?.slots || [];
        let logs = [];
        slots.forEach((c) => {
          if (!c) return;
          const r1 = effectRegistry.processStatusEffects(ns, c.id);
          ns = r1.newState;
          logs = logs.concat(r1.log);
          const r2 = effectRegistry.processBuffs(ns, c.id);
          ns = r2.newState;
          logs = logs.concat(r2.log);
        });
        return { ns, logs };
      };

      const baseNextState = {
        ...s,
        activePlayer: nextActive,
        turn: nextTurn,
        player: { ...s.player, field: { ...s.player.field, slots: playerSlots } },
        ai: { ...s.ai, field: { ...s.ai.field, slots: aiSlots } },
        [currentSide]: { ...currentSnapshot },
        [side]: { ...s[side], deck, hand, essence, field, orbs },
      };
      const processed = processSideStart(baseNextState, side);

      return {
        ...processed.ns,
        creaturesInvokedThisTurn: 0, // Reseta contador de invocações para o próximo turno
        creaturesWithUsedAbility: new Set(), // Reseta criaturas que usaram habilidade
        log: [...logEntries, `Fim do turno de ${s.activePlayer}.`, ...processed.logs],
      };
    });
  }, [log]);

  const drawPlayerCard = useCallback(() => {
    playFlipCardSound();
    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'player') return s;

      const deck = [...(s.player.deck || [])];
      const hand = [...(s.player.hand || [])];

      if (deck.length === 0) return s;
      if (hand.length >= 7) return s;

      const d = drawFromDeck(deck);
      if (!d.card) return s;

      return {
        ...s,
        player: {
          ...s.player,
          deck: d.nextDeck,
          hand: [...hand, d.card],
        },        battleStats: {
          ...s.battleStats,
          player: {
            ...s.battleStats.player,
            cardsDrawn: [...s.battleStats.player.cardsDrawn, d.card],
          },
        },        log: [...s.log, 'Voc├¬ comprou uma carta.'],
      };
    });
  }, []);

  const summonFromHand = useCallback((index, slotIndex) => {
    playFlipCardSound();
    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'player') return s; // por enquanto s├│ jogador manual
      // Verifica se já invocou 1 criatura neste turno
      if ((s.creaturesInvokedThisTurn || 0) >= 1) {
        return {
          ...s,
          log: [...s.log, 'Você já invocou 1 criatura neste turno!'],
        };
      }
            const hand = [...s.player.hand];
      const cardId = hand[index];
      if (!cardId) return s;
      const slots = [...s.player.field.slots];
      if (slots[slotIndex]) return s; // slot ocupado

      // Extrai baseId se for instanceId
      let baseId = cardId;
      if (cardId.includes('-')) {
        // É um instanceId; busca o baseId na coleção
        for (const [base, instances] of Object.entries(cardCollection || {})) {
          if (instances.find(inst => inst.instanceId === cardId)) {
            baseId = base;
            break;
          }
        }
      }

      // Busca dados da criatura no creaturesPool usando baseId
      const creatureData = creaturesPool.find(c => c.id === baseId);
      if (!creatureData) {
        console.warn(`Criatura ${baseId} não encontrada no pool`);
        return s;
      }

      // Resolve build com perks e loadout
      const build = resolveCreatureBuild(creatureData);

      // Cria estrutura completa da criatura
      const creature = {
        id: cardId, // Mantém o instanceId original para identificação única
        name: creatureData.name?.pt || creatureData.name?.en || baseId,
        element: creatureData.element || 'puro',
        hp: build.hp,
        maxHp: build.maxHp,
        atk: build.atk,
        def: build.def,
        abilities: build.abilities,
        buffs: [],
        debuffs: [],
        shield: build.perkEffects?.shieldOnSummon?.amount || 0,
        shieldTurns: build.perkEffects?.shieldOnSummon?.duration || 0,
        statusEffects: [],
      };

      slots[slotIndex] = creature;
      hand.splice(index, 1);
      return {
        ...s,
        creaturesInvokedThisTurn: (s.creaturesInvokedThisTurn || 0) + 1,
        player: {
          ...s.player,
          hand,
          field: { ...s.player.field, slots },
        },
        battleStats: {
          ...s.battleStats,
          player: {
            ...s.battleStats.player,
            cardsSummoned: [...s.battleStats.player.cardsSummoned, cardId],
          },
        },
        log: [...s.log, `Invocou ${creature.name} no slot ${slotIndex + 1}.`],
      };
    });
  }, [resolveCreatureBuild, cardCollection]);


  // Invoca carta de campo (field) para o sharedField

  const invokeFieldCard = useCallback((handIndex) => {
    playFieldChangeSound();
    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'player') return s;

      const hand = [...s.player.hand];
      const cardId = hand[handIndex];
      if (!cardId) return s;
      // Deriva flag de holo se vier de instância
      let isHolo = false;
      if (cardCollection) {
        if (cardId.includes('-')) {
          for (const [baseId, instances] of Object.entries(cardCollection)) {
            const inst = instances.find((x) => x.instanceId === cardId);
            if (inst) { isHolo = !!inst.isHolo; break; }
          }
        } else if (Array.isArray(cardCollection[cardId]) && cardCollection[cardId].length > 0) {
          isHolo = !!cardCollection[cardId][0].isHolo;
        }
      }
      // Resolve dados da carta de campo
      let cardData = null;
      try {
        const fieldCards = require('../assets/cards/field/exampleFieldCards').default;
        cardData = fieldCards.find((c) => c.id === cardId || c.legacyId === cardId) || null;
      } catch (e) {
        cardData = null;
      }
      // Remove carta da mão
      hand.splice(handIndex, 1);
      // Substitui campo anterior (se houver) e envia para o cemitério de campos
      let newFieldGraveyard = Array.isArray(s.player.fieldGraveyard) ? [...s.player.fieldGraveyard] : [];
      if (s.sharedField?.active && s.sharedField?.id) {
        newFieldGraveyard.push({
          id: s.sharedField.id,
          isHolo: s.sharedField.isHolo,
          cardData: s.sharedField.cardData,
        });
      }
      return {
        ...s,
        player: {
          ...s.player,
          hand,
          fieldGraveyard: newFieldGraveyard,
        },
        sharedField: {
          active: true,
          id: cardId,
          isHolo,
          cardData,
        },
        log: [...s.log, `Campo ${cardId} foi invocado!`],
      };
    });
  }, [playFieldChangeSound]);

  // Invoca carta de campo da IA para o sharedField
  const invokeFieldCardAI = useCallback((handIndex) => {
    playFieldChangeSound();
    setState((s) => {
      if (s.phase !== 'playing') return s;

      const hand = [...s.ai.hand];
      const cardId = hand[handIndex];
      if (!cardId) return s;
      let cardData = null;
      try {
        const fieldCards = require('../assets/cards/field/exampleFieldCards').default;
        cardData = fieldCards.find((c) => c.id === cardId || c.legacyId === cardId) || null;
      } catch (e) {
        cardData = null;
      }
      // Remove carta da mão
      hand.splice(handIndex, 1);
      // Substitui campo anterior (se houver) e envia para o cemitério de campos
      let newFieldGraveyard = Array.isArray(s.ai.fieldGraveyard) ? [...s.ai.fieldGraveyard] : [];
      if (s.sharedField?.active && s.sharedField?.id) {
        newFieldGraveyard.push({
          id: s.sharedField.id,
          isHolo: s.sharedField.isHolo,
          cardData: s.sharedField.cardData,
        });
      }
      return {
        ...s,
        ai: {
          ...s.ai,
          hand,
          fieldGraveyard: newFieldGraveyard,
        },
        sharedField: {
          active: true,
          id: cardId,
          isHolo: false,
          cardData,
        },
        log: [...s.log, `IA invocou o campo ${cardId}!`],
      };
    });
  }, [playFieldChangeSound]);

  // ===== SISTEMA DE HABILIDADES =====
  const useAbility = useCallback((playerSide, slotIndex, abilityIndex, targetSide, targetSlotIndex) => {
    const clearAnimAfter = (creatureId, timeoutMs = 900) => {
      setTimeout(() => {
        setState((s2) => {
          const anims = { ...(s2.animations || {}) };
          if (anims[creatureId]) {
            delete anims[creatureId];
          }
          return { ...s2, animations: anims };
        });
      }, timeoutMs);
    };

    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== playerSide) return s; // Só pode usar habilidade no seu turno

      const attacker = s[playerSide].field.slots[slotIndex];
      if (!attacker || attacker.hp <= 0) return s;

      // Verifica se a criatura já usou uma habilidade este turno
      if (s.creaturesWithUsedAbility && s.creaturesWithUsedAbility.has(attacker.id)) {
        return {
          ...s,
          log: [...s.log, `${attacker.name} já usou uma habilidade neste turno!`],
        };
      }

      // Bloqueia ação se incapacitado
      const incapacitating = (attacker.statusEffects || []).some(e => ['paralyze', 'freeze', 'sleep'].includes(e.type) && e.duration > 0);
      if (incapacitating) {
        return { ...s, log: [...s.log, `${attacker.name} está incapacitado e não pode agir.`] };
      }

      const ability = attacker.abilities[abilityIndex];
      if (!ability) return s;

      // Valida custo de essência
      const essence = s[playerSide].essence || 0;
      const cost = ability.cost || 0;
      if (essence < cost) {
        return {
          ...s,
          log: [...s.log, `Essência insuficiente! Necessário: ${cost}, Disponível: ${essence}`],
        };
      }

      // Encontra criatura alvo
      const target = s[targetSide].field.slots[targetSlotIndex];
      if (!target || target.hp <= 0) {
        return {
          ...s,
          log: [...s.log, 'Alvo inválido!'],
        };
      }

      // Usa IDs das criaturas instanciadas
      const attackerId = attacker.id;
      const targetId = target.id;

      // Parsing simples de efeitos pela descrição
      const descText = (ability.desc?.pt || ability.desc?.en || '').toLowerCase();
      const mappings = [
        { key: 'venen', type: 'poison', duration: 2, value: 1 },
        { key: 'poison', type: 'poison', duration: 2, value: 1 },
        { key: 'queim', type: 'burn', duration: 2, value: 1 },
        { key: 'burn', type: 'burn', duration: 2, value: 1 },
        { key: 'congel', type: 'freeze', duration: 1 },
        { key: 'freeze', type: 'freeze', duration: 1 },
        { key: 'paralis', type: 'paralyze', duration: 1 },
        { key: 'stun', type: 'paralyze', duration: 1 },
        { key: 'sono', type: 'sleep', duration: 2 },
        { key: 'sleep', type: 'sleep', duration: 2 },
        { key: 'sangr', type: 'bleed', duration: 2, value: 1 },
        { key: 'bleed', type: 'bleed', duration: 2, value: 1 },
      ];
      const match = mappings.find(m => descText.includes(m.key));
      let result;
      let animPayload = null;

      // SEMPRE aplica dano base
      const baseDamage = ability.cost * 2 + 1; // Fórmula temporária: custo * 2 + 1
      result = effectRegistry.applyDamage(s, {
        attackerId,
        targetId,
        baseDamage,
        attackerElement: attacker.element,
        ignoreShield: false,
      });

      // Marca a criatura como tendo usado uma habilidade neste turno
      const updatedUsedAbilities = new Set(s.creaturesWithUsedAbility || []);
      updatedUsedAbilities.add(attackerId);

      // PASSO 1: Mostra animação de ataque no atacante
      const stateWithAttackAnim = {
        ...s,
        animations: {
          ...(s.animations || {}),
          [attackerId]: { type: 'attacking' },
        },
      };

      // Remove animação do atacante após 400ms
      setTimeout(() => {
        setState((s2) => {
          const anims = { ...(s2.animations || {}) };
          if (anims[attackerId]?.type === 'attacking') {
            delete anims[attackerId];
          }
          return { ...s2, animations: anims };
        });
      }, 400);

      // PASSO 2: Após delay, aplica dano e mostra animação de dano
      setTimeout(() => {
        setState((s2) => {
          animPayload = {
            type: 'damage',
            amount: result.damageDealt,
            hasAdvantage: !!result.hasAdvantage,
            hasDisadvantage: !!result.hasDisadvantage,
            shieldHit: !!result.shieldHit,
            shieldBroken: !!result.shieldBroken,
          };

          // Se tiver status effect na descrição, aplica também
          if (match) {
            console.log('Aplicando status effect adicional:', match.type);
            const statusResult = effectRegistry.applyStatusEffect(result.newState, {
              targetId,
              effectType: match.type,
              duration: match.duration,
              value: match.value,
            });
            result.newState = statusResult.newState;
            result.log = [...result.log, ...statusResult.log];
          }

          // Deduz essência e aplica animação de dano
          const stateWithDamage = {
            ...result.newState,
            creaturesWithUsedAbility: updatedUsedAbilities,
            [playerSide]: {
              ...result.newState[playerSide],
              essence: essence - cost,
            },
            log: [
              ...result.newState.log,
              `${attacker.name} usou ${ability.name?.pt || ability.name?.en || 'habilidade'} (custo: ${cost})`,
              ...result.log,
            ],
            animations: {
              ...(s2.animations || {}),
              ...(animPayload ? { [targetId]: animPayload } : {}),
            },
          };

          // Remove animação de dano após 900ms
          clearAnimAfter(targetId, 900);

          // PASSO 3: Se a criatura morreu, adiciona delay antes da animação de morte
          if (result.died) {
            const targetCreature = stateWithDamage[targetSide].field.slots.find(slot => slot?.id === targetId);
            if (targetCreature) {
              // Delay adicional antes da animação de morte
              setTimeout(() => {
                setState((s3) => {
                  // Adiciona animação de morte
                  const stateWithDeath = {
                    ...s3,
                    animations: {
                      ...(s3.animations || {}),
                      [targetId]: { death: true },
                    },
                  };

                  // Aguarda 600ms (duração da animação de morte) para remover do campo
                  setTimeout(() => {
                    setState((s4) => {
                      const updated = { ...s4 };
                      updated[targetSide].field.slots = updated[targetSide].field.slots.map(slot => slot?.id === targetId ? null : slot);
                      return updated;
                    });
                  }, 600);

                  return stateWithDeath;
                });
              }, 400); // Delay de 400ms antes da animação de morte

              // Prepara estado final (sem remover do campo ainda)
              stateWithDamage[targetSide].graveyard = [...(stateWithDamage[targetSide].graveyard || []), targetCreature];
              stateWithDamage[targetSide].orbs = Math.max(0, (stateWithDamage[targetSide].orbs || 5) - 1);

              // Adiciona ao killFeed
              stateWithDamage.killFeed = [...(stateWithDamage.killFeed || []), {
                turn: stateWithDamage.turn,
                attacker: attacker?.name || 'Atacante',
                attackerId,
                target: targetCreature.name,
                targetId: targetCreature.id,
                hadAdvantage: !!result.hasAdvantage,
              }];

              // Registra o kill nas estatísticas
              stateWithDamage.battleStats = {
                ...stateWithDamage.battleStats,
                [playerSide]: {
                  ...stateWithDamage.battleStats[playerSide],
                  cardsKilled: [...stateWithDamage.battleStats[playerSide].cardsKilled, attackerId],
                },
              };

              stateWithDamage.log.push(`${targetCreature.name} foi derrotado! ${stateWithDamage[targetSide].orbs === 0 ? '⚰️ FIM DE JOGO!' : '⚰️ -1 orbe'}`);

              // Verifica se o jogo acabou
              if (stateWithDamage[targetSide].orbs === 0) {
                const winner = targetSide === 'ai' ? 'player' : 'ai';
                stateWithDamage.phase = 'ended';
                stateWithDamage.gameResult = {
                  winner,
                  loser: targetSide,
                  kills: stateWithDamage.killFeed,
                  turns: stateWithDamage.turn,
                  stats: stateWithDamage.battleStats,
                };
              }
            }
          }

          return stateWithDamage;
        });
      }, 300); // Delay de 300ms antes de aplicar o dano

      // Retorna estado inicial com animação de ataque
      return stateWithAttackAnim;
    });
  }, []);

  const value = useMemo(() => ({
    state,
    startBattle,
    endTurn,
    drawPlayerCard,
    summonFromHand,
    invokeFieldCard,
    invokeFieldCardAI,
    useAbility,
    log,
    startPlaying: (firstPlayer) => {
      setState(s => ({
        ...s,
        phase: 'playing',
        activePlayer: firstPlayer === 'player' ? 'player' : 'ai',
      }));
    },
  }), [state, startBattle, endTurn, drawPlayerCard, summonFromHand, invokeFieldCard, invokeFieldCardAI, useAbility, log]);

  const performAiTurn = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'ai') return s;

      let hand = [...s.ai.hand];
      let slots = [...s.ai.field.slots];
      let updated = false;
      let logEntries = [...s.log];

      // PRIORIDADE 1: Verifica se há criaturas da IA que podem atacar
      const aiCreaturesWithAbilities = slots.map((slot, i) => {
        if (!slot || slot.hp <= 0) return null;
        // Verifica se está incapacitado
        const incapacitating = (slot.statusEffects || []).some(e => ['paralyze', 'freeze', 'sleep'].includes(e.type) && e.duration > 0);
        if (incapacitating) return null;
        // Verifica se tem habilidades
        if (!slot.abilities || slot.abilities.length === 0) return null;
        return { slotIndex: i, creature: slot };
      }).filter(Boolean);

      // Se houver criaturas que podem atacar E inimigos para atacar
      const enemyCreatures = s.player.field.slots.map((slot, i) => {
        if (!slot || slot.hp <= 0) return null;
        return { slotIndex: i, creature: slot };
      }).filter(Boolean);

      if (aiCreaturesWithAbilities.length > 0 && enemyCreatures.length > 0) {
        // Escolhe uma criatura aleatória da IA para atacar
        const attacker = aiCreaturesWithAbilities[Math.floor(Math.random() * aiCreaturesWithAbilities.length)];
        // Escolhe um inimigo aleatório
        const target = enemyCreatures[Math.floor(Math.random() * enemyCreatures.length)];
        // Escolhe uma habilidade aleatória
        const abilityIndex = Math.floor(Math.random() * attacker.creature.abilities.length);

        // Usa a habilidade (vai fazer ataque dentro do setState)
        // Precisamos chamar useAbility aqui, mas é complexo porque está dentro de performAiTurn
        // Solução: retornamos o state normalmente e deixamos que o useAbility seja chamado depois
        logEntries = [...logEntries, `IA está preparando um ataque com ${attacker.creature.name}!`];

        // Armazena a intenção de ataque para processar depois
        return {
          ...s,
          aiPendingAttack: {
            attackerSlot: attacker.slotIndex,
            targetSlot: target.slotIndex,
            abilityIndex,
          },
          log: logEntries,
        };
      }

      // PRIORIDADE 2: Verifica se há cartas de campo na mão da IA
      const fieldCardIndex = hand.findIndex((cardId) => cardId && (/^f\d{3}$/i.test(cardId) || String(cardId).toLowerCase().startsWith('field_')));

      if (fieldCardIndex >= 0) {
        // IA tem uma carta de campo, invoca ela no sharedField (sobrescreve a anterior)
        const cardId = hand[fieldCardIndex];
        hand.splice(fieldCardIndex, 1);
        logEntries = [...logEntries, `IA invocou o campo ${cardId}!`];

        return {
          ...s,
          ai: {
            ...s.ai,
            hand,
          },
          sharedField: {
            active: true,
            id: cardId,
          },
          log: logEntries,
        };
      }

      // PRIORIDADE 3: Se nao tem carta de campo, invoca criaturas (máximo 1 por turno)
      const action = chooseAction(s);
      const emptyIndex = slots.findIndex((slot) => !slot);
      const canInvokeCreature = (s.creaturesInvokedThisTurn || 0) < 1;

      if (canInvokeCreature && action?.type === 'summon' && typeof action.handIndex === 'number' && typeof action.slotIndex === 'number') {
        const { handIndex, slotIndex } = action;
        if (hand[handIndex] && !slots[slotIndex]) {
          const cardId = hand[handIndex];
          hand.splice(handIndex, 1);
          const creatureData = creaturesPool.find(c => c.id === cardId) || {};
          const build = resolveCreatureBuild(creatureData);
          const instanceId = `${cardId}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
          slots[slotIndex] = {
            id: instanceId,
            name: creatureData.name?.pt || creatureData.name?.en || cardId,
            element: creatureData.element || 'puro',
            hp: build.hp,
            maxHp: build.maxHp,
            atk: build.atk,
            def: build.def,
            abilities: build.abilities,
            buffs: [],
            debuffs: [],
            shield: build.perkEffects?.shieldOnSummon?.amount || 0,
            shieldTurns: build.perkEffects?.shieldOnSummon?.duration || 0,
            statusEffects: [],
          };
          updated = true;
          logEntries = [...logEntries, `IA invocou ${cardId} no slot ${slotIndex + 1}.`];
          // Registra invocação nas estatísticas
          s.battleStats.ai.cardsSummoned = [...s.battleStats.ai.cardsSummoned, cardId];
        }
      } else if (emptyIndex >= 0 && hand.length > 0 && canInvokeCreature) {
        const cardId = hand.shift();
        const creatureData = creaturesPool.find(c => c.id === cardId) || {};
        const build = resolveCreatureBuild(creatureData);
        const instanceId = `${cardId}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        slots[emptyIndex] = {
          id: instanceId,
          name: creatureData.name?.pt || creatureData.name?.en || cardId,
          element: creatureData.element || 'puro',
          hp: build.hp,
          maxHp: build.maxHp,
          atk: build.atk,
          def: build.def,
          abilities: build.abilities,
          buffs: [],
          debuffs: [],
          shield: build.perkEffects?.shieldOnSummon?.amount || 0,
          shieldTurns: build.perkEffects?.shieldOnSummon?.duration || 0,
          statusEffects: [],
        };
        updated = true;
        logEntries = [...logEntries, `IA invocou ${cardId} no slot ${emptyIndex + 1}.`];
        // Registra invocação nas estatísticas
        s.battleStats.ai.cardsSummoned = [...s.battleStats.ai.cardsSummoned, cardId];
      } else {
        logEntries = [...logEntries, 'IA nao fez acao.'];
      }

      if (!updated) {
        return { ...s, log: logEntries };
      }

      return {
        ...s,
        creaturesInvokedThisTurn: (s.creaturesInvokedThisTurn || 0) + 1,
        ai: {
          ...s.ai,
          hand,
          field: { ...s.ai.field, slots },
        },
        log: logEntries,
      };
    });

    // Entrega o turno de volta para o jogador apos a acao da IA (com delay adicional)
    setTimeout(() => {
      endTurn();
    }, 800);
  }, [endTurn]);

  useEffect(() => {
    if (state.phase === 'playing' && state.activePlayer === 'ai') {
      // Adiciona delay de 1.5s antes da IA agir
      const aiDelayTimer = setTimeout(() => {
        performAiTurn();
      }, 1500);
      return () => clearTimeout(aiDelayTimer);
    }
  }, [state.phase, state.activePlayer, performAiTurn]);

  // Processa ataque pendente da IA

  useEffect(() => {
    if (state.aiPendingAttack && state.phase === 'playing' && state.activePlayer === 'ai') {
      const attackTimer = setTimeout(() => {
        useAbility('ai', state.aiPendingAttack.attackerSlot, state.aiPendingAttack.abilityIndex, 'player', state.aiPendingAttack.targetSlot);
        setState(s => ({
          ...s,
          aiPendingAttack: null,
        }));
      }, 500);
      return () => clearTimeout(attackTimer);
    }
  }, [state.aiPendingAttack, state.phase, state.activePlayer, useAbility]);

  // <-- FECHAMENTO DE BLOCO ADICIONADO CASO FALTANDO

  return (
    <BattleContext.Provider value={value}>{children}</BattleContext.Provider>
  );
}

export const useBattle = () => React.useContext(BattleContext);
