//
import React, { useState, useRef, useEffect } from 'react';
import UpdateModal from '../components/UpdateModal';
import UpdateNotesModal from '../components/UpdateNotesModal';
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

// linha removida: declaração duplicada de useState
export default function App() {
  const [screen, setScreen] = useState('loading');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [battleDeck, setBattleDeck] = useState(null);
  const menuMusicRef = useRef(null);
  const introMusicRef = useRef(null);

  // Update modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateDownloading, setUpdateDownloading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateError, setUpdateError] = useState('');
  const [lang, setLang] = useState('pt'); // TODO: integrar com contexto de idioma se houver
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [updateVersion, setUpdateVersion] = useState('');

  // Detectar fullscreen
  useEffect(() => {
    const checkFullscreen = () => {
      const isFullscreen = document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement;
      document.body.classList.toggle('is-fullscreen', !!isFullscreen);
    };
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
    };
  }, []);

  // Checar update ao iniciar app (com delay mínimo para overlay)
  useEffect(() => {
    let overlayTimeout: NodeJS.Timeout;
    setCheckingUpdate(true);
    const minDelay = new Promise((resolve) => {
      overlayTimeout = setTimeout(resolve, 1500); // 1.5 segundos
    });
    if (window.electron?.ipcRenderer?.checkForUpdate) {
      Promise.all([
        window.electron.ipcRenderer.checkForUpdate(),
        minDelay
      ]).then(([res]) => {
        setCheckingUpdate(false);
        if (res?.updateAvailable) {
          setUpdateModalOpen(true);
          setUpdateVersion(res.info?.version || '');
        }
      });
    } else {
      minDelay.then(() => setCheckingUpdate(false));
    }
    // Listeners de progresso/erro
    window.electron?.ipcRenderer?.onUpdateProgress?.((progress: any) => {
      setUpdateProgress(progress.percent || 0);
    });
    window.electron?.ipcRenderer?.onUpdateError?.((err: any) => {
      setUpdateError(err?.toString() || 'Erro desconhecido');
      setUpdateDownloading(false);
    });
    // Quando terminar download
    window.electron?.ipcRenderer?.onUpdateDownloaded?.(() => {
      setUpdateDownloading(false);
      setUpdateModalOpen(false);
      setUpdateProgress(100);
      // Buscar release notes do GitHub e exibir modal
      if (updateVersion) {
        fetchReleaseNotes(updateVersion);
      }
    });
    return () => {
      if (overlayTimeout) clearTimeout(overlayTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateVersion]);

  // Buscar release notes do GitHub
  const fetchReleaseNotes = async (version: string) => {
    try {
      const owner = 'julianolr11';
      const repo = 'Kadir-the-card-game';
      const url = `https://api.github.com/repos/${owner}/${repo}/releases/tags/v${version}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Release notes not found');
      const data = await res.json();
      setReleaseNotes(data.body || '');
      setNotesModalOpen(true);
    } catch (e) {
      setReleaseNotes('');
      setNotesModalOpen(true);
    }
  };

  // Handler: usuário clica em atualizar
  const handleUpdate = () => {
    setUpdateDownloading(true);
    setUpdateError('');
    window.electron?.ipcRenderer?.downloadUpdate?.();
  };

  // Handler: usuário cancela
  const handleCancelUpdate = () => {
    setUpdateModalOpen(false);
    setUpdateDownloading(false);
    setUpdateError('');
    setUpdateProgress(0);
  };

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
      {checkingUpdate && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: 1,
        }}>
          {lang === 'en' ? 'Checking for updates...' : 'Buscando por atualizações...'}
        </div>
      )}
      <UpdateModal
        open={updateModalOpen}
        onUpdate={handleUpdate}
        onCancel={handleCancelUpdate}
        progress={updateProgress}
        error={updateError}
        lang={lang}
        downloading={updateDownloading}
      />
      <UpdateNotesModal
        open={notesModalOpen}
        notes={releaseNotes}
        lang={lang}
        onClose={() => setNotesModalOpen(false)}
      />
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
        <DeckBuilder onNavigate={handleNavigate} />
      )}
      {screen === 'battle' && (
        <BattleProvider>
          <BattleBoard
            onNavigate={handleNavigate}
            selectedDeck={battleDeck}
            menuMusicRef={menuMusicRef}
          />
        </BattleProvider>
      )}
    </AppProvider>
  );
}
