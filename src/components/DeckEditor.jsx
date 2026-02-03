import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
// Error Boundary para capturar erros do react-window
class GridErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Pode logar para analytics se quiser
    // console.error('Grid error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color: 'red', padding: 24, background: '#1a001a', borderRadius: 12}}>
        <b>Erro ao renderizar grid:</b><br/>
        {this.state.error?.message || 'Erro desconhecido.'}
      </div>;
    }
    return this.props.children;
  }
}
import soulEssence from '../assets/img/icons/soul-essence.png';
import puroIcon from '../assets/img/elements/puro.png';
import { Grid as FixedSizeGrid } from 'react-window';
import { AppContext } from '../context/AppContext';
import CreatureCardPreview from './CreatureCardPreview';
import CardInstanceSelector from './CardInstanceSelector';
import sphereMenuSound from '../assets/sounds/effects/sphereMenuSound.js';
import packageSound from '../assets/sounds/effects/packageSound.js';

import fogoIcon from '../assets/img/elements/fogo.png';
import aguaIcon from '../assets/img/elements/agua.png';
import terraIcon from '../assets/img/elements/terra.png';
import arIcon from '../assets/img/elements/ar.png';
import burnIcon from '../assets/img/icons/burn.png';
import freezeIcon from '../assets/img/icons/freeze.png';
import paralyzeIcon from '../assets/img/icons/paralyze.png';
import poisonIcon from '../assets/img/icons/poison.png';
import sleepIcon from '../assets/img/icons/sleep.png';
import bleedIcon from '../assets/img/icons/bleed.png';
import shieldIcon from '../assets/img/icons/shield.png';



function DeckLibraryGrid({
  cards = [],
  getCardInstances = () => [],
  getAvailableInstances = () => [],
  countCardInDeck = () => 0,
  getBestAvailableInstance = () => null,
  draggedCardId = null,
  handleDragStart = () => {},
  handleDragEnd = () => {},
  openCardLoadout = () => {},
  addCardToDeck = () => {},
  setHoveredCard = () => {},
  setHoveredCardId = () => {},
  setHoveredCardForInstances = () => {},
  setTooltipPosition = () => {},
}) {
  // Parâmetros do grid
  // Garante que cards é sempre array
  const safeCards = Array.isArray(cards) ? cards : [];
  const columnCount = 10;
  const cardWidth = 128;
  const cardHeight = 188;
  const rowCount = safeCards.length > 0 ? Math.ceil(safeCards.length / columnCount) : 0;
  const gridHeight = rowCount > 0 ? Math.min(6, rowCount) * (cardHeight + 16) : cardHeight + 16;

  // Renderização de cada célula
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const idx = rowIndex * columnCount + columnIndex;
    if (idx >= safeCards.length) return null;
    const card = safeCards[idx];
    // Fallback defensivo: só renderiza se card, card.data e card.id existem
    if (!card || !card.data || !card.id) return null;
    const instances = getCardInstances(card.id);
    const availableInstances = getAvailableInstances(card.id);
    const countInDeck = countCardInDeck(card.id);
    const instanceCount = instances ? instances.length : 0;
    const availableCount = availableInstances ? availableInstances.length : 0;
    const maxPerDeck = Math.min(instanceCount, 2);
    const isDisabled = countInDeck >= maxPerDeck || availableCount === 0;
    const hasMultipleInstances = instances && instances.length > 1;
    const bestAvailableInstance = getBestAvailableInstance(card.id);
    // Se não houver instância disponível, mostra a carta como desabilitada
    const displayLevel = bestAvailableInstance?.level || 1;
    const displayIsHolo = bestAvailableInstance?.isHolo || false;
    const unavailable = !bestAvailableInstance;
    return (
      <div
        key={card.id}
        className={`deck-library-card ${isDisabled || unavailable ? 'disabled' : ''} ${draggedCardId === card.id ? 'dragging' : ''} ${hasMultipleInstances ? 'has-multiple-instances' : ''} ${countInDeck > 0 ? 'selected' : ''}`}
        draggable={!isDisabled && !unavailable}
        onDragStart={(e) => !isDisabled && !unavailable && handleDragStart(e, card.id, false)}
        onDragEnd={handleDragEnd}
        onMouseEnter={(e) => {
          setHoveredCard(card.data);
          setHoveredCardId(card.id);
          if (hasMultipleInstances) {
            setHoveredCardForInstances(card.id);
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPosition({ x: rect.right + 10, y: rect.top });
          }
        }}
        onMouseLeave={() => {
          setHoveredCard(null);
          setHoveredCardId(null);
          setHoveredCardForInstances(null);
        }}
        style={{ ...style, animationDelay: `${idx * 50}ms`, position: 'relative', width: cardWidth, height: cardHeight, margin: 8, opacity: unavailable ? 0.5 : 1 }}
      >
        {card.data.id === 'f001' ? (
          <div className="slider-card-wrapper active" style={{ transform: 'scale(0.319)', transformOrigin: 'top left', pointerEvents: 'none' }}>
            <div className="card-preview card-preview-field">
              <div className="card-preview-header">
                <span className="card-preview-name">Campo em Reuínas</span>
                <span className="card-preview-id">#f001</span>
              </div>
              <div className="card-preview-art-wrapper">
                <img alt="Campo em Reuínas" className="card-preview-art" src={require(`../assets/${card.data.image}`)} />
              </div>
              <div className="card-preview-field-desc">
                <strong>Descrição:</strong>
                <div style={{whiteSpace: 'pre-line'}}>Energias ancestrais despertam e fortalecem monstros e seres puros. Apenas os dignos sentirão o poder fluir sob seus pés.</div>
                <div className="card-preview-field-effects">
                  <strong>Efeitos:</strong>
                  <ul>
                    <li>Criaturas do elemento <b>puro</b>: +1 Dano / +1 HP</li>
                    <li>Criaturas do tipo <b>monstro</b>: +1 Dano / +1 HP</li>
                    <li><b>Puras e Monstros</b>: +2 Dano / +2 HP</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ transform: 'scale(0.319)', transformOrigin: 'top left', pointerEvents: 'none' }}>
            <CreatureCardPreview creature={card.data} onClose={null} level={displayLevel} isHolo={displayIsHolo} allowFlip={false} />
          </div>
        )}
        <div className="deck-library-card-count">{countInDeck}/{availableCount + countInDeck}</div>
        {hasMultipleInstances && availableCount > 0 && (<div className="multiple-instances-indicator" title="Múltiplas cópias disponíveis">{availableCount}x</div>)}
        <div className="deck-library-actions">
          {(() => {
            const isField = (() => {
              const id = card.id?.toString().toLowerCase();
              const isFieldId = /^f\d{3}$/.test(id) || id?.startsWith('field_');
              const isFieldCategory = card.data?.category && String(card.data.category).toLowerCase().includes('campo');
              return isFieldId || isFieldCategory;
            })();
            const isEffect = card.data?.type === 'effect' || String(card.id).toLowerCase().startsWith('effect_');
            if (isField || isEffect) return null;
            return (
              <button
                className="deck-action-btn deck-action-edit"
                disabled={unavailable}
                onClick={(e) => { e.stopPropagation(); if (!unavailable) openCardLoadout(card.id); }}
                title="Editar habilidades"
              >
                ✎
              </button>
            );
          })()}
          <button
            className="deck-action-btn deck-action-add"
            disabled={isDisabled || unavailable}
            onClick={(e) => { e.stopPropagation(); if (!isDisabled && !unavailable) addCardToDeck(card.id); }}
            title={unavailable ? 'Nenhuma cópia disponível' : 'Adicionar ao deck'}
          >
            +
          </button>
        </div>
        {unavailable && <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.35)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:16,pointerEvents:'none'}}>Indisponível</div>}
      </div>
    );
  };

  if (!Array.isArray(cards) || safeCards.length === 0) {
    return <div className="deck-library-grid deck-library-grid-css" style={{ minHeight: cardHeight + 16 }}>Nenhuma carta encontrada ou dados inválidos.</div>;
  }
  // Grid puro CSS: renderiza todas as cartas em um container flex/grid
  return (
    <div className="deck-library-grid deck-library-grid-css">
      {safeCards.map((card, idx) => {
        // Reaproveita a lógica do Cell
        const columnIndex = idx % columnCount;
        const rowIndex = Math.floor(idx / columnCount);
        return Cell({ columnIndex, rowIndex, style: {} });
      })}
    </div>
  );
}

// (Fim do componente DeckLibraryGrid)

const ALL_CARD_IDS = [
  'agolir','alatoy','arguilia','ashfang','beoxyr','digitama','draak','drazaq','ekeranth','ekernoth','ekonos','elderox','elythra','faskel','griffor','ignis','kael','landor','leoracal','lunethal','mawthorn','nihil','noctyra','owlberoth','pawferion','raptauros','seract','sunburst','terrakhal','viborom','virideer','whalar','zephyron',
  // Field cards
  'F001','F002','F003','F004','F005','F006','F007','F008','F009','F010','F011','F012',
];

const getCardData = (cardId) => {
  try {
    // Verifica se é uma carta de efeito
    if (String(cardId).toLowerCase().startsWith('effect_')) {
      const effectCards = require('../assets/cards/effectCards');
      return effectCards.find(c => c.id === cardId);
    }
    // Verifica se é uma carta de campo
    if (/^f\d{3}$/i.test(cardId) || String(cardId).toLowerCase().startsWith('field_')) {
      const fieldCards = require('../assets/cards/field/exampleFieldCards').default;
      return fieldCards.find(c => c.id === cardId || c.legacyId === cardId);
    }
    return require(`../assets/cards/booster1/${cardId}.js`);
  } catch (error) {
    console.warn(`Carta ${cardId} não encontrada`, error);
    return null;
  }
};

// Mapa de cores para status
const STATUS_COLORS = {
  burn: '#ff6464',
  freeze: '#64b5ff',
  paralyze: '#ffff64',
  poison: '#9664ff',
  sleep: '#c896ff',
  bleed: '#ff6464',
  armor: '#4169e1',
};

// Mapa básico de perks para exibição
const PERK_DATA = {
  HP_PLUS_1: {
    name: { pt: '+1 Vida', en: '+1 HP' },
    desc: { pt: 'Inicia com +1 de vida', en: 'Start with +1 HP' },
  },
  HP_PLUS_2: {
    name: { pt: '+2 Vida', en: '+2 HP' },
    desc: { pt: 'Inicia com +2 de vida', en: 'Start with +2 HP' },
  },
  FIRST_ROUND_SHIELD: {
    name: { pt: 'Escudo Inicial', en: 'Initial Shield' },
    desc: { pt: 'Recebe escudo no 1º turno', en: 'Gain shield on 1st turn' },
  },
  ARMOR_PLUS_2: {
    name: { pt: 'Pele Impenetrável', en: 'Impenetrable Skin' },
    desc: { pt: 'Ganha 2 de armadura', en: 'Gains 2 armor' },
  },
  KILL_XP_BONUS_10: {
    name: { pt: '+10% XP', en: '+10% XP' },
    desc: { pt: '+10% XP por abate do guardião', en: '+10% XP per guardian kill' },
  },
};

// Função para renderizar displayText com ícones e cores
const renderDisplayText = (displayText, langKey = 'pt') => {
  if (!displayText) return null;
  const text = typeof displayText === 'object' ? displayText[langKey] : displayText;
  if (!text) return null;

  return (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
      {text
        .split('\n')
        .map((line, idx) => {
          if (/^\d+\s+essências?$/i.test(line.trim())) return null;
          if (/\[habilidade\]|\[ability\]|\[perk\]/i.test(line)) return null;
          if (/^(nv|lv)\s+\d+\s*-/i.test(line.trim())) return null;

          let rendered = line;
          rendered = rendered.replace(/🔥/g, `<img src="${burnIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.burn}; font-weight: 600;">queimadura</span>`);
          rendered = rendered.replace(/❄️/g, `<img src="${freezeIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.freeze}; font-weight: 600;">congelamento</span>`);
          rendered = rendered.replace(/⚡/g, `<img src="${paralyzeIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.paralyze}; font-weight: 600;">paralisia</span>`);
          rendered = rendered.replace(/☠️/g, `<img src="${poisonIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.poison}; font-weight: 600;">veneno</span>`);
          rendered = rendered.replace(/😴/g, `<img src="${sleepIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.sleep}; font-weight: 600;">sono</span>`);
          rendered = rendered.replace(/🩸/g, `<img src="${bleedIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.bleed}; font-weight: 600;">sangramento</span>`);
          rendered = rendered.replace(/🛡️/g, `<img src="${shieldIcon}" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${STATUS_COLORS.armor}; font-weight: 600;">armadura</span>`);

          let colored = rendered;
          if (!rendered.includes('queimadura</span>')) {
            colored = colored.replace(/queimadura/gi, `<span style="color: ${STATUS_COLORS.burn}; font-weight: 600;">queimadura</span>`);
          }
          if (!rendered.includes('congelamento</span>')) {
            colored = colored.replace(/congelamento/gi, `<span style="color: ${STATUS_COLORS.freeze}; font-weight: 600;">congelamento</span>`);
          }
          if (!rendered.includes('paralisia</span>')) {
            colored = colored.replace(/paralisia/gi, `<span style="color: ${STATUS_COLORS.paralyze}; font-weight: 600;">paralisia</span>`);
          }
          if (!rendered.includes('veneno</span>')) {
            colored = colored.replace(/veneno/gi, `<span style="color: ${STATUS_COLORS.poison}; font-weight: 600;">veneno</span>`);
          }
          if (!rendered.includes('sono</span>')) {
            colored = colored.replace(/sono/gi, `<span style="color: ${STATUS_COLORS.sleep}; font-weight: 600;">sono</span>`);
          }
          if (!rendered.includes('sangramento</span>')) {
            colored = colored.replace(/sangramento/gi, `<span style="color: ${STATUS_COLORS.bleed}; font-weight: 600;">sangramento</span>`);
          }
          if (!rendered.includes('armadura</span>')) {
            colored = colored.replace(/armadura/gi, `<span style="color: ${STATUS_COLORS.armor}; font-weight: 600;">armadura</span>`);
          }

          if (!colored.trim()) return null;
          return <div key={idx} dangerouslySetInnerHTML={{ __html: colored }} />;
        })
        .filter(Boolean)}
    </div>
  );
};

// Função auxiliar para obter texto traduzido
const getName = (nameObj, lang = 'ptbr') => {
  if (!nameObj) return '';
  if (typeof nameObj === 'string') return nameObj;
  const key = lang === 'en' ? 'en' : 'pt';
  return nameObj[key] || nameObj.pt || nameObj.en || '';
};

function DeckEditor({ deckId, deckName: initialDeckName, guardianId, initialCards = [], onClose, onSave }) {
  const { lang = 'ptbr', getCardInstances, cardCollection, saveGuardianLoadout, loadGuardianLoadout } = React.useContext(AppContext) || {};
  const langKey = lang === 'en' ? 'en' : 'pt';
  const [deckName, setDeckName] = useState(initialDeckName || `Deck ${deckId}`);
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef(null);
  const [deckCards, setDeckCards] = useState(initialCards);
  const [selectedGuardian, setSelectedGuardian] = useState(guardianId);
  const [guardianCardId, setGuardianCardId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [elementFilter, setElementFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showDeckIncompleteWarning, setShowDeckIncompleteWarning] = useState(false);
  const [showInstanceSelector, setShowInstanceSelector] = useState(false);
  const [selectedCardForInstance, setSelectedCardForInstance] = useState(null);
  const [instanceSlotIndex, setInstanceSlotIndex] = useState(null);
  const [hoveredCardForInstances, setHoveredCardForInstances] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showCardLoadoutModal, setShowCardLoadoutModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCardData, setEditingCardData] = useState(null);
  const [editingSelectedSkills, setEditingSelectedSkills] = useState([null, null]);
  const [editingSelectedPerk, setEditingSelectedPerk] = useState(null);
  const successSoundRef = useRef(null);
  const errorSoundRef = useRef(null);
  const isFirstRender = useRef(true);
  const lastSavedRef = useRef({ name: initialDeckName || `Deck ${deckId}`, cards: initialCards });

  const getInstanceById = (instanceId) => {
    if (!instanceId || !cardCollection) return null;
    for (const cardId in cardCollection) {
      const instance = cardCollection[cardId].find(inst => inst.instanceId === instanceId);
      if (instance) return instance;
    }
    return null;
  };

  const getBestInstance = (cardId) => {
    const instances = getCardInstances(cardId);
    if (!instances || instances.length === 0) return null;
    const holoInstance = instances.find(inst => inst.isHolo);
    if (holoInstance) return holoInstance;
    const sorted = [...instances].sort((a, b) => b.level - a.level);
    return sorted[0];
  };

  const getAvailableInstances = (cardId) => {
    const instances = getCardInstances(cardId);
    if (!instances || instances.length === 0) return [];
    const instancesInDeck = deckCards.filter(id => id !== null);
    return instances.filter(inst => !instancesInDeck.includes(inst.instanceId));
  };

  const getBestAvailableInstance = (cardId) => {
    const availableInstances = getAvailableInstances(cardId);
    if (!availableInstances || availableInstances.length === 0) return null;
    const holoInstance = availableInstances.find(inst => inst.isHolo);
    if (holoInstance) return holoInstance;
    const sorted = [...availableInstances].sort((a, b) => b.level - a.level);
    return sorted[0];
  };

  const countCardInDeck = (cardId) => {
    return deckCards.filter((instanceId) => {
      const instance = getInstanceById(instanceId);
      return instance && instance.cardId === cardId;
    }).length;
  };

  const canAddCard = (cardId) => {
    const availableInstances = getAvailableInstances(cardId);
    const availableCount = availableInstances ? availableInstances.length : 0;
    const cardCountInDeck = countCardInDeck(cardId);
    const maxPerDeck = Math.min(availableCount + cardCountInDeck, 2);
    return cardCountInDeck < maxPerDeck && availableCount > 0;
  };

  const addCardToDeck = (cardId, slotIndex = null) => {
    if (!canAddCard(cardId)) {
      if (errorSoundRef.current) {
        errorSoundRef.current.currentTime = 0;
        errorSoundRef.current.play().catch(() => {});
      }
      return false;
    }
    const instances = getCardInstances(cardId);
    if (instances && instances.length > 1) {
      setSelectedCardForInstance(cardId);
      setInstanceSlotIndex(slotIndex);
      setShowInstanceSelector(true);
      return false;
    }
    const instanceId = instances && instances.length === 1 ? instances[0].instanceId : null;
    return finishAddingCardToDeck(instanceId, slotIndex);
  };

  const finishAddingCardToDeck = (instanceId, slotIndex = null) => {
    if (!instanceId) return false;
    const newDeck = [...deckCards];
    if (slotIndex !== null && slotIndex < 20) {
      newDeck[slotIndex] = instanceId;
    } else {
      const emptyIndex = newDeck.findIndex((id) => !id);
      if (emptyIndex !== -1) {
        newDeck[emptyIndex] = instanceId;
      } else {
        return false;
      }
    }
    setDeckCards(newDeck);
    if (successSoundRef.current) {
      successSoundRef.current.currentTime = 0;
      successSoundRef.current.play().catch(() => {});
    }
    return true;
  };

  const handleInstanceSelected = (instanceId) => {
    if (selectedCardForInstance && instanceId) {
      finishAddingCardToDeck(instanceId, instanceSlotIndex);
    }
    setShowInstanceSelector(false);
    setSelectedCardForInstance(null);
    setInstanceSlotIndex(null);
  };

  const removeCardFromDeck = (slotIndex) => {
    const instanceId = deckCards[slotIndex];
    const instance = instanceId ? getInstanceById(instanceId) : null;
    
    // Se a carta removida era o guardião, limpa o guardianCardId
    if (instance && guardianCardId === instance.cardId) {
      setGuardianCardId(null);
    }
    
    const newDeck = [...deckCards];
    newDeck[slotIndex] = null;
    setDeckCards(newDeck);
  };

  const moveCard = (fromIndex, toIndex) => {
    const newDeck = [...deckCards];
    const temp = newDeck[fromIndex];
    newDeck[fromIndex] = newDeck[toIndex];
    newDeck[toIndex] = temp;
    setDeckCards(newDeck);
  };

  const normalizeType = (value) => {
    if (!value) return '';
    // Remove acentos corretamente
    return value.toString().normalize('NFD').replace(/[ -\u000f]/g, '').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  };

  const resolveType = (data) => {
    if (!data || data.type === undefined) return '';
    const raw = typeof data.type === 'object' ? data.type[langKey] || data.type.pt || data.type.en || '' : data.type;
    return normalizeType(raw);
  };

  const libraryCards = useMemo(() => {
    const ownedCardIds = (cardCollection && typeof cardCollection === 'object') ? Object.keys(cardCollection) : [];
    const isFieldCardById = (id) => {
      if (!id) return false;
      const s = String(id).toLowerCase();
      return /^f\d{3}$/i.test(id) || s.startsWith('field_');
    };
    let cards = ownedCardIds
      .filter(id => id)
      .map((id) => {
        const data = id ? getCardData(id) : null;
        if (!id || !data) return null;
        return { id, data };
      })
      .filter((c) => c && c.id && c.data);
    if (searchTerm) {
      cards = cards.filter((c) => {
        const name = typeof c.data.name === 'object' ? c.data.name[langKey] : c.data.name;
        return name && name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    if (elementFilter !== 'all') {
      cards = cards.filter((c) => c.data.element === elementFilter);
    }
    if (typeFilter !== 'all') {
      if (typeFilter === 'effect') {
        cards = cards.filter((c) => c.data?.type === 'effect');
      } else if (typeFilter === 'campo') {
        cards = cards.filter((c) => {
          const typeNorm = normalizeType(resolveType(c.data));
          const categoryNorm = normalizeType(c.data?.category);
          return isFieldCardById(c.id) || typeNorm === 'campo' || categoryNorm === 'campo' || typeNorm === 'field' || categoryNorm === 'field';
        });
      } else {
        cards = cards.filter((c) => resolveType(c.data) === typeFilter);
      }
    }
    cards.sort((a, b) => {
      const aName = typeof a.data.name === 'object' ? a.data.name[langKey] : a.data.name;
      const bName = typeof b.data.name === 'object' ? b.data.name[langKey] : b.data.name;
      switch (sortBy) {
        case 'name-asc': return aName.localeCompare(bName);
        case 'name-desc': return bName.localeCompare(aName);
        case 'hp-asc': return (a.data.hp || 0) - (b.data.hp || 0);
        case 'hp-desc': return (b.data.hp || 0) - (a.data.hp || 0);
        case 'element': return (a.data.element || '').localeCompare(b.data.element || '');
        default: return 0;
      }
    });
    return Array.isArray(cards) ? cards : [];
  }, [cardCollection, searchTerm, elementFilter, typeFilter, sortBy, langKey, selectedGuardian]);

  const openCardLoadout = (cardId) => {
    const data = getCardData(cardId);
    if (!data) return;
    setEditingCardId(cardId);
    setEditingCardData(data);
    const existing = loadGuardianLoadout ? loadGuardianLoadout(cardId) : null;
    setEditingSelectedSkills(existing?.selectedSkills || [null, null]);
    setEditingSelectedPerk(existing?.selectedPerk || null);
    setShowCardLoadoutModal(true);
  };

  const saveCardLoadout = () => {
    if (saveGuardianLoadout && editingCardId) {
      saveGuardianLoadout(editingCardId, {
        selectedSkills: editingSelectedSkills.filter(Boolean).slice(0, 2),
        selectedPerk: editingSelectedPerk || null,
      });
    }
    setShowCardLoadoutModal(false);
    setEditingCardId(null);
    setEditingCardData(null);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedRef.current = { name: deckName, cards: deckCards };
      return;
    }
    const hasChanges = lastSavedRef.current.name !== deckName || JSON.stringify(lastSavedRef.current.cards) !== JSON.stringify(deckCards);
    if (!hasChanges) return;
    const timer = setTimeout(() => {
      if (onSave) {
        onSave({ id: deckId, name: deckName, guardianId: selectedGuardian, cards: deckCards });
        lastSavedRef.current = { name: deckName, cards: deckCards };
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [deckCards, deckName, deckId, selectedGuardian, onSave]);

  useEffect(() => {
    if (guardianId !== selectedGuardian) {
      setSelectedGuardian(guardianId);
      if (guardianId && getCardInstances) {
        const guardianInstances = getCardInstances(guardianId);
        if (guardianInstances && guardianInstances.length > 0) {
          const holoInstance = guardianInstances.find(inst => inst.isHolo);
          const bestInstance = holoInstance || guardianInstances[0];
          setDeckCards(prevCards => {
            const newCards = [...prevCards];
            newCards[0] = bestInstance.instanceId;
            return newCards;
          });
        }
      }
    }
  }, [guardianId, getCardInstances]);

  const handleDragStart = (e, cardIdOrInstanceId, fromSlot = false, instanceId = null) => {
    if (fromSlot) {
      setDraggedCardId(cardIdOrInstanceId);
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('cardId', cardIdOrInstanceId);
      e.dataTransfer.setData('instanceId', instanceId || cardIdOrInstanceId);
      e.dataTransfer.setData('fromSlot', 'true');
    } else if (canAddCard(cardIdOrInstanceId)) {
      setDraggedCardId(cardIdOrInstanceId);
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('cardId', cardIdOrInstanceId);
      e.dataTransfer.setData('fromSlot', 'false');
    } else {
      e.preventDefault();
    }
  };

  const handleDragOver = (e, slotIndex) => {
    e.preventDefault();
    setDragOverSlot(slotIndex);
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const instanceId = e.dataTransfer.getData('instanceId');
    const fromSlot = e.dataTransfer.getData('fromSlot') === 'true';
    if (fromSlot && instanceId) {
      const fromIndex = deckCards.findIndex((id) => id === instanceId);
      if (fromIndex !== -1) {
        moveCard(fromIndex, slotIndex);
      }
    } else if (!fromSlot && cardId) {
      addCardToDeck(cardId, slotIndex);
    }
    setDraggedCardId(null);
    setDragOverSlot(null);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverSlot(null);
  };

  const cardCount = deckCards.filter((id) => id).length;

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select?.();
    }
  }, [editingName]);

  const toggleGuardian = (cardId) => {
    if (guardianCardId === cardId) {
      setGuardianCardId(null);
    } else {
      setGuardianCardId(cardId);
    }
  };

  const handleSaveName = () => {
    setEditingName(false);
    if (onSave) {
      onSave({ id: deckId, name: deckName, guardianId: guardianCardId, cards: deckCards });
      lastSavedRef.current = { name: deckName, cards: deckCards };
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 1500);
    }
  };

  return (
    <div className="deck-editor-overlay" onClick={onClose}>
      <div className="deck-editor-modal" onClick={(e) => e.stopPropagation()}>
        <audio ref={successSoundRef} src={sphereMenuSound} preload="auto" />
        <audio ref={errorSoundRef} src={packageSound} preload="auto" />
        <div className="deck-editor-header">
          <div className="deck-editor-title-group">
            <input
              ref={nameInputRef}
              type="text"
              className={`deck-editor-title${editingName ? '' : ' readonly'}`}
              value={deckName}
              onChange={e => setDeckName(e.target.value)}
              onKeyDown={(e) => { if (editingName && e.key === 'Enter') handleSaveName(); }}
              placeholder="Nome do Deck"
              readOnly={!editingName}
            />
            {!editingName ? (
              <button className="deck-editor-append-btn deck-editor-edit" onClick={() => setEditingName(true)}>Editar</button>
            ) : (
              <button className="deck-editor-append-btn deck-editor-save" onClick={handleSaveName}>Salvar</button>
            )}
          </div>
          <div className="deck-editor-counter">{cardCount}/20 cartas</div>
          <button className="deck-editor-close" onClick={() => {
            if (cardCount < 20) {
              setShowDeckIncompleteWarning(true);
            } else {
              onClose?.();
            }
          }}>✕</button>
        </div>
        <div className="deck-editor-slots-container">
          <div className="deck-editor-slots-grid">
            {Array.from({ length: 20 }).map((_, idx) => {
              const instanceId = deckCards[idx];
              const instance = instanceId ? getInstanceById(instanceId) : null;
              const cardData = instance ? getCardData(instance.cardId) : null;
              const isDragOver = dragOverSlot === idx;
              const canDrop = draggedCardId && (canAddCard(draggedCardId) || deckCards.some(id => { const inst = getInstanceById(id); return inst && inst.cardId === draggedCardId; }));
              return (
                <div key={idx} className={`card-slot ${cardData ? 'filled' : 'empty'} ${isDragOver ? (canDrop ? 'drag-over-valid' : 'drag-over-invalid') : ''}`} onDragOver={(e) => handleDragOver(e, idx)} onDrop={(e) => handleDrop(e, idx)} onDragLeave={() => setDragOverSlot(null)}>
                  {cardData ? (
                    <>
                    <div className="card-slot-card" draggable onDragStart={(e) => handleDragStart(e, instance.cardId, true, instanceId)} onDragEnd={handleDragEnd}>
                      {cardData.id === 'f001' ? (
                        <div className="slider-card-wrapper active" style={{ transform: 'scale(0.33)', transformOrigin: 'center', pointerEvents: 'none' }}>
                          <div className="card-preview card-preview-field">
                            <div className="card-preview-header">
                              <span className="card-preview-name">Campo em Reuínas</span>
                              <span className="card-preview-id">#f001</span>
                            </div>
                            <div className="card-preview-art-wrapper">
                              <img alt="Campo em Reuínas" className="card-preview-art" src={require(`../assets/${cardData.image}`)} />
                            </div>
                            <div className="card-preview-field-desc">
                              <strong>Descrição:</strong>
                              <div style={{whiteSpace: 'pre-line'}}>Energias ancestrais despertam e fortalecem monstros e seres puros. Apenas os dignos sentirão o poder fluir sob seus pés.</div>
                              <div className="card-preview-field-effects">
                                <strong>Efeitos:</strong>
                                <ul>
                                  <li>Criaturas do elemento <b>puro</b>: +1 Dano / +1 HP</li>
                                  <li>Criaturas do tipo <b>monstro</b>: +1 Dano / +1 HP</li>
                                  <li><b>Puras e Monstros</b>: +2 Dano / +2 HP</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ transform: 'scale(0.33)', transformOrigin: 'center', pointerEvents: 'none' }}>
                          <CreatureCardPreview creature={cardData} onClose={null} level={instance.level || 1} isHolo={instance.isHolo || false} allowFlip={false} />
                        </div>
                      )}
                    </div>
                    {/* Ações: ícones Coroa + Editar + Remover lado a lado (visíveis apenas no hover) */}
                    <div className="card-slot-actions">
                      {(() => {
                        const isField = cardData.id === 'f001' || /^f\d{3}$/i.test(cardData.id) || (cardData.category && String(cardData.category).toLowerCase().includes('campo'));
                        const isEffect = (cardData.category && String(cardData.category).toLowerCase().includes('efeito'))
                          || cardData.type === 'effect'
                          || String(instance.cardId).toLowerCase().startsWith('effect_');
                        const isGuardian = guardianCardId === instance.cardId;
                        const canBeGuardian = cardData.isGuardian === true && !isField && !isEffect;
                        const showGuardianButton = !isField && !isEffect;
                        return (
                          <>
                            {showGuardianButton && (
                              <button
                                className={`deck-action-btn deck-action-guardian ${isGuardian ? 'active' : ''}`}
                                disabled={!canBeGuardian}
                                onClick={(e) => { e.stopPropagation(); if (canBeGuardian) toggleGuardian(instance.cardId); }}
                                title={!canBeGuardian ? 'Apenas criaturas guardiãs podem ser selecionadas' : (isGuardian ? 'Remover como guardião' : 'Definir como guardião')}
                              >
                                👑
                              </button>
                            )}
                            {!isField && !isEffect && (
                              <button
                                className="deck-action-btn deck-action-edit"
                                onClick={(e) => { e.stopPropagation(); openCardLoadout(instance.cardId); }}
                                title="Editar habilidades"
                              >
                                ✎
                              </button>
                            )}
                          </>
                        );
                      })()}
                      <button
                        className="deck-action-btn deck-action-remove"
                        onClick={(e) => { e.stopPropagation(); removeCardFromDeck(idx); }}
                        title="Remover do deck"
                      >
                        −
                      </button>
                    </div>
                    </>
                  ) : (
                    <div className="card-slot-placeholder"><span className="card-slot-plus">+</span></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="deck-library-filters">
          <input type="text" className="deck-library-search" placeholder="Buscar carta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="deck-library-element-filters">
            <button className={`element-filter-btn ${elementFilter === 'all' ? 'active' : ''}`} onClick={() => setElementFilter('all')}>Todos</button>
            <button className={`element-filter-btn ${elementFilter === 'fogo' ? 'active' : ''}`} onClick={() => setElementFilter('fogo')}><img src={fogoIcon} alt="Fogo" /></button>
            <button className={`element-filter-btn ${elementFilter === 'agua' ? 'active' : ''}`} onClick={() => setElementFilter('agua')}><img src={aguaIcon} alt="Água" /></button>
            <button className={`element-filter-btn ${elementFilter === 'terra' ? 'active' : ''}`} onClick={() => setElementFilter('terra')}><img src={terraIcon} alt="Terra" /></button>
            <button className={`element-filter-btn ${elementFilter === 'ar' ? 'active' : ''}`} onClick={() => setElementFilter('ar')}><img src={arIcon} alt="Ar" /></button>
            <button className={`element-filter-btn ${elementFilter === 'puro' ? 'active' : ''}`} onClick={() => setElementFilter('puro')}><img src={puroIcon} alt="Puro" /></button>
          </div>
          <select className="deck-library-sort" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Tipo</option>
            <option value="effect">Efeito</option>
            <option value="campo">Campo</option>
            <option value="mistica">Mística</option>
            <option value="sombria">Sombria</option>
            <option value="draconideo">Draconídeo</option>
            <option value="ave">Ave</option>
            <option value="fera">Fera</option>
            <option value="monstro">Monstro</option>
            <option value="reptiloide">Reptiloide</option>
          </select>
          <select className="deck-library-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name-asc">Nome A-Z</option>
            <option value="name-desc">Nome Z-A</option>
            <option value="hp-asc">HP Crescente</option>
            <option value="hp-desc">HP Decrescente</option>
            <option value="element">Elemento</option>
          </select>
        </div>
        <DeckLibraryGrid
          cards={Array.isArray(libraryCards) ? libraryCards : []}
          getCardInstances={getCardInstances}
          getAvailableInstances={getAvailableInstances}
          countCardInDeck={countCardInDeck}
          getBestAvailableInstance={getBestAvailableInstance}
          draggedCardId={draggedCardId}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          openCardLoadout={openCardLoadout}
          addCardToDeck={addCardToDeck}
          setHoveredCard={setHoveredCard}
          setHoveredCardId={setHoveredCardId}
          setHoveredCardForInstances={setHoveredCardForInstances}
          setTooltipPosition={setTooltipPosition}
        />
        {hoveredCardForInstances && (
          <div className="instances-tooltip" style={{ position: 'fixed', left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px`, zIndex: 9999 }}>
            <div className="instances-tooltip-header"><strong>Cópias Disponíveis</strong><span className="instances-tooltip-count">{getCardInstances(hoveredCardForInstances).length} cópias</span></div>
            <div className="instances-tooltip-list">{getCardInstances(hoveredCardForInstances).sort((a, b) => { if (b.level !== a.level) return b.level - a.level; return b.xp - a.xp; }).map((instance, idx) => (<div key={instance.instanceId} className="instances-tooltip-item"><span className="instance-copy-number">#{idx + 1}</span><span className="instance-level">Nv. {instance.level}</span><span className="instance-xp">{instance.xp} XP</span>{instance.isHolo && <span className="instance-holo-badge">✨ Holo</span>}</div>))}</div>
            <div className="instances-tooltip-hint">Clique para selecionar qual usar</div>
          </div>
        )}
        {/* Ghost/hover preview removido para não atrapalhar o fluxo no deckbuilder */}
        {showSavedToast && <div className="deck-saved-toast">✓ Salvo</div>}
        {showDeckIncompleteWarning && (
          <div
            className="loadout-modal-overlay"
            onClick={() => setShowDeckIncompleteWarning(false)}
          >
            <div
              className="loadout-modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '420px', padding: '32px', textAlign: 'center' }}
            >
              <h2
                style={{
                  color: '#f6e8ff',
                  marginBottom: '16px',
                  fontSize: '20px',
                  fontWeight: '700',
                }}
              >
                ⚠️ Deck Incompleto
              </h2>

              <p
                style={{
                  color: '#cbb9f2',
                  marginBottom: '24px',
                  fontSize: '15px',
                  lineHeight: '1.6',
                }}
              >
                Seu deck precisa ter exatamente <strong>20 cartas</strong> para ser finalizado.
                <br />
                Atualmente você tem: <strong>{cardCount} cartas</strong>
              </p>

              <button
                onClick={() => setShowDeckIncompleteWarning(false)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '8px',
                  border: '2px solid rgba(144, 97, 249, 0.6)',
                  background: 'linear-gradient(135deg, rgba(144, 97, 249, 0.2), rgba(122, 90, 248, 0.15))',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(144, 97, 249, 0.4), rgba(122, 90, 248, 0.3))';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(144, 97, 249, 0.2), rgba(122, 90, 248, 0.15))';
                }}
              >
                Voltar ao Deck
              </button>
            </div>
          </div>
        )}
        {showInstanceSelector && selectedCardForInstance && (
          <CardInstanceSelector cardId={selectedCardForInstance} cardData={getCardData(selectedCardForInstance)} instances={getAvailableInstances(selectedCardForInstance)} onSelect={handleInstanceSelected} onClose={() => setShowInstanceSelector(false)} title={lang === 'ptbr' ? 'Selecione uma cópia para o deck' : 'Select a card copy for deck'} lang={lang} />
        )}

        {/* Modal de Loadout para Criatura */}
        {showCardLoadoutModal && editingCardData && editingCardId && (
          <div className="loadout-modal-overlay" onClick={() => setShowCardLoadoutModal(false)}>
            <div className="loadout-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="loadout-modal-close" onClick={() => setShowCardLoadoutModal(false)}>✕</button>
              <div className="loadout-modal-body">
                {/* Carta à esquerda */}
                <div className="loadout-modal-left">
                  <div className="loadout-card-block">
                    <div className="loadout-card-scale">
                      {(() => {
                        // Preview com habilidades selecionadas (mantendo todos os campos da skill original)
                        const skillsPool = [
                          ...(Array.isArray(editingCardData.defaultSkills)
                              ? editingCardData.defaultSkills
                              : (Array.isArray(editingCardData.abilities) ? editingCardData.abilities : [])),
                          ...(Array.isArray(editingCardData.unlockTable) ? editingCardData.unlockTable.filter(x => x.type === 'skill') : []),
                        ];
                        const selectedAbilities = editingSelectedSkills
                          .filter(Boolean)
                          .map((skillId) => {
                            // Só considera habilidades que ainda existem no pool
                            const s = skillsPool.find((x) => x.id === skillId);
                            if (!s) return null;
                            return {
                              ...s,
                              desc: s.displayText || s.desc,
                            };
                          })
                          .filter(Boolean);
                        const creaturePreviewData = {
                          ...editingCardData,
                          abilities: selectedAbilities.length > 0
                            ? selectedAbilities
                            : (Array.isArray(editingCardData.defaultSkills)
                                ? editingCardData.defaultSkills.slice(0, 2)
                                : (Array.isArray(editingCardData.abilities) ? editingCardData.abilities.slice(0, 2) : [])),
                        };
                        return (
                          <CreatureCardPreview creature={creaturePreviewData} onClose={null} level={1} isHolo={false} allowFlip />
                        );
                      })()}
                    </div>
                  </div>
                </div>
                {/* Lista de habilidades à direita */}
                <div className="loadout-modal-right">
                  <div className="loadout-modal-header">
                    <h3>Configurar Carta</h3>
                  </div>
                  {(() => {
                    const unlocks = [];
                    const seen = new Set();
                    const pushSkill = (skill, level = 0, isDefault = false) => {
                      if (!skill?.id || seen.has(skill.id)) return;
                      unlocks.push({
                        level,
                        type: 'skill',
                        id: skill.id,
                        name: skill.name,
                        desc: skill.desc,
                        displayText: skill.displayText,
                        cost: skill.cost || 1,
                        isDefault,
                      });
                      seen.add(skill.id);
                    };
                    const pushPerk = (perkUnlock) => {
                      if (!perkUnlock?.id || seen.has(perkUnlock.id)) return;
                      unlocks.push({
                        level: perkUnlock.level,
                        type: 'perk',
                        id: perkUnlock.id,
                        name: PERK_DATA[perkUnlock.id]?.name || perkUnlock.name || { pt: 'Perk', en: 'Perk' },
                        desc: PERK_DATA[perkUnlock.id]?.desc || perkUnlock.desc || { pt: '', en: '' },
                        displayText: perkUnlock.displayText,
                      });
                      seen.add(perkUnlock.id);
                    };
                    // Default skills nível 0
                    (editingCardData.defaultSkills || []).forEach((s) => pushSkill(s, 0, true));
                    // unlockTable skills/perks
                    (editingCardData.unlockTable || []).forEach((u) => {
                      if (u.type === 'skill') pushSkill(u, u.level, false);
                      else if (u.type === 'perk') pushPerk(u);
                    });
                    unlocks.sort((a, b) => a.level - b.level);

                    const instances = getCardInstances(editingCardId) || [];
                    const maxLevel = instances.length > 0 ? Math.max(...instances.map(i => i.level || 0)) : 0;

                    return (
                      <>
                        <div className="loadout-section">
                          <div className="loadout-section-header">
                            <div className="loadout-section-label">
                              Habilidades e Perks (Escolha 2 habilidades + 1 perk)
                            </div>
                            <div className="loadout-selected-count">
                              Habilidades: {editingSelectedSkills.filter((s) => s).length}/2 | Perk: {editingSelectedPerk ? '1/1' : '0/1'}
                            </div>
                          </div>
                          <div className="loadout-skill-scroll">
                            {unlocks.map((unlock, idx) => {
                              const isUnlocked = (typeof unlock.level !== 'number') || (unlock.level <= maxLevel);
                              const isSkill = unlock.type === 'skill';
                              const isPerk = unlock.type === 'perk';
                              const isSkillSelected = isSkill && editingSelectedSkills.includes(unlock.id);
                              const isPerkSelected = isPerk && editingSelectedPerk === unlock.id;
                              const isSelected = isSkillSelected || isPerkSelected;
                              return (
                                <div
                                  key={idx}
                                  className={`loadout-skill-item ${!isUnlocked ? 'locked' : ''} ${isSelected ? 'selected' : ''} ${isPerk ? 'perk' : ''}`}
                                  onClick={() => {
                                    if (!isUnlocked) return;
                                    if (isSkill) {
                                      if (isSkillSelected) {
                                        setEditingSelectedSkills(editingSelectedSkills.map((s) => s === unlock.id ? null : s));
                                      } else if (editingSelectedSkills.filter(Boolean).length < 2) {
                                        const next = [...editingSelectedSkills];
                                        const emptyIdx = next.findIndex((s) => !s);
                                        next[emptyIdx] = unlock.id;
                                        setEditingSelectedSkills(next);
                                      }
                                    } else if (isPerk) {
                                      setEditingSelectedPerk(isPerkSelected ? null : unlock.id);
                                    }
                                  }}
                                >
                                  <div className="loadout-skill-level">Nv. {unlock.level ?? 0}</div>
                                  <div className="loadout-skill-name">
                                    {getName(unlock.name, lang)}
                                    {isSkill && (<span className="loadout-skill-badge"> [HABILIDADE]</span>)}
                                    {isPerk && (<span className="loadout-perk-badge"> [PERK]</span>)}
                                  </div>
                                  <div className="loadout-skill-desc">
                                    {unlock.displayText ? renderDisplayText(unlock.displayText, langKey) : getName(unlock.desc, lang)}
                                  </div>
                                  {isSkill && unlock.cost && (
                                    <div className="loadout-skill-cost">
                                      {[...Array(unlock.cost)].map((_, i) => (
                                        <img key={i} src={soulEssence} alt="Essência" className="loadout-essence-icon" />
                                      ))}
                                    </div>
                                  )}
                                  {!isUnlocked && (<div className="loadout-skill-locked">🔒</div>)}
                                  {isSelected && (<div className="loadout-skill-check">✓</div>)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <button className="loadout-save-btn" onClick={saveCardLoadout}>Salvar Configuração</button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeckEditor;
