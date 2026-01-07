import React, { useEffect, useMemo, useState } from 'react';

const TARGET_W = 1920;
const TARGET_H = 1080;

function useViewportScale() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => {
      setSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { scale, offsetX, offsetY } = useMemo(() => {
    // Nunca ampliar acima de 1x; apenas reduzir para caber em resoluções menores
    const scale = Math.min(1, Math.min(size.w / TARGET_W, size.h / TARGET_H));
    const contentW = TARGET_W * scale;
    const contentH = TARGET_H * scale;
    const offsetX = Math.max(0, (size.w - contentW) / 2);
    const offsetY = Math.max(0, (size.h - contentH) / 2);
    return { scale, offsetX, offsetY };
  }, [size.w, size.h]);

  return { scale, offsetX, offsetY };
}

export default function FixedViewport({ children }: { children: React.ReactNode }) {
  const { scale, offsetX, offsetY } = useViewportScale();

  const styleVars = {
    ['--vp-scale' as any]: String(scale),
    ['--vp-offset-x' as any]: `${offsetX}px`,
    ['--vp-offset-y' as any]: `${offsetY}px`,
  } as React.CSSProperties;

  return (
    <div className="viewport-root">
      <div className="app-viewport" style={styleVars}>
        {children}
      </div>
    </div>
  );
}
