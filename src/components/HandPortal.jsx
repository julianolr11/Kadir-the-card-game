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
    try {
      container.style.setProperty('z-index', 'var(--z-hand)', 'important');
      // if the CSS var doesn't resolve to a numeric value, compute a numeric fallback
      const resolved = getComputedStyle(container).getPropertyValue('z-index');
      if (!resolved || resolved === 'auto' || isNaN(parseInt(resolved, 10))) {
        const root = getComputedStyle(document.documentElement);
        const hv = (root.getPropertyValue('--z-hand') || '').trim() || '10500';
        const base = parseInt(hv, 10) || 10500;
        const num = base - 10; // place hand 10 below its configured value
        container.style.setProperty('z-index', String(num), 'important');
      }
    } catch (e) {
      container.style.setProperty('z-index', String(10490), 'important');
    }
    elRef.current = container;
    return () => {
      // keep container for reuse
    };
  }, []);

  if (!elRef.current) return null;
  return ReactDOM.createPortal(children, elRef.current);
}
