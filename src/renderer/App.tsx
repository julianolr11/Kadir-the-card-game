import React, { useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import HomeScreen from '../components/HomeScreen';
import StartFlow from '../components/StartFlow';
import { AppProvider } from '../context/AppContext';

import LoadingMenu from './LoadingMenu';

export default function App() {
  const [screen, setScreen] = useState('loading');

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
      {screen === 'loading' && (
        <LoadingScreen onFinish={() => setScreen('menu')} />
      )}
      {screen === 'menu' && (
        <LoadingMenu onNavigate={handleNavigate} />
      )}
      {screen === 'home' && (
        <HomeScreen onNavigate={handleNavigate} />
      )}
      {screen === 'startflow' && (
        <StartFlow onFinish={() => setScreen('home')} onGoHome={() => setScreen('home')} />
      )}
      {/* Adicione outros fluxos conforme necessário */}
    </AppProvider>
  );
}
