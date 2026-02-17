import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

export default function LayeredStatusOverlayPortal({ children, zValue = 'var(--z-effects-base)', idSuffix }) {
  const elRef = useRef(null);
  useEffect(() => {
    const containerId = `kadir-status-overlays${idSuffix ? `-${idSuffix}` : ''}`;
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    // set z-index using setProperty so CSS variables / calc() are preserved
    container.style.setProperty('z-index', zValue);
    elRef.current = container;
    return () => {
      // intentionally keep container for reuse
    };
  }, [zValue, idSuffix]);

  if (!elRef.current) return null;
  return ReactDOM.createPortal(children, elRef.current);
}
