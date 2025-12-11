import React, { useState } from 'react';
import fogo from '../assets/img/elements/fogo.png';
import agua from '../assets/img/elements/agua.png';
import ashfangImg from '../assets/img/creatures/ashfang_bio.png';
import soulEssence from '../assets/img/icons/soul-essence.png';
import lvlIcon from '../assets/img/icons/lvlicon.png';
import heartIcon from '../assets/img/icons/hearticon.png';
import '../styles/cardpreview.css';

const CardPreview = ({ onClose }) => {
  const [showStory, setShowStory] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex' }}>
      {/* Card + seta sempre juntos na mesma div */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          className={`card-preview-arrow${showStory ? ' card-preview-arrow-rotated' : ''}`}
          style={{ position: 'absolute', top: 0, right: -50, zIndex: 100 }}
          onClick={() => setShowStory(s => !s)}
          aria-label={showStory ? 'Fechar história da criatura' : 'Ver história da criatura'}
        >
          <span style={{ fontSize: 28, color: '#ffe6b0', filter: 'drop-shadow(0 2px 8px #000a)', display: 'inline-block', transition: 'transform 0.3s' }}>
            {showStory ? '\u2190' : '\u2192'}
          </span>
        </button>
        <div className="card-preview card-preview-fire">
          {/* Linha superior */}
          <div className="card-preview-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={fogo} alt="Fogo" className="card-preview-element" />
              <span className="card-preview-name">Ashfang</span>
            </span>
            <span className="card-preview-id">#012</span>
          </div>
          {/* Arte principal */}
          <div className="card-preview-art-wrapper">
            <img src={ashfangImg} alt="Ashfang" className="card-preview-art" />
          </div>
          {/* Habilidades */}
          <div className="card-preview-abilities">
            <div className="card-preview-ability">
              <span className="essence-cost-icons">
                {[...Array(1)].map((_,i)=>(<img key={i} src={soulEssence} alt="Essência" className="essence-icon" />))}
              </span>
              <div>
                <strong>Chama Voraz</strong>
                <div className="desc">Causa 30 de dano ao inimigo.</div>
              </div>
            </div>
            <div className="card-preview-ability">
              <span className="essence-cost-icons">
                {[...Array(2)].map((_,i)=>(<img key={i} src={soulEssence} alt="Essência" className="essence-icon" />))}
              </span>
              <div>
                <strong>Explosão Ígnea</strong>
                <div className="desc">Causa 20 de dano em todos os inimigos.</div>
              </div>
            </div>
          </div>
          {/* Habilidade de campo */}
          <div className="card-preview-field">
            <strong>Solo Incandescente:</strong> Aumenta o dano de fogo em 10% enquanto Ashfang estiver em campo.
          </div>
          {/* Linha inferior: nível, descrições, vida */}
          <div className="card-preview-bottom">
            <span className="card-preview-level-icon">
              <img src={lvlIcon} alt="Nível" className="icon-bg" />
              <span className="icon-text">0</span>
            </span>
            <div className="card-preview-descs-inline">
              <div className="desc-col">
                <span className="desc-label">Tipo:</span>
                <span className="desc-value">Fera</span>
              </div>
              <div className="desc-col">
                <span className="desc-label">Altura:</span>
                <span className="desc-value">2,1m</span>
              </div>
              <div className="desc-col">
                <span className="desc-label">Fraqueza:</span>
                <span className="desc-value"><img src={agua} alt="Água" className="fraqueza-icon" /></span>
              </div>
            </div>
            <span className="card-preview-hp-icon">
              <img src={heartIcon} alt="HP" className="icon-bg" />
              <span className="icon-text">5</span>
            </span>
          </div>
        </div>
      </div>
      {/* Centralização card + painel quando história aberta */}
      {showStory && (
        <div className="card-preview-story-panel">
          <h3 className="card-preview-story-title">Origem de Ashfang</h3>
          <div className="card-preview-story-content">
            <p>
              Ashfang nasceu das cinzas de uma floresta devastada por um incêndio ancestral. Sua essência é forjada no calor extremo, tornando-o uma criatura feroz e resiliente, capaz de manipular chamas com precisão sobrenatural.
            </p>
            <p>
              Características principais: corpo envolto em brasas vivas, olhos incandescentes, domínio total sobre o fogo, e instinto protetor com aliados. Ashfang é temido por sua força destrutiva, mas respeitado por sua lealdade inabalável.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPreview;
