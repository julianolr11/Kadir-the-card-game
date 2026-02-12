import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/guardian-select-modal.css';
const GUARDIANS_DATA = require('../assets/guardiansData');

// Tenta obter dados do guardião (arquivo da carta) para usar a imagem
const getGuardianCardData = (guardianId) => {
  if (!guardianId) return null;
  try {
    // arquivos de guardiões ficam em src/assets/cards/booster1/<id>.js
    const card = require(`../assets/cards/booster1/${guardianId}.js`);
    if (card && card.img) return card;
  } catch (e) {
    // ignore
  }
  // fallback para guardiansData que pode conter `img`
  try {
    const fallback = GUARDIANS_DATA?.[guardianId];
    if (fallback && fallback.img) return fallback;
  } catch (e) {}
  return null;
};

function DeckSelectModal({ visible, onClose, onSelect }) {
  const { decks = {}, lang = 'ptbr' } = useContext(AppContext);

  if (!visible) return null;

  const deckList = Object.entries(decks || {}).map(([key, deck]) => {
    const gid = deck.guardianId || deck.guardian || null;
    const guardianData = getGuardianCardData(gid);
    return {
      id: key,
      name: deck.name || key,
      cards: deck.cards || [],
      guardianId: gid,
      guardianData,
    };
  });

  const handleDeckClick = (deck) => {
    onSelect(deck.cards);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{lang === 'ptbr' ? 'Selecione um Deck' : 'Select a Deck'}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="deck-list">
            {deckList.length > 0 ? (
            <div className="deck-grid">
              {deckList.map((deck) => (
                <div key={deck.id} className="deck-item" onClick={() => handleDeckClick(deck)}>
                  <div
                    className="deck-card-preview"
                    style={{
                      backgroundImage: deck.guardianData && deck.guardianData.img ? `url(${deck.guardianData.img})` : 'none',
                    }}
                  >
                    <div className="deck-card-overlay">
                      <h3>{deck.name}</h3>
                      <p className="deck-card-sub">{lang === 'ptbr' ? 'Pronto para editar' : 'Ready to edit'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-decks-message">
              {lang === 'ptbr' ? 'Nenhum deck disponível' : 'No decks available'}
            </p>
          )}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1a1a1a;
          border: 2px solid #9b7d5e;
          border-radius: 10px;
          padding: 20px;
          max-width: 500px;
          max-height: 70vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #9b7d5e;
          padding-bottom: 10px;
        }

        .modal-header h2 {
          margin: 0;
          color: #e8d5b7;
          font-size: 24px;
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: #e8d5b7;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-btn:hover {
          color: #fff;
        }

        .deck-list {
          display: block;
          gap: 12px;
        }

        .deck-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 14px;
        }

        .deck-item {
          cursor: pointer;
          transform: translateY(0);
        }

        .deck-item:hover .deck-card-preview {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 34px rgba(0,0,0,0.6);
        }

        .deck-card-preview {
          width: 100%;
          aspect-ratio: 3 / 4;
          background-size: cover;
          background-position: center;
          border-radius: 10px;
          border: 2px solid #9b7d5e;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .deck-card-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.45));
          color: #fff;
          text-align: center;
          padding: 12px;
        }

        .deck-card-overlay h3 {
          margin: 0;
          color: #f3eada;
          font-size: 16px;
          text-shadow: 0 2px 6px rgba(0,0,0,0.8);
        }

        .deck-card-sub {
          margin: 6px 0 0 0;
          color: rgba(243,234,218,0.85);
          font-size: 12px;
        }

        .deck-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .deck-item-guardian-img {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          flex-shrink: 0;
        }

        .deck-item-guardian-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          flex-shrink: 0;
        }

        .deck-info {
          text-align: center;
          width: 100%;
        }

        .no-decks-message {
          color: #9b7d5e;
          text-align: center;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}

export default DeckSelectModal;
