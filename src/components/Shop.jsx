import React, { useContext, useState, useRef } from 'react';
import '../styles/shop.css';
import pageFlipSound from '../assets/sounds/effects/page-flip.mp3';
import movingTableSound from '../assets/sounds/effects/moving-table.mp3';
import background3D from '../assets/img/wallpaper/3d-menu-shop.png';
import coinIcon from '../assets/img/icons/head.png';
import { AppContext } from '../context/AppContext';

const SHOP_PRODUCTS = [
  {
    id: 'booster_1',
    name: { pt: 'Booster Individual', en: 'Single Booster' },
    description: { pt: '5 cartas aleatórias', en: '5 random cards' },
    quantity: 1,
    price: 150,
    image: require('../assets/img/card/verso.png'),
  },
  {
    id: 'booster_5',
    name: { pt: 'Pack 5 Boosters', en: '5 Booster Pack' },
    description: { pt: '25 cartas aleatórias', en: '25 random cards' },
    quantity: 5,
    price: 700,
    discount: 7,
    image: require('../assets/img/card/verso.png'),
  },
  {
    id: 'booster_10',
    name: { pt: 'Pack 10 Boosters', en: '10 Booster Pack' },
    description: { pt: '50 cartas aleatórias', en: '50 random cards' },
    quantity: 10,
    price: 1300,
    discount: 13,
    image: require('../assets/img/card/verso.png'),
  },
];

function Shop({ onBack }) {
  const { coins, boosters, purchaseBooster, lang, effectsVolume } = useContext(AppContext);
  const [selectedProduct, setSelectedProduct] = useState(SHOP_PRODUCTS[0]);
  const [isFading, setIsFading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const pageFlipAudioRef = useRef(null);
  const movingAudioRef = useRef(null);

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

    const success = purchaseBooster(selectedProduct.quantity, selectedProduct.price);

    if (success) {
      setPurchaseSuccess(true);
      setTimeout(() => setPurchaseSuccess(false), 2000);
    } else {
      // Moedas insuficientes - pode adicionar feedback visual aqui
      console.log('Moedas insuficientes!');
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
                </div>
                <div className="preview-product-info">
                  <h2 className="preview-product-name">
                    {selectedProduct.name[currentLang]}
                  </h2>
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
                className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                onClick={() => handleProductClick(product)}
              >
                <div className="product-card-image">
                  <img src={product.image} alt={product.name[currentLang]} />
                  {product.discount && (
                    <div className="product-discount-badge">
                      -{product.discount}%
                    </div>
                  )}
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

      {/* Áudios */}
      <audio ref={pageFlipAudioRef} src={pageFlipSound} />
      <audio ref={movingAudioRef} src={movingTableSound} />
    </div>
  );
}

export default Shop;
