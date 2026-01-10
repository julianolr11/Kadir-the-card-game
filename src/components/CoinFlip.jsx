import React, { useState, useEffect } from 'react';
import coinFlipSound from '../assets/sounds/effects/coin-flip.mp3';
import headIcon from '../assets/img/icons/head.png';
import crownIcon from '../assets/img/icons/crown.png';
import '../styles/coinflip.css';

function CoinFlip({ onResult, playerName = 'Jogador', aiName = 'Adversário' }) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [winner, setWinner] = useState(null);
  const audioRef = React.useRef(null);

  const handleFlip = () => {
    if (isFlipping || result) return;

    setIsFlipping(true);
    setResult(null);
    setWinner(null);

    // Toca o som
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // Simula o tempo de giro da moeda (2 segundos)
    setTimeout(() => {
      const randomValue = Math.random();
      const flipResult = randomValue < 0.5 ? 'head' : 'crown';
      console.log('CoinFlip random:', randomValue, '-> result:', flipResult);
      setResult(flipResult);
      setIsFlipping(false);

      // Determina o vencedor
      const flipped = flipResult === 'head' ? playerName : aiName;
      setWinner(flipped);

      // Chama callback depois que resultado está definido
      setTimeout(() => {
        onResult?.(flipResult === 'head' ? 'player' : 'ai');
      }, 500);
    }, 2000);
  };

  return (
    <div className="coinflip-overlay">
      <div className="coinflip-container">
        <audio ref={audioRef} src={coinFlipSound} preload="auto" />

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
        <div className={`coin ${isFlipping ? 'flipping' : ''}`}>
          <div className="coin-side coin-front">
            <img src={headIcon} alt="Cara" className="coin-icon" />
          </div>
          <div className="coin-side coin-back">
            <img src={crownIcon} alt="Coroa" className="coin-icon" />
          </div>
        </div>

        {/* Resultado */}
        {result && (
          <div className={`result-container ${result}`}>
            <p className="result-label">
              {result === 'head' ? 'Cara' : 'Coroa'}
            </p>
            <p className="result-winner">
              <strong>{winner}</strong> começa!
            </p>
          </div>
        )}

        {/* Botão */}
        {!result && (
          <button
            className="flip-button"
            onClick={handleFlip}
            disabled={isFlipping}
          >
            {isFlipping ? 'Girando...' : 'Girar Moeda'}
          </button>
        )}

        {result && (
          <p className="continue-text">A partida começará em breve...</p>
        )}
      </div>
    </div>
  );
}

export default CoinFlip;
