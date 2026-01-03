import React, { useContext, useRef, useEffect, useState } from 'react';
import cogSound from '../assets/sounds/effects/cog.MP3';
import candleSound from '../assets/sounds/effects/candle.mp3';
import sphereMenuSound from '../assets/sounds/effects/sphere-menu.MP3';
import OptionsModal from './OptionsModal';
import CogIcon from './CogIcon';
import '../styles/homescreen.css';
import { AppContext } from '../context/AppContext';
import boosterImg from '../assets/img/card/booster.png';
import packageSound from '../assets/sounds/effects/package.MP3';
import boosterAnimationVideo from '../assets/img/card/animacao-booster.mp4';
import creatures from '../assets/cards';
import BoosterResultsSlider from './BoosterResultsSlider';

// Traduções simples para o menu cog
const cogTranslations = {
  ptbr: { settings: 'Configurações', exit: 'Sair' },
  en: { settings: 'Settings', exit: 'Exit' },
};

function BoosterZone({ boosters, onOpenBooster, isOpeningBooster }) {
  // Edite este array para controlar manualmente o ângulo de cada booster (em graus)
  // Exemplo: diferença de 25 graus entre cada booster, do fundo para o topo
  const boosterAngles = [0, 25, 50, 75, 100];
  const stackCount = Math.min(boosters, boosterAngles.length);
  const [hover, setHover] = React.useState(false);
  const packageAudioRef = React.useRef(null);

  function handleBoosterMouseEnter() {
    setHover(true);
    if (packageAudioRef.current) {
      packageAudioRef.current.currentTime = 0;
      packageAudioRef.current.play().catch(() => {});
    }
  }

  function handleBoosterMouseLeave() {
    setHover(false);
    if (packageAudioRef.current) {
      packageAudioRef.current.pause();
      packageAudioRef.current.currentTime = 0;
    }
  }
  function handleBoosterClick() {
    if (boosters <= 0 || isOpeningBooster) return;
    onOpenBooster?.();
  }

  return (
    <div
      className="booster-zone"
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 30,
        minWidth: 159,
        minHeight: 230,
        width: 159,
        height: 230,
      }}
      onClick={handleBoosterClick}
    >
      {/* Áudio do efeito de pacote */}
      <audio ref={packageAudioRef} src={packageSound} preload="auto" />
      <div className="booster-zone-title">Booster Zone</div>
      {/* Div para boosters por cima do fundo */}
      <div
        className="booster-imgs-layer"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          zIndex: 20,
          pointerEvents: 'none',
        }}
        onMouseEnter={handleBoosterMouseEnter}
        onMouseLeave={handleBoosterMouseLeave}
      >
        {boosters > 0 && (
          <>
            {[...Array(stackCount).keys()].map((i) => (
              <img
                key={i}
                src={boosterImg}
                alt="Booster"
                className={`booster-img booster-stack booster-stack-${i}${hover ? ` booster-stack-${i}-hover` : ''}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  zIndex: 12 + i,
                  filter:
                    'drop-shadow(0 0 0px #000000cc) drop-shadow(0 0 4px #000000ff)',
                  transition: 'transform 0.3s cubic-bezier(.7,1.7,.5,1)',
                  pointerEvents: i === 0 ? 'auto' : 'none',
                  opacity: boosters > i ? 1 : 0,
                }}
              />
            ))}
          </>
        )}
      </div>
      {/* Quantidade e label continuam acima */}
      {boosters > 0 && (
        <>
          <span
            className="booster-qty"
            style={{ zIndex: 30, position: 'absolute', top: 8, right: 12 }}
          >
            x{boosters}
          </span>
          <span className="booster-hover-label">Abrir booster</span>
        </>
      )}
      {boosters <= 0 && (
        <span className="booster-empty-label">Sem boosters</span>
      )}
    </div>
  );
}

function HomeScreen({ onNavigate, menuMusicRef }) {
  const cogAudioRef = React.useRef(null);

  function handleCogMouseEnter() {
    if (cogAudioRef.current) {
      cogAudioRef.current.currentTime = 0;
      cogAudioRef.current.play().catch(() => {});
    }
  }
  // Ref e handler para som do deck-btn
  const deckBtnAudioRef = React.useRef(null);
  function handleDeckBtnMouseEnter() {
    if (deckBtnAudioRef.current) {
      deckBtnAudioRef.current.currentTime = 0;
      deckBtnAudioRef.current.play().catch(() => {});
    }
  }
  // menuMusicRef: ref global para controle da música do menu
  const candleAudioRef = React.useRef(null);
  const candleContainerRef = React.useRef(null);
  const [candleKey, setCandleKey] = React.useState(0);

  React.useEffect(() => {
    const music = menuMusicRef?.current?.getAudio?.();

    const playMusic = () => {
      if (music && music.parentNode) {
        music.currentTime = 0;
        const playPromise = music.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('Erro ao reproduzir música:', error);
          });
        }
      }
    };

    // Toca a música imediatamente
    playMusic();

    // Listener para quando o áudio das candles terminar
    const handleCandleEnded = () => {
      // Remove e re-adiciona o elemento para forçar recarga
      setTimeout(() => {
        setCandleKey((prev) => prev + 1);
      }, 100);
    };

    const candle = candleAudioRef.current;
    if (candle) {
      candle.addEventListener('ended', handleCandleEnded);
      candle.volume = 0.5;
      candle.currentTime = 0;
      const playPromise = candle.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Erro ao reproduzir vela:', error);
        });
      }
    }

    // Loop de segurança: verifica a cada 200ms se os áudios pararam
    const intervalId = setInterval(() => {
      if (candle && candle.parentNode && (candle.paused || candle.ended)) {
        handleCandleEnded();
      }

      if (music && music.parentNode && (music.paused || music.ended)) {
        playMusic();
      }
    }, 200);

    return () => {
      clearInterval(intervalId);
      if (candle) {
        candle.removeEventListener('ended', handleCandleEnded);
      }
    };
  }, [menuMusicRef, candleKey]);
  const {
    activeGuardian,
    boosters = 0,
    lang = 'ptbr',
    setBoosters,
    addCardsFromBooster,
  } = useContext(AppContext);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isOpeningBooster, setIsOpeningBooster] = useState(false);
  const [showBoosterVideo, setShowBoosterVideo] = useState(false);
  const [showBoosterResults, setShowBoosterResults] = useState(false);
  const [openedBoosterCards, setOpenedBoosterCards] = useState([]);
  const boosterVideoRef = useRef(null);
  const [cheatInput, setCheatInput] = useState('');

  // Cheat code detector
  useEffect(() => {
    function handleKeyPress(e) {
      // Ignora se está digitando em um input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
        return;

      setCheatInput((prev) => {
        const updated = (prev + e.key).toLowerCase();
        // Mantém apenas os últimos 15 caracteres para não consumir muita memória
        const trimmed = updated.slice(-15);

        if (trimmed.endsWith('kadirbooster')) {
          setBoosters(Math.max(0, boosters) + 5);
          return '';
        }
        
        if (trimmed.endsWith('kadirreset')) {
          if (confirm('⚠️ Resetar todo o progresso?\n\n• Limpar coleção\n• Resetar decks\n• 5 boosters')) {
            localStorage.setItem('boosters', '5');
            localStorage.setItem('cardCollection', '{}');
            localStorage.removeItem('kadir_decks');
            localStorage.removeItem('guardianLoadouts');
            window.location.reload();
          }
          return '';
        }
        
        return trimmed;
      });
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [boosters, setBoosters]);

  // Fecha dropdown ao clicar fora
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target.closest('.home-cog-btn') &&
        !event.target.closest('.home-cog-dropdown')
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Tradução do menu cog
  const t = cogTranslations[lang] || cogTranslations.ptbr;

  function generateBoosterPack() {
    const pool = Array.isArray(creatures) ? [...creatures] : [];
    // Embaralha pool simples
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const selected = pool.slice(0, 5).map((card) => ({
      ...card,
      isHolo: Math.random() < 0.05,
    }));
    return selected;
  }

  function handleOpenBooster() {
    if (boosters <= 0 || isOpeningBooster) return;
    setIsOpeningBooster(true);
    setShowBoosterResults(false);
    setOpenedBoosterCards(generateBoosterPack());
    setShowBoosterVideo(true);
    setBoosters(Math.max(0, boosters - 1));
  }

  function handleCloseBoosterAnimation() {
    setShowBoosterVideo(false);
    setShowBoosterResults(true);
    if (boosterVideoRef.current) {
      boosterVideoRef.current.pause();
      boosterVideoRef.current.currentTime = 0;
    }
  }

  function handleCloseBoosterResults() {
    // Adiciona as cartas do booster à coleção como instâncias
    const cardIds = openedBoosterCards.map(card => card.id);
    addCardsFromBooster(cardIds);
    setShowBoosterResults(false);
    setIsOpeningBooster(false);
  }

  useEffect(() => {
    if (showBoosterVideo && boosterVideoRef.current) {
      boosterVideoRef.current.currentTime = 0;
      boosterVideoRef.current.play().catch(() => {
        // Ignora erros de autoplay; o usuário acabou de clicar para abrir
      });
    }
  }, [showBoosterVideo]);

  return (
    <div className="home-screen">
      {/* Áudio de vela queimando em loop - key força recriação do elemento */}
      <audio
        key={candleKey}
        ref={candleAudioRef}
        src={candleSound}
        preload="auto"
      />
      {/* Background 3D em duas camadas */}
      <div className="main-menu-background">
        <div className="main-menu-bg-base" />
      </div>
      {/* Efeitos de vela animada dentro de container responsivo */}
      <div className="candle-container-16x9">
        <div className="candle-glow" />
        <div className="candle-flame candle-flame-1" />
        <div className="candle-flame candle-flame-2" />
        <div className="candle-flame candle-flame-3" />
        <div className="candle-flame candle-flame-4" />
        <div className="candle-flame candle-flame-5" />
        <div className="candle-flame candle-flame-6" />
        <div className="candle-flame candle-flame-7" />
      </div>
      {/* Ícone de engrenagem no canto superior direito */}
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 100 }}>
        <audio ref={cogAudioRef} src={cogSound} preload="auto" />
        <button
          className="home-cog-btn"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          onMouseEnter={handleCogMouseEnter}
          onClick={(e) => {
            setDropdownOpen((v) => !v);
          }}
          aria-label="Abrir menu de opções"
        >
          <CogIcon size={32} color="#ffe6b0" />
        </button>
        {dropdownOpen && (
          <div
            className="home-cog-dropdown"
            style={{
              position: 'absolute',
              top: 40,
              right: 0,
              background: 'rgba(30,22,40,0.98)',
              borderRadius: 12,
              boxShadow: '0 4px 24px #000a',
              minWidth: 160,
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              zIndex: 200,
            }}
          >
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#ffe6b0',
                fontSize: 18,
                fontWeight: 500,
                padding: '12px 24px',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 0,
                width: '100%',
                transition: 'background 0.2s',
              }}
              onClick={() => {
                setDropdownOpen(false);
                setShowOptions(true);
              }}
            >
              {t.settings}
            </button>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#ffe6b0',
                fontSize: 18,
                fontWeight: 500,
                padding: '12px 24px',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 0,
                width: '100%',
                transition: 'background 0.2s',
              }}
              onClick={() => {
                setDropdownOpen(false);
                onNavigate('sair');
              }}
            >
              {t.exit}
            </button>
          </div>
        )}
      </div>
      <BoosterZone
        boosters={boosters}
        onOpenBooster={handleOpenBooster}
        isOpeningBooster={isOpeningBooster}
      />
      <main className="home-main">
        {/* Título removido conforme solicitado */}
        <div className="deck-btn-center-group">
          {/* Áudio do efeito sphere-menu */}
          <audio ref={deckBtnAudioRef} src={sphereMenuSound} preload="auto" />
          <button
            className={`deck-btn${activeGuardian && activeGuardian.element ? ` deck-btn-${activeGuardian.element}` : ''}`}
            onClick={() => onNavigate('deck')}
            onMouseEnter={handleDeckBtnMouseEnter}
            style={{
              backgroundImage: activeGuardian?.img
                ? `url(${activeGuardian.img})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow:
                activeGuardian?.element === 'agua'
                  ? '0 0 48px 16px #00cfff, 0 0 32px 8px #00eaff inset, 0 0 0 8px #00eaff80, 0 0 32px 16px #00cfff80, 0 0 64px 24px 8px #00eaff, 0 0 0 12px #00cfff, 0 0 0 0px #00eaff, 0 0 0 0px #00cfff, 0 0 0 0px #00eaff, 0 0 0 0px #00cfff'
                  : activeGuardian?.element === 'terra'
                    ? '0 0 48px 16px #4caf50, 0 0 32px 8px #e2c290 inset, 0 0 0 8px #e2c29080, 0 0 32px 16px #4caf5080, 0 0 64px 24px 8px #e2c290, 0 0 0 12px #4caf50, 0 0 0 0px #e2c290, 0 0 0 0px #4caf50, 0 0 0 0px #e2c290, 0 0 0 0px #4caf50'
                    : activeGuardian?.element === 'fire'
                      ? '0 0 48px 16px #ff3c00, 0 0 32px 8px #ffb347 inset, 0 0 0 8px #ffb34780, 0 0 32px 16px #ff3c0080, 0 0 64px 24px 8px #ffb347, 0 0 0 12px #ff3c00, 0 0 0 0px #ffb347, 0 0 0 0px #ff3c00, 0 0 0 0px #ffb347, 0 0 0 0px #ff3c00'
                      : activeGuardian?.element === 'ar'
                        ? '0 0 48px 16px #b388ff, 0 0 32px 8px #b0e6ff inset, 0 0 0 8px #b388ff80, 0 0 32px 16px #b0e6ff80, 0 0 64px 24px 8px #b388ff, 0 0 0 12px #b0e6ff, 0 0 0 0px #b388ff, 0 0 0 0px #b0e6ff, 0 0 0 0px #b388ff, 0 0 0 0px #b0e6ff'
                        : activeGuardian?.element === 'puro'
                          ? '0 0 48px 16px #fff6b0, 0 0 32px 8px #fff6b0 inset, 0 0 0 8px #fff6b080, 0 0 32px 16px #fff6b080, 0 0 64px 24px 8px #fff6b0, 0 0 0 12px #fffde4, 0 0 0 0px #fff6b0, 0 0 0 0px #fffde4, 0 0 0 0px #fff6b0, 0 0 0 0px #fffde4'
                          : undefined,
            }}
          >
            <span className="deck-btn-label">Deck</span>
          </button>
        </div>
        <div className="home-btn-group home-btn-group-bottom">
          <button className="home-btn" onClick={() => onNavigate('iniciar')}>
            Iniciar
          </button>
        </div>
      </main>
      {showOptions && (
        <OptionsModal
          visible={showOptions}
          onClose={() => setShowOptions(false)}
        />
      )}
      {showBoosterVideo && (
        <div
          className="booster-animation-overlay"
          onClick={handleCloseBoosterAnimation}
        >
          <video
            ref={boosterVideoRef}
            className="booster-animation-video"
            src={boosterAnimationVideo}
            autoPlay
            playsInline
            onEnded={handleCloseBoosterAnimation}
          />
          <button
            className="booster-animation-skip"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCloseBoosterAnimation();
            }}
          >
            Pular animação
          </button>
        </div>
      )}
      {showBoosterResults && (
        <BoosterResultsSlider
          cards={openedBoosterCards}
          lang={lang}
          onClose={handleCloseBoosterResults}
        />
      )}
    </div>
  );
}

export default HomeScreen;
