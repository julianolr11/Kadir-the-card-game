//
import React, { useState, useRef, useEffect } from 'react';
import UpdateModal from '../components/UpdateModal';
import UpdateNotesModal from '../components/UpdateNotesModal';
import MenuMusicPlayer from '../components/MenuMusicPlayer';
import IntroMusicPlayer from '../components/IntroMusicPlayer';
import LoadingScreen from '../components/LoadingScreen';
import SplashScreen from '../components/SplashScreen';
import AudioUnlock from '../components/AudioUnlock';
import HomeScreen from '../components/HomeScreen';
import StartFlow from '../components/StartFlow';
import DeckBuilder from '../components/DeckBuilder';
import BattleBoard from '../components/BattleBoard';
import CampaignTower from '../components/CampaignTower';
import PvpLobby from '../components/PvpLobby';
import CalamityLobby from '../components/CalamityLobby';
import KadirFullArtPreview from '../components/KadirFullArtPreview';
import { AppProvider } from '../context/AppContext';
import { BattleProvider } from '../context/BattleContext';
import BoosterResultsSlider from '../components/BoosterResultsSlider';
import fieldCards from '../assets/cards/field/exampleFieldCards';
import LoadingMenu from './LoadingMenu';
import '../styles/stacking.css';

// linha removida: declaração duplicada de useState
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState('loading');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [battleDeck, setBattleDeck] = useState(null);
  const [battleConfig, setBattleConfig] = useState<any>(null);
  const [routeCurtain, setRouteCurtain] = useState<'hidden' | 'covering' | 'revealing'>('hidden');
  const menuMusicRef = useRef(null);
  const introMusicRef = useRef(null);

  // Update modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateDownloading, setUpdateDownloading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateError, setUpdateError] = useState('');
  const [lang, setLang] = useState(() => (
    typeof window !== 'undefined' && localStorage.getItem('lang') === 'en' ? 'en' : 'ptbr'
  ));
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [updateVersion, setUpdateVersion] = useState('');

  // Restaurar preferências de vídeo e refletir o estado nativo do Electron no DOM.
  useEffect(() => {
    const savedResolution = localStorage.getItem('resolution') || '1280x720';
    const resolutionMatch = /^(\d+)x(\d+)$/.exec(savedResolution);
    const resolution = resolutionMatch
      ? { width: Number(resolutionMatch[1]), height: Number(resolutionMatch[2]) }
      : { width: 1280, height: 720 };
    const fullscreen = localStorage.getItem('fullscreen') === 'true';

    const reflectDisplayState = (state: { fullscreen: boolean }) => {
      document.body.classList.toggle('is-fullscreen', state.fullscreen);
    };

    const unsubscribe = window.electron?.ipcRenderer?.onDisplayStateChanged?.(
      reflectDisplayState,
    );

    window.electron?.ipcRenderer?.applyDisplaySettings?.({
      ...resolution,
      fullscreen,
    }).then(reflectDisplayState).catch((error: unknown) => {
      console.error('Não foi possível restaurar as opções de vídeo:', error);
    });

    return () => {
      unsubscribe?.();
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
        // Se estiver na Steam, não mostra modal de update
        if (res?.steamBuild) {
          console.log('Steam build detected - update system disabled');
          return;
        }
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
      setUpdateProgress(100);
      // Não fecha o modal - mostra botão de reiniciar
    });
    return () => {
      if (overlayTimeout) clearTimeout(overlayTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateVersion]);

  // Aceita convite de sala PvP vindo dos amigos da Steam, de qualquer tela.
  useEffect(() => {
    const unsubscribe = window.electron?.ipcRenderer?.onSteamLobbyJoinRequested?.(
      async (data: { lobbyId: string; friendSteamId64: string }) => {
        const result = await window.electron?.ipcRenderer?.joinSteamLobby?.(data.lobbyId);
        if (result?.ok) {
          setScreen('pvp-lobby');
        }
      },
    );
    return () => {
      unsubscribe?.();
    };
  }, []);

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

  // Handler: reiniciar agora para instalar atualização
  const handleRestartNow = () => {
    window.electron?.ipcRenderer?.quitAndInstall?.();
  };

  // Navegação central
  const handleNavigate = (route: string, params?: any) => {
    if (route === 'iniciar') {
      const hasStartedJourney = localStorage.getItem('kadirStartFlowCompleted') === 'true';
      setScreen(hasStartedJourney ? 'home' : 'startflow');
    }
    else if (route === 'home') {
      if (params?.transition === 'continue') {
        setRouteCurtain('covering');
        setScreen('home');
        window.setTimeout(() => {
          setRouteCurtain('revealing');
          window.setTimeout(() => setRouteCurtain('hidden'), 720);
        }, 3000);
      } else {
        setScreen('home');
      }
    }
    else if (route === 'deck') setScreen('deck');
    else if (route === 'campaign') setScreen('campaign');
    else if (route === 'pvp-lobby') setScreen('pvp-lobby');
    else if (route === 'calamity-lobby') setScreen('calamity-lobby');
    else if (route === 'battle') {
      setBattleDeck(params?.deck || null);
      setBattleConfig(params || null);
      setScreen('battle');
    }
    else if (route === 'opcoes') setScreen('opcoes');
    else if (route === 'sair') window.close();
    else setScreen('home');
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <AppProvider>
      <AudioUnlock />
      <KadirFullArtPreview />
      {(screen === 'loading' || screen === 'menu') && <IntroMusicPlayer ref={introMusicRef} />}
      {screen !== 'battle' && screen !== 'loading' && <MenuMusicPlayer ref={menuMusicRef} />}
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
        onRestart={handleRestartNow}
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
      {screen === 'campaign' && (
        <CampaignTower
          onBack={() => setScreen('home')}
          onStartBattle={(opponent: any) => handleNavigate('battle', { mode: 'campaign', opponent })}
        />
      )}
      {screen === 'pvp-lobby' && (
        <PvpLobby
          onBack={() => setScreen('home')}
          onStartBattle={(params: { isHost: boolean; peerSteamId64: string; opponentDeck?: any[] }) => {
            handleNavigate('battle', { mode: 'pvp', ...params });
          }}
        />
      )}
      {screen === 'battle' && (
        <BattleProvider>
          <BattleBoard
            onNavigate={handleNavigate}
            selectedDeck={battleDeck}
            battleConfig={battleConfig}
            menuMusicRef={menuMusicRef}
          />
        </BattleProvider>
      )}
      {screen === 'calamity-lobby' && (
        <CalamityLobby
          onBack={() => setScreen('home')}
          onNavigate={handleNavigate}
          onStartBattle={(params: any) => handleNavigate('battle', {
            mode: 'calamity',
            bossId: params?.bossId,
            deck: params?.deckCards,
            playerCount: params?.playerCount || 1,
          })}
        />
      )}
      {routeCurtain !== 'hidden' && (
        <div className={`route-black-curtain ${routeCurtain}`} aria-hidden>
          {routeCurtain === 'covering' && (
            <div className="route-curtain-content">
              <div className="route-curtain-rune" aria-hidden>
                <i /><i /><i /><i />
              </div>
              <div className="route-curtain-card-aura" aria-hidden />
              <div className="route-curtain-card" aria-hidden>
                <span />
              </div>
              <div className="route-curtain-copy">
                <span className="route-curtain-kicker">KADIR</span>
                <div className="route-curtain-text">{lang === 'en' ? 'Preparing your journey' : 'Preparando sua jornada'}</div>
                <span className="route-curtain-status">
                  {lang === 'en' ? 'Gathering your cards' : 'Reunindo suas cartas'}
                </span>
                <div className="route-curtain-progress" aria-hidden>
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppProvider>
  );
}
