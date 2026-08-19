import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import allCards from '../assets/cards';
import lvlIcon from '../assets/img/icons/lvlicon.png';
import heartIcon from '../assets/img/icons/hearticon.png';
import soulEssenceIcon from '../assets/img/icons/soul-essence.png';
import shieldIcon from '../assets/img/icons/shield.png';
import burnIcon from '../assets/img/icons/burn.png';
import freezeIcon from '../assets/img/icons/freeze.png';
import paralyzeIcon from '../assets/img/icons/paralyze.png';
import poisonIcon from '../assets/img/icons/poison.png';
import sleepIcon from '../assets/img/icons/sleep.png';
import bleedIcon from '../assets/img/icons/bleed.png';
import fogoIcon from '../assets/img/elements/fogo.png';
import aguaIcon from '../assets/img/elements/agua.png';
import terraIcon from '../assets/img/elements/terra.png';
import arIcon from '../assets/img/elements/ar.png';
import puroIcon from '../assets/img/elements/puro.png';
import '../styles/kadir-full-art.css';
import StatusText from './StatusText';

const COMMAND = 'kadirart';
const ADD_COMMAND = 'artadd';

const getText = (value, langKey = 'pt') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[langKey] || value.pt || value.ptbr || value.en || '';
};

const stripHtml = (value, langKey = 'pt') => getText(value, langKey)
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const resolveImage = (card) => {
  if (!card) return '';
  if (typeof card.img === 'string') return card.img;
  if (card.img && typeof card.img === 'object') {
    return card.img.default || Object.values(card.img)[0] || '';
  }
  return card.image || '';
};

const elementIcons = {
  fogo: fogoIcon,
  agua: aguaIcon,
  terra: terraIcon,
  ar: arIcon,
  puro: puroIcon,
};

const fullArtFocus = {
  agolir: { position: '36% 0%', scale: 1.01 },
  alatoy: { position: '20% 1774%', scale: 1.01 },
  aldanor: { position: '33% 264%', scale: 1.04 },
  arguilia: { position: '46% 155%', scale: 1.14 },
  arigus: { position: '52% 42%', scale: 1.04 },
  ashfang: { position: '51% 44%', scale: 1.03 },
  beoxyr: { position: '57% -6%', scale: 1.01 },
  digitama: { position: '54% 229%', scale: 1.13 },
  draak: { position: '66% 74%', scale: 1.33 },
  drazaq: { position: '50% 44%', scale: 1.04 },
  ekeranth: { position: '50% 23%', scale: 1.34 },
  ekerath: { position: '100% 234%', scale: 1.04 },
  ekernoth: { position: '43% -66%', scale: 1.01 },
  ekonos: { position: '65% 105%', scale: 1.22 },
  elderox: { position: '57% 43%', scale: 1.04 },
  elythra: { position: '50% 42%', scale: 1.02 },
  faskel: { position: '52% 115%', scale: 1.35 },
  galgar: { position: '50% 83%', scale: 1.14 },
  gravhyr: { position: '51% 43%', scale: 1.03 },
  griffor: { position: '43% 144%', scale: 1.35 },
  grombi: { position: '18% 146%', scale: 1.44 },
  ignis: { position: '54% 174%', scale: 1.13 },
  kael: { position: '43% 3443%', scale: 1.01 },
  landor: { position: '37% 130%', scale: 1.20 },
  leoracal: { position: '88% 6%', scale: 1.11 },
  lunethal: { position: '50% 48%', scale: 1.02 },
  mawthorn: { position: '50% 992%', scale: 1.01 },
  moar: { position: '80% 108%', scale: 1.23 },
  nihil: { position: '49% 1005%', scale: 1.01 },
  noctyra: { position: '41% 542%', scale: 1.01 },
  owlberoth: { position: '50% 168%', scale: 1.22 },
  pawferion: { position: '52% 43%', scale: 1.04 },
  raptauros: { position: '52% 145%', scale: 1.14 },
  roenhell: { position: '50% 43%', scale: 1.03 },
  seract: { position: '59% 33%', scale: 1.01 },
  sunburst: { position: '50% 30%', scale: 1.03 },
  terrakhal: { position: '50% 43%', scale: 1.25 },
  viborom: { position: '38% 47%', scale: 1.01 },
  virideer: { position: '35% 44%', scale: 1.01 },
  whalar: { position: '27% -324%', scale: 1.01 },
  zefri: { position: '25% 150%', scale: 1.04 },
  zephyron: { position: '50% 263%', scale: 1.01 },
};

export function FullArtCard({
  card,
  lang = 'ptbr',
  className = '',
  level = 0,
  currentHp,
  maxHp,
  healing = false,
  onAbilityClick,
  shield = 0,
  armor = 0,
  burn = 0,
  freeze = 0,
  paralyze = 0,
  poison = 0,
  sleep = 0,
  bleed = 0,
  onlyBlessing = false,
}) {
  const langKey = lang === 'en' ? 'en' : 'pt';
  const imageSrc = resolveImage(card);
  const name = getText(card?.name, langKey);
  const title = getText(card?.title, langKey);
  const type = getText(card?.type, langKey);
  const weakness = card?.weakness || '';
  const blessingName = getText(card?.defaultBlessing?.name, langKey);
  const blessingDesc = getText(card?.defaultBlessing?.desc, langKey);
  const visibleSkills = [card?.defaultSkills?.[0] || card?.abilities?.[0], card?.defaultSkills?.[1] || card?.abilities?.[1]].filter(Boolean);
  const focus = fullArtFocus[card?.id] || { position: '50% 44%', scale: 1.04 };
  // Barra de vida grande dentro da carta (chefe de Calamidade) - só aparece quando maxHp é
  // passado explicitamente, senão o HP normal continua só no selo pequeno do footer.
  const hpValue = Math.max(0, currentHp ?? card?.hp ?? 0);
  const hpPct = maxHp > 0 ? Math.max(0, Math.min(100, (hpValue / maxHp) * 100)) : 0;

  return (
    <article className={`kadir-full-art-card kadir-full-art-${card?.element || 'puro'} ${className}`}>
      <div className="kadir-full-art-image" style={{ backgroundImage: `url(${imageSrc})`, backgroundPosition: focus.position, '--full-art-scale': focus.scale }} />
      <div className="kadir-full-art-vignette" />
      <div className="kadir-full-art-effects-container">
        {shield > 0 && (
          <div className="kadir-full-art-effect-indicator shield">
            <img src={shieldIcon} alt="Escudo" className="effect-icon" />
            <span className="effect-value">{shield}</span>
          </div>
        )}
        {armor > 0 && (
          <div className="kadir-full-art-effect-indicator armor">
            <img src={shieldIcon} alt="Armadura" className="effect-icon" />
            <span className="effect-value">{armor}</span>
          </div>
        )}
        {burn > 0 && (
          <div className="kadir-full-art-effect-indicator burn">
            <img src={burnIcon} alt="Queimadura" className="effect-icon" />
            <span className="effect-value">{burn}</span>
          </div>
        )}
        {freeze > 0 && (
          <div className="kadir-full-art-effect-indicator freeze">
            <img src={freezeIcon} alt="Congelamento" className="effect-icon" />
            <span className="effect-value">{freeze}</span>
          </div>
        )}
        {paralyze > 0 && (
          <div className="kadir-full-art-effect-indicator paralyze">
            <img src={paralyzeIcon} alt="Paralisia" className="effect-icon" />
            <span className="effect-value">{paralyze}</span>
          </div>
        )}
        {poison > 0 && (
          <div className="kadir-full-art-effect-indicator poison">
            <img src={poisonIcon} alt="Veneno" className="effect-icon" />
            <span className="effect-value">{poison}</span>
          </div>
        )}
        {sleep > 0 && (
          <div className="kadir-full-art-effect-indicator sleep">
            <img src={sleepIcon} alt="Sono" className="effect-icon" />
            <span className="effect-value">{sleep}</span>
          </div>
        )}
        {bleed > 0 && (
          <div className="kadir-full-art-effect-indicator bleed">
            <img src={bleedIcon} alt="Sangramento" className="effect-icon" />
            <span className="effect-value">{bleed}</span>
          </div>
        )}
      </div>
      <header className="kadir-full-art-header">
        <div><strong>{elementIcons[card?.element] && <img className="kadir-full-art-element" src={elementIcons[card.element]} alt="" />}{name}</strong><span>{title}</span></div>
        <b>#{card?.num ? String(card.num).padStart(3, '0') : '???'}</b>
      </header>
      <section className="kadir-full-art-info">
        <div className="kadir-full-art-blessing"><span>{blessingName || (langKey === 'en' ? 'Blessing' : 'Bênção')}</span><p>{blessingDesc || getText(card?.fielddesc, langKey)}</p></div>
        {!onlyBlessing && (
          <div
            className={`kadir-full-art-skills ${onAbilityClick ? 'is-clickable' : ''}`}
            onClick={onAbilityClick ? (event) => {
              const skillNode = event.target.closest('.kadir-full-art-skills > div');
              if (!skillNode || !event.currentTarget.contains(skillNode)) return;
              const abilityIndex = Array.from(event.currentTarget.children).indexOf(skillNode);
              if (abilityIndex >= 0) onAbilityClick(abilityIndex);
            } : undefined}
          >
            {visibleSkills.map((skill) => <div key={skill.id || getText(skill.name, langKey)}><header><strong>{getText(skill.name, langKey)}</strong><span className="kadir-full-art-cost">{Array.from({ length: Math.max(1, Number(skill.cost || 1)) }).map((_, index) => <img key={index} src={soulEssenceIcon} alt={langKey === 'en' ? 'Essence' : 'Essência'} />)}</span></header><p><StatusText text={stripHtml(skill.desc || skill.displayText, langKey)} /></p></div>)}
          </div>
        )}
        <footer className="kadir-full-art-stats"><span>{type}</span><span>{Number(card?.height || 0).toFixed(2)}m</span><span className="kadir-full-art-weakness">{elementIcons[weakness] ? <img src={elementIcons[weakness]} alt={`${langKey === 'en' ? 'Weakness' : 'Fraqueza'} ${weakness}`} /> : weakness || '-'}</span><span className="kadir-full-art-level"><img src={lvlIcon} alt={langKey === 'en' ? 'Level' : 'Nível'} />{level}</span><strong className="kadir-full-art-hp"><img src={heartIcon} alt={langKey === 'en' ? 'HP' : 'Vida'} />{currentHp ?? card?.hp ?? 0}</strong></footer>
        {maxHp > 0 && (
          <div className={`kadir-full-art-hpbar ${healing ? 'is-healing' : ''}`}>
            <div className="kadir-full-art-hpbar-fill" style={{ width: `${hpPct}%` }} />
            <span className="kadir-full-art-hpbar-text">{hpValue} / {maxHp}</span>
          </div>
        )}
      </section>
    </article>
  );
}

function KadirFullArtPreview() {
  const { lang = 'ptbr', addCardsFromBooster } = useContext(AppContext);
  const [typed, setTyped] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [obtained, setObtained] = useState(false);
  const langKey = lang === 'en' ? 'en' : 'pt';

  const creaturePool = useMemo(() => (
    (Array.isArray(allCards) ? allCards : [])
      .filter((card) => card && card.id && card.type !== 'field' && card.type !== 'effect')
  ), []);

  const card = selectedCard || creaturePool[0];

  const imageSrc = resolveImage(card);
  const name = getText(card?.name, langKey);
  const title = getText(card?.title, langKey);
  const type = getText(card?.type, langKey);
  const weakness = card?.weakness || '';
  const blessingName = getText(card?.defaultBlessing?.name, langKey);
  const blessingDesc = getText(card?.defaultBlessing?.desc, langKey);
  const primarySkill = card?.defaultSkills?.[0] || card?.abilities?.[0];
  const secondarySkill = card?.defaultSkills?.[1] || card?.abilities?.[1];
  const visibleSkills = [primarySkill, secondarySkill].filter(Boolean);
  const focus = fullArtFocus[card?.id] || { position: '50% 44%', scale: 1.04 };

  const openRandomCard = () => {
    if (creaturePool.length === 0) return;
    const nextIndex = Math.floor(Math.random() * creaturePool.length);
    setSelectedCard(creaturePool[nextIndex]);
    setObtained(false);
    setOpen(true);
  };

  const addRandomFullArt = () => {
    if (creaturePool.length === 0) return;
    const nextCard = creaturePool[Math.floor(Math.random() * creaturePool.length)];
    addCardsFromBooster?.([{ id: nextCard.id, isHolo: true, isFullArt: true }]);
    setSelectedCard(nextCard);
    setObtained(true);
    setOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || event.target?.isContentEditable) return;
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key.length !== 1) return;
      setTyped((current) => {
        const next = `${current}${event.key}`.toLowerCase().slice(-Math.max(COMMAND.length, ADD_COMMAND.length));
        if (next.endsWith(ADD_COMMAND)) {
          addRandomFullArt();
          return '';
        }
        if (next.endsWith(COMMAND)) {
          openRandomCard();
          return '';
        }
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [creaturePool, addCardsFromBooster]);

  if (!open || !card) return null;

  return (
    <div className={`kadir-full-art-overlay ${obtained ? 'kadir-full-art-obtained' : ''}`} onClick={() => setOpen(false)}>
      <div className="kadir-full-art-stage" onClick={(event) => event.stopPropagation()}>
        {obtained && <div className="kadir-full-art-obtained-copy"><span>{langKey === 'en' ? 'Relic discovered' : 'Relíquia descoberta'}</span><strong>{langKey === 'en' ? 'You obtained' : 'Você obteve'}</strong><b>FULL ART</b></div>}
        <button
          type="button"
          className="kadir-full-art-close"
          onClick={() => setOpen(false)}
          aria-label={langKey === 'en' ? 'Close full-art' : 'Fechar full-art'}
        >
          x
        </button>

        <FullArtCard card={card} lang={lang} className={obtained ? 'is-obtained' : ''} />
        {/*
        <article className={`kadir-full-art-card kadir-full-art-${card.element || 'puro'}`}>
          <div
            className="kadir-full-art-image"
            style={{
              backgroundImage: `url(${imageSrc})`,
              backgroundPosition: focus.position,
              '--full-art-scale': focus.scale,
            }}
          />
          <div className="kadir-full-art-vignette" />

          <header className="kadir-full-art-header">
            <div>
              <strong>
                {elementIcons[card.element] && (
                  <img
                    className="kadir-full-art-element"
                    src={elementIcons[card.element]}
                    alt={`Elemento ${card.element}`}
                  />
                )}
                {name}
              </strong>
              <span>{title}</span>
            </div>
            <b>#{card.num ? String(card.num).padStart(3, '0') : '???'}</b>
          </header>

          <section className="kadir-full-art-info">
            <div className="kadir-full-art-blessing">
              <span>{blessingName || 'Benção'}</span>
              <p>{blessingDesc || getText(card?.fielddesc, langKey)}</p>
            </div>

            <div className="kadir-full-art-skills">
              {visibleSkills.map((skill) => (
                <div key={skill.id || getText(skill.name, langKey)}>
                  <header>
                    <strong>{getText(skill.name, langKey)}</strong>
                    <span className="kadir-full-art-cost">
                      {Array.from({ length: Math.max(1, Number(skill.cost || 1)) }).map((_, index) => (
                        <img key={index} src={soulEssenceIcon} alt="Essência" />
                      ))}
                    </span>
                  </header>
                  <p><StatusText text={stripHtml(skill.desc || skill.displayText, langKey)} /></p>
                </div>
              ))}
            </div>

            <footer className="kadir-full-art-stats">
              <span>{type}</span>
              <span>{Number(card.height || 0).toFixed(2)}m</span>
              <span className="kadir-full-art-weakness">
                {elementIcons[weakness] ? (
                  <img src={elementIcons[weakness]} alt={`Fraqueza ${weakness}`} />
                ) : (
                  weakness || '-'
                )}
              </span>
              <span className="kadir-full-art-level">
                <img src={lvlIcon} alt="Nível" />
                0
              </span>
              <strong className="kadir-full-art-hp">
                <img src={heartIcon} alt="Vida" />
                {card.hp || 0}
              </strong>
            </footer>
          </section>
        </article> */}

        <div className="kadir-full-art-note">
          {obtained ? getText(card.name, langKey) : (langKey === 'en' ? 'Temporary full-art prototype' : 'Protótipo temporário full-art')}
        </div>
      </div>
    </div>
  );
}

export default KadirFullArtPreview;
