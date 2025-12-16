import React, { useContext } from 'react';
import '../styles/homescreen.css';

import { AppContext } from '../context/AppContext';

const HomeScreen = ({ onNavigate }) => {
  const { activeGuardian } = useContext(AppContext);
  return (
    <div className="home-screen">
      <main className="home-main">
        <h1 className="home-title">Kadir Card Game</h1>
        <div className="deck-btn-center-group">
          <button
            className={`deck-btn${activeGuardian && activeGuardian.element ? ` deck-btn-${activeGuardian.element}` : ''}`}
            onClick={() => onNavigate('deck')}
            style={{
              backgroundImage: activeGuardian?.img ? `url(${activeGuardian.img})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow:
                activeGuardian?.element === 'agua'
                  ? '0 0 48px 16px #00cfff, 0 0 32px 8px #00eaff inset, 0 0 0 8px #00eaff80, 0 0 32px 16px #00cfff80, 0 0 64px 24px 8px #00eaff, 0 0 0 12px #00cfff, 0 0 0 0px #00eaff, 0 0 0 0px #00cfff, 0 0 0 0px #00eaff, 0 0 0 0px #00cfff'
                  : activeGuardian?.element === 'terra'
                  ? '0 0 48px 16px #4caf50, 0 0 32px 8px #e2c290 inset, 0 0 0 8px #e2c29080, 0 0 32px 16px #4caf5080, 0 0 64px 24px 8px #e2c290, 0 0 0 12px #4caf50, 0 0 0 0px #e2c290, 0 0 0 0px #4caf50, 0 0 0 0px #e2c290, 0 0 0 0px #4caf50'
                  : activeGuardian?.element === 'fire'
                  ? '0 0 48px 16px #ff3c00, 0 0 32px 8px #ffb347 inset, 0 0 0 8px #ffb34780, 0 0 32px 16px #ff3c0080, 0 0 64px 24px 8px #ffb347, 0 0 0 12px #ff3c00, 0 0 0 0px #ffb347, 0 0 0 0px #ff3c00, 0 0 0 0px #ffb347, 0 0 0 0px #ff3c00'
                  : activeGuardian?.element === 'ar'
                  ? '0 0 48px 16px #b388ff, 0 0 32px 8px #b0e6ff inset, 0 0 0 8px #b388ff80, 0 0 32px 16px #b0e6ff80, 0 0 64px 24px 8px #b388ff, 0 0 0 12px #b0e6ff, 0 0 0 0px #b388ff, 0 0 0 0px #b0e6ff, 0 0 0 0px #b388ff, 0 0 0 0px #b0e6ff'
                  : activeGuardian?.element === 'puro'
                  ? '0 0 48px 16px #fff6b0, 0 0 32px 8px #fff6b0 inset, 0 0 0 8px #fff6b080, 0 0 32px 16px #fff6b080, 0 0 64px 24px 8px #fff6b0, 0 0 0 12px #fffde4, 0 0 0 0px #fff6b0, 0 0 0 0px #fffde4, 0 0 0 0px #fff6b0, 0 0 0 0px #fffde4'
                  : undefined,
            }}
          >
            <span className="deck-btn-label">Deck</span>
          </button>
        </div>
        <div className="home-btn-group home-btn-group-bottom">
          <button className="home-btn" onClick={() => onNavigate('iniciar')}>Iniciar</button>
          <button className="home-btn" onClick={() => onNavigate('opcoes')}>Opções</button>
          <button className="home-btn" onClick={() => onNavigate('sair')}>Sair</button>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
