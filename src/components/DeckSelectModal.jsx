import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/guardian-select-modal.css';

function DeckSelectModal({ visible, onClose, onSelect }) {
  const { decks = {}, lang = 'ptbr' } = useContext(AppContext);

  if (!visible) return null;

  const deckList = Object.entries(decks || {}).map(([key, deck]) => ({
    id: key,
    name: deck.name || key,
    cards: deck.cards || [],
  }));

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
            deckList.map((deck) => (
              <div key={deck.id} className="deck-item" onClick={() => handleDeckClick(deck)}>
                <div className="deck-info">
                  <h3>{deck.name}</h3>
                  <p>{deck.cards.length} {lang === 'ptbr' ? 'cartas' : 'cards'}</p>
                </div>
              </div>
            ))
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
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .deck-item {
          background: #2a2a2a;
          border: 1px solid #9b7d5e;
          border-radius: 5px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .deck-item:hover {
          background: #3a3a3a;
          border-color: #c9a876;
          transform: translateX(5px);
        }

        .deck-info h3 {
          margin: 0 0 5px 0;
          color: #e8d5b7;
          font-size: 16px;
        }

        .deck-info p {
          margin: 0;
          color: #9b7d5e;
          font-size: 14px;
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
