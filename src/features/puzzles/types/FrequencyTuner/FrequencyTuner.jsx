import { useState, useRef, useCallback } from 'react';
import { COLORS } from '../../../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// FREQUENCY TUNER — Drag a dial to match a target radio frequency
// Unlocks: Recording
// ═══════════════════════════════════════════════════════════════

function getOrCreateTargetFreq() {
  const stored = localStorage.getItem('sos_puzzle_freq_target');
  if (stored) return parseFloat(stored);
  const freq = Math.round((87.5 + Math.random() * 20) * 10) / 10;
  localStorage.setItem('sos_puzzle_freq_target', freq.toString());
  return freq;
}

export const FrequencyTuner = ({ isOpen, onClose, onSuccess }) => {
  const target = useRef(getOrCreateTargetFreq());
  const [freq, setFreq] = useState(98.0);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef(null);

  const handleDrag = useCallback((clientX) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newFreq = Math.round((87.5 + pct * 20.5) * 10) / 10;
    setFreq(newFreq);
  }, []);

  const handleDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    handleDrag(e.clientX || e.touches?.[0]?.clientX);
    const onMove = (ev) => handleDrag(ev.clientX || ev.touches?.[0]?.clientX);
    const onUp = () => { setIsDragging(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  };

  const handleLock = () => {
    if (Math.abs(freq - target.current) <= 0.3) {
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    }
  };

  const diff = Math.abs(freq - target.current);
  const signalStr = diff < 0.5 ? 5 : diff < 1.5 ? 4 : diff < 3 ? 3 : diff < 6 ? 2 : 1;
  const noiseLevel = Math.min(1, diff / 10);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.ember}`, padding: 32, maxWidth: 460, width: 'calc(100% - 32px)', cursor: 'default' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.ember, letterSpacing: 4, marginBottom: 8 }}>FREQUENCY TUNER</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 24 }}>TUNE TO THE DISTRESS SIGNAL</div>

        {/* Frequency display */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 42, color: diff < 0.5 ? COLORS.flora : COLORS.ember,
            letterSpacing: 4, textShadow: diff < 0.5 ? `0 0 20px ${COLORS.flora}` : 'none', transition: 'all 0.3s',
          }}>{freq.toFixed(1)} <span style={{ fontSize: 14 }}>MHz</span></div>
        </div>

        {/* Signal bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: 30, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              width: 8, height: 4 + i * 5,
              background: i <= signalStr ? (signalStr >= 4 ? COLORS.flora : COLORS.ember) : COLORS.ash + '20',
              borderRadius: 1, transition: 'all 0.2s',
            }} />
          ))}
        </div>

        {/* Static noise indicator */}
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, textAlign: 'center',
          marginBottom: 20, letterSpacing: 2,
        }}>
          STATIC: {Math.round(noiseLevel * 100)}% {diff < 0.5 ? '— SIGNAL LOCKED' : diff < 2 ? '— GETTING CLOSER' : '— SEARCHING...'}
        </div>

        {/* Dial */}
        <div ref={dialRef} onMouseDown={handleDown} onTouchStart={handleDown} style={{
          height: 40, background: '#111', border: `1px solid ${COLORS.ash}30`, position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab', borderRadius: 4, marginBottom: 20, touchAction: 'none',
        }}>
          {/* Scale marks */}
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: 4, left: `${(i / 20) * 100}%`,
              width: 1, height: i % 5 === 0 ? 12 : 6, background: COLORS.ash + '40',
            }} />
          ))}
          {/* Indicator */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${((freq - 87.5) / 20.5) * 100}%`, width: 3,
            background: diff < 0.5 ? COLORS.flora : COLORS.ember,
            boxShadow: `0 0 8px ${diff < 0.5 ? COLORS.flora : COLORS.ember}`,
            transform: 'translateX(-50%)', transition: isDragging ? 'none' : 'left 0.1s',
          }} />
          {/* Scale labels */}
          <div style={{ position: 'absolute', bottom: -16, left: 0, fontFamily: "'Space Mono', monospace", fontSize: 8, color: COLORS.ash + '50' }}>88</div>
          <div style={{ position: 'absolute', bottom: -16, right: 0, fontFamily: "'Space Mono', monospace", fontSize: 8, color: COLORS.ash + '50' }}>108</div>
        </div>

        {/* Lock button */}
        <button onClick={handleLock} disabled={success} style={{
          width: '100%', padding: '12px', background: success ? COLORS.flora + '20' : 'transparent',
          border: `2px solid ${success ? COLORS.flora : COLORS.ember}`,
          color: success ? COLORS.flora : COLORS.ember,
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, cursor: 'pointer',
        }}>{success ? '✓ SIGNAL ACQUIRED' : 'LOCK FREQUENCY'}</button>

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
};
