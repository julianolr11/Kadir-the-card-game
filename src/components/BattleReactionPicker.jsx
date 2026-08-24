import React from 'react';
import { useBattle } from '../context/BattleContext';
import { BATTLE_REACTIONS } from '../constants/battleReactions';

// Botão + popover pra enviar reações visuais durante a batalha. Em PvP/Calamidade com alguém do
// outro lado, a reação viaja por P2P; em campanha/treino (ou Calamidade solo) ela só aparece
// localmente pro próprio jogador - ver sendBattleReaction em BattleContext.jsx. Funciona fora do
// turno do remetente de propósito - reação não é ação de combate (ver spec em
// .claude/tasks/battle-reactions.md).
export default function BattleReactionPicker({ isEn }) {
  const { sendBattleReaction } = useBattle();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  return (
    <div className="battle-reaction-picker" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className="battle-reaction-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={isEn ? 'Send a reaction' : 'Enviar reação'}
        onClick={() => setOpen((v) => !v)}
      >
        {isEn ? 'React' : 'Reagir'}
      </button>
      {open && (
        <div className="battle-reaction-popover" role="menu" aria-label={isEn ? 'Reactions' : 'Reações'}>
          {BATTLE_REACTIONS.map((reaction) => (
            <button
              key={reaction.id}
              type="button"
              role="menuitem"
              className="battle-reaction-option"
              aria-label={isEn ? reaction.label.en : reaction.label.pt}
              title={isEn ? reaction.label.en : reaction.label.pt}
              onClick={() => {
                sendBattleReaction(reaction.id);
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              <img src={reaction.icon} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
