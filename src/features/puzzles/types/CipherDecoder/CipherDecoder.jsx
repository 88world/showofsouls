import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// ═══════════════════════════════════════════════════════════════
// CIPHER DECODER — Decode a substitution cipher message
// Global Event Puzzle — Hidden on IncidentPage
// ═══════════════════════════════════════════════════════════════

const PHRASES = [
  { plain: 'THE SIGNAL IS ALIVE', hint: 'THE S____L IS A___E' },
  { plain: 'SOULS ARE WATCHING', hint: 'S___S ARE W______G' },
  { plain: 'THEY CANNOT ESCAPE', hint: 'T__Y C____T E____E' },
  { plain: 'BROADCAST THE TRUTH', hint: 'B______ST THE T___H' },
  { plain: 'THE SHOW NEVER ENDS', hint: 'THE S__W N___R E__S' },
];

function createCipherMap() {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const shuffled = [...alpha].sort(() => Math.random() - 0.5);
  const map = {};
  alpha.forEach((letter, idx) => { map[letter] = shuffled[idx]; });
  return map;
}

function getOrCreatePuzzle() {
  const stored = localStorage.getItem('sos_event_cipher');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.phrase && data.cipherMap) return data;
    } catch {}
  }
  const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
  const cipherMap = createCipherMap();
  const data = { phrase, cipherMap };
  localStorage.setItem('sos_event_cipher', JSON.stringify(data));
  return data;
}

export const CipherDecoder = ({ isOpen, onClose, onSuccess }) => {
  const puzzleData = useRef(getOrCreatePuzzle());
  const { phrase, cipherMap } = puzzleData.current;
  const reverseMap = useRef({});

  // Build reverse map: ciphered → plain
  Object.entries(cipherMap).forEach(([plain, cipher]) => { reverseMap.current[cipher] = plain; });

  const cipherText = phrase.plain.split('').map(ch => ch === ' ' ? ' ' : cipherMap[ch] || ch).join('');
  const uniqueLetters = [...new Set(phrase.plain.replace(/ /g, '').split(''))];

  const [guesses, setGuesses] = useState({});
  const [success, setSuccess] = useState(false);
  const [selectedCipher, setSelectedCipher] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const handleGuess = (cipherLetter, plainGuess) => {
    if (success) return;
    const upper = plainGuess.toUpperCase();
    if (!/^[A-Z]$/.test(upper)) return;
    setGuesses(prev => ({ ...prev, [cipherLetter]: upper }));
    setSelectedCipher(null);
  };

  const checkSolution = () => {
    setAttempts(a => a + 1);
    const decoded = cipherText.split('').map(ch => {
      if (ch === ' ') return ' ';
      return guesses[ch] || '?';
    }).join('');

    if (decoded === phrase.plain) {
      setSuccess(true);
      localStorage.removeItem('sos_event_cipher');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    }
  };

  const getDecodedPercent = () => {
    const letters = cipherText.replace(/ /g, '').split('');
    const correct = letters.filter(ch => guesses[ch] === reverseMap.current[ch]).length;
    return Math.round((correct / letters.length) * 100);
  };

  if (!isOpen) return null;

  const words = cipherText.split(' ');

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.crimson}`, padding: 28, maxWidth: 540, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.crimson, letterSpacing: 4, marginBottom: 8 }}>CIPHER DECODER</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 6 }}>INTERCEPTED TRANSMISSION — DECODE THE MESSAGE</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 6 }}>HINT: {phrase.hint}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash, letterSpacing: 1, marginBottom: 20 }}>Click a cipher letter, then type your guess</div>

        {/* Cipher text display */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          {words.map((word, wi) => (
            <div key={wi} style={{ display: 'flex', gap: 2 }}>
              {word.split('').map((ch, ci) => {
                const isSelected = selectedCipher === ch;
                const guessed = guesses[ch];
                const isCorrect = guessed && guessed === reverseMap.current[ch];
                return (
                  <div key={ci} onClick={() => !success && setSelectedCipher(ch)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer',
                  }}>
                    {/* Cipher letter on top */}
                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 12, color: COLORS.crimson,
                      width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      letterSpacing: 1,
                    }}>{ch}</div>
                    {/* Guess slot */}
                    <div style={{
                      width: 22, height: 22,
                      border: `1px solid ${isSelected ? COLORS.flora : isCorrect ? COLORS.flora + '60' : COLORS.ash + '30'}`,
                      background: isSelected ? COLORS.flora + '15' : isCorrect ? COLORS.flora + '08' : '#111',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Space Mono', monospace", fontSize: 13,
                      color: isCorrect ? COLORS.flora : COLORS.bone,
                      letterSpacing: 1, transition: 'all 0.15s',
                    }}>{guessed || ''}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Input catcher for selected cipher letter */}
        {selectedCipher && !success && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash }}>
              Mapping <span style={{ color: COLORS.crimson }}>{selectedCipher}</span> → 
            </span>
            <input
              autoFocus
              maxLength={1}
              style={{
                width: 24, height: 24, textAlign: 'center', background: '#111',
                border: `1px solid ${COLORS.flora}`, color: COLORS.flora,
                fontFamily: "'Space Mono', monospace", fontSize: 14, outline: 'none',
                marginLeft: 4,
              }}
              onKeyDown={e => {
                if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                  handleGuess(selectedCipher, e.key);
                } else if (e.key === 'Escape') {
                  setSelectedCipher(null);
                }
              }}
            />
          </div>
        )}

        {/* Status */}
        {attempts > 0 && !success && (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: getDecodedPercent() >= 80 ? COLORS.flora : COLORS.crimson, textAlign: 'center', marginBottom: 12 }}>
            DECODED: {getDecodedPercent()}% — {getDecodedPercent() >= 80 ? 'ALMOST THERE' : 'KEEP DECODING'}
          </div>
        )}
        {success && (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, textAlign: 'center', marginBottom: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.CheckCircle2} size={14} color={COLORS.flora} />TRANSMISSION DECODED</span>
          </div>
        )}

        <button onClick={checkSolution} disabled={success} style={{
          width: '100%', padding: '12px', background: 'transparent',
          border: `2px solid ${success ? COLORS.flora : COLORS.crimson}`,
          color: success ? COLORS.flora : COLORS.crimson,
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, cursor: 'pointer',
        }}>{success ? (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.CheckCircle2} size={14} />DECODED</span>) : 'VERIFY DECODE'}</button>

        <button onClick={onClose} aria-label="Close cipher decoder" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>
          <IconComponent icon={Icons.X} />
        </button>
      </div>
    </div>
  );
};
