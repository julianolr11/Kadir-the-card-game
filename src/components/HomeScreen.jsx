import React, { useContext, useRef, useEffect, useState } from 'react';
import cogSound from '../assets/sounds/effects/cog.MP3';
import candleSound from '../assets/sounds/effects/candle.mp3';
import sphereMenuSound from '../assets/sounds/effects/sphere-menu.MP3';
import movingTableSound from '../assets/sounds/effects/moving-table.mp3';
import OptionsModal from './OptionsModal';
import CogIcon from './CogIcon';
import '../styles/homescreen.css';
import '../styles/bestiary.css';
import { AppContext } from '../context/AppContext';
import boosterImg from '../assets/img/card/booster.png';
import packageSound from '../assets/sounds/effects/package.MP3';
import boosterAnimationVideo from '../assets/img/card/animacao-booster.mp4';
import creatures from '../assets/cards';
import BoosterResultsSlider from './BoosterResultsSlider';
import DeckSelectModal from './DeckSelectModal';
import Bestiary from './Bestiary';
import Shop from './Shop';

// Função para carregar dados da carta do guardião
const getGuardianCardData = (guardianId) => {
  try {
    return require(`../assets/cards/booster1/${guardianId}.js`);
  } catch (error) {
    return null;
  }
};

// Traduções simples para o menu cog
const cogTranslations = {
  ptbr: { settings: 'Configurações', exit: 'Sair' },
  en: { settings: 'Settings', exit: 'Exit' },
};

function BoosterZone({ boosters, onOpenBooster, isOpeningBooster, effectsVolume }) {
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
      packageAudioRef.current.volume = (effectsVolume ?? 50) / 100;
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
        <span className="booster-empty-label">Sem<br />Boosters</span>
      )}
    </div>
  );
}

function HomeScreen({ onNavigate, menuMusicRef }) {
  const cogAudioRef = React.useRef(null);

  function handleCogMouseEnter() {
    if (cogAudioRef.current) {
      cogAudioRef.current.currentTime = 0;
      cogAudioRef.current.volume = (effectsVolume ?? 50) / 100;
      cogAudioRef.current.play().catch(() => {});
    }
  }
  // Ref e handler para som do deck-btn
  const deckBtnAudioRef = React.useRef(null);
  function handleDeckBtnMouseEnter() {
    if (deckBtnAudioRef.current) {
      deckBtnAudioRef.current.currentTime = 0;
      deckBtnAudioRef.current.volume = (effectsVolume ?? 50) / 100;
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
    coins = 0,
    lang = 'ptbr',
    setBoosters,
    addCardsFromBooster,
    decks = {},
    effectsVolume,
  } = useContext(AppContext);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isOpeningBooster, setIsOpeningBooster] = useState(false);
  const [showBoosterVideo, setShowBoosterVideo] = useState(false);
  const [showBoosterResults, setShowBoosterResults] = useState(false);
  const [openedBoosterCards, setOpenedBoosterCards] = useState([]);
  const boosterVideoRef = useRef(null);
  const [cheatInput, setCheatInput] = useState('');
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const bestiaryAudioRef = useRef(null);
  const [showShop, setShowShop] = useState(false);
  const shopAudioRef = useRef(null);

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
        return trimmed;
      });
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Processa cheats detectados
  useEffect(() => {
    if (cheatInput.endsWith('kadirbooster')) {
      setBoosters(Math.max(0, boosters) + 5);
      setCheatInput('');
    }
  }, [cheatInput, boosters, setBoosters]);

  // Processa reset cheat
  useEffect(() => {
    if (cheatInput.endsWith('kadirreset')) {
      if (confirm('⚠️ RESETAR TODO O PROGRESSO?\n\n• Limpar coleção de cartas\n• Deletar TODOS os decks\n• Resetar guardiões\n• 5 boosters\n\nEsta ação não pode ser desfeita!')) {
        // Limpar TUDO relacionado ao jogo
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('kadir') || key.includes('deck') || key.includes('guardian') || key.includes('card'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Remover especificamente essas chaves importantes
        localStorage.removeItem('decks');
        localStorage.removeItem('kadir_decks');
        localStorage.removeItem('guardianLoadouts');
        localStorage.removeItem('activeGuardian');
        localStorage.removeItem('cardCollection');
        localStorage.removeItem('boosters');

        // Definir valores iniciais
        localStorage.setItem('boosters', '5');
        localStorage.setItem('cardCollection', '{}');
        localStorage.setItem('decks', '{}');
        localStorage.setItem('kadir_decks', '{}');
        localStorage.setItem('activeGuardian', JSON.stringify({
          name: 'draak',
          img: '../assets/img/creatures/draak_bio.webp'
        }));

        alert('✅ Reset concluído! A página será recarregada.');
        setTimeout(() => window.location.reload(), 500);
      }
      setCheatInput('');
    }
  }, [cheatInput, setBoosters]);

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
    // Adiciona as cartas do booster à coleção, preservando status holo
    addCardsFromBooster(openedBoosterCards);
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

  function handleBestiaryClick() {
    if (bestiaryAudioRef.current) {
      bestiaryAudioRef.current.currentTime = 0;
      bestiaryAudioRef.current.volume = (effectsVolume ?? 50) / 100;
      bestiaryAudioRef.current.play().catch(() => {});
    }
    setShowBestiary(true);
  }

  function handleShopClick() {
    if (shopAudioRef.current) {
      shopAudioRef.current.currentTime = 0;
      shopAudioRef.current.volume = (effectsVolume ?? 50) / 100;
      shopAudioRef.current.play().catch(() => {});
    }
    setShowShop(true);
  }

  return (
    <div className="home-screen-container">
      {/* Tela do Shop */}
      <div className={`screen-wrapper ${showShop ? 'center' : 'slide-to-left'}`}>
        <Shop onBack={() => setShowShop(false)} />
      </div>

      {/* Tela Principal (HomeScreen) */}
      <div className={`screen-wrapper ${showBestiary ? 'slide-to-left' : showShop ? 'slide-to-right' : 'center'}`}>
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

      {/* Display de moedas no canto superior esquerdo */}
      <div className="home-coins-display">
        <img
          src={require('../assets/img/icons/head.png')}
          alt="Moedas"
          className="home-coin-icon"
        />
        <span className="home-coin-amount">{coins?.toLocaleString() || 0}</span>
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
        effectsVolume={effectsVolume}
      />
      <main className="home-main">
        {/* Título removido conforme solicitado */}
        <div className="deck-btn-center-group">
          {/* Áudio do efeito sphere-menu */}
          <audio ref={deckBtnAudioRef} src={sphereMenuSound} preload="auto" />
          {(() => {
            const guardianCardData = activeGuardian ? getGuardianCardData(activeGuardian.id || activeGuardian.name) : null;
            const guardianElement = guardianCardData?.element || activeGuardian?.element;

            return (
              <button
                className={`deck-btn${guardianElement ? ` deck-btn-${guardianElement}` : ''}`}
                onClick={() => onNavigate('deck')}
                onMouseEnter={handleDeckBtnMouseEnter}
                style={{
                  backgroundImage: activeGuardian?.img
                    ? `url(${activeGuardian.img})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow:
                    guardianElement === 'agua'
                      ? '0 0 48px 16px #00cfff, 0 0 32px 8px #00eaff inset, 0 0 0 8px #00eaff80, 0 0 32px 16px #00cfff80, 0 0 64px 24px 8px #00eaff, 0 0 0 12px #00cfff, 0 0 0 0px #00eaff, 0 0 0 0px #00cfff, 0 0 0 0px #00eaff, 0 0 0 0px #00cfff'
                      : guardianElement === 'terra'
                        ? '0 0 48px 16px #4caf50, 0 0 32px 8px #e2c290 inset, 0 0 0 8px #e2c29080, 0 0 32px 16px #4caf5080, 0 0 64px 24px 8px #e2c290, 0 0 0 12px #4caf50, 0 0 0 0px #e2c290, 0 0 0 0px #4caf50, 0 0 0 0px #e2c290, 0 0 0 0px #4caf50'
                        : guardianElement === 'fogo'
                          ? '0 0 48px 16px #ff3c00, 0 0 32px 8px #ffb347 inset, 0 0 0 8px #ffb34780, 0 0 32px 16px #ff3c0080, 0 0 64px 24px 8px #ffb347, 0 0 0 12px #ff3c00, 0 0 0 0px #ffb347, 0 0 0 0px #ff3c00, 0 0 0 0px #ffb347, 0 0 0 0px #ff3c00'
                          : guardianElement === 'ar'
                            ? '0 0 48px 16px #b388ff, 0 0 32px 8px #b0e6ff inset, 0 0 0 8px #b388ff80, 0 0 32px 16px #b0e6ff80, 0 0 64px 24px 8px #b388ff, 0 0 0 12px #b0e6ff, 0 0 0 0px #b388ff, 0 0 0 0px #b0e6ff, 0 0 0 0px #b388ff, 0 0 0 0px #b0e6ff'
                            : guardianElement === 'puro'
                              ? '0 0 48px 16px #fff6b0, 0 0 32px 8px #fff6b0 inset, 0 0 0 8px #fff6b080, 0 0 32px 16px #fff6b080, 0 0 64px 24px 8px #fff6b0, 0 0 0 12px #fffde4, 0 0 0 0px #fff6b0, 0 0 0 0px #fffde4, 0 0 0 0px #fff6b0, 0 0 0 0px #fffde4'
                              : undefined,
                }}
              >
                <span className="deck-btn-label">Deck</span>
              </button>
            );
          })()}
        </div>
        <div className="home-btn-group home-btn-group-bottom">
          <button className="home-btn" onClick={() => onNavigate('iniciar')}>
            Iniciar
          </button>
          <button className="home-btn" onClick={() => setShowDeckModal(true)}>
            Batalha (MVP)
          </button>
        </div>

        {/* Botão do Shop (Lado Esquerdo) */}
        <audio ref={shopAudioRef} src={movingTableSound} preload="auto" />
        <button
          className="shop-nav-btn"
          onClick={handleShopClick}
          onMouseEnter={() => {
            if (shopAudioRef.current) {
              shopAudioRef.current.currentTime = 0;
              shopAudioRef.current.play().catch(() => {});
            }
          }}
        >
          <span className="shop-nav-arrow">←</span>
          <span className="shop-nav-text">Shop</span>
        </button>

        {/* Botão do Bestiário (Lado Direito) */}
        <audio ref={bestiaryAudioRef} src={movingTableSound} preload="auto" />
        <button
          className="bestiary-nav-btn"
          onClick={handleBestiaryClick}
          onMouseEnter={() => {
            if (bestiaryAudioRef.current) {
              bestiaryAudioRef.current.currentTime = 0;
              bestiaryAudioRef.current.play().catch(() => {});
            }
          }}
        >
          <span className="bestiary-nav-text">Bestiário</span>
          <span className="bestiary-nav-arrow">→</span>
        </button>
      </main>
      <DeckSelectModal
        visible={showDeckModal}
        decks={Object.entries(decks || {}).map(([id, deck]) => ({ id, ...deck }))}
        onClose={() => setShowDeckModal(false)}
        onSelect={(deck) => {
          setShowDeckModal(false);
          onNavigate('battle', { deck });
        }}
      />
      {showOptions && (
        <OptionsModal
          visible={showOptions}
          onClose={() => setShowOptions(false)}
        />
      )}
      {showDeckModal && (
        <DeckSelectModal
          visible={showDeckModal}
          onClose={() => setShowDeckModal(false)}
          onSelect={(deck) => {
            setShowDeckModal(false);
            onNavigate('battle', { deck });
          }}
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
      </div>

      {/* Tela do Bestiário */}
      <div className={`screen-wrapper ${showBestiary ? 'center' : 'slide-to-right'}`}>
        <Bestiary onBack={() => setShowBestiary(false)} />
      </div>
    </div>
  );
}

export default HomeScreen;
