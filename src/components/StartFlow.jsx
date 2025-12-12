import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import verso from '../assets/img/card/verso.png';
import agua from '../assets/img/elements/agua.png';
import ar from '../assets/img/elements/ar.png';
import fogo from '../assets/img/elements/fogo.png';
import puro from '../assets/img/elements/puro.png';
import terra from '../assets/img/elements/terra.png';
import '../styles/startflow.css';
import CreatureCardPreview from './CreatureCardPreview';
import { creatures } from '../assets/creaturesData';

const dialogos = {
  ptbr: [
    'Olá viajante, vejo que você busca um novo tipo de magia, algo que você não encontra nas jogatinas comuns',
    'De que vale suas ambições se não pode desfrutar da glória de conquistar mais uma vitória nesse card game, correto?',
    'Bom, chega de conversa, afinal, você está aqui para uma jogatina, não é?',
    'Escolha um elemento para te guiar'
  ],
  en: [
    'Hello traveler, I see you seek a new kind of magic, something you won’t find in ordinary games',
    'What good are your ambitions if you can’t enjoy the glory of conquering another victory in this card game, right?',
    'Well, enough talk, after all, you’re here for a game, aren’t you?',
    'Choose an element to guide you'
  ]
};

const btnStyle = {
  background: 'linear-gradient(90deg, #a87e2d 0%, #ffe6b0 100%)',
  color: '#3a2c4a',
  border: 'none',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 18,
  padding: '10px 32px',
  cursor: 'pointer',
  boxShadow: '0 2px 12px #000a',
  marginLeft: 12,
  letterSpacing: 0.2,
  transition: 'background 0.2s, color 0.2s',
};

const StartFlow = ({ onFinish }) => {
  const { lang } = useContext(AppContext);
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
      reverse: Math.random() > 0.5
    }))
  );

  useEffect(() => {
    setDisplayedText('');
    setTyping(true);
    setFade('fadein-up');
    let idx = 0;
    function typeNext() {
      setDisplayedText(dialogos[lang][step].slice(0, idx));
      if (idx < dialogos[lang][step].length) {
        typingTimeout.current = setTimeout(() => {
          idx++;
          typeNext();
        }, 38);
      } else {
        setTyping(false);
      }
    }
    typeNext();
    return () => clearTimeout(typingTimeout.current);
  }, [step, lang]);

  const handleNext = () => {
    setFade('fadeout');
    setTimeout(() => {
      if (step < dialogos[lang].length - 1) {
        setStep(step + 1);
        if (step === dialogos[lang].length - 2) setShowModal(true);
      } else if (onFinish) {
        onFinish();
      }
    }, 350);
  };

  const elementos = [agua, ar, fogo, terra, puro];
  const nomes = lang === 'en'
    ? ['Water', 'Air', 'Fire', 'Earth', 'Pure']
    : ['Água', 'Ar', 'Fogo', 'Terra', 'Puro'];
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null); // índice da carta selecionada

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', zIndex: 2000 }}>
      {/* Modal de escolha de elemento (filtro/blur) */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(30,22,40,0.72)',
          zIndex: 2100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="startflow-cards" style={{ position: 'relative' }}>
            {cardAnims.current.map((anim, i) => (
              <div key={i} style={{ position: 'relative', display: 'inline-block', perspective: 800 }}>
                <div
                  className={`card-flip${selected === i ? ' flipped expanded' : ''}`}
                  style={{ width: selected === i ? 220 : 110, height: selected === i ? 308 : 160, transition: selected === i ? 'transform 0.7s cubic-bezier(.7,-0.2,.3,1.4), width 0.4s, height 0.4s' : 'transform 0.6s', transformStyle: 'preserve-3d', zIndex: selected === i ? 3000 : 'auto' }}
                  onClick={() => {
                    // Ao clicar em qualquer elemento, sorteia uma criatura daquele elemento
                    setSelected(i);
                    const elementoSelecionado = ['agua', 'ar', 'fogo', 'terra', 'puro'][i];
                    const criaturasDoElemento = creatures.filter(c => c.element === elementoSelecionado);
                    if (criaturasDoElemento.length > 0) {
                      const sorteada = criaturasDoElemento[Math.floor(Math.random() * criaturasDoElemento.length)];
                      setPreviewCreature(sorteada);
                      setShowPreview(true);
                    }
                  }}
                >
                  {/* Face de trás (verso) para todas as cartas */}
                  <img
                    src={verso}
                    alt={`Carta elemento ${nomes[i]}`}
                    className={`startflow-card${anim.reverse ? ' float-reverse' : ''}`}
                    style={{ animationDelay: `${anim.delay}s`, backfaceVisibility: 'hidden', position: 'absolute', top: 0, left: 0, width: selected === i ? 220 : 110, height: selected === i ? 308 : 160, borderRadius: 18 }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  />
                  {/* Face da frente só para carta de fogo */}
                  {i === 2 && selected === i && (
                    <div
                      className="card-front-face fire-front-face"
                      style={{
                        width: 220,
                        height: 308,
                        background: 'none',
                        borderRadius: 18,
                        boxShadow: '0 4px 24px #000a',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        zIndex: 2
                      }}
                    >
                      {/* CardPreview removido daqui */}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Overlay do CardPreview */}
      {showPreview && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5000,
          background: 'rgba(30,22,40,0.72)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CreatureCardPreview creature={previewCreature} onClose={() => { setShowPreview(false); setSelected(null); setPreviewCreature(null); }} />
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
    </div>
  );
};

export default StartFlow;
