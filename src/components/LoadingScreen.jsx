import React, { useEffect, useState, useRef, useContext } from 'react';
import keyClickSound from '../assets/sounds/effects/key_click.MP3';
import menuMusic from '../assets/sounds/music/menu.mp3';
import { AppContext } from '../context/AppContext';
import '../styles/animations.css';
import '../styles/vinheta.css';
import wallpaperStatic from '../assets/img/wallpaper/wallpaper.png';
import OptionsModal from './OptionsModal';
import ExitModal from './ExitModal';
import StartFlow from './StartFlow';

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
  },
};

function LoadingScreen({ onFinish, menuMusicRef }) {
  // menuMusicRef: ref global para controle da música do menu
  const [showMenu, setShowMenu] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [wallpaperTransition, setWallpaperTransition] = useState('video');
  const [videoError, setVideoError] = useState(false);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const videoRef = useRef(null);
  const keyClickAudioRef = useRef(null);
  const { musicVolume, lang, effectsVolume } = useContext(AppContext);
  const t = translations[lang] || translations.ptbr;

  useEffect(() => {
    const transitionTimer = setTimeout(() => {
      setWallpaperTransition('transitioning');
    }, 4000);

    const timer = setTimeout(() => {
      setWallpaperTransition('image');
      setShowMenu(true);
      if (onFinish) onFinish();
    }, 5000);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(timer);
    };
  }, [onFinish, musicVolume]);

  const handleVideoError = (e) => {
    console.error('ERRO NO VÍDEO LoadingScreen:', e);
    console.error('Video error details:', {
      src: videoRef.current?.src,
      error: videoRef.current?.error,
      networkState: videoRef.current?.networkState,
      readyState: videoRef.current?.readyState
    });
    setVideoError(true);
    setWallpaperTransition('image');
  };

  const handleVideoLoaded = () => {
    console.log('✅ Vídeo LoadingScreen carregado com sucesso!');
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Erro ao reproduzir vídeo:', err);
        setVideoError(true);
        setWallpaperTransition('image');
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const timeRemaining = video.duration - video.currentTime;
    const fadeDuration = 2.5; // 2.5 segundos de fade

    // Fade out nos últimos 2.5s
    if (timeRemaining <= fadeDuration && timeRemaining > 0) {
      const fadeProgress = timeRemaining / fadeDuration;
      setVideoOpacity(fadeProgress);
    }
    // Fade in nos primeiros 2.5s
    else if (video.currentTime <= fadeDuration) {
      const fadeProgress = video.currentTime / fadeDuration;
      setVideoOpacity(fadeProgress);
    }
    // Opacidade normal no meio
    else if (videoOpacity !== 1) {
      setVideoOpacity(1);
    }
  };

  const playClick = () => {
    if (keyClickAudioRef.current) {
      keyClickAudioRef.current.currentTime = 0;
      keyClickAudioRef.current.volume = (effectsVolume ?? 50) / 100;
      keyClickAudioRef.current.play().catch(() => {});
    }
  };

  const handleStart = () => {
    playClick();
    setShowStart(true);
  };
  const handleOptions = () => {
    playClick();
    setShowOptions(true);
  };
  const handleExit = () => {
    playClick();
    setShowExit(true);
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
      {/* Áudio da intro agora é global no App.tsx */}
      {/* menuMusicRef é global, não precisa de <audio> local */}

      {/* Wallpaper Animado (Vídeo) - Transição para imagem estática */}
      {!videoError && (
        <video
          ref={videoRef}
          src="/assets/img/wallpaper/wallpaper-menu.mp4"
          autoPlay
          loop
          muted
          playsInline
          onError={handleVideoError}
          onLoadedData={handleVideoLoaded}
          onTimeUpdate={handleTimeUpdate}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.9)',
            opacity: wallpaperTransition === 'video' ? videoOpacity : wallpaperTransition === 'transitioning' ? videoOpacity : 0,
            transition: wallpaperTransition === 'transitioning' ? 'opacity 1s ease-in' : 'opacity 2.5s ease-in-out',
          }}
          className={wallpaperTransition === 'transitioning' ? 'wallpaper-video-out' : 'fade-in'}
        />
      )}

      {/* Wallpaper Estático (Imagem) - Aparece após transição */}
      {(wallpaperTransition !== 'video' || videoError) && (
        <img
          src={wallpaperStatic}
          alt="Wallpaper"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.9)',
            opacity: wallpaperTransition === 'image' ? 1 : 0,
            transition: wallpaperTransition === 'transitioning' ? 'opacity 1s ease-out' : 'none',
          }}
          className={wallpaperTransition === 'transitioning' ? 'wallpaper-image-in' : ''}
        />
      )}
      <div className="vinheta" />
      {showMenu && (
        <>
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
            className="fade-in"
          >
            <button style={btnStyle} onClick={handleStart}>
              {t.start}
            </button>
            <button style={btnStyle} onClick={handleOptions}>
              {t.options}
            </button>
            <button style={btnStyle} onClick={handleExit}>
              {t.exit}
            </button>
            {/* Áudio do click dos botões do menu */}
            <audio ref={keyClickAudioRef} src={keyClickSound} preload="auto" />
          </div>
          {showStart && (
            <StartFlow
              onFinish={() => setShowStart(false)}
              menuMusicRef={menuMusicRef}
              musicVolume={musicVolume}
            />
          )}
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
        </>
      )}
    </div>
  );
}

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
