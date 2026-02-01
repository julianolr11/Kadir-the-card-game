import React, { useEffect, useMemo } from 'react';
import { BattleProvider, useBattle } from '../context/BattleContext';
import { AppContext } from '../context/AppContext';
import CreatureCardPreview from './CreatureCardPreview.jsx';
import BattleResultModal from './BattleResultModal.jsx';
import CoinFlip from './CoinFlip.jsx';
import heartIcon from '../assets/img/icons/hearticon.png';
import essenceIcon from '../assets/img/icons/soul-essence.png';
import cardVerso from '../assets/img/card/verso.png';
import '../styles/battle.css';
import '../styles/battle-result.css';
import '../styles/effects.css';
import shieldIcon from '../assets/img/icons/shield.png';
import bleedIcon from '../assets/img/icons/bleed.png';
import burnIcon from '../assets/img/icons/burn.png';
import freezeIcon from '../assets/img/icons/freeze.png';
import paralyzeIcon from '../assets/img/icons/paralyze.png';
import poisonIcon from '../assets/img/icons/poison.png';
import sleepIcon from '../assets/img/icons/sleep.png';

function BoardInner({ onNavigate, selectedDeck, menuMusicRef }) {
  const {
    state,
    startBattle,
    endTurn,
    summonFromHand,
    drawPlayerCard,
    invokeFieldCard,
    startPlaying,
    useAbility,
    stealEnemyCard,
    cancelStealCard,
    returnEnemyCard,
    cancelReturnCard,
    poisonEnemyCard,
    cancelPoisonCard,
    selectFieldCardForSwap,
    completeSwap,
    cancelSwap,
  } = useBattle();
  const { cardCollection } = React.useContext(AppContext);
  const [activeCardIndex, setActiveCardIndex] = React.useState(null);
  const [deckCardDrawn, setDeckCardDrawn] = React.useState(false);
  const [opponentDeckCardDrawn, setOpponentDeckCardDrawn] = React.useState(false);
  const [fieldAnimating, setFieldAnimating] = React.useState(false);
  const [lastFieldId, setLastFieldId] = React.useState(null);
  const [baseBg, setBaseBg] = React.useState(undefined);
  const [overlayBg, setOverlayBg] = React.useState(undefined);
  const [hoveredCard, setHoveredCard] = React.useState(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [turnBlockModalOpen, setTurnBlockModalOpen] = React.useState(false);
  const [selectedCreature, setSelectedCreature] = React.useState(null); // { slotIndex, creature } - abre modal de habilidades
  const [selectedAbility, setSelectedAbility] = React.useState(null); // { slotIndex, abilityIndex } - entra em modo targeting
  const [selectedFieldCreature, setSelectedFieldCreature] = React.useState(null); // { slotIndex, creature } - preview da carta em campo
  // Estado unificado para o drawer do cemitério
  const [graveyardOpen, setGraveyardOpen] = React.useState(false);

  // estilos simples para modal centralizado
  const turnModalBgStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(30,22,40,0.32)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const turnModalStyle = {
    background: 'rgba(44, 38, 60, 0.38)',
    color: '#f5f5fa',
    padding: '32px 28px',
    borderRadius: '16px',
    minWidth: '320px',
    boxShadow: '0 6px 32px 0 rgba(30,22,40,0.18)',
    border: '1.5px solid rgba(255,255,255,0.18)',
    textShadow: '0 2px 8px #0007',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    textAlign: 'center',
  };

  const turnModalBtnStyle = {
    marginTop: 18,
    padding: '10px 24px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '2px solid #a87e2d',
    background: 'linear-gradient(90deg, #a87e2d 0%, #ffe6b0 100%)',
    color: '#3a2c4a',
    cursor: 'pointer',
    boxShadow: '0 2px 12px #000a',
    fontWeight: 600,
  };

  const cardCache = useMemo(() => ({}), []);

  // Resolve um ID (base ou inst├óncia) para { baseId, instance }
  const resolveCardId = (id) => {
    if (!id) return { baseId: null, instance: null };
    if (id.includes('-')) {
      // Primeiro tenta resolver pela coleção do jogador
      for (const [baseId, instances] of Object.entries(cardCollection || {})) {
        const inst = instances.find((x) => x.instanceId === id);
        if (inst) return { baseId, instance: inst };
      }
      // Fallback: usa o prefixo antes do primeiro '-'
      const prefix = id.split('-')[0];
      return { baseId: prefix || null, instance: null };
    }
    return { baseId: id, instance: null };
  };

  const isFieldId = (id) => !!id && (/^f\d{3}$/i.test(id) || String(id).toLowerCase().startsWith('field'));

  const getCardData = (cardId) => {
    if (!cardId) return null;
    const { baseId } = resolveCardId(cardId);
    if (!baseId) return null;
    if (cardCache[baseId]) return cardCache[baseId];
    // Se for carta de campo, busca no arquivo correto
    if (isFieldId(baseId)) {
      try {
        const fieldCards = require('../assets/cards/field/exampleFieldCards').default;
        const fieldCard = fieldCards.find(c => c.id === baseId || c.legacyId === baseId);
        if (fieldCard) {
          cardCache[baseId] = fieldCard;
          return fieldCard;
        }
      } catch (e) {
        console.warn(`Field card not found: ${baseId}`, e);
        return null;
      }
    }
    try {
      const mod = require(`../assets/cards/booster1/${baseId}.js`);
      cardCache[baseId] = mod;
      return mod;
    } catch (e) {
      console.warn(`Card not found: ${baseId}`, e);
      return null;
    }
  };

  useEffect(() => {
    if (state.phase === 'idle') startBattle(selectedDeck);
  }, [state.phase, startBattle, selectedDeck]);

  // Pausa música do menu quando a batalha começa
  useEffect(() => {
    if (state.phase === 'playing' && menuMusicRef?.current) {
      // Pausa via método do ref
      menuMusicRef.current.pause();
      // Também pausa diretamente o elemento de áudio para garantir
      const audio = menuMusicRef.current.getAudio?.();
      if (audio) {
        audio.pause();
      }
    }
  }, [state.phase, menuMusicRef]);

  useEffect(() => {
    if (state.activePlayer === 'player') {
      setDeckCardDrawn(false);
    }
    if (state.activePlayer === 'ai') {
      setOpponentDeckCardDrawn(false);
      // Ativa a animação após um pequeno delay
      setTimeout(() => {
        setOpponentDeckCardDrawn(true);
      }, 100);
    }
  }, [state.activePlayer]);

  const renderOrbs = (count) => {
    const remaining = Number.isFinite(count) ? Math.max(0, count) : 0;
    const total = Math.max(3, remaining);
    return (
      <div className="orbs">
        {Array.from({ length: total }).map((_, i) => (
          <img
            key={i}
            src={heartIcon}
            alt="orb"
            className={`orb${i >= remaining ? ' orb-missing' : ''}`}
          />
        ))}
      </div>
    );
  };

  const renderCardChip = (cardId, variant = 'slot', slotData = null) => {
    // Se for carta de campo, renderiza com visual padrão de campo + holo
    if (isFieldId(cardId)) {
      const { instance } = resolveCardId(cardId);
      // tenta pegar holo da instância; fallback: sharedField state; fallback: primeira instância na coleção
      let isHolo = instance?.isHolo || false;
      if (!isHolo && state.sharedField?.id === cardId) {
        isHolo = !!state.sharedField?.isHolo;
      }
      if (!isHolo && cardCollection && Array.isArray(cardCollection[cardId]) && cardCollection[cardId].length > 0) {
        isHolo = !!cardCollection[cardId][0].isHolo;
      }
      let fieldData = typeof state !== 'undefined' && state.sharedField && state.sharedField.cardData ? state.sharedField.cardData : null;
      // Se não tiver os dados completos, busca pelo id
      if (!fieldData) {
        try {
          const fieldCards = require('../assets/cards/field/exampleFieldCards').default;
          fieldData = fieldCards.find((c) => c.id === cardId || c.legacyId === cardId);
        } catch (e) {
          fieldData = null;
        }
      }
      if (!fieldData) return <div className={`card-chip card-chip-${variant}`}><div className="card-chip-label">{cardId}</div></div>;
      const boostsEl = fieldData.elementBoosts || {};
      const boostsType = fieldData.cardTypeBoosts || {};
      const special = fieldData.specialBoosts || {};
      const name = typeof fieldData.name === 'object' ? fieldData.name.pt || fieldData.name.en : fieldData.name;
      const desc = typeof fieldData.description === 'object' ? fieldData.description.pt || fieldData.description.en : fieldData.description;
      return (
        <div className="slider-card-wrapper active" style={{ transform: variant === 'hand' ? 'scale(0.464)' : 'scale(0.6)', transformOrigin: variant === 'hand' ? 'left top' : 'center', pointerEvents: 'none' }}>
          <div className={`card-preview card-preview-field ${isHolo ? 'card-preview-holo' : ''}`}>
            <div className="card-preview-header">
              <span className="card-preview-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {name}
                {isHolo && <span className="holo-indicator">✨</span>}
              </span>
              <span className="card-preview-id">#{fieldData.id}</span>
            </div>
            <div className="card-preview-art-wrapper">
              <img alt={name} className="card-preview-art" src={typeof fieldData.img === 'string' ? fieldData.img : (fieldData.img?.default || '')} />
            </div>
            <div className="card-preview-field-desc">
              <strong>Descrição:</strong>
              <div style={{ whiteSpace: 'pre-line' }}>{desc}</div>
              <div className="card-preview-field-effects">
                <strong>Efeitos:</strong>
                <ul>
                  {Object.entries(boostsEl).map(([el, val]) => (
                    <li key={`el-${el}`}>Criaturas do elemento <b>{el}</b>: +{val} Dano / +{val} HP</li>
                  ))}
                  {Object.entries(boostsType).map(([t, val]) => (
                    <li key={`type-${t}`}>Criaturas do tipo <b>{t}</b>: +{val} Dano / +{val} HP</li>
                  ))}
                  {special.puroAndMonstro && (
                    <li><b>Puras e Monstros</b>: +{special.puroAndMonstro.damage} Dano / +{special.puroAndMonstro.hp} HP</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // ...código original para criaturas...
    const data = getCardData(cardId);
    if (!data) return <div className={`card-chip card-chip-${variant}`}><div className="card-chip-label">{cardId}</div></div>;
    const name = typeof data?.name === 'object' ? data?.name?.pt || data?.name?.en : data?.name || cardId;
    const title = typeof data?.title === 'object' ? data?.title?.pt || data?.title?.en : data?.title || '';
    const num = data?.num ? `#${String(data.num).padStart(3, '0')}` : '';
    const element = data?.element;
    const hp = slotData?.hp ?? data?.hp ?? '?';
    const abilities = data?.abilities || [];
    const field = typeof data?.field === 'object' ? data?.field?.pt || data?.field?.en : data?.field;
    const fielddesc = typeof data?.fielddesc === 'object' ? data?.fielddesc?.pt || data?.fielddesc?.en : data?.fielddesc;
    const type = typeof data?.type === 'object' ? data?.type?.pt || data?.type?.en : data?.type;
    const height = data?.height;
    const weakness = data?.weakness;
    const bg = data?.img ? { backgroundImage: `url(${data.img})` } : {};
    let elementIcon = null;
    if (element) {
      try {
        elementIcon = require(`../assets/img/elements/${element}.png`);
      } catch (e) {}
    }
    let weaknessIcon = null;
    if (weakness) {
      try {
        weaknessIcon = require(`../assets/img/elements/${weakness}.png`);
      } catch (e) {}
    }
    if (variant === 'hand') {
      // Se for carta de campo, renderiza igual ao slot
      if (data && data.type === 'field') {
        return (
          <div className={`card-chip card-chip-${variant}`}>
            <div style={{ transform: 'scale(0.464)', transformOrigin: 'left top', pointerEvents: 'none' }}>
              <CreatureCardPreview creature={data} onClose={null} allowFlip={false} />
            </div>
          </div>
        );
      }
      const { instance } = resolveCardId(cardId);
      const level = instance?.level || 1;
      const isHolo = instance?.isHolo || false;
      return (
        <div className={`card-chip card-chip-${variant}`}>
          <div style={{ transform: 'scale(0.464)', transformOrigin: 'left top', pointerEvents: 'none' }}>
            <CreatureCardPreview creature={data} onClose={null} level={level} isHolo={isHolo} allowFlip={false} />
          </div>
        </div>
      );
    }
    // slot — mesma aparência da mão, só que maior
    const { instance } = resolveCardId(cardId);
    const level = instance?.level || 1;
    const isHolo = instance?.isHolo || false;
    return (
      <div className="card-slot-preview">
        <div style={{ transform: 'scale(0.6)', transformOrigin: 'center center', pointerEvents: 'none' }}>
          <CreatureCardPreview
            creature={data}
            onClose={null}
            level={level}
            isHolo={isHolo}
            allowFlip={false}
            currentHp={slotData?.hp}
            maxHp={slotData?.maxHp || data?.hp}
            armor={slotData?.shield || 0}
            burn={(slotData?.statusEffects || []).find(e => e.type === 'burn')?.duration || 0}
            freeze={(slotData?.statusEffects || []).find(e => e.type === 'freeze')?.duration || 0}
            paralyze={(slotData?.statusEffects || []).find(e => e.type === 'paralyze')?.duration || 0}
            poison={(slotData?.statusEffects || []).find(e => e.type === 'poison')?.duration || 0}
            sleep={(slotData?.statusEffects || []).find(e => e.type === 'sleep')?.duration || 0}
            bleed={(slotData?.statusEffects || []).find(e => e.type === 'bleed')?.duration || 0}
          />
        </div>
      </div>
    );
  };

  const renderCardPreview = (cardId) => {
    const data = getCardData(cardId);
    if (!data) return null;

    const name = typeof data?.name === 'object' ? data?.name?.pt || data?.name?.en : data?.name || cardId;
    const title = typeof data?.title === 'object' ? data?.title?.pt || data?.title?.en : data?.title || '';
    const num = data?.num ? `#${String(data.num).padStart(3, '0')}` : '';
    const element = data?.element;
    const hp = data?.hp ?? '?';
    const abilities = data?.abilities || [];
    const field = typeof data?.field === 'object' ? data?.field?.pt || data?.field?.en : data?.field;
    const fielddesc = typeof data?.fielddesc === 'object' ? data?.fielddesc?.pt || data?.fielddesc?.en : data?.fielddesc;
    const type = typeof data?.type === 'object' ? data?.type?.pt || data?.type?.en : data?.type;
    const height = data?.height;
    const weakness = data?.weakness;
    const bg = data?.img ? { backgroundImage: `url(${data.img})` } : {};

    let elementIcon = null;
    if (element) {
      try {
        elementIcon = require(`../assets/img/elements/${element}.png`);
      } catch (e) {}
    }

    let weaknessIcon = null;
    if (weakness) {
      try {
        weaknessIcon = require(`../assets/img/elements/${weakness}.png`);
      } catch (e) {}
    }

    return (
      <div className="card-preview-full">
        <div className="card-header-full">
          <div className="card-header-left">
            {elementIcon && <img src={elementIcon} alt={element} className="card-element-icon-large" />}
            <div className="card-name-group">
              <div className="card-name">{name}</div>
              {title && <div className="card-title">{title}</div>}
            </div>
          </div>
          <div className="card-num">{num}</div>
        </div>

        <div className="card-art" style={bg} />

        <div className="card-body">
          {abilities.length > 0 && (
            <div className="card-abilities-full">
              {abilities.map((ab, i) => (
                <div key={i} className="card-ability-full">
                  <div className="ability-header">
                    {elementIcon && <img src={elementIcon} alt={element} className="ability-element-icon" />}
                    <span className="ability-name-full">{ab.name?.pt || ab.name?.en}</span>
                  </div>
                  <div className="ability-desc" dangerouslySetInnerHTML={{ __html: processDescription(ab.desc?.pt || ab.desc?.en) }} />
                </div>
              ))}
            </div>
          )}

          {field && (
            <div className="card-field">
              <div className="field-name">{field}</div>
              {fielddesc && <div className="field-desc">{fielddesc}</div>}
            </div>
          )}

          <div className="card-stats">
            <div className="card-stat">
              <div className="stat-label">Tipo</div>
              <div className="stat-value">{type || 'M├¡stica'}</div>
            </div>
            <div className="card-stat">
              <div className="stat-label">Altura</div>
              <div className="stat-value">{height ? `${height}m` : '?'}</div>
            </div>
            <div className="card-stat">
              <div className="stat-label">Fraqueza</div>
              <div className="stat-value">
                {weaknessIcon && <img src={weaknessIcon} alt={weakness} className="weakness-icon" />}
              </div>
            </div>
            <div className="card-stat">
              <div className="stat-label">HP</div>
              <div className="stat-value stat-hp">
                <img src={heartIcon} alt="HP" className="stat-hp-icon" />
                {hp}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const statusIconFor = (type) => {
    switch (type) {
      case 'bleed': return bleedIcon;
      case 'burn': return burnIcon;
      case 'freeze': return freezeIcon;
      case 'paralyze': return paralyzeIcon;
      case 'poison': return poisonIcon;
      case 'sleep': return sleepIcon;
      default: return null;
    }
  };

  const renderSlots = (slots = [], owner = 'player') => (
    <div className={`slots slots-${owner}`}>
      {slots.map((slot, i) => {
        const isTargetable = selectedAbility && owner !== state.activePlayer && slot && slot.hp > 0;
        const isPlayerCreature = owner === 'player' && slot && slot.hp > 0 && state.activePlayer === 'player';
        const isDying = slot && state.animations && state.animations[slot.id]?.death;
        const isAttacking = slot && state.animations && state.animations[slot.id]?.type === 'attacking';
        return (
          <div
            key={i}
            className={`slot ${slot ? 'occupied' : 'empty'}${isTargetable ? ' slot-targetable' : ''}${isPlayerCreature ? ' slot-clickable' : ''}${isDying ? ' slot-death-animation' : ''}${isAttacking ? ' slot-attacking' : ''}`}
            onMouseEnter={() => slot && setHoveredCard({ cardId: slot.id, source: 'slot', owner, index: i })}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => {
              if (isTargetable && selectedAbility) {
                // Executa habilidade no alvo
                useAbility('player', selectedAbility.slotIndex, selectedAbility.abilityIndex, 'ai', i);
                setSelectedAbility(null);
                setSelectedCreature(null);
              } else if (isPlayerCreature) {
                // Abre preview da carta em campo
                setSelectedFieldCreature({ slotIndex: i, creature: slot });
              }
            }}
            style={{ cursor: isTargetable ? 'crosshair' : (isPlayerCreature ? 'pointer' : 'default') }}
          >
            {slot ? (
            <div style={{ position: 'relative' }}>
              {renderCardChip(slot.id, 'slot', slot)}
              <div className="status-icons-overlay">
                {/* Escudo */}
                {slot.shield > 0 && (
                  <img src={shieldIcon} alt="shield" className="status-icon" />
                )}
                {/* Status effects */}
                {(slot.statusEffects || []).map((se, idx) => {
                  const icon = statusIconFor(se.type);
                  return icon ? (
                    <img key={idx} src={icon} alt={se.type} className="status-icon" />
                  ) : null;
                })}
              </div>
              {(() => {
                const anim = state.animations?.[slot.id];
                if (!anim) return null;
                if (anim.type === 'damage') {
                  const cls = anim.hasAdvantage ? 'advantage' : (anim.hasDisadvantage ? 'disadvantage' : 'neutral');
                  return (
                    <>
                      <div className={`effect-float effect-damage ${cls}`}>-{anim.amount}</div>
                      {anim.shieldHit && <div className={`shield-shimmer${anim.shieldBroken ? ' shield-broken' : ''}`} />}
                      {/* Foguinho animado para burn tick */}
                      {anim.burnTick && (
                        <div className="burn-tick-fire">
                          <span className="burn-tick-fire-shape" />
                          <span className="burn-tick-fire-spark" />
                        </div>
                      )}
                    </>
                  );
                }
                if (anim.type === 'heal') {
                  return <div className="effect-float effect-heal">+{anim.amount}</div>;
                }
                if (anim.type === 'status' && anim.statusType) {
                  return <div className={`status-pulse status-${anim.statusType}`} />;
                }
                return null;
              })()}
            </div>
          ) : (
            <span className="slot-label">{i + 1}</span>
          )}
        </div>
      );
      })}
    </div>
  );

  const onSummon = (handIndex, slotIndex) => {
    summonFromHand(handIndex, slotIndex);
  };

  // Detecta mudancas no campo e ativa animacao (classe)
  useEffect(() => {
    const currentFieldId = state.sharedField?.id;
    if (currentFieldId && currentFieldId !== lastFieldId) {
      setFieldAnimating(true);
      setLastFieldId(currentFieldId);
      const timer = setTimeout(() => setFieldAnimating(false), 950);
      return () => clearTimeout(timer);
    }
  }, [state.sharedField?.id, lastFieldId]);

  // Rastreia posicao do mouse para o ghost preview
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Pega a escala e offsets do viewport
      const appViewport = document.querySelector('.app-viewport');
      if (appViewport) {
        const style = getComputedStyle(appViewport);
        const scale = parseFloat(style.getPropertyValue('--vp-scale')) || 1;
        const offsetX = parseFloat(style.getPropertyValue('--vp-offset-x')) || 0;
        const offsetY = parseFloat(style.getPropertyValue('--vp-offset-y')) || 0;

        // Converte coordenadas do mouse para o espaço escalado
        const x = (e.clientX - offsetX) / scale;
        const y = (e.clientY - offsetY) / scale;
        setMousePos({ x, y });
      } else {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Determina o background do board (novo bg calculado a partir do campo ativo)
  const boardBg = state.sharedField.active && state.sharedField.id ? (() => {
    let fieldData = null;
    try {
      const fieldCards = require('../assets/cards/field/exampleFieldCards').default;
      fieldData = fieldCards.find(c => c.id === state.sharedField.id);
    } catch (e) {
      fieldData = null;
    }
    if (!fieldData) {
      fieldData = getCardData(state.sharedField.id);
    }
    if (fieldData && fieldData.img) {
      const img = typeof fieldData.img === 'string' ? fieldData.img : (fieldData.img?.default || '');
      return img ? `url(${img})` : undefined;
    }
    return undefined;
  })() : undefined;

  // Inicializa o fundo base na primeira vez
  useEffect(() => {
    if (!baseBg && boardBg) {
      setBaseBg(boardBg);
    }
  }, [boardBg, baseBg]);

  // Quando o bg calculado mudar, revela radialmente o novo por cima do antigo
  useEffect(() => {
    if (!boardBg) return;
    // Dispara animação radial sempre que boardBg mudar (mesmo na primeira vez)
    if (boardBg !== baseBg) {
      setOverlayBg(boardBg);
      setFieldAnimating(true);
      setLastFieldId(boardBg);

      const t = setTimeout(() => {
        setBaseBg(boardBg);
        setOverlayBg(undefined);
        setFieldAnimating(false);
      }, 1700);
      return () => clearTimeout(t);
    }
  }, [boardBg]);
  return (
    <>
    {state.returnCardPending && (
      <div style={turnModalBgStyle}>
        <div style={turnModalStyle}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Escolha uma criatura para retornar à mão</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(state.ai?.field?.slots || []).map((slot, idx) => {
              if (!slot) return null;
              const cardData = getCardData(slot.id);
              return (
                <button
                  key={`return-card-${idx}`}
                  type="button"
                  onClick={() => returnEnemyCard(idx)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label={`Retornar ${slot.name || 'criatura'}`}
                >
                  <div style={{ transform: 'scale(0.45)', transformOrigin: 'top center', height: 290 }}>
                    <CreatureCardPreview
                      creature={cardData}
                      level={0}
                      allowFlip={false}
                      burn={(slot?.statusEffects || []).find(e => e.type === 'burn')?.duration || 0}
                      freeze={(slot?.statusEffects || []).find(e => e.type === 'freeze')?.duration || 0}
                      paralyze={(slot?.statusEffects || []).find(e => e.type === 'paralyze')?.duration || 0}
                      poison={(slot?.statusEffects || []).find(e => e.type === 'poison')?.duration || 0}
                      sleep={(slot?.statusEffects || []).find(e => e.type === 'sleep')?.duration || 0}
                      bleed={(slot?.statusEffects || []).find(e => e.type === 'bleed')?.duration || 0}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          <button style={turnModalBtnStyle} onClick={cancelReturnCard}>Cancelar</button>
        </div>
      </div>
    )}
    {state.poisonPending && (
      <div style={turnModalBgStyle}>
        <div style={turnModalStyle}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Escolha uma criatura para envenenar</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(state.ai?.field?.slots || []).map((slot, idx) => {
              if (!slot) return null;
              const cardData = getCardData(slot.id);
              return (
                <button
                  key={`poison-card-${idx}`}
                  type="button"
                  onClick={() => poisonEnemyCard(idx)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label={`Envenenar ${slot.name || 'criatura'}`}
                >
                  <div style={{ transform: 'scale(0.45)', transformOrigin: 'top center', height: 290 }}>
                    <CreatureCardPreview
                      creature={cardData}
                      level={0}
                      allowFlip={false}
                      burn={(slot?.statusEffects || []).find(e => e.type === 'burn')?.duration || 0}
                      freeze={(slot?.statusEffects || []).find(e => e.type === 'freeze')?.duration || 0}
                      paralyze={(slot?.statusEffects || []).find(e => e.type === 'paralyze')?.duration || 0}
                      poison={(slot?.statusEffects || []).find(e => e.type === 'poison')?.duration || 0}
                      sleep={(slot?.statusEffects || []).find(e => e.type === 'sleep')?.duration || 0}
                      bleed={(slot?.statusEffects || []).find(e => e.type === 'bleed')?.duration || 0}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          <button style={turnModalBtnStyle} onClick={cancelPoisonCard}>Cancelar</button>
        </div>
      </div>
    )}
    {state.stealCardPending && (
      <div style={turnModalBgStyle}>
        <div style={turnModalStyle}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Escolha uma carta da mão do oponente</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(state.ai?.hand || []).map((_, idx) => (
              <button
                key={`steal-card-${idx}`}
                type="button"
                onClick={() => stealEnemyCard(idx)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label={`Roubar carta ${idx + 1}`}
              >
                <div
                  style={{
                    width: 72,
                    height: 100,
                    backgroundImage: `url(${cardVerso})`,
                    backgroundSize: 'cover',
                    borderRadius: 8,
                    boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              </button>
            ))}
          </div>
          <button style={turnModalBtnStyle} onClick={cancelStealCard}>Cancelar</button>
        </div>
      </div>
    )}
    {state.swapCardPending && state.swapCardPending.step === 'selectField' && (
      <div style={turnModalBgStyle}>
        <div style={turnModalStyle}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Escolha uma criatura em campo para trocar</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(state.player?.field?.slots || []).map((slot, idx) => {
              if (!slot) return null;
              const cardData = getCardData(slot.id);
              return (
                <button
                  key={`swap-field-${idx}`}
                  type="button"
                  onClick={() => selectFieldCardForSwap(idx)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label={`Trocar ${slot.name || 'criatura'}`}
                >
                  <div style={{ transform: 'scale(0.45)', transformOrigin: 'top center', height: 290 }}>
                    <CreatureCardPreview
                      creature={cardData}
                      level={0}
                      allowFlip={false}
                      burn={(slot?.statusEffects || []).find(e => e.type === 'burn')?.duration || 0}
                      freeze={(slot?.statusEffects || []).find(e => e.type === 'freeze')?.duration || 0}
                      paralyze={(slot?.statusEffects || []).find(e => e.type === 'paralyze')?.duration || 0}
                      poison={(slot?.statusEffects || []).find(e => e.type === 'poison')?.duration || 0}
                      sleep={(slot?.statusEffects || []).find(e => e.type === 'sleep')?.duration || 0}
                      bleed={(slot?.statusEffects || []).find(e => e.type === 'bleed')?.duration || 0}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          <button style={turnModalBtnStyle} onClick={cancelSwap}>Cancelar</button>
        </div>
      </div>
    )}
    {state.swapCardPending && state.swapCardPending.step === 'selectGraveyard' && (
      <div style={turnModalBgStyle}>
        <div style={turnModalStyle}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Escolha uma criatura do cemitério para trazer</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(state.player?.graveyard || []).map((creature, idx) => {
              const cardData = getCardData(creature.id);
              return (
                <button
                  key={`swap-grave-${idx}`}
                  type="button"
                  onClick={() => completeSwap(idx)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label={`Trazer ${creature.name || 'criatura'} do cemitério`}
                >
                  <div style={{ transform: 'scale(0.45)', transformOrigin: 'top center', opacity: 0.7, height: 290 }}>
                    <CreatureCardPreview
                      creature={cardData}
                      level={0}
                      allowFlip={false}
                      burn={(creature?.statusEffects || []).find(e => e.type === 'burn')?.duration || 0}
                      freeze={(creature?.statusEffects || []).find(e => e.type === 'freeze')?.duration || 0}
                      paralyze={(creature?.statusEffects || []).find(e => e.type === 'paralyze')?.duration || 0}
                      poison={(creature?.statusEffects || []).find(e => e.type === 'poison')?.duration || 0}
                      sleep={(creature?.statusEffects || []).find(e => e.type === 'sleep')?.duration || 0}
                      bleed={(creature?.statusEffects || []).find(e => e.type === 'bleed')?.duration || 0}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          <button style={turnModalBtnStyle} onClick={cancelSwap}>Cancelar</button>
        </div>
      </div>
    )}
    <div className="battle-root">
      <div className="battle-topbar">
        <button className="battle-exit" onClick={() => onNavigate?.('home')}>Sair</button>
      </div>

      <div className="opponent-hand">
        <div className="opponent-hand-cards">
          {state.ai.hand.map((_, i) => (
            <div
              key={`ai-hand-${i}`}
              className="opponent-hand-card"
              style={{ backgroundImage: `url(${cardVerso})` }}
            />
          ))}
          {state.ai.hand.length === 0 && <div className="hand-empty">Sem cartas</div>}
        </div>
      </div>

      {/* Deck de compra do adversário */}
      <div className="opponent-deck-draw">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            className={`opponent-deck-card-back ${opponentDeckCardDrawn ? 'drawn' : ''}`}
            style={{ backgroundImage: `url(${cardVerso})` }}
          />
          <div className="deck-count-pill deck-count-enemy">Cartas: {state.ai.deck.length}</div>
        </div>

      </div>


      {/* Cemitério Unificado */}
      <div className="graveyard-container graveyard-container-unified">
        <button
          className={`graveyard-toggle-btn graveyard-toggle-unified${graveyardOpen ? ' active open' : ''}`}
          onClick={() => setGraveyardOpen(o => !o)}
        >
          <span className="graveyard-toggle-text">CEMITÉRIO</span>
          <span className="graveyard-toggle-count">{(state.ai.graveyard?.length || 0) + (state.player.graveyard?.length || 0)}</span>
        </button>
        <div className={`graveyard-drawer graveyard-drawer-unified${graveyardOpen ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="graveyard-drawer-content">
            {/* Linha do cemitério do oponente */}
            <div className="graveyard-row graveyard-row-opponent">
              <span className="graveyard-row-label">Oponente:</span>
              {state.ai.graveyard && state.ai.graveyard.length > 0 ? (
                state.ai.graveyard.map((creature, idx) => {
                  const cardData = getCardData(creature.id);
                  return (
                    <div className="graveyard-card-wrapper" key={idx}>
                      <CreatureCardPreview
                        creature={cardData}
                        level={0}
                        allowFlip={false}
                        burn={(creature?.statusEffects || []).find(e => e.type === 'burn')?.duration || 0}
                        freeze={(creature?.statusEffects || []).find(e => e.type === 'freeze')?.duration || 0}
                        paralyze={(creature?.statusEffects || []).find(e => e.type === 'paralyze')?.duration || 0}
                        poison={(creature?.statusEffects || []).find(e => e.type === 'poison')?.duration || 0}
                        sleep={(creature?.statusEffects || []).find(e => e.type === 'sleep')?.duration || 0}
                        bleed={(creature?.statusEffects || []).find(e => e.type === 'bleed')?.duration || 0}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="graveyard-drawer-empty">Nenhuma criatura derrotada</div>
              )}
            </div>
            {/* Linha do cemitério do usuário */}
            <div className="graveyard-row graveyard-row-player">
              <span className="graveyard-row-label">Você:</span>
              {state.player.graveyard && state.player.graveyard.length > 0 ? (
                state.player.graveyard.map((creature, idx) => {
                  const cardData = getCardData(creature.id);
                  return (
                    <div className="graveyard-card-wrapper" key={idx}>
                      <CreatureCardPreview
                        creature={cardData}
                        level={0}
                        allowFlip={false}
                        burn={(creature?.statusEffects || []).find(e => e.type === 'burn')?.duration || 0}
                        freeze={(creature?.statusEffects || []).find(e => e.type === 'freeze')?.duration || 0}
                        paralyze={(creature?.statusEffects || []).find(e => e.type === 'paralyze')?.duration || 0}
                        poison={(creature?.statusEffects || []).find(e => e.type === 'poison')?.duration || 0}
                        sleep={(creature?.statusEffects || []).find(e => e.type === 'sleep')?.duration || 0}
                        bleed={(creature?.statusEffects || []).find(e => e.type === 'bleed')?.duration || 0}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="graveyard-drawer-empty">Nenhuma criatura derrotada</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fim do drawer do cemitério */}

      <div
        className={`board ${fieldAnimating || overlayBg ? 'field-animating' : ''}`}
        style={{
          backgroundImage: baseBg || boardBg,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '--to-bg': overlayBg ? `${overlayBg}` : 'none',
        }}
      >
        {(fieldAnimating || overlayBg) && <div className="field-pulse" />}
        <div className="turn-indicator">Turno {state.turn}</div>
              {/* Fim do drawer do cemitério */}
        <div className="side ai-side">
          <div className="side-header">
            <div className="side-left">{renderOrbs(state.ai.orbs)}</div>
            <div className="side-right">
              {/* deck-chip removido do lado do adversário */}
            </div>
                {/* Essência do adversário */}
                <div className="opponent-essence">
                  <img src={essenceIcon} alt="essência" />
                  <span>{state.ai.essence}</span>
                </div>
          </div>
          {renderSlots(state.ai.field.slots, 'ai')}
        </div>

        <div className="board-divider">
          <hr className="board-divider-line" />
          <img src={require('../assets/img/icons/jewel.png')} alt="Jóia" className="board-divider-jewel" />
        </div>
        <div className="shared-field">
          {state.sharedField.active && state.sharedField.id ? (
            (() => {
              // Busca os dados completos da carta de campo
              let fieldData = null;
              try {
                const fieldCards = require('../assets/cards/field/exampleFieldCards').default;
                fieldData = fieldCards.find(c => c.id === state.sharedField.id);
              } catch (e) {
                fieldData = null;
              }

              // Se não encontrar, tenta getCardData
              if (!fieldData) {
                fieldData = getCardData(state.sharedField.id);
              }

              if (!fieldData) return <div className="field-inactive">Campo não encontrado</div>;

              // Flag holo do campo compartilhado
              let isHolo = !!state.sharedField?.isHolo;
              if (!isHolo && cardCollection && Array.isArray(cardCollection[fieldData.id]) && cardCollection[fieldData.id].length > 0) {
                isHolo = !!cardCollection[fieldData.id][0].isHolo;
              }

              const name = typeof fieldData.name === 'object' ? fieldData.name.pt || fieldData.name.en : fieldData.name;
              const description = typeof fieldData.description === 'object' ? fieldData.description.pt || fieldData.description.en : fieldData.description;
              const img = typeof fieldData.img === 'string' ? fieldData.img : (fieldData.img?.default || '');

              return (
                <div
                  className={`card-chip card-chip-hand ${isHolo ? 'card-preview-holo' : ''}`}
                  onMouseEnter={() => setHoveredCard({ cardId: fieldData.id, source: 'shared' })}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    style={{
                      transform: 'scale(0.5)',
                      transformOrigin: 'left top',
                      pointerEvents: 'none',
                      background: `linear-gradient(120deg, #0a1a2a 0%, #0a3a4a 60%, #0088aa 90%, #0a1a2a 100%), url(${img})`,
                      backgroundBlendMode: 'multiply, darken',
                      borderRadius: 18,
                    }}
                  >
                    <div style={{ position: 'absolute', top: 6, left: 6, color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {name}
                      {isHolo && <span className="holo-indicator">✨</span>}
                    </div>
                    <CreatureCardPreview
                      creature={{
                        id: fieldData.id,
                        name: name || 'Campo',
                        lore: fieldData.lore,
                        description: description || '',
                        img: img,
                        type: 'field',
                        forceFieldClass: true,
                      }}
                      onClose={null}
                      allowFlip={false}
                    />
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="field-inactive">Campo Inativo</div>
          )}
        </div>

        <div className="side player-side">
          {/* side-header removido */}
          {renderSlots(state.player.field.slots, 'player')}
        </div>

        <div className="player-orbs">
          {renderOrbs(state.player.orbs)}
        </div>

        <div className="player-essence">
          <img src={essenceIcon} alt="essência" />
          <span>{state.player.essence}</span>
        </div>
        {(() => {
          const canDraw = (state.player?.deck?.length || 0) > 0 && (state.player?.hand?.length || 0) < 7;
          const mustDrawToEnd = state.activePlayer === 'player' && canDraw;
          const isBlocked = mustDrawToEnd && !deckCardDrawn;
          return (
            <div className="end-turn-container">
              <button
                className={`end-turn-btn${isBlocked ? ' end-turn-blocked' : ''}`}
                onClick={() => {
                  if (isBlocked) {
                    setTurnBlockModalOpen(true);
                    return;
                  }
                  endTurn();
                }}
                title={isBlocked ? 'Você deve comprar uma carta antes' : undefined}
              >
                Fim do turno
              </button>
              {/* mensagem inline removida em favor do modal */}
            </div>
          );
        })()}
      </div>

      <div className="deck-draw">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            className={`deck-card-back ${deckCardDrawn ? 'drawn' : ''}`}
            style={{ backgroundImage: `url(${cardVerso})` }}
            onClick={() => {
              if (state.activePlayer !== 'player') return;
              if (deckCardDrawn) return;
              if (!state.player.deck?.length) return;
              if ((state.player.hand?.length || 0) >= 7) return;
              setDeckCardDrawn(true);
              drawPlayerCard();
            }}
          />
          <div className="deck-count-pill deck-count-player">Cartas: {state.player.deck.length}</div>
        </div>
        {state.activePlayer === 'player' && !deckCardDrawn && (
          <div className="deck-draw-indicator">
            <div className="deck-draw-indicator-text">Comprar</div>
            <div className="deck-draw-indicator-arrow">&darr;</div>
          </div>
        )}

        {/* Botão de Cemitério do Jogador removido daqui - será adicionado ao lado do fim de turno */}
      </div>

      <div className="hand">
        <div className="hand-title">Sua m├úo ({state.player.hand.length}/7)</div>
        <div className="hand-cards">
          {state.player.hand.map((cid, i) => {
            const isActive = activeCardIndex === i;

            return (
              <div
                key={`${cid}-${i}`}
                className={`hand-card${isActive ? ' active' : ''}`}
                onClick={() => setActiveCardIndex(isActive ? null : i)}                onMouseEnter={() => setHoveredCard({ cardId: cid, source: 'hand', index: i })}
                onMouseLeave={() => setHoveredCard(null)}              >
                {renderCardChip(cid, 'hand')}
              </div>
            );
          })}
          {state.player.hand.length === 0 && <div className="hand-empty">Sem cartas</div>}
        </div>
      </div>

      {activeCardIndex !== null && state.player.hand[activeCardIndex] && (
        <div className="card-preview-overlay" onClick={() => setActiveCardIndex(null)}>
          <div className="card-preview-container" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const handId = state.player.hand[activeCardIndex];
              const { instance } = resolveCardId(handId);
              const cardData = getCardData(handId);
              const level = instance?.level || 1;
              let isHolo = instance?.isHolo || false;
              if (!isHolo && state.sharedField?.id === handId) {
                isHolo = !!state.sharedField?.isHolo;
              }
              if (!isHolo && cardCollection && Array.isArray(cardCollection[handId]) && cardCollection[handId].length > 0) {
                isHolo = !!cardCollection[handId][0].isHolo;
              }
              // Se for carta de campo, mostrar preview especial (com holo)
              if (cardData?.type === 'field') {
                return (
                  <div style={{ width: 370 }}>
                    <div className={`card-preview card-preview-field ${isHolo ? 'card-preview-holo' : ''}`}>
                      <div className="card-preview-header">
                        <span className="card-preview-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {typeof cardData.name === 'object' ? cardData.name.pt || cardData.name.en : cardData.name}
                          {isHolo && <span className="holo-indicator">✨</span>}
                        </span>
                        <span className="card-preview-id">#{cardData.id}</span>
                      </div>
                      <div className="card-preview-art-wrapper">
                        <img src={cardData.img} alt={typeof cardData.name === 'object' ? cardData.name.pt || cardData.name.en : cardData.name} className="card-preview-art" />
                      </div>
                      <div className="card-preview-field-desc">
                        {cardData.lore && (
                          <div style={{ marginBottom: 12, fontSize: '13px', fontStyle: 'italic', color: '#ddd', lineHeight: '1.4' }}>
                            <strong>Descrição:</strong> {cardData.lore}
                          </div>
                        )}
                        <strong>Efeito:</strong>
                        <div style={{ whiteSpace: 'pre-line', fontSize: '13px', color: '#fff', lineHeight: '1.4' }}>{typeof cardData.description === 'object' ? cardData.description.pt || cardData.description.en : cardData.description}</div>
                      </div>
                    </div>
                  </div>
                );
              }
              // Preview padrão para outras cartas
              return (
                <CreatureCardPreview
                  creature={cardData}
                  onClose={null}
                  level={level}
                  isHolo={isHolo}
                  allowFlip={false}
                />
              );
            })()}
            {/* Botão Invocar para campo */}
            {(() => {
              const handId = state.player.hand[activeCardIndex];
              const cardData = getCardData(handId);
              // Se for carta de campo
              if (cardData?.type === 'field') {
                // Mesmo padrão das criaturas: passar apenas index
                return (
                  <div className="card-preview-actions">
                    <button
                      className="summon-button"
                      onClick={() => {
                        invokeFieldCard(activeCardIndex);
                        setActiveCardIndex(null);
                      }}
                    >
                      Invocar
                    </button>
                  </div>
                );
              }
              // Botão Invocar padrão para criaturas
              if (state.activePlayer === 'player' && state.player.field.slots.findIndex((s) => !s) >= 0) {
                return (
                  <div className="card-preview-actions">
                    <button
                      className="summon-button"
                      onClick={() => {
                        const firstFreeSlot = state.player.field.slots.findIndex((s) => !s);
                        onSummon(activeCardIndex, firstFreeSlot);
                        setActiveCardIndex(null);
                      }}
                    >
                      Invocar
                    </button>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}

      {/* Ghost Preview - aparece ao passar o mouse */}
      {hoveredCard && hoveredCard.cardId && (() => {
        // Remove ghost preview para todas as cartas na mão
        if (hoveredCard.source === 'hand') {
          return null;
        }
        return true;
      })() && (
        <div
          className="ghost-preview"
          style={{
            left: mousePos.x + 20,
            top: mousePos.y - 150,
            pointerEvents: 'none',
          }}
        >
          {(() => {
            const { instance } = resolveCardId(hoveredCard.cardId);
            const cardData = getCardData(hoveredCard.cardId);
            const level = instance?.level || 1;
            const isHolo = instance?.isHolo || false;

            // Busca HP atual do slot se for criatura em campo
            let currentHp = null;
            let maxHp = null;
            if (hoveredCard.source === 'slot' && hoveredCard.owner && hoveredCard.index !== undefined) {
              const slot = state[hoveredCard.owner]?.field?.slots?.[hoveredCard.index];
              if (slot) {
                currentHp = slot.hp;
                maxHp = slot.maxHp || cardData?.hp;
              }
            }

            if (!cardData) return null;

            return (
              <div style={{ transform: 'scale(0.95)', transformOrigin: 'top left' }}>
                <CreatureCardPreview
                  creature={cardData}
                  onClose={null}
                  level={level}
                  isHolo={isHolo}
                  allowFlip={false}
                  currentHp={currentHp}
                  maxHp={maxHp}
                />
              </div>
            );
          })()}
        </div>
      )}
    </div>
    {turnBlockModalOpen && (
      <div style={turnModalBgStyle}>
        <div style={turnModalStyle}>
          <h2 style={{ color: '#ffe6b0', fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Ação bloqueada</h2>
          <div style={{ fontSize: 14 }}>Você deve comprar uma carta antes</div>
          <button style={turnModalBtnStyle} onClick={() => setTurnBlockModalOpen(false)}>Entendi</button>
        </div>
      </div>
    )}
    {selectedFieldCreature && (() => {
      const { instance } = resolveCardId(selectedFieldCreature.creature.id);
      const cardData = getCardData(selectedFieldCreature.creature.id);
      const level = instance?.level || 1;
      const isHolo = instance?.isHolo || false;

      return (
        <div className="card-preview-overlay" onClick={() => setSelectedFieldCreature(null)}>
          <div className="card-preview-container" onClick={(e) => e.stopPropagation()}>
            <CreatureCardPreview
              creature={cardData}
              onClose={() => setSelectedFieldCreature(null)}
              level={level}
              isHolo={isHolo}
              allowFlip={false}
              armor={selectedFieldCreature.creature.shield || 0}
              burn={(selectedFieldCreature.creature.statusEffects || []).find(e => e.type === 'burn')?.duration || 0}
              freeze={(selectedFieldCreature.creature.statusEffects || []).find(e => e.type === 'freeze')?.duration || 0}
              paralyze={(selectedFieldCreature.creature.statusEffects || []).find(e => e.type === 'paralyze')?.duration || 0}
              poison={(selectedFieldCreature.creature.statusEffects || []).find(e => e.type === 'poison')?.duration || 0}
              sleep={(selectedFieldCreature.creature.statusEffects || []).find(e => e.type === 'sleep')?.duration || 0}
              bleed={(selectedFieldCreature.creature.statusEffects || []).find(e => e.type === 'bleed')?.duration || 0}
              onAbilityClick={(abilityIndex) => {
                const cost = selectedFieldCreature.creature.abilities[abilityIndex]?.cost || 0;
                const canAfford = (state.player.essence || 0) >= cost;
                const isIncapacitated = (selectedFieldCreature.creature.statusEffects || []).some(e => ['paralyze', 'freeze', 'sleep'].includes(e.type) && e.duration > 0);
                if (!canAfford || isIncapacitated) return;
                setSelectedAbility({ slotIndex: selectedFieldCreature.slotIndex, abilityIndex });
                setSelectedFieldCreature(null);
              }}
              currentHp={selectedFieldCreature.creature.hp}
              maxHp={selectedFieldCreature.creature.maxHp}
              playerEssence={state.player.essence}
            />
          </div>
        </div>
      );
    })()}
    {state.phase === 'coinflip' && (
      <CoinFlip
        playerName="Você"
        aiName="Adversário"
        onResult={(winner) => {
          startPlaying(winner);
        }}
      />
    )}
    {state.phase === 'ended' && state.gameResult && (

      <BattleResultModal
        gameResult={state.gameResult}
        killFeed={state.killFeed}
        battleStats={state.battleStats}
        playerDeck={selectedDeck}
        onClose={() => onNavigate?.('home')}
      />
    )}
    </>
  );
}

export default function BattleBoard({ onNavigate, selectedDeck, menuMusicRef }) {
  return (
    <BattleProvider>
      <BoardInner onNavigate={onNavigate} selectedDeck={selectedDeck} menuMusicRef={menuMusicRef} />
    </BattleProvider>
  );
}
