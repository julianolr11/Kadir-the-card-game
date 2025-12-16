import React from 'react';
import '../styles/animations.css';

const MainMenu = ({ onStart, onOptions, onExit }) => (
  <div style={{ position: 'absolute', display: 'flex', gap: '30px', bottom: 60, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }} className="fade-in">
    <button onClick={onStart} style={btnStyle}>Início</button>
    <button onClick={onOptions} style={btnStyle}>Opções</button>
    <button onClick={onExit} style={btnStyle}>Sair</button>
  </div>
);

const btnStyle = {
  margin: '0 16px',
  padding: '12px 32px',
  fontSize: '1.2rem',
  borderRadius: '8px',
  border: 'none',
  background: '#222',
  color: '#fff',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  transition: 'background 0.2s',
};

export default MainMenu;
