import React, { useState, useRef } from 'react';
import MenuMusicPlayer from '../components/MenuMusicPlayer';
import IntroMusicPlayer from '../components/IntroMusicPlayer';
import LoadingScreen from '../components/LoadingScreen';
import HomeScreen from '../components/HomeScreen';
import StartFlow from '../components/StartFlow';
import DeckBuilder from '../components/DeckBuilder';
import BattleBoard from '../components/BattleBoard';
import { AppProvider } from '../context/AppContext';
import { BattleProvider } from '../context/BattleContext';
import BoosterResultsSlider from '../components/BoosterResultsSlider';
import fieldCards from '../assets/cards/field/exampleFieldCards';
import LoadingMenu from './LoadingMenu';

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [battleDeck, setBattleDeck] = useState(null);
  const menuMusicRef = useRef(null);
  const introMusicRef = useRef(null);

  // Navegação central
  const handleNavigate = (route: string, params?: any) => {
    if (route === 'iniciar') setScreen('startflow');
    else if (route === 'home') setScreen('home');
    else if (route === 'deck') setScreen('deck');
    else if (route === 'battle') {
      setBattleDeck(params?.deck || null);
      setScreen('battle');
    }
    else if (route === 'opcoes') setScreen('opcoes');
    else if (route === 'sair') window.close();
    else setScreen('home');
  };

  return (
    <AppProvider>
      <IntroMusicPlayer ref={introMusicRef} />
      {screen !== 'battle' && <MenuMusicPlayer ref={menuMusicRef} />}
      {screen === 'loading' && (
        <LoadingScreen
          onFinish={() => setScreen('menu')}
          menuMusicRef={menuMusicRef}
        />
      )}
      {screen === 'menu' && (
        <LoadingMenu onNavigate={handleNavigate} menuMusicRef={menuMusicRef} introMusicRef={introMusicRef} />
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
      {screen === 'battle' && (
        <BattleProvider>
          <BattleBoard
            onNavigate={handleNavigate}
            selectedDeck={battleDeck}
          />
        </BattleProvider>
      )}
    </AppProvider>
  );
}
