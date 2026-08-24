import React from 'react';
import { useBattle } from '../context/BattleContext';
import PlayerIdentityCard from './PlayerIdentityCard';
import BattleReactionPicker from './BattleReactionPicker';
import { BATTLE_REACTIONS_BY_ID } from '../constants/battleReactions';

// Cartão do próprio jogador: canto inferior esquerdo, logo abaixo da vida (.player-orbs em
// battle.css). Foto da Steam + nome + insígnias conquistadas, em qualquer modo de batalha
// (campanha, treino, PvP, Calamidade). O botão de enviar reação (BattleReactionPicker) já se
// esconde sozinho fora de PvP/Calamidade com conexão multiplayer - aqui não precisa duplicar
// essa checagem.
export default function BattleOwnPlayerHud({ isEn, avatarUrl, name, unlockedAchievements }) {
  const { state, battleReactions } = useBattle();

  // A própria reação enviada só é mostrada aqui fora da Calamidade - lá cada jogador (você
  // incluso) já aparece na timeline de turnos (.calamity-turn-entry em BattleBoard.jsx), então
  // mostrar de novo aqui seria duplicado.
  const mySlot = state.mode === 'calamity' ? (state.calamityMySlotIndex ?? 0) : (state.isHost ? 0 : 1);
  const ownEntry = state.mode !== 'calamity' ? (battleReactions || {})[mySlot] : null;
  const ownReaction = ownEntry ? BATTLE_REACTIONS_BY_ID[ownEntry.reactionId] : null;

  return (
    <div className="battle-player-hud battle-player-hud-own">
      <PlayerIdentityCard
        isEn={isEn}
        avatarUrl={avatarUrl}
        name={name}
        fallbackName={isEn ? 'You' : 'Você'}
        unlockedAchievements={unlockedAchievements}
      />
      {ownReaction && (
        <div key={ownEntry.receivedAt} className="battle-player-hud-reaction battle-reaction-bubble">
          <img src={ownReaction.icon} alt="" />
        </div>
      )}
      <BattleReactionPicker isEn={isEn} />
    </div>
  );
}
