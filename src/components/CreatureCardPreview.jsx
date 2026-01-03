import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import soulEssence from '../assets/img/icons/soul-essence.png';
import lvlIcon from '../assets/img/icons/lvlicon.png';
import heartIcon from '../assets/img/icons/hearticon.png';
import fogo from '../assets/img/elements/fogo.png';
import agua from '../assets/img/elements/agua.png';
import terra from '../assets/img/elements/terra.png';
import puro from '../assets/img/elements/puro.png';
import ar from '../assets/img/elements/ar.png';
import '../styles/cardpreview.css';

import swipeSound from '../assets/sounds/effects/swipe.MP3';

const elementIcons = {
  fogo,
  agua,
  terra,
  puro,
  ar,
};
const colorClass = {
  fogo: 'card-preview-fire',
  agua: 'card-preview-water',
  terra: 'card-preview-earth',
  puro: 'card-preview-pure',
  ar: 'card-preview-air',
};

const CreatureCardPreview = ({ creature, onClose, level = 0, allowFlip = false }) => {
  const swipeAudioRef = React.useRef(null);
  const labelTranslations = {
    pt: {
      type: 'Tipo',
      height: 'Altura',
      weakness: 'Fraqueza'
    },
    en: {
      type: 'Type',
      height: 'Height',
      weakness: 'Weakness'
    }
  };
  const [showStory, setShowStory] = useState(false);
  const { lang } = useContext(AppContext);
  const langKey = lang === 'ptbr' ? 'pt' : lang;
  if (!creature) return null;

  return (
    <div style={{ position: 'relative', display: 'flex', perspective: '1000px' }}>
      {/* Audio */}
      <audio ref={swipeAudioRef} src={swipeSound} preload="auto" />

      {/* Container com flip 3D */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          transformStyle: 'preserve-3d',
          transform: showStory ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s ease-in-out',
        }}
      >
        {/* FRENTE DA CARTA */}
        <div style={{ backfaceVisibility: 'hidden' }}>
          <div className={`card-preview ${colorClass[creature.element] || ''}`}>
            <div className="card-preview-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={elementIcons[creature.element]} alt={creature.element} className="card-preview-element" />
              <span className="card-preview-name" style={{ color: '#fff', fontWeight: 700, fontSize: '1.00rem', textShadow: '0 2px 8px #000a' }}>
                {typeof creature.name === 'object' ? creature.name[langKey] : creature.name}
              </span>
              <span className="card-preview-title" style={{ marginLeft: 8, color: '#fff', fontStyle: 'italic', textShadow: 'rgba(0, 0, 0, 0.667) 0px 2px 8px', fontSize: '12px' }}>
                {typeof creature.title === 'object' ? creature.title[langKey] : creature.title}
              </span>
            </span>
            <span className="card-preview-id" style={{ fontWeight: 600, fontSize: '1.05rem', color: '#ffe6b0', marginLeft: 12 }}>
              #{creature.num ? String(creature.num).padStart(3, '0') : '???'}
            </span>
            </div>
            {/* Áudio do swipe */}
            <audio ref={swipeAudioRef} src={swipeSound} preload="auto" />
          <div className="card-preview-art-wrapper">
            <img
              src={creature.img}
              alt={typeof creature.name === 'object' ? creature.name[langKey] : creature.name}
              className="card-preview-art"
              draggable={false}
            />
          </div>
          <div className="card-preview-abilities">
            {creature.abilities && creature.abilities.map((ab, idx) => (
              <div className="card-preview-ability" key={idx}>
                <span className="essence-cost-icons">
                  {[...Array(idx + 1)].map((_,i)=>(<img key={i} src={soulEssence} alt="Essência" className="essence-icon" />))}
                </span>
                <div>
                  <strong>{typeof ab.name === 'object' ? ab.name[langKey] : ab.name}</strong>
                  <div className="desc">{typeof ab.desc === 'object' ? ab.desc[langKey] : ab.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card-preview-field">
            <strong>{typeof creature.field === 'object' ? creature.field[langKey] : creature.field}</strong> {typeof creature.fielddesc === 'object' ? creature.fielddesc[langKey] : creature.fielddesc}
          </div>
          <div className="card-preview-bottom">
            <span className="card-preview-level-icon">
              <img src={lvlIcon} alt="Nível" className="icon-bg" />
              <span className="icon-text">{level}</span>
            </span>
            <div className="card-preview-descs-inline">
              <div className="desc-col">
                <span className="desc-label">{labelTranslations[langKey].type}</span>
                {(() => {
                  let typeText = typeof creature.type === 'object' ? creature.type[langKey] : creature.type;
                  // Remove "Criatura" e "Creature" antes de Mystic/Mística/Shadow/Sombria
                  if (typeText) {
                    typeText = typeText.replace(/(Criatura\s+)?(Mística|Sombria)/i, '$2')
                                     .replace(/(Creature\s+)?(Mystic|Shadow)/i, '$2')
                                     .replace(/Shadow Creature/i, 'Shadow');
                  }
                  return (
                    <span className="desc-value" style={{ fontSize: '13px', lineHeight: '16px', whiteSpace: 'normal', wordBreak: 'break-word', display: 'inline-block', maxWidth: 80, textAlign: 'center' }}>
                      {typeText || 'N/A'}
                    </span>
                  );
                })()}
              </div>
              <div className="desc-col" style={{ textAlign: 'center' }}>
                <span className="desc-label">{labelTranslations[langKey].height}</span>
                <span className="desc-value">{creature.height ? `${creature.height.toFixed(2)}m` : '--'}</span>
              </div>
              <div className="desc-col">
                <span className="desc-label">{labelTranslations[langKey].weakness}</span>
                <span className="desc-value"><img src={elementIcons[creature.weakness || 'agua']} alt={creature.weakness || 'agua'} className="fraqueza-icon" /></span>
              </div>
            </div>
            <span className="card-preview-hp-icon">
              <img src={heartIcon} alt="Vida" className="icon-bg" />
              <span className="icon-text">{creature.hp}</span>
            </span>
          </div>
        </div>
        </div>

        {/* VERSO DA CARTA (História) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {creature.story && (
            <div className="card-preview-story-panel" style={{ width: '100%', height: '100%' }}>
              <h3 className="card-preview-story-title">{typeof creature.storyTitle === 'object' ? creature.storyTitle[langKey] : creature.storyTitle}</h3>
              <div className="card-preview-story-content">
                {creature.story.map((txt, i) => (
                  <p key={i}>{typeof txt === 'object' ? txt[langKey] : txt}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão de flip - apenas no Configurar Guardião */}
      {allowFlip && (
      <button
        style={{
          position: 'absolute',
          top: '50%',
          right: -40,
          transform: 'translateY(-50%)',
          zIndex: 100,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
        }}
        onClick={() => {
          if (swipeAudioRef.current) {
            swipeAudioRef.current.currentTime = 0;
            swipeAudioRef.current.play();
          }
          setShowStory(s => !s);
        }}
        aria-label={showStory ? 'Ver frente' : 'Ver história'}
      >
        <span style={{
          fontSize: 28,
          color: '#ffe6b0',
          filter: 'drop-shadow(0 2px 8px #000a)',
          display: 'inline-block',
          transition: 'transform 0.3s',
          transform: showStory ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {showStory ? '◀' : '▶'}
        </span>
      </button>
      )}
    </div>
  );
}

export default CreatureCardPreview;
