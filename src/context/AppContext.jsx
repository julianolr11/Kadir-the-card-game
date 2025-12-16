import React, { createContext, useState, useMemo } from 'react';

export const AppContext = createContext();


const getInitial = (key, fallback) => {
  if (typeof window !== 'undefined') {
    const value = localStorage.getItem(key);
    if (value !== null) {
      if (
        key === 'musicVolume' ||
        key === 'effectsVolume' ||
        key === 'volume'
      ) {
        return Number(value);
      }
      return value;
    }
  }
  return fallback;
};

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => getInitial('lang', 'ptbr'));
  // volume antigo para compatibilidade
  const [volume, setVolume] = useState(() => getInitial('volume', 50));
  const [musicVolume, setMusicVolume] = useState(() => getInitial('musicVolume', 50));
  const [effectsVolume, setEffectsVolume] = useState(() => getInitial('effectsVolume', 50));
  // Guardião ativo: { name, img }
  const [activeGuardian, setActiveGuardian] = useState(() => {
    // Tenta recuperar do localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('activeGuardian');
      if (stored) return JSON.parse(stored);
    }
    // Valor padrão
    return { name: 'draak', img: require('../assets/img/creatures/draak_bio.png') };
  });

  // Sempre salva no localStorage
  const updateActiveGuardian = (guardian) => {
    setActiveGuardian(guardian);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeGuardian', JSON.stringify(guardian));
    }
  };

  // Boosters: ao entrar no menu pela primeira vez, recebe 2 boosters
  const [boosters, setBoosters] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('boosters');
      if (stored !== null) return Number(stored);
    }
    return 2; // sempre começa com 2 boosters
  });

  // Sempre salva boosters no localStorage
  const updateBoosters = (value) => {
    setBoosters(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boosters', value);
    }
  };

  const contextValue = useMemo(
    () => ({
      lang,
      setLang,
      volume,
      setVolume, // legado
      musicVolume,
      setMusicVolume,
      effectsVolume,
      setEffectsVolume,
      activeGuardian,
      setActiveGuardian: updateActiveGuardian,
      boosters,
      setBoosters: updateBoosters,
    }),
    [
      lang,
      setLang,
      volume,
      setVolume,
      musicVolume,
      setMusicVolume,
      effectsVolume,
      setEffectsVolume,
      activeGuardian,
      boosters,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
