import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { getCreatureRarity, RARITY_CONFIG } from '../assets/rarityData.js';
import creaturePool from '../assets/cards';
import '../styles/card-recycler.css';

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

      instances.forEach((instance) => {
        const rarity = getCreatureRarity(creatureId);
        if (grouped[rarity.rarity]) {
          grouped[rarity.rarity].push({
            ...instance,
            creatureId,
            rarity: rarity.rarity,
            value: rarity.value,
          });
        }
      });
    });

    return grouped;
  }, [cardCollection]);

  // Calcula valor total a receber
  const totalCoinsCalculated = useMemo(() => {
    let total = 0;
    selectedCards.forEach((key) => {
      const [creatureId, index] = key.split('_');
      const rarity = getCreatureRarity(creatureId);
      total += rarity.value;
    });
    return total;
  }, [selectedCards]);

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

  return (
    <div className="card-recycler-panel">
      <div className="recycler-header">
        <h2>Reciclar Cartas</h2>
        <p>Converta cartas repetidas em moedas</p>
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
                  cards.map((card, idx) => {
                    const key = `${card.creatureId}_${idx}`;
                    const isSelected = selectedCards.has(key);
                    const cardName = typeof card.name === 'object'
                      ? card.name[langKey]
                      : card.name;

                    return (
                      <div
                        key={key}
                        className={`recycled-card-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleCardSelection(card.creatureId, idx)}
                      >
                        <div className="card-item-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCardSelection(card.creatureId, idx)}
                          />
                        </div>
                        <div className="card-item-info">
                          <div className="card-item-name">{cardName}</div>
                          <div className="card-item-level">
                            {card.level ? `Nível ${card.level}` : 'Nível 1'}
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

      {/* Footer com resumo e botão */}
      <div className="recycler-footer">
        <div className="recycler-summary">
          <span className="selected-count">
            {selectedCards.size} {selectedCards.size === 1 ? 'carta' : 'cartas'} selecionada{selectedCards.size !== 1 ? 's' : ''}
          </span>
          <span className="total-coins">
            Ganho total: <strong>+{totalCoinsCalculated} 🪙</strong>
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
  );
}

export default CardRecycler;
