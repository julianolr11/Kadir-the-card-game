import React, { useState, useMemo } from 'react';
import { getCardValue } from '../assets/rarityData.js';
import '../styles/card-instance-selector.css';
import lvlIcon from '../assets/img/icons/lvlicon.png';
import heartIcon from '../assets/img/icons/hearticon.png';
import CreatureCardPreview from './CreatureCardPreview';
import { FullArtCard } from './KadirFullArtPreview';

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
  onRecycle,
  onEdit,
  onAdorn,
  adornTotalCount,
  onFullArt,
  fullArtTotalCount,
  title = 'Selecione uma cópia',
  lang = 'ptbr',
}) {
  const [selectedInstanceId, setSelectedInstanceId] = useState(
    instances?.[0]?.instanceId || null
  );
  const [recyclingInstanceId, setRecyclingInstanceId] = useState(null);
  const [adorningInstanceId, setAdorningInstanceId] = useState(null);
  const [adornRemovingIds, setAdornRemovingIds] = useState([]);

  // Calcula valor da carta baseado em raridade, nível e holo
  const calculateCardValue = (instance) => {
    return getCardValue(cardId, instance, cardData);
  };

  const sortedInstances = useMemo(() => {
    if (!instances) return [];
    // Ordena por level descendente, depois por XP descendente
    return [...instances].sort((a, b) => {
      if (Boolean(b.isFullArt) !== Boolean(a.isFullArt)) return Number(Boolean(b.isFullArt)) - Number(Boolean(a.isFullArt));
      if (Boolean(b.isHolo) !== Boolean(a.isHolo)) return Number(Boolean(b.isHolo)) - Number(Boolean(a.isHolo));
      if (b.level !== a.level) return b.level - a.level;
      return b.xp - a.xp;
    });
  }, [instances]);

  const selectedInstance = sortedInstances.find(
    (inst) => inst.instanceId === selectedInstanceId
  );
  const selectedInstanceValue = selectedInstance ? calculateCardValue(selectedInstance) : 0;
  const nonHoloInstances = sortedInstances.filter((inst) => !inst.isHolo);
  const holoInstances = sortedInstances.filter((inst) => inst.isHolo && !inst.isFullArt);
  const adornCount = adornTotalCount ?? nonHoloInstances.length;
  const canAdornSelected = Boolean(
    onAdorn &&
    selectedInstance &&
    !selectedInstance.isHolo &&
    adornCount >= 10
  );
  const fullArtCount = fullArtTotalCount ?? holoInstances.length;
  const canCreateFullArt = Boolean(onFullArt && selectedInstance?.isHolo && !selectedInstance?.isFullArt && fullArtCount >= 10);

  const handleSelectInstance = (instanceId) => {
    setSelectedInstanceId(instanceId);
  };

  const handleConfirm = () => {
    if (selectedInstanceId) {
      onSelect(selectedInstanceId);
    }
  };

  const handleRecycle = (instanceId, e) => {
    e.stopPropagation();
    if (onRecycle && instanceId) {
      setRecyclingInstanceId(instanceId);
      const instance = sortedInstances.find(inst => inst.instanceId === instanceId);
      const value = calculateCardValue(instance);

      // Toca som de moeda
      const coinSound = new Audio(require('../assets/sounds/effects/coin-flip.mp3'));
      coinSound.volume = 0.5;
      coinSound.play().catch(() => {});

      onRecycle(cardId, instanceId, value);

      // Reset visual após 500ms
      setTimeout(() => {
        setRecyclingInstanceId(null);
      }, 500);
    }
  };

  const handleAdorn = (instanceId, e) => {
    e.stopPropagation();
    if (!onAdorn || !instanceId || adorningInstanceId || !canAdornSelected) return;
    const sacrificeIds = nonHoloInstances
      .filter((inst) => inst.instanceId !== instanceId)
      .slice(0, 9)
      .map((inst) => inst.instanceId);
    setAdornRemovingIds(sacrificeIds);
    setAdorningInstanceId(instanceId);
    setTimeout(() => {
      const upgraded = onAdorn(cardId, instanceId, sacrificeIds);
      if (!upgraded) {
        setAdorningInstanceId(null);
        setAdornRemovingIds([]);
        return;
      }
      setTimeout(() => {
        setAdorningInstanceId(null);
        setAdornRemovingIds([]);
      }, 900);
    }, 980);
  };

  const handleFullArt = (instanceId, e) => {
    e.stopPropagation();
    if (!canCreateFullArt || adorningInstanceId) return;
    const sacrificeIds = holoInstances.filter((inst) => inst.instanceId !== instanceId).slice(0, 9).map((inst) => inst.instanceId);
    setAdornRemovingIds(sacrificeIds);
    setAdorningInstanceId(instanceId);
    setTimeout(() => {
      const upgraded = onFullArt(cardId, instanceId, sacrificeIds);
      if (!upgraded) {
        setAdorningInstanceId(null);
        setAdornRemovingIds([]);
        return;
      }
      setTimeout(() => {
        setAdorningInstanceId(null);
        setAdornRemovingIds([]);
      }, 1100);
    }, 980);
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

        <div className="instance-selector-content">
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
                  } ${adornRemovingIds.includes(instance.instanceId) ? 'sacrificing' : ''}`}
                  style={{
                    '--sacrifice-delay': `${Math.max(0, adornRemovingIds.indexOf(instance.instanceId)) * 80}ms`,
                  }}
                  onClick={() => handleSelectInstance(instance.instanceId)}
                >
                  {/* Número da cópia e holo status */}
                  <div className="instance-header">
                    <span className="instance-number">Cópia #{index + 1}</span>
                    {instance.isFullArt
                      ? <span className="holo-badge full-art-badge">◆ Full Art</span>
                      : instance.isHolo && <span className="holo-badge">✨ Holo</span>}
                  </div>

                  {/* Stats */}
                  <div className="instance-stats">
                    <div className="stat-block">
                      <span className="stat-label">Level</span>
                      <span className="stat-value">{instance.level}</span>
                    </div>
                    <div className="stat-block">
                      <span className="stat-label">Adquirida</span>
                      <span className="stat-value">{formatDate(instance.acquiredAt)}</span>
                    </div>
                    <div
                      className="stat-block stat-block-recycle"
                      onClick={(e) => handleRecycle(instance.instanceId, e)}
                      title="Clique para reciclar esta carta"
                    >
                      <span className="stat-label">♻️ Reciclar</span>
                      <span className="stat-value stat-recycle">
                        {recyclingInstanceId === instance.instanceId ? '...' : `+${calculateCardValue(instance)} 🪙`}
                      </span>
                    </div>
                  </div>

                  {onEdit && (
                    <button
                      type="button"
                      className="instance-edit-card-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(cardId, instance.instanceId);
                      }}
                    >
                      Editar carta
                    </button>
                  )}

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

        <aside className="instance-card-preview-panel">
          <div className="instance-card-preview-title">
            <span>{lang === 'en' ? 'Selected Card' : 'Carta selecionada'}</span>
            {selectedInstance?.isFullArt ? <strong>Full Art</strong> : selectedInstance?.isHolo && <strong>Holo</strong>}
          </div>
          {selectedInstance && cardData ? (
            <>
              <div className={`instance-card-preview-scale ${selectedInstance.isFullArt ? 'full-art-preview' : ''} ${adorningInstanceId === selectedInstance.instanceId ? 'adorning' : ''}`}>
                {selectedInstance.isFullArt ? <FullArtCard card={cardData} lang={lang} /> : <CreatureCardPreview
                  creature={cardData}
                  onClose={null}
                  level={selectedInstance.level || 0}
                  isHolo={!!selectedInstance.isHolo}
                  allowFlip={false}
                />}
              </div>
              <div className="instance-preview-recycle">
                <div className="instance-preview-value">
                  <span>{lang === 'en' ? 'Recycle value' : 'Valor ao reciclar'}</span>
                  <strong>+{selectedInstanceValue} moeda{selectedInstanceValue === 1 ? '' : 's'}</strong>
                </div>
                <button
                  type="button"
                  className="instance-preview-recycle-btn"
                  onClick={(e) => handleRecycle(selectedInstance.instanceId, e)}
                  disabled={recyclingInstanceId === selectedInstance.instanceId}
                >
                  {recyclingInstanceId === selectedInstance.instanceId ? 'Reciclando...' : 'Reciclar carta'}
                </button>
                {onAdorn && (
                  <button
                    type="button"
                    className="instance-preview-adorn-btn"
                    onClick={(e) => handleAdorn(selectedInstance.instanceId, e)}
                    disabled={!canAdornSelected || adorningInstanceId === selectedInstance.instanceId}
                  >
                    {adorningInstanceId === selectedInstance.instanceId
                      ? 'Adornando...'
                      : selectedInstance.isHolo
                        ? 'Carta holográfica'
                        : adornCount >= 10
                          ? 'Adornar carta'
                          : `Adornar (${adornCount}/10)`}
                  </button>
                )}
                {onFullArt && selectedInstance?.isHolo && (
                  <button
                    type="button"
                    className="instance-preview-fullart-btn"
                    onClick={(e) => handleFullArt(selectedInstance.instanceId, e)}
                    disabled={!canCreateFullArt || adorningInstanceId === selectedInstance.instanceId}
                  >
                    {adorningInstanceId === selectedInstance.instanceId
                      ? 'Criando Full Art...'
                      : selectedInstance.isFullArt
                        ? 'Carta Full Art'
                        : fullArtCount >= 10
                          ? 'Criar Full Art'
                          : `Full Art (${fullArtCount}/10)`}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="instance-card-preview-empty">
              {lang === 'en' ? 'Select a copy' : 'Selecione uma cópia'}
            </div>
          )}
        </aside>
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
