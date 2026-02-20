import { useState, useEffect } from 'react';
import { COLORS } from '../../utils/constants';
import { Icons, IconComponent } from './Icons';

// ═══════════════════════════════════════════════════════════════
// GLITCHED ELEMENT — Hidden puzzle trigger scattered throughout UI
// Appears only when global event is active
// Styled as UI corruption/glitch effect
// ═══════════════════════════════════════════════════════════════

export const GlitchedPuzzleTrigger = ({ 
  puzzleId, 
  puzzleName,
  isActive,
  isCompleted, 
  onClick,
  children,
  style = {},
}) => {
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Animate glitch offset
  useEffect(() => {
    if (!isActive || isCompleted) return;
    
    const interval = setInterval(() => {
      setGlitchOffset({
        x: Math.random() * 4 - 2,
        y: Math.random() * 4 - 2,
      });
    }, 150 + Math.random() * 200);

    return () => clearInterval(interval);
  }, [isActive, isCompleted]);

  if (!isActive) return children;

  const baseStyle = {
    position: 'relative',
    cursor: isCompleted ? 'default' : 'pointer',
    filter: isCompleted ? 'opacity(0.4) blur(1px)' : 'none',
    ...style,
  };

  return (
    <div
      onClick={() => !isCompleted && onClick?.(puzzleId)}
      onMouseEnter={() => !isCompleted && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={baseStyle}
    >
      {/* Original content */}
      {children}

      {/* Glitch layers - only when not completed and active */}
      {!isCompleted && isActive && (
        <>
          {/* Glitch effect layer 1 */}
          <div
            style={{
              position: 'absolute',
              top: -2 + glitchOffset.y,
              left: -2 + glitchOffset.x,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,0,0,0.1) 30%, rgba(255,0,0,0.1) 60%, transparent 60%)',
              pointerEvents: 'none',
              opacity: isHovered ? 0.6 : 0.2,
              mixBlendMode: 'multiply',
              zIndex: 1,
            }}
          />

          {/* Glitch effect layer 2 */}
          <div
            style={{
              position: 'absolute',
              top: 2 - glitchOffset.y,
              left: 2 - glitchOffset.x,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(-45deg, transparent 30%, rgba(0,255,100,0.1) 30%, rgba(0,255,100,0.1) 60%, transparent 60%)',
              pointerEvents: 'none',
              opacity: isHovered ? 0.4 : 0.15,
              mixBlendMode: 'screen',
              zIndex: 1,
            }}
          />

          {/* Scan lines */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 2px, transparent 2px, transparent 4px)',
              pointerEvents: 'none',
              opacity: isHovered ? 0.3 : 0.1,
              zIndex: 2,
            }}
          />

          {/* Colorshift on hover */}
          {isHovered && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle, ${COLORS.crimson}10 0%, transparent 70%)`,
                pointerEvents: 'none',
                zIndex: 0,
                animation: 'pulse 0.5s ease-in-out',
              }}
            />
          )}
        </>
      )}

      {/* Completion indicator */}
      {isCompleted && isActive && (
        <div
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: COLORS.flora,
            color: COLORS.bg,
            width: 24,
            height: 24,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            zIndex: 10,
            boxShadow: `0 0 12px ${COLORS.flora}60`,
          }}
        >
          <IconComponent icon={Icons.CheckCircle2} size={14} color={COLORS.bg} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// GLITCHED TEXT — Corrupted text that reveals on click
// ═══════════════════════════════════════════════════════════════

export const GlitchedText = ({
  children,
  puzzleId,
  isActive,
  isCompleted,
  onClick,
  style = {},
}) => {
  const [glitchChar, setGlitchChar] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isActive || isCompleted) return;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const interval = setInterval(() => {
      setGlitchChar(chars[Math.floor(Math.random() * chars.length)]);
    }, 80);

    return () => clearInterval(interval);
  }, [isActive, isCompleted]);

  if (!isActive) return <span style={style}>{children}</span>;

  return (
    <span
      onClick={() => !isCompleted && onClick?.(puzzleId)}
      onMouseEnter={() => !isCompleted && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...style,
        position: 'relative',
        display: 'inline-block',
        cursor: isCompleted ? 'default' : 'pointer',
        opacity: isCompleted ? 0.3 : 1,
        filter: isCompleted ? 'blur(1px)' : 'none',
        textDecoration: isCompleted ? 'line-through' : 'none',
        transition: 'all 0.2s',
        ...( isHovered && {
          color: COLORS.crimson,
          textShadow: `0 0 8px ${COLORS.crimson}80`,
        }),
      }}
    >
      {/* Layer 1 - Original text */}
      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>

      {/* Layer 2 - Glitched text overlay (only when active and not completed) */}
      {!isCompleted && isActive && (
        <>
          <span
            style={{
              position: 'absolute',
              left: '2px',
              top: '-2px',
              color: COLORS.crimson,
              opacity: 0.3,
              zIndex: 1,
              pointerEvents: 'none',
              animation: 'glitch-anim 0.15s infinite',
            }}
          >
            {glitchChar}
          </span>
          <span
            style={{
              position: 'absolute',
              left: '-2px',
              top: '2px',
              color: COLORS.flora,
              opacity: 0.3,
              zIndex: 1,
              pointerEvents: 'none',
              animation: 'glitch-anim 0.1s infinite reverse',
            }}
          >
            {glitchChar}
          </span>
        </>
      )}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// GLITCHED ALERT BOX — Corrupted warning box hidden on page
// ═══════════════════════════════════════════════════════════════

export const GlitchedAlertBox = ({
  puzzleId,
  puzzleName,
  isActive,
  isCompleted,
  onClick,
  message = 'ANOMALY DETECTED',
}) => {
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  useEffect(() => {
    if (!isActive || isCompleted) return;

    const interval = setInterval(() => {
      setGlitchIntensity(Math.random() * 0.8);
    }, 200);

    return () => clearInterval(interval);
  }, [isActive, isCompleted]);

  if (!isActive) return null;

  return (
    <div
      onClick={() => !isCompleted && onClick?.(puzzleId)}
      style={{
        padding: '12px 16px',
        background: isCompleted ? 'transparent' : `linear-gradient(135deg, ${COLORS.crimson}10, ${COLORS.crimson}05)`,
        border: `1px dashed ${isCompleted ? COLORS.flora + '40' : COLORS.crimson + '40'}`,
        borderRadius: 4,
        cursor: isCompleted ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s',
        opacity: isCompleted ? 0.3 : 1,
        transform: `skewX(${glitchIntensity * 2 - 1}deg)`,
      }}
    >
      {/* Glitch background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, transparent, ${COLORS.crimson}20, transparent)`,
          pointerEvents: 'none',
          opacity: glitchIntensity * 0.5,
          zIndex: 0,
        }}
      />

        <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Icons.AlertTriangle size={16} color={isCompleted ? COLORS.flora : COLORS.crimson} />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: 2,
            color: isCompleted ? COLORS.flora : COLORS.crimson,
            opacity: 0.8,
          }}
        >
          {isCompleted ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconComponent icon={Icons.CheckCircle2} size={12} color={COLORS.flora} />
              <span>{puzzleName.toUpperCase()} LOCKED</span>
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconComponent icon={Icons.Zap} size={12} color={COLORS.crimson} />
              <span>{message}</span>
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

const styles = `
  @keyframes glitch-anim {
    0%, 100% { transform: translateX(0) translateY(0); }
    20% { transform: translateX(-2px) translateY(-2px); }
    40% { transform: translateX(2px) translateY(2px); }
    60% { transform: translateX(-2px) translateY(2px); }
    80% { transform: translateX(2px) translateY(-2px); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
