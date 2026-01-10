import React, { useContext, useState } from 'react';
import '../styles/bestiary.css';
import cogSound from '../assets/sounds/effects/cog.MP3';
import background3D from '../assets/img/wallpaper/3d-menu-overlay.png';
import { AppContext } from '../context/AppContext';
import creatures from '../assets/cards';

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
  const cogAudioRef = React.useRef(null);
  const { cardCollection, lang = 'ptbr' } = useContext(AppContext);
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

  function handleCogMouseEnter() {
    if (cogAudioRef.current) {
      cogAudioRef.current.currentTime = 0;
      cogAudioRef.current.play().catch(() => {});
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
        <div className={`creature-preview-card creature-preview-border-${displayCard.element || 'neutral'}`}>
          <div className="creature-preview-header">
            <h2 className="creature-preview-name">{getText(displayCard.name, lang)}</h2>
            <span className="creature-preview-element">
              {displayCard.element || 'Neutral'}
            </span>
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
              <span className="creature-preview-stat-value">{getText(displayCard.type, lang) || 'Criatura'}</span>
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

      {/* Botão de voltar com seta para esquerda */}
      <button
        className="bestiary-back-btn"
        onClick={onBack}
        onMouseEnter={handleCogMouseEnter}
      >
        <span className="bestiary-back-arrow">←</span>
        Voltar para o Principal
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
            {creatures.map((card) => {
              const owned = hasCard(card.id);
              return (
                <div
                  key={card.id}
                  className={`bestiary-card-item ${owned ? 'owned' : 'locked'} ${selectedCard?.id === card.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCard(card)}
                >
                  {owned ? (
                    <img src={card.img} alt={getText(card.name, lang)} className="bestiary-card-img" />
                  ) : (
                    <div className="bestiary-card-locked">
                      <span className="bestiary-question-mark">?</span>
                    </div>
                  )}
                  <div className={`bestiary-card-border bestiary-card-border-${card.element || 'neutral'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Áudio */}
      <audio ref={cogAudioRef} src={cogSound} preload="auto" />
    </div>
  );
}

export default Bestiary;
