import React, { useState, useRef, useEffect, useContext } from 'react';
import '../styles/booster-results-slider.css';
import '../styles/cardpreview.css';
import soulEssence from '../assets/img/icons/soul-essence.png';
import lvlIcon from '../assets/img/icons/lvlicon.png';
import heartIcon from '../assets/img/icons/hearticon.png';
import flipCardSound from '../assets/sounds/effects/flipcard.MP3';
import holoEffectSound from '../assets/sounds/effects/holo-effect.mp3';
import { AppContext } from '../context/AppContext';

const getElementImage = (element) => {
  try {
    if (element === 'agua' || element === 'água')
      return require('../assets/img/elements/agua.png');
    if (element === 'terra') return require('../assets/img/elements/terra.png');
    if (element === 'fogo' || element === 'fire')
      return require('../assets/img/elements/fogo.png');
    if (element === 'ar') return require('../assets/img/elements/ar.png');
    if (element === 'puro') return require('../assets/img/elements/puro.png');
    return null;
  } catch {
    return null;
  }
};

function BoosterResultsSlider({ cards, lang, onClose }) {
  const { effectsVolume, cardCollection } = useContext(AppContext);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const currentCard = cards[currentCardIndex] || {};
  const CARD_WIDTH = 360;
  const CARD_GAP = 24;
  const DRAG_THRESHOLD = 30;

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const trackRef = useRef(null);
  const audioRef = useRef(new Audio(flipCardSound));
  const holoAudioRef = useRef(new Audio(holoEffectSound));

  const playFlipSound = () => {
    audioRef.current.currentTime = 0;
    audioRef.current.volume = (effectsVolume ?? 50) / 100;
    audioRef.current.play().catch(() => {});
  };

  const playHoloSound = () => {
    holoAudioRef.current.currentTime = 0;
    holoAudioRef.current.volume = (effectsVolume ?? 50) / 100;
    holoAudioRef.current.play().catch(() => {});
  };

  // Detecta quando muda para carta holográfica
  useEffect(() => {
    if (cards[currentCardIndex]?.isHolo) {
      playHoloSound();
    }
  }, [currentCardIndex, cards]);

  const getLocalizedText = (obj, lang) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj?.[lang === 'en' ? 'en' : 'ptbr'] || obj?.pt || obj?.en || '';
  };

  // Verifica se a carta é nova para o usuário
  const isNewCard = (card) => {
    if (!cardCollection) return true;

    const cardId = card?.id;
    const userCards = cardCollection[cardId];

    // Se não tem a carta, é nova
    if (!userCards || userCards.length === 0) return true;

    // Se tem a carta e é holográfica, verifica se ele já tem holográfica
    if (card?.isHolo) {
      const hasHolo = userCards.some(c => c?.isHolo);
      return !hasHolo;
    }

    return false;
  };

  function handlePrevCard() {
    playFlipSound();
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  }

  function handleNextCard() {
    playFlipSound();
    setCurrentCardIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  }

  function handleMouseDown(e) {
    // Inicia drag apenas se clicar na carta/track, não nos botões
    const isCard =
      e.target.closest('.slider-card-wrapper') ||
      e.target.closest('.slider-cards-track');
    if (!isCard || e.target.closest('button')) return;

    setIsDragging(true);
    setDragStart(e.clientX);
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    const diff = dragStart - e.clientX;
    if (Math.abs(diff) > DRAG_THRESHOLD) {
      if (diff > 0) {
        handleNextCard();
      } else {
        handlePrevCard();
      }
      setIsDragging(false);
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  const getCardClassName = (card) => {
    const element = card?.element || 'puro';
    let elementClass = 'pure';
    if (element === 'agua' || element === 'água') elementClass = 'water';
    else if (element === 'terra') elementClass = 'earth';
    else if (element === 'fogo' || element === 'fire') elementClass = 'fire';
    else if (element === 'ar') elementClass = 'air';
    return `card-preview card-preview-${elementClass}`;
  };

  return (
    <div className="booster-results-overlay" onClick={onClose}>
      <div
        className="booster-results-slider-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="slider-header">
          <h2 className="booster-results-title">Booster aberto</h2>
          <div className="slider-counter">
            {currentCardIndex + 1}/{cards.length}
          </div>
        </div>

        {/* Slider */}
        <div className="slider-wrapper">
          <button
            className="slider-arrow slider-arrow-left"
            onClick={handlePrevCard}
            aria-label="Carta anterior"
          >
            ‹
          </button>

          <div
            className="slider-content"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              ref={trackRef}
              className="slider-cards-track"
              style={{
                transform: `translateX(calc(50% - ${CARD_WIDTH / 2}px - ${(CARD_WIDTH + CARD_GAP) * currentCardIndex}px))`,
                userSelect: isDragging ? 'none' : 'auto',
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              className="slider-cards-track"
            >
              {cards.map((card, idx) => {
                let wrapperClass = 'slider-card-wrapper';
                if (idx === currentCardIndex) {
                  wrapperClass += ' active';
                } else if (
                  idx === currentCardIndex - 1 ||
                  (currentCardIndex === 0 && idx === cards.length - 1)
                ) {
                  wrapperClass += ' prev';
                } else if (
                  idx === currentCardIndex + 1 ||
                  (currentCardIndex === cards.length - 1 && idx === 0)
                ) {
                  wrapperClass += ' next';
                }

                // Exibição especial para cartas de campo
                if (card?.type === 'field') {
                  return (
                    <div key={`${card?.id || idx}-${idx}`} className={wrapperClass}>
                      <div className={`card-preview card-preview-field ${card?.isHolo ? 'card-preview-holo' : ''}`}>
                        {/* Badge NEW */}
                        {isNewCard(card) && (
                          <div className="card-badge-new">
                            {lang === 'en' ? 'NEW' : 'NOVA'}
                          </div>
                        )}
                        {/* Header */}
                        <div className="card-preview-header">
                          <span className="card-preview-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {getLocalizedText(card?.name, lang)}
                            {card?.isHolo && <span className="holo-indicator">✨</span>}
                          </span>
                          <span className="card-preview-id">#{card?.id || '?'}</span>
                        </div>
                        {/* Arte */}
                        <div className="card-preview-art-wrapper">
                          {card?.img ? (
                            <img src={card.img} alt={getLocalizedText(card?.name, lang)} className="card-preview-art" />
                          ) : (
                            <div style={{width: '100%', height: '100%', backgroundColor: '#333'}} />
                          )}
                        </div>
                        {/* Descrição e efeitos */}
                        <div className="card-preview-field-desc">
                          <strong>Descrição:</strong>
                          <div style={{ whiteSpace: 'pre-line' }}>{getLocalizedText(card.description, lang)}</div>
                          <div className="card-preview-field-effects">
                            <strong>Efeitos:</strong>
                            <ul>
                              {card.elementBoosts && Object.entries(card.elementBoosts).map(([el, val]) => (
                                <li key={el}>Criaturas do elemento <b>{el}</b>: +{val} Dano / +{val} HP</li>
                              ))}
                              {card.cardTypeBoosts && Object.entries(card.cardTypeBoosts).map(([type, val]) => (
                                <li key={type}>Criaturas do tipo <b>{type}</b>: +{val} Dano / +{val} HP</li>
                              ))}
                              {card.specialBoosts?.puroAndMonstro && (
                                <li>
                                  <b>Puras e Monstros</b>: +{card.specialBoosts.puroAndMonstro.damage} Dano / +{card.specialBoosts.puroAndMonstro.hp} HP
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                // ...exibição padrão para outras cartas...
                return (
                  <div
                    key={`${card?.id || idx}-${idx}`}
                    className={wrapperClass}
                  >
                    <div
                      className={`${getCardClassName(card)}${card?.isHolo ? ' card-preview-holo' : ''}`}
                    >
                      {/* Badge NEW */}
                      {isNewCard(card) && (
                        <div className="card-badge-new">
                          {lang === 'en' ? 'NEW' : 'NOVA'}
                        </div>
                      )}
                      {/* Header */}
                      <div className="card-preview-header">
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          {card?.element && getElementImage(card.element) && (
                            <img
                              src={getElementImage(card.element)}
                              alt={card.element}
                              className="card-preview-element"
                            />
                          )}
                          <span className="card-preview-name">
                            {getLocalizedText(card?.name, lang)}
                            {card?.isHolo && (
                              <span className="holo-indicator">✨</span>
                            )}
                          </span>
                        </span>
                        <span className="card-preview-id">
                          #{card?.num || '?'}
                        </span>
                      </div>
                      {/* Arte */}
                      <div className="card-preview-art-wrapper">
                        {card?.img && (
                          <img
                            src={card.img}
                            alt={getLocalizedText(card?.name, lang)}
                            className="card-preview-art"
                          />
                        )}
                      </div>
                      {/* Habilidades */}
                      {card?.abilities && card.abilities.length > 0 && (
                        <div className="card-preview-abilities">
                          {card.abilities.map((ability, abilityIdx) => (
                            <div
                              key={abilityIdx}
                              className="card-preview-ability"
                            >
                              <span className="essence-cost-icons">
                                {ability.cost &&
                                  [...Array(ability.cost)].map((_, i) => (
                                    <img
                                      key={i}
                                      src={soulEssence}
                                      alt="Essência"
                                      className="essence-icon"
                                    />
                                  ))}
                              </span>
                              <div>
                                <strong>
                                  {getLocalizedText(ability.name, lang)}
                                </strong>
                                <div className="desc">
                                  {getLocalizedText(ability.desc, lang)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Campo */}
                      {card?.field && (
                        <div className="card-preview-field">
                          <strong>{getLocalizedText(card.field, lang)}:</strong>{' '}
                          {getLocalizedText(card.fielddesc, lang)}
                        </div>
                      )}
                      {/* Bottom info */}
                      <div className="card-preview-bottom">
                        <span className="card-preview-level-icon">
                          <img src={lvlIcon} alt="Nível" className="icon-bg" />
                          <span className="icon-text">{card?.level || 0}</span>
                        </span>
                        <div className="card-preview-descs-inline">
                          {card?.type && (
                            <div className="desc-col">
                              <span className="desc-label">Tipo</span>
                              <span className="desc-value">
                                {getLocalizedText(card.type, lang)}
                              </span>
                            </div>
                          )}
                          {card?.height && (
                            <div className="desc-col">
                              <span className="desc-label">Altura</span>
                              <span className="desc-value">{card.height}m</span>
                            </div>
                          )}
                          {card?.weakness && getElementImage(card.weakness) && (
                            <div className="desc-col">
                              <span className="desc-label">Fraqueza</span>
                              <span className="desc-value">
                                <img
                                  src={getElementImage(card.weakness)}
                                  alt={card.weakness}
                                  className="fraqueza-icon"
                                />
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="card-preview-hp-icon">
                          <img src={heartIcon} alt="Vida" className="icon-bg" />
                          <span className="icon-text">{card?.hp || '0'}</span>
                        </span>
                      </div>
                      {/* Holo badge removed - indicator is now inline with name */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="slider-arrow slider-arrow-right"
            onClick={handleNextCard}
            aria-label="Próxima carta"
          >
            ›
          </button>
        </div>

        {/* Botão fechar */}
        <button
          type="button"
          onClick={onClose}
          className="booster-results-close slider-close-btn"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default BoosterResultsSlider;
