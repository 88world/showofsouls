import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../../../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// ECHO RESONANCE — Match overlapping echo patterns
// Complex audio puzzle with multiple layers
// ═══════════════════════════════════════════════════════════════

const ECHO_COUNT = 4;
const ECHO_PATTERNS = [
  [3, 1, 4, 1, 5],
  [2, 7, 1, 8, 2],
  [1, 6, 1, 8, 0],
  [3, 3, 8, 3, 2],
];

export const EchoResonance = ({ isOpen, onClose, onSuccess }) => {
  const [pattern, setPattern] = useState(Array(5).fill(0));
  const [target, setTarget] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const stored = JSON.stringify(localStorage.getItem('sos_echo_pattern'));
    let goal = ECHO_PATTERNS[Math.floor(Math.random() * ECHO_PATTERNS.length)];
    setTarget(goal);
  }, []);

  const playEcho = (index) => {
    // Simulate audio playback
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const freq = 200 + index * 100;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.3);
  };

  const handleCheckPattern = () => {
    setAttempts(prev => prev + 1);
    const matches = pattern.filter((v, i) => v === target[i]).length;
    const percent = Math.round((matches / target.length) * 100);

    if (matches === target.length) {
      setSuccess(true);
      setFeedback('✓ ECHO RESONANCE ACHIEVED');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } else {
      setFeedback(`⚠ PARTIAL MATCH: ${percent}% (${matches}/${target.length})`);
    }
  };

  const updatePattern = (index, value) => {
    const newPattern = [...pattern];
    newPattern[index] = value;
    setPattern(newPattern);
    setFeedback('');
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, animation: 'fadeIn 0.3s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 600, width: '100%',
        background: COLORS.cardDark,
        border: `2px solid ${COLORS.crimson}`,
        padding: 40, borderRadius: 8,
        animation: 'scaleIn 0.3s ease',
      }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28, letterSpacing: 3, color: COLORS.bone,
          margin: '0 0 16px 0',
        }}>ECHO RESONANCE</h2>

        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12, color: COLORS.ash,
          marginBottom: 24, lineHeight: 1.6,
        }}>
          Listen to the echo patterns and recreate them by adjusting the sliders. 
          Match all frequencies to unlock the hidden message.
        </p>

        {/* Pattern Display */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12, marginBottom: 24,
        }}>
          {target.map((val, i) => (
            <div key={i} style={{
              padding: 12, background: '#1a1a1a', border: `1px solid ${COLORS.crimson}20`,
              borderRadius: 4, textAlign: 'center',
            }}>
              <div style={{
                width: '100%', height: 40,
                background: 'linear-gradient(to top, #ff4444, transparent)',
                borderRadius: 2, marginBottom: 8,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: `${(val / 9) * 100}%`,
                  background: COLORS.crimson,
                  opacity: 0.6,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Control Sliders */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 2, color: COLORS.bone,
            marginBottom: 12, textTransform: 'uppercase',
          }}>ADJUST FREQUENCIES</h3>
          
          {pattern.map((val, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: 6, fontSize: 10, color: COLORS.ash,
              }}>
                <span>CH {i + 1}</span>
                <span>{val}</span>
              </div>
              <input
                type="range"
                min="0"
                max="9"
                value={val}
                onChange={e => updatePattern(i, parseInt(e.target.value))}
                onMouseUp={() => playEcho(i)}
                style={{
                  width: '100%', cursor: 'pointer',
                  accentColor: COLORS.crimson,
                }}
              />
            </div>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, color: feedback.startsWith('✓') ? COLORS.flora : COLORS.crimson,
            marginBottom: 20, letterSpacing: 1, textAlign: 'center',
          }}>
            {feedback}
          </div>
        )}

        {/* Progress bar */}
        <div style={{
          height: 3, background: COLORS.ash + '20',
          borderRadius: 2, marginBottom: 24, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(pattern.filter((v, i) => v === target[i]).length / target.length) * 100}%`,
            background: COLORS.crimson,
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleCheckPattern} style={{
            flex: 1, padding: 12,
            background: COLORS.crimson + '15',
            border: `1px solid ${COLORS.crimson}`,
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 2,
            color: COLORS.crimson, textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 4,
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = COLORS.crimson + '30'}
          onMouseLeave={e => e.currentTarget.style.background = COLORS.crimson + '15'}
          >
            CHECK PATTERN
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: 12,
            background: 'transparent',
            border: `1px solid ${COLORS.ash}30`,
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 2,
            color: COLORS.ash, textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 4,
            transition: 'all 0.3s',
          }}>
            CANCEL
          </button>
        </div>

        {/* Attempts counter */}
        <div style={{
          marginTop: 16, textAlign: 'center',
          fontFamily: "'Space Mono', monospace",
          fontSize: 9, color: COLORS.ash, letterSpacing: 1,
        }}>
          Attempts: {attempts}
        </div>
      </div>
    </div>
  );
};
