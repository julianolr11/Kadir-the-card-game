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
            ? 'Campo'
            : rarityKey === 'essence'
              ? 'Essencia'
              : RARITY_CONFIG[rarityKey]?.name || rarityKey,
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
          rarityName: RARITY_CONFIG[rarityData.rarity]?.name || rarityData.rarity,
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
          <span className="recycler-eyebrow">Reciclar cartas</span>
          <h2>Escolha, envie para a fila e recicle</h2>
          <p>Veja todas as cartas como no editar, confira quantidade, raridade e valor antes de enviar para reciclagem.</p>
        </div>
        <div className="recycler-metrics">
          <div className="recycler-metric">
            <span>Disponiveis</span>
            <strong>{availableCardsCount}</strong>
          </div>
          <div className="recycler-metric">
            <span>Na fila</span>
            <strong>{selectedCards.size}</strong>
          </div>
          <div className="recycler-metric recycler-metric-gold">
            <span>Total</span>
            <strong>{totalCoinsCalculated}</strong>
          </div>
        </div>
      </div>

      <div className="recycler-columns">
        <div className="recycler-left recycler-browser">
          <div className="recycler-grid-panel">
            <div className="recycler-section-header">
              <div>
                <span className="section-kicker">Colecao</span>
                <h3>Todas as cartas</h3>
              </div>
              <div className="recycler-collection-actions">
                <span className="recycler-small-total">{filteredCards.length}/{availableCards.length} cartas</span>
                <button
                  type="button"
                  className={`recycler-filter-toggle ${filtersOpen ? 'active' : ''}`}
                  onClick={() => setFiltersOpen((open) => !open)}
                >
                  Filtros
                </button>
              </div>
            </div>

            {filtersOpen && (
              <div className="recycler-filter-bar">
                <label>
                  <span>Raridade</span>
                  <select value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value)}>
                    <option value="all">Todas</option>
                    <option value="essence">Essencia</option>
                    <option value="field">Campo</option>
                    <option value="common">Comum</option>
                    <option value="uncommon">Incomum</option>
                    <option value="rare">Rara</option>
                    <option value="epic">Epica</option>
                    <option value="legendary">Lendaria</option>
                  </select>
                </label>
                <label>
                  <span>Tipo</span>
                  <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                    <option value="all">Todos</option>
                    <option value="creature">Criatura</option>
                    <option value="effect">Efeito</option>
                    <option value="field">Campo</option>
                  </select>
                </label>
                <label>
                  <span>Valor</span>
                  <select value={valueFilter} onChange={(event) => setValueFilter(event.target.value)}>
                    <option value="all">Todos</option>
                    <option value="low">Ate 50</option>
                    <option value="mid">51 a 150</option>
                    <option value="high">151+</option>
                  </select>
                </label>
                <label>
                  <span>Quantidade</span>
                  <select value={quantityFilter} onChange={(event) => setQuantityFilter(event.target.value)}>
                    <option value="all">Todas</option>
                    <option value="one">1x</option>
                    <option value="few">2x a 4x</option>
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
                <div className="recycler-empty-grid">Nenhuma carta encontrada com esses filtros.</div>
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
                  <span className="recycler-eyebrow">Carta selecionada</span>
                  <h3>{focusedCard.name}</h3>
                  <div className="recycler-detail-tags">
                    <span style={{ borderColor: focusedCard.rarityColor }}>{focusedCard.rarityName}</span>
                    {elementIcons[focusedCard.element] && (
                      <span>
                        <img src={elementIcons[focusedCard.element]} alt={focusedCard.element} />
                        {focusedCard.element}
                      </span>
                    )}
                  </div>
                </div>

                <div className="recycler-detail-stats">
                  <div>
                    <span>Valor cada</span>
                    <strong>{focusedCard.valueEach}</strong>
                  </div>
                  <div>
                    <span>Valor envio</span>
                    <strong>{focusedCard.valueEach * sendQuantity}</strong>
                  </div>
                </div>

                <div className="recycler-send-row">
                  <label htmlFor="recycle-quantity">Enviar quantidade</label>
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
                  Enviar
                </button>
              </>
            ) : (
              <div className="selected-empty">
                <div className="selected-empty-icon">+</div>
                <p>Nenhuma carta disponivel</p>
              </div>
            )}
          </aside>
        </div>

        <div className="recycler-divider" />

        <div className="recycler-right">
          <div className="recycler-section-header">
            <div>
              <span className="section-kicker">Fila</span>
              <h3>Cartas para reciclar</h3>
            </div>
            <div className="selected-header-actions">
              {selectedCards.size > 0 && (
                <button type="button" className="clear-selection-btn" onClick={clearSelection}>
                  Limpar
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
                      <span className="card-detail-item">{card.valueEach} cada</span>
                    </div>
                  </div>
                  <div className="card-item-value">+{card.totalValue}</div>
                  <div className="queue-item-actions">
                    <button
                      className="remove-card-btn"
                      onClick={() => removeOneFromQueue(card)}
                      title="Diminuir quantidade"
                      aria-label={`Remover uma cópia de ${card.name}`}
                      type="button"
                    >
                      −
                    </button>
                    <button
                      className="remove-all-card-btn"
                      onClick={() => removeAllFromQueue(card)}
                      title="Remover da fila"
                      aria-label={`Remover todas as cópias de ${card.name}`}
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
                <p>Nenhuma carta na fila</p>
                <p className="selected-empty-hint">Clique em uma carta da esquerda e use Enviar para adicionar aqui.</p>
              </div>
            )}
          </div>

          <div className="recycler-footer">
            <div className="recycler-summary">
              <span className="total-coins-label">Valor total</span>
              <span className="total-coins-value">
                <strong>{totalCoinsCalculated}</strong> moedas
              </span>
            </div>

            <button
              className={`recycle-button ${selectedCards.size === 0 ? 'disabled' : ''} ${recyclingInProgress ? 'recycling' : ''}`}
              onClick={handleRecycleCards}
              disabled={selectedCards.size === 0 || recyclingInProgress}
              type="button"
            >
              {recyclingInProgress ? 'Reciclando...' : 'Reciclar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardRecycler;
