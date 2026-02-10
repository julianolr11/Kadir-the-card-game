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
  // Guardião ativo: { id, name, img, selectedInstanceId }
  const [activeGuardian, setActiveGuardian] = useState(() => {
    // Tenta recuperar do localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('activeGuardian');
      if (stored) {
        const guardian = JSON.parse(stored);
        // Migração: garantir que tem a propriedade 'id'
        if (!guardian.id && guardian.name) {
          guardian.id = guardian.name;
        }
        return guardian;
      }
    }
    // Valor padrão
    return {
      id: 'draak',
      name: 'draak',
      img: require('../assets/img/creatures/draak_bio.webp'),
      selectedInstanceId: null,
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
    return 5; // sempre começa com 5 boosters
  });

  // Sempre salva boosters no localStorage
  const updateBoosters = (value) => {
    setBoosters(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boosters', value);
    }
  };

  // ===== COINS SYSTEM =====
  const [coins, setCoins] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('playerCoins');
      if (stored !== null) return Number(stored);
    }
    return 1000; // começa com 1000 moedas
  });

  // Sempre salva coins no localStorage
  const updateCoins = (value) => {
    setCoins(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('playerCoins', value);
    }
  };

  // Adicionar moedas (recompensas, etc)
  const addCoins = (amount) => {
    updateCoins(coins + amount);
  };

  // Gastar moedas (compras)
  const spendCoins = (amount) => {
    if (coins >= amount) {
      updateCoins(coins - amount);
      return true;
    }
    return false;
  };

  // Comprar boosters com moedas
  const purchaseBooster = (quantity = 1, cost) => {
    if (coins >= cost) {
      updateCoins(coins - cost);
      updateBoosters(boosters + quantity);
      return true;
    }
    return false;
  };
  // ===== END COINS SYSTEM =====

  // ===== CARD COLLECTION SYSTEM =====
  // Coleção de cartas: { cardId: [{ instanceId, xp, level, isHolo }, ...] }
  const [cardCollection, setCardCollection] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cardCollection');
      if (stored) {
        const collection = JSON.parse(stored);
        // Remover IDs numéricos antigos (migração)
        const cleaned = {};
        Object.keys(collection).forEach(key => {
          // Apenas manter IDs que são strings não-numéricas
          if (isNaN(key)) {
            cleaned[key] = collection[key];
          }
        });
        // Salvar versão limpa
        if (Object.keys(cleaned).length !== Object.keys(collection).length) {
          localStorage.setItem('cardCollection', JSON.stringify(cleaned));
        }
        return cleaned;
      }
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

  // Calcula XP necessário para subir de nível (progressão exponencial)
  const getXpForLevel = (level) => {
    // Nível 0→1: 100 XP
    // Nível 1→2: 150 XP
    // Nível 2→3: 225 XP
    // Nível 3→4: 337 XP
    // Nível 4→5: 505 XP
    // Nível 5→6: 757 XP
    // Nível 6→7: 1135 XP
    // Nível 7→8: 1702 XP
    // Nível 8→9: 2553 XP
    // Nível 9→10: 3829 XP
    const baseXp = 100;
    const multiplier = 1.5; // Cada nível é 1.5x mais difícil
    return Math.floor(baseXp * Math.pow(multiplier, level));
  };

  // Atualizar XP de uma instância específica
  const updateCardInstanceXp = (cardId, instanceId, xpGain) => {
    const newCollection = { ...cardCollection };
    if (newCollection[cardId]) {
      const instance = newCollection[cardId].find((inst) => inst.instanceId === instanceId);
      if (instance) {
        instance.xp += xpGain;
        // Levelup progressivo baseado no nível atual
        while (instance.level < 10) {
          const xpNeeded = getXpForLevel(instance.level);
          if (instance.xp >= xpNeeded) {
            instance.level += 1;
            instance.xp -= xpNeeded;
          } else {
            break;
          }
        }
        // Se chegou no nível máximo (10), limita o XP
        if (instance.level >= 10) {
          instance.xp = 0;
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
      // Coins System
      coins,
      setCoins: updateCoins,
      addCoins,
      spendCoins,
      purchaseBooster,
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
      coins,
      cardCollection,
      decks,
      guardianLoadouts,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
