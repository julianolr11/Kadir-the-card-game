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

    // Aplica benção do guardião se existir
    let blessingEffect = null;
    let hasIgnisBlessing = false;
    let hasEkerenthBlessing = false;
    let hasOwlberothBlessing = false;
    let hasNihilBlessing = false;
    let hasDrazraqBlessing = false;
    let hasSeractBlessing = false;
    let hasNoctyraBlessing = false;
    let hasMawthornBlessing = false;
    let hasAlatoyBlessing = false;
    let hasPawferionBlessing = false;
    let hasEkonosBlessing = false;
    let hasBeoxyrBlessing = false;
    let hasArguíliaBlessing = false;
    let hasKaelBlessing = false;
    let hasAshfangBlessing = false;
    let hasZephyronBlessing = false;
    if (creatureData.isGuardian && creatureData.defaultBlessing) {
      const blessing = creatureData.defaultBlessing;
      // Para o Griffor: escudo por 3 turnos
      if (blessing.id === 'griffor_blessing') {
        blessingEffect = { amount: 3, duration: 3 };
        // Combina com shield do perk se houver
        if (shieldOnSummon) {
          shieldOnSummon.amount += blessingEffect.amount;
          shieldOnSummon.duration = Math.max(shieldOnSummon.duration, blessingEffect.duration);
        } else {
          shieldOnSummon = blessingEffect;
        }
      }
      // Para o Ignis: ressurreição de criatura do cemitério
      if (blessing.id === 'ignis_blessing') {
        hasIgnisBlessing = true;
      }
      // Para o Ekeranth: queimadura em todos os inimigos por 2 turnos
      if (blessing.id === 'ekeranth_blessing') {
        hasEkerenthBlessing = true;
      }
      // Para o Owlberoth: retornar uma criatura inimiga para a mão
      if (blessing.id === 'owlberoth_blessing') {
        hasOwlberothBlessing = true;
      }
      // Para o Nihil: envenenar uma criatura inimiga por 2 turnos
      if (blessing.id === 'nihil_blessing') {
        hasNihilBlessing = true;
      }
      // Para o Drazraq: roubar uma carta da mão do adversário
      if (blessing.id === 'drazaq_blessing') {
        hasDrazraqBlessing = true;
      }
      // Para o Seract: trocar uma criatura em campo por uma do cemitério
      if (blessing.id === 'seract_blessing') {
        hasSeractBlessing = true;
      }
      // Para o Noctyra: drena 1 vida do adversário
      if (blessing.id === 'noctyra_blessing') {
        hasNoctyraBlessing = true;
      }
      // Para o Mawthorn: congela uma criatura adversária por 3 turnos
      if (blessing.id === 'mawthorn_blessing') {
        hasMawthornBlessing = true;
      }
      // Para o Alatoy: paralisa uma criatura aleatória por 2 turnos
      if (blessing.id === 'alatoy_blessing') {
        hasAlatoyBlessing = true;
      }
      // Para o Pawferion: imunidade a debuffs para todas as criaturas aliadas por 3 turnos
      if (blessing.id === 'pawferion_blessing') {
        hasPawferionBlessing = true;
      }
      // Para o Ekonos: concede +2 HP a uma criatura aliada
      if (blessing.id === 'ekonos_blessing') {
        hasEkonosBlessing = true;
      }
      // Para o Beoxyr: dano e queimadura em uma criatura aleatória
      if (blessing.id === 'beoxyr_blessing') {
        hasBeoxyrBlessing = true;
      }
      // Para o Arguilia: +1 HP para todas as criaturas de água
      if (blessing.id === 'arguilia_blessing') {
        hasArguíliaBlessing = true;
      }
      // Para o Kael: dano múltiplo a criaturas aleatórias
      if (blessing.id === 'kael_blessing') {
        hasKaelBlessing = true;
      }
      // Para o Ashfang: dano e queimadura a uma criatura aleatória
      if (blessing.id === 'ashfang_blessing') {
        hasAshfangBlessing = true;
      }
      // Para o Zephyron: paralisa todas as criaturas adversárias por 1 turno
      if (blessing.id === 'zephyron_blessing') {
        hasZephyronBlessing = true;
      }
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
    return { atk, def, hp, maxHp, abilities: selectedAbilities, perkEffects: { shieldOnSummon }, hasIgnisBlessing, hasEkerenthBlessing, hasOwlberothBlessing, hasNihilBlessing, hasDrazraqBlessing, hasSeractBlessing, hasNoctyraBlessing, hasMawthornBlessing, hasAlatoyBlessing, hasPawferionBlessing, hasEkonosBlessing, hasBeoxyrBlessing, hasArguíliaBlessing, hasKaelBlessing, hasAshfangBlessing, hasZephyronBlessing };
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
    resurrectionPending: null, // { guardianId, guardianName, availableSlots } se Ignis foi invocado e há cemitério
    returnCardPending: null, // { guardianId, guardianName } se Owlberoth foi invocado
    poisonPending: null, // { guardianId, guardianName } se Nihil foi invocada
    stealCardPending: null, // { guardianId, guardianName } se Drazraq foi invocado
    swapCardPending: null, // { guardianId, guardianName, step, selectedFieldSlot } se Seract foi invocado
    freezePending: null, // { guardianId, guardianName } se Mawthorn foi invocado
    healPending: null, // { guardianId, guardianName, amount } se Ekonos foi invocado
    effectCardPending: null, // { cardId, requiresTarget, targetType } se cartade efeito foi jogada
    player: {
      orbs: 5,
      essence: 0,
      deck: [],
      hand: [],
      field: { slots: [null, null, null], effects: [null, null, null] },
      fieldGraveyard: [],
      graveyard: [],
    },
    ai: {
      orbs: 5,
      essence: 0,
      deck: [],
      hand: [],
      field: { slots: [null, null, null], effects: [null, null, null] },
      fieldGraveyard: [],
      graveyard: [],
    },
    sharedField: { active: false, id: null },
    activeEffects: [], // Array de efeitos duradouros: { type, turn, duration, targetIndex, player }
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
      resurrectionPending: null,
      returnCardPending: null,
      poisonPending: null,
      stealCardPending: null,
      swapCardPending: null,
      freezePending: null,
      healPending: null,
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
            logEntries.push(`M├úo cheia (${side}). Carta devolvida ao baralho.`);
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

      // Limpa slots com criaturas mortas (hp <= 0) após processar status/buffs
      const cleanDeadSlots = (slots) => (slots || []).map(c => (c && c.hp <= 0 ? null : c));
      const nsCleaned = {
        ...processed.ns,
        player: {
          ...processed.ns.player,
          field: {
            ...processed.ns.player.field,
            slots: cleanDeadSlots(processed.ns.player.field.slots),
          },
        },
        ai: {
          ...processed.ns.ai,
          field: {
            ...processed.ns.ai.field,
            slots: cleanDeadSlots(processed.ns.ai.field.slots),
          },
        },
      };

      return {
        ...nsCleaned,
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

      const newState = {
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

      // Se for Ignis, ativa o efeito de ressurreição
      if (build.hasIgnisBlessing && (s.player.graveyard || []).length > 0) {
        const availableSlots = slots.reduce((acc, slot, idx) => {
          if (!slot) acc.push(idx);
          return acc;
        }, []);

        newState.resurrectionPending = {
          guardianId: baseId,
          guardianName: creature.name,
          availableSlots,
        };
        newState.log.push(`${creature.name} oferece ressuscitar uma criatura do cemitério!`);
      }

      // Se for Ekeranth, aplica queimadura em todos os inimigos
      if (build.hasEkerenthBlessing) {
        const aiSlots = newState.ai?.field?.slots || [];
        const updatedAiSlots = aiSlots.map(slot => {
          if (!slot) return slot;
          const burnStatusEffect = slot.statusEffects?.find(e => e.type === 'burn');
          const newStatusEffects = slot.statusEffects ? [...slot.statusEffects] : [];

          if (burnStatusEffect) {
            // Atualiza queimadura existente
            burnStatusEffect.duration = Math.max(burnStatusEffect.duration, 2);
          } else {
            // Adiciona nova queimadura
            newStatusEffects.push({
              type: 'burn',
              duration: 2,
              source: creature.name,
            });
          }

          return { ...slot, statusEffects: newStatusEffects };
        });

        newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: updatedAiSlots } };
        newState.log.push(`Todos os inimigos foram queimados por 2 turnos!`);
      }

      // Se for Owlberoth, ativa o efeito de retornar uma criatura
      if (build.hasOwlberothBlessing) {
        const enemyCreatures = (newState.ai?.field?.slots || []).filter(slot => slot !== null && slot !== undefined);
        if (enemyCreatures.length > 0) {
          newState.returnCardPending = {
            guardianId: baseId,
            guardianName: creature.name,
          };
          newState.log.push(`${creature.name} permite que você retorne uma criatura do oponente para a mão!`);
        }
      }

      // Se for Nihil, ativa o efeito de envenenamento
      if (build.hasNihilBlessing) {
        const enemyCreatures = (newState.ai?.field?.slots || []).filter(slot => slot !== null && slot !== undefined);
        if (enemyCreatures.length > 0) {
          newState.poisonPending = {
            guardianId: baseId,
            guardianName: creature.name,
          };
          newState.log.push(`${creature.name} oferece envenenar uma criatura do oponente por 2 turnos!`);
        }
      }

      // Se for Drazraq, ativa o efeito de roubo de carta
      if (build.hasDrazraqBlessing) {
        const aiHand = newState.ai?.hand || [];
        if (aiHand.length > 0) {
          newState.stealCardPending = {
            guardianId: baseId,
            guardianName: creature.name,
          };
          newState.log.push(`${creature.name} oferece roubar uma carta da mão do oponente!`);
        }
      }

      // Se for Seract, ativa o efeito de troca de essência
      if (build.hasSeractBlessing) {
        const graveyard = newState.player?.graveyard || [];
        const fieldWithCreatures = slots.reduce((acc, slot, idx) => {
          if (slot !== null && slot !== undefined) acc.push(idx);
          return acc;
        }, []);

        if (graveyard.length > 0 && fieldWithCreatures.length > 0) {
          newState.swapCardPending = {
            guardianId: baseId,
            guardianName: creature.name,
            step: 'selectField', // 'selectField' ou 'selectGraveyard'
            selectedFieldSlot: null,
          };
          newState.log.push(`${creature.name} oferece trocar uma criatura em campo por uma do cemitério!`);
        }
      }

      // Se for Noctyra, drena 1 vida do adversário se o jogador não tiver 5 orbs
      if (build.hasNoctyraBlessing) {
        const currentPlayerOrbs = newState.player?.orbs || 0;
        const currentAiOrbs = newState.ai?.orbs || 0;

        if (currentPlayerOrbs < 5 && currentAiOrbs > 0) {
          // Rouba 1 vida do adversário e adiciona ao jogador
          newState.player.orbs = Math.min(currentPlayerOrbs + 1, 5);
          newState.ai.orbs = Math.max(currentAiOrbs - 1, 0);
          newState.log.push(`${creature.name} drenou 1 vida do adversário!`);
        } else if (currentPlayerOrbs >= 5) {
          newState.log.push(`${creature.name} não pode drenar vida - você já está com vida máxima!`);
        } else if (currentAiOrbs <= 0) {
          newState.log.push(`${creature.name} não pode drenar vida - adversário sem vida!`);
        }
      }

      // Se for Mawthorn, ativa o efeito de congelamento
      if (build.hasMawthornBlessing) {
        const enemyCreatures = (newState.ai?.field?.slots || []).filter(slot => slot !== null && slot !== undefined);
        if (enemyCreatures.length > 0) {
          newState.freezePending = {
            guardianId: baseId,
            guardianName: creature.name,
          };
          newState.log.push(`${creature.name} oferece congelar uma criatura do oponente por 3 turnos!`);
        }
      }

      // Se for Alatoy, aplica paralisia em uma criatura aleatória do adversário
      if (build.hasAlatoyBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => slot ? idx : null).filter(idx => idx !== null);

        if (enemyIndices.length > 0) {
          // Escolhe uma criatura aleatória
          const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const targetCreature = aiSlots[randomIndex];

          // Aplica paralisia
          const paralyzeStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'paralyze');
          const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

          if (paralyzeStatusEffect) {
            // Atualiza paralisia existente
            paralyzeStatusEffect.duration = Math.max(paralyzeStatusEffect.duration, 2);
          } else {
            // Adiciona nova paralisia
            newStatusEffects.push({
              type: 'paralyze',
              duration: 2,
              source: creature.name,
            });
          }

          aiSlots[randomIndex] = { ...targetCreature, statusEffects: newStatusEffects };
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
          newState.log.push(`${creature.name} paralisou ${targetCreature.name} por 2 turnos!`);
        }
      }

      // Se for Pawferion, concede imunidade a debuffs para todas as criaturas aliadas por 3 turnos
      if (build.hasPawferionBlessing) {
        const playerSlots = [...(newState.player?.field?.slots || [])];
        const updatedPlayerSlots = playerSlots.map(slot => {
          if (!slot) return slot;

          // Adiciona imunidade a debuffs
          return {
            ...slot,
            debuffImmunity: 3, // Duração de 3 turnos
          };
        });

        newState.player = { ...newState.player, field: { ...newState.player.field, slots: updatedPlayerSlots } };
        newState.log.push(`${creature.name} concedeu imunidade a debuffs para todas as criaturas aliadas por 3 turnos!`);
      }

      // Se for Ekonos, ativa o efeito de cura
      if (build.hasEkonosBlessing) {
        const playerSlots = [...(newState.player?.field?.slots || [])];
        const alliedCreatures = playerSlots.filter((slot, idx) => slot !== null && slot !== undefined && idx !== slotIndex); // Exclui o próprio Ekonos

        if (alliedCreatures.length > 0) {
          // Tem outras criaturas, permite escolher
          newState.healPending = {
            guardianId: baseId,
            guardianName: creature.name,
            amount: 2,
            ekonosSlot: slotIndex,
          };
          newState.log.push(`${creature.name} oferece curar uma criatura aliada em +2 HP!`);
        } else {
          // Não tem outras criaturas, cura a si mesmo
          const ekonosCreature = playerSlots[slotIndex];
          if (ekonosCreature) {
            ekonosCreature.hp = Math.min(ekonosCreature.hp + 2, ekonosCreature.maxHp);
            playerSlots[slotIndex] = ekonosCreature;
            newState.player = { ...newState.player, field: { ...newState.player.field, slots: playerSlots } };
            newState.log.push(`${creature.name} curou a si mesmo em +2 HP!`);
          }
        }
      }

      // Se for Beoxyr, aplica dano e queimadura em uma criatura aleatória do adversário
      if (build.hasBeoxyrBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => slot ? idx : null).filter(idx => idx !== null);

        if (enemyIndices.length > 0) {
          // Escolhe uma criatura aleatória
          const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const targetCreature = aiSlots[randomIndex];

          // Aplica dano
          targetCreature.hp = Math.max(0, targetCreature.hp - 2);

          // Aplica queimadura
          const burnStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'burn');
          const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

          if (burnStatusEffect) {
            // Atualiza queimadura existente
            burnStatusEffect.duration = Math.max(burnStatusEffect.duration, 2);
          } else {
            // Adiciona nova queimadura
            newStatusEffects.push({
              type: 'burn',
              duration: 2,
              source: creature.name,
            });
          }

          targetCreature.statusEffects = newStatusEffects;
          aiSlots[randomIndex] = targetCreature;
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
          newState.log.push(`${creature.name} causou 2 de dano e queimou ${targetCreature.name} por 2 turnos!`);
        }
      }

      // Se for Arguilia, concede +1 HP para todas as criaturas de água em campo
      if (build.hasArguíliaBlessing) {
        const playerSlots = [...(newState.player?.field?.slots || [])];
        let healedCount = 0;

        const updatedPlayerSlots = playerSlots.map(slot => {
          if (!slot) return slot;

          // Verifica se a criatura é de água
          if (slot.element === 'agua' || (creaturesPool.find(c => c.id === baseId || c.id.split('-')[0] === baseId)?.element === 'agua')) {
            healedCount++;
            // Se o HP está no máximo, aumenta ambos. Senão, apenas o HP até o máximo
            if (slot.hp >= slot.maxHp) {
              return {
                ...slot,
                hp: slot.hp + 1,
                maxHp: slot.maxHp + 1,
              };
            } else {
              return {
                ...slot,
                hp: Math.min(slot.hp + 1, slot.maxHp),
              };
            }
          }
          return slot;
        });

        newState.player = { ...newState.player, field: { ...newState.player.field, slots: updatedPlayerSlots } };
        if (healedCount > 0) {
          newState.log.push(`${creature.name} concedeu +1 HP para ${healedCount} criatura(s) de água!`);
        }
      }

      // Se for Kael, aplica dano múltiplo a criaturas aleatórias
      if (build.hasKaelBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => slot ? idx : null).filter(idx => idx !== null);

        if (enemyIndices.length > 0) {
          if (enemyIndices.length === 1) {
            // Se há apenas 1 criatura, toma 3 de dano direto
            const targetIndex = enemyIndices[0];
            const targetCreature = aiSlots[targetIndex];
            targetCreature.hp = Math.max(0, targetCreature.hp - 3);
            aiSlots[targetIndex] = targetCreature;
            newState.log.push(`${creature.name} causou 3 de dano direto a ${targetCreature.name}!`);
          } else {
            // Se há más de 1, faz 1 de dano 3 vezes a criaturas aleatórias
            for (let i = 0; i < 3; i++) {
              const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
              const targetCreature = aiSlots[randomIndex];
              targetCreature.hp = Math.max(0, targetCreature.hp - 1);
              aiSlots[randomIndex] = targetCreature;
            }
            newState.log.push(`${creature.name} causou 1 de dano 3 vezes a criaturas aleatórias!`);
          }
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
        }
      }

      // Se for Ashfang, aplica dano e queimadura a uma criatura aleatória
      if (build.hasAshfangBlessing) {
        const aiSlots = [...(newState.ai?.field?.slots || [])];
        const enemyIndices = aiSlots.map((slot, idx) => slot ? idx : null).filter(idx => idx !== null);

        if (enemyIndices.length > 0) {
          // Escolhe uma criatura aleatória
          const randomIndex = enemyIndices[Math.floor(Math.random() * enemyIndices.length)];
          const targetCreature = aiSlots[randomIndex];

          // Aplica dano
          targetCreature.hp = Math.max(0, targetCreature.hp - 1);

          // Aplica queimadura por 3 turnos
          const burnStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'burn');
          const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

          if (burnStatusEffect) {
            // Atualiza queimadura existente
            burnStatusEffect.duration = Math.max(burnStatusEffect.duration, 3);
          } else {
            // Adiciona nova queimadura
            newStatusEffects.push({
              type: 'burn',
              duration: 3,
              source: creature.name,
            });
          }

          targetCreature.statusEffects = newStatusEffects;
          aiSlots[randomIndex] = targetCreature;
          newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: aiSlots } };
          newState.log.push(`${creature.name} causou 1 de dano e queimou ${targetCreature.name} por 3 turnos!`);
        }
      }

      // Se for Zephyron, paralisa todas as criaturas adversárias por 1 turno
      if (build.hasZephyronBlessing) {
        const aiSlots = newState.ai?.field?.slots || [];
        const updatedAiSlots = aiSlots.map(slot => {
          if (!slot) return slot;
          const paralyzeStatusEffect = slot.statusEffects?.find(e => e.type === 'paralyze');
          const newStatusEffects = slot.statusEffects ? [...slot.statusEffects] : [];

          if (paralyzeStatusEffect) {
            // Atualiza paralisia existente
            paralyzeStatusEffect.duration = Math.max(paralyzeStatusEffect.duration, 1);
          } else {
            // Adiciona nova paralisia
            newStatusEffects.push({
              type: 'paralyze',
              duration: 1,
              source: creature.name,
            });
          }

          return { ...slot, statusEffects: newStatusEffects };
        });

        newState.ai = { ...newState.ai, field: { ...newState.ai.field, slots: updatedAiSlots } };
        newState.log.push(`${creature.name} paralisou todas as criaturas adversárias por 1 turno!`);
      }

      return newState;
    });
  }, [resolveCreatureBuild, cardCollection]);

  // Ressuscita uma criatura do cemitério (benção do Ignis)
  const resurrectCreature = useCallback((graveyardIndex, targetSlotIndex) => {
    setState((s) => {
      if (!s.resurrectionPending) return s;

      const graveyard = [...(s.player.graveyard || [])];
      if (graveyardIndex < 0 || graveyardIndex >= graveyard.length) return s;

      const ressurectedCreature = graveyard[graveyardIndex];
      graveyard.splice(graveyardIndex, 1);

      const newLog = [...s.log, `${ressurectedCreature.name} foi ressuscitado!`];

      // Se houver slot disponível
      if (targetSlotIndex >= 0 && targetSlotIndex < 3) {
        const slots = [...s.player.field.slots];
        if (slots[targetSlotIndex]) {
          newLog.push('Slot ocupado!');
          return { ...s, log: newLog };
        }

        slots[targetSlotIndex] = ressurectedCreature;
        return {
          ...s,
          player: { ...s.player, graveyard, field: { ...s.player.field, slots } },
          resurrectionPending: null,
          log: newLog,
        };
      }

      // Sem slot disponível, vai para a mão
      const hand = [...s.player.hand, ressurectedCreature.id];
      newLog.push(`${ressurectedCreature.name} foi para a mão.`);
      return {
        ...s,
        player: { ...s.player, graveyard, hand },
        resurrectionPending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela ressurreição
  const cancelResurrection = useCallback(() => {
    setState((s) => {
      if (!s.resurrectionPending) return s;
      return {
        ...s,
        resurrectionPending: null,
        log: [...s.log, 'Ressurreição cancelada.'],
      };
    });
  }, []);

  // Retorna uma criatura inimiga para a mão (benção do Owlberoth)
  const returnEnemyCard = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.returnCardPending) return s;

      const aiSlots = [...(s.ai?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= aiSlots.length) return s;

      const returnedCreature = aiSlots[slotIndex];
      if (!returnedCreature) return s;

      // Remove a criatura do slot
      aiSlots[slotIndex] = null;

      // Adiciona à mão do inimigo (simulado - em um jogo real isso seria controlado pela IA)
      const aiHand = [...(s.ai?.hand || []), returnedCreature.id];

      const newLog = [...s.log, `${returnedCreature.name} foi retornado para a mão do oponente!`];

      return {
        ...s,
        ai: { ...s.ai, field: { ...s.ai.field, slots: aiSlots }, hand: aiHand },
        returnCardPending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela retorno de carta
  const cancelReturnCard = useCallback(() => {
    setState((s) => {
      if (!s.returnCardPending) return s;
      return {
        ...s,
        returnCardPending: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Aplica envenenamento em uma criatura inimiga (benção do Nihil)
  const poisonEnemyCard = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.poisonPending) return s;

      const aiSlots = [...(s.ai?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= aiSlots.length) return s;

      const targetCreature = aiSlots[slotIndex];
      if (!targetCreature) return s;

      // Aplica envenenamento
      const poisonStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'poison');
      const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

      if (poisonStatusEffect) {
        // Atualiza envenenamento existente
        poisonStatusEffect.duration = Math.max(poisonStatusEffect.duration, 2);
      } else {
        // Adiciona novo envenenamento
        newStatusEffects.push({
          type: 'poison',
          duration: 2,
          source: s.poisonPending.guardianName,
        });
      }

      aiSlots[slotIndex] = { ...targetCreature, statusEffects: newStatusEffects };

      const newLog = [...s.log, `${targetCreature.name} foi envenenado por 2 turnos!`];

      return {
        ...s,
        ai: { ...s.ai, field: { ...s.ai.field, slots: aiSlots } },
        poisonPending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela envenenamento
  const cancelPoisonCard = useCallback(() => {
    setState((s) => {
      if (!s.poisonPending) return s;
      return {
        ...s,
        poisonPending: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Rouba uma carta da mão do inimigo (benção do Drazraq)
  const stealEnemyCard = useCallback((handIndex) => {
    setState((s) => {
      if (!s.stealCardPending) return s;

      const aiHand = [...(s.ai?.hand || [])];
      if (handIndex < 0 || handIndex >= aiHand.length) return s;

      const stolenCard = aiHand[handIndex];
      if (!stolenCard) return s;

      // Remove a carta da mão do inimigo
      aiHand.splice(handIndex, 1);

      // Adiciona à mão do jogador
      const playerHand = [...(s.player?.hand || []), stolenCard];

      const newLog = [...s.log, `${s.stealCardPending.guardianName} roubou uma carta da mão do oponente!`];

      return {
        ...s,
        player: { ...s.player, hand: playerHand },
        ai: { ...s.ai, hand: aiHand },
        stealCardPending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela roubo de carta
  const cancelStealCard = useCallback(() => {
    setState((s) => {
      if (!s.stealCardPending) return s;
      return {
        ...s,
        stealCardPending: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Seleciona a criatura em campo para trocar (benção do Seract) - Passo 1
  const selectFieldCardForSwap = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.swapCardPending) return s;
      if (s.swapCardPending.step !== 'selectField') return s;

      const slots = [...(s.player?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= slots.length) return s;

      const selectedCreature = slots[slotIndex];
      if (!selectedCreature) return s;

      return {
        ...s,
        swapCardPending: {
          ...s.swapCardPending,
          step: 'selectGraveyard',
          selectedFieldSlot: slotIndex,
          selectedCreatureName: selectedCreature.name,
        },
        log: [...s.log, `Selecionou ${selectedCreature.name} para trocar. Escolha uma criatura do cemitério.`],
      };
    });
  }, []);

  // Executa a troca de criatura (benção do Seract) - Passo 2
  const completeSwap = useCallback((graveyardIndex) => {
    setState((s) => {
      if (!s.swapCardPending) return s;
      if (s.swapCardPending.step !== 'selectGraveyard') return s;

      const graveyard = [...(s.player?.graveyard || [])];
      if (graveyardIndex < 0 || graveyardIndex >= graveyard.length) return s;

      const fieldSlotIndex = s.swapCardPending.selectedFieldSlot;
      const slots = [...(s.player?.field?.slots || [])];
      if (fieldSlotIndex < 0 || fieldSlotIndex >= slots.length) return s;

      const graveyardCreature = graveyard[graveyardIndex];
      const fieldCreature = slots[fieldSlotIndex];

      if (!graveyardCreature || !fieldCreature) return s;

      // Remove do cemitério
      graveyard.splice(graveyardIndex, 1);

      // Gera novo instanceId para a criatura do cemitério
      const baseId = graveyardCreature.id.includes('-') ? graveyardCreature.id.split('-')[0] : graveyardCreature.id;
      const newInstanceId = `${baseId}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      const restoredCreature = { ...graveyardCreature, id: newInstanceId };

      // Troca: coloca criatura restaurada no campo e envia a antiga para cemitério
      slots[fieldSlotIndex] = restoredCreature;
      graveyard.push(fieldCreature);

      const newLog = [...s.log, `${graveyardCreature.name} foi trazido do cemitério, e ${fieldCreature.name} foi enviado para o cemitério!`];

      return {
        ...s,
        player: { ...s.player, graveyard, field: { ...s.player.field, slots } },
        swapCardPending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela a troca de criatura
  const cancelSwap = useCallback(() => {
    setState((s) => {
      if (!s.swapCardPending) return s;
      return {
        ...s,
        swapCardPending: null,
        log: [...s.log, 'Troca cancelada.'],
      };
    });
  }, []);

  // Aplica congelamento em uma criatura inimiga (benção do Mawthorn)
  const freezeEnemyCard = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.freezePending) return s;

      const aiSlots = [...(s.ai?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= aiSlots.length) return s;

      const targetCreature = aiSlots[slotIndex];
      if (!targetCreature) return s;

      // Aplica congelamento
      const freezeStatusEffect = targetCreature.statusEffects?.find(e => e.type === 'freeze');
      const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];

      if (freezeStatusEffect) {
        // Atualiza congelamento existente
        freezeStatusEffect.duration = Math.max(freezeStatusEffect.duration, 3);
      } else {
        // Adiciona novo congelamento
        newStatusEffects.push({
          type: 'freeze',
          duration: 3,
          source: s.freezePending.guardianName,
        });
      }

      aiSlots[slotIndex] = { ...targetCreature, statusEffects: newStatusEffects };

      const newLog = [...s.log, `${targetCreature.name} foi congelado por 3 turnos!`];

      return {
        ...s,
        ai: { ...s.ai, field: { ...s.ai.field, slots: aiSlots } },
        freezePending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela congelamento
  const cancelFreezeCard = useCallback(() => {
    setState((s) => {
      if (!s.freezePending) return s;
      return {
        ...s,
        freezePending: null,
        log: [...s.log, 'Ação cancelada.'],
      };
    });
  }, []);

  // Cura uma criatura aliada (benção do Ekonos)
  const healAllyCard = useCallback((slotIndex) => {
    setState((s) => {
      if (!s.healPending) return s;

      const playerSlots = [...(s.player?.field?.slots || [])];
      if (slotIndex < 0 || slotIndex >= playerSlots.length) return s;

      const targetCreature = playerSlots[slotIndex];
      if (!targetCreature) return s;

      // Aplica cura
      const healAmount = s.healPending.amount || 2;
      targetCreature.hp = Math.min(targetCreature.hp + healAmount, targetCreature.maxHp);
      playerSlots[slotIndex] = targetCreature;

      const newLog = [...s.log, `${targetCreature.name} foi curado em +${healAmount} HP!`];

      return {
        ...s,
        player: { ...s.player, field: { ...s.player.field, slots: playerSlots } },
        healPending: null,
        log: newLog,
      };
    });
  }, []);

  // Cancela cura
  const cancelHealCard = useCallback(() => {
    setState((s) => {
      if (!s.healPending) return s;
      return {
        ...s,
        healPending: null,
        log: [...s.log, 'Ação cancelada.'],
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

      // Aplica dano: prioriza campo 'damage' da habilidade, senão usa fórmula genérica
      const baseDamage = typeof ability.damage === 'number' ? ability.damage : (ability.cost * 2 + 1);
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
          let sleepApplied = false;
          if (match) {
            console.log('Aplicando status effect adicional:', match.type);
            const statusResult = effectRegistry.applyStatusEffect(result.newState, {
              targetId,
              effectType: match.type,
              duration: match.duration,
              value: match.value,
              attackerId,
            });
            // Detecta se foi aplicado sleep
            if (match.type === 'sleep') {
              // Verifica se o status foi realmente aplicado (duração > 0)
              const targetAfter = statusResult.newState[targetSide].field.slots.find(slot => slot?.id === targetId);
              if (targetAfter && (targetAfter.statusEffects || []).some(e => e.type === 'sleep' && e.duration > 0)) {
                sleepApplied = true;
              }
            }
            result.newState = statusResult.newState;
            result.log = [...result.log, ...statusResult.log];
          }

          // Deduz essência e aplica animação de dano
          let animationsPayload = {
            ...(s2.animations || {}),
            ...(animPayload ? { [targetId]: animPayload } : {}),
          };
          // Se aplicou sleep, adiciona animação de sleep
          if (sleepApplied) {
            animationsPayload[targetId] = { ...animationsPayload[targetId], type: 'sleep' };
            // Remove animação de sleep após 1.2s
            clearAnimAfter(targetId, 1200);
          } else {
            // Remove animação de dano após 900ms
            clearAnimAfter(targetId, 900);
          }

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
            animations: animationsPayload,
          };

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

  // Funções para gerenciar cartas de efeito
  const playEffectCard = useCallback((handIndex, targetInfo = null) => {
    setState((s) => {
      let newState = JSON.parse(JSON.stringify(s));
      const cardId = s.player.hand[handIndex];
      
      if (!cardId) return s;

      // Encontra a carta de efeito
      const allCards = Array.isArray(creaturesPool) ? creaturesPool : [];
      const effectCard = allCards.find(c => c.id === cardId && c.type === 'effect');

      if (!effectCard) return s;

      // Executa o efeito
      const { executeEffectCard } = require('../logic/ai');
      newState = executeEffectCard(newState, effectCard, targetInfo);

      // Remove a carta da mão
      newState.player.hand = newState.player.hand.filter((_, idx) => idx !== handIndex);

      // Limpa state de espera
      newState.effectCardPending = null;

      // Log
      const effectName = typeof effectCard.name === 'object' ? effectCard.name.pt : effectCard.name;
      log(`Jogou ${effectName}`);

      return newState;
    });
  }, [log]);

  const selectEffectCardTarget = useCallback((handIndex) => {
    const cardId = state.player.hand[handIndex];
    const allCards = Array.isArray(creaturesPool) ? creaturesPool : [];
    const effectCard = allCards.find(c => c.id === cardId && c.type === 'effect');

    if (!effectCard) return;

    if (effectCard.targetType === 'self' || effectCard.targetType === 'allAllies' || effectCard.targetType === 'allEnemies' || effectCard.targetType === 'opponent') {
      // Não requer seleção de alvo, jogar direto
      playEffectCard(handIndex);
    } else {
      // Requer seleção de alvo
      setState(s => ({
        ...s,
        effectCardPending: {
          handIndex,
          cardId,
          requiresTarget: true,
          targetType: effectCard.targetType
        }
      }));
    }
  }, [state.player.hand, playEffectCard]);

  const cancelEffectCard = useCallback(() => {
    setState(s => ({
      ...s,
      effectCardPending: null
    }));
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
    resurrectCreature,
    cancelResurrection,
    returnEnemyCard,
    cancelReturnCard,
    poisonEnemyCard,
    cancelPoisonCard,
    stealEnemyCard,
    cancelStealCard,
    selectFieldCardForSwap,
    completeSwap,
    cancelSwap,
    freezeEnemyCard,
    cancelFreezeCard,
    healAllyCard,
    cancelHealCard,
    log,
    playEffectCard,
    selectEffectCardTarget,
    cancelEffectCard,
    startPlaying: (firstPlayer) => {
      setState(s => ({
        ...s,
        phase: 'playing',
        activePlayer: firstPlayer === 'player' ? 'player' : 'ai',
      }));
    },
  }), [state, startBattle, endTurn, drawPlayerCard, summonFromHand, invokeFieldCard, invokeFieldCardAI, useAbility, resurrectCreature, cancelResurrection, returnEnemyCard, cancelReturnCard, poisonEnemyCard, cancelPoisonCard, stealEnemyCard, cancelStealCard, selectFieldCardForSwap, completeSwap, cancelSwap, freezeEnemyCard, cancelFreezeCard, healAllyCard, cancelHealCard, log, playEffectCard, selectEffectCardTarget, cancelEffectCard]);

  const applyAiSummonBlessings = useCallback((s, build, creatureData, summonSlotIndex, aiSlots, logEntries) => {
    const creatureName = creatureData.name?.pt || creatureData.name?.en || creatureData.id;
    let nextLog = logEntries;

    const applyStatusEffect = (targetCreature, type, duration, sourceName) => {
      const newStatusEffects = targetCreature.statusEffects ? [...targetCreature.statusEffects] : [];
      const existing = newStatusEffects.find(e => e.type === type);
      if (existing) {
        existing.duration = Math.max(existing.duration, duration);
      } else {
        newStatusEffects.push({ type, duration, source: sourceName });
      }
      return { ...targetCreature, statusEffects: newStatusEffects };
    };

    const getRandomIndex = (indices) => indices[Math.floor(Math.random() * indices.length)];

    // Ekeranth: queimadura em todos os inimigos (jogador)
    if (build.hasEkerenthBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const updated = playerSlots.map((slot) => {
        if (!slot) return slot;
        return applyStatusEffect(slot, 'burn', 2, creatureName);
      });
      s.player = { ...s.player, field: { ...s.player.field, slots: updated } };
      nextLog = [...nextLog, 'Todos os seus inimigos foram queimados por 2 turnos!'];
    }

    // Owlberoth: retorna criatura inimiga (jogador) para a mão
    if (build.hasOwlberothBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const returned = playerSlots[idx];
        playerSlots[idx] = null;
        const playerHand = [...(s.player?.hand || []), returned.id];
        s.player = { ...s.player, hand: playerHand, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} retornou ${returned.name} para a sua mão!`];
      }
    }

    // Nihil: envenena criatura inimiga (jogador)
    if (build.hasNihilBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const target = playerSlots[idx];
        playerSlots[idx] = applyStatusEffect(target, 'poison', 2, creatureName);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} envenenou ${target.name} por 2 turnos!`];
      }
    }

    // Drazraq: rouba carta da mão do jogador
    if (build.hasDrazraqBlessing) {
      const playerHand = [...(s.player?.hand || [])];
      if (playerHand.length > 0) {
        const idx = Math.floor(Math.random() * playerHand.length);
        const stolen = playerHand[idx];
        playerHand.splice(idx, 1);
        const aiHand = [...(s.ai?.hand || []), stolen];
        s.player = { ...s.player, hand: playerHand };
        s.ai = { ...s.ai, hand: aiHand };
        nextLog = [...nextLog, `${creatureName} roubou uma carta da sua mão!`];
      }
    }

    // Seract: troca uma criatura em campo por uma do cemitério (lado IA)
    if (build.hasSeractBlessing) {
      const aiGraveyard = [...(s.ai?.graveyard || [])];
      const indices = aiSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (aiGraveyard.length > 0 && indices.length > 0) {
        const fieldIdx = getRandomIndex(indices);
        const graveIdx = Math.floor(Math.random() * aiGraveyard.length);
        const fieldCreature = aiSlots[fieldIdx];
        const graveCreature = aiGraveyard[graveIdx];
        aiGraveyard.splice(graveIdx, 1);
        aiSlots[fieldIdx] = graveCreature;
        aiGraveyard.push(fieldCreature);
        s.ai = { ...s.ai, graveyard: aiGraveyard, field: { ...s.ai.field, slots: aiSlots } };
        nextLog = [...nextLog, `${creatureName} trocou ${fieldCreature.name} pelo retorno de ${graveCreature.name}!`];
      }
    }

    // Noctyra: drena 1 vida do jogador se IA não estiver com 5 orbs
    if (build.hasNoctyraBlessing) {
      const aiOrbs = s.ai?.orbs || 0;
      const playerOrbs = s.player?.orbs || 0;
      if (aiOrbs < 5 && playerOrbs > 0) {
        s.ai = { ...s.ai, orbs: Math.min(aiOrbs + 1, 5) };
        s.player = { ...s.player, orbs: Math.max(playerOrbs - 1, 0) };
        nextLog = [...nextLog, `${creatureName} drenou 1 vida do seu guardião!`];
      }
    }

    // Mawthorn: congela criatura inimiga (jogador)
    if (build.hasMawthornBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const target = playerSlots[idx];
        playerSlots[idx] = applyStatusEffect(target, 'freeze', 3, creatureName);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} congelou ${target.name} por 3 turnos!`];
      }
    }

    // Alatoy: paralisa criatura inimiga (jogador)
    if (build.hasAlatoyBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const target = playerSlots[idx];
        playerSlots[idx] = applyStatusEffect(target, 'paralyze', 2, creatureName);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} paralisou ${target.name} por 2 turnos!`];
      }
    }

    // Pawferion: imunidade a debuffs para aliados (IA)
    if (build.hasPawferionBlessing) {
      const updated = aiSlots.map(slot => (slot ? { ...slot, debuffImmunity: 3 } : slot));
      aiSlots.splice(0, aiSlots.length, ...updated);
      nextLog = [...nextLog, `${creatureName} concedeu imunidade a debuffs para a IA por 3 turnos!`];
    }

    // Ekonos: cura criatura aliada (IA)
    if (build.hasEkonosBlessing) {
      const indices = aiSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null && idx !== summonSlotIndex);
      let targetIdx = summonSlotIndex;
      if (indices.length > 0) {
        targetIdx = getRandomIndex(indices);
      }
      const target = aiSlots[targetIdx];
      if (target) {
        aiSlots[targetIdx] = { ...target, hp: Math.min((target.hp || 0) + 2, target.maxHp || target.hp || 0) };
        nextLog = [...nextLog, `${creatureName} curou ${aiSlots[targetIdx].name} em +2 HP!`];
      }
    }

    // Beoxyr: dano + queimadura em criatura inimiga (jogador)
    if (build.hasBeoxyrBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const target = playerSlots[idx];
        target.hp = Math.max(0, target.hp - 2);
        playerSlots[idx] = applyStatusEffect(target, 'burn', 2, creatureName);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 2 de dano e queimou ${target.name} por 2 turnos!`];
      }
    }

    // Arguilia: +1 HP para criaturas de água (IA)
    if (build.hasArguíliaBlessing) {
      let count = 0;
      const updated = aiSlots.map((slot) => {
        if (!slot) return slot;
        if (slot.element === 'agua') {
          count += 1;
          if (slot.hp >= slot.maxHp) {
            return { ...slot, hp: slot.hp + 1, maxHp: slot.maxHp + 1 };
          }
          return { ...slot, hp: Math.min(slot.hp + 1, slot.maxHp) };
        }
        return slot;
      });
      aiSlots.splice(0, aiSlots.length, ...updated);
      if (count > 0) nextLog = [...nextLog, `${creatureName} concedeu +1 HP para ${count} criatura(s) de água da IA!`];
    }

    // Kael: 1 dano 3 vezes ou 3 de dano direto
    if (build.hasKaelBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length === 1) {
        const idx = indices[0];
        const target = playerSlots[idx];
        target.hp = Math.max(0, target.hp - 3);
        playerSlots[idx] = target;
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 3 de dano direto a ${target.name}!`];
      } else if (indices.length > 1) {
        for (let i = 0; i < 3; i += 1) {
          const idx = getRandomIndex(indices);
          const target = playerSlots[idx];
          target.hp = Math.max(0, target.hp - 1);
          playerSlots[idx] = target;
        }
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 1 de dano 3 vezes a criaturas aleatórias!`];
      }
    }

    // Zephyron: paralisa todas as criaturas do jogador por 1 turno
    if (build.hasZephyronBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const updated = playerSlots.map((slot) => {
        if (!slot) return slot;
        return applyStatusEffect(slot, 'paralyze', 1, creatureName);
      });
      s.player = { ...s.player, field: { ...s.player.field, slots: updated } };
      nextLog = [...nextLog, `${creatureName} paralisou todas as suas criaturas por 1 turno!`];
    }

    // Ashfang: 1 de dano + queimadura 3 turnos
    if (build.hasAshfangBlessing) {
      const playerSlots = [...(s.player?.field?.slots || [])];
      const indices = playerSlots.map((slot, idx) => (slot ? idx : null)).filter(idx => idx !== null);
      if (indices.length > 0) {
        const idx = getRandomIndex(indices);
        const target = playerSlots[idx];
        target.hp = Math.max(0, target.hp - 1);
        playerSlots[idx] = applyStatusEffect(target, 'burn', 3, creatureName);
        s.player = { ...s.player, field: { ...s.player.field, slots: playerSlots } };
        nextLog = [...nextLog, `${creatureName} causou 1 de dano e queimou ${target.name} por 3 turnos!`];
      }
    }

    return { logEntries: nextLog };
  }, []);

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
          const aiBlessingResult = applyAiSummonBlessings(s, build, creatureData, slotIndex, slots, logEntries);
          logEntries = aiBlessingResult.logEntries;
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
        const aiBlessingResult = applyAiSummonBlessings(s, build, creatureData, emptyIndex, slots, logEntries);
        logEntries = aiBlessingResult.logEntries;
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
