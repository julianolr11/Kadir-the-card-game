import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import creaturesPool from '../assets/cards';
import { AppContext } from './AppContext';

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
  // duplica para formar deck simples de criaturas (efeitos/field virão depois)
  const cards = base.map((c) => c.id || c.name || 'unknown');
  // Por enquanto o deck é apenas IDs de criaturas
  return shuffle(cards.concat(cards)).slice(0, size);
};

export function BattleProvider({ children }) {
  const { decks } = useContext(AppContext);

  const [state, setState] = useState({
    phase: 'idle',
    turn: 1,
    activePlayer: 'player', // 'player' | 'ai'
    player: {
      orbs: 3,
      essence: 0,
      deck: [],
      hand: [],
      field: { slots: [null, null, null], effects: [null, null, null] },
    },
    ai: {
      orbs: 3,
      essence: 0,
      deck: [],
      hand: [],
      field: { slots: [null, null, null], effects: [null, null, null] },
    },
    sharedField: { active: false, id: null },
    log: [],
  });

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

  const startBattle = useCallback(() => {
    // Deck do jogador: primeiro deck salvo, senão amostra aleatória
    const playerDeck = pickFirstUserDeck() || sampleDeckFromPool(20);
    const aiDeck = sampleDeckFromPool(20);

    // Embaralhar e comprar mão inicial (4 cartas)
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
      player: { orbs: 3, essence: 0, deck: pDeck, hand: pHand, field: { slots: [null, null, null], effects: [null, null, null] } },
      ai: { orbs: 3, essence: 0, deck: aDeck, hand: aHand, field: { slots: [null, null, null], effects: [null, null, null] } },
      sharedField: { active: false, id: null },
      log: ['Batalha iniciada!'],
    });
  }, [pickFirstUserDeck]);

  const endTurn = useCallback(() => {
    setState((s) => {
      const nextActive = s.activePlayer === 'player' ? 'ai' : 'player';
      const nextTurn = s.turn + (nextActive === 'player' ? 1 : 0);

      // compra 1 carta (limite de 7; overflow: volta para o deck e embaralha)
      const side = nextActive;
      const sideData = { ...(s[side]) };
      let { deck, hand, essence, field, orbs } = sideData;

      // +1 essência por turno, limite 10 padrão
      essence = Math.min(10, (essence || 0) + 1);

      const d = drawFromDeck(deck);
      deck = d.nextDeck;
      if (d.card) {
        if ((hand?.length || 0) >= 7) {
          // overflow
          deck = shuffle([d.card, ...deck]);
          log(`Mão cheia (${side}). Carta devolvida ao baralho.`);
        } else {
          hand = [...hand, d.card];
        }
      }

      return {
        ...s,
        activePlayer: nextActive,
        turn: nextTurn,
        [side]: { ...s[side], deck, hand, essence, field, orbs },
        log: [...s.log, `Fim do turno de ${s.activePlayer}.`],
      };
    });
  }, [log]);

  const summonFromHand = useCallback((index, slotIndex) => {
    setState((s) => {
      if (s.phase !== 'playing') return s;
      if (s.activePlayer !== 'player') return s; // por enquanto só jogador manual
      const hand = [...s.player.hand];
      const cardId = hand[index];
      if (!cardId) return s;
      const slots = [...s.player.field.slots];
      if (slots[slotIndex]) return s; // slot ocupado
      slots[slotIndex] = { id: cardId, hp: 1 }; // HP real virá depois, por enquanto placeholder
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

  const value = useMemo(() => ({
    state,
    startBattle,
    endTurn,
    summonFromHand,
    log,
  }), [state, startBattle, endTurn, summonFromHand, log]);

  return (
    <BattleContext.Provider value={value}>{children}</BattleContext.Provider>
  );
}

export const useBattle = () => React.useContext(BattleContext);
