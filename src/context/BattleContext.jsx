import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import creaturesPool from '../assets/cards';
import { chooseAction } from '../logic/ai';
import { AppContext } from './AppContext';
import fieldChangeSfx from '../assets/sounds/effects/field-change.MP3';
import flipCardSfx from '../assets/sounds/effects/flipcard.MP3';
import battleMusic from '../assets/sounds/music/battle-music.mp3';

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
  const { decks } = useContext(AppContext);
  const battleAudioRef = useRef(null);

  const playFieldChangeSound = useCallback(() => {
    try {
      if (!fieldChangeSfx) return;
      const audio = new Audio(fieldChangeSfx);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('Erro ao tocar som de campo:', e);
    }
  }, []);

  const playFlipCardSound = useCallback(() => {
    try {
      if (!flipCardSfx) return;
      const audio = new Audio(flipCardSfx);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('Erro ao tocar som de carta:', e);
    }
  }, []);

  const [state, setState] = useState({
    phase: 'idle',
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
      phase: 'playing',
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

      return {
        ...s,
        activePlayer: nextActive,
        turn: nextTurn,
        [currentSide]: { ...currentSnapshot },
        [side]: { ...s[side], deck, hand, essence, field, orbs },
        log: [...logEntries, `Fim do turno de ${s.activePlayer}.`],
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
      slots[slotIndex] = { id: cardId, hp: 1 }; // HP real vir├í depois, por enquanto placeholder
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
    log,
  }), [state, startBattle, endTurn, drawPlayerCard, summonFromHand, invokeFieldCard, invokeFieldCardAI, log]);

  const performAiTurn = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'ai') return s;

      const slots = [...s.ai.field.slots];
      const hand = [...s.ai.hand];
      let updated = false;
      let logEntries = [...s.log];

      // PRIORIDADE: Verifica se há cartas de campo na mão da IA
      const fieldCardIndex = hand.findIndex((cardId) => cardId && (/^f\d{3}$/i.test(cardId) || String(cardId).toLowerCase().startsWith('field_')));

      if (fieldCardIndex >= 0) {
        // IA tem uma carta de campo, invoca ela no sharedField (sobrescreve a anterior)
        const cardId = hand[fieldCardIndex];
        playFieldChangeSound();
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
          slots[slotIndex] = { id: cardId, hp: 1 };
          updated = true;
          logEntries = [...logEntries, `IA invocou ${cardId} no slot ${slotIndex + 1}.`];
        }
      } else if (emptyIndex >= 0 && hand.length > 0) {
        const cardId = hand.shift();
        slots[emptyIndex] = { id: cardId, hp: 1 };
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

    // Entrega o turno de volta para o jogador apos a acao da IA
    endTurn();
  }, [endTurn]);

  useEffect(() => {
    if (state.phase === 'playing' && state.activePlayer === 'ai') {
      performAiTurn();
    }
  }, [state.phase, state.activePlayer, performAiTurn]);

  return (
    <BattleContext.Provider value={value}>{children}</BattleContext.Provider>
  );
}

export const useBattle = () => React.useContext(BattleContext);
