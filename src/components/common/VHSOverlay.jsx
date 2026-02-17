import { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../../utils/constants';
import { useGameStore } from '../../store';

// ═══════════════════════════════════════════════════════════════
// VHS OVERLAY COMPONENT
// Retro TV effects: scanlines, film grain, red flashes, glitch, tracking
// ═══════════════════════════════════════════════════════════════

export const VHSOverlay = () => {
  const { vhsEffectsEnabled, toggleVHSEffects } = useGameStore();
  const [redFlash, setRedFlash] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [vhsTracking, setVhsTracking] = useState(false);

  // Random red flash effect
  useEffect(() => {
    if (!vhsEffectsEnabled) return;
    
    const triggerFlash = () => {
      setRedFlash(true);
      setTimeout(() => setRedFlash(false), 150);
    };
    const interval = setInterval(triggerFlash, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, [vhsEffectsEnabled]);

  // Random glitch effect
  useEffect(() => {
    if (!vhsEffectsEnabled) return;
    
    const triggerGlitch = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    };
    const interval = setInterval(triggerGlitch, 10000 + Math.random() * 15000);
    return () => clearInterval(interval);
  }, [vhsEffectsEnabled]);

  // VHS tracking lines effect
  useEffect(() => {
    if (!vhsEffectsEnabled) return;
    
    const triggerTracking = () => {
      setVhsTracking(true);
      setTimeout(() => setVhsTracking(false), 800);
    };
    const interval = setInterval(triggerTracking, 6000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, [vhsEffectsEnabled]);

  return (
    <>
      {/* Effects Toggle Button */}
      <button
        onClick={toggleVHSEffects}
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 10001,
          padding: "12px 16px",
          background: vhsEffectsEnabled ? COLORS.flora + "20" : COLORS.crimson + "20",
          border: `2px solid ${vhsEffectsEnabled ? COLORS.flora : COLORS.crimson}`,
          borderRadius: 8,
          fontFamily: "'Space Mono', monospace",
          fontSize: 13,
          letterSpacing: 1.5,
          color: vhsEffectsEnabled ? COLORS.flora : COLORS.crimson,
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.3s",
          boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 20px ${vhsEffectsEnabled ? COLORS.flora : COLORS.crimson}30`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = `0 6px 24px rgba(0,0,0,0.6), 0 0 30px ${vhsEffectsEnabled ? COLORS.flora : COLORS.crimson}50`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.4), 0 0 20px ${vhsEffectsEnabled ? COLORS.flora : COLORS.crimson}30`;
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {vhsEffectsEnabled ? (
            <>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </>
          ) : (
            <>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </>
          )}
        </svg>
        {vhsEffectsEnabled ? "VHS ON" : "VHS OFF"}
      </button>

      {/* VHS Effects */}
      {vhsEffectsEnabled && (
        <>
          {/* Scanlines - Animated */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 9999,
            background: `repeating-linear-gradient(
              0deg,
              rgba(0, 20, 10, 0.15),
              rgba(0, 20, 10, 0.15) 3px,
              transparent 3px,
              transparent 10px
            )`,
            animation: "scanline 1s linear infinite",
          }} />

          {/* Film Grain - Multiple Layers */}
          <div style={{
            position: "fixed",
            inset: 0,
            opacity: 0.15,
            pointerEvents: "none",
            zIndex: 9999,
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "250px 250px",
              animation: "grain1 0.8s steps(5) infinite",
            }} />
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.6' numOctaves='2' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "300px 300px",
              animation: "grain2 1.2s steps(4) infinite",
              opacity: 0.6,
            }} />
          </div>

          {/* Red Flash */}
          {redFlash && (
            <div style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9999,
              background: `linear-gradient(135deg, ${COLORS.crimson}40, ${COLORS.signal}30)`,
              animation: "redPulse 0.15s ease-out",
            }} />
          )}

          {/* Glitch Effect - Vertical Displacement */}
          {glitchActive && (
            <>
              <div style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                zIndex: 9999,
                clipPath: `inset(0 0 ${60 + Math.random() * 30}% 0)`,
                transform: `translateY(-${Math.random() * 8}px)`,
                filter: `hue-rotate(${Math.random() * 20}deg)`,
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(90deg, ${COLORS.flora}20, transparent)`,
                }} />
              </div>
              <div style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                zIndex: 9999,
                clipPath: `inset(${30 + Math.random() * 20}% 0 0 0)`,
                transform: `translateY(${Math.random() * 8}px)`,
                filter: `hue-rotate(-${Math.random() * 20}deg)`,
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(90deg, transparent, ${COLORS.crimson}20)`,
                }} />
              </div>
            </>
          )}

          {/* Chromatic Aberration */}
          <div style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            boxShadow: `
              inset 3px 0 0 rgba(255, 0, 100, 0.04),
              inset -3px 0 0 rgba(0, 255, 100, 0.04)
            `,
          }} />

          {/* VHS Tracking Lines */}
          {vhsTracking && (
            <>
              <div style={{
                position: "fixed",
                left: 0,
                right: 0,
                height: "8px",
                top: "20%",
                pointerEvents: "none",
                zIndex: 9999,
                background: `repeating-linear-gradient(
                  90deg,
                  rgba(255, 255, 255, 0.1),
                  rgba(255, 255, 255, 0.1) 2px,
                  rgba(0, 0, 0, 0.3) 2px,
                  rgba(0, 0, 0, 0.3) 4px
                )`,
                animation: "trackingSlide 0.8s linear",
                filter: "blur(1px)",
              }} />
              <div style={{
                position: "fixed",
                left: 0,
                right: 0,
                height: "4px",
                top: "60%",
                pointerEvents: "none",
                zIndex: 9999,
                background: "rgba(255, 255, 255, 0.15)",
                animation: "trackingSlide 0.8s linear 0.2s",
                filter: "blur(2px)",
              }} />
            </>
          )}

          {/* VHS Color Bleeding */}
          <div style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            background: `linear-gradient(
              to right,
              ${COLORS.crimson}08 0%,
              transparent 5%,
              transparent 95%,
              ${COLORS.flora}08 100%
            )`,
            animation: "colorBleed 4s ease-in-out infinite",
          }} />

          {/* VHS Tape Noise Bands */}
          <div style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 200px,
              rgba(255, 255, 255, 0.02) 200px,
              rgba(255, 255, 255, 0.02) 202px,
              transparent 202px,
              transparent 400px
            )`,
            animation: "tapeNoise 8s linear infinite",
          }} />

          {/* Corner Vignette */}
          <div style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            background: `radial-gradient(
              ellipse at center,
              transparent 40%,
              rgba(0, 0, 0, 0.3) 100%
            )`,
          }} />
        </>
      )}

      {/* Global Animations */}
      <style>{`
        @keyframes morseBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes grain1 {
          0% { background-position: 0% 0%; }
          33% { background-position: 47% 23%; }
          66% { background-position: 12% 89%; }
          100% { background-position: 0% 0%; }
        }

        @keyframes grain2 {
          0% { background-position: 0% 0%; }
          25% { background-position: 67% 41%; }
          50% { background-position: 21% 73%; }
          75% { background-position: 84% 15%; }
          100% { background-position: 0% 0%; }
        }

        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }

        @keyframes trackingSlide {
          0% { transform: translateY(0); opacity: 0.8; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        @keyframes colorBleed {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes tapeNoise {
          0% { transform: translateY(0); }
          100% { transform: translateY(400px); }
        }

        @keyframes redPulse {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </>
  );
};
