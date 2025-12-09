

import React, { useEffect, useState, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/animations.css';
import '../styles/vinheta.css';
import wallpaper from '../assets/img/wallpaper/wallpaper.png';
import OptionsModal from './OptionsModal';
import ExitModal from './ExitModal';

const translations = {
  ptbr: {
    start: 'Início',
    options: 'Opções',
    exit: 'Sair',
  },
  en: {
    start: 'Start',
    options: 'Options',
    exit: 'Exit',
  }
};

const LoadingScreen = ({ onFinish }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const audioRef = useRef(null);
  const { volume, lang } = useContext(AppContext);
  const t = translations[lang] || translations.ptbr;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.play();
    }
    const timer = setTimeout(() => {
      setShowMenu(true);
      if (onFinish) onFinish();
    }, 5000); // 5 segundos
    return () => {
      clearTimeout(timer);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [onFinish, volume]);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <audio ref={audioRef} src={'/assets/sounds/intro.mp3'} autoPlay loop />
      <img src={wallpaper} alt="Loading" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9)' }} className="fade-in" />
      <div className="vinheta" />
      {showMenu && (
        <>
          <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center' }} className="fade-in">
            <button style={btnStyle}>{t.start}</button>
            <button style={btnStyle} onClick={() => setShowOptions(true)}>{t.options}</button>
            <button style={btnStyle} onClick={() => setShowExit(true)}>{t.exit}</button>
          </div>
          {showOptions && <OptionsModal visible={showOptions} onClose={() => setShowOptions(false)} />}
          {showExit && <ExitModal visible={showExit} onConfirm={() => window.close()} onCancel={() => setShowExit(false)} />}
        </>
      )}
    </div>
  );

};

const btnStyle = {
  margin: '0 18px',
  padding: '14px 38px',
  fontSize: '1.1rem',
  borderRadius: '14px',
  border: '1.5px solid rgba(255,255,255,0.18)',
  background: 'rgba(44, 38, 60, 0.32)',
  color: '#f5f5fa',
  cursor: 'pointer',
  fontFamily: 'Poppins, Arial, sans-serif',
  boxShadow: '0 6px 32px 0 rgba(30,22,40,0.18)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  textShadow: '0 1px 4px #0007',
  letterSpacing: '0.5px',
  fontWeight: 500,
  outline: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
};

// Efeito glassmorphism no hover
// Adicione no componente:
// <button ... onMouseOver={e => e.currentTarget.style.background = 'rgba(44,38,60,0.48)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(44, 38, 60, 0.32)'} ...>
export default LoadingScreen;
