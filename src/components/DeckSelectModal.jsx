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

function DeckSelectModal({ visible, onClose, onSelect, onCreateDeck, deckType = null }) {
  const { decks = {}, lang = 'ptbr' } = useContext(AppContext);

  if (!visible) return null;

  const deckList = Object.entries(decks || {})
    .filter(([, deck]) => !deckType || (deck?.deckType || 'standard') === deckType)
    .map(([key, deck]) => {
    const gid = deck.guardianId || deck.guardian || null;
    const guardianData = getGuardianCardData(gid);
    return {
      id: key,
      name: deck.name || key,
      cards: deck.cards || [],
      guardianId: gid,
      guardianData,
      deckType: deck.deckType || 'standard',
    };
  });

  const handleDeckClick = (deck) => {
    onSelect(deck.cards, deck.id, deck.guardianId);
  };

  return (
    <div className="deck-select-overlay" onClick={onClose}>
      <div className="deck-select-modal" onClick={(e) => e.stopPropagation()}>
        <div className="deck-select-ornament" aria-hidden>◆</div>
        <div className="deck-select-header">
          <div>
            <p>{lang === 'ptbr' ? 'Arquivo de batalha' : 'Battle archive'}</p>
            <h2>{lang === 'ptbr' ? 'Escolha seu baralho' : 'Choose your deck'}</h2>
            <span>
              {lang === 'ptbr'
                ? 'Selecione o guardião que vai liderar suas cartas.'
                : 'Select the guardian who will lead your cards.'}
            </span>
          </div>
          <div className="deck-select-header-actions">
            <span className="deck-select-count">
              {deckList.length} {lang === 'ptbr' ? 'baralhos' : 'decks'}
            </span>
            <button type="button" className="deck-select-close" onClick={onClose} aria-label={lang === 'ptbr' ? 'Fechar' : 'Close'}>×</button>
          </div>
        </div>

        <div className="deck-select-list">
          <div className="deck-select-grid">
            {onCreateDeck && (
              <div className="deck-select-item deck-select-item-create">
                <button type="button" className="deck-select-card deck-select-create" onClick={onCreateDeck}>
                  <span className="deck-select-create-sigil" aria-hidden>+</span>
                  <strong>
                    {lang === 'ptbr' ? 'Criar deck' : 'Create deck'}
                  </strong>
                  <small>{lang === 'ptbr' ? 'Forje uma nova estratégia' : 'Forge a new strategy'}</small>
                </button>
              </div>
            )}
            {deckList.map((deck) => (
              <button type="button" key={deck.id} className="deck-select-item" onClick={() => handleDeckClick(deck)}>
                <div
                  className="deck-select-card"
                  style={{
                    backgroundImage: deck.guardianData && deck.guardianData.img ? `url(${deck.guardianData.img})` : 'none',
                  }}
                >
                  <span className="deck-select-card-number">{String(deckList.indexOf(deck) + 1).padStart(2, '0')}</span>
                  <div className="deck-select-card-overlay">
                    <h3>{deck.name}</h3>
                    <p>{deck.cards.filter(Boolean).length} {lang === 'ptbr' ? 'cartas' : 'cards'}</p>
                    <span>{lang === 'ptbr' ? 'Selecionar baralho' : 'Select deck'} <b aria-hidden>→</b></span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {deckList.length === 0 && !onCreateDeck && (
            <p className="no-decks-message">
              {lang === 'ptbr' ? 'Nenhum deck disponível' : 'No decks available'}
            </p>
          )}
        </div>
      </div>

      <style>{`
        .deck-select-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 34px;
          background: radial-gradient(circle at 50% 42%, rgba(95, 52, 116, 0.18), transparent 38%), rgba(3, 2, 5, 0.82);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 12000;
          animation: deckSelectOverlayIn 220ms ease-out both;
        }

        .deck-select-modal {
          position: relative;
          width: min(920px, 92vw);
          max-height: 82vh;
          padding: 30px 34px 34px;
          overflow-y: auto;
          border: 1px solid rgba(218, 177, 95, 0.58);
          border-radius: 6px;
          background: linear-gradient(145deg, rgba(35, 24, 43, 0.98), rgba(9, 6, 13, 0.99));
          box-shadow: 0 34px 110px rgba(0, 0, 0, 0.78), 0 0 0 6px rgba(4, 3, 6, 0.64), inset 0 1px rgba(255, 239, 205, 0.08);
          animation: deckSelectModalIn 380ms cubic-bezier(.16,.88,.18,1.06) both;
        }

        .deck-select-modal::before {
          content: '';
          position: absolute;
          inset: 9px;
          border: 1px solid rgba(218, 177, 95, 0.12);
          pointer-events: none;
        }

        .deck-select-ornament {
          position: absolute;
          top: -11px;
          left: 50%;
          z-index: 2;
          width: 23px;
          height: 23px;
          transform: translateX(-50%) rotate(45deg);
          border: 1px solid rgba(218, 177, 95, 0.72);
          background: #180f1f;
          color: #dbb86f;
          font-size: 8px;
          line-height: 21px;
          text-align: center;
        }

        .deck-select-header {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 24px;
          padding: 2px 0 20px;
          border-bottom: 1px solid rgba(218, 177, 95, 0.28);
        }

        .deck-select-header p {
          margin: 0 0 3px;
          color: #75e8d4;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .2em;
          text-transform: uppercase;
        }

        .deck-select-header h2 {
          margin: 0;
          color: #f0ddb5;
          font: 600 30px Georgia, 'Times New Roman', serif;
          letter-spacing: .015em;
          text-shadow: 0 3px 18px rgba(0,0,0,.6);
        }

        .deck-select-header > div > span {
          display: block;
          margin-top: 7px;
          color: rgba(221, 210, 228, .58);
          font-size: 12px;
        }

        .deck-select-header-actions { display: flex; align-items: center; gap: 12px; }
        .deck-select-count {
          padding: 5px 10px;
          border: 1px solid rgba(117, 232, 212, .2);
          border-radius: 999px;
          color: rgba(117, 232, 212, .76);
          background: rgba(17, 49, 44, .2);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .1em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .deck-select-close {
          width: 34px;
          height: 34px;
          border: 1px solid rgba(218,177,95,.26);
          border-radius: 50%;
          background: rgba(8,5,11,.34);
          color: #e8d5b7;
          font: 300 26px/1 Georgia, serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 160ms ease, border-color 160ms ease, transform 160ms ease;
        }

        .deck-select-close:hover { color: #fff; border-color: rgba(218,177,95,.7); transform: rotate(90deg); }

        .deck-select-list { display: block; }
        .deck-select-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 18px;
        }

        .deck-select-item {
          min-width: 0;
          padding: 0;
          border: 0;
          background: none;
          color: inherit;
          font-family: inherit;
          cursor: pointer;
          text-align: left;
        }

        .deck-select-card {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border: 1px solid rgba(218, 177, 95, .46);
          border-radius: 5px;
          background-color: rgba(255,255,255,.02);
          background-size: cover;
          background-position: center;
          box-shadow: 0 14px 30px rgba(0,0,0,.42), inset 0 0 24px rgba(0,0,0,.18);
          transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
        }

        .deck-select-card::before {
          content: '';
          position: absolute;
          inset: 7px;
          z-index: 2;
          border: 1px solid rgba(242, 218, 169, .18);
          pointer-events: none;
        }

        .deck-select-item:hover .deck-select-card {
          transform: translateY(-7px);
          border-color: #e2bd71;
          box-shadow: 0 22px 42px rgba(0,0,0,.58), 0 0 24px rgba(218,177,95,.12);
        }

        .deck-select-card-number {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 3;
          color: rgba(246,230,198,.72);
          font: 700 10px Georgia, serif;
          letter-spacing: .1em;
          text-shadow: 0 2px 5px #000;
        }

        .deck-select-card-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 52px 16px 16px;
          background: linear-gradient(to top, rgba(5,3,8,.98), rgba(5,3,8,.62) 38%, transparent 72%);
        }

        .deck-select-card-overlay h3 { margin: 0; color: #f3e3c1; font: 700 17px Georgia, serif; text-shadow: 0 2px 8px #000; }
        .deck-select-card-overlay p { margin: 3px 0 11px; color: rgba(117,232,212,.78); font-size: 9px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }
        .deck-select-card-overlay > span {
          width: 100%;
          padding-top: 8px;
          border-top: 1px solid rgba(218,177,95,.2);
          color: rgba(233,222,238,.64);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .deck-select-card-overlay b { float: right; color: #dbb86f; font-size: 13px; }

        .deck-select-create {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-style: dashed;
          background: radial-gradient(circle, rgba(117,232,212,.07), transparent 50%), rgba(255,255,255,.015);
          color: rgba(232,213,181,.72);
        }

        .deck-select-create-sigil { display: grid; place-items: center; width: 52px; height: 52px; border: 1px solid rgba(218,177,95,.36); transform: rotate(45deg); font: 300 28px Georgia, serif; }
        .deck-select-create strong { margin-top: 12px; color: #e8d5b7; font: 700 16px Georgia, serif; }
        .deck-select-create small { color: rgba(221,210,228,.48); font-size: 9px; letter-spacing: .04em; }

        .no-decks-message {
          color: #9b7d5e;
          text-align: center;
          padding: 20px;
        }

        @keyframes deckSelectOverlayIn { from { opacity: 0; } }
        @keyframes deckSelectModalIn { from { opacity: 0; transform: translateY(18px) scale(.98); } }

        @media (max-width: 620px) {
          .deck-select-overlay { padding: 18px; }
          .deck-select-modal { padding: 26px 22px; }
          .deck-select-header > div > span, .deck-select-count { display: none; }
          .deck-select-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        }
      `}</style>
    </div>
  );
}

export default DeckSelectModal;
