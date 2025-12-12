import React, { createContext, useState } from 'react';

export const AppContext = createContext();

const getInitial = (key, fallback) => {
  if (typeof window !== 'undefined') {
    const value = localStorage.getItem(key);
    if (value !== null) {
      if (key === 'volume') return Number(value);
      return value;
    }
  }
  return fallback;
};

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => getInitial('lang', 'ptbr'));
  const [volume, setVolume] = useState(() => getInitial('volume', 50));

  return (
    <AppContext.Provider value={{ lang, setLang, volume, setVolume }}>
      {children}
    </AppContext.Provider>
  );
};
