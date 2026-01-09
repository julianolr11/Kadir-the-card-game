import React, { useEffect, useRef, useContext } from 'react';
import introMusic from '../assets/sounds/music/intro.mp3';
import { AppContext } from '../context/AppContext';

const IntroMusicPlayer = React.forwardRef((props, ref) => {
  const audioRef = useRef(null);
  const { musicVolume } = useContext(AppContext);

  // Permite controle externo via ref
  React.useImperativeHandle(ref, () => ({
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    },
    play: () => {
      if (audioRef.current) {
        audioRef.current.volume = (musicVolume ?? 100) / 100;
        return audioRef.current.play();
      }
      return Promise.resolve();
    },
    setVolume: (v) => {
      if (audioRef.current) audioRef.current.volume = v;
    },
    getAudio: () => audioRef.current,
  }));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (musicVolume ?? 100) / 100;
      audioRef.current.play().catch(() => {});
    }
  }, [musicVolume]);

  return <audio ref={audioRef} src={introMusic} loop preload="auto" />;
});

export default IntroMusicPlayer;
