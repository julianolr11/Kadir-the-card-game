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

  // Se já contém tags <span class=...>, apenas retorna (dangerouslySetInnerHTML já interpreta)
  if (/<span[^>]*class=["']debuff-[^"']+["'][^>]*>/.test(desc)) {
    return desc;
  }

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
  shield = 0,
  shieldTurns = 0,
  onAbilityClick = null,
  selectedAbilityIndex = null,
  currentHp = null,
  maxHp = null,
  playerEssence = null,
}) {
  const { lang, effectsVolume } = useContext(AppContext);
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
  const langKey = lang === 'ptbr' ? 'pt' : lang;
  if (!creature) return null;

  const blessingName = creature?.defaultBlessing
    ? (typeof creature.defaultBlessing.name === 'object' ? creature.defaultBlessing.name[langKey] : creature.defaultBlessing.name)
    : null;
  const blessingDesc = creature?.defaultBlessing
    ? (typeof creature.defaultBlessing.desc === 'object' ? creature.defaultBlessing.desc[langKey] : creature.defaultBlessing.desc)
    : null;
  const fieldName = typeof creature.field === 'object' ? creature.field[langKey] : creature.field;
  const fieldDesc = typeof creature.fielddesc === 'object' ? creature.fielddesc[langKey] : creature.fielddesc;
  const shouldShowBlessing = creature?.isGuardian && blessingName && blessingDesc;

  // Detecta se é carta de campo
  const isFieldCard = creature.type === 'field';
  const isEffectCard = creature.type === 'effect';
  // Força classe de campo se solicitado
  const forceFieldClass = creature.forceFieldClass;
  // Corrige imagem para cartas de campo
  // creature.img pode ser: string | objeto com propriedade default | undefined
  let imageSrc = '';
  if (typeof creature.img === 'string') {
    imageSrc = creature.img;
  } else if (creature.img && typeof creature.img === 'object' && creature.img !== null) {
    // Se é objeto, tenta pegar default ou a primeira propriedade
    const imgObj = creature.img;
    imageSrc = imgObj.default || (Object.values(imgObj && typeof imgObj === 'object' ? imgObj : {})[0]) || '';
  }
  // Fallback para propriedades antigas
  if (!imageSrc) {
    imageSrc = creature.image || '';
  }

  // Normaliza caminhos para assets públicos (ex: assets/img/...)
  if (typeof imageSrc === 'string' && imageSrc.startsWith('assets/')) {
    imageSrc = `/${imageSrc}`;
  }

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
          <div className={`card-preview ${forceFieldClass ? 'card-preview-field' : isEffectCard ? 'card-preview-effect' : colorClass[creature.element] || (isFieldCard ? 'card-preview-field' : '')} ${isHolo ? 'card-preview-holo' : ''}`}>
            <div className="card-preview-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {!isFieldCard && !isEffectCard && (
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
                  {creature.title && (typeof creature.title === 'object' ? creature.title[langKey] : creature.title)}
                </span>
              </span>
              <span className="card-preview-id" style={{ fontWeight: 600, fontSize: '1.05rem', color: '#ffe6b0', marginLeft: 12 }}>
                {isFieldCard ? `#${creature.id || '???'}` : isEffectCard ? `#E${String(creature.num || 0).padStart(3, '0')}` : `#${creature.num ? String(creature.num).padStart(3, '0') : '???'}`}
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
                {shield > 0 && (
                  <div className="card-preview-effect-indicator shield">
                    <img src={shieldIcon} alt="Escudo" className="effect-icon" />
                    <span className="effect-value">{shieldTurns || shield}</span>
                  </div>
                )}
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
            {/* Se for carta de campo, mostra só lore e description */}
            {isFieldCard || isEffectCard ? (
              <div className="card-preview-field-desc">
                {creature.lore && (
                  <div style={{ marginBottom: 12, fontSize: '13px', fontStyle: 'italic', color: '#ddd', lineHeight: '1.4' }}>
                    <strong>Descrição:</strong> {creature.lore}
                  </div>
                )}
                <strong>{isEffectCard ? 'Efeito:' : 'Efeito:'}</strong>
                <div style={{ whiteSpace: 'pre-line', fontSize: '13px', color: '#fff', lineHeight: '1.4' }}>{typeof creature.description === 'object' ? creature.description.pt || creature.description.en : creature.description}</div>
              </div>
            ) : (
              <div className="card-preview-abilities">
                {creature.abilities &&
                  creature.abilities.map((ab, idx) => {
                    const cost = ab.cost || (idx + 1);
                    const canAfford = playerEssence !== null ? playerEssence >= cost : true;
                    const isClickable = onAbilityClick && canAfford;
                    const isSelected = selectedAbilityIndex === idx;
                    return (
                      <div
                        className={`card-preview-ability${isClickable ? ' ability-clickable' : ''}${!canAfford && playerEssence !== null ? ' ability-disabled' : ''}${isSelected ? ' ability-selected' : ''}`}
                        key={idx}
                        onClick={() => isClickable && onAbilityClick(idx)}
                        style={{
                          cursor: isClickable ? 'pointer' : 'default',
                          border: isSelected ? '3px solid #c896ff' : undefined,
                          boxShadow: isSelected ? '0 0 20px rgba(200, 150, 255, 0.8), inset 0 0 20px rgba(200, 150, 255, 0.2)' : undefined,
                          transform: isSelected ? 'scale(1.02)' : undefined,
                          background: isSelected ? 'linear-gradient(135deg, rgba(142, 68, 173, 0.3) 0%, rgba(142, 68, 173, 0.15) 100%)' : undefined
                        }}
                      >
                        <span className="essence-cost-icons">
                          {[...Array(cost)].map((_, i) => (
                            <img key={i} src={soulEssence} alt="Essência" className="essence-icon" />
                          ))}
                        </span>
                        <div>
                          <strong>{typeof ab.name === 'object' ? ab.name[langKey] : ab.name}</strong>
                          <div className="desc" dangerouslySetInnerHTML={{ __html: processDescription(typeof ab.desc === 'object' ? ab.desc[langKey] : ab.desc) }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            {/* Campo, tipo, altura, fraqueza, HP só para criaturas */}
            {!isFieldCard && !isEffectCard && (
              <div className="card-preview-field">
                {shouldShowBlessing ? (
                  <>
                    <strong>{blessingName}</strong> {blessingDesc}
                  </>
                ) : (
                  <>
                    <strong>{fieldName}</strong> {fieldDesc}
                  </>
                )}
              </div>
            )}
            {!isFieldCard && !isEffectCard && (
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
                  <span className="icon-text">{currentHp !== null && currentHp !== undefined ? currentHp : creature.hp}</span>
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
              swipeAudioRef.current.volume = (effectsVolume ?? 50) / 100;
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
