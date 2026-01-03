import React, { useState, useRef } from 'react';
import MenuMusicPlayer from '../components/MenuMusicPlayer';
import LoadingScreen from '../components/LoadingScreen';
import HomeScreen from '../components/HomeScreen';
import StartFlow from '../components/StartFlow';
import DeckBuilder from '../components/DeckBuilder';
import { AppProvider } from '../context/AppContext';

import LoadingMenu from './LoadingMenu';

export default function App() {
  const [screen, setScreen] = useState('loading');
  const menuMusicRef = useRef(null);

  // Navegação central
  const handleNavigate = (route: string) => {
    if (route === 'iniciar') setScreen('startflow');
    else if (route === 'home') setScreen('home');
    else if (route === 'deck') setScreen('deck');
    else if (route === 'opcoes') setScreen('opcoes');
    else if (route === 'sair') window.close();
    else setScreen('home');
  };

  return (
    <AppProvider>
      <MenuMusicPlayer ref={menuMusicRef} />
      {screen === 'loading' && (
        <LoadingScreen
          onFinish={() => setScreen('menu')}
          menuMusicRef={menuMusicRef}
        />
      )}
      {screen === 'menu' && (
        <LoadingMenu onNavigate={handleNavigate} menuMusicRef={menuMusicRef} />
      )}
      {screen === 'home' && (
        <HomeScreen onNavigate={handleNavigate} menuMusicRef={menuMusicRef} />
      )}
      {screen === 'startflow' && (
        <StartFlow
          onFinish={() => setScreen('home')}
          onGoHome={() => setScreen('home')}
          menuMusicRef={menuMusicRef}
        />
      )}
      {screen === 'deck' && (
        <DeckBuilder onNavigate={handleNavigate} menuMusicRef={menuMusicRef} />
      )}
      {/* Adicione outros fluxos conforme necessário */}
    </AppProvider>
  );
}
