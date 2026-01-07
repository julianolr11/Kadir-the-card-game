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

const ALL_CARD_IDS = [
  'agolir','alatoy','arguilia','ashfang','beoxyr','digitama','draak','drazaq','ekeranth','ekonos','elderox','elythra','faskel','griffor','ignis','kael','landor','leoracal','lunethal','mawthorn','owlberoth','pawferion','raptauros','seract','sunburst','terrakhal','viborom','virideer','whalar','zephyron','f001',
];

const getCardData = (cardId) => {
  try {
    if (cardId === 'f001') {
      const fieldCards = require('../assets/cards/field/exampleFieldCards').default;
      return fieldCards.find(c => c.id === 'f001');
    }
    return require(`../assets/cards/booster1/${cardId}.js`);
  } catch (error) {
    console.warn(`Carta ${cardId} não encontrada`, error);
    return null;
  }
};

function DeckEditor({ deckId, deckName: initialDeckName, guardianId, initialCards = [], onClose, onSave }) {
  const { lang = 'ptbr', getCardInstances, cardCollection } = React.useContext(AppContext) || {};
  const langKey = lang === 'en' ? 'en' : 'pt';
  const [deckName, setDeckName] = useState(initialDeckName || `Deck ${deckId}`);
  const [deckCards, setDeckCards] = useState(initialCards);
  const [selectedGuardian, setSelectedGuardian] = useState(guardianId);
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
  const lastSavedRef = useRef({ name: initialDeckName || `Deck ${deckId}`, cards: initialCards });

  const getInstanceById = (instanceId) => {
    if (!instanceId || !cardCollection) return null;
    for (const cardId in cardCollection) {
      const instance = cardCollection[cardId].find(inst => inst.instanceId === instanceId);
      if (instance) return instance;
    }
    return null;
  };

  const getBestInstance = (cardId) => {
    const instances = getCardInstances(cardId);
    if (!instances || instances.length === 0) return null;
    const holoInstance = instances.find(inst => inst.isHolo);
    if (holoInstance) return holoInstance;
    const sorted = [...instances].sort((a, b) => b.level - a.level);
    return sorted[0];
  };

  const getAvailableInstances = (cardId) => {
    const instances = getCardInstances(cardId);
    if (!instances || instances.length === 0) return [];
    const instancesInDeck = deckCards.filter(id => id !== null);
    return instances.filter(inst => !instancesInDeck.includes(inst.instanceId));
  };

  const getBestAvailableInstance = (cardId) => {
    const availableInstances = getAvailableInstances(cardId);
    if (!availableInstances || availableInstances.length === 0) return null;
    const holoInstance = availableInstances.find(inst => inst.isHolo);
    if (holoInstance) return holoInstance;
    const sorted = [...availableInstances].sort((a, b) => b.level - a.level);
    return sorted[0];
  };

  const countCardInDeck = (cardId) => {
    return deckCards.filter((instanceId) => {
      const instance = getInstanceById(instanceId);
      return instance && instance.cardId === cardId;
    }).length;
  };

  const canAddCard = (cardId) => {
    const availableInstances = getAvailableInstances(cardId);
    const availableCount = availableInstances ? availableInstances.length : 0;
    const cardCountInDeck = countCardInDeck(cardId);
    const maxPerDeck = Math.min(availableCount + cardCountInDeck, 2);
    return cardCountInDeck < maxPerDeck && availableCount > 0;
  };

  const addCardToDeck = (cardId, slotIndex = null) => {
    if (!canAddCard(cardId)) {
      if (errorSoundRef.current) {
        errorSoundRef.current.currentTime = 0;
        errorSoundRef.current.play().catch(() => {});
      }
      return false;
    }
    const instances = getCardInstances(cardId);
    if (instances && instances.length > 1) {
      setSelectedCardForInstance(cardId);
      setInstanceSlotIndex(slotIndex);
      setShowInstanceSelector(true);
      return false;
    }
    const instanceId = instances && instances.length === 1 ? instances[0].instanceId : null;
    return finishAddingCardToDeck(instanceId, slotIndex);
  };

  const finishAddingCardToDeck = (instanceId, slotIndex = null) => {
    if (!instanceId) return false;
    const newDeck = [...deckCards];
    if (slotIndex !== null && slotIndex < 20) {
      newDeck[slotIndex] = instanceId;
    } else {
      const emptyIndex = newDeck.findIndex((id) => !id);
      if (emptyIndex !== -1) {
        newDeck[emptyIndex] = instanceId;
      } else {
        return false;
      }
    }
    setDeckCards(newDeck);
    if (successSoundRef.current) {
      successSoundRef.current.currentTime = 0;
      successSoundRef.current.play().catch(() => {});
    }
    return true;
  };

  const handleInstanceSelected = (instanceId) => {
    if (selectedCardForInstance && instanceId) {
      finishAddingCardToDeck(instanceId, instanceSlotIndex);
    }
    setShowInstanceSelector(false);
    setSelectedCardForInstance(null);
    setInstanceSlotIndex(null);
  };

  const removeCardFromDeck = (slotIndex) => {
    const newDeck = [...deckCards];
    newDeck[slotIndex] = null;
    setDeckCards(newDeck);
  };

  const moveCard = (fromIndex, toIndex) => {
    const newDeck = [...deckCards];
    const temp = newDeck[fromIndex];
    newDeck[fromIndex] = newDeck[toIndex];
    newDeck[toIndex] = temp;
    setDeckCards(newDeck);
  };

  const normalizeType = (value) => {
    if (!value) return '';
    return value.toString().normalize('NFD').replace(/[\u0000-\u000f]/g, '').toLowerCase().trim();
  };

  const resolveType = (data) => {
    if (!data || data.type === undefined) return '';
    const raw = typeof data.type === 'object' ? data.type[langKey] || data.type.pt || data.type.en || '' : data.type;
    return normalizeType(raw);
  };

  const libraryCards = useMemo(() => {
    const ownedCardIds = cardCollection ? Object.keys(cardCollection) : [];
    let cards = ownedCardIds
      .filter(id => id)
      .map((id) => {
        const data = id ? getCardData(id) : null;
        return { id, data };
      })
      .filter((c) => c.data);
    if (searchTerm) {
      cards = cards.filter((c) => {
        const name = typeof c.data.name === 'object' ? c.data.name[langKey] : c.data.name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    if (elementFilter !== 'all') {
      cards = cards.filter((c) => c.data.element === elementFilter);
    }
    if (typeFilter !== 'all') {
      cards = cards.filter((c) => resolveType(c.data) === typeFilter);
    }
    cards.sort((a, b) => {
      const aName = typeof a.data.name === 'object' ? a.data.name[langKey] : a.data.name;
      const bName = typeof b.data.name === 'object' ? b.data.name[langKey] : b.data.name;
      switch (sortBy) {
        case 'name-asc': return aName.localeCompare(bName);
        case 'name-desc': return bName.localeCompare(aName);
        case 'hp-asc': return (a.data.hp || 0) - (b.data.hp || 0);
        case 'hp-desc': return (b.data.hp || 0) - (a.data.hp || 0);
        case 'element': return (a.data.element || '').localeCompare(b.data.element || '');
        default: return 0;
      }
    });
    return cards;
  }, [cardCollection, searchTerm, elementFilter, typeFilter, sortBy, langKey, selectedGuardian]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedRef.current = { name: deckName, cards: deckCards };
      return;
    }
    const hasChanges = lastSavedRef.current.name !== deckName || JSON.stringify(lastSavedRef.current.cards) !== JSON.stringify(deckCards);
    if (!hasChanges) return;
    const timer = setTimeout(() => {
      if (onSave) {
        onSave({ id: deckId, name: deckName, guardianId: selectedGuardian, cards: deckCards });
        lastSavedRef.current = { name: deckName, cards: deckCards };
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [deckCards, deckName, deckId, selectedGuardian, onSave]);

  useEffect(() => {
    if (guardianId !== selectedGuardian) {
      setSelectedGuardian(guardianId);
      if (guardianId && getCardInstances) {
        const guardianInstances = getCardInstances(guardianId);
        if (guardianInstances && guardianInstances.length > 0) {
          const holoInstance = guardianInstances.find(inst => inst.isHolo);
          const bestInstance = holoInstance || guardianInstances[0];
          setDeckCards(prevCards => {
            const newCards = [...prevCards];
            newCards[0] = bestInstance.instanceId;
            return newCards;
          });
        }
      }
    }
  }, [guardianId, getCardInstances]);

  const handleDragStart = (e, cardIdOrInstanceId, fromSlot = false, instanceId = null) => {
    if (fromSlot) {
      setDraggedCardId(cardIdOrInstanceId);
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('cardId', cardIdOrInstanceId);
      e.dataTransfer.setData('instanceId', instanceId || cardIdOrInstanceId);
      e.dataTransfer.setData('fromSlot', 'true');
    } else if (canAddCard(cardIdOrInstanceId)) {
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
      const fromIndex = deckCards.findIndex((id) => id === instanceId);
      if (fromIndex !== -1) {
        moveCard(fromIndex, slotIndex);
      }
    } else if (!fromSlot && cardId) {
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
        <audio ref={successSoundRef} src={sphereMenuSound} preload="auto" />
        <audio ref={errorSoundRef} src={packageSound} preload="auto" />
        <div className="deck-editor-header">
          <input type="text" className="deck-editor-title" value={deckName} onChange={e => setDeckName(e.target.value)} placeholder="Nome do Deck" />
          <div className="deck-editor-counter">{cardCount}/20 cartas</div>
          <button className="deck-editor-close" onClick={onClose}>✕</button>
        </div>
        <div className="deck-editor-guardian-section">
          <span className="guardian-label">Guardião: {selectedGuardian || 'Não selecionado'}</span>
        </div>
        <div className="deck-editor-slots-container">
          <div className="deck-editor-slots-grid">
            {Array.from({ length: 20 }).map((_, idx) => {
              const instanceId = deckCards[idx];
              const instance = instanceId ? getInstanceById(instanceId) : null;
              const cardData = instance ? getCardData(instance.cardId) : null;
              const isDragOver = dragOverSlot === idx;
              const canDrop = draggedCardId && (canAddCard(draggedCardId) || deckCards.some(id => { const inst = getInstanceById(id); return inst && inst.cardId === draggedCardId; }));
              return (
                <div key={idx} className={`deck-slot ${cardData ? 'filled' : 'empty'} ${isDragOver ? (canDrop ? 'drag-over-valid' : 'drag-over-invalid') : ''}`} onDragOver={(e) => handleDragOver(e, idx)} onDrop={(e) => handleDrop(e, idx)} onDragLeave={() => setDragOverSlot(null)}>
                  {cardData ? (
                    <div className="deck-slot-card" draggable onDragStart={(e) => handleDragStart(e, instance.cardId, true, instanceId)} onDragEnd={handleDragEnd} onClick={() => removeCardFromDeck(idx)}>
                      {cardData.id === 'f001' ? (
                        <div className="slider-card-wrapper active" style={{ transform: 'scale(0.27)', transformOrigin: 'center', pointerEvents: 'none' }}>
                          <div className="card-preview card-preview-field">
                            <div className="card-preview-header">
                              <span className="card-preview-name">Campo em Reuínas</span>
                              <span className="card-preview-id">#f001</span>
                            </div>
                            <div className="card-preview-art-wrapper">
                              <img alt="Campo em Reuínas" className="card-preview-art" src={require(`../assets/${cardData.image}`)} />
                            </div>
                            <div className="card-preview-field-desc">
                              <strong>Descrição:</strong>
                              <div style={{whiteSpace: 'pre-line'}}>Energias ancestrais despertam e fortalecem monstros e seres puros. Apenas os dignos sentirão o poder fluir sob seus pés.</div>
                              <div className="card-preview-field-effects">
                                <strong>Efeitos:</strong>
                                <ul>
                                  <li>Criaturas do elemento <b>puro</b>: +1 Dano / +1 HP</li>
                                  <li>Criaturas do tipo <b>monstro</b>: +1 Dano / +1 HP</li>
                                  <li><b>Puras e Monstros</b>: +2 Dano / +2 HP</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ transform: 'scale(0.27)', transformOrigin: 'center', pointerEvents: 'none' }}>
                          <CreatureCardPreview creature={cardData} onClose={null} level={instance.level || 1} isHolo={instance.isHolo || false} allowFlip={false} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="deck-slot-placeholder"><span className="deck-slot-plus">+</span></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="deck-library-filters">
          <input type="text" className="deck-library-search" placeholder="Buscar carta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="deck-library-element-filters">
            <button className={`element-filter-btn ${elementFilter === 'all' ? 'active' : ''}`} onClick={() => setElementFilter('all')}>Todos</button>
            <button className={`element-filter-btn ${elementFilter === 'fogo' ? 'active' : ''}`} onClick={() => setElementFilter('fogo')}><img src={fogoIcon} alt="Fogo" /></button>
            <button className={`element-filter-btn ${elementFilter === 'agua' ? 'active' : ''}`} onClick={() => setElementFilter('agua')}><img src={aguaIcon} alt="Água" /></button>
            <button className={`element-filter-btn ${elementFilter === 'terra' ? 'active' : ''}`} onClick={() => setElementFilter('terra')}><img src={terraIcon} alt="Terra" /></button>
            <button className={`element-filter-btn ${elementFilter === 'ar' ? 'active' : ''}`} onClick={() => setElementFilter('ar')}><img src={arIcon} alt="Ar" /></button>
            <button className={`element-filter-btn ${elementFilter === 'puro' ? 'active' : ''}`} onClick={() => setElementFilter('puro')}><img src={puroIcon} alt="Puro" /></button>
          </div>
          <select className="deck-library-sort" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Tipo</option>
            <option value="mistica">Mística</option>
            <option value="sombria">Sombria</option>
            <option value="draconideo">Draconídeo</option>
            <option value="ave">Ave</option>
            <option value="fera">Fera</option>
            <option value="monstro">Monstro</option>
            <option value="reptiloide">Reptiloide</option>
          </select>
          <select className="deck-library-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name-asc">Nome A-Z</option>
            <option value="name-desc">Nome Z-A</option>
            <option value="hp-asc">HP Crescente</option>
            <option value="hp-desc">HP Decrescente</option>
            <option value="element">Elemento</option>
          </select>
        </div>
        <div className="deck-library-grid">
          {libraryCards.map((card, idx) => {
            const instances = getCardInstances(card.id);
            const availableInstances = getAvailableInstances(card.id);
            const countInDeck = countCardInDeck(card.id);
            const instanceCount = instances ? instances.length : 0;
            const availableCount = availableInstances ? availableInstances.length : 0;
            const maxPerDeck = Math.min(instanceCount, 2);
            const isDisabled = countInDeck >= maxPerDeck || availableCount === 0;
            const hasMultipleInstances = instances && instances.length > 1;
            const bestAvailableInstance = getBestAvailableInstance(card.id);
            if (!bestAvailableInstance) return null;
            const displayLevel = bestAvailableInstance?.level || 1;
            const displayIsHolo = bestAvailableInstance?.isHolo || false;
            return (
              <div key={card.id} className={`deck-library-card ${isDisabled ? 'disabled' : ''} ${draggedCardId === card.id ? 'dragging' : ''} ${hasMultipleInstances ? 'has-multiple-instances' : ''} ${countInDeck > 0 ? 'selected' : ''}`} draggable={!isDisabled} onDragStart={(e) => !isDisabled && handleDragStart(e, card.id, false)} onDragEnd={handleDragEnd} onMouseEnter={(e) => { setHoveredCard(card.data); setHoveredCardId(card.id); if (hasMultipleInstances) { setHoveredCardForInstances(card.id); const rect = e.currentTarget.getBoundingClientRect(); setTooltipPosition({ x: rect.right + 10, y: rect.top }); } }} onMouseLeave={() => { setHoveredCard(null); setHoveredCardId(null); setHoveredCardForInstances(null); }} onClick={() => !isDisabled && addCardToDeck(card.id)} style={{ animationDelay: `${idx * 50}ms` }}>
                {card.data.id === 'f001' ? (
                  <div className="slider-card-wrapper active" style={{ transform: 'scale(0.25)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                    <div className="card-preview card-preview-field">
                      <div className="card-preview-header">
                        <span className="card-preview-name">Campo em Reuínas</span>
                        <span className="card-preview-id">#f001</span>
                      </div>
                      <div className="card-preview-art-wrapper">
                        <img alt="Campo em Reuínas" className="card-preview-art" src={require(`../assets/${card.data.image}`)} />
                      </div>
                      <div className="card-preview-field-desc">
                        <strong>Descrição:</strong>
                        <div style={{whiteSpace: 'pre-line'}}>Energias ancestrais despertam e fortalecem monstros e seres puros. Apenas os dignos sentirão o poder fluir sob seus pés.</div>
                        <div className="card-preview-field-effects">
                          <strong>Efeitos:</strong>
                          <ul>
                            <li>Criaturas do elemento <b>puro</b>: +1 Dano / +1 HP</li>
                            <li>Criaturas do tipo <b>monstro</b>: +1 Dano / +1 HP</li>
                            <li><b>Puras e Monstros</b>: +2 Dano / +2 HP</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ transform: 'scale(0.25)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                    <CreatureCardPreview creature={card.data} onClose={null} level={displayLevel} isHolo={displayIsHolo} allowFlip={false} />
                  </div>
                )}
                <div className="deck-library-card-count">{countInDeck}/{availableCount + countInDeck}</div>
                {hasMultipleInstances && availableCount > 0 && (<div className="multiple-instances-indicator" title="Múltiplas cópias disponíveis">{availableCount}x</div>)}
              </div>
            );
          })}
        </div>
        {hoveredCardForInstances && (
          <div className="instances-tooltip" style={{ position: 'fixed', left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px`, zIndex: 9999 }}>
            <div className="instances-tooltip-header"><strong>Cópias Disponíveis</strong><span className="instances-tooltip-count">{getCardInstances(hoveredCardForInstances).length} cópias</span></div>
            <div className="instances-tooltip-list">{getCardInstances(hoveredCardForInstances).sort((a, b) => { if (b.level !== a.level) return b.level - a.level; return b.xp - a.xp; }).map((instance, idx) => (<div key={instance.instanceId} className="instances-tooltip-item"><span className="instance-copy-number">#{idx + 1}</span><span className="instance-level">Nv. {instance.level}</span><span className="instance-xp">{instance.xp} XP</span>{instance.isHolo && <span className="instance-holo-badge">✨ Holo</span>}</div>))}</div>
            <div className="instances-tooltip-hint">Clique para selecionar qual usar</div>
          </div>
        )}
        {hoveredCard && hoveredCardId && (
          <div className="deck-card-preview-hover">
            {hoveredCard.id === 'f001' ? (
              <div className="slider-card-wrapper active">
                <div className="card-preview card-preview-field">
                  <div className="card-preview-header">
                    <span className="card-preview-name">Campo em Reuínas</span>
                    <span className="card-preview-id">#f001</span>
                  </div>
                  <div className="card-preview-art-wrapper">
                    <img alt="Campo em Reuínas" className="card-preview-art" src={require(`../assets/${hoveredCard.image}`)} />
                  </div>
                  <div className="card-preview-field-desc">
                    <strong>Descrição:</strong>
                    <div style={{whiteSpace: 'pre-line'}}>Energias ancestrais despertam e fortalecem monstros e seres puros. Apenas os dignos sentirão o poder fluir sob seus pés.</div>
                    <div className="card-preview-field-effects">
                      <strong>Efeitos:</strong>
                      <ul>
                        <li>Criaturas do elemento <b>puro</b>: +1 Dano / +1 HP</li>
                        <li>Criaturas do tipo <b>monstro</b>: +1 Dano / +1 HP</li>
                        <li><b>Puras e Monstros</b>: +2 Dano / +2 HP</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              (() => {
                const bestInstance = getBestInstance(hoveredCardId);
                return (
                  <CreatureCardPreview creature={hoveredCard} onClose={null} level={bestInstance?.level || 1} isHolo={bestInstance?.isHolo || false} allowFlip={false} />
                );
              })()
            )}
          </div>
        )}
        {showSavedToast && <div className="deck-saved-toast">✓ Salvo</div>}
        {showInstanceSelector && selectedCardForInstance && (
          <CardInstanceSelector cardId={selectedCardForInstance} cardData={getCardData(selectedCardForInstance)} instances={getAvailableInstances(selectedCardForInstance)} onSelect={handleInstanceSelected} onClose={() => setShowInstanceSelector(false)} title={lang === 'ptbr' ? 'Selecione uma cópia para o deck' : 'Select a card copy for deck'} lang={lang} />
        )}
      </div>
    </div>
  );
}

export default DeckEditor;
