import React, { useEffect, useRef, useContext } from 'react';
import menuMusic from '../assets/sounds/music/menu.mp3';
import { AppContext } from '../context/AppContext';

const MenuMusicPlayer = React.forwardRef((props, ref) => {
  const audioRef = useRef(null);
  const { musicVolume } = useContext(AppContext);
  const shouldPlayRef = useRef(true);

  // Permite controle externo via ref
  React.useImperativeHandle(ref, () => ({
    play: () => {
      shouldPlayRef.current = true;
      if (audioRef.current) {
        audioRef.current.volume = (musicVolume ?? 100) / 100;
        return audioRef.current.play();
      }
      return Promise.resolve();
    },
    pause: () => {
      shouldPlayRef.current = false;
      if (audioRef.current) audioRef.current.pause();
    },
    setVolume: (v) => {
      if (audioRef.current) audioRef.current.volume = v;
    },
    getAudio: () => audioRef.current,
  }));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (musicVolume ?? 100) / 100;
    }

    // Loop agressivo para garantir que a música continue tocando
    const intervalId = setInterval(() => {
      if (audioRef.current && audioRef.current.parentNode && shouldPlayRef.current) {
        if (
          audioRef.current.paused ||
          (audioRef.current.duration &&
            audioRef.current.currentTime >= audioRef.current.duration - 0.1)
        ) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [musicVolume]);

  return <audio ref={audioRef} src={menuMusic} preload="auto" />;
});

export default MenuMusicPlayer;
