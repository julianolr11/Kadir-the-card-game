import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const containerId = 'kadir-ghost-preview-portal';

export default function GhostPreviewPortal({ children }) {
  const elRef = useRef(null);

  useEffect(() => {
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
    // prioritize ghost preview above everything using centralized variable
    container.style.zIndex = 'var(--z-ghost-preview)';
    elRef.current = container;
    return () => {
      // keep container for reuse
    };
  }, []);

  if (!elRef.current) return null;
  return ReactDOM.createPortal(children, elRef.current);
}
