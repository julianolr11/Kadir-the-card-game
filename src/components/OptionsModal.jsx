import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/animations.css';

const translations = {
  ptbr: {
    options: 'Opções',
    language: 'Idioma',
    volume: 'Volume',
    resolution: 'Resolução',
    fullscreen: 'Tela cheia',
    apply: 'Aplicar',
    close: 'Fechar',
    portuguese: 'Português (BR)',
    english: 'English',
    res1: '1280x720',
    res2: '1920x1080',
  },
  en: {
    options: 'Options',
    language: 'Language',
    volume: 'Volume',
    resolution: 'Resolution',
    fullscreen: 'Fullscreen',
    apply: 'Apply',
    close: 'Close',
    portuguese: 'Portuguese (BR)',
    english: 'English',
    res1: '1280x720',
    res2: '1920x1080',
  }
};


const OptionsModal = ({ visible, onClose, onApply, initialLang = 'ptbr', initialMusicVolume = 50, initialEffectsVolume = 50, initialFullscreen = false, initialResolution = '1280x720' }) => {
  // Carregar do localStorage se existir
  const getInitial = (key, fallback) => {
    if (typeof window !== 'undefined') {
      const value = localStorage.getItem(key);
      if (value !== null) {
        if (key === 'fullscreen') return value === 'true';
        if (key === 'musicVolume' || key === 'effectsVolume') return Number(value);
        return value;
      }
    }
    return fallback;
  };

  const { lang, setLang, musicVolume, setMusicVolume, effectsVolume, setEffectsVolume } = useContext(AppContext);
  const [localLang, setLocalLang] = useState(() => getInitial('lang', initialLang));
  const [localMusicVolume, setLocalMusicVolume] = useState(() => getInitial('musicVolume', initialMusicVolume));
  const [localEffectsVolume, setLocalEffectsVolume] = useState(() => getInitial('effectsVolume', initialEffectsVolume));
  const [fullscreen, setFullscreen] = useState(() => getInitial('fullscreen', initialFullscreen));
  const [resolution, setResolution] = useState(() => getInitial('resolution', initialResolution));

  const handleLangChange = (e) => setLocalLang(e.target.value);
  const handleMusicVolumeChange = (e) => {
    const value = Number(e.target.value);
    setLocalMusicVolume(value);
    setMusicVolume(value);
    localStorage.setItem('musicVolume', value);
  };
  const handleEffectsVolumeChange = (e) => {
    const value = Number(e.target.value);
    setLocalEffectsVolume(value);
    setEffectsVolume(value);
    localStorage.setItem('effectsVolume', value);
  };

  const handleApply = () => {
    localStorage.setItem('lang', localLang);
    localStorage.setItem('musicVolume', localMusicVolume);
    localStorage.setItem('effectsVolume', localEffectsVolume);
    localStorage.setItem('fullscreen', fullscreen);
    localStorage.setItem('resolution', resolution);
    setLang(localLang);
    setMusicVolume(Number(localMusicVolume));
    setEffectsVolume(Number(localEffectsVolume));
    if (onApply) onApply({ lang: localLang, musicVolume: localMusicVolume, effectsVolume: localEffectsVolume, fullscreen, resolution });
    if (onClose) onClose();
  };

  // Só dispara IPC após interação do usuário (ignora o mount)
  const didMountFullscreen = useRef(false);
  useEffect(() => {
    if (didMountFullscreen.current) {
      if (window.electron && window.electron.ipcRenderer) {
        let width = resolution === '1920x1080' ? 1920 : 1280;
        let height = resolution === '1920x1080' ? 1080 : 720;
        window.electron.ipcRenderer.sendMessage('set-resolution', { width, height, fullscreen });
      }
      if (onApply) onApply({ lang, volume, fullscreen, resolution });
    } else {
      didMountFullscreen.current = true;
    }
  }, [fullscreen]);

  const didMountResolution = useRef(false);
  useEffect(() => {
    if (didMountResolution.current) {
      if (window.electron && window.electron.ipcRenderer) {
        let width = resolution === '1920x1080' ? 1920 : 1280;
        let height = resolution === '1920x1080' ? 1080 : 720;
        window.electron.ipcRenderer.sendMessage('set-resolution', { width, height, fullscreen });
      }
      if (onApply) onApply({ lang, volume, fullscreen, resolution });
    } else {
      didMountResolution.current = true;
    }
  }, [resolution]);

  const labelStyle = {
    color: '#ffe6b0',
    fontWeight: 600,
    fontSize: 15,
    marginBottom: 4,
    display: 'block',
    letterSpacing: 0.2,
  };

  const handleClose = () => {
    if (onClose) onClose();
  };


  if (!visible) return null;

  const t = translations[lang] || translations.ptbr;
  return (
    <div style={modalBgStyle}>
      <div style={modalStyle} className="modal-zoom-in">
        <h2 style={{ color: '#ffe6b0', fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center', letterSpacing: 0.5 }}>{t.options}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>{t.language}</label>
            <select value={localLang} onChange={handleLangChange} style={selectStyle}>
              <option value="ptbr" style={optionStyle}>{t.portuguese}</option>
              <option value="en" style={optionStyle}>{t.english}</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Volume da Música</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="range"
                min={0}
                max={100}
                value={localMusicVolume}
                onChange={handleMusicVolumeChange}
                style={{ ...rangeStyle, width: 270 }}
              />
              <span style={{ minWidth: 32, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#ffe6b0', fontWeight: 600 }}>{localMusicVolume}</span>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Volume dos Efeitos</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="range"
                min={0}
                max={100}
                value={localEffectsVolume}
                onChange={handleEffectsVolumeChange}
                style={{ ...rangeStyle, width: 270 }}
              />
              <span style={{ minWidth: 32, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#ffe6b0', fontWeight: 600 }}>{localEffectsVolume}</span>
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t.resolution}</label>
            <select value={resolution} onChange={e => setResolution(e.target.value)} style={selectStyle}>
              <option value="1280x720" style={optionStyle}>{t.res1}</option>
              <option value="1920x1080" style={optionStyle}>{t.res2}</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 500, color: '#ffe6b0' }}>
              <span style={{ position: 'relative', width: 44, height: 24, display: 'inline-block' }}>
                <input
                  type="checkbox"
                  checked={fullscreen}
                  onChange={e => setFullscreen(e.target.checked)}
                  style={{ opacity: 0, width: 44, height: 24, position: 'absolute', left: 0, top: 0, margin: 0, zIndex: 2, cursor: 'pointer' }}
                  tabIndex={0}
                  aria-checked={fullscreen}
                />
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: 44,
                  height: 24,
                  background: fullscreen ? 'linear-gradient(90deg, #a87e2d 0%, #ffe6b0 100%)' : 'rgba(60,50,80,0.5)',
                  borderRadius: 16,
                  boxShadow: fullscreen ? '0 0 8px #ffe6b0aa' : '0 0 4px #0006',
                  transition: 'background 0.2s',
                  border: fullscreen ? '1.5px solid #ffe6b0' : '1.5px solid #a87e2d',
                  display: 'block',
                }} />
                <span style={{
                  position: 'absolute',
                  top: 4,
                  left: fullscreen ? 24 : 4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: fullscreen ? '#ffe6b0' : '#a87e2d',
                  boxShadow: fullscreen ? '0 0 8px #ffe6b0' : '0 0 4px #0006',
                  transition: 'left 0.2s, background 0.2s',
                  border: '2px solid #fff2',
                  display: 'block',
                  zIndex: 1,
                }} />
              </span>
              {t.fullscreen}
            </label>
          </div>
        </div>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button onClick={handleApply} style={btnStyle}>{t.apply}</button>
          <button onClick={handleClose} style={btnStyle}>{t.close}</button>
        </div>
      </div>
    </div>
  );
};

// Estilos customizados para inputs, selects, checkboxes e range
const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  margin: '6px 0',
  borderRadius: '6px',
  border: '1.5px solid #a87e2d',
  background: 'linear-gradient(90deg, #2a213a 0%, #3a2c4a 100%)',
  color: '#ffe6b0',
  fontFamily: 'Poppins, Arial, sans-serif',
  fontSize: '1rem',
  boxShadow: '0 1px 6px #000a',
  outline: 'none',
};
const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  background: 'rgba(30,22,40,0.85)',
  color: '#ffe6b0',
  border: '1.5px solid #a87e2d',
  fontWeight: 500,
  fontSize: 15,
  boxShadow: '0 2px 8px #0003',
  outline: 'none',
  transition: 'border 0.2s',
};
const optionStyle = {
  background: '#2a213a',
  color: '#ffe6b0',
  fontFamily: 'Poppins, Arial, sans-serif',
  fontSize: 15,
};
const rangeStyle = {
  width: 180,
  accentColor: '#a87e2d',
  margin: '0 8px',
  height: 4,
  borderRadius: 4,
  background: 'linear-gradient(90deg, #a87e2d 0%, #ffe6b0 100%)',
  boxShadow: '0 1px 4px #0003',
};


const modalBgStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(30,22,40,0.32)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

const modalStyle = {
  background: 'rgba(44, 38, 60, 0.38)',
  color: '#f5f5fa',
  padding: '40px 32px',
  borderRadius: '18px',
  minWidth: '340px',
  boxShadow: '0 6px 32px 0 rgba(30,22,40,0.18)',
  fontFamily: 'Poppins, Arial, sans-serif',
  border: '1.5px solid rgba(255,255,255,0.18)',
  textShadow: '0 2px 8px #0007',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
};

const btnStyle = {
  margin: '0 12px',
  padding: '12px 32px',
  fontSize: '1.1rem',
  borderRadius: '6px',
  border: '2px solid #a87e2d',
  background: 'linear-gradient(90deg, #a87e2d 0%, #ffe6b0 100%)',
  color: '#3a2c4a',
  cursor: 'pointer',
  fontFamily: 'Poppins, Arial, sans-serif',
  boxShadow: '0 2px 12px #000a',
  textShadow: '0 1px 4px #000a',
  transition: 'background 0.2s, color 0.2s',
};

export default OptionsModal;
