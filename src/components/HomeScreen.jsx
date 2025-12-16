import candleSound from '../assets/sounds/effects/candle.mp3';
import React, { useContext, useRef, useEffect, useState } from 'react';
import OptionsModal from './OptionsModal';
import CogIcon from './CogIcon';
import '../styles/homescreen.css';

import { AppContext } from '../context/AppContext';
import boosterImg from '../assets/img/card/booster.png';


const BoosterZone = ({ boosters }) => (
  <div className="booster-zone">
    <div className="booster-zone-title">Booster Zone</div>
    {boosters > 0 && (
      <div className="booster-img-wrapper">
        <img src={boosterImg} alt="Booster" className="booster-img" />
        <span className="booster-qty">x{boosters}</span>
        <span className="booster-hover-label">Abrir booster</span>
      </div>
    )}
  </div>
);

function HomeScreen({ onNavigate, menuMusicRef }) {
  // menuMusicRef: ref global para controle da música do menu
  const candleAudioRef = React.useRef(null);

  React.useEffect(() => {
    if (candleAudioRef.current) {
      candleAudioRef.current.volume = 0.5;
      candleAudioRef.current.loop = true;
      candleAudioRef.current.play();
    }
    if (menuMusicRef?.current) menuMusicRef.current.play();
    return () => {
      if (candleAudioRef.current) {
        candleAudioRef.current.pause();
        candleAudioRef.current.currentTime = 0;
      }
    };
  }, [menuMusicRef]);
  const { activeGuardian, boosters = 0 } = useContext(AppContext);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Fecha dropdown ao clicar fora
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.home-cog-btn') && !event.target.closest('.home-cog-dropdown')) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="home-screen">
      {/* Áudio de vela queimando em loop */}
      <audio ref={candleAudioRef} src={candleSound} preload="auto" loop />
      {/* Background 3D em duas camadas */}
      <div className="main-menu-background">
        <div className="main-menu-bg-base"></div>
        <div className="main-menu-bg-overlay"></div>
      </div>
      {/* Efeitos de vela animada */}
      <div className="candle-glow"></div>
      <div className="candle-flame candle-flame-1"></div>
      <div className="candle-flame candle-flame-2"></div>
      <div className="candle-flame candle-flame-3"></div>
      <div className="candle-flame candle-flame-4"></div>
      <div className="candle-flame candle-flame-5"></div>
      <div className="candle-flame candle-flame-6"></div>
      <div className="candle-flame candle-flame-7"></div>
      {/* Ícone de engrenagem no canto superior direito */}
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 100 }}>
        <button
          className="home-cog-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={e => {
            setDropdownOpen(v => !v);
          }}
          aria-label="Abrir menu de opções"
        >
          <CogIcon size={32} color="#ffe6b0" />
        </button>
        {dropdownOpen && (
          <div className="home-cog-dropdown" style={{
            position: 'absolute',
            top: 40,
            right: 0,
            background: 'rgba(30,22,40,0.98)',
            borderRadius: 12,
            boxShadow: '0 4px 24px #000a',
            minWidth: 160,
            padding: '8px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            zIndex: 200
          }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#ffe6b0',
                fontSize: 18,
                fontWeight: 500,
                padding: '12px 24px',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 0,
                width: '100%',
                transition: 'background 0.2s',
              }}
              onClick={() => { setDropdownOpen(false); setShowOptions(true); }}
            >Configurações</button>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#ffe6b0',
                fontSize: 18,
                fontWeight: 500,
                padding: '12px 24px',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 0,
                width: '100%',
                transition: 'background 0.2s',
              }}
              onClick={() => { setDropdownOpen(false); onNavigate('sair'); }}
            >Sair</button>
          </div>
        )}
      </div>
      <BoosterZone boosters={boosters} />
      <main className="home-main">
        <h1 className="home-title">Kadir Card Game</h1>
        <div className="deck-btn-center-group">
          <button
            className={`deck-btn${activeGuardian && activeGuardian.element ? ` deck-btn-${activeGuardian.element}` : ''}`}
            onClick={() => onNavigate('deck')}
            style={{
              backgroundImage: activeGuardian?.img ? `url(${activeGuardian.img})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow:
                activeGuardian?.element === 'agua'
                  ? '0 0 48px 16px #00cfff, 0 0 32px 8px #00eaff inset, 0 0 0 8px #00eaff80, 0 0 32px 16px #00cfff80, 0 0 64px 24px 8px #00eaff, 0 0 0 12px #00cfff, 0 0 0 0px #00eaff, 0 0 0 0px #00cfff, 0 0 0 0px #00eaff, 0 0 0 0px #00cfff'
                  : activeGuardian?.element === 'terra'
                  ? '0 0 48px 16px #4caf50, 0 0 32px 8px #e2c290 inset, 0 0 0 8px #e2c29080, 0 0 32px 16px #4caf5080, 0 0 64px 24px 8px #e2c290, 0 0 0 12px #4caf50, 0 0 0 0px #e2c290, 0 0 0 0px #4caf50, 0 0 0 0px #e2c290, 0 0 0 0px #4caf50'
                  : activeGuardian?.element === 'fire'
                  ? '0 0 48px 16px #ff3c00, 0 0 32px 8px #ffb347 inset, 0 0 0 8px #ffb34780, 0 0 32px 16px #ff3c0080, 0 0 64px 24px 8px #ffb347, 0 0 0 12px #ff3c00, 0 0 0 0px #ffb347, 0 0 0 0px #ff3c00, 0 0 0 0px #ffb347, 0 0 0 0px #ff3c00'
                  : activeGuardian?.element === 'ar'
                  ? '0 0 48px 16px #b388ff, 0 0 32px 8px #b0e6ff inset, 0 0 0 8px #b388ff80, 0 0 32px 16px #b0e6ff80, 0 0 64px 24px 8px #b388ff, 0 0 0 12px #b0e6ff, 0 0 0 0px #b388ff, 0 0 0 0px #b0e6ff, 0 0 0 0px #b388ff, 0 0 0 0px #b0e6ff'
                  : activeGuardian?.element === 'puro'
                  ? '0 0 48px 16px #fff6b0, 0 0 32px 8px #fff6b0 inset, 0 0 0 8px #fff6b080, 0 0 32px 16px #fff6b080, 0 0 64px 24px 8px #fff6b0, 0 0 0 12px #fffde4, 0 0 0 0px #fff6b0, 0 0 0 0px #fffde4, 0 0 0 0px #fff6b0, 0 0 0 0px #fffde4'
                  : undefined,
            }}
          >
            <span className="deck-btn-label">Deck</span>
          </button>
        </div>
        <div className="home-btn-group home-btn-group-bottom">
          <button className="home-btn" onClick={() => onNavigate('iniciar')}>Iniciar</button>
        </div>
      </main>
      {showOptions && (
        <OptionsModal visible={showOptions} onClose={() => setShowOptions(false)} />
      )}
    </div>
  );
}

export default HomeScreen;
