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
        audioRef.current.play();
      }
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
    }
  }, [musicVolume]);

  return (
    <audio ref={audioRef} src={menuMusic} loop preload="auto" />
  );
});

export default MenuMusicPlayer;
