import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import fogo from '../assets/img/elements/fogo.png';
import agua from '../assets/img/elements/agua.png';
import ashfangImg from '../assets/img/creatures/ashfang_bio.png';
import soulEssence from '../assets/img/icons/soul-essence.png';
import lvlIcon from '../assets/img/icons/lvlicon.png';
import heartIcon from '../assets/img/icons/hearticon.png';
import '../styles/cardpreview.css';

const translations = {
  ptbr: {
    fire: 'Fogo',
    water: 'Água',
    beast: 'Fera',
    height: 'Altura',
    weakness: 'Fraqueza',
    hp: 'Vida',
    ability1: 'Chama Voraz',
    ability1desc: 'Causa 30 de dano ao inimigo.',
    ability2: 'Explosão Ígnea',
    ability2desc: 'Causa 20 de dano em todos os inimigos.',
    field: 'Solo Incandescente:',
    fielddesc: 'Aumenta o dano de fogo em 10% enquanto Ashfang estiver em campo.',
    storyTitle: 'Origem de Ashfang',
    story1: 'Ashfang nasceu das cinzas de uma floresta devastada por um incêndio ancestral. Sua essência é forjada no calor extremo, tornando-o uma criatura feroz e resiliente, capaz de manipular chamas com precisão sobrenatural.',
    story2: 'Características principais: corpo envolto em brasas vivas, olhos incandescentes, domínio total sobre o fogo, e instinto protetor com aliados. Ashfang é temido por sua força destrutiva, mas respeitado por sua lealdade inabalável.'
  },
  en: {
    fire: 'Fire',
    water: 'Water',
    beast: 'Beast',
    height: 'Height',
    weakness: 'Weakness',
    hp: 'HP',
    ability1: 'Voracious Flame',
    ability1desc: 'Deals 30 damage to the enemy.',
    ability2: 'Fiery Explosion',
    ability2desc: 'Deals 20 damage to all enemies.',
    field: 'Scorched Ground:',
    fielddesc: 'Increases fire damage by 10% while Ashfang is on the field.',
    storyTitle: 'Origin of Ashfang',
    story1: 'Ashfang was born from the ashes of a forest devastated by an ancient fire. Its essence is forged in extreme heat, making it a fierce and resilient creature, able to manipulate flames with supernatural precision.',
    story2: 'Main traits: body covered in living embers, glowing eyes, total control over fire, and a protective instinct for allies. Ashfang is feared for its destructive power, but respected for its unwavering loyalty.'
  }
};

const CardPreview = ({ onClose }) => {
  const [showStory, setShowStory] = useState(false);
  const { lang } = useContext(AppContext);
  const t = translations[lang] || translations.ptbr;
  return (
    <div style={{ position: 'relative', display: 'flex' }}>
      {/* Card + seta sempre juntos na mesma div */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          className={`card-preview-arrow${showStory ? ' card-preview-arrow-rotated' : ''}`}
          style={{ position: 'absolute', top: 0, right: -50, zIndex: 100 }}
          onClick={() => setShowStory(s => !s)}
          aria-label={showStory ? (lang === 'en' ? 'Close creature story' : 'Fechar história da criatura') : (lang === 'en' ? 'View creature story' : 'Ver história da criatura')}
        >
          <span style={{ fontSize: 28, color: '#ffe6b0', filter: 'drop-shadow(0 2px 8px #000a)', display: 'inline-block', transition: 'transform 0.3s' }}>
            {showStory ? '\u2190' : '\u2192'}
          </span>
        </button>
        <div className="card-preview card-preview-fire">
          {/* Linha superior */}
          <div className="card-preview-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={fogo} alt={t.fire} className="card-preview-element" />
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
                <strong>{t.ability1}</strong>
                <div className="desc">{t.ability1desc}</div>
              </div>
            </div>
            <div className="card-preview-ability">
              <span className="essence-cost-icons">
                {[...Array(2)].map((_,i)=>(<img key={i} src={soulEssence} alt="Essência" className="essence-icon" />))}
              </span>
              <div>
                <strong>{t.ability2}</strong>
                <div className="desc">{t.ability2desc}</div>
              </div>
            </div>
          </div>
          {/* Habilidade de campo */}
          <div className="card-preview-field">
            <strong>{t.field}</strong> {t.fielddesc}
          </div>
          {/* Linha inferior: nível, descrições, vida */}
          <div className="card-preview-bottom">
            <span className="card-preview-level-icon">
              <img src={lvlIcon} alt="Nível" className="icon-bg" />
              <span className="icon-text">0</span>
            </span>
            <div className="card-preview-descs-inline">
              <div className="desc-col">
                <span className="desc-label">{t.beast}</span>
                <span className="desc-value">Fera</span>
              </div>
              <div className="desc-col">
                <span className="desc-label">{t.height}</span>
                <span className="desc-value">1,23m</span>
              </div>
              <div className="desc-col">
                <span className="desc-label">{t.weakness}</span>
                <span className="desc-value"><img src={agua} alt={t.water} className="fraqueza-icon" /></span>
              </div>
            </div>
            <span className="card-preview-hp-icon">
              <img src={heartIcon} alt={t.hp} className="icon-bg" />
              <span className="icon-text">5</span>
            </span>
          </div>
        </div>
      </div>
      {/* Centralização card + painel quando história aberta */}
      {showStory && (
        <div className="card-preview-story-panel">
          <h3 className="card-preview-story-title">{t.storyTitle}</h3>
          <div className="card-preview-story-content">
            <p>{t.story1}</p>
            <p>{t.story2}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPreview;
