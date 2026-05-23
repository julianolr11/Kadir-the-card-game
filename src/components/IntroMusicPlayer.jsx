import React, { useEffect, useRef, useContext } from 'react';
import introMusic from '../assets/sounds/music/intro.mp3';
import { AppContext } from '../context/AppContext';

const IntroMusicPlayer = React.forwardRef((props, ref) => {
  const audioRef = useRef(null);
  const { musicVolume } = useContext(AppContext);

  const playIntroMusic = () => {
    if (!audioRef.current) return Promise.resolve();
    audioRef.current.muted = false;
    audioRef.current.volume = (musicVolume ?? 100) / 100;
    return audioRef.current.play().catch(() => {});
  };

  // Permite controle externo via ref
  React.useImperativeHandle(ref, () => ({
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    },
    play: () => {
      return playIntroMusic();
    },
    setVolume: (v) => {
      if (audioRef.current) audioRef.current.volume = v;
    },
    getAudio: () => audioRef.current,
  }));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (musicVolume ?? 100) / 100;
      playIntroMusic();
    }
    window.addEventListener('kadir-audio-unlocked', playIntroMusic);
    return () => {
      window.removeEventListener('kadir-audio-unlocked', playIntroMusic);
    };
  }, [musicVolume]);

  return <audio ref={audioRef} src={introMusic} loop preload="auto" />;
});

export default IntroMusicPlayer;
