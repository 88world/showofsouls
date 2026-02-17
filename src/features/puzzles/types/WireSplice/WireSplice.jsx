import { useState, useRef, useCallback } from 'react';
import { COLORS } from '../../../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// WIRE SPLICE — Connect matching colored wires by dragging
// Unlocks: Recording
// ═══════════════════════════════════════════════════════════════

const WIRE_COLORS = [
  { name: 'RED', color: '#c41e1e' },
  { name: 'GREEN', color: '#00ff66' },
  { name: 'BLUE', color: '#3366ff' },
  { name: 'GOLD', color: '#d4a017' },
  { name: 'WHITE', color: '#e8dcc8' },
];

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getOrCreateShuffle() {
  const stored = localStorage.getItem('sos_puzzle_wire');
  if (stored) {
    try {
      const arr = JSON.parse(stored);
      if (arr.length === 5) return arr;
    } catch {}
  }
  const order = shuffleArray([0, 1, 2, 3, 4]);
  localStorage.setItem('sos_puzzle_wire', JSON.stringify(order));
  return order;
}

export const WireSplice = ({ isOpen, onClose, onSuccess }) => {
  const rightOrder = useRef(getOrCreateShuffle()); // right side is shuffled
  const [connections, setConnections] = useState({}); // leftIndex -> rightIndex
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleLeftClick = (idx) => {
    if (success) return;
    setSelectedLeft(idx);
    setError('');
  };

  const handleRightClick = (rightIdx) => {
    if (success || selectedLeft === null) return;
    setConnections(prev => {
      const next = { ...prev };
      // Remove any existing connection to this right node
      Object.keys(next).forEach(k => {
        if (next[k] === rightIdx) delete next[k];
      });
      next[selectedLeft] = rightIdx;
      return next;
    });
    setSelectedLeft(null);
  };

  const handleVerify = () => {
    if (Object.keys(connections).length < 5) {
      setError('CONNECT ALL WIRES');
      return;
    }
    // Check: each left wire i should connect to rightOrder.indexOf(i)
    const allCorrect = Object.entries(connections).every(([left, right]) => {
      return rightOrder.current[right] === parseInt(left);
    });
    if (allCorrect) {
      setSuccess(true);
      setError('');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } else {
      setError('SHORT CIRCUIT — WRONG CONNECTIONS');
    }
  };

  const handleReset = () => {
    setConnections({});
    setSelectedLeft(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.ember}`, padding: 32, maxWidth: 500, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.ember, letterSpacing: 4, marginBottom: 8 }}>WIRE SPLICE</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 8 }}>RECONNECT THE SEVERED WIRES</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 24 }}>Click a left wire, then its matching color on the right</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', marginBottom: 20 }}>
          {/* Left side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WIRE_COLORS.map((w, i) => {
              const isConnected = connections[i] !== undefined;
              return (
                <div key={i} onClick={() => handleLeftClick(i)} style={{
                  width: 80, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selectedLeft === i ? w.color + '40' : '#111',
                  border: `2px solid ${selectedLeft === i ? w.color : isConnected ? w.color + '60' : COLORS.ash + '30'}`,
                  fontFamily: "'Space Mono', monospace", fontSize: 10, color: w.color,
                  cursor: 'pointer', letterSpacing: 2, transition: 'all 0.15s',
                }}>
                  {w.name}
                </div>
              );
            })}
          </div>

          {/* Center — connection lines */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <svg width="100%" height="260" style={{ position: 'absolute', top: 0, left: 0 }}>
              {Object.entries(connections).map(([left, right]) => {
                const leftY = parseInt(left) * 48 + 18;
                const rightY = right * 48 + 18;
                const color = WIRE_COLORS[parseInt(left)].color;
                const isCorrect = rightOrder.current[right] === parseInt(left);
                return (
                  <line key={left} x1="0" y1={leftY} x2="100%" y2={rightY}
                    stroke={color} strokeWidth="2" strokeDasharray={isCorrect ? 'none' : '4,4'}
                    opacity={0.6}
                  />
                );
              })}
            </svg>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: COLORS.ash + '30', letterSpacing: 2 }}>
              {'██████'}
            </div>
          </div>

          {/* Right side — shuffled */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rightOrder.current.map((colorIdx, i) => {
              const w = WIRE_COLORS[colorIdx];
              const isTarget = Object.values(connections).includes(i);
              return (
                <div key={i} onClick={() => handleRightClick(i)} style={{
                  width: 80, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isTarget ? w.color + '20' : '#111',
                  border: `2px solid ${isTarget ? w.color + '60' : COLORS.ash + '30'}`,
                  fontFamily: "'Space Mono', monospace", fontSize: 10, color: w.color,
                  cursor: selectedLeft !== null ? 'pointer' : 'default', letterSpacing: 2, transition: 'all 0.15s',
                }}>
                  {w.name}
                </div>
              );
            })}
          </div>
        </div>

        {error && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.crimson, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, marginBottom: 12, textAlign: 'center' }}>✓ ALL WIRES CONNECTED</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} disabled={success} style={{
            flex: 1, padding: '12px', background: 'transparent',
            border: `1px solid ${COLORS.ash}30`, color: COLORS.ash,
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 3, cursor: 'pointer',
          }}>RESET</button>
          <button onClick={handleVerify} disabled={success} style={{
            flex: 2, padding: '12px', background: 'transparent',
            border: `2px solid ${success ? COLORS.flora : COLORS.ember}`,
            color: success ? COLORS.flora : COLORS.ember,
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, cursor: 'pointer',
          }}>{success ? '✓ CIRCUIT CLOSED' : 'VERIFY CIRCUIT'}</button>
        </div>

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
};
