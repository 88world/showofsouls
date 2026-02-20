import { useState, useRef, useEffect } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// ═══════════════════════════════════════════════════════════════
// SPECTRAL ANALYSIS — Match a hidden frequency spectrum with sliders
// Global Event Puzzle — Hidden on TapesPage
// ═══════════════════════════════════════════════════════════════

const BAND_COUNT = 8;
const MAX_LEVEL = 7;

function generateTarget() {
  return Array.from({ length: BAND_COUNT }, () => Math.floor(Math.random() * (MAX_LEVEL + 1)));
}

function getOrCreateTarget() {
  const stored = localStorage.getItem('sos_event_spectral');
  if (stored) {
    try {
      const arr = JSON.parse(stored);
      if (arr.length === BAND_COUNT) return arr;
    } catch {}
  }
  const target = generateTarget();
  localStorage.setItem('sos_event_spectral', JSON.stringify(target));
  return target;
}

const BAND_LABELS = ['63', '125', '250', '500', '1K', '2K', '4K', '8K'];

export const SpectralAnalysis = ({ isOpen, onClose, onSuccess }) => {
  const target = useRef(getOrCreateTarget());
  const [levels, setLevels] = useState(Array(BAND_COUNT).fill(0));
  const [success, setSuccess] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [matchPercent, setMatchPercent] = useState(0);
  const [showTarget, setShowTarget] = useState(true);
  const [scanLine, setScanLine] = useState(0);

  // Scanning animation
  useEffect(() => {
    if (!scanning) return;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setScanLine(frame % 100);
      if (frame >= 100) {
        clearInterval(interval);
        setScanning(false);
        // Check result
        const correct = levels.filter((l, i) => l === target.current[i]).length;
        const pct = Math.round((correct / BAND_COUNT) * 100);
        setMatchPercent(pct);
        if (correct === BAND_COUNT) {
          setSuccess(true);
          setTimeout(() => { onSuccess(); onClose(); }, 1200);
        }
      }
    }, 20);
    return () => clearInterval(interval);
  }, [scanning]);

  const adjustBand = (idx, delta) => {
    if (success || scanning) return;
    setLevels(prev => {
      const next = [...prev];
      next[idx] = Math.max(0, Math.min(MAX_LEVEL, next[idx] + delta));
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.flora}`, padding: 32, maxWidth: 520, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.flora, letterSpacing: 4, marginBottom: 8 }}>SPECTRAL ANALYSIS</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 8 }}>MATCH THE ANOMALOUS FREQUENCY SIGNATURE</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 24 }}>Adjust each band to match the target spectrum</div>

        {/* Target spectrum mini display */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash, letterSpacing: 2, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>TARGET SIGNATURE</span>
            <span onClick={() => setShowTarget(!showTarget)} style={{ cursor: 'pointer', color: COLORS.flora }}>{showTarget ? 'HIDE' : 'SHOW'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 40, padding: '0 8px', background: '#060606', border: `1px solid ${COLORS.ash}15`, justifyContent: 'center' }}>
            {target.current.map((h, i) => (
              <div key={i} style={{
                width: 24, height: showTarget ? Math.max(3, h * 5) : 3,
                background: showTarget ? `${COLORS.flora}60` : `${COLORS.ash}20`,
                borderRadius: '2px 2px 0 0', transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Equalizer controls */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20,
          background: '#060606', border: `1px solid ${COLORS.ash}15`, padding: '20px 12px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Scan line */}
          {scanning && (
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 2,
              background: COLORS.flora, top: `${scanLine}%`,
              boxShadow: `0 0 8px ${COLORS.flora}`, transition: 'top 0.02s linear',
            }} />
          )}

          {levels.map((level, i) => {
            const isCorrect = level === target.current[i];
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {/* Up button */}
                <button onClick={() => adjustBand(i, 1)} style={{
                  width: 28, height: 20, background: '#111', border: `1px solid ${COLORS.ash}30`,
                  color: COLORS.ash, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>▲</button>

                {/* Bar */}
                <div style={{ width: 28, height: 80, background: '#111', border: `1px solid ${COLORS.ash}15`, position: 'relative', display: 'flex', flexDirection: 'column-reverse' }}>
                  <div style={{
                    height: `${(level / MAX_LEVEL) * 100}%`,
                    background: success && isCorrect ? COLORS.flora : isCorrect ? COLORS.flora + '80' : COLORS.ember,
                    transition: 'all 0.15s',
                    boxShadow: isCorrect ? `0 0 6px ${COLORS.flora}30` : 'none',
                  }} />
                </div>

                {/* Down button */}
                <button onClick={() => adjustBand(i, -1)} style={{
                  width: 28, height: 20, background: '#111', border: `1px solid ${COLORS.ash}30`,
                  color: COLORS.ash, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>▼</button>

                {/* Label */}
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: COLORS.ash, letterSpacing: 1 }}>{BAND_LABELS[i]}</div>
              </div>
            );
          })}
        </div>

        {/* Status */}
        {matchPercent > 0 && !success && (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: matchPercent >= 75 ? COLORS.flora : COLORS.crimson, marginBottom: 12, textAlign: 'center' }}>
            MATCH: {matchPercent}% — {matchPercent >= 75 ? 'CLOSE' : 'ADJUST BANDS'}
          </div>
        )}
        {success && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, marginBottom: 12, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><IconComponent icon={Icons.CheckCircle2} size={14} color={COLORS.flora} />ANOMALY FREQUENCY LOCKED</div>}

        <button onClick={() => !scanning && setScanning(true)} disabled={success || scanning} style={{
          width: '100%', padding: '12px', background: 'transparent',
          border: `2px solid ${success ? COLORS.flora : scanning ? COLORS.ash + '40' : COLORS.flora}`,
          color: success ? COLORS.flora : scanning ? COLORS.ash : COLORS.flora,
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, cursor: scanning ? 'wait' : 'pointer',
        }}>{success ? (<><IconComponent icon={Icons.CheckCircle2} size={12} color={COLORS.flora} /> SPECTRUM MATCHED</>) : scanning ? 'SCANNING...' : 'RUN ANALYSIS'}</button>

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}><IconComponent icon={Icons.X} size={18} color={COLORS.ash} /></button>
      </div>
    </div>
  );
};
