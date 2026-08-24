import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/animations.css';
import '../styles/exit-modal.css';

const translations = {
  ptbr: { eyebrow: 'Encerrar jornada', title: 'Deseja sair do jogo?', description: 'Seu progresso salvo será mantido para quando você retornar.', confirm: 'Sair do jogo', cancel: 'Continuar jogando', close: 'Fechar confirmação' },
  en: { eyebrow: 'End journey', title: 'Leave the game?', description: 'Your saved progress will be waiting when you return.', confirm: 'Exit game', cancel: 'Keep playing', close: 'Close confirmation' },
};

function ExitModal({ visible, onConfirm, onCancel }) {
  const { lang } = useContext(AppContext);
  const t = translations[lang] || translations.ptbr;
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onCancel(); }, 220);
  };

  useEffect(() => {
    if (!visible) return undefined;
    const handleKeyDown = (event) => { if (event.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  if (!visible) return null;
  return (
    <div className={`exit-modal-overlay ${closing ? 'modal-zoom-out' : 'modal-zoom-in'}`} role="presentation">
      <section className="exit-modal-panel" role="dialog" aria-modal="true" aria-labelledby="exit-modal-title" aria-describedby="exit-modal-description">
        <span className="exit-modal-ornament" aria-hidden>◆</span>
        <button type="button" className="exit-modal-close" onClick={handleClose} aria-label={t.close}>×</button>
        <div className="exit-modal-icon" aria-hidden><span>↪</span></div>
        <p className="exit-modal-eyebrow">{t.eyebrow}</p>
        <h2 id="exit-modal-title">{t.title}</h2>
        <p id="exit-modal-description" className="exit-modal-description">{t.description}</p>
        <div className="exit-modal-actions">
          <button type="button" className="exit-modal-button exit-modal-button-safe" onClick={handleClose} autoFocus>{t.cancel}</button>
          <button type="button" className="exit-modal-button exit-modal-button-danger" onClick={onConfirm}>{t.confirm}<span aria-hidden>→</span></button>
        </div>
      </section>
    </div>
  );
}

export default ExitModal;
