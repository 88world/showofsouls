import { useState, useRef, useEffect } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// ═══════════════════════════════════════════════════════════════
// FILE DECRYPTOR — Collect scattered hex fragments and type the code
// Unlocks: Document
// ═══════════════════════════════════════════════════════════════

const HEX_CHARS = '0123456789ABCDEF';

function generateHexCode(len = 8) {
  return Array.from({ length: len }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('');
}

function getOrCreateHex() {
  const stored = localStorage.getItem('sos_puzzle_hex');
  if (stored && stored.length === 8 && /^[0-9A-F]+$/.test(stored)) return stored;
  const code = generateHexCode();
  localStorage.setItem('sos_puzzle_hex', code);
  return code;
}

// Generate scrambled positions for hex fragments
function generateFragmentPositions(code) {
  return code.split('').map((char, i) => ({
    char,
    index: i,
    x: 15 + Math.random() * 70, // %
    y: 10 + Math.random() * 70, // %
    rotation: Math.floor(Math.random() * 40) - 20,
    found: false,
  }));
}

export const FileDecryptor = ({ isOpen, onClose, onSuccess }) => {
  const hexCode = useRef(getOrCreateHex());
  const [fragments, setFragments] = useState(() => generateFragmentPositions(hexCode.current));
  const [input, setInput] = useState('');
  const [foundCount, setFoundCount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showField, setShowField] = useState(false);

  const handleFragmentClick = (idx) => {
    if (success || fragments[idx].found) return;
    setFragments(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], found: true };
      return next;
    });
    setFoundCount(c => c + 1);
  };

  useEffect(() => {
    if (foundCount >= fragments.length && !showField) {
      setShowField(true);
    }
  }, [foundCount, fragments.length, showField]);

  const handleSubmit = () => {
    if (input.toUpperCase() === hexCode.current) {
      setSuccess(true);
      setError('');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } else {
      setError('DECRYPTION FAILED — INVALID KEY');
    }
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.ember}`, padding: 32, maxWidth: 500, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.ember, letterSpacing: 4, marginBottom: 8 }}>FILE DECRYPTOR</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 8 }}>ENCRYPTED FILE DETECTED</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 24 }}>Find all hex fragments, then enter the decryption key</div>

        {/* Fragment area */}
        <div style={{
          position: 'relative', height: 200, background: '#070707',
          border: `1px solid ${COLORS.ash}20`, marginBottom: 20, overflow: 'hidden',
        }}>
          {/* Grid decoration */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${i * 10}%`, top: 0, bottom: 0,
              borderLeft: `1px solid ${COLORS.ash}08`,
            }} />
          ))}

          {fragments.map((frag, i) => (
            <div
              key={i}
              onClick={() => handleFragmentClick(i)}
              style={{
                position: 'absolute',
                left: `${frag.x}%`, top: `${frag.y}%`,
                transform: `rotate(${frag.rotation}deg)`,
                fontFamily: "'Space Mono', monospace",
                fontSize: frag.found ? 18 : 14,
                color: frag.found ? COLORS.flora : COLORS.ember + '60',
                cursor: frag.found ? 'default' : 'pointer',
                userSelect: 'none', transition: 'all 0.3s',
                textShadow: frag.found ? `0 0 8px ${COLORS.flora}40` : 'none',
                padding: 4,
              }}
            >
              <span style={{ opacity: frag.found ? 1 : 0.5 }}>
                {frag.found ? `[${frag.index}]${frag.char}` : '?'}
              </span>
            </div>
          ))}

          {/* Scanlines */}
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)', pointerEvents: 'none' }} />
        </div>

        {/* Progress */}
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash,
          marginBottom: 12, display: 'flex', justifyContent: 'space-between',
        }}>
          <span>FRAGMENTS: {foundCount}/{fragments.length}</span>
          <span style={{ color: foundCount >= fragments.length ? COLORS.flora : COLORS.ash }}>
            {foundCount >= fragments.length ? 'ALL FOUND — ENTER KEY' : 'SEARCHING...'}
          </span>
        </div>

        {/* Input field */}
        {showField && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash, letterSpacing: 2, marginBottom: 6 }}>
              DECRYPTION KEY (8 HEX CHARS)
            </div>
            <input
              type="text"
              maxLength={8}
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ''))}
              placeholder="ENTER HEX CODE..."
              style={{
                width: '100%', padding: '10px 12px', background: '#111',
                border: `1px solid ${COLORS.ash}30`, color: COLORS.flora,
                fontFamily: "'Space Mono', monospace", fontSize: 18, letterSpacing: 6,
                textAlign: 'center', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {error && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.crimson, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        {success && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, marginBottom: 12 }}>
            <IconComponent icon={Icons.CheckCircle2} />
            <span>FILE DECRYPTED</span>
          </div>
        )}

        <button onClick={handleSubmit} disabled={success || !showField} style={{
          width: '100%', padding: '12px', background: 'transparent',
          border: `2px solid ${success ? COLORS.flora : showField ? COLORS.ember : COLORS.ash + '30'}`,
          color: success ? COLORS.flora : showField ? COLORS.ember : COLORS.ash + '30',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, cursor: showField ? 'pointer' : 'default',
        }}>{success ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.CheckCircle2} />DECRYPTED</span>
        ) : 'DECRYPT FILE'}</button>

        <button onClick={onClose} aria-label="Close file decryptor" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>
          <IconComponent icon={Icons.X} />
        </button>
      </div>
    </div>
  );
};
