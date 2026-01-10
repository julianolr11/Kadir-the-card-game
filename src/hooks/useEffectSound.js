import { useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';

/**
 * Hook para gerenciar sons de efeitos com volume controlado
 * @param {string} soundFile - Caminho do arquivo de som
 * @returns {object} - Referência ao áudio e função para tocar
 */
export function useEffectSound(soundFile) {
  const { effectsVolume } = useContext(AppContext);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && typeof effectsVolume === 'number') {
      audioRef.current.volume = effectsVolume / 100;
    }
  }, [effectsVolume]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = (effectsVolume ?? 50) / 100;
      audioRef.current.play().catch(() => {});
    }
  };

  return { audioRef, play };
}

/**
 * Função helper para criar e tocar um som único com volume correto
 * @param {string} soundFile - Caminho do arquivo de som
 * @param {number} volume - Volume de 0 a 100
 */
export function playEffectSound(soundFile, volume = 50) {
  const audio = new Audio(soundFile);
  audio.volume = volume / 100;
  audio.play().catch(() => {});
  return audio;
}
