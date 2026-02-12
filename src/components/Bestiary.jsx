import React, { useContext, useState } from 'react';
import '../styles/bestiary.css';
import pageFlipSound from '../assets/sounds/effects/page-flip.mp3';
import movingTableSound from '../assets/sounds/effects/moving-table.mp3';
import background3D from '../assets/img/wallpaper/3d-menu-overlay.png';
import { AppContext } from '../context/AppContext';
import creatures from '../assets/cards';

// Imports dos ícones de elementos
import aguaIcon from '../assets/img/elements/agua.png';
import arIcon from '../assets/img/elements/ar.png';
import fogoIcon from '../assets/img/elements/fogo.png';
import puroIcon from '../assets/img/elements/puro.png';
import terraIcon from '../assets/img/elements/terra.png';

// Mapeamento de elementos para ícones
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

// Helper para extrair texto traduzido
const getText = (field, lang = 'ptbr') => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    const langKey = lang === 'ptbr' ? 'pt' : 'en';
    return field[langKey] || field.pt || field.en || '';
  }
  return '';
};

function Bestiary({ onBack }) {
  const pageFlipAudioRef = React.useRef(null);
  const movingAudioRef = React.useRef(null);
  const { cardCollection, lang = 'ptbr', effectsVolume } = useContext(AppContext);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isFading, setIsFading] = useState(false);
  const [displayCard, setDisplayCard] = useState(null);

  // Seleciona a primeira carta por padrão ao abrir
  React.useEffect(() => {
    if (!selectedCard && Array.isArray(creatures) && creatures.length > 0) {
      setSelectedCard(creatures[0]);
      setDisplayCard(creatures[0]);
    }
  }, [selectedCard]);

  // Fade effect quando a carta selecionada muda
  React.useEffect(() => {
    if (!selectedCard || selectedCard === displayCard) return;

    // Iniciar fade-out
    setIsFading(true);

    // Após o fade-out, trocar a carta e fazer fade-in
    const timeout = setTimeout(() => {
      setDisplayCard(selectedCard);
      setIsFading(false);
    }, 200); // 200ms para o fade-out

    return () => clearTimeout(timeout);
  }, [selectedCard, displayCard]);

  function handleBackMouseEnter() {
    if (movingAudioRef.current) {
      movingAudioRef.current.currentTime = 0;
      movingAudioRef.current.volume = (effectsVolume ?? 50) / 100;
      movingAudioRef.current.play().catch(() => {});
    }
  }

  // Função para verificar se o jogador possui a carta
  const hasCard = (cardId) => {
    return cardCollection[cardId] && cardCollection[cardId].length > 0;
  };

  const renderPreview = () => {
    if (!displayCard) {
      return (
        <div className="bestiary-preview-placeholder">
          <p>Selecione uma carta</p>
        </div>
      );
    }

    const owned = hasCard(displayCard.id);

    const storyTitle = getText(displayCard.storyTitle, lang);
    const storyLines = Array.isArray(displayCard.story)
      ? displayCard.story.map((line) => getText(line, lang)).filter(Boolean)
      : [];

    if (!owned) {
      return (
        <div className={`creature-preview-locked ${isFading ? 'fade-out' : 'fade-in'}`}>
          <div className={`creature-preview-card creature-preview-border-${displayCard.element || 'neutral'}`}>
            <div className="creature-preview-unknown">
              <span className="creature-preview-question">?</span>
              <p className="creature-preview-locked-text">Carta não desbloqueada</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`creature-preview-container ${isFading ? 'fade-out' : 'fade-in'}`}>
        <div className={`creature-preview-card creature-preview-border-${displayCard.type === 'effect' ? 'neutral' : (displayCard.element || 'neutral')}`}>
          <div className="creature-preview-header">
            <div className="creature-preview-name-group">
              <h2 className="creature-preview-name">
                {getText(displayCard.name, lang)}
                {displayCard.title && (
                  <span className="creature-preview-title">{getText(displayCard.title, lang)}</span>
                )}
              </h2>
            </div>
            {displayCard.type !== 'effect' && displayCard.element && elementIcons[displayCard.element] && (
              <img
                src={elementIcons[displayCard.element]}
                alt={displayCard.element}
                className="creature-preview-element-icon"
              />
            )}
          </div>

          <div className="creature-preview-image-wrapper">
            <img
              src={displayCard.img}
              alt={getText(displayCard.name, lang)}
              className="creature-preview-image"
            />
          </div>

          <div className="creature-preview-stats">
            <div className="creature-preview-stat">
              <span className="creature-preview-stat-label">Tipo:</span>
              <span className="creature-preview-stat-value">{displayCard.type === 'effect' ? (lang === 'ptbr' ? 'Efeito' : 'Effect') : (getText(displayCard.type, lang) || 'Criatura')}</span>
            </div>
            <div className="creature-preview-stat">
              <span className="creature-preview-stat-label">HP:</span>
              <span className="creature-preview-stat-value">{displayCard.hp || 100}</span>
            </div>
          </div>

          {storyLines.length > 0 && (
            <div className="creature-preview-story">
              {storyTitle && (
                <div className="creature-preview-section-title">{storyTitle}</div>
              )}
              {storyLines.map((line, idx) => (
                <p key={idx} className="creature-preview-story-line">
                  {line}
                </p>
              ))}
            </div>
          )}

          {displayCard.description && (
            <div className="creature-preview-description">
              <p>{getText(displayCard.description, lang)}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bestiary-screen">
      {/* Background */}
      <div
        className="bestiary-background"
        style={{
          backgroundImage: `url(${background3D})`,
        }}
      />

      <button
        className="bestiary-back-btn"
        onClick={() => {
          if (movingAudioRef.current) {
            movingAudioRef.current.currentTime = 0;
            movingAudioRef.current.volume = (effectsVolume ?? 50) / 100;
            movingAudioRef.current.play().catch(() => {});
          }
          onBack?.();
        }}
        onMouseEnter={handleBackMouseEnter}
      >
        <span className="bestiary-back-arrow">←</span>
        Principal
      </button>

      {/* Conteúdo do Bestiário */}
      <div className="bestiary-content">
        <div className="bestiary-layout">
          {/* Coluna Esquerda - Preview */}
          <div className="bestiary-preview">
            {renderPreview()}
          </div>

          {/* Coluna Direita - Lista de todas as cartas */}
          <div className="bestiary-grid">
            {/* Label de Criaturas */}
            {creatures.some(card => card.type !== 'field' && card.type !== 'effect') && (
              <div className="bestiary-divider bestiary-divider-top">
                <div className="bestiary-divider-line"></div>
                <span className="bestiary-divider-label">CRIATURAS</span>
                <div className="bestiary-divider-line"></div>
              </div>
            )}

            {/* Seção de Criaturas */}
            {creatures.filter(card => card.type !== 'field' && card.type !== 'effect').map((card) => {
              const owned = hasCard(card.id);
              return (
                <div
                  key={card.id}
                  className={`bestiary-card-item ${owned ? 'owned' : 'locked'} ${selectedCard?.id === card.id ? 'selected' : ''}`}
                  onClick={() => {
                    if (pageFlipAudioRef.current) {
                      pageFlipAudioRef.current.currentTime = 0;
                      pageFlipAudioRef.current.volume = (effectsVolume ?? 50) / 100;
                      pageFlipAudioRef.current.play().catch(() => {});
                    }
                    setSelectedCard(card);
                  }}
                >
                  {owned ? (
                    <img src={typeof card.img === 'string' ? card.img : (card.img?.default || '')} alt={getText(card.name, lang)} className="bestiary-card-img" />
                  ) : (
                    <div className="bestiary-card-locked">
                      <span className="bestiary-question-mark">?</span>
                    </div>
                  )}
                    {/* element icon removed from grid items; only shown in preview */}
                  <div className={`bestiary-card-border ${'bestiary-card-border-' + (card.type === 'effect' ? 'neutral' : (card.element || 'neutral'))}`} />
                </div>
              );
            })}

            {/* Divisória para Cartas de Campo */}
            {creatures.some(card => card.type === 'field') && (
              <div className="bestiary-divider">
                <div className="bestiary-divider-line"></div>
                <span className="bestiary-divider-label">CARTAS DE CAMPO</span>
                <div className="bestiary-divider-line"></div>
              </div>
            )}

            {/* Seção de Cartas de Campo */}
            {creatures.filter(card => card.type === 'field').map((card) => {
              const owned = hasCard(card.id);
              return (
                <div
                  key={card.id}
                  className={`bestiary-card-item ${owned ? 'owned' : 'locked'} ${selectedCard?.id === card.id ? 'selected' : ''}`}
                  onClick={() => {
                    if (pageFlipAudioRef.current) {
                      pageFlipAudioRef.current.currentTime = 0;
                      pageFlipAudioRef.current.volume = (effectsVolume ?? 50) / 100;
                      pageFlipAudioRef.current.play().catch(() => {});
                    }
                    setSelectedCard(card);
                  }}
                >
                  {owned ? (
                      <img src={typeof card.img === 'string' ? card.img : (card.img?.default || '')} alt={getText(card.name, lang)} className="bestiary-card-img" />
                    ) : (
                      <div className="bestiary-card-locked">
                        <span className="bestiary-question-mark">?</span>
                      </div>
                    )}
                    {/* element icon removed from grid items; only shown in preview */}
                    <div className={`bestiary-card-border ${'bestiary-card-border-' + (card.type === 'effect' ? 'neutral' : (card.element || 'neutral'))}`} />
                </div>
              );
            })}

            {/* Divisória entre Campos e Cartas de Efeito */}
            {creatures.some(card => card.type === 'effect') && (
              <div className="bestiary-divider">
                <div className="bestiary-divider-line"></div>
                <span className="bestiary-divider-label">CARTAS DE EFEITO</span>
                <div className="bestiary-divider-line"></div>
              </div>
            )}

            {/* Seção de Cartas de Efeito */}
            {creatures.filter(card => card.type === 'effect').map((card) => {
              const owned = hasCard(card.id);
              return (
                <div
                  key={card.id}
                  className={`bestiary-card-item ${owned ? 'owned' : 'locked'} ${selectedCard?.id === card.id ? 'selected' : ''}`}
                  onClick={() => {
                    if (pageFlipAudioRef.current) {
                      pageFlipAudioRef.current.currentTime = 0;
                      pageFlipAudioRef.current.volume = (effectsVolume ?? 50) / 100;
                      pageFlipAudioRef.current.play().catch(() => {});
                    }
                    setSelectedCard(card);
                  }}
                >
                  {owned ? (
                    <img
                      src={typeof card.img === 'string' ? card.img : (card.img?.default || '')}
                      alt={getText(card.name, lang)}
                      className="bestiary-card-img"
                    />
                  ) : (
                    <div className="bestiary-card-locked">
                      <span className="bestiary-question-mark">?</span>
                    </div>
                  )}
                  {/* Effect cards should not show element icon or colored border */}
                  <div className={`bestiary-card-border ${'bestiary-card-border-' + (card.type === 'effect' ? 'neutral' : (card.element || 'neutral'))}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Áudios */}
      <audio ref={pageFlipAudioRef} src={pageFlipSound} preload="auto" />
      <audio ref={movingAudioRef} src={movingTableSound} preload="auto" />
    </div>
  );
}

export default Bestiary;
