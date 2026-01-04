import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import CreatureCardPreview from './CreatureCardPreview';
import CardInstanceSelector from './CardInstanceSelector';
import sphereMenuSound from '../assets/sounds/effects/sphereMenuSound.js';
import packageSound from '../assets/sounds/effects/packageSound.js';
import fogoIcon from '../assets/img/elements/fogo.png';
import aguaIcon from '../assets/img/elements/agua.png';
import terraIcon from '../assets/img/elements/terra.png';
import arIcon from '../assets/img/elements/ar.png';
import puroIcon from '../assets/img/elements/puro.png';
import '../styles/deckbuilder.css';

// Lista de todas as cartas disponíveis (23 cartas do booster1)
const ALL_CARD_IDS = [
  'alatoy',
  'arguilia',
  'ashfang',
  'digitama',
  'draak',
  'drazaq',
  'ekeranth',
  'elderox',
  'faskel',
  'griffor',
  'ignis',
  'kael',
  'landor',
  'leoracal',
  'lunethal',
  'mawthorn',
  'owlberoth',
  'pawferion',
  'raptauros',
  'sunburst',
  'viborom',
  'virideer',
  'whalar',
];

// Função para carregar dados da carta
const getCardData = (cardId) => {
  try {
    return require(`../assets/cards/booster1/${cardId}.js`);
  } catch (error) {
    console.warn(`Carta ${cardId} não encontrada`, error);
    return null;
  }
};

function DeckEditor({
  deckId,
  deckName: initialDeckName,
  guardianId,
  initialCards = [],
  onClose,
  onSave,
}) {
  const { lang = 'ptbr', getCardInstances, cardCollection } = React.useContext(AppContext) || {};
  const langKey = lang === 'en' ? 'en' : 'pt';

  const [deckName, setDeckName] = useState(initialDeckName || `Deck ${deckId}`);
  const [deckCards, setDeckCards] = useState(initialCards); // Array de 20 instanceIds
  const [selectedGuardian, setSelectedGuardian] = useState(guardianId); // Guardião selecionado
  const [searchTerm, setSearchTerm] = useState('');
  const [elementFilter, setElementFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showInstanceSelector, setShowInstanceSelector] = useState(false);
  const [selectedCardForInstance, setSelectedCardForInstance] = useState(null);
  const [instanceSlotIndex, setInstanceSlotIndex] = useState(null);
  const [hoveredCardForInstances, setHoveredCardForInstances] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const successSoundRef = useRef(null);
  const errorSoundRef = useRef(null);
  const isFirstRender = useRef(true);
  const lastSavedRef = useRef({
    name: initialDeckName || `Deck ${deckId}`,
    cards: initialCards,
  });

  // Helper para obter instância completa pelo instanceId
  const getInstanceById = (instanceId) => {
    if (!instanceId || !cardCollection) return null;
    for (const cardId in cardCollection) {
      const instance = cardCollection[cardId].find(inst => inst.instanceId === instanceId);
      if (instance) return instance;
    }
    return null;
  };

  // Helper para obter a melhor instância de uma carta (prioriza holo, depois maior level)
  const getBestInstance = (cardId) => {
    const instances = getCardInstances(cardId);
    if (!instances || instances.length === 0) return null;

    // Priorizar: holo > maior level > primeira instância
    const holoInstance = instances.find(inst => inst.isHolo);
    if (holoInstance) return holoInstance;

    const sorted = [...instances].sort((a, b) => b.level - a.level);
    return sorted[0];
  };

  // Contar quantas vezes uma carta (cardId) aparece no deck
  const countCardInDeck = (cardId) => {
    return deckCards.filter((instanceId) => {
      const instance = getInstanceById(instanceId);
      return instance && instance.cardId === cardId;
    }).length;
  };

  // Verificar se pode adicionar carta (máximo 2 por carta no deck)
  const canAddCard = (cardId) => {
    const instances = getCardInstances(cardId);
    const instanceCount = instances ? instances.length : 0;
    const cardCountInDeck = countCardInDeck(cardId);

    // Permitir até 2 no deck, mas não mais que instâncias disponíveis
    const maxPerDeck = Math.min(instanceCount, 2);
    return cardCountInDeck < maxPerDeck;
  };

  // Adicionar carta ao deck
  const addCardToDeck = (cardId, slotIndex = null) => {
    if (!canAddCard(cardId)) {
      // Tocar som de erro
      if (errorSoundRef.current) {
        errorSoundRef.current.currentTime = 0;
        errorSoundRef.current.play().catch(() => {});
      }
      return false;
    }

    // Verificar se tem múltiplas instâncias
    const instances = getCardInstances(cardId);
    if (instances && instances.length > 1) {
      // Mostrar seletor de instância
      setSelectedCardForInstance(cardId);
      setInstanceSlotIndex(slotIndex);
      setShowInstanceSelector(true);
      return false; // Não adiciona ainda, espera seleção
    }

    // Se tem apenas 1 instância, pegar automaticamente
    const instanceId = instances && instances.length === 1 ? instances[0].instanceId : null;
    return finishAddingCardToDeck(instanceId, slotIndex);
  };

  // Finalizar a adição da carta após seleção de instância
  const finishAddingCardToDeck = (instanceId, slotIndex = null) => {
    if (!instanceId) return false;

    const newDeck = [...deckCards];
    if (slotIndex !== null && slotIndex < 20) {
      newDeck[slotIndex] = instanceId;
    } else {
      // Encontrar primeiro slot vazio
      const emptyIndex = newDeck.findIndex((id) => !id);
      if (emptyIndex !== -1) {
        newDeck[emptyIndex] = instanceId;
      } else {
        return false; // Deck cheio
      }
    }

    setDeckCards(newDeck);

    // Tocar som de sucesso
    if (successSoundRef.current) {
      successSoundRef.current.currentTime = 0;
      successSoundRef.current.play().catch(() => {});
    }

    return true;
  };

  // Handler para quando uma instância é selecionada
  const handleInstanceSelected = (instanceId) => {
    if (selectedCardForInstance && instanceId) {
      finishAddingCardToDeck(instanceId, instanceSlotIndex);
    }
    setShowInstanceSelector(false);
    setSelectedCardForInstance(null);
    setInstanceSlotIndex(null);
  };

  // Remover carta do deck
  const removeCardFromDeck = (slotIndex) => {
    const newDeck = [...deckCards];
    newDeck[slotIndex] = null;
    setDeckCards(newDeck);
  };

  // Reordenar cartas no deck
  const moveCard = (fromIndex, toIndex) => {
    const newDeck = [...deckCards];
    const temp = newDeck[fromIndex];
    newDeck[fromIndex] = newDeck[toIndex];
    newDeck[toIndex] = temp;
    setDeckCards(newDeck);
  };

  const normalizeType = (value) => {
    if (!value) return '';
    return value
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  const resolveType = (data) => {
    if (!data || data.type === undefined) return '';
    const raw =
      typeof data.type === 'object'
        ? data.type[langKey] || data.type.pt || data.type.en || ''
        : data.type;
    return normalizeType(raw);
  };

  // Filtrar e ordenar cartas da biblioteca
  const libraryCards = useMemo(() => {
    // Apenas mostrar cartas que o jogador possui na coleção
    const ownedCardIds = cardCollection ? Object.keys(cardCollection) : [];

    let cards = ownedCardIds
      .map((id) => {
        const data = getCardData(id);
        return { id, data };
      })
      .filter((c) => c.data);

    // Filtrar por busca
    if (searchTerm) {
      cards = cards.filter((c) => {
        const name =
          typeof c.data.name === 'object' ? c.data.name[langKey] : c.data.name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filtrar por elemento
    if (elementFilter !== 'all') {
      cards = cards.filter((c) => c.data.element === elementFilter);
    }

    // Filtrar por tipo
    if (typeFilter !== 'all') {
      cards = cards.filter((c) => resolveType(c.data) === typeFilter);
    }

    // Ordenar
    cards.sort((a, b) => {
      const aName =
        typeof a.data.name === 'object' ? a.data.name[langKey] : a.data.name;
      const bName =
        typeof b.data.name === 'object' ? b.data.name[langKey] : b.data.name;

      switch (sortBy) {
        case 'name-asc':
          return aName.localeCompare(bName);
        case 'name-desc':
          return bName.localeCompare(aName);
        case 'hp-asc':
          return (a.data.hp || 0) - (b.data.hp || 0);
        case 'hp-desc':
          return (b.data.hp || 0) - (a.data.hp || 0);
        case 'element':
          return (a.data.element || '').localeCompare(b.data.element || '');
        default:
          return 0;
      }
    });

    return cards;
  }, [cardCollection, searchTerm, elementFilter, typeFilter, sortBy, langKey]);

  // Auto-save com debounce
  useEffect(() => {
    // Pular primeira execução (mount inicial) e registrar estado salvo inicial
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedRef.current = { name: deckName, cards: deckCards };
      return;
    }

    // Evitar salvar quando nada mudou
    const hasChanges =
      lastSavedRef.current.name !== deckName ||
      JSON.stringify(lastSavedRef.current.cards) !== JSON.stringify(deckCards);

    if (!hasChanges) {
      return;
    }

    const timer = setTimeout(() => {
      if (onSave) {
        onSave({
          id: deckId,
          name: deckName,
          guardianId: selectedGuardian,
          cards: deckCards,
        });
        lastSavedRef.current = { name: deckName, cards: deckCards };
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [deckCards, deckName, deckId, selectedGuardian, onSave]);

  // Handlers de drag & drop
  const handleDragStart = (e, cardIdOrInstanceId, fromSlot = false, instanceId = null) => {
    if (fromSlot) {
      // Arrastando do deck - usar instanceId
      setDraggedCardId(cardIdOrInstanceId);
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('cardId', cardIdOrInstanceId);
      e.dataTransfer.setData('instanceId', instanceId || cardIdOrInstanceId);
      e.dataTransfer.setData('fromSlot', 'true');
    } else if (canAddCard(cardIdOrInstanceId)) {
      // Arrastando da biblioteca - usar cardId
      setDraggedCardId(cardIdOrInstanceId);
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('cardId', cardIdOrInstanceId);
      e.dataTransfer.setData('fromSlot', 'false');
    } else {
      e.preventDefault();
    }
  };

  const handleDragOver = (e, slotIndex) => {
    e.preventDefault();
    setDragOverSlot(slotIndex);
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const instanceId = e.dataTransfer.getData('instanceId');
    const fromSlot = e.dataTransfer.getData('fromSlot') === 'true';

    if (fromSlot && instanceId) {
      // Reordenar dentro do deck usando instanceId
      const fromIndex = deckCards.findIndex((id) => id === instanceId);
      if (fromIndex !== -1) {
        moveCard(fromIndex, slotIndex);
      }
    } else if (!fromSlot && cardId) {
      // Adicionar da biblioteca
      addCardToDeck(cardId, slotIndex);
    }

    setDraggedCardId(null);
    setDragOverSlot(null);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverSlot(null);
  };

  const cardCount = deckCards.filter((id) => id).length;

  return (
    <div className="deck-editor-overlay" onClick={onClose}>
      <div className="deck-editor-modal" onClick={(e) => e.stopPropagation()}>
        {/* Áudio */}
        <audio ref={successSoundRef} src={sphereMenuSound} preload="auto" />
        <audio ref={errorSoundRef} src={packageSound} preload="auto" />

        {/* Header */}
        <div className="deck-editor-header">
          <input
            type="text"
            className="deck-editor-title"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Nome do Deck"
          />
          <div className="deck-editor-counter">{cardCount}/20 cartas</div>
          <button className="deck-editor-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Seleção de Guardião */}
        <div className="deck-editor-guardian-section">
          <span className="guardian-label">Guardião: {selectedGuardian || 'Não selecionado'}</span>
        </div>

        {/* Grid de Slots */}
        <div className="deck-editor-slots-container">
          <div className="deck-editor-slots-grid">
            {Array.from({ length: 20 }).map((_, idx) => {
              const instanceId = deckCards[idx];
              const instance = instanceId ? getInstanceById(instanceId) : null;
              const cardData = instance ? getCardData(instance.cardId) : null;
              const isDragOver = dragOverSlot === idx;
              const canDrop =
                draggedCardId &&
                (canAddCard(draggedCardId) ||
                  deckCards.some(id => {
                    const inst = getInstanceById(id);
                    return inst && inst.cardId === draggedCardId;
                  }));

              return (
                <div
                  key={idx}
                  className={`deck-slot ${cardData ? 'filled' : 'empty'} ${isDragOver ? (canDrop ? 'drag-over-valid' : 'drag-over-invalid') : ''}`}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragLeave={() => setDragOverSlot(null)}
                >
                  {cardData ? (
                    <div
                      className="deck-slot-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, instance.cardId, true, instanceId)}
                      onDragEnd={handleDragEnd}
                      onClick={() => removeCardFromDeck(idx)}
                    >
                      <div
                        style={{
                          transform: 'scale(0.27)',
                          transformOrigin: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <CreatureCardPreview
                          creature={cardData}
                          onClose={null}
                          level={instance.level || 1}
                          isHolo={instance.isHolo || false}
                          allowFlip={false}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="deck-slot-placeholder">
                      <span className="deck-slot-plus">+</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtros */}
        <div className="deck-library-filters">
          <input
            type="text"
            className="deck-library-search"
            placeholder="Buscar carta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="deck-library-element-filters">
            <button
              className={`element-filter-btn ${elementFilter === 'all' ? 'active' : ''}`}
              onClick={() => setElementFilter('all')}
            >
              Todos
            </button>
            <button
              className={`element-filter-btn ${elementFilter === 'fogo' ? 'active' : ''}`}
              onClick={() => setElementFilter('fogo')}
            >
              <img src={fogoIcon} alt="Fogo" />
            </button>
            <button
              className={`element-filter-btn ${elementFilter === 'agua' ? 'active' : ''}`}
              onClick={() => setElementFilter('agua')}
            >
              <img src={aguaIcon} alt="Água" />
            </button>
            <button
              className={`element-filter-btn ${elementFilter === 'terra' ? 'active' : ''}`}
              onClick={() => setElementFilter('terra')}
            >
              <img src={terraIcon} alt="Terra" />
            </button>
            <button
              className={`element-filter-btn ${elementFilter === 'ar' ? 'active' : ''}`}
              onClick={() => setElementFilter('ar')}
            >
              <img src={arIcon} alt="Ar" />
            </button>
            <button
              className={`element-filter-btn ${elementFilter === 'puro' ? 'active' : ''}`}
              onClick={() => setElementFilter('puro')}
            >
              <img src={puroIcon} alt="Puro" />
            </button>
          </div>

          <select
            className="deck-library-sort"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tipo</option>
            <option value="mistica">Mística</option>
            <option value="sombria">Sombria</option>
            <option value="draconideo">Draconídeo</option>
            <option value="ave">Ave</option>
            <option value="fera">Fera</option>
            <option value="monstro">Monstro</option>
            <option value="reptiloide">Reptiloide</option>
          </select>

          <select
            className="deck-library-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">Nome A-Z</option>
            <option value="name-desc">Nome Z-A</option>
            <option value="hp-asc">HP Crescente</option>
            <option value="hp-desc">HP Decrescente</option>
            <option value="element">Elemento</option>
          </select>
        </div>

        {/* Biblioteca de Cartas */}
        <div className="deck-library-grid">
          {libraryCards.map((card, idx) => {
            const instances = getCardInstances(card.id);
            const countInDeck = countCardInDeck(card.id);
            const instanceCount = instances ? instances.length : 0;
            const maxPerDeck = Math.min(instanceCount, 2);
            const isDisabled = countInDeck >= maxPerDeck;
            const hasMultipleInstances = instances && instances.length > 1;

            // Obter melhor instância para exibição na biblioteca (prioriza holo)
            const bestInstance = getBestInstance(card.id);
            const displayLevel = bestInstance?.level || 1;
            const displayIsHolo = bestInstance?.isHolo || false;

            return (
              <div
                key={card.id}
                className={`deck-library-card ${isDisabled ? 'disabled' : ''} ${draggedCardId === card.id ? 'dragging' : ''} ${hasMultipleInstances ? 'has-multiple-instances' : ''}`}
                draggable={!isDisabled}
                onDragStart={(e) =>
                  !isDisabled && handleDragStart(e, card.id, false)
                }
                onDragEnd={handleDragEnd}
                onMouseEnter={(e) => {
                  setHoveredCard(card.data);
                  setHoveredCardId(card.id);
                  if (hasMultipleInstances) {
                    setHoveredCardForInstances(card.id);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({ x: rect.right + 10, y: rect.top });
                  }
                }}
                onMouseLeave={() => {
                  setHoveredCard(null);
                  setHoveredCardId(null);
                  setHoveredCardForInstances(null);
                }}
                onClick={() => !isDisabled && addCardToDeck(card.id)}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div
                  style={{
                    transform: 'scale(0.25)',
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                  }}
                >
                  <CreatureCardPreview
                    creature={card.data}
                    onClose={null}
                    level={displayLevel}
                    isHolo={displayIsHolo}
                    allowFlip={false}
                  />
                </div>
                <div className="deck-library-card-count">{countInDeck}/{maxPerDeck}</div>
                {hasMultipleInstances && (
                  <div className="multiple-instances-indicator" title="Múltiplas cópias disponíveis">
                    {instances.length}x
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tooltip de Instâncias */}
        {hoveredCardForInstances && (
          <div
            className="instances-tooltip"
            style={{
              position: 'fixed',
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              zIndex: 9999,
            }}
          >
            <div className="instances-tooltip-header">
              <strong>Cópias Disponíveis</strong>
              <span className="instances-tooltip-count">
                {getCardInstances(hoveredCardForInstances).length} cópias
              </span>
            </div>
            <div className="instances-tooltip-list">
              {getCardInstances(hoveredCardForInstances)
                .sort((a, b) => {
                  if (b.level !== a.level) return b.level - a.level;
                  return b.xp - a.xp;
                })
                .map((instance, idx) => (
                  <div key={instance.instanceId} className="instances-tooltip-item">
                    <span className="instance-copy-number">#{idx + 1}</span>
                    <span className="instance-level">Nv. {instance.level}</span>
                    <span className="instance-xp">{instance.xp} XP</span>
                    {instance.isHolo && <span className="instance-holo-badge">✨ Holo</span>}
                  </div>
                ))}
            </div>
            <div className="instances-tooltip-hint">
              Clique para selecionar qual usar
            </div>
          </div>
        )}

        {/* Preview em Hover */}
        {hoveredCard && hoveredCardId && (
          <div className="deck-card-preview-hover">
            {(() => {
              const bestInstance = getBestInstance(hoveredCardId);
              return (
                <CreatureCardPreview
                  creature={hoveredCard}
                  onClose={null}
                  level={bestInstance?.level || 1}
                  isHolo={bestInstance?.isHolo || false}
                  allowFlip={false}
                />
              );
            })()}
          </div>
        )}

        {/* Toast de Salvo */}
        {showSavedToast && <div className="deck-saved-toast">✓ Salvo</div>}

        {/* Instance Selector Modal */}
        {showInstanceSelector && selectedCardForInstance && (
          <CardInstanceSelector
            cardId={selectedCardForInstance}
            cardData={getCardData(selectedCardForInstance)}
            instances={getCardInstances(selectedCardForInstance)}
            onSelect={handleInstanceSelected}
            onClose={() => setShowInstanceSelector(false)}
            title={lang === 'ptbr' ? 'Selecione uma cópia para o deck' : 'Select a card copy for deck'}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}

export default DeckEditor;
