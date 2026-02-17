import { useState, useRef } from 'react';
import { COLORS } from '../../../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// WAVEFORM MATCH — Recreate a target waveform by clicking bars
// Unlocks: Recording
// ═══════════════════════════════════════════════════════════════

const BAR_COUNT = 12;

function getOrCreateTarget() {
  const stored = localStorage.getItem('sos_puzzle_waveform');
  if (stored) {
    try { const arr = JSON.parse(stored); if (arr.length === BAR_COUNT) return arr; } catch {}
  }
  const target = Array.from({ length: BAR_COUNT }, () => Math.floor(Math.random() * 5) + 1); // 1-5
  localStorage.setItem('sos_puzzle_waveform', JSON.stringify(target));
  return target;
}

export const WaveformMatch = ({ isOpen, onClose, onSuccess }) => {
  const target = useRef(getOrCreateTarget());
  const [bars, setBars] = useState(Array(BAR_COUNT).fill(0));
  const [showTarget, setShowTarget] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleBarClick = (index) => {
    if (success) return;
    setBars(prev => {
      const next = [...prev];
      next[index] = (next[index] + 1) % 6; // 0-5, wraps
      return next;
    });
  };

  const handleCheck = () => {
    const match = bars.every((b, i) => b === target.current[i]);
    if (match) {
      setSuccess(true);
      setError('');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } else {
      const correct = bars.filter((b, i) => b === target.current[i]).length;
      setError(`${correct}/${BAR_COUNT} BARS CORRECT`);
    }
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.ember}`, padding: 32, maxWidth: 520, width: 'calc(100% - 32px)', cursor: 'default' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.ember, letterSpacing: 4, marginBottom: 8 }}>WAVEFORM MATCH</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 24 }}>RECREATE THE AUDIO PATTERN</div>

        {/* Target waveform */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash, letterSpacing: 2, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>TARGET WAVEFORM</span>
            <span onClick={() => setShowTarget(!showTarget)} style={{ cursor: 'pointer', color: COLORS.ember }}>{showTarget ? 'HIDE' : 'SHOW'}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, padding: '0 8px',
            background: '#111', border: `1px solid ${COLORS.ash}20`, borderRadius: 2,
            justifyContent: 'center',
          }}>
            {target.current.map((h, i) => (
              <div key={i} style={{
                width: 20, height: showTarget ? h * 10 : 10,
                background: showTarget ? COLORS.flora + '80' : COLORS.ash + '20',
                borderRadius: '2px 2px 0 0', transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Player bars */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash, letterSpacing: 2, marginBottom: 8 }}>YOUR WAVEFORM — CLICK TO ADJUST</div>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, padding: '0 8px',
            background: '#111', border: `1px solid ${COLORS.ash}20`, borderRadius: 2,
            justifyContent: 'center',
          }}>
            {bars.map((h, i) => (
              <div key={i} onClick={() => handleBarClick(i)} style={{
                width: 20, height: Math.max(4, h * 10),
                background: h === target.current[i] ? COLORS.flora : COLORS.ember,
                borderRadius: '2px 2px 0 0', cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: h === target.current[i] ? `0 0 6px ${COLORS.flora}40` : 'none',
              }} />
            ))}
          </div>
        </div>

        {error && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.crimson, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, marginBottom: 12, textAlign: 'center' }}>✓ WAVEFORM MATCHED</div>}

        <button onClick={handleCheck} disabled={success} style={{
          width: '100%', padding: '12px', background: 'transparent',
          border: `2px solid ${success ? COLORS.flora : COLORS.ember}`,
          color: success ? COLORS.flora : COLORS.ember,
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, cursor: 'pointer',
        }}>{success ? '✓ PATTERN LOCKED' : 'VERIFY PATTERN'}</button>

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
};
