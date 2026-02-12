import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { getCreatureRarity, RARITY_CONFIG } from '../assets/rarityData.js';
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
  const [recyclingInProgress, setRecyclingInProgress] = useState(false);

  const langKey = lang === 'ptbr' ? 'pt' : lang;

  // Agrupa cards por raridade
  const cardsByRarity = useMemo(() => {
    const grouped = {
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

        const rarity = getCreatureRarity(creatureId);
        let baseValue = rarity.value || 10;

        // Bônus por nível (10% por nível, começando do 0)
        const levelBonus = instance.level > 0 ? baseValue * instance.level * 0.1 : 0;
        let cardValue = baseValue + levelBonus;

        // Bônus holo: +50 moedas
        if (instance.isHolo) {
          cardValue += 50;
        }

        if (grouped[rarity.rarity]) {
          grouped[rarity.rarity].push({
            ...instance,
            creatureId,
            originalIndex: instanceIndex,
            rarity: rarity.rarity,
            value: Math.floor(cardValue),
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
        const rarity = getCreatureRarity(creatureId);
        let baseValue = rarity.value || 10;

        // Bônus por nível (10% por nível, começando do 0)
        const levelBonus = instance.level > 0 ? baseValue * instance.level * 0.1 : 0;
        let cardValue = baseValue + levelBonus;

        // Bônus holo: +50 moedas
        if (instance.isHolo) {
          cardValue += 50;
        }

        total += Math.floor(cardValue);
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
    return RARITY_CONFIG[rarity]?.color || '#ffffff';
  };

  const getRarityName = (rarity) => {
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

        let baseValue = rarity.value || 10;
        const levelBonus = instance.level > 0 ? baseValue * instance.level * 0.1 : 0;
        let cardValue = baseValue + levelBonus;
        if (instance.isHolo) cardValue += 50;

        details.push({
          key,
          creatureId,
          index,
          instance,
          creatureData,
          value: Math.floor(cardValue),
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
                  {cards.length > 0 ? (
                    cards.map((card) => {
                      const key = `${card.creatureId}_${card.originalIndex}`;
                      const isSelected = selectedCards.has(key);
                      const creatureData = creaturePool.find(c => c.id === card.creatureId);
                      const cardName = creatureData
                        ? (typeof creatureData.name === 'object' ? creatureData.name[langKey] : creatureData.name)
                        : card.creatureId;
                      const cardElement = creatureData?.element || 'puro';
                      const cardImg = creatureData?.img;

                      // Cores por elemento
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
                    })
                  ) : (
                    <div className="rarity-empty">Nenhuma carta {getRarityName(rarity).toLowerCase()}</div>
                  )}
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
