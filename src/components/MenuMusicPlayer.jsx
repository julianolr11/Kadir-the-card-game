import React, { useEffect, useRef } from 'react';
import menuMusic from '../assets/sounds/music/menu.mp3';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const MenuMusicPlayer = React.forwardRef((props, ref) => {
  const audioRef = useRef(null);
  const { musicVolume } = useContext(AppContext);

  // Permite controle externo via ref
  React.useImperativeHandle(ref, () => ({
    play: () => {
      if (audioRef.current) {
        audioRef.current.volume = (musicVolume ?? 100) / 100;
        return audioRef.current.play();
      }
      return Promise.resolve();
    },
    pause: () => {
      if (audioRef.current) audioRef.current.pause();
    },
    setVolume: (v) => {
      if (audioRef.current) audioRef.current.volume = v;
    },
    getAudio: () => audioRef.current
  }));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (musicVolume ?? 100) / 100;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // Loop agressivo para garantir que a música continue tocando
    const intervalId = setInterval(() => {
      if (audioRef.current && audioRef.current.parentNode) {
        if (audioRef.current.paused || (audioRef.current.duration && audioRef.current.currentTime >= audioRef.current.duration - 0.1)) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [musicVolume]);

  return (
    <audio ref={audioRef} src={menuMusic} preload="auto" />
  );
});

export default MenuMusicPlayer;
