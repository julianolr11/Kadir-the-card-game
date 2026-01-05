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
  const [musicVolume, setMusicVolume] = useState(() =>
    getInitial('musicVolume', 50),
  );
  const [effectsVolume, setEffectsVolume] = useState(() =>
    getInitial('effectsVolume', 50),
  );
  // Guardião ativo: { name, img }
  const [activeGuardian, setActiveGuardian] = useState(() => {
    // Tenta recuperar do localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('activeGuardian');
      if (stored) return JSON.parse(stored);
    }
    // Valor padrão
    return {
      name: 'draak',
      img: require('../assets/img/creatures/draak_bio.webp'),
    };
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
  // Coleção de cartas: { cardId: [{ instanceId, xp, level, isHolo }, ...] }
  const [cardCollection, setCardCollection] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cardCollection');
      if (stored) return JSON.parse(stored);
    }
    return {};
  });

  // Gerar UUID simples
  const generateInstanceId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const updateCardCollection = (newCollection) => {
    setCardCollection(newCollection);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cardCollection', JSON.stringify(newCollection));
    }
  };

  // Criar nova instância de carta
  const createCardInstance = (cardId, isHolo = false) => {
    return {
      instanceId: generateInstanceId(),
      cardId,
      xp: 0,
      level: 0,
      isHolo,
      acquiredAt: new Date().toISOString(),
    };
  };

  // Adicionar cartas de um booster aberto (cria instâncias individuais)
  // Pode receber: array de cardIds (string) ou array de objetos {id, isHolo}
  const addCardsFromBooster = (cards) => {
    const newCollection = { ...cardCollection };
    cards.forEach((card) => {
      const cardId = typeof card === 'string' ? card : card.id;
      const isHolo = typeof card === 'string' ? (Math.random() < 0.02) : (card.isHolo || false);
      const instance = createCardInstance(cardId, isHolo);

      if (!newCollection[cardId]) {
        newCollection[cardId] = [];
      }
      newCollection[cardId].push(instance);
    });
    updateCardCollection(newCollection);
  };

  // Pegar quantidade de uma carta na coleção
  const getCardCount = (cardId) => {
    return (cardCollection[cardId]?.length || 0);
  };

  // Pegar todas as instâncias de uma carta
  const getCardInstances = (cardId) => {
    return cardCollection[cardId] || [];
  };

  // Atualizar XP de uma instância específica
  const updateCardInstanceXp = (cardId, instanceId, xpGain) => {
    const newCollection = { ...cardCollection };
    if (newCollection[cardId]) {
      const instance = newCollection[cardId].find((inst) => inst.instanceId === instanceId);
      if (instance) {
        instance.xp += xpGain;
        // Levelup a cada 100 XP
        if (instance.xp >= 100 && instance.level < 10) {
          instance.level += 1;
          instance.xp -= 100;
        }
      }
    }
    updateCardCollection(newCollection);
  };

  // Remover instância de carta (quando deletada)
  const removeCardInstance = (cardId, instanceId) => {
    const newCollection = { ...cardCollection };
    if (newCollection[cardId]) {
      newCollection[cardId] = newCollection[cardId].filter(
        (inst) => inst.instanceId !== instanceId
      );
      if (newCollection[cardId].length === 0) {
        delete newCollection[cardId];
      }
    }
    updateCardCollection(newCollection);
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
        cards: deckData.cards,
      },
    };
    updateDecks(newDecks);
  };

  // Pegar dados de um deck
  const getDeck = (deckId) => {
    return decks[deckId] || null;
  };

  // Contar quantas vezes uma carta aparece em um deck específico
  const countCardInDeck = (deckCards, cardId) => {
    return deckCards.filter((id) => id === cardId).length;
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

  // ===== GUARDIAN LOADOUT SYSTEM =====
  // Guardar configuração de cada guardião: { guardianId: { selectedSkills, selectedPerk } }
  const [guardianLoadouts, setGuardianLoadouts] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('guardianLoadouts');
      if (stored) return JSON.parse(stored);
    }
    return {};
  });

  const updateGuardianLoadouts = (newLoadouts) => {
    setGuardianLoadouts(newLoadouts);
    if (typeof window !== 'undefined') {
      localStorage.setItem('guardianLoadouts', JSON.stringify(newLoadouts));
    }
  };

  // Salvar loadout do guardião atual
  const saveGuardianLoadout = (guardianId, loadoutData) => {
    const newLoadouts = {
      ...guardianLoadouts,
      [guardianId]: {
        selectedSkills: loadoutData.selectedSkills || [],
        selectedPerk: loadoutData.selectedPerk || null,
      },
    };
    updateGuardianLoadouts(newLoadouts);
  };

  // Carregar loadout de um guardião (retorna null se não existir)
  const loadGuardianLoadout = (guardianId) => {
    return guardianLoadouts[guardianId] || null;
  };
  // ===== END GUARDIAN LOADOUT SYSTEM =====

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
      getCardInstances,
      updateCardInstanceXp,
      removeCardInstance,
      createCardInstance,
      // Deck System
      decks,
      saveDeck,
      getDeck,
      deleteDeck,
      countCardInDeck,
      canAddToDeck,
      // Guardian Loadout System
      saveGuardianLoadout,
      loadGuardianLoadout,
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
      guardianLoadouts,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
