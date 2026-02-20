import { useEffect, useRef } from 'react';
import { COLORS } from '../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// EMERGENCY TICKER COMPONENT
// Scrolling news ticker with emergency messages using RAF for smooth loop
// ═══════════════════════════════════════════════════════════════

export const EmergencyTicker = ({ messages }) => {
  const tickerRef = useRef(null);
  const posRef = useRef(0);
  const lastTimeRef = useRef(null);
  const singleWidthRef = useRef(0);

  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;

    const compute = () => {
      singleWidthRef.current = el.scrollWidth / 2 || 0;
      posRef.current = posRef.current % (singleWidthRef.current || 1);
    };
    compute();

    let rafId = null;
    const speed = 150; // pixels per second - adjust for faster/slower

    const onFrame = (t) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      if (singleWidthRef.current > 0) {
        posRef.current += speed * dt;
        const offset = posRef.current % singleWidthRef.current;
        el.style.transform = `translateX(${-offset}px)`;
      }

      rafId = requestAnimationFrame(onFrame);
    };

    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    rafId = requestAnimationFrame(onFrame);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      lastTimeRef.current = null;
    };
  }, []);

  return (
    <div style={{
      background: `linear-gradient(90deg, ${COLORS.flora}15, ${COLORS.flora}25, ${COLORS.flora}15)`,
      borderTop: `1px solid ${COLORS.flora}40`,
      borderBottom: `1px solid ${COLORS.flora}40`,
      padding: "12px 0",
      overflow: "hidden",
      position: "relative",
    }}>
      <div
        ref={tickerRef}
        style={{
          display: "flex",
          gap: 80,
          whiteSpace: "nowrap",
          fontFamily: "'Space Mono', monospace",
          fontSize: 13,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: COLORS.flora,
          fontWeight: 600,
          willChange: "transform",
        }}
      >
        {[...messages, ...messages].map((m, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: COLORS.flora, fontSize: 14 }}>●</span>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
};
