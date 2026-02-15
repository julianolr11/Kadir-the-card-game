import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { getCreatureRarity, RARITY_CONFIG, getCardValue } from '../assets/rarityData.js';
import creaturePool from '../assets/cards';
import '../styles/card-recycler.css';

// Imports dos ícones de elementos
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

function CardRecycler({ lang = 'ptbr' }) {
  const { cardCollection, addCoins, removeCardInstance } = useContext(AppContext);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [expandedRarity, setExpandedRarity] = useState(null);
  const [expandedSubsections, setExpandedSubsections] = useState({});
  const [recyclingInProgress, setRecyclingInProgress] = useState(false);

  const langKey = lang === 'ptbr' ? 'pt' : lang;

  // Agrupa cards por raridade
  const cardsByRarity = useMemo(() => {
    const grouped = {
      essence: [],
      field: [],
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    };

    if (!cardCollection || typeof cardCollection !== 'object') return grouped;

    // Para cada criatura na coleção
    Object.entries(cardCollection).forEach(([creatureId, instances]) => {
      if (!Array.isArray(instances)) return;

      instances.forEach((instance, instanceIndex) => {
        const key = `${creatureId}_${instanceIndex}`;

        // Pula cartas que já estão selecionadas
        if (selectedCards.has(key)) return;

        const creatureData = creaturePool.find(c => c.id === creatureId);
        const cardValue = getCardValue(creatureId, instance, creatureData);
        const rarity = getCreatureRarity(creatureId);

        // Decide target group: essence and field are top-level categories
        const type = typeof creatureData?.type === 'string' ? creatureData.type : 'creature';
        if (type === 'field') {
          grouped.field.push({
            ...instance,
            creatureId,
            originalIndex: instanceIndex,
            rarity: 'field',
            value: cardValue,
          });
        } else if (type === 'effect' && creatureData?.effectType === 'essence') {
          grouped.essence.push({
            ...instance,
            creatureId,
            originalIndex: instanceIndex,
            rarity: 'essence',
            value: cardValue,
          });
        } else if (grouped[rarity.rarity]) {
          grouped[rarity.rarity].push({
            ...instance,
            creatureId,
            originalIndex: instanceIndex,
            rarity: rarity.rarity,
            value: cardValue,
          });
        }
      });
    });

    return grouped;
  }, [cardCollection, selectedCards]);

  // Calcula valor total a receber
  const totalCoinsCalculated = useMemo(() => {
    let total = 0;
    selectedCards.forEach((key) => {
      const [creatureId, index] = key.split('_');
      const instances = cardCollection?.[creatureId];
      if (instances && instances[index]) {
        const instance = instances[index];
        const creatureData = creaturePool.find(c => c.id === creatureId);
        total += getCardValue(creatureId, instance, creatureData);
      }
    });
    return total;
  }, [selectedCards, cardCollection]);

  const toggleCardSelection = (creatureId, index) => {
    const key = `${creatureId}_${index}`;
    const newSelected = new Set(selectedCards);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedCards(newSelected);
  };

  const handleRecycleCards = async () => {
    if (selectedCards.size === 0) return;

    setRecyclingInProgress(true);
    try {
      // Oferece moedas
      addCoins(totalCoinsCalculated);

      // Remove cards da coleção
      selectedCards.forEach((key) => {
        const [creatureId, index] = key.split('_');
        const instances = cardCollection?.[creatureId];
        if (instances && instances[index]) {
          const instanceId = instances[index].instanceId;
          removeCardInstance(creatureId, instanceId);
        }
      });

      // Limpa seleção
      setSelectedCards(new Set());

      // Feedback visual
      setTimeout(() => setRecyclingInProgress(false), 500);
    } catch (error) {
      console.error('Erro ao reciclar cards:', error);
      setRecyclingInProgress(false);
    }
  };

  const getRarityColor = (rarity) => {
    if (rarity === 'essence') return '#7bd26b';
    if (rarity === 'field') return '#66c2ff';
    return RARITY_CONFIG[rarity]?.color || '#ffffff';
  };

  const getRarityName = (rarity) => {
    if (rarity === 'essence') return 'Essência';
    if (rarity === 'field') return 'Campo';
    return RARITY_CONFIG[rarity]?.name || rarity;
  };

  // Pega todas as cartas selecionadas com detalhes
  const selectedCardsDetails = useMemo(() => {
    const details = [];
    selectedCards.forEach((key) => {
      const [creatureId, index] = key.split('_');
      const instances = cardCollection?.[creatureId];
      if (instances && instances[index]) {
        const instance = instances[index];
        const creatureData = creaturePool.find(c => c.id === creatureId);
        const rarity = getCreatureRarity(creatureId);
        const value = getCardValue(creatureId, instance, creatureData);
        details.push({
          key,
          creatureId,
          index,
          instance,
          creatureData,
          value,
          name: creatureData
            ? (typeof creatureData.name === 'object' ? creatureData.name[langKey] : creatureData.name)
            : creatureId,
          element: creatureData?.element || 'puro',
          img: creatureData?.img,
        });
      }
    });
    return details;
  }, [selectedCards, cardCollection, langKey]);

  const toggleSubsection = (rarity, section) => {
    const key = `${rarity}_${section}`;
    setExpandedSubsections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCardItem = (card) => {
    const key = `${card.creatureId}_${card.originalIndex}`;
    const isSelected = selectedCards.has(key);
    const creatureData = creaturePool.find(c => c.id === card.creatureId);
    const cardName = creatureData
      ? (typeof creatureData.name === 'object' ? creatureData.name[langKey] : creatureData.name)
      : card.creatureId;
    const cardElement = creatureData?.element || 'puro';
    const cardImg = creatureData?.img;

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

    return (
      <div
        key={key}
        className={`recycled-card-item ${isSelected ? 'selected' : ''}`}
        onClick={() => toggleCardSelection(card.creatureId, card.originalIndex)}
        style={{ borderLeftColor: elementColors[cardElement] || '#a87e2d' }}
      >
        <div className="card-item-thumbnail">
          {cardImg && (
            <img
              src={typeof cardImg === 'string' ? cardImg : cardImg?.default || ''}
              alt={cardName}
              className="card-thumbnail-img"
            />
          )}
        </div>
        <div className="card-item-info">
          <div className="card-item-header">
            <div className="card-item-name">
              {cardName}
              {card.isHolo && <span className="holo-badge">✨</span>}
            </div>
            {elementIcons[cardElement] && (
              <img
                src={elementIcons[cardElement]}
                alt={cardElement}
                className="card-element-icon"
              />
            )}
          </div>
          <div className="card-item-details">
            <span className="card-detail-item">Nv. {card.level ?? 0}</span>
            <span className="card-detail-separator">•</span>
            <span className="card-detail-item">XP: {card.xp || 0}</span>
            <span className="card-detail-separator">•</span>
            <span className="card-detail-item" style={{ fontSize: '0.7rem', opacity: 0.6 }}>ID: {card.instanceId?.slice(0, 6)}</span>
          </div>
        </div>
        <div className="card-item-value">
          +{card.value} <span className="coin-icon">🪙</span>
        </div>
      </div>
    );
  };

  return (
    <div className="recycler-layout">
      {/* Coluna Esquerda: Lista de Cartas Disponíveis */}
      <div className="recycler-left">
        <div className="recycler-section-header">
          <h3>Cartas Disponíveis</h3>
        </div>
        <div className="recycler-rarities">
          {Object.entries(cardsByRarity).map(([rarity, cards]) => (
            <div key={rarity} className="rarity-section">
              <button
                className="rarity-header-btn"
                onClick={() => setExpandedRarity(expandedRarity === rarity ? null : rarity)}
                style={{
                  borderLeftColor: getRarityColor(rarity),
                }}
              >
                <span className="rarity-label">{getRarityName(rarity)}</span>
                <span className="rarity-count">{cards.length} cartas</span>
                <span className="expand-icon">
                  {expandedRarity === rarity ? '▼' : '▶'}
                </span>
              </button>

              {expandedRarity === rarity && (
                <div className="rarity-cards-list">
                  {(() => {

                    // Top-level 'essence' and 'field' sections render a flat list
                    if (rarity === 'essence') {
                      if (!cards.length) return <div className="rarity-empty">Nenhuma carta de essência</div>;
                      return <div className="subsection-list">{cards.map(c => renderCardItem(c))}</div>;
                    }

                    if (rarity === 'field') {
                      if (!cards.length) return <div className="rarity-empty">Nenhuma carta de campo</div>;
                      return <div className="subsection-list">{cards.map(c => renderCardItem(c))}</div>;
                    }

                    // For 'common' rarity, show only creature cards as a flat list (no subsections)
                    if (rarity === 'common') {
                      const creatureCardsOnly = cards.filter(card => {
                        const cd = creaturePool.find(c => c.id === card.creatureId);
                        const t = (typeof cd?.type === 'string') ? cd.type : 'creature';
                        return t !== 'field' && !(t === 'effect' && cd?.effectType === 'essence');
                      });
                      if (!creatureCardsOnly.length) return <div className="rarity-empty">Nenhuma carta {getRarityName(rarity).toLowerCase()}</div>;
                      return <div className="subsection-list">{creatureCardsOnly.map(c => renderCardItem(c))}</div>;
                    }

                    // For rarity groups, show only creature cards as a flat list (no subsections)
                    const creatureCardsOnly = cards.filter(card => {
                      const cd = creaturePool.find(c => c.id === card.creatureId);
                      const t = (typeof cd?.type === 'string') ? cd.type : 'creature';
                      return t !== 'field' && !(t === 'effect' && cd?.effectType === 'essence');
                    });

                    if (!creatureCardsOnly.length) {
                      return <div className="rarity-empty">Nenhuma carta {getRarityName(rarity).toLowerCase()}</div>;
                    }

                    return (
                      <div>
                        <div className="subsection-list">
                          {creatureCardsOnly.map(c => renderCardItem(c))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Divisor */}
      <div className="recycler-divider"></div>

      {/* Coluna Direita: Cartas Selecionadas */}
      <div className="recycler-right">
        <div className="recycler-section-header">
          <h3>Cartas para Reciclar</h3>
          <span className="selected-badge">{selectedCards.size}</span>
        </div>

        <div className="selected-cards-list">
          {selectedCardsDetails.length > 0 ? (
            selectedCardsDetails.map((card) => {
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

              return (
                <div
                  key={card.key}
                  className="selected-card-item"
                  style={{ borderLeftColor: elementColors[card.element] || '#a87e2d' }}
                >
                  <button
                    className="remove-card-btn"
                    onClick={() => toggleCardSelection(card.creatureId, card.index)}
                    title="Remover"
                  >
                    ×
                  </button>
                  <div className="card-item-thumbnail">
                    {card.img && (
                      <img
                        src={typeof card.img === 'string' ? card.img : card.img?.default || ''}
                        alt={card.name}
                        className="card-thumbnail-img"
                      />
                    )}
                  </div>
                  <div className="card-item-info">
                    <div className="card-item-header">
                      <div className="card-item-name">
                        {card.name}
                        {card.instance.isHolo && <span className="holo-badge">✨</span>}
                      </div>
                      {elementIcons[card.element] && (
                        <img
                          src={elementIcons[card.element]}
                          alt={card.element}
                          className="card-element-icon"
                        />
                      )}
                    </div>
                    <div className="card-item-details">
                      <span className="card-detail-item">Nv. {card.instance.level ?? 0}</span>
                      <span className="card-detail-separator">•</span>
                      <span className="card-detail-item">XP: {card.instance.xp || 0}</span>
                    </div>
                  </div>
                  <div className="card-item-value">
                    +{card.value} <span className="coin-icon">🪙</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="selected-empty">
              <p>Nenhuma carta selecionada</p>
              <p className="selected-empty-hint">Clique nas cartas da esquerda para adicionar</p>
            </div>
          )}
        </div>

        {/* Footer com Total e Botão */}
        <div className="recycler-footer">
          <div className="recycler-summary">
            <span className="total-coins-label">Ganho Total:</span>
            <span className="total-coins-value">
              <strong>{totalCoinsCalculated}</strong> <span className="coin-icon">🪙</span>
            </span>
          </div>

          <button
            className={`recycle-button ${selectedCards.size === 0 ? 'disabled' : ''} ${recyclingInProgress ? 'recycling' : ''}`}
            onClick={handleRecycleCards}
            disabled={selectedCards.size === 0 || recyclingInProgress}
          >
            {recyclingInProgress ? 'Reciclando...' : 'Reciclar Cartas'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardRecycler;
