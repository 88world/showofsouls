import { useState, useRef } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// ═══════════════════════════════════════════════════════════════
// KEYPAD LOCK — Enter a 4-digit code with clues hidden in puzzle
// Unlocks: Document
// ═══════════════════════════════════════════════════════════════

const CLUE_SETS = [
  { code: '6613', clues: ['The year of the incident: 1966, reversed middle two digits.', 'Sum of all digits = 16', 'First digit is 6, last digit is 3'] },
  { code: '4729', clues: ['Fourth prime, seventh letter, two squared, 3²', 'Each digit is unique', 'The digits descend then ascend'] },
  { code: '1308', clues: ['Friday the ___th, reversed, followed by 08', 'No digit repeats', 'The middle two digits are 3 and 0'] },
  { code: '5541', clues: ['Five-five-four-one', 'The first two digits are the same', 'Sum is 15'] },
];

function getOrCreateCode() {
  const stored = localStorage.getItem('sos_puzzle_keypad');
  if (stored) {
    const idx = parseInt(stored);
    if (idx >= 0 && idx < CLUE_SETS.length) return idx;
  }
  const idx = Math.floor(Math.random() * CLUE_SETS.length);
  localStorage.setItem('sos_puzzle_keypad', idx.toString());
  return idx;
}

export const KeypadLock = ({ isOpen, onClose, onSuccess }) => {
  const clueIdx = useRef(getOrCreateCode());
  const clueSet = CLUE_SETS[clueIdx.current];
  const [digits, setDigits] = useState(['', '', '', '']);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showClue, setShowClue] = useState(0);

  const handleDigit = (num) => {
    if (success) return;
    const nextEmpty = digits.findIndex(d => d === '');
    if (nextEmpty === -1) return;
    setDigits(prev => {
      const next = [...prev];
      next[nextEmpty] = num.toString();
      return next;
    });
  };

  const handleBackspace = () => {
    const lastFilled = digits.reduce((last, d, i) => d !== '' ? i : last, -1);
    if (lastFilled === -1) return;
    setDigits(prev => {
      const next = [...prev];
      next[lastFilled] = '';
      return next;
    });
  };

  const handleClear = () => {
    setDigits(['', '', '', '']);
    setError('');
  };

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length < 4) { setError('ENTER ALL 4 DIGITS'); return; }
    
    if (code === clueSet.code) {
      setSuccess(true);
      setError('');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } else {
      setAttempts(a => a + 1);
      setError(`ACCESS DENIED — ATTEMPT ${attempts + 1}`);
      setDigits(['', '', '', '']);
      // Show more clues after failed attempts
      if (showClue < clueSet.clues.length - 1) {
        setShowClue(s => s + 1);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.ember}`, padding: 32, maxWidth: 380, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.ember, letterSpacing: 4, marginBottom: 8 }}>KEYPAD LOCK</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 20 }}>ENTER ACCESS CODE</div>

        {/* Code display */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          {digits.map((d, i) => (
            <div key={i} style={{
              width: 48, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#111', border: `2px solid ${d ? COLORS.ember : COLORS.ash + '30'}`,
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: COLORS.ember,
              boxShadow: d ? `0 0 8px ${COLORS.ember}20` : 'none',
            }}>
              {d || '·'}
            </div>
          ))}
        </div>

        {/* Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16, maxWidth: 240, margin: '0 auto 16px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handleDigit(n)} style={{
              padding: '14px', background: '#111', border: `1px solid ${COLORS.ash}20`,
              color: COLORS.bone, fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
              cursor: 'pointer', transition: 'all 0.1s',
            }}>{n}</button>
          ))}
          <button onClick={handleClear} style={{
            padding: '14px', background: '#111', border: `1px solid ${COLORS.crimson}30`,
            color: COLORS.crimson, fontFamily: "'Space Mono', monospace", fontSize: 10,
            cursor: 'pointer', letterSpacing: 1,
          }}>CLR</button>
          <button onClick={() => handleDigit(0)} style={{
            padding: '14px', background: '#111', border: `1px solid ${COLORS.ash}20`,
            color: COLORS.bone, fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
            cursor: 'pointer',
          }}>0</button>
          <button onClick={handleBackspace} style={{
            padding: '14px', background: '#111', border: `1px solid ${COLORS.ash}20`,
            color: COLORS.ash, fontFamily: "'Space Mono', monospace", fontSize: 12,
            cursor: 'pointer',
          }}>←</button>
        </div>

        {/* Clues */}
        <div style={{ marginBottom: 16 }}>
          {clueSet.clues.slice(0, showClue + 1).map((clue, i) => (
            <div key={i} style={{
              fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash + '80',
              letterSpacing: 1, marginBottom: 4, padding: '4px 8px',
              borderLeft: `2px solid ${COLORS.ember}30`,
            }}>
              CLUE {i + 1}: {clue}
            </div>
          ))}
        </div>

        {error && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.crimson, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, marginBottom: 12, textAlign: 'center', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}><IconComponent icon={Icons.CheckCircle2} size={14} color={COLORS.flora} />ACCESS GRANTED</div>}

        <button onClick={handleSubmit} disabled={success} style={{
          width: '100%', padding: '12px', background: 'transparent',
          border: `2px solid ${success ? COLORS.flora : COLORS.ember}`,
          color: success ? COLORS.flora : COLORS.ember,
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, cursor: 'pointer',
        }}>{success ? (<><IconComponent icon={Icons.CheckCircle2} size={12} color={COLORS.flora} /> UNLOCKED</>) : 'ENTER CODE'}</button>

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}><IconComponent icon={Icons.X} size={18} color={COLORS.ash} /></button>
      </div>
    </div>
  );
};
