import { useState, useRef, useEffect } from 'react';
import { COLORS } from '../../../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// REDACTION REVEAL — Click redacted text blocks in the right order
// Unlocks: Document
// ═══════════════════════════════════════════════════════════════

const CLUE_SETS = [
  {
    text: 'The [FIRST] thing they noticed was the [SECOND] mark on the wall, shaped like a [THIRD] eye. The [FOURTH] thing was the silence.',
    order: ['FIRST', 'SECOND', 'THIRD', 'FOURTH'],
    hint: 'Follow the natural reading order of the text.',
  },
  {
    text: 'Subject [ALPHA] reported hearing [BETA] voices from the basement. Report filed under [GAMMA] classification. Supervisor [DELTA] signed off.',
    order: ['ALPHA', 'BETA', 'GAMMA', 'DELTA'],
    hint: 'Greek alphabet sequence: α, β, γ, δ',
  },
  {
    text: 'On the [THIRD] floor, past the [FIRST] door and [SECOND] hallway, lies the [FOURTH] chamber.',
    order: ['FIRST', 'SECOND', 'THIRD', 'FOURTH'],
    hint: 'Ordinal numbers: First, Second, Third, Fourth.',
  },
];

function getOrCreateClue() {
  const stored = localStorage.getItem('sos_puzzle_redact');
  if (stored) {
    const idx = parseInt(stored);
    if (idx >= 0 && idx < CLUE_SETS.length) return idx;
  }
  const idx = Math.floor(Math.random() * CLUE_SETS.length);
  localStorage.setItem('sos_puzzle_redact', idx.toString());
  return idx;
}

export const RedactionReveal = ({ isOpen, onClose, onSuccess }) => {
  const clueIdx = useRef(getOrCreateClue());
  const clue = CLUE_SETS[clueIdx.current];
  const [revealed, setRevealed] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Parse text into segments
  const segments = clue.text.split(/(\[[A-Z]+\])/);

  const handleBlockClick = (label) => {
    if (success || revealed.includes(label)) return;
    
    const expectedIdx = revealed.length;
    const expectedLabel = clue.order[expectedIdx];
    
    if (label === expectedLabel) {
      const next = [...revealed, label];
      setRevealed(next);
      setError('');
      
      if (next.length === clue.order.length) {
        setSuccess(true);
        setTimeout(() => { onSuccess(); onClose(); }, 1200);
      }
    } else {
      setError('WRONG ORDER — RESET');
      setRevealed([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.ember}`, padding: 32, maxWidth: 520, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.ember, letterSpacing: 4, marginBottom: 8 }}>REDACTION REVEAL</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 8 }}>CLASSIFIED DOCUMENT — LEVEL 4</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 24 }}>Click the redacted blocks in the correct order to reveal the text</div>

        {/* Document */}
        <div style={{
          background: '#0d0d0a', border: `1px solid ${COLORS.ash}20`, padding: 20, marginBottom: 20,
          fontFamily: "'Crimson Text', serif", fontSize: 16, lineHeight: 2, color: COLORS.bone,
        }}>
          {segments.map((seg, i) => {
            const match = seg.match(/^\[([A-Z]+)\]$/);
            if (match) {
              const label = match[1];
              const isRevealed = revealed.includes(label);
              return (
                <span key={i} onClick={() => handleBlockClick(label)} style={{
                  display: 'inline-block', padding: '2px 8px', margin: '0 2px',
                  background: isRevealed ? COLORS.flora + '20' : COLORS.crimson + '40',
                  border: `1px solid ${isRevealed ? COLORS.flora + '40' : COLORS.crimson + '60'}`,
                  color: isRevealed ? COLORS.flora : 'transparent',
                  cursor: isRevealed ? 'default' : 'pointer',
                  fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2,
                  textShadow: isRevealed ? 'none' : 'none',
                  userSelect: 'none', transition: 'all 0.3s',
                  minWidth: 50, textAlign: 'center',
                }}>
                  {isRevealed ? label : '█████'}
                </span>
              );
            }
            return <span key={i}>{seg}</span>;
          })}
        </div>

        {/* Progress */}
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>REVEALED: {revealed.length}/{clue.order.length}</span>
          <span onClick={() => setShowHint(!showHint)} style={{ cursor: 'pointer', color: COLORS.ember }}>
            {showHint ? 'HIDE HINT' : 'SHOW HINT'}
          </span>
        </div>

        {showHint && (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash + '80', marginBottom: 12, fontStyle: 'italic' }}>
            HINT: {clue.hint}
          </div>
        )}

        {error && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.crimson, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, marginBottom: 12, textAlign: 'center' }}>✓ DOCUMENT DECLASSIFIED</div>}

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
};
