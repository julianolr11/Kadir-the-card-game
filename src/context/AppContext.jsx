import React, { createContext, useState, useMemo } from 'react';

export const AppContext = createContext();


const getInitial = (key, fallback) => {
  if (typeof window !== 'undefined') {
    const value = localStorage.getItem(key);
    if (value !== null) {
      if (
        key === 'musicVolume' ||
        key === 'effectsVolume' ||
        key === 'volume'
      ) {
        return Number(value);
      }
      return value;
    }
  }
  return fallback;
};

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => getInitial('lang', 'ptbr'));
  // volume antigo para compatibilidade
  const [volume, setVolume] = useState(() => getInitial('volume', 50));
  const [musicVolume, setMusicVolume] = useState(() => getInitial('musicVolume', 50));
  const [effectsVolume, setEffectsVolume] = useState(() => getInitial('effectsVolume', 50));
  // Guardião ativo: { name, img }
  const [activeGuardian, setActiveGuardian] = useState(() => {
    // Tenta recuperar do localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('activeGuardian');
      if (stored) return JSON.parse(stored);
    }
    // Valor padrão
    return { name: 'draak', img: require('../assets/img/creatures/draak_bio.webp') };
  });

  // Sempre salva no localStorage
  const updateActiveGuardian = (guardian) => {
    setActiveGuardian(guardian);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeGuardian', JSON.stringify(guardian));
    }
  };

  // Boosters: ao entrar no menu pela primeira vez, recebe 2 boosters
  const [boosters, setBoosters] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('boosters');
      if (stored !== null) return Number(stored);
    }
    return 2; // sempre começa com 2 boosters
  });

  // Sempre salva boosters no localStorage
  const updateBoosters = (value) => {
    setBoosters(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boosters', value);
    }
  };

  // ===== CARD COLLECTION SYSTEM =====
  // Coleção de cartas: { cardId: quantity }
  const [cardCollection, setCardCollection] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cardCollection');
      if (stored) return JSON.parse(stored);
    }
    return {};
  });

  const updateCardCollection = (newCollection) => {
    setCardCollection(newCollection);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cardCollection', JSON.stringify(newCollection));
    }
  };

  // Adicionar cartas de um booster aberto
  const addCardsFromBooster = (cardIds) => {
    const newCollection = { ...cardCollection };
    cardIds.forEach(id => {
      newCollection[id] = (newCollection[id] || 0) + 1;
    });
    updateCardCollection(newCollection);
  };

  // Pegar quantidade de uma carta na coleção
  const getCardCount = (cardId) => {
    return cardCollection[cardId] || 0;
  };

  // ===== DECK SYSTEM =====
  // Decks: { deckId: { name, guardianId, cards: [cardId, cardId, ...] } }
  const [decks, setDecks] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('decks');
      if (stored) return JSON.parse(stored);
    }
    return {};
  });

  const updateDecks = (newDecks) => {
    setDecks(newDecks);
    if (typeof window !== 'undefined') {
      localStorage.setItem('decks', JSON.stringify(newDecks));
    }
  };

  // Salvar ou atualizar um deck
  const saveDeck = (deckData) => {
    const newDecks = {
      ...decks,
      [deckData.id]: {
        name: deckData.name,
        guardianId: deckData.guardianId,
        cards: deckData.cards
      }
    };
    updateDecks(newDecks);
  };

  // Pegar dados de um deck
  const getDeck = (deckId) => {
    return decks[deckId] || null;
  };

  // Contar quantas vezes uma carta aparece em um deck específico
  const countCardInDeck = (deckCards, cardId) => {
    return deckCards.filter(id => id === cardId).length;
  };

  // Verificar se pode adicionar carta ao deck (máximo 2 cópias)
  const canAddToDeck = (deckCards, cardId) => {
    return countCardInDeck(deckCards, cardId) < 2;
  };

  // Deletar um deck
  const deleteDeck = (deckId) => {
    const newDecks = { ...decks };
    delete newDecks[deckId];
    updateDecks(newDecks);
  };
  // ===== END CARD COLLECTION & DECK SYSTEM =====

  const contextValue = useMemo(
    () => ({
      lang,
      setLang,
      volume,
      setVolume, // legado
      musicVolume,
      setMusicVolume,
      effectsVolume,
      setEffectsVolume,
      activeGuardian,
      setActiveGuardian: updateActiveGuardian,
      boosters,
      setBoosters: updateBoosters,
      // Card Collection
      cardCollection,
      setCardCollection: updateCardCollection,
      addCardsFromBooster,
      getCardCount,
      // Deck System
      decks,
      saveDeck,
      getDeck,
      deleteDeck,
      countCardInDeck,
      canAddToDeck,
    }),
    [
      lang,
      setLang,
      volume,
      setVolume,
      musicVolume,
      setMusicVolume,
      effectsVolume,
      setEffectsVolume,
      activeGuardian,
      boosters,
      cardCollection,
      decks,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
