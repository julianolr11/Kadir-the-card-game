import React from 'react';
import { useBattle } from '../context/BattleContext';
import { BATTLE_REACTIONS_BY_ID } from '../constants/battleReactions';

// Cartão do adversário no PvP: canto superior esquerdo, mesma composição do cartão próprio
// (foto da Steam + nome), mas em vez do botão de reação mostra a animação da última reação que
// ele enviou. Não existe "adversário humano" na Calamidade (todos os jogadores dividem o mesmo
// lado 'player' contra o chefe) - as reações dos demais participantes aparecem direto na
// timeline de turnos (ver .calamity-turn-entry em BattleBoard.jsx), não aqui.
export default function BattleOpponentPlayerHud({ isEn, avatarUrl, name }) {
  const { state, battleReactions } = useBattle();

  if (state.mode !== 'pvp' || !state.peerSteamId64) return null;

  const opponentSlot = state.isHost ? 1 : 0;
  const entry = (battleReactions || {})[opponentSlot];
  const reaction = entry ? BATTLE_REACTIONS_BY_ID[entry.reactionId] : null;

  return (
    <div className="battle-player-hud battle-player-hud-opponent">
      <div className="battle-player-hud-avatar">
        {avatarUrl ? <img src={avatarUrl} alt="" /> : <span className="battle-player-hud-avatar-fallback">?</span>}
      </div>
      <span className="battle-player-hud-name">{name || (isEn ? 'Opponent' : 'Adversário')}</span>
      {reaction && (
        <div key={entry.receivedAt} className="battle-player-hud-reaction battle-reaction-bubble">
          <img src={reaction.icon} alt="" />
        </div>
      )}
    </div>
  );
}
