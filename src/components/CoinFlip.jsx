import React, { useContext, useEffect, useRef, useState } from 'react';
import coinFlipSound from '../assets/sounds/effects/coin-flip.mp3';
import headIcon from '../assets/img/icons/head.png';
import crownIcon from '../assets/img/icons/crown.png';
import '../styles/coinflip.css';
import { AppContext } from '../context/AppContext';

function CoinFlip({ onResult, playerName = 'Jogador', aiName = 'Adversário' }) {
  const { effectsVolume } = useContext(AppContext);
  const overlayRef = useRef(null);
  const audioRef = useRef(null);
  const [phase, setPhase] = useState('intro');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const introTimer = setTimeout(() => setPhase('ready'), 3000);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    try {
      const el = overlayRef.current;
      if (!el) return;
      el.style.setProperty('z-index', 'var(--z-battle-backdrop)', 'important');
      const resolved = getComputedStyle(el).getPropertyValue('z-index');
      if (!resolved || resolved === 'auto' || Number.isNaN(parseInt(resolved, 10))) {
        const root = getComputedStyle(document.documentElement);
        const fallback = (root.getPropertyValue('--z-battle-backdrop') || '').trim() || '10600';
        el.style.setProperty('z-index', String(parseInt(fallback, 10) || 10600), 'important');
      }
    } catch (error) {
      // The CSS fallback already keeps the overlay above the battle board.
    }
  }, []);

  const handleFlip = React.useCallback(() => {
    if (isFlipping || result || phase !== 'ready') return;

    setPhase('flipping');
    setIsFlipping(true);
    setResult(null);
    setWinner(null);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = (effectsVolume ?? 50) / 100;
      audioRef.current.play().catch(() => {});
    }

    setTimeout(() => {
      const flipResult = Math.random() < 0.5 ? 'head' : 'crown';
      setResult(flipResult);
      setIsFlipping(false);
      setWinner(flipResult === 'head' ? playerName : aiName);

      setTimeout(() => {
        setPhase('result');
        setTimeout(() => onResult?.(flipResult === 'head' ? 'player' : 'ai'), 3000);
      }, 800);
    }, 1200);
  }, [aiName, effectsVolume, isFlipping, onResult, phase, playerName, result]);

  useEffect(() => {
    if (phase !== 'ready') return undefined;
    const flipTimer = setTimeout(handleFlip, 500);
    return () => clearTimeout(flipTimer);
  }, [handleFlip, phase]);

  return (
    <div className="coinflip-overlay" ref={overlayRef}>
      <div className="coinflip-atmosphere" aria-hidden="true" />
      <div className="coinflip-container">
        <audio ref={audioRef} src={coinFlipSound} preload="auto" />
        <span className="coinflip-corner corner-nw" aria-hidden="true" />
        <span className="coinflip-corner corner-ne" aria-hidden="true" />
        <span className="coinflip-corner corner-sw" aria-hidden="true" />
        <span className="coinflip-corner corner-se" aria-hidden="true" />

        {phase === 'intro' && (
          <div className="intro-phase">
            <div className="coinflip-eyebrow">Ritual de abertura</div>
            <div className="intro-sigil" aria-hidden="true"><span /></div>
            <h1 className="intro-title">Início da Batalha</h1>
            <div className="intro-divider"><i /><b>◆</b><i /></div>
            <div className="intro-subtitle">As forças tomam posição no campo</div>
            <div className="coinflip-progress" aria-hidden="true"><span /></div>
          </div>
        )}

        {(phase === 'ready' || phase === 'flipping') && (
          <div className="flip-phase">
            <div className="coinflip-eyebrow">A sorte decidirá</div>
            <h1 className="coinflip-title">Quem começa?</h1>
            <div className="coinflip-players">
              <div className="player-info player-info-user"><small>Desafiante</small><span className="player-name">{playerName}</span></div>
              <span className="vs-text">contra</span>
              <div className="player-info player-info-ai"><small>Oponente</small><span className="player-name">{aiName}</span></div>
            </div>
            <div className="coin-stage">
              <div className="coin-orbit" aria-hidden="true" />
              <div className={`coin ${isFlipping ? 'flipping' : ''} ${result ? `result-${result}` : ''}`}>
                <div className="coin-side coin-front"><img src={headIcon} alt="Cara" className="coin-icon" /></div>
                <div className="coin-side coin-back"><img src={crownIcon} alt="Coroa" className="coin-icon" /></div>
              </div>
            </div>
            <p className="flip-status">{isFlipping ? 'Consultando o destino…' : 'Preparando o lançamento…'}</p>
          </div>
        )}

        {phase === 'result' && result && (
          <div className="result-phase">
            <div className="coinflip-eyebrow">O destino respondeu</div>
            <div className={`result-emblem ${result}`}><img src={result === 'head' ? headIcon : crownIcon} alt="" /></div>
            <div className={`result-container ${result}`}>
              <p className="result-label">{result === 'head' ? 'Cara' : 'Coroa'}</p>
              <p className="result-winner">
                <strong>{winner === playerName ? 'Você abre a batalha' : 'O adversário começa'}</strong>
                <span>{winner === playerName ? 'O primeiro movimento é seu.' : 'Prepare sua resposta.'}</span>
              </p>
            </div>
            <div className="continue-text"><i /><span>Entrando no campo</span><i /></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoinFlip;
