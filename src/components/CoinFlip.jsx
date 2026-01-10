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
    // Mostra "Início de partida" por 1.5s, depois fica pronto para jogar
    const timer = setTimeout(() => {
      setPhase('ready');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
      setPhase('result');

      // Determina o vencedor
      const flipped = flipResult === 'head' ? playerName : aiName;
      setWinner(flipped);

      // Chama callback depois que resultado está definido
      setTimeout(() => {
        onResult?.(flipResult === 'head' ? 'player' : 'ai');
      }, 2000);
    }, 1200); // Reduzido para 1.2s
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
        {phase !== 'intro' && (
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

            {/* Resultado */}
            {phase === 'result' && result && (
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
            )}

            {/* Botão */}
            {phase === 'ready' && !result && (
              <button
                className="flip-button"
                onClick={handleFlip}
                disabled={isFlipping}
              >
                {isFlipping ? 'Girando...' : 'Girar Moeda'}
              </button>
            )}

            {phase === 'result' && result && (
              <p className="continue-text">A partida começará em breve...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CoinFlip;
