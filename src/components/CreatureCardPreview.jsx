import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import soulEssence from '../assets/img/icons/soul-essence.png';
import lvlIcon from '../assets/img/icons/lvlicon.png';
import heartIcon from '../assets/img/icons/hearticon.png';
import shieldIcon from '../assets/img/icons/shield.png';
import burnIcon from '../assets/img/icons/burn.png';
import freezeIcon from '../assets/img/icons/freeze.png';
import paralyzeIcon from '../assets/img/icons/paralyze.png';
import poisonIcon from '../assets/img/icons/poison.png';
import sleepIcon from '../assets/img/icons/sleep.png';
import bleedIcon from '../assets/img/icons/bleed.png';
import fogo from '../assets/img/elements/fogo.png';
import agua from '../assets/img/elements/agua.png';
import terra from '../assets/img/elements/terra.png';
import puro from '../assets/img/elements/puro.png';
import ar from '../assets/img/elements/ar.png';
import '../styles/cardpreview.css';

import swipeSound from '../assets/sounds/effects/swipe.MP3';

// Mapa de ícones de status effects
const STATUS_ICONS = {
  burn: burnIcon,
  freeze: freezeIcon,
  paralyze: paralyzeIcon,
  poison: poisonIcon,
  sleep: sleepIcon,
  bleed: bleedIcon,
};

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

// Mapa de cores para status effects
const STATUS_COLORS = {
  burn: '#ff6450',
  freeze: '#64c8ff',
  paralyze: '#ffff64',
  poison: '#9664ff',
  sleep: '#c896ff',
  bleed: '#ff6464',
  armor: '#4169e1',
};

// Função para processar descrição com emojis e adicionar ícones + texto colorido
const processDescription = (desc) => {
  if (!desc) return '';

  let processed = desc;

  // Substituir emojis por HTML com ícone + texto colorido
  processed = processed.replace(
    /🔥/g,
    `<img src="${burnIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.burn}; font-weight: 600;">queimadura</span>`,
  );
  processed = processed.replace(
    /❄️/g,
    `<img src="${freezeIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.freeze}; font-weight: 600;">congelamento</span>`,
  );
  processed = processed.replace(
    /⚡/g,
    `<img src="${paralyzeIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.paralyze}; font-weight: 600;">paralisia</span>`,
  );
  processed = processed.replace(
    /☠️/g,
    `<img src="${poisonIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.poison}; font-weight: 600;">veneno</span>`,
  );
  processed = processed.replace(
    /😴/g,
    `<img src="${sleepIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.sleep}; font-weight: 600;">sono</span>`,
  );
  processed = processed.replace(
    /🩸/g,
    `<img src="${bleedIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.bleed}; font-weight: 600;">sangramento</span>`,
  );
  processed = processed.replace(
    /🛡️/g,
    `<img src="${shieldIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.armor}; font-weight: 600;">armadura</span>`,
  );

  return processed;
};

// Função helper para renderizar descrição com ícone de status effect
const renderDescriptionWithStatus = (desc, statusEffect) => {
  if (!statusEffect || !STATUS_ICONS[statusEffect]) return desc;
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
      }}
    >
      <span>{desc}</span>
      <img
        src={STATUS_ICONS[statusEffect]}
        alt={statusEffect}
        style={{ width: 14, height: 14, objectFit: 'contain' }}
      />
    </span>
  );
};

function CreatureCardPreview({
  creature,
  onClose,
  level = 0,
  allowFlip = false,
  isHolo = false,
  armor = 0,
  burn = 0,
  freeze = 0,
  paralyze = 0,
  poison = 0,
  sleep = 0,
  bleed = 0,
}) {
  const swipeAudioRef = React.useRef(null);
  const labelTranslations = {
    pt: {
      type: 'Tipo',
      height: 'Altura',
      weakness: 'Fraqueza',
    },
    en: {
      type: 'Type',
      height: 'Height',
      weakness: 'Weakness',
    },
  };
  const [showStory, setShowStory] = useState(false);
  const { lang } = useContext(AppContext);
  const langKey = lang === 'ptbr' ? 'pt' : lang;
  if (!creature) return null;

  // Detecta se é carta de campo
  const isFieldCard = creature.type === 'field';
  // Força classe de campo se solicitado
  const forceFieldClass = creature.forceFieldClass;
  // Corrige imagem para cartas de campo
  const imageSrc = typeof creature.img === 'string' ? creature.img : (creature.img?.default || creature.image || '');

  return (
    <div style={{ position: 'relative', display: 'flex', perspective: '1000px' }}>
      <audio ref={swipeAudioRef} src={swipeSound} preload="auto" />
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
          <div className={`card-preview ${forceFieldClass ? 'card-preview-field' : colorClass[creature.element] || (isFieldCard ? 'card-preview-field' : '')} ${isHolo ? 'card-preview-holo' : ''}`}>
            <div className="card-preview-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {!isFieldCard && (
                  <img
                    src={elementIcons[creature.element]}
                    alt={creature.element}
                    className="card-preview-element"
                  />
                )}
                <span className="card-preview-name" style={{ color: '#fff', fontWeight: 700, fontSize: '1.00rem', textShadow: '0 2px 8px #000a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {typeof creature.name === 'object' ? creature.name[langKey] : creature.name}
                  {isHolo && <span className="holo-indicator">✨</span>}
                </span>
                <span className="card-preview-title" style={{ marginLeft: 8, color: '#fff', fontStyle: 'italic', textShadow: 'rgba(0, 0, 0, 0.667) 0px 2px 8px', fontSize: '12px' }}>
                  {typeof creature.title === 'object' ? creature.title[langKey] : creature.title}
                </span>
              </span>
              <span className="card-preview-id" style={{ fontWeight: 600, fontSize: '1.05rem', color: '#ffe6b0', marginLeft: 12 }}>
                {isFieldCard ? `#${creature.id || '???'}` : `#${creature.num ? String(creature.num).padStart(3, '0') : '???'}`}
              </span>
            </div>
            <audio ref={swipeAudioRef} src={swipeSound} preload="auto" />
            <div className="card-preview-art-wrapper">
              <img
                src={imageSrc}
                alt={typeof creature.name === 'object' ? creature.name[langKey] : creature.name}
                className="card-preview-art"
                draggable={false}
              />
              <div className="card-preview-effects-container">
                {armor > 0 && (
                  <div className="card-preview-effect-indicator armor">
                    <img src={shieldIcon} alt="Armadura" className="effect-icon" />
                    <span className="effect-value">{armor}</span>
                  </div>
                )}
                {burn > 0 && (
                  <div className="card-preview-effect-indicator burn">
                    <img src={burnIcon} alt="Queimadura" className="effect-icon" />
                    <span className="effect-value">{burn}</span>
                  </div>
                )}
                {freeze > 0 && (
                  <div className="card-preview-effect-indicator freeze">
                    <img src={freezeIcon} alt="Congelamento" className="effect-icon" />
                    <span className="effect-value">{freeze}</span>
                  </div>
                )}
                {paralyze > 0 && (
                  <div className="card-preview-effect-indicator paralyze">
                    <img src={paralyzeIcon} alt="Paralisia" className="effect-icon" />
                    <span className="effect-value">{paralyze}</span>
                  </div>
                )}
                {poison > 0 && (
                  <div className="card-preview-effect-indicator poison">
                    <img src={poisonIcon} alt="Veneno" className="effect-icon" />
                    <span className="effect-value">{poison}</span>
                  </div>
                )}
                {sleep > 0 && (
                  <div className="card-preview-effect-indicator sleep">
                    <img src={sleepIcon} alt="Sono" className="effect-icon" />
                    <span className="effect-value">{sleep}</span>
                  </div>
                )}
                {bleed > 0 && (
                  <div className="card-preview-effect-indicator bleed">
                    <img src={bleedIcon} alt="Sangramento" className="effect-icon" />
                    <span className="effect-value">{bleed}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Se for carta de campo, mostra só descrição e efeitos */}
            {isFieldCard ? (
              <div className="card-preview-field-desc">
                <strong>Descrição:</strong>
                <div style={{whiteSpace: 'pre-line'}}>{creature.description}</div>
                <div className="card-preview-field-effects">
                  <strong>Efeitos:</strong>
                  <ul>
                    <li>Criaturas do elemento <b>puro</b>: +1 Dano / +1 HP</li>
                    <li>Criaturas do tipo <b>monstro</b>: +1 Dano / +1 HP</li>
                    <li><b>Puras e Monstros</b>: +2 Dano / +2 HP</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="card-preview-abilities">
                {creature.abilities &&
                  creature.abilities.map((ab, idx) => (
                    <div className="card-preview-ability" key={idx}>
                      <span className="essence-cost-icons">
                        {[...Array(ab.cost || idx + 1)].map((_, i) => (
                          <img key={i} src={soulEssence} alt="Essência" className="essence-icon" />
                        ))}
                      </span>
                      <div>
                        <strong>{typeof ab.name === 'object' ? ab.name[langKey] : ab.name}</strong>
                        <div className="desc" dangerouslySetInnerHTML={{ __html: processDescription(typeof ab.desc === 'object' ? ab.desc[langKey] : ab.desc) }} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {/* Campo, tipo, altura, fraqueza, HP só para criaturas */}
            {!isFieldCard && (
              <div className="card-preview-field">
                <strong>{typeof creature.field === 'object' ? creature.field[langKey] : creature.field}</strong>{' '}
                {typeof creature.fielddesc === 'object' ? creature.fielddesc[langKey] : creature.fielddesc}
              </div>
            )}
            {!isFieldCard && (
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
                      if (typeText) {
                        typeText = typeText.replace(/(Criatura\s+)?(Mística|Sombria)/i, '$2').replace(/(Creature\s+)?(Mystic|Shadow)/i, '$2').replace(/Shadow Creature/i, 'Shadow');
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
                    <span className="desc-value">
                      <img src={elementIcons[creature.weakness || 'agua']} alt={creature.weakness || 'agua'} className="fraqueza-icon" />
                    </span>
                  </div>
                </div>
                <span className="card-preview-hp-icon">
                  <img src={heartIcon} alt="Vida" className="icon-bg" />
                  <span className="icon-text">{creature.hp}</span>
                </span>
              </div>
            )}
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
            <div
              className="card-preview-story-panel"
              style={{ width: '100%', height: '100%' }}
            >
              <h3 className="card-preview-story-title">
                {typeof creature.storyTitle === 'object'
                  ? creature.storyTitle[langKey]
                  : creature.storyTitle}
              </h3>
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
              swipeAudioRef.current.play().catch(() => {});
            }
            setShowStory((s) => !s);
          }}
          aria-label={showStory ? 'Ver frente' : 'Ver história'}
        >
          <span
            style={{
              fontSize: 28,
              color: '#ffe6b0',
              filter: 'drop-shadow(0 2px 8px #000a)',
              display: 'inline-block',
              transition: 'transform 0.3s',
              transform: showStory ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {showStory ? '◀' : '▶'}
          </span>
        </button>
      )}
    </div>
  );
}

export default CreatureCardPreview;
