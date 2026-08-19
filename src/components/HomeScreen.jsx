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
import calamityBoosterImg from '../assets/img/card/calamity_booster.png';
import packageSound from '../assets/sounds/effects/package.MP3';
import boosterAnimationVideo from '../assets/img/card/animacao-booster.mp4';
import calamityBoosterAnimationVideo from '../assets/img/card/troque_a_imagem_do_booster_pel.mp4';
import creatures from '../assets/cards';
import BoosterResultsSlider from './BoosterResultsSlider';
import DeckSelectModal from './DeckSelectModal';
import Bestiary from './Bestiary';
import Shop from './Shop';
import AchievementsRoom from './AchievementsRoom';
import HelpCenter from './HelpCenter';
import { getRollRarity, getRollRarityCalamity, RARITY_TIERS, getCreaturesByRarity } from '../assets/rarityData.js';
import { getCampaignProgress, CAMPAIGN_TOTAL_LEVELS, CAMPAIGN_TOWER_TYPES } from './CampaignTower';

// Nível de progresso da campanha em que a 1ª insígnia (torre completa) é conquistada —
// mesma fórmula usada em AchievementsRoom.jsx/PvpLobby.jsx.
const LEVELS_PER_TOWER = CAMPAIGN_TOTAL_LEVELS / CAMPAIGN_TOWER_TYPES.length;

// Duração, em segundos, do fade-out aplicado antes do fim da animação do Booster de Calamidade
const CALAMITY_BOOSTER_FADE_SECONDS = 2;

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

function BoosterZone({
  boosters,
  onOpenBooster,
  isOpeningBooster,
  effectsVolume,
  isEn,
  boosterImage = boosterImg,
  variant = 'standard',
  title = 'Booster Zone',
  position = { bottom: 32, right: 32 },
  emptyLabel,
  hoverLabel,
}) {
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

  const resolvedEmptyLabel = emptyLabel ?? (isEn ? 'No boosters' : 'Nenhum booster');
  const resolvedHoverLabel = hoverLabel ?? (isEn ? 'Open booster' : 'Abrir booster');

  return (
    <div
      className={`booster-zone booster-zone-${variant}${boosters <= 0 ? ' booster-zone-empty' : ' booster-zone-ready'}`}
      style={{
        position: 'fixed',
        ...position,
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
      <div className="booster-zone-title">{title}</div>
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
                src={boosterImage}
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
          <span className="booster-hover-label">{resolvedHoverLabel}</span>
        </>
      )}
      {boosters <= 0 && (
        <div className="booster-empty-state">
          <span className="booster-empty-seal" aria-hidden>✦</span>
          <span className="booster-empty-label">{resolvedEmptyLabel}</span>
          <span className="booster-empty-hint">{isEn ? 'Earn some in battles' : 'Conquiste em batalhas'}</span>
        </div>
      )}
    </div>
  );
}

function HomeScreen({ onNavigate, menuMusicRef }) {
  const {
    activeGuardian,
    boosters = 0,
    calamityBoosters = 0,
    coins = 0,
    lang = 'ptbr',
    setBoosters,
    setCalamityBoosters,
    addCardsFromBooster,
    decks = {},
    effectsVolume,
  } = useContext(AppContext);
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
      candle.volume = (effectsVolume ?? 50) / 100;
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
  }, [menuMusicRef, candleKey, effectsVolume]);

  React.useEffect(() => {
    if (candleAudioRef.current) {
      candleAudioRef.current.volume = (effectsVolume ?? 50) / 100;
    }
  }, [effectsVolume]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isOpeningBooster, setIsOpeningBooster] = useState(false);
  const [showBoosterVideo, setShowBoosterVideo] = useState(false);
  const [showBoosterResults, setShowBoosterResults] = useState(false);
  const [openedBoosterCards, setOpenedBoosterCards] = useState([]);
  const [boosterOpenKind, setBoosterOpenKind] = useState('standard'); // 'standard' | 'calamity'
  const [isBoosterVideoFading, setIsBoosterVideoFading] = useState(false);
  const boosterVideoRef = useRef(null);
  const [cheatInput, setCheatInput] = useState('');
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showBattleMenu, setShowBattleMenu] = useState(false);
  const [pendingCampaignEnemy, setPendingCampaignEnemy] = useState(null);
  const [showBestiary, setShowBestiary] = useState(false);
  const bestiaryAudioRef = useRef(null);
  const [showShop, setShowShop] = useState(false);
  const shopAudioRef = useRef(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const achievementsAudioRef = useRef(null);

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
        localStorage.removeItem('kadirStartFlowCompleted');

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
  const isEn = lang === 'en';

  // Calamidade só libera depois que o jogador vence a 1ª torre da Campanha (1ª insígnia).
  const hasFirstBadge = getCampaignProgress() >= LEVELS_PER_TOWER;

  function generateBoosterPack(rollRarityFn = getRollRarity) {
    const pool = Array.isArray(creatures) ? [...creatures] : [];

    // Separe por tipo (fields, effects, creatures simples)
    const fieldCards = pool.filter(c => c && c.type === 'field');
    const effectCards = pool.filter(c => c && c.type === 'effect');
    const baseCreatures = pool.filter(c => c && c.type !== 'field' && c.type !== 'effect');

    const totalCount = baseCreatures.length + fieldCards.length + effectCards.length;
    const creatureProb = totalCount > 0 ? (baseCreatures.length / totalCount) : 0.7;
    const fieldProb = totalCount > 0 ? (fieldCards.length / totalCount) : 0.15;
    // effectProb is remainder

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    // Sorteio ponderado: cartas sem `dropWeight` usam peso 1 (chance normal).
    // Usado pelas cartas de efeito, onde algumas (ex: Fluido de Essência) devem ser mais raras.
    const pickWeighted = (arr) => {
      const weights = arr.map((c) => (typeof c?.dropWeight === 'number' ? Math.max(0, c.dropWeight) : 1));
      const total = weights.reduce((sum, w) => sum + w, 0);
      if (total <= 0) return pickRandom(arr);
      let roll = Math.random() * total;
      for (let idx = 0; idx < arr.length; idx += 1) {
        roll -= weights[idx];
        if (roll <= 0) return arr[idx];
      }
      return arr[arr.length - 1];
    };

    const selected = [];
    for (let i = 0; i < 5; i += 1) {
      const r = Math.random();

      // Decide se será criatura / campo / efeito mantendo proporções do pool
      if (r < creatureProb) {
        // Role a raridade primeiro e escolha uma criatura dessa raridade
        const rarity = rollRarityFn();
        const candidatesIds = getCreaturesByRarity(rarity) || [];
        // Tenta encontrar objetos no baseCreatures com esses ids
        const candidates = baseCreatures.filter(c => c && c.id && candidatesIds.includes(c.id));

        let pick = null;
        if (candidates.length > 0) {
          pick = pickRandom(candidates);
        } else if (baseCreatures.length > 0) {
          // Fallback para qualquer criatura disponível
          pick = pickRandom(baseCreatures);
        }

        if (pick) {
          selected.push({ ...pick, isHolo: Math.random() < 0.05, rarity });
          continue;
        }
      } else if (r < creatureProb + fieldProb) {
        // Campo
        if (fieldCards.length > 0) {
          const pick = pickRandom(fieldCards);
          selected.push({ ...pick, isHolo: Math.random() < 0.05, rarity: 'field' });
          continue;
        }
      } else {
        // Efeito
        if (effectCards.length > 0) {
          const pick = pickWeighted(effectCards);
          selected.push({ ...pick, isHolo: Math.random() < 0.05, rarity: 'effect' });
          continue;
        }
      }

      // Último recurso: sorteio simples do pool restante
      if (pool.length > 0) {
        const pick = pickRandom(pool);
        selected.push({ ...pick, isHolo: Math.random() < 0.05, rarity: rollRarityFn() });
      }
    }

    return selected;
  }

  // Booster de Calamidade: mesma lógica de montagem, com odds de raridade mais altas.
  function generateCalamityBoosterPack() {
    return generateBoosterPack(getRollRarityCalamity);
  }

  function handleOpenBooster() {
    if (boosters <= 0 || isOpeningBooster) return;
    setIsOpeningBooster(true);
    setShowBoosterResults(false);
    setBoosterOpenKind('standard');
    setIsBoosterVideoFading(false);
    setOpenedBoosterCards(generateBoosterPack());
    setShowBoosterVideo(true);
    setBoosters(Math.max(0, boosters - 1));
  }

  function handleOpenCalamityBooster() {
    if (calamityBoosters <= 0 || isOpeningBooster) return;
    setIsOpeningBooster(true);
    setShowBoosterResults(false);
    setBoosterOpenKind('calamity');
    setIsBoosterVideoFading(false);
    setOpenedBoosterCards(generateCalamityBoosterPack());
    setShowBoosterVideo(true);
    setCalamityBoosters(Math.max(0, calamityBoosters - 1));
  }

  function handleCloseBoosterAnimation() {
    setShowBoosterVideo(false);
    setShowBoosterResults(true);
    setIsBoosterVideoFading(false);
    if (boosterVideoRef.current) {
      boosterVideoRef.current.pause();
      boosterVideoRef.current.currentTime = 0;
    }
  }

  // Dispara o fade-out 2s antes do fim do vídeo do Booster de Calamidade.
  function handleBoosterVideoTimeUpdate() {
    if (boosterOpenKind !== 'calamity') return;
    const video = boosterVideoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const remaining = video.duration - video.currentTime;
    if (remaining <= CALAMITY_BOOSTER_FADE_SECONDS) {
      setIsBoosterVideoFading(true);
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

  function handleAchievementsClick() {
    if (achievementsAudioRef.current) {
      achievementsAudioRef.current.currentTime = 0;
      achievementsAudioRef.current.volume = (effectsVolume ?? 50) / 100;
      achievementsAudioRef.current.play().catch(() => {});
    }
    setShowAchievements(true);
  }

  return (
    <div className="home-screen-container">
      {/* Tela de Conquistas */}
      <div className={`screen-wrapper ${showAchievements ? 'center' : 'slide-to-top'}`}>
        <AchievementsRoom onBack={() => setShowAchievements(false)} />
      </div>

      {/* Tela do Shop */}
      <div className={`screen-wrapper ${showShop ? 'center' : 'slide-to-left'}`}>
        <Shop onBack={() => setShowShop(false)} />
      </div>

      {/* Tela Principal (HomeScreen) */}
      <div className={`screen-wrapper ${showAchievements ? 'slide-to-bottom' : showBestiary ? 'slide-to-left' : showShop ? 'slide-to-right' : 'center'}`}>
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
          alt={isEn ? 'Coins' : 'Moedas'}
          className="home-coin-icon"
        />
        <span className="home-coin-copy">
          <small>{isEn ? 'Balance' : 'Saldo'}</small>
          <strong className="home-coin-amount">{coins?.toLocaleString() || 0}</strong>
        </span>
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
      <div className="home-settings-anchor" style={{ position: 'absolute', top: 24, right: 32, zIndex: 100 }}>
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
          aria-label={isEn ? 'Open options menu' : 'Abrir menu de opções'}
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
            <div className="home-cog-dropdown-header">
              <small>{isEn ? 'SYSTEM' : 'SISTEMA'}</small>
              <strong>{isEn ? 'Game menu' : 'Menu do jogo'}</strong>
            </div>
            <button
              className="home-cog-menu-item"
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
              <span className="home-cog-menu-icon" aria-hidden>◇</span>
              <span>{t.settings}</span>
            </button>
            <button
              className="home-cog-menu-item"
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
                setShowHelp(true);
              }}
            >
              <span className="home-cog-menu-icon" aria-hidden>?</span>
              <span>{isEn ? 'Help' : 'Ajuda'}</span>
            </button>
            <button
              className="home-cog-menu-item home-cog-menu-exit"
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
              <span className="home-cog-menu-icon" aria-hidden>×</span>
              <span>{t.exit}</span>
            </button>
          </div>
        )}
      </div>
      <BoosterZone
        boosters={boosters}
        onOpenBooster={handleOpenBooster}
        isOpeningBooster={isOpeningBooster}
        effectsVolume={effectsVolume}
        isEn={isEn}
      />
      {calamityBoosters > 0 && (
        <BoosterZone
          boosters={calamityBoosters}
          onOpenBooster={handleOpenCalamityBooster}
          isOpeningBooster={isOpeningBooster}
          effectsVolume={effectsVolume}
          isEn={isEn}
          boosterImage={calamityBoosterImg}
          variant="calamity"
          title={isEn ? 'Calamity Boosters' : 'Boosters de Calamidade'}
          position={{ bottom: 32, right: 32 + 159 + 24 }}
          emptyLabel={isEn ? 'No calamity boosters' : 'Nenhum booster de calamidade'}
          hoverLabel={isEn ? 'Open calamity booster' : 'Abrir booster de calamidade'}
        />
      )}
      <main className="home-main">
        {/* Título removido conforme solicitado */}
        <div className="deck-btn-center-group">
          {/* Áudio do efeito sphere-menu */}
          <audio ref={deckBtnAudioRef} src={sphereMenuSound} preload="auto" />
          {(() => {
            const deckList = Object.values(decks || {});
            const deckGuardianId = deckList.length ? deckList[0]?.guardianId : null;
            const deckGuardianData = deckGuardianId ? getGuardianCardData(deckGuardianId) : null;
            const activeGuardianData = activeGuardian ? getGuardianCardData(activeGuardian.id || activeGuardian.name) : null;
            const guardianCardData = deckGuardianData || activeGuardianData;
            const guardianElement = guardianCardData?.element || activeGuardian?.element;

            return (
              <button
                className={`deck-btn${guardianElement ? ` deck-btn-${guardianElement}` : ''}`}
                onClick={() => onNavigate('deck')}
                onMouseEnter={handleDeckBtnMouseEnter}
                style={{
                  backgroundImage: guardianCardData?.img
                    ? `url(${guardianCardData.img})`
                    : activeGuardian?.img
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
          <button className="home-btn" onClick={() => setShowBattleMenu(true)}>
            {isEn ? 'Battle' : 'Batalhar'}
          </button>
        </div>

        <audio ref={achievementsAudioRef} src={movingTableSound} preload="auto" />
        <button
          className="achievements-nav-btn"
          onClick={handleAchievementsClick}
          onMouseEnter={() => {
            if (achievementsAudioRef.current) {
              achievementsAudioRef.current.currentTime = 0;
              achievementsAudioRef.current.volume = (effectsVolume ?? 50) / 100;
              achievementsAudioRef.current.play().catch(() => {});
            }
          }}
        >
          <span className="achievements-nav-seal" aria-hidden>✦</span>
          <span className="achievements-nav-text">{isEn ? 'Achievements' : 'Conquistas'}</span>
          <span className="achievements-nav-arrow">↑</span>
        </button>

        {/* Botão do Shop (Lado Esquerdo) */}
        <audio ref={shopAudioRef} src={movingTableSound} preload="auto" />
        <button
          className="shop-nav-btn"
          onClick={handleShopClick}
          onMouseEnter={() => {
            if (shopAudioRef.current) {
              shopAudioRef.current.currentTime = 0;
              shopAudioRef.current.volume = (effectsVolume ?? 50) / 100;
              shopAudioRef.current.play().catch(() => {});
            }
          }}
        >
          <span className="shop-nav-arrow">←</span>
          <span className="home-side-nav-copy">
            <small>{isEn ? 'Market' : 'Mercado'}</small>
            <strong className="shop-nav-text">Shop</strong>
          </span>
        </button>

        {/* Botão do Bestiário (Lado Direito) */}
        <audio ref={bestiaryAudioRef} src={movingTableSound} preload="auto" />
        <button
          className="bestiary-nav-btn"
          onClick={handleBestiaryClick}
          onMouseEnter={() => {
            if (bestiaryAudioRef.current) {
              bestiaryAudioRef.current.currentTime = 0;
              bestiaryAudioRef.current.volume = (effectsVolume ?? 50) / 100;
              bestiaryAudioRef.current.play().catch(() => {});
            }
          }}
        >
          <span className="home-side-nav-copy">
            <small>{isEn ? 'Archive' : 'Arquivo'}</small>
            <strong className="bestiary-nav-text">{isEn ? 'Bestiary' : 'Bestiário'}</strong>
          </span>
          <span className="bestiary-nav-arrow">→</span>
        </button>
      </main>
      {showBattleMenu && (
        <div className="battle-menu-overlay" onClick={() => setShowBattleMenu(false)}>
          <div className="battle-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="battle-menu-rune" aria-hidden />
            <p className="battle-menu-kicker">{isEn ? 'Choose your destiny' : 'Escolha seu destino'}</p>
            <h2 className="battle-menu-title">{isEn ? 'Battle' : 'Batalhar'}</h2>
            <div className="battle-menu-options">
              <button
                className="battle-menu-option battle-menu-option-campaign"
                onClick={() => {
                  setShowBattleMenu(false);
                  onNavigate('campaign');
                }}
              >
                <span className="battle-menu-option-seal" aria-hidden>Ⅰ</span>
                <span className="battle-menu-option-copy">
                  <strong>{isEn ? 'Campaign' : 'Campanha'}</strong>
                  <small>{isEn ? 'Face the towers and earn new badges' : 'Enfrente as torres e conquiste novas insígnias'}</small>
                </span>
                <span className="battle-menu-option-arrow" aria-hidden>→</span>
              </button>
              <button
                className="battle-menu-option"
                onClick={() => {
                  setShowBattleMenu(false);
                  onNavigate('pvp-lobby');
                }}
              >
                <span className="battle-menu-option-seal" aria-hidden>Ⅱ</span>
                <span className="battle-menu-option-copy">
                  <strong>PvP Casual</strong>
                  <small>{isEn ? 'Invite a friend over Steam to a challenge room' : 'Convide um amigo pela Steam para uma sala de desafio'}</small>
                </span>
                <span className="battle-menu-option-arrow" aria-hidden>→</span>
              </button>
              <button
                className={`battle-menu-option battle-menu-option-calamity${hasFirstBadge ? '' : ' battle-menu-option-muted'}`}
                disabled={!hasFirstBadge}
                onClick={() => {
                  if (!hasFirstBadge) return;
                  setShowBattleMenu(false);
                  onNavigate('calamity-lobby');
                }}
              >
                <span className="battle-menu-option-seal" aria-hidden>Ⅲ</span>
                <span className="battle-menu-option-copy">
                  <strong>{isEn ? 'Calamity' : 'Calamidade'}</strong>
                  <small>
                    {hasFirstBadge
                      ? (isEn ? 'Face a buffed Eker solo for the biggest reward' : 'Enfrente um Eker bufado sozinho pela maior recompensa')
                      : (isEn ? 'Win your first Guardian Tower to unlock' : 'Vença sua primeira Torre dos Guardiões para desbloquear')}
                  </small>
                </span>
                {hasFirstBadge
                  ? <span className="battle-menu-option-arrow" aria-hidden>→</span>
                  : <span className="battle-menu-coming-soon">{isEn ? 'Locked' : 'Bloqueado'}</span>}
              </button>
              <button className="battle-menu-option battle-menu-option-muted" disabled>
                <span className="battle-menu-option-seal" aria-hidden>Ⅳ</span>
                <span className="battle-menu-option-copy">
                  <strong>{isEn ? 'Ranked' : 'Rankeada'}</strong>
                  <small>{isEn ? 'Competitive mode in development' : 'Modo competitivo em desenvolvimento'}</small>
                </span>
                <span className="battle-menu-coming-soon">{isEn ? 'Coming soon' : 'Em breve'}</span>
              </button>
            </div>
            <button className="battle-menu-close" onClick={() => setShowBattleMenu(false)}>
              {isEn ? 'Back' : 'Voltar'}
            </button>
          </div>
        </div>
      )}
      {showOptions && (
        <OptionsModal
          visible={showOptions}
          onClose={() => setShowOptions(false)}
        />
      )}
      {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}
      {showDeckModal && (
        <DeckSelectModal
          visible={showDeckModal}
          decks={Object.entries(decks || {}).map(([id, deck]) => ({ id, ...deck }))}
          onClose={() => setShowDeckModal(false)}
          onSelect={(deck) => {
            setShowDeckModal(false);
            if (pendingCampaignEnemy) {
              onNavigate('battle', {
                deck,
                mode: 'campaign',
                opponent: pendingCampaignEnemy,
              });
              setPendingCampaignEnemy(null);
              return;
            }
            onNavigate('battle', { deck });
          }}
        />
      )}
      {showBoosterVideo && (
        <div
          className="booster-animation-overlay"
          onClick={handleCloseBoosterAnimation}
        >
          <div className="booster-animation-stage" onClick={(e) => e.stopPropagation()}>
            <div className="booster-animation-heading" aria-hidden>
              <span>
                {boosterOpenKind === 'calamity'
                  ? (isEn ? 'CALAMITY REWARD' : 'RECOMPENSA DE CALAMIDADE')
                  : (isEn ? 'REWARD OPENING' : 'ABERTURA DE RECOMPENSA')}
              </span>
              <strong>{isEn ? 'Revealing booster' : 'Revelando booster'}</strong>
            </div>
            <video
              ref={boosterVideoRef}
              className={`booster-animation-video${isBoosterVideoFading ? ' booster-animation-video-fading' : ''}`}
              src={boosterOpenKind === 'calamity' ? calamityBoosterAnimationVideo : boosterAnimationVideo}
              autoPlay
              playsInline
              onTimeUpdate={handleBoosterVideoTimeUpdate}
              onEnded={handleCloseBoosterAnimation}
            />
          </div>
          <button
            className="booster-animation-skip"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCloseBoosterAnimation();
            }}
          >
            <span>{isEn ? 'Skip animation' : 'Pular animação'}</span>
            <b aria-hidden>»</b>
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
