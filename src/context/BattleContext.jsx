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
    phase: 'idle', // 'idle' | 'coinflip' | 'playing'
    turn: 1,
    activePlayer: 'player', // 'player' | 'ai'
    player: {
      orbs: 5,
      essence: 0,
      deck: [],
      hand: [],
      field: { slots: [null, null, null], effects: [null, null, null] },
    },
    ai: {
      orbs: 5,
      essence: 0,
      deck: [],
      hand: [],
      field: { slots: [null, null, null], effects: [null, null, null] },
    },
    sharedField: { active: false, id: null },
    log: [],
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
      player: { orbs: 5, essence: 0, deck: pDeck, hand: pHand, field: { slots: [null, null, null], effects: [null, null, null] } },
      ai: { orbs: 5, essence: 0, deck: aDeck, hand: aHand, field: { slots: [null, null, null], effects: [null, null, null] } },
      sharedField: { active: false, id: null },
      log: ['Batalha iniciada!'],
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
      }

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
            hand = [...hand, d.card];
          }
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
        },
        log: [...s.log, 'Voc├¬ comprou uma carta.'],
      };
    });
  }, []);

  const summonFromHand = useCallback((index, slotIndex) => {
    playFlipCardSound();
    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'player') return s; // por enquanto s├│ jogador manual
      const hand = [...s.player.hand];
      const cardId = hand[index];
      if (!cardId) return s;
      const slots = [...s.player.field.slots];
      if (slots[slotIndex]) return s; // slot ocupado

      // Busca dados da criatura no creaturesPool
      const creatureData = creaturesPool.find(c => c.id === cardId);
      if (!creatureData) {
        console.warn(`Criatura ${cardId} não encontrada no pool`);
        return s;
      }

      // Cria estrutura completa da criatura
      const creature = {
        id: cardId,
        name: creatureData.name?.pt || creatureData.name?.en || cardId,
        element: creatureData.element || 'puro',
        hp: creatureData.hp || 5,
        maxHp: creatureData.hp || 5,
        atk: creatureData.atk || 2,
        def: creatureData.def || 1,
        abilities: creatureData.abilities || [],
        buffs: [],
        debuffs: [],
        shield: 0,
        statusEffects: [],
      };

      slots[slotIndex] = creature;
      hand.splice(index, 1);
      return {
        ...s,
        player: {
          ...s.player,
          hand,
          field: { ...s.player.field, slots },
        },
        log: [...s.log, `Invocou ${cardId} no slot ${slotIndex + 1}.`],
      };
    });
  }, []);


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
      return {
        ...s,
        player: {
          ...s.player,
          hand,
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
  }, []);

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
      return {
        ...s,
        ai: {
          ...s.ai,
          hand,
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

      const slots = [...s.player.field.slots];
      if (slots[slotIndex]) return s; // slot ocupado
      // Dados da criatura completa
      const creatureData = creaturesPool.find(c => c.id === cardId) || {};
      const build = resolveCreatureBuild(creatureData);
      const creature = {
        id: cardId,
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
      slots[slotIndex] = creature;
      let logEntries = [...s.log];

      // PRIORIDADE: Verifica se há cartas de campo na mão da IA
      const fieldCardIndex = hand.findIndex((cardId) => cardId && (/^f\d{3}$/i.test(cardId) || String(cardId).toLowerCase().startsWith('field_')));

      if (fieldCardIndex >= 0) {
        // IA tem uma carta de campo, invoca ela no sharedField (sobrescreve a anterior)
        const cardId = hand[fieldCardIndex];
        log: [...s.log, `Invocou ${creature.name} no slot ${slotIndex + 1}.`],
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

      // Se nao tem carta de campo, invoca criaturas
      const action = chooseAction(s);
      const emptyIndex = slots.findIndex((slot) => !slot);

      if (action?.type === 'summon' && typeof action.handIndex === 'number' && typeof action.slotIndex === 'number') {
        const { handIndex, slotIndex } = action;
        if (hand[handIndex] && !slots[slotIndex]) {
          const cardId = hand[handIndex];
          hand.splice(handIndex, 1);
          const creatureData = creaturesPool.find(c => c.id === cardId) || {};
          const build = resolveCreatureBuild(creatureData);
          slots[slotIndex] = {
            id: cardId,
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
        }
      } else if (emptyIndex >= 0 && hand.length > 0) {
        const cardId = hand.shift();
        const creatureData = creaturesPool.find(c => c.id === cardId) || {};
        const build = resolveCreatureBuild(creatureData);
        slots[emptyIndex] = {
          id: cardId,
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
      } else {
        logEntries = [...logEntries, 'IA nao fez acao.'];
      }

      if (!updated) {
        return { ...s, log: logEntries };
      }

      return {
        ...s,
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

  // ===== SISTEMA DE HABILIDADES =====
  const useAbility = useCallback((playerSide, slotIndex, abilityIndex, targetSide, targetSlotIndex) => {
    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== playerSide) return s; // Só pode usar habilidade no seu turno
      
      const attacker = s[playerSide].field.slots[slotIndex];
      if (!attacker || attacker.hp <= 0) return s;
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
      if (match) {
        result = effectRegistry.applyStatusEffect(s, {
          targetId,
          effectType: match.type,
          duration: match.duration,
          value: match.value,
        });
      } else {
        const baseDamage = ability.cost * 2 + 1; // Fórmula temporária: custo * 2 + 1
        result = effectRegistry.applyDamage(s, {
          attackerId,
          targetId,
          baseDamage,
          attackerElement: attacker.element,
          ignoreShield: false,
        });
      }
      
      // Deduz essência
      let newState = {
        ...result.newState,
        [playerSide]: {
          ...result.newState[playerSide],
          essence: essence - cost,
        },
        log: [
          ...result.newState.log,
          `${attacker.name} usou ${ability.name?.pt || ability.name?.en || 'habilidade'} (custo: ${cost})`,
          ...result.log,
        ],
      };
      
      return newState;
    });
  }, []);

  useEffect(() => {
    if (state.phase === 'playing' && state.activePlayer === 'ai') {
      // Adiciona delay de 1.5s antes da IA agir
      const aiDelayTimer = setTimeout(() => {
        performAiTurn();
      }, 1500);
      return () => clearTimeout(aiDelayTimer);
    }
  }, [state.phase, state.activePlayer, performAiTurn]);

  return (
    <BattleContext.Provider value={value}>{children}</BattleContext.Provider>
  );
}

export const useBattle = () => React.useContext(BattleContext);
