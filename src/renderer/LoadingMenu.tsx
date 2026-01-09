import React, { useState } from 'react';
import OptionsModal from '../components/OptionsModal';
import ExitModal from '../components/ExitModal';
import '../styles/animations.css';
import '../styles/vinheta.css';
import wallpaper from '../assets/img/wallpaper/wallpaper.png';

interface LoadingMenuProps {
  onNavigate: (route: string) => void;
  menuMusicRef: any;
  introMusicRef: any;
}

function LoadingMenu({ onNavigate, menuMusicRef, introMusicRef }: LoadingMenuProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showExit, setShowExit] = useState(false);

  const handleIniciar = () => {
    // Para a música intro
    if (introMusicRef?.current) {
      introMusicRef.current.pause();
      introMusicRef.current.currentTime = 0;
    }
    // Toca a música do menu quando clicar em Iniciar
    if (menuMusicRef?.current) {
      const playPromise = menuMusicRef.current.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    }
    onNavigate('iniciar');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <img
        src={wallpaper}
        alt="Menu"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.9)',
        }}
        className="fade-in"
      />
      <div className="vinheta" />
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 30,
        }}
        className="fade-in"
      >
        <button className="home-btn" onClick={handleIniciar}>
          Iniciar
        </button>
        <button className="home-btn" onClick={() => setShowOptions(true)}>
          Opções
        </button>
        <button className="home-btn" onClick={() => setShowExit(true)}>
          Sair
        </button>
      </div>
      {showOptions && (
        <OptionsModal
          visible={showOptions}
          onClose={() => setShowOptions(false)}
        />
      )}
      {showExit && (
        <ExitModal
          visible={showExit}
          onConfirm={() => window.close()}
          onCancel={() => setShowExit(false)}
        />
      )}
    </div>
  );
}

export default LoadingMenu;
