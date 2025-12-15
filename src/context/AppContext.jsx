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
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
