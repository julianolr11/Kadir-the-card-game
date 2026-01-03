import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/animations.css';

const translations = {
  ptbr: {
    confirm: 'Deseja realmente sair do jogo?',
    yes: 'Sim',
    no: 'Não',
  },
  en: {
    confirm: 'Do you really want to exit the game?',
    yes: 'Yes',
    no: 'No',
  },
};

const modalStyle = {
  background: 'rgba(44, 38, 60, 0.38)',
  color: '#f5f5fa',
  padding: '40px 32px',
  borderRadius: '18px',
  minWidth: '340px',
  boxShadow: '0 6px 32px 0 rgba(30,22,40,0.18)',
  fontFamily: 'Poppins, Arial, sans-serif',
  border: '1.5px solid rgba(255,255,255,0.18)',
  textShadow: '0 2px 8px #0007',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
};

function ExitModal({ visible, onConfirm, onCancel }) {
  const { lang } = useContext(AppContext);
  const t = translations[lang] || translations.ptbr;
  const [closing, setClosing] = React.useState(false);
  const handleClose = (cb) => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      cb();
    }, 250);
  };
  if (!visible) return null;
  return (
    <div
      style={modalBgStyle}
      className={closing ? 'modal-zoom-out' : 'modal-zoom-in'}
    >
      <div style={modalStyle}>
        <h2
          style={{
            color: '#ffe6b0',
            fontWeight: 700,
            fontSize: 22,
            marginBottom: 24,
            textAlign: 'center',
            letterSpacing: 0.5,
          }}
        >
          {t.confirm}
        </h2>
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'center',
            gap: 18,
          }}
        >
          <button onClick={() => onConfirm()} style={btnStyle}>
            {t.yes}
          </button>
          <button onClick={() => handleClose(onCancel)} style={btnStyle}>
            {t.no}
          </button>
        </div>
      </div>
    </div>
  );
}

const modalBgStyle = {
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

const btnStyle = {
  margin: '0 8px',
  padding: '12px 32px',
  fontSize: '1.1rem',
  borderRadius: '6px',
  border: '2px solid #a87e2d',
  background: 'linear-gradient(90deg, #a87e2d 0%, #ffe6b0 100%)',
  color: '#3a2c4a',
  cursor: 'pointer',
  fontFamily: 'Poppins, Arial, sans-serif',
  boxShadow: '0 2px 12px #000a',
  textShadow: '0 1px 4px #000a',
  transition: 'background 0.2s, color 0.2s',
  fontWeight: 600,
};

export default ExitModal;
