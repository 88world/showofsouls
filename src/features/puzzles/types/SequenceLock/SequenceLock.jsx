import { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../../../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// SEQUENCE LOCK — Remember and reproduce a symbol sequence (Simon Says)
// Global Event Puzzle — Hidden on CharactersPage
// ═══════════════════════════════════════════════════════════════

const SYMBOLS = [
  { icon: '☠', label: 'Skull' },
  { icon: '👁', label: 'Eye' },
  { icon: '🔥', label: 'Fire' },
  { icon: '⚡', label: 'Bolt' },
  { icon: '🌀', label: 'Void' },
  { icon: '✦', label: 'Star' },
];

const COLORS_MAP = [
  COLORS.crimson,
  COLORS.flora,
  COLORS.ember,
  '#a855f7', // purple
  '#06b6d4', // cyan
  COLORS.gold,
];

const WIN_LENGTH = 7;

export const SequenceLock = ({ isOpen, onClose, onSuccess }) => {
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle, showing, input, success, fail
  const [activeIdx, setActiveIdx] = useState(-1);
  const [round, setRound] = useState(0);
  const [flashIdx, setFlashIdx] = useState(-1);
  const timeouts = useRef([]);

  const clearTimeouts = () => {
    timeouts.current.forEach(t => clearTimeout(t));
    timeouts.current = [];
  };

  useEffect(() => () => clearTimeouts(), []);

  const startGame = useCallback(() => {
    clearTimeouts();
    const first = Math.floor(Math.random() * SYMBOLS.length);
    setSequence([first]);
    setPlayerInput([]);
    setRound(1);
    // Show the first symbol
    setTimeout(() => showSequence([first]), 500);
  }, []);

  const showSequence = (seq) => {
    setPhase('showing');
    setPlayerInput([]);
    clearTimeouts();

    seq.forEach((symbolIdx, i) => {
      const t1 = setTimeout(() => setActiveIdx(symbolIdx), i * 700);
      const t2 = setTimeout(() => setActiveIdx(-1), i * 700 + 450);
      timeouts.current.push(t1, t2);
    });

    const t3 = setTimeout(() => {
      setActiveIdx(-1);
      setPhase('input');
    }, seq.length * 700 + 100);
    timeouts.current.push(t3);
  };

  const handleSymbolClick = (idx) => {
    if (phase !== 'input') return;

    // Flash effect
    setFlashIdx(idx);
    setTimeout(() => setFlashIdx(-1), 200);

    const newInput = [...playerInput, idx];
    setPlayerInput(newInput);

    // Check if this press is correct
    const pressIdx = newInput.length - 1;
    if (idx !== sequence[pressIdx]) {
      // Wrong! Reset
      setPhase('fail');
      setTimeout(() => {
        setPhase('idle');
        setSequence([]);
        setRound(0);
      }, 1500);
      return;
    }

    // Completed the full sequence for this round?
    if (newInput.length === sequence.length) {
      if (sequence.length >= WIN_LENGTH) {
        // Won!
        setPhase('success');
        setTimeout(() => { onSuccess(); onClose(); }, 1200);
        return;
      }

      // Next round — add one more
      const nextSymbol = Math.floor(Math.random() * SYMBOLS.length);
      const nextSeq = [...sequence, nextSymbol];
      setSequence(nextSeq);
      setRound(r => r + 1);
      setTimeout(() => showSequence(nextSeq), 800);
    }
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid #a855f7`, padding: 32, maxWidth: 440, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#a855f7', letterSpacing: 4, marginBottom: 8 }}>SEQUENCE LOCK</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 6 }}>MEMORIZE THE SYMBOL SEQUENCE & REPRODUCE IT</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 24 }}>Reach {WIN_LENGTH} symbols to unlock</div>

        {/* Round progress */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 20 }}>
          {Array.from({ length: WIN_LENGTH }).map((_, i) => (
            <div key={i} style={{
              width: 16, height: 4,
              background: i < round ? '#a855f7' : COLORS.ash + '20',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* Symbol grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
          marginBottom: 24, maxWidth: 300, margin: '0 auto 24px',
        }}>
          {SYMBOLS.map((sym, i) => {
            const isActive = activeIdx === i;
            const isFlash = flashIdx === i;
            return (
              <button
                key={i}
                onClick={() => handleSymbolClick(i)}
                style={{
                  width: '100%', aspectRatio: '1', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 4,
                  background: isActive || isFlash ? COLORS_MAP[i] + '30' : '#111',
                  border: `2px solid ${isActive || isFlash ? COLORS_MAP[i] : COLORS.ash + '20'}`,
                  fontSize: 28, cursor: phase === 'input' ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                  boxShadow: isActive ? `0 0 20px ${COLORS_MAP[i]}40` : 'none',
                  filter: isActive ? 'brightness(1.3)' : 'none',
                }}
              >
                <span>{sym.icon}</span>
                <span style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 7,
                  color: isActive ? COLORS_MAP[i] : COLORS.ash, letterSpacing: 1,
                }}>{sym.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* Status */}
        {phase === 'idle' && (
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash }}>PRESS START TO BEGIN</div>
          </div>
        )}
        {phase === 'showing' && (
          <div style={{ textAlign: 'center', marginBottom: 12, fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#a855f7' }}>
            ▶ WATCH THE SEQUENCE... ({sequence.length} symbols)
          </div>
        )}
        {phase === 'input' && (
          <div style={{ textAlign: 'center', marginBottom: 12, fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora }}>
            YOUR TURN — {playerInput.length}/{sequence.length}
          </div>
        )}
        {phase === 'fail' && (
          <div style={{ textAlign: 'center', marginBottom: 12, fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.crimson }}>
            ✗ WRONG SEQUENCE — LOCK RESET
          </div>
        )}
        {phase === 'success' && (
          <div style={{ textAlign: 'center', marginBottom: 12, fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora }}>
            ✓ SEQUENCE COMPLETE — LOCK OPENED
          </div>
        )}

        {phase === 'idle' && (
          <button onClick={startGame} style={{
            width: '100%', padding: '12px', background: 'transparent',
            border: '2px solid #a855f7', color: '#a855f7',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, cursor: 'pointer',
          }}>START SEQUENCE</button>
        )}

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
};
