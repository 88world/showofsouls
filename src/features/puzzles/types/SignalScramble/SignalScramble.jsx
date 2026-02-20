import { useState, useRef } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// ═══════════════════════════════════════════════════════════════
// SIGNAL SCRAMBLE — Unscramble a corrupted word (anagram)
// Unlocks: Recording
// ═══════════════════════════════════════════════════════════════

const WORDS = ['STATIC', 'SIGNAL', 'BREACH', 'MEDIUM', 'SPIRIT', 'VESSEL', 'RITUAL', 'ASYLUM'];

function scrambleWord(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.join('') === word) return scrambleWord(word); // re-scramble if same
  return arr.join('');
}

function getOrCreateWord() {
  const stored = localStorage.getItem('sos_puzzle_scramble');
  if (stored && WORDS.includes(stored)) return stored;
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  localStorage.setItem('sos_puzzle_scramble', word);
  return word;
}

export const SignalScramble = ({ isOpen, onClose, onSuccess }) => {
  const answer = useRef(getOrCreateWord());
  const scrambled = useRef(scrambleWord(answer.current));
  const [tiles, setTiles] = useState(scrambled.current.split(''));
  const [selected, setSelected] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleTileClick = (idx) => {
    if (success) return;
    if (selected === null) {
      setSelected(idx);
    } else {
      // Swap tiles
      setTiles(prev => {
        const next = [...prev];
        [next[selected], next[idx]] = [next[idx], next[selected]];
        return next;
      });
      setSelected(null);
    }
  };

  const handleSubmit = () => {
    const word = tiles.join('');
    if (word === answer.current) {
      setSuccess(true);
      setError('');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } else {
      setAttempts(a => a + 1);
      setError(`TRANSMISSION CORRUPTED — TRY AGAIN (${attempts + 1})`);
    }
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.ember}`, padding: 32, maxWidth: 440, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.ember, letterSpacing: 4, marginBottom: 8 }}>SIGNAL SCRAMBLE</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 8 }}>CORRUPTED TRANSMISSION DETECTED</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 24 }}>Swap letter tiles to decode the original word</div>

        {/* Letter tiles */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          {tiles.map((char, i) => (
            <div
              key={i}
              onClick={() => handleTileClick(i)}
              style={{
                width: 48, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2,
                background: selected === i ? COLORS.ember + '30' : '#111',
                border: `2px solid ${selected === i ? COLORS.ember : COLORS.ash + '30'}`,
                color: selected === i ? COLORS.ember : COLORS.bone,
                cursor: 'pointer', userSelect: 'none',
                boxShadow: selected === i ? `0 0 12px ${COLORS.ember}30` : 'none',
                transition: 'all 0.15s',
              }}
            >
              {char}
            </div>
          ))}
        </div>

        {/* Glitch decoration */}
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash + '40', textAlign: 'center', marginBottom: 16, letterSpacing: 6 }}>
          {'█░▓░█░▓░█░▓░█'}
        </div>

        {error && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.crimson, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, marginBottom: 12, textAlign: 'center', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}><IconComponent icon={Icons.CheckCircle2} size={14} color={COLORS.flora} />SIGNAL DECODED: {answer.current}</div>}

        <button onClick={handleSubmit} disabled={success} style={{
          width: '100%', padding: '12px', background: 'transparent',
          border: `2px solid ${success ? COLORS.flora : COLORS.ember}`,
          color: success ? COLORS.flora : COLORS.ember,
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, cursor: 'pointer',
        }}>{success ? (<><IconComponent icon={Icons.CheckCircle2} size={12} color={COLORS.flora} /> DECODED</>) : 'TRANSMIT'}</button>

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}><IconComponent icon={Icons.X} size={18} color={COLORS.ash} /></button>
      </div>
    </div>
  );
};
