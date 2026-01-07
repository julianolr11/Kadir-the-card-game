import React, { useEffect, useMemo } from 'react';
import { BattleProvider, useBattle } from '../context/BattleContext';
import { AppContext } from '../context/AppContext';
import CreatureCardPreview from './CreatureCardPreview.jsx';
import heartIcon from '../assets/img/icons/hearticon.png';
import essenceIcon from '../assets/img/icons/soul-essence.png';
import cardVerso from '../assets/img/card/verso.png';
import '../styles/battle.css';

function BoardInner({ onNavigate, selectedDeck }) {
  const { state, startBattle, endTurn, summonFromHand, drawPlayerCard } = useBattle();
  const { cardCollection } = React.useContext(AppContext);
  const [activeCardIndex, setActiveCardIndex] = React.useState(null);
  const [deckCardDrawn, setDeckCardDrawn] = React.useState(false);

  const cardCache = useMemo(() => ({}), []);

  // Resolve um ID (base ou inst├óncia) para { baseId, instance }
  const resolveCardId = (id) => {
    if (!id) return { baseId: null, instance: null };
    if (id.includes('-')) {
      for (const [baseId, instances] of Object.entries(cardCollection || {})) {
        const inst = instances.find((x) => x.instanceId === id);
        if (inst) return { baseId, instance: inst };
      }
      return { baseId: null, instance: null };
    }
    return { baseId: id, instance: null };
  };

  const getCardData = (cardId) => {
    if (!cardId) return null;
    const { baseId } = resolveCardId(cardId);
    if (!baseId) return null;
    if (cardCache[baseId]) return cardCache[baseId];
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

  useEffect(() => {
    if (state.activePlayer === 'player') {
      setDeckCardDrawn(false);
    }
  }, [state.activePlayer]);

  const renderOrbs = (count) => (
    <div className="orbs">
      {Array.from({ length: count }).map((_, i) => (
        <img key={i} src={heartIcon} alt="orb" className="orb" />
      ))}
    </div>
  );

  const renderCardChip = (cardId, variant = 'slot', slotData = null) => {
    const data = getCardData(cardId);
    if (!data) return <div className={`card-chip card-chip-${variant}`}><div className="card-chip-label">{cardId}</div></div>;

    const name = data?.name?.pt || data?.name?.en || cardId;
    const title = data?.title?.pt || data?.title?.en || '';
    const num = data?.num ? `#${String(data.num).padStart(3, '0')}` : '';
    const element = data?.element;
    const hp = slotData?.hp ?? data?.hp ?? '?';
    const abilities = data?.abilities || [];
    const field = data?.field?.pt || data?.field?.en;
    const fielddesc = data?.fielddesc?.pt || data?.fielddesc?.en;
    const type = data?.type?.pt || data?.type?.en;
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
      const { instance } = resolveCardId(cardId);
      const level = instance?.level || 1;
      const isHolo = instance?.isHolo || false;
      return (
        <div className={`card-chip card-chip-${variant}`}>
          <div style={{ transform: 'scale(0.43)', transformOrigin: 'left top', pointerEvents: 'none' }}>
            <CreatureCardPreview creature={data} onClose={null} level={level} isHolo={isHolo} allowFlip={false} />
          </div>
        </div>
      );
    }

    // slot ÔÇö mesma apar├¬ncia da m├úo, s├│ que maior
    const { instance } = resolveCardId(cardId);
    const level = instance?.level || 1;
    const isHolo = instance?.isHolo || false;
    return (
      <div className="card-slot-preview">
        <div style={{ transform: 'scale(0.48)', transformOrigin: 'center center', pointerEvents: 'none' }}>
          <CreatureCardPreview creature={data} onClose={null} level={level} isHolo={isHolo} allowFlip={false} />
        </div>
      </div>
    );
  };

  const renderCardPreview = (cardId) => {
    const data = getCardData(cardId);
    if (!data) return null;

    const name = data?.name?.pt || data?.name?.en || cardId;
    const title = data?.title?.pt || data?.title?.en || '';
    const num = data?.num ? `#${String(data.num).padStart(3, '0')}` : '';
    const element = data?.element;
    const hp = data?.hp ?? '?';
    const abilities = data?.abilities || [];
    const field = data?.field?.pt || data?.field?.en;
    const fielddesc = data?.fielddesc?.pt || data?.fielddesc?.en;
    const type = data?.type?.pt || data?.type?.en;
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
                  <div className="ability-desc">{ab.desc?.pt || ab.desc?.en}</div>
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

  const renderSlots = (slots = [], owner = 'player') => (
    <div className={`slots slots-${owner}`}>
      {slots.map((slot, i) => (
        <div key={i} className={`slot ${slot ? 'occupied' : 'empty'}`}>
          {slot ? renderCardChip(slot.id, 'slot', slot) : <span className="slot-label">{i + 1}</span>}
        </div>
      ))}
    </div>
  );

  const onSummon = (handIndex, slotIndex) => {
    summonFromHand(handIndex, slotIndex);
  };

  return (
    <div className="battle-root">
      <div className="battle-topbar">
        <button className="battle-exit" onClick={() => onNavigate?.('home')}>Sair</button>
        <div className="turn-indicator">Turno {state.turn} ÔÇö {state.activePlayer === 'player' ? 'Voc├¬' : 'IA'}</div>
        <button className="end-turn" onClick={endTurn}>Fim do turno</button>
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

      <div className="board">
        <div className="side ai-side">
          <div className="side-header">
            <div className="side-left">{renderOrbs(state.ai.orbs)}</div>
            <div className="side-right">
              <div className="deck-chip">Deck: {state.ai.deck.length}</div>
              <div className="essence"><img src={essenceIcon} alt="ess├¬ncia" /> {state.ai.essence}</div>
            </div>
          </div>
          {renderSlots(state.ai.field.slots, 'ai')}
        </div>

        <div className="shared-field">
          {state.sharedField.active ? <div className="field-active">Campo Ativo</div> : <div className="field-inactive">Campo Inativo</div>}
        </div>

        <div className="side player-side">
          <div className="side-header">
            <div className="side-left"></div>
            <div className="side-right"></div>
          </div>
          {renderSlots(state.player.field.slots, 'player')}
        </div>

        <div className="player-orbs">
          {renderOrbs(state.player.orbs)}
        </div>

        <div className="player-essence">
          <img src={essenceIcon} alt="ess├¬ncia" />
          <span>{state.player.essence}</span>
        </div>
      </div>

      <div className="deck-draw">
        <div className="deck-count-pill">Deck {state.player.deck.length}</div>
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
        {state.activePlayer === 'player' && !deckCardDrawn && (
          <div className="deck-draw-indicator">
            <div className="deck-draw-indicator-text">Comprar</div>
            <div className="deck-draw-indicator-arrow">&darr;</div>
          </div>
        )}
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
                onClick={() => setActiveCardIndex(isActive ? null : i)}
              >
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
              const creatureData = getCardData(handId);
              const level = instance?.level || 1;
              const isHolo = instance?.isHolo || false;
              return (
                <CreatureCardPreview
                  creature={creatureData}
                  onClose={null}
                  level={level}
                  isHolo={isHolo}
                  allowFlip={false}
                />
              );
            })()}
            {state.activePlayer === 'player' && state.player.field.slots.findIndex((s) => !s) >= 0 && (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BattleBoard({ onNavigate, selectedDeck, menuMusicRef }) {
  return (
    <BattleProvider>
      <BoardInner onNavigate={onNavigate} selectedDeck={selectedDeck} menuMusicRef={menuMusicRef} />
    </BattleProvider>
  );
}
