import React, { useState, useEffect, useRef } from 'react';
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


// Importa a versão direto do package.json
// @ts-ignore
import pkg from '../../package.json';
const appVersion = pkg.version || '1.0.0';

function LoadingMenu({ onNavigate, menuMusicRef, introMusicRef }: LoadingMenuProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pausa a música do menu quando entra em LoadingMenu
  useEffect(() => {
    if (menuMusicRef?.current) {
      menuMusicRef.current.pause();
    }
  }, [menuMusicRef]);

  const handleVideoError = () => {
    console.error('ERRO NO VÍDEO LoadingMenu');
    console.error('Video error details:', {
      src: videoRef.current?.src,
      error: videoRef.current?.error,
      networkState: videoRef.current?.networkState,
      readyState: videoRef.current?.readyState
    });
    setVideoError(true);
  };

  const handleVideoLoaded = () => {
    console.log('✅ Vídeo LoadingMenu carregado com sucesso!');
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        console.error('Erro ao reproduzir vídeo no LoadingMenu');
        setVideoError(true);
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
      className="menu-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Versão no canto superior esquerdo */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 4,
          background: 'rgba(30, 22, 40, 0.72)',
          color: 'rgb(255, 230, 176)',
          fontWeight: 600,
          fontSize: 10,
          padding: '4px 16px',
          borderRadius: 8,
          letterSpacing: '1px',
          zIndex: 20,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
          fontFamily: 'Poppins, Arial, sans-serif',
          userSelect: 'none',
        }}
      >
        v{appVersion}
      </div>

      {/* Vídeo do wallpaper em loop */}
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
            opacity: videoOpacity,
            transition: 'opacity 2.5s ease-in-out',
          }}
          className="fade-in"
        />
      )}

      {/* Fallback: Imagem estática caso vídeo falhe */}
      {videoError && (
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
      )}

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
