import { useState, useEffect } from 'react';
import { COLORS } from '../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// GLITCH TEXT COMPONENT
// Randomly applies RGB split glitch effect to text
// ═══════════════════════════════════════════════════════════════

export const GlitchText = ({ children, className = "" }) => {
  const [glitch, setGlitch] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000 + Math.random() * 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className={className} style={{ position: "relative", display: "inline-block" }}>
      {children}
      {glitch && (
        <>
          <span style={{
            position: "absolute",
            top: "-2px",
            left: "2px",
            color: COLORS.flora,
            opacity: 0.7,
            clipPath: "inset(0 0 50% 0)",
            pointerEvents: "none"
          }}>
            {children}
          </span>
          <span style={{
            position: "absolute",
            top: "2px",
            left: "-2px",
            color: COLORS.crimson,
            opacity: 0.7,
            clipPath: "inset(50% 0 0 0)",
            pointerEvents: "none"
          }}>
            {children}
          </span>
        </>
      )}
    </span>
  );
};
