import React, { useEffect } from 'react';
import { BattleProvider, useBattle } from '../context/BattleContext';
import CombatLog from './CombatLog';
import heartIcon from '../assets/img/icons/hearticon.png';
import essenceIcon from '../assets/img/icons/soul-essence.png';
import '../styles/battle.css';

function BoardInner({ onNavigate }) {
  const { state, startBattle, endTurn, summonFromHand } = useBattle();

  useEffect(() => {
    if (state.phase === 'idle') startBattle();
  }, [state.phase, startBattle]);

  const renderOrbs = (count) => {
    return (
      <div className="orbs">
        {Array.from({ length: count }).map((_, i) => (
          <img key={i} src={heartIcon} alt="orb" className="orb" />
        ))}
      </div>
    );
  };

  const renderSlots = (slots = [], owner = 'player') => (
    <div className={`slots slots-${owner}`}>
      {slots.map((slot, i) => (
        <div key={i} className={`slot ${slot ? 'occupied' : 'empty'}`}>
          {slot ? <div className="slot-card">{slot.id}</div> : <span className="slot-label">{i + 1}</span>}
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
        <div className="turn-indicator">Turno {state.turn} — {state.activePlayer === 'player' ? 'Você' : 'IA'}</div>
        <button className="end-turn" onClick={endTurn}>Fim do turno</button>
      </div>

      <div className="board">
        <div className="side ai-side">
          <div className="side-header">
            {renderOrbs(state.ai.orbs)}
            <div className="essence"><img src={essenceIcon} alt="essência" /> {state.ai.essence}</div>
          </div>
          {renderSlots(state.ai.field.slots, 'ai')}
        </div>

        <div className="shared-field">
          {state.sharedField.active ? <div className="field-active">Campo Ativo</div> : <div className="field-inactive">Campo Inativo</div>}
        </div>

        <div className="side player-side">
          <div className="side-header">
            {renderOrbs(state.player.orbs)}
            <div className="essence"><img src={essenceIcon} alt="essência" /> {state.player.essence}</div>
          </div>
          {renderSlots(state.player.field.slots, 'player')}
        </div>
      </div>

      <div className="hand">
        <div className="hand-title">Sua mão ({state.player.hand.length}/7)</div>
        <div className="hand-cards">
          {state.player.hand.map((cid, i) => (
            <div key={`${cid}-${i}`} className="hand-card">
              <div className="hand-card-id">{cid}</div>
              <div className="hand-card-actions">
                {[0,1,2].map((slot) => (
                  <button key={slot} onClick={() => onSummon(i, slot)}>Invocar no {slot+1}</button>
                ))}
              </div>
            </div>
          ))}
          {state.player.hand.length === 0 && <div className="hand-empty">Sem cartas</div>}
        </div>
      </div>

      <CombatLog entries={state.log} />
    </div>
  );
}

export default function BattleBoard({ onNavigate }) {
  return (
    <BattleProvider>
      <BoardInner onNavigate={onNavigate} />
    </BattleProvider>
  );
}
