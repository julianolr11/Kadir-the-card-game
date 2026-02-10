import React, { useEffect, useState } from 'react';
import '../styles/splash.css';

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Listener para pular com ESC ou Click
    const handleSkip = (e) => {
      if (e.key === 'Escape' || e.type === 'click') {
        skip();
      }
    };

    const skip = () => {
      setFadeOut(true);
      setTimeout(() => {
        onFinish();
      }, 500); // Tempo do fade out
    };

    // Timer automático de 5 segundos
    const timer = setTimeout(() => {
      skip();
    }, 5000);

    // Adiciona listeners
    window.addEventListener('keydown', handleSkip);
    document.addEventListener('click', handleSkip);

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleSkip);
      document.removeEventListener('click', handleSkip);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <video
        className="splash-video"
        src={require('../assets/img/wallpaper/Rastro.mp4')}
        autoPlay
        muted
        playsInline
      />
      <div className="splash-skip-hint">
        <span>Clique ou pressione ESC para pular</span>
      </div>
    </div>
  );
}
