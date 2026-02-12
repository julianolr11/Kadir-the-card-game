import React, { useContext, useState, useRef, useEffect } from 'react';
import '../styles/shop.css';
import pageFlipSound from '../assets/sounds/effects/page-flip.mp3';
import movingTableSound from '../assets/sounds/effects/moving-table.mp3';
import background3D from '../assets/img/wallpaper/3d-menu-shop.png';
import coinIcon from '../assets/img/icons/head.png';
import cardVerso from '../assets/img/card/verso.png';
import { AppContext } from '../context/AppContext';
import { getCreaturesByRarity, RARITY_TIERS, RARITY_CONFIG } from '../assets/rarityData';
import creaturePool from '../assets/cards';
import CreatureCardPreview from './CreatureCardPreview';

const SHOP_PRODUCTS = [
  {
    id: 'booster_1',
    name: { pt: 'Booster Individual', en: 'Single Booster' },
    description: { pt: '5 cartas aleatórias', en: '5 random cards' },
    quantity: 1,
    price: 150,
    image: require('../assets/img/card/booster.png'),
    type: 'booster',
  },
  {
    id: 'booster_5',
    name: { pt: 'Pack 5 Boosters', en: '5 Booster Pack' },
    description: { pt: '25 cartas aleatórias', en: '25 random cards' },
    quantity: 5,
    price: 700,
    discount: 7,
    image: require('../assets/img/card/booster.png'),
    type: 'booster',
  },
  {
    id: 'booster_10',
    name: { pt: 'Pack 10 Boosters', en: '10 Booster Pack' },
    description: { pt: '50 cartas aleatórias', en: '50 random cards' },
    quantity: 10,
    price: 1300,
    discount: 13,
    image: require('../assets/img/card/booster.png'),
    type: 'booster',
  },
  {
    id: 'card_common',
    name: { pt: 'Carta Comum', en: 'Common Card' },
    description: { pt: '1 carta comum aleatória', en: '1 random common card' },
    price: 50,
    image: require('../assets/img/card/verso.png'),
    type: 'rarity',
    rarity: RARITY_TIERS.COMMON,
    rarityColor: RARITY_CONFIG.common.color,
  },
  {
    id: 'card_uncommon',
    name: { pt: 'Carta Incomum', en: 'Uncommon Card' },
    description: { pt: '1 carta incomum aleatória', en: '1 random uncommon card' },
    price: 100,
    image: require('../assets/img/card/verso.png'),
    type: 'rarity',
    rarity: RARITY_TIERS.UNCOMMON,
    rarityColor: RARITY_CONFIG.uncommon.color,
  },
  {
    id: 'card_rare',
    name: { pt: 'Carta Rara', en: 'Rare Card' },
    description: { pt: '1 carta rara aleatória', en: '1 random rare card' },
    price: 200,
    image: require('../assets/img/card/verso.png'),
    type: 'rarity',
    rarity: RARITY_TIERS.RARE,
    rarityColor: RARITY_CONFIG.rare.color,
  },
  {
    id: 'card_epic',
    name: { pt: 'Carta Épica', en: 'Epic Card' },
    description: { pt: '1 carta épica aleatória', en: '1 random epic card' },
    price: 400,
    image: require('../assets/img/card/verso.png'),
    type: 'rarity',
    rarity: RARITY_TIERS.EPIC,
    rarityColor: RARITY_CONFIG.epic.color,
  },
  {
    id: 'card_legendary',
    name: { pt: 'Carta Lendária', en: 'Legendary Card' },
    description: { pt: '1 carta lendária aleatória', en: '1 random legendary card' },
    price: 800,
    image: require('../assets/img/card/verso.png'),
    type: 'rarity',
    rarity: RARITY_TIERS.LEGENDARY,
    rarityColor: RARITY_CONFIG.legendary.color,
  },
];

function Shop({ onBack }) {
  const { coins, boosters, purchaseBooster, addCardsFromBooster, spendCoins, lang, effectsVolume } = useContext(AppContext);
  const [selectedProduct, setSelectedProduct] = useState(SHOP_PRODUCTS[0]);
  const [isFading, setIsFading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [revealingCard, setRevealingCard] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const pageFlipAudioRef = useRef(null);
  const movingAudioRef = useRef(null);

  // Debug helper: expõe uma função global para abrir o modal de revelação
  useEffect(() => {
    // window.openCardReveal(opts) -> opts: { id, isHolo, rarity, rarityColor, keepOpen, flipNow }
    // keepOpen: true  -> não fecha o modal automaticamente
    window.openCardReveal = (opts = {}) => {
      const { id, isHolo = false, keepOpen = false, flipNow = true } = opts;
      // escolhe aleatória se não informado
      let creatureId = id;
      if (!creatureId) {
        const keys = Object.keys(creaturePool || {});
        if (!keys.length) return console.warn('creaturePool vazio');
        creatureId = keys[Math.floor(Math.random() * keys.length)];
      }

      const creatureData = creaturePool[creatureId];
      if (!creatureData) return console.warn('creature not found', creatureId);

      setRevealingCard({
        id: creatureId,
        data: creatureData,
        isHolo,
        rarity: opts.rarity || RARITY_TIERS.COMMON,
        rarityColor: opts.rarityColor || (opts.rarity ? (RARITY_CONFIG[opts.rarity.toLowerCase()]?.color) : RARITY_CONFIG.common.color)
      });

      // Se keepOpen for true, não auto-fecha; ainda aplicamos ações úteis
      if (keepOpen) {
        // opcional: aplica flip automático se desejado pelo chamador
        if (flipNow) setTimeout(() => setIsFlipping(true), 150);
        // adiciona a carta à coleção imediatamente (pode ser desejado)
        try { addCardsFromBooster([{ id: creatureId, isHolo }]); } catch (e) { /* ignore */ }
        return; // não agenda fechamento automático
      }

      // sequência curta para debug (verso rápido, flip, mostrar frente, fechar)
      setTimeout(() => setIsFlipping(true), 150);
      setTimeout(() => addCardsFromBooster([{ id: creatureId, isHolo }]), 700);
      setTimeout(() => { setRevealingCard(null); setIsFlipping(false); }, 2500);
    };

    // Funções globais para forçar mostrar verso ou frente via console
    const injectStyle = (id, css) => {
      let s = document.getElementById(id);
      if (!s) {
        s = document.createElement('style');
        s.id = id;
        s.type = 'text/css';
        s.innerHTML = css;
        document.head.appendChild(s);
      }
    };

    const removeStyle = (id) => {
      const s = document.getElementById(id);
      if (s) s.remove();
    };

    window.forceShowCardBack = (enable = true) => {
      if (enable) {
        injectStyle('force-card-back', `
          .card-back { z-index: 20000 !important; backface-visibility: visible !important; }
          .card-front { z-index: 10000 !important; }
          .card-reveal-content { pointer-events: none; }
        `);
      } else {
        removeStyle('force-card-back');
      }
    };

    window.forceShowCardFront = (enable = true) => {
      if (enable) {
        injectStyle('force-card-front', `
          .card-front { z-index: 20000 !important; backface-visibility: visible !important; }
          .card-back { z-index: 10000 !important; }
          .card-reveal-content { pointer-events: none; }
        `);
      } else {
        removeStyle('force-card-front');
      }
    };

    return () => {
      try { delete window.openCardReveal; } catch (e) { window.openCardReveal = undefined; }
      try { delete window.forceShowCardBack; } catch (e) { window.forceShowCardBack = undefined; }
      try { delete window.forceShowCardFront; } catch (e) { window.forceShowCardFront = undefined; }
      // remove injected styles if any
      try { removeStyle('force-card-back'); } catch (e) { }
      try { removeStyle('force-card-front'); } catch (e) { }
    };
  }, [addCardsFromBooster]);

  const currentLang = lang === 'en' ? 'en' : 'pt';

  const handleProductClick = (product) => {
    if (selectedProduct?.id === product.id) return;

    // Sons
    if (pageFlipAudioRef.current) {
      pageFlipAudioRef.current.currentTime = 0;
      pageFlipAudioRef.current.volume = effectsVolume / 100;
      pageFlipAudioRef.current.play().catch(() => {});
    }

    // Fade transition
    setIsFading(true);
    setTimeout(() => {
      setSelectedProduct(product);
      setIsFading(false);
    }, 200);
  };

  const handlePurchase = () => {
    if (!selectedProduct) return;

    // Verifica se tem moedas suficientes
    if (coins < selectedProduct.price) {
      console.log('Moedas insuficientes!');
      return;
    }

    let success = false;

    if (selectedProduct.type === 'booster') {
      // Compra de booster tradicional
      success = purchaseBooster(selectedProduct.quantity, selectedProduct.price);
    } else if (selectedProduct.type === 'rarity') {
      // Compra de carta específica por raridade
      const creaturesOfRarity = getCreaturesByRarity(selectedProduct.rarity);

      if (creaturesOfRarity.length > 0) {
        // Sorteia uma criatura aleatória dessa raridade
        const randomCreature = creaturesOfRarity[Math.floor(Math.random() * creaturesOfRarity.length)];
        const creatureData = creaturePool.find(c => c.id === randomCreature);

        // 5% de chance de ser holo
        const isHolo = Math.random() < 0.05;

        // Remove as moedas
        spendCoins(selectedProduct.price);

        // Mostra animação de revelação
        setRevealingCard({
          id: randomCreature,
          data: creatureData,
          isHolo,
          rarity: selectedProduct.rarity,
          rarityColor: selectedProduct.rarityColor
        });

        // Anima o flip após um delay maior para apreciar o verso
        setTimeout(() => {
          setIsFlipping(true);
        }, 1500);

        // Adiciona a carta à coleção após a animação
        setTimeout(() => {
          addCardsFromBooster([{ id: randomCreature, isHolo }]);
        }, 3500);

        // Fecha o modal após mostrar a carta
        setTimeout(() => {
          setRevealingCard(null);
          setIsFlipping(false);
        }, 5500);

        success = true;
      }
    }

    if (success) {
      setPurchaseSuccess(true);
      setTimeout(() => setPurchaseSuccess(false), 2000);
    }
  };

  const canAfford = selectedProduct && coins >= selectedProduct.price;

  return (
    <div className="shop-container">
      {/* Background */}
      <div
        className="shop-background"
        style={{ backgroundImage: `url(${background3D})` }}
      />

      {/* Botão de Voltar (Direita) */}
      <button
        className="shop-back-btn"
        onClick={onBack}
        onMouseEnter={() => {
          if (movingAudioRef.current) {
            movingAudioRef.current.currentTime = 0;
            movingAudioRef.current.volume = effectsVolume / 100;
            movingAudioRef.current.play().catch(() => {});
          }
        }}
      >
        <span className="shop-back-text">Principal</span>
        <span className="shop-back-arrow">→</span>
      </button>

      {/* Título e Saldo de Moedas */}
      <div className="shop-header">
        <h1 className="shop-title">Loja</h1>
        <div className="shop-coins-display">
          <img src={coinIcon} alt="Moedas" className="coin-icon-large" />
          <span className="coin-amount">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Layout Principal: Preview + Grid de Produtos */}
      <div className="shop-layout">
        {/* Coluna Esquerda: Preview do Produto Selecionado */}
        <div className="shop-preview-column">
          <div className={`shop-preview-card ${isFading ? 'fade-out' : 'fade-in'}`}>
            {selectedProduct && (
              <>
                <div className="preview-image-container">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name[currentLang]}
                    className="preview-product-image"
                  />
                  {selectedProduct.discount && (
                    <div className="preview-discount-badge">
                      -{selectedProduct.discount}%
                    </div>
                  )}
                  {/* rarity badge moved to title area */}
                </div>
                <div className="preview-product-info">
                  {selectedProduct.rarityColor ? (
                    <div
                      className="preview-rarity-title"
                      style={{
                        background: selectedProduct.rarityColor,
                        boxShadow: `0 2px 8px ${selectedProduct.rarityColor}80`
                      }}
                    >
                      {RARITY_CONFIG[selectedProduct.rarity]?.name || selectedProduct.name[currentLang]}
                    </div>
                  ) : (
                    <h2 className="preview-product-name">{selectedProduct.name[currentLang]}</h2>
                  )}
                  <p className="preview-product-description">
                    {selectedProduct.description[currentLang]}
                  </p>
                  <div className="preview-product-price">
                    <img src={coinIcon} alt="Moedas" className="coin-icon-small" />
                    <span className="price-amount">{selectedProduct.price}</span>
                  </div>
                  <button
                    className={`purchase-button ${!canAfford ? 'disabled' : ''} ${purchaseSuccess ? 'success' : ''}`}
                    onClick={handlePurchase}
                    disabled={!canAfford || purchaseSuccess}
                  >
                    {purchaseSuccess ? '✓ Comprado!' : !canAfford ? 'Moedas Insuficientes' : 'Comprar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Coluna Direita: Grid de Produtos */}
        <div className="shop-products-column">
          <div className="shop-products-grid">
            {SHOP_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''} ${product.rarityColor ? 'rarity-card' : ''}`}
                onClick={() => handleProductClick(product)}
                style={product.rarityColor ? {
                  borderColor: product.rarityColor
                } : {}}
              >
                <div className="product-card-image">
                  <img
                    src={product.image}
                    alt={product.name[currentLang]}
                  />
                  {product.discount && (
                    <div className="product-discount-badge">
                      -{product.discount}%
                    </div>
                  )}
                  {/* rarity indicator removed from product card per UI request */}
                </div>
                <div className="product-card-info">
                  <h3 className="product-card-name">{product.name[currentLang]}</h3>
                  <div className="product-card-price">
                    <img src={coinIcon} alt="Moedas" className="coin-icon-small" />
                    <span>{product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Informação de Boosters Atuais */}
      <div className="shop-booster-info">
        <span>Boosters disponíveis: <strong>{boosters}</strong></span>
      </div>

      {/* Modal de Revelação de Carta */}
      {revealingCard && (
        <div className="card-reveal-modal" onClick={() => {
          if (isFlipping) {
            setRevealingCard(null);
            setIsFlipping(false);
          }
        }}>
          <div className="card-reveal-overlay" />
          <div className="card-reveal-content">
            <div className={`card-flip-container ${isFlipping ? 'flipped' : ''}`}>
              {/* Verso da Carta */}
              <div className="card-face card-back">
                <img src={cardVerso} alt="Verso" />
                <div
                  className="card-rarity-glow"
                  style={{
                    boxShadow: `0 0 80px ${revealingCard.rarityColor}, inset 0 0 60px ${revealingCard.rarityColor}60`
                  }}
                />
              </div>

              {/* Frente da Carta */}
              <div className="card-face card-front">
                {revealingCard.data && (
                  <CreatureCardPreview
                    creature={revealingCard.data}
                    level={0}
                    isHolo={revealingCard.isHolo}
                    allowFlip={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Áudios */}
      <audio ref={pageFlipAudioRef} src={pageFlipSound} />
      <audio ref={movingAudioRef} src={movingTableSound} />
    </div>
  );
}

export default Shop;
