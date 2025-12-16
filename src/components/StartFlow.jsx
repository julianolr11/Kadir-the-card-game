import candleSound from '../assets/sounds/effects/candle.mp3';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import verso from '../assets/img/card/verso.png';
import agua from '../assets/img/elements/agua.png';
import ar from '../assets/img/elements/ar.png';
import fogo from '../assets/img/elements/fogo.png';
import puro from '../assets/img/elements/puro.png';
import terra from '../assets/img/elements/terra.png';
import '../styles/startflow.css';
import CreatureCardPreview from './CreatureCardPreview.jsx';
import HomeScreen from './HomeScreen.jsx';
import { creatures } from '../assets/creaturesData.js';
import flipcardSound from '../assets/sounds/effects/flipcard.MP3';
import popSound from '../assets/sounds/effects/pop.MP3';
import swipeSound from '../assets/sounds/effects/swipe.MP3';
import typingSound from '../assets/sounds/effects/typing.MP3';
import keyClickSound from '../assets/sounds/effects/key_click.MP3';
import waterSound from '../assets/sounds/effects/elements/water.MP3';
import airSound from '../assets/sounds/effects/elements/air.MP3';
import fireSound from '../assets/sounds/effects/elements/fire.MP3';
import earthSound from '../assets/sounds/effects/elements/earth.MP3';
import pureSound from '../assets/sounds/effects/elements/pure.MP3';
import '../styles/pop.css';

const dialogos = {
  ptbr: [
    'Olá viajante, vejo que você busca um novo tipo de magia, algo que você não encontra nas jogatinas comuns',
    'De que vale suas ambições se não pode desfrutar da glória de conquistar mais uma vitória nesse card game, correto?',
    'Bom, chega de conversa, afinal, você está aqui para uma jogatina, não é?',
    'Escolha um elemento para te guiar',
  ],
  en: [
    'Hello traveler, I see you seek a new kind of magic, something you won’t find in ordinary games',
    'What good are your ambitions if you can’t enjoy the glory of conquering another victory in this card game, right?',
    'Well, enough talk, after all, you’re here for a game, aren’t you?',
    'Choose an element to guide you',
  ],
};

// btnStyle não utilizado

function StartFlow({ onFinish, onGoHome, menuMusicRef }) {
  // menuMusicRef: ref global para controle da música do menu
    const candleAudioRef = useRef(null);

    useEffect(() => {
      if (candleAudioRef.current) {
        candleAudioRef.current.volume = 0.5;
        candleAudioRef.current.loop = true;
        candleAudioRef.current.play();
      }
      return () => {
        if (candleAudioRef.current) {
          candleAudioRef.current.pause();
          candleAudioRef.current.currentTime = 0;
        }
      };
    }, []);
  const { lang, effectsVolume, setActiveGuardian } = useContext(AppContext);
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typing, setTyping] = useState(true);
  const [fade, setFade] = useState('fadein-up');
  const [showPreview, setShowPreview] = useState(false);
  const [previewCreature, setPreviewCreature] = useState(null);
  const typingTimeout = useRef();
  const cardAnims = useRef(
    Array.from({ length: 5 }, () => ({
      delay: (Math.random() * 1.2).toFixed(2),
      reverse: Math.random() > 0.5,
    })),
  );
  // Ref para o áudio do flipcard
  const flipAudioRef = useRef(null);
  const popAudioRef = useRef(null);
  const swipeAudioRef = useRef(null);
  const typingAudioRef = useRef(null);
  const keyClickAudioRef = useRef(null);
  const elementAudioRefs = [
    useRef(null), // água
    useRef(null), // ar
    useRef(null), // fogo
    useRef(null), // terra
    useRef(null), // puro
  ];
  const [cardsVisible, setCardsVisible] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);
  // Efeito: cartas surgem uma a uma com pop
  useEffect(() => {
    function showNextCard(i) {
      setCardsVisible((prev) => {
        const arr = [...prev];
        arr[i] = true;
        return arr;
      });
      // Toca o som pop
      if (popAudioRef.current) {
        popAudioRef.current.currentTime = 0;
        popAudioRef.current.play();
      }
      if (i < 4) setTimeout(() => showNextCard(i + 1), 180);
    }
    if (showModal) {
      setCardsVisible([false, false, false, false, false]);
      setTimeout(() => showNextCard(0), 350);
    } else {
      setCardsVisible([false, false, false, false, false]);
    }
  }, [showModal]);

  useEffect(() => {
    setDisplayedText('');
    setTyping(true);
    setFade('fadein-up');
    let idx = 0;
    // Inicia o som de typing
    if (typingAudioRef.current) {
      typingAudioRef.current.currentTime = 0;
      typingAudioRef.current.volume = (effectsVolume ?? 50) / 100;
      typingAudioRef.current.loop = true;
      typingAudioRef.current.play();
    }
    function typeNext() {
      setDisplayedText(dialogos[lang][step].slice(0, idx));
      if (idx < dialogos[lang][step].length) {
        typingTimeout.current = setTimeout(() => {
          idx++;
          typeNext();
        }, 38);
      } else {
        setTyping(false);
        // Para o som de typing
        if (typingAudioRef.current) {
          typingAudioRef.current.pause();
          typingAudioRef.current.currentTime = 0;
        }
      }
    }
    typeNext();
    return () => {
      clearTimeout(typingTimeout.current);
      if (typingAudioRef.current) {
        typingAudioRef.current.pause();
        typingAudioRef.current.currentTime = 0;
      }
    };
  }, [step, lang, effectsVolume]);

  const handleNext = () => {
        // Toca o som de click ao avançar o diálogo
        if (keyClickAudioRef.current) {
          keyClickAudioRef.current.currentTime = 0;
          keyClickAudioRef.current.volume = (effectsVolume ?? 50) / 100;
          keyClickAudioRef.current.play();
        }
    // Não tocar som ao avançar o diálogo
    setFade('fadeout');
    setTimeout(() => {
      if (step < dialogos[lang].length - 1) {
        setStep(step + 1);
        if (step === dialogos[lang].length - 2) setShowModal(true);
      } else {
        // Ao finalizar o fluxo, para a intro e inicia o menu
        if (introAudioRef?.current) {
          introAudioRef.current.pause();
          introAudioRef.current.currentTime = 0;
        }
        if (menuMusicRef?.current) menuMusicRef.current.play();
        if (onFinish) onFinish();
      }
    }, 350);
  };

  const elementos = [agua, ar, fogo, terra, puro];
  const nomes = lang === 'en'
    ? [
        'Water',
        'Air',
        'Fire',
        'Earth',
        'Pure',
      ]
    : [
        'Água',
        'Ar',
        'Fogo',
        'Terra',
        'Puro',
      ];
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null); // índice da carta selecionada

  // Atualiza o volume do efeito em tempo real
  useEffect(() => {
    if (flipAudioRef.current) {
      flipAudioRef.current.volume = (effectsVolume ?? 50) / 100;
    }
  }, [effectsVolume]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', zIndex: 2000 }}>
      {/* Áudio de vela queimando em loop */}
      <audio ref={candleAudioRef} src={candleSound} preload="auto" loop />
      {/* Efeitos de vela animada */}
      <div className="candle-flame candle-flame-1"></div>
      <div className="candle-flame candle-flame-2"></div>
      <div className="candle-flame candle-flame-3"></div>
      <div className="candle-flame candle-flame-4"></div>
      <div className="candle-flame candle-flame-5"></div>
      <div className="candle-flame candle-flame-6"></div>
      <div className="candle-flame candle-flame-7"></div>
      {/* Background 3D em duas camadas com overlay */}
      <div className="main-menu-background">
        <div className="main-menu-bg-base"></div>
        <div className="main-menu-bg-overlay"></div>
      </div>
      {/* Modal de escolha de elemento (filtro/blur) */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div className="startflow-cards" style={{ position: 'relative' }}>
            {cardAnims.current.map((anim, i) => (
              <div
                key={`card-${i}`}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  perspective: 800,
                }}
              >
                <div
                  className={`card-flip${selected === i ? ' flipped expanded' : ''} ${cardsVisible[i] ? 'pop-appear' : ''}`}
                  style={{
                    width: selected === i ? 220 : 110,
                    height: selected === i ? 308 : 160,
                    transition:
                      selected === i
                        ? 'transform 0.7s cubic-bezier(.7,-0.2,.3,1.4), width 0.4s, height 0.4s'
                        : 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    zIndex: selected === i ? 3000 : 'auto',
                    opacity: cardsVisible[i] ? 1 : 0,
                    pointerEvents: cardsVisible[i] ? 'auto' : 'none',
                  }}
                  onClick={() => {
                    if (!cardsVisible[i]) return;
                    setSelected(i);
                    const elementoSelecionado = [
                      'agua',
                      'ar',
                      'fogo',
                      'terra',
                      'puro',
                    ][i];
                    const criaturasDoElemento = creatures.filter(
                      (c) => c.element === elementoSelecionado,
                    );
                    if (criaturasDoElemento.length > 0) {
                      const sorteada =
                        criaturasDoElemento[
                          Math.floor(Math.random() * criaturasDoElemento.length)
                        ];
                      setPreviewCreature(sorteada);
                      setShowPreview(true);
                      // Salva como guardião ativo
                      setActiveGuardian({
                        name: sorteada.name,
                        img: sorteada.img,
                        id: sorteada.id,
                        element: sorteada.element
                      });
                    }
                    // Toca o som de flipcard ao virar a carta
                    if (flipAudioRef.current) {
                      flipAudioRef.current.currentTime = 0;
                      flipAudioRef.current.play();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && cardsVisible[i]) {
                      setSelected(i);
                      const elementoSelecionado = [
                        'agua',
                        'ar',
                        'fogo',
                        'terra',
                        'puro',
                      ][i];
                      const criaturasDoElemento = creatures.filter(
                        (c) => c.element === elementoSelecionado,
                      );
                      if (criaturasDoElemento.length > 0) {
                        const sorteada =
                          criaturasDoElemento[
                            Math.floor(Math.random() * criaturasDoElemento.length)
                          ];
                        setPreviewCreature(sorteada);
                        setShowPreview(true);
                      }
                      if (flipAudioRef.current) {
                        flipAudioRef.current.currentTime = 0;
                        flipAudioRef.current.play();
                      }
                    }
                  }}
                  aria-label={nomes[i]}
                >
                  {/* Face de trás (verso) para todas as cartas */}
                  <img
                    src={verso}
                    alt={`Carta elemento ${nomes[i]}`}
                    className={`startflow-card${anim.reverse ? ' float-reverse' : ''}`}
                    style={{
                      animationDelay: `${anim.delay}s`,
                      backfaceVisibility: 'hidden',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: selected === i ? 220 : 110,
                      height: selected === i ? 308 : 160,
                      borderRadius: 18,
                    }}
                    onMouseEnter={() => {
                      setHovered(i);
                      // Toca o som do elemento correspondente
                      const ref = elementAudioRefs[i];
                      if (ref.current) {
                        ref.current.currentTime = 0;
                        ref.current.volume = (effectsVolume ?? 50) / 100;
                        ref.current.play();
                      }
                    }}
                    onMouseLeave={() => setHovered(null)}
                  />
                  {/* Face da frente removida, pois o modal já exibe a carta sorteada corretamente */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Overlay do CardPreview */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5000,
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 32 }}>
            <CreatureCardPreview
              creature={previewCreature}
              onClose={() => {
                setShowPreview(false);
                setSelected(null);
                setPreviewCreature(null);
              }}
            />
            <button
              style={{
                height: 48,
                alignSelf: 'flex-start',
                marginLeft: 8,
                background: '#ffe6b0',
                color: '#1e1628',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 18,
                boxShadow: '0 2px 8px #000a',
                cursor: 'pointer',
                padding: '0 18px',
                transition: 'background 0.2s',
              }}
              onClick={onGoHome}
              aria-label={lang === 'en' ? 'Go to Home Screen' : 'Ir para tela inicial'}
            >
              {lang === 'en' ? 'Home' : 'Início'}
            </button>
          </div>
        </div>
      )}
      {/* Diálogo só aparece se o preview não estiver aberto */}
      <div style={{
        width: '100%',
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        minHeight: 180,
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2150 // Fica acima das cartas viradas (zIndex padrão), mas abaixo do CardPreview (zIndex 3000)
      }}>
        <div className={`startflow-dialog ${fade}`} style={{
          background: 'rgba(30,22,40,0.92)',
          color: '#ffe6b0',
          borderRadius: 18,
          boxShadow: '0 4px 32px #000a',
          fontSize: 20,
          fontWeight: 500,
          padding: '32px 32px 24px 32px',
          margin: '32px 0',
          minWidth: 420,
          maxWidth: 600,
          minHeight: 120,
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          letterSpacing: 0.2,
          transition: 'height 0.2s',
        }}>
          <span style={{ width: '100%', display: 'block', minHeight: 32 }}>
            {displayedText}
            <span style={{ opacity: typing ? 1 : 0, color: '#ffe6b0', fontWeight: 700 }}>|</span>
            <span
              className={hovered !== null ? 'element-fadein' : 'element-fadeout'}
              style={{
                display: hovered !== null ? 'flex' : 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 12,
                transition: 'opacity 0.35s',
                opacity: hovered !== null ? 1 : 0
              }}
            >
              {hovered !== null && (
                <>
                  <img src={elementos[hovered]} alt={nomes[hovered]} style={{ width: 48, height: 48, margin: '0 auto', filter: 'drop-shadow(0 2px 12px #000a)', background: 'rgba(30,22,40,0.92)', borderRadius: 12, padding: 4 }} />
                  <span style={{ color: '#ffe6b0', fontWeight: 600, fontSize: 18, marginTop: 4 }}>{nomes[hovered]}</span>
                </>
              )}
            </span>
          </span>
          <div style={{ marginTop: 28, textAlign: 'right', width: '100%' }}>
            {step < dialogos[lang].length - 1 && !typing && (
              <button
                onClick={handleNext}
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: 50,
                  padding: 0,
                  cursor: 'pointer',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  transition: 'background 0.2s',
                  outline: 'none',
                  minWidth: 0,
                  minHeight: 0,
                  marginLeft: 'auto',
                }}
                aria-label={lang === 'en' ? 'Next' : 'Próximo'}
                className="startflow-next-btn"
              >
                <svg className="startflow-next-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="15" fill="none" stroke="#ffe6b0" strokeWidth="2" />
                  <path d="M12 16H20M20 16L16 12M20 16L16 20" stroke="#ffe6b0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Áudio do flipcard */}
      <audio ref={flipAudioRef} src={flipcardSound} preload="auto" />
      {/* Áudio do pop */}
      <audio ref={popAudioRef} src={popSound} preload="auto" />
      {/* Áudio do swipe */}
      <audio ref={swipeAudioRef} src={swipeSound} preload="auto" />
      {/* Áudio do typing */}
      <audio ref={typingAudioRef} src={typingSound} preload="auto" />
      {/* Áudio do click do diálogo */}
      <audio ref={keyClickAudioRef} src={keyClickSound} preload="auto" />
      {/* Áudios dos elementos */}
      <audio ref={elementAudioRefs[0]} src={waterSound} preload="auto" />
      <audio ref={elementAudioRefs[1]} src={airSound} preload="auto" />
      <audio ref={elementAudioRefs[2]} src={fireSound} preload="auto" />
      <audio ref={elementAudioRefs[3]} src={earthSound} preload="auto" />
      <audio ref={elementAudioRefs[4]} src={pureSound} preload="auto" />
    </div>
  );
};

export default StartFlow;
