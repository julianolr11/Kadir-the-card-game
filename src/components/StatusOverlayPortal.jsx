import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const containerId = 'kadir-status-overlays';

export default function StatusOverlayPortal({ children }) {
  const elRef = useRef(null);

  useEffect(() => {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    // ensure container has the correct layout and stacking values (update existing if present)
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    // place overlays above the card preview so status emojis/overlays appear in front
    // card-preview uses z-index: 10000000, so pick a value above that.
    container.style.zIndex = '10000040';
    elRef.current = container;
    return () => {
      // don't remove container on unmount (global reuse)
    };
  }, []);

  if (!elRef.current) return null;
  return ReactDOM.createPortal(children, elRef.current);
}
