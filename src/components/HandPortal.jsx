import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const containerId = 'kadir-hand-portal';

export default function HandPortal({ children }) {
  const elRef = useRef(null);

  useEffect(() => {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.right = '0';
    container.style.bottom = '0';
    container.style.pointerEvents = 'none';
    // ensure hand portal uses centralized var so it sits above effects
    container.style.zIndex = 'var(--z-hand)';
    elRef.current = container;
    return () => {
      // keep container for reuse
    };
  }, []);

  if (!elRef.current) return null;
  return ReactDOM.createPortal(children, elRef.current);
}
