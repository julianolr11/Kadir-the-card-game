import React, { useState, useEffect } from 'react';
import coinFlipSound from '../assets/sounds/effects/coin-flip.mp3';
import headIcon from '../assets/img/icons/head.png';
import crownIcon from '../assets/img/icons/crown.png';
import '../styles/coinflip.css';

function CoinFlip({ onResult, playerName = 'Jogador', aiName = 'Adversário' }) {
  const [phase, setPhase] = useState('intro'); // intro -> ready -> flipping -> result
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [winner, setWinner] = useState(null);
  const audioRef = React.useRef(null);

  useEffect(() => {
    // Mostra "Início de partida" por 3s
    const introTimer = setTimeout(() => {
      setPhase('ready');
    }, 3000);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    // Quando entrar na fase ready, aguarda 500ms e joga a moeda automaticamente
    if (phase === 'ready') {
      const flipTimer = setTimeout(() => {
        handleFlip();
      }, 500);
      return () => clearTimeout(flipTimer);
    }
  }, [phase]);

  const handleFlip = () => {
    if (isFlipping || result || phase !== 'ready') return;

    setPhase('flipping');
    setIsFlipping(true);
    setResult(null);
    setWinner(null);

    // Toca o som
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // Simula o tempo de giro da moeda (1.2 segundos)
    setTimeout(() => {
      const randomValue = Math.random();
      const flipResult = randomValue < 0.5 ? 'head' : 'crown';
      console.log('CoinFlip random:', randomValue, '-> result:', flipResult);
      setResult(flipResult);
      setIsFlipping(false);

      // Determina o vencedor
      const flipped = flipResult === 'head' ? playerName : aiName;
      setWinner(flipped);

      // Aguarda um pouco antes de mostrar o resultado
      setTimeout(() => {
        setPhase('result');

        // Chama callback depois que resultado está definido
        setTimeout(() => {
          onResult?.(flipResult === 'head' ? 'player' : 'ai');
        }, 3000);
      }, 800);
    }, 1200);
  };

  return (
    <div className="coinflip-overlay">
      <div className="coinflip-container">
        <audio ref={audioRef} src={coinFlipSound} preload="auto" />

        {/* Fase de Introdução */}
        {phase === 'intro' && (
          <div className="intro-phase">
            <h1 className="intro-title">Início de Partida</h1>
            <div className="intro-subtitle">Preparando o campo de batalha...</div>
          </div>
        )}

        {/* Fase de Jogar a Moeda */}
        {(phase === 'ready' || phase === 'flipping') && (
          <>
            <h1 className="coinflip-title">Quem Começa?</h1>

            <div className="coinflip-players">
              <div className="player-info">
                <span className="player-name">{playerName}</span>
              </div>
              <span className="vs-text">VS</span>
              <div className="player-info">
                <span className="player-name">{aiName}</span>
              </div>
            </div>

            {/* Moeda */}
            <div className={`coin ${isFlipping ? 'flipping' : ''} ${result ? `result-${result}` : ''}`}>
              <div className="coin-side coin-front">
                <img src={headIcon} alt="Cara" className="coin-icon" />
              </div>
              <div className="coin-side coin-back">
                <img src={crownIcon} alt="Coroa" className="coin-icon" />
              </div>
            </div>
          </>
        )}

        {/* Fase de Resultado */}
        {phase === 'result' && result && (
          <>
            <div className={`result-container ${result}`}>
              <p className="result-label">
                {result === 'head' ? '🎯 Cara' : '👑 Coroa'}
              </p>
              <p className="result-winner">
                {winner === playerName ? (
                  <><strong>Você joga primeiro!</strong></>
                ) : (
                  <><strong>Você joga em seguida</strong></>
                )}
              </p>
            </div>

            <p className="continue-text">A partida começará em breve...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default CoinFlip;
