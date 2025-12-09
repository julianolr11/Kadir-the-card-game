import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState('ptbr');
  const [volume, setVolume] = useState(50);

  return (
    <AppContext.Provider value={{ lang, setLang, volume, setVolume }}>
      {children}
    </AppContext.Provider>
  );
};
