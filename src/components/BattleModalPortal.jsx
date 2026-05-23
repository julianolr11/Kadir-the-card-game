import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const containerId = 'kadir-battle-modal-portal';

export default function BattleModalPortal({ children }) {
  const elRef = useRef(null);

  useEffect(() => {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.setProperty('z-index', 'var(--z-card-modal)', 'important');
    elRef.current = container;

    return () => {
      // Keep the container for reuse during the battle.
    };
  }, []);

  if (!elRef.current) return null;
  return ReactDOM.createPortal(children, elRef.current);
}
