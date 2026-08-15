import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { getCreatureRarity, RARITY_CONFIG, getCardValue } from '../assets/rarityData.js';
import creaturePool from '../assets/cards';
import CreatureCardPreview from './CreatureCardPreview.jsx';
import '../styles/card-recycler.css';

import aguaIcon from '../assets/img/elements/agua.png';
import arIcon from '../assets/img/elements/ar.png';
import fogoIcon from '../assets/img/elements/fogo.png';
import puroIcon from '../assets/img/elements/puro.png';
import terraIcon from '../assets/img/elements/terra.png';

const elementIcons = {
  agua: aguaIcon,
  water: aguaIcon,
  ar: arIcon,
  air: arIcon,
  fogo: fogoIcon,
  fire: fogoIcon,
  puro: puroIcon,
  pure: puroIcon,
  terra: terraIcon,
  earth: terraIcon,
};

const elementColors = {
  agua: '#4a9eff',
  water: '#4a9eff',
  fogo: '#ff5722',
  fire: '#ff5722',
  terra: '#8b6f47',
  earth: '#8b6f47',
  ar: '#a8dadc',
  air: '#a8dadc',
  puro: '#e8d4b0',
  pure: '#e8d4b0',
};

const elementNames = {
  agua: { pt: 'Água', en: 'Water' },
  water: { pt: 'Água', en: 'Water' },
  fogo: { pt: 'Fogo', en: 'Fire' },
  fire: { pt: 'Fogo', en: 'Fire' },
  terra: { pt: 'Terra', en: 'Earth' },
  earth: { pt: 'Terra', en: 'Earth' },
  ar: { pt: 'Ar', en: 'Air' },
  air: { pt: 'Ar', en: 'Air' },
  puro: { pt: 'Puro', en: 'Pure' },
  pure: { pt: 'Puro', en: 'Pure' },
};

function getLocalizedName(value, langKey, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value[langKey] || value.pt || value.en || fallback;
  return value;
}

function getImageSrc(img) {
  if (!img) return '';
  return typeof img === 'string' ? img : img?.default || '';
}

function parseCardInstanceKey(key) {
  const separatorIndex = key.indexOf('::');
  if (separatorIndex < 0) return { cardId: key, index: -1 };
  return {
    cardId: key.slice(0, separatorIndex),
    instanceId: key.slice(separatorIndex + 2),
  };
}

function CardRecycler({ lang = 'ptbr' }) {
  const { cardCollection, decks, activeGuardian, recycleCardInstances } = useContext(AppContext);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [focusedCardId, setFocusedCardId] = useState(null);
  const [sendQuantity, setSendQuantity] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [rarityFilter, setRarityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [valueFilter, setValueFilter] = useState('all');
  const [quantityFilter, setQuantityFilter] = useState('all');
  const [recyclingInProgress, setRecyclingInProgress] = useState(false);

  const langKey = lang === 'ptbr' ? 'pt' : lang;
  const isEn = langKey === 'en';

  const protectedInstanceIds = useMemo(() => {
    const ids = new Set();
    Object.values(decks || {}).forEach((deck) => {
      (deck?.cards || []).filter(Boolean).forEach((instanceId) => ids.add(instanceId));
    });
    if (activeGuardian?.selectedInstanceId) ids.add(activeGuardian.selectedInstanceId);
    return ids;
  }, [activeGuardian?.selectedInstanceId, decks]);

  const availableCards = useMemo(() => {
    if (!cardCollection || typeof cardCollection !== 'object') return [];

    return Object.entries(cardCollection)
      .map(([creatureId, instances]) => {
        if (!Array.isArray(instances)) return null;

        const creatureData = creaturePool.find((card) => card.id === creatureId);
        const availableInstances = instances
          .map((instance, index) => ({
            instance,
            index,
            key: `${creatureId}::${instance.instanceId}`,
            value: getCardValue(creatureId, instance, creatureData),
          }))
          .filter((item) => item.instance?.instanceId && !protectedInstanceIds.has(item.instance.instanceId))
          .filter((item) => !selectedCards.has(item.key));

        if (availableInstances.length === 0) return null;

        const rarityData = getCreatureRarity(creatureId);
        const type = typeof creatureData?.type === 'string' ? creatureData.type : 'creature';
        const rarityKey = type === 'field'
          ? 'field'
          : type === 'effect' && creatureData?.effectType === 'essence'
            ? 'essence'
            : rarityData.rarity;

        return {
          creatureId,
          creatureData,
          name: getLocalizedName(creatureData?.name || creatureData?.title, langKey, creatureId),
          element: creatureData?.element || 'puro',
          img: creatureData?.img,
          type,
          rarity: rarityKey,
          rarityName: rarityKey === 'field'
            ? (langKey === 'en' ? 'Field' : 'Campo')
            : rarityKey === 'essence'
              ? (langKey === 'en' ? 'Essence' : 'Essencia')
              : getLocalizedName(RARITY_CONFIG[rarityKey]?.name, langKey, rarityKey),
          rarityColor: rarityKey === 'field'
            ? '#66c2ff'
            : rarityKey === 'essence'
              ? '#7bd26b'
              : RARITY_CONFIG[rarityKey]?.color || '#ffffff',
          quantity: availableInstances.length,
          valueEach: availableInstances[0]?.value || 0,
          instances: availableInstances,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cardCollection, langKey, protectedInstanceIds, selectedCards]);

  const filteredCards = useMemo(() => {
    return availableCards.filter((card) => {
      if (rarityFilter !== 'all' && card.rarity !== rarityFilter) return false;
      if (typeFilter !== 'all' && card.type !== typeFilter) return false;

      if (valueFilter === 'low' && card.valueEach > 50) return false;
      if (valueFilter === 'mid' && (card.valueEach < 51 || card.valueEach > 150)) return false;
      if (valueFilter === 'high' && card.valueEach < 151) return false;

      if (quantityFilter === 'one' && card.quantity !== 1) return false;
      if (quantityFilter === 'few' && (card.quantity < 2 || card.quantity > 4)) return false;
      if (quantityFilter === 'many' && card.quantity < 5) return false;

      return true;
    });
  }, [availableCards, quantityFilter, rarityFilter, typeFilter, valueFilter]);

  const selectedCardsDetails = useMemo(() => {
    const grouped = new Map();

    selectedCards.forEach((key) => {
      const { cardId: creatureId, instanceId } = parseCardInstanceKey(key);
      const instances = cardCollection?.[creatureId];
      const instance = instances?.find((item) => item?.instanceId === instanceId);
      if (!instance) return;

      const creatureData = creaturePool.find((card) => card.id === creatureId);
      const value = getCardValue(creatureId, instance, creatureData);
      const rarityData = getCreatureRarity(creatureId);

      if (!grouped.has(creatureId)) {
        grouped.set(creatureId, {
          creatureId,
          name: getLocalizedName(creatureData?.name || creatureData?.title, langKey, creatureId),
          element: creatureData?.element || 'puro',
          img: creatureData?.img,
          rarityName: getLocalizedName(RARITY_CONFIG[rarityData.rarity]?.name, langKey, rarityData.rarity),
          keys: [],
          quantity: 0,
          valueEach: value,
          totalValue: 0,
        });
      }

      const entry = grouped.get(creatureId);
      entry.keys.push(key);
      entry.quantity += 1;
      entry.totalValue += value;
    });

    return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [cardCollection, langKey, selectedCards]);

  const totalCoinsCalculated = useMemo(
    () => selectedCardsDetails.reduce((total, card) => total + card.totalValue, 0),
    [selectedCardsDetails],
  );

  const availableCardsCount = useMemo(
    () => availableCards.reduce((total, card) => total + card.quantity, 0),
    [availableCards],
  );

  const potentialCoins = useMemo(
    () => availableCards.reduce((total, card) => total + card.quantity * card.valueEach, 0),
    [availableCards],
  );

  const focusedCard = useMemo(() => {
    if (focusedCardId) {
      const found = filteredCards.find((card) => card.creatureId === focusedCardId);
      if (found) return found;
    }
    return filteredCards[0] || null;
  }, [filteredCards, focusedCardId]);

  useEffect(() => {
    if (!focusedCard) {
      setFocusedCardId(null);
      setSendQuantity(1);
      return;
    }

    setFocusedCardId(focusedCard.creatureId);
    setSendQuantity((current) => Math.min(Math.max(current, 1), focusedCard.quantity));
  }, [focusedCard]);

  const focusCard = (creatureId) => {
    setFocusedCardId(creatureId);
    setSendQuantity(1);
  };

  const sendFocusedToQueue = () => {
    if (!focusedCard) return;

    const nextSelected = new Set(selectedCards);
    focusedCard.instances.slice(0, sendQuantity).forEach((item) => {
      nextSelected.add(item.key);
    });
    setSelectedCards(nextSelected);
  };

  const removeOneFromQueue = (card) => {
    const nextSelected = new Set(selectedCards);
    const lastKey = card.keys[card.keys.length - 1];
    if (lastKey) nextSelected.delete(lastKey);
    setSelectedCards(nextSelected);
  };

  const removeAllFromQueue = (card) => {
    const nextSelected = new Set(selectedCards);
    card.keys.forEach((key) => nextSelected.delete(key));
    setSelectedCards(nextSelected);
  };

  const clearSelection = () => {
    setSelectedCards(new Set());
  };

  const handleRecycleCards = () => {
    if (selectedCards.size === 0 || recyclingInProgress) return;

    setRecyclingInProgress(true);
    try {
      const requests = Array.from(selectedCards, (key) => parseCardInstanceKey(key));
      const result = recycleCardInstances(requests);
      if (result.skipped.length > 0) {
        console.warn('Algumas cartas não foram recicladas por estarem em uso ou não existirem mais.', result.skipped);
      }

      setSelectedCards(new Set());
      setTimeout(() => setRecyclingInProgress(false), 500);
    } catch (error) {
      console.error('Erro ao reciclar cards:', error);
      setRecyclingInProgress(false);
    }
  };

  return (
    <div className="recycler-layout recycler-workbench">
      <div className="recycler-hero">
        <div>
          <span className="recycler-eyebrow">{isEn ? 'Recycle cards' : 'Reciclar cartas'}</span>
          <h2>{isEn ? 'Choose, queue up and recycle' : 'Escolha, envie para a fila e recicle'}</h2>
          <p>{isEn ? 'See every card like in the editor, check quantity, rarity and value before sending to recycling.' : 'Veja todas as cartas como no editar, confira quantidade, raridade e valor antes de enviar para reciclagem.'}</p>
        </div>
        <div className="recycler-metrics">
          <div className="recycler-metric">
            <span>{isEn ? 'Available' : 'Disponiveis'}</span>
            <strong>{availableCardsCount}</strong>
          </div>
          <div className="recycler-metric">
            <span>{isEn ? 'Queued' : 'Na fila'}</span>
            <strong>{selectedCards.size}</strong>
          </div>
          <div className="recycler-metric recycler-metric-gold">
            <span>{isEn ? 'Total' : 'Total'}</span>
            <strong>{totalCoinsCalculated}</strong>
          </div>
        </div>
      </div>

      <div className="recycler-columns">
        <div className="recycler-left recycler-browser">
          <div className="recycler-grid-panel">
            <div className="recycler-section-header">
              <div>
                <span className="section-kicker">{isEn ? 'Collection' : 'Colecao'}</span>
                <h3>{isEn ? 'All cards' : 'Todas as cartas'}</h3>
              </div>
              <div className="recycler-collection-actions">
                <span className="recycler-small-total">{filteredCards.length}/{availableCards.length} {isEn ? 'cards' : 'cartas'}</span>
                <button
                  type="button"
                  className={`recycler-filter-toggle ${filtersOpen ? 'active' : ''}`}
                  onClick={() => setFiltersOpen((open) => !open)}
                >
                  {isEn ? 'Filters' : 'Filtros'}
                </button>
              </div>
            </div>

            {filtersOpen && (
              <div className="recycler-filter-bar">
                <label>
                  <span>{isEn ? 'Rarity' : 'Raridade'}</span>
                  <select value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value)}>
                    <option value="all">{isEn ? 'All' : 'Todas'}</option>
                    <option value="essence">{isEn ? 'Essence' : 'Essencia'}</option>
                    <option value="field">{isEn ? 'Field' : 'Campo'}</option>
                    <option value="common">{isEn ? 'Common' : 'Comum'}</option>
                    <option value="uncommon">{isEn ? 'Uncommon' : 'Incomum'}</option>
                    <option value="rare">{isEn ? 'Rare' : 'Rara'}</option>
                    <option value="epic">{isEn ? 'Epic' : 'Epica'}</option>
                    <option value="legendary">{isEn ? 'Legendary' : 'Lendaria'}</option>
                  </select>
                </label>
                <label>
                  <span>{isEn ? 'Type' : 'Tipo'}</span>
                  <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                    <option value="all">{isEn ? 'All' : 'Todos'}</option>
                    <option value="creature">{isEn ? 'Creature' : 'Criatura'}</option>
                    <option value="effect">{isEn ? 'Effect' : 'Efeito'}</option>
                    <option value="field">{isEn ? 'Field' : 'Campo'}</option>
                  </select>
                </label>
                <label>
                  <span>{isEn ? 'Value' : 'Valor'}</span>
                  <select value={valueFilter} onChange={(event) => setValueFilter(event.target.value)}>
                    <option value="all">{isEn ? 'All' : 'Todos'}</option>
                    <option value="low">{isEn ? 'Up to 50' : 'Ate 50'}</option>
                    <option value="mid">{isEn ? '51 to 150' : '51 a 150'}</option>
                    <option value="high">151+</option>
                  </select>
                </label>
                <label>
                  <span>{isEn ? 'Quantity' : 'Quantidade'}</span>
                  <select value={quantityFilter} onChange={(event) => setQuantityFilter(event.target.value)}>
                    <option value="all">{isEn ? 'All' : 'Todas'}</option>
                    <option value="one">1x</option>
                    <option value="few">{isEn ? '2x to 4x' : '2x a 4x'}</option>
                    <option value="many">5x+</option>
                  </select>
                </label>
              </div>
            )}

            <div className="recycler-card-grid">
              {filteredCards.length > 0 ? (
                filteredCards.map((card) => {
                  const isFocused = focusedCard?.creatureId === card.creatureId;
                  const imgSrc = getImageSrc(card.img);

                  return (
                    <button
                      type="button"
                      key={card.creatureId}
                      className={`recycler-card-tile ${isFocused ? 'focused' : ''}`}
                      onClick={() => focusCard(card.creatureId)}
                      style={{ borderColor: isFocused ? card.rarityColor : undefined }}
                    >
                      <span className="recycler-card-qty">{card.quantity}x</span>
                      {imgSrc ? (
                        <img src={imgSrc} alt={card.name} />
                      ) : (
                        <span className="recycler-card-placeholder">{card.name.slice(0, 2).toUpperCase()}</span>
                      )}
                      <span className="recycler-card-name">{card.name}</span>
                    </button>
                  );
                })
              ) : (
                <div className="recycler-empty-grid">{isEn ? 'No cards found with these filters.' : 'Nenhuma carta encontrada com esses filtros.'}</div>
              )}
            </div>
          </div>

          <aside className="recycler-detail-panel">
            {focusedCard ? (
              <>
                <div className="recycler-full-card-preview">
                  {focusedCard.creatureData ? (
                    <CreatureCardPreview
                      creature={focusedCard.creatureData}
                      level={focusedCard.instances[0]?.instance?.level ?? 0}
                      isHolo={Boolean(focusedCard.instances[0]?.instance?.isHolo)}
                      allowFlip={false}
                    />
                  ) : (
                    <div className="recycler-detail-image" style={{ borderColor: focusedCard.rarityColor }}>
                      {getImageSrc(focusedCard.img) ? (
                        <img src={getImageSrc(focusedCard.img)} alt={focusedCard.name} />
                      ) : (
                        <span>{focusedCard.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="recycler-detail-copy">
                  <span className="recycler-eyebrow">{isEn ? 'Selected card' : 'Carta selecionada'}</span>
                  <h3>{focusedCard.name}</h3>
                  <div className="recycler-detail-tags">
                    <span style={{ borderColor: focusedCard.rarityColor }}>{focusedCard.rarityName}</span>
                    {elementIcons[focusedCard.element] && (
                      <span>
                        <img src={elementIcons[focusedCard.element]} alt={focusedCard.element} />
                        {elementNames[focusedCard.element]?.[langKey] || focusedCard.element}
                      </span>
                    )}
                  </div>
                </div>

                <div className="recycler-detail-stats">
                  <div>
                    <span>{isEn ? 'Value each' : 'Valor cada'}</span>
                    <strong>{focusedCard.valueEach}</strong>
                  </div>
                  <div>
                    <span>{isEn ? 'Send value' : 'Valor envio'}</span>
                    <strong>{focusedCard.valueEach * sendQuantity}</strong>
                  </div>
                </div>

                <div className="recycler-send-row">
                  <label htmlFor="recycle-quantity">{isEn ? 'Send quantity' : 'Enviar quantidade'}</label>
                  <div className="recycler-stepper">
                    <button
                      type="button"
                      onClick={() => setSendQuantity((value) => Math.max(1, value - 1))}
                      disabled={sendQuantity <= 1}
                    >
                      -
                    </button>
                    <input
                      id="recycle-quantity"
                      type="number"
                      min="1"
                      max={focusedCard.quantity}
                      value={sendQuantity}
                      onChange={(event) => {
                        const next = Number(event.target.value) || 1;
                        setSendQuantity(Math.min(Math.max(next, 1), focusedCard.quantity));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSendQuantity((value) => Math.min(focusedCard.quantity, value + 1))}
                      disabled={sendQuantity >= focusedCard.quantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button type="button" className="send-to-recycle-btn" onClick={sendFocusedToQueue}>
                  {isEn ? 'Send' : 'Enviar'}
                </button>
              </>
            ) : (
              <div className="selected-empty">
                <div className="selected-empty-icon">+</div>
                <p>{isEn ? 'No card available' : 'Nenhuma carta disponivel'}</p>
              </div>
            )}
          </aside>
        </div>

        <div className="recycler-divider" />

        <div className="recycler-right">
          <div className="recycler-section-header">
            <div>
              <span className="section-kicker">{isEn ? 'Queue' : 'Fila'}</span>
              <h3>{isEn ? 'Cards to recycle' : 'Cartas para reciclar'}</h3>
            </div>
            <div className="selected-header-actions">
              {selectedCards.size > 0 && (
                <button type="button" className="clear-selection-btn" onClick={clearSelection}>
                  {isEn ? 'Clear' : 'Limpar'}
                </button>
              )}
              <span className="selected-badge">{selectedCards.size}</span>
            </div>
          </div>

          <div className="selected-cards-list">
            {selectedCardsDetails.length > 0 ? (
              selectedCardsDetails.map((card) => (
                <div
                  key={card.creatureId}
                  className="selected-card-item"
                  style={{ borderLeftColor: elementColors[card.element] || '#a87e2d' }}
                >
                  <div className="card-item-thumbnail">
                    {getImageSrc(card.img) && (
                      <img src={getImageSrc(card.img)} alt={card.name} className="card-thumbnail-img" />
                    )}
                  </div>
                  <div className="card-item-info">
                    <div className="card-item-header">
                      <div className="card-item-name">{card.name}</div>
                      <span className="queue-quantity">{card.quantity}x</span>
                    </div>
                    <div className="card-item-details">
                      <span className="card-detail-item">{card.rarityName}</span>
                      <span className="card-detail-separator">/</span>
                      <span className="card-detail-item">{card.valueEach} {isEn ? 'each' : 'cada'}</span>
                    </div>
                  </div>
                  <div className="card-item-value">+{card.totalValue}</div>
                  <div className="queue-item-actions">
                    <button
                      className="remove-card-btn"
                      onClick={() => removeOneFromQueue(card)}
                      title={isEn ? 'Decrease quantity' : 'Diminuir quantidade'}
                      aria-label={isEn ? `Remove one copy of ${card.name}` : `Remover uma cópia de ${card.name}`}
                      type="button"
                    >
                      −
                    </button>
                    <button
                      className="remove-all-card-btn"
                      onClick={() => removeAllFromQueue(card)}
                      title={isEn ? 'Remove from queue' : 'Remover da fila'}
                      aria-label={isEn ? `Remove all copies of ${card.name}` : `Remover todas as cópias de ${card.name}`}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="selected-empty">
                <div className="selected-empty-icon">+</div>
                <p>{isEn ? 'No card in the queue' : 'Nenhuma carta na fila'}</p>
                <p className="selected-empty-hint">{isEn ? 'Click a card on the left and use Send to add it here.' : 'Clique em uma carta da esquerda e use Enviar para adicionar aqui.'}</p>
              </div>
            )}
          </div>

          <div className="recycler-footer">
            <div className="recycler-summary">
              <span className="total-coins-label">{isEn ? 'Total value' : 'Valor total'}</span>
              <span className="total-coins-value">
                <strong>{totalCoinsCalculated}</strong> {isEn ? 'coins' : 'moedas'}
              </span>
            </div>

            <button
              className={`recycle-button ${selectedCards.size === 0 ? 'disabled' : ''} ${recyclingInProgress ? 'recycling' : ''}`}
              onClick={handleRecycleCards}
              disabled={selectedCards.size === 0 || recyclingInProgress}
              type="button"
            >
              {recyclingInProgress ? (isEn ? 'Recycling...' : 'Reciclando...') : (isEn ? 'Recycle' : 'Reciclar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardRecycler;
