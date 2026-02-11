import React, { useState, useMemo } from 'react';
import { getCreatureRarity } from '../assets/rarityData.js';
import '../styles/card-instance-selector.css';
import lvlIcon from '../assets/img/icons/lvlicon.png';
import heartIcon from '../assets/img/icons/hearticon.png';

/**
 * CardInstanceSelector - Modal para selecionar qual instância de uma carta usar
 * Mostra todas as cópias da carta com XP, level, holo status e data de aquisição
 *
 * Props:
 *   cardId: string - ID da carta
 *   cardData: object - Dados da carta (name, hp, element, etc)
 *   instances: array - Array de instâncias do tipo { instanceId, xp, level, isHolo, acquiredAt }
 *   onSelect: function(instanceId) - Callback quando seleciona uma instância
 *   onClose: function() - Callback para fechar o modal
 *   onRecycleSelect: function(cardId, instanceId) - Callback para reciclar (opcional)
 *   title?: string - Título do modal (padrão: "Selecione uma cópia")
 *   lang?: string - Idioma (ptbr|en)
 */
function CardInstanceSelector({
  cardId,
  cardData,
  instances,
  onSelect,
  onClose,
  onRecycleSelect,
  title = 'Selecione uma cópia',
  lang = 'ptbr',
}) {
  const [selectedInstanceId, setSelectedInstanceId] = useState(
    instances?.[0]?.instanceId || null
  );

  // Calcula valor da carta baseado em raridade, nível e holo
  const calculateCardValue = (instance) => {
    const rarity = getCreatureRarity(cardId);
    let baseValue = rarity.value || 100;

    // Bônus por nível (10% por nível acima de 1)
    const levelBonus = instance.level > 1 ? baseValue * (instance.level - 1) * 0.1 : 0;
    let totalValue = baseValue + levelBonus;

    // Multiplicador holo para cartas raras ou melhores
    const isRareOrBetter = ['rare', 'epic', 'legendary'].includes(rarity.rarity);
    if (instance.isHolo && isRareOrBetter) {
      totalValue *= 1.75;
    }

    return Math.floor(totalValue);
  };

  const sortedInstances = useMemo(() => {
    if (!instances) return [];
    // Ordena por level descendente, depois por XP descendente
    return [...instances].sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.xp - a.xp;
    });
  }, [instances]);

  const selectedInstance = sortedInstances.find(
    (inst) => inst.instanceId === selectedInstanceId
  );
  const selectedInstanceValue = selectedInstance ? calculateCardValue(selectedInstance) : 0;

  const handleSelectInstance = (instanceId) => {
    setSelectedInstanceId(instanceId);
  };

  const handleConfirm = () => {
    if (selectedInstanceId) {
      onSelect(selectedInstanceId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (lang === 'en') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getCardName = () => {
    if (typeof cardData?.name === 'string') return cardData.name;
    return cardData?.name?.[lang === 'en' ? 'en' : 'ptbr'] || cardData?.name?.pt || 'Carta';
  };

  return (
    <div className="card-instance-selector-overlay" onClick={onClose}>
      <div
        className="card-instance-selector-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="instance-selector-header">
          <h3 className="instance-selector-title">{title}</h3>
          <p className="instance-selector-subtitle">{getCardName()}</p>
          <button
            className="instance-selector-close-btn"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Instances List */}
        <div className="instances-list-container">
          {sortedInstances.length === 0 ? (
            <p className="no-instances-message">Nenhuma cópia disponível</p>
          ) : (
            <ul className="instances-list">
              {sortedInstances.map((instance, index) => (
                <li
                  key={instance.instanceId}
                  className={`instance-item ${
                    selectedInstanceId === instance.instanceId ? 'active' : ''
                  }`}
                  onClick={() => handleSelectInstance(instance.instanceId)}
                >
                  {/* Número da cópia e holo status */}
                  <div className="instance-header">
                    <span className="instance-number">Cópia #{index + 1}</span>
                    {instance.isHolo && <span className="holo-badge">✨ Holo</span>}
                  </div>

                  {/* Stats */}
                  <div className="instance-stats">
                    <div className="stat-block">
                      <span className="stat-label">Level</span>
                      <span className="stat-value">{instance.level}</span>
                    </div>
                    <div className="stat-block">
                      <span className="stat-label">XP</span>
                      <span className="stat-value">
                        {instance.xp}
                        <span className="xp-max">/100</span>
                      </span>
                    </div>
                    <div className="stat-block">
                      <span className="stat-label">Adquirida</span>
                      <span className="stat-value">{formatDate(instance.acquiredAt)}</span>
                    </div>
                    <div className="stat-block">
                      <span className="stat-label">Valor</span>
                      <span className="stat-value stat-recycle">
                        +{calculateCardValue(instance)} 🪙
                      </span>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  <div className="instance-checkbox">
                    <input
                      type="radio"
                      name="instance-selection"
                      checked={selectedInstanceId === instance.instanceId}
                      onChange={() => handleSelectInstance(instance.instanceId)}
                      aria-label={`Selecionar cópia ${index + 1}`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="instance-selector-actions">
          <button
            className="instance-selector-btn instance-selector-btn-cancel"
            onClick={onClose}
          >
            {lang === 'en' ? 'Cancel' : 'Cancelar'}
          </button>
          <button
            className="instance-selector-btn instance-selector-btn-confirm"
            onClick={handleConfirm}
            disabled={!selectedInstanceId}
          >
            {lang === 'en' ? 'Select' : 'Selecionar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardInstanceSelector;
