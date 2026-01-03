import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/homescreen.css';

// Componente que exibe a carta guardião ativa
function Guardiao({ onClick }) {
  const { activeGuardian } = useContext(AppContext);
  if (!activeGuardian) return null;
  // Mapeamento de elemento para classe
  const elementClass = activeGuardian.element
    ? `deck-btn-${activeGuardian.element}`
    : '';
  return (
    <button
      className={`deck-btn ${elementClass}`}
      style={{ backgroundImage: `url(${activeGuardian.img})` }}
      onClick={onClick}
      title={activeGuardian.name}
    >
      <span className="deck-btn-label">Deck</span>
    </button>
  );
}

export default Guardiao;
