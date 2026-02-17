import { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../../../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// MORSE DECODER — Listen to morse beeps, type the decoded word
// Unlocks: Recording
// ═══════════════════════════════════════════════════════════════

const MORSE_MAP = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
  H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
  O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
};

const WORDS = ['FLORA', 'DECAY', 'HAUNT', 'BONES', 'CRYPT', 'SHADE', 'DREAD', 'SPINE'];

function getOrCreateMorseWord() {
  const stored = localStorage.getItem('sos_puzzle_morse_word');
  if (stored && stored.length >= 4) return stored;
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  localStorage.setItem('sos_puzzle_morse_word', word);
  return word;
}

export const MorseDecoder = ({ isOpen, onClose, onSuccess }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentChar, setCurrentChar] = useState(-1);
  const audioCtx = useRef(null);
  const correctWord = useRef(getOrCreateMorseWord());

  const playMorse = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx.current;
    const word = correctWord.current;
    let time = ctx.currentTime + 0.1;

    for (let ci = 0; ci < word.length; ci++) {
      const morse = MORSE_MAP[word[ci]];
      if (!morse) continue;
      // Highlight current char
      setTimeout(() => setCurrentChar(ci), (time - ctx.currentTime) * 1000);
      for (const symbol of morse) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 700;
        gain.gain.value = 0.15;
        const dur = symbol === '.' ? 0.1 : 0.3;
        osc.start(time);
        osc.stop(time + dur);
        time += dur + 0.1; // gap between symbols
      }
      time += 0.3; // gap between letters
    }
    setTimeout(() => { setPlaying(false); setCurrentChar(-1); }, (time - ctx.currentTime) * 1000);
  }, [playing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.toUpperCase() === correctWord.current) {
      setSuccess(true);
      setError('');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } else {
      setError('INCORRECT TRANSMISSION');
    }
  };

  if (!isOpen) return null;

  const morseDisplay = correctWord.current.split('').map((ch, i) => ({
    letter: '?',
    morse: MORSE_MAP[ch] || '',
    active: i === currentChar,
  }));

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.ember}`, padding: 32, maxWidth: 500, width: 'calc(100% - 32px)', position: 'relative', cursor: 'default' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.ember, letterSpacing: 4, marginBottom: 8 }}>MORSE DECODER</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 24 }}>DECODE THE INTERCEPTED TRANSMISSION</div>

        {/* Morse display */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          {morseDisplay.map((m, i) => (
            <div key={i} style={{
              padding: '8px 12px', background: m.active ? COLORS.ember + '30' : '#111',
              border: `1px solid ${m.active ? COLORS.ember : COLORS.ash + '30'}`,
              fontFamily: "'Space Mono', monospace", fontSize: 18, color: COLORS.bone,
              letterSpacing: 4, textAlign: 'center', minWidth: 60,
              transition: 'all 0.2s',
            }}>
              {m.morse}
            </div>
          ))}
        </div>

        {/* Play button */}
        <button onClick={playMorse} disabled={playing} style={{
          display: 'block', margin: '0 auto 24px', padding: '10px 24px',
          background: playing ? COLORS.ash + '20' : COLORS.ember + '20',
          border: `1px solid ${COLORS.ember}`, color: COLORS.ember,
          fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 2,
          cursor: playing ? 'wait' : 'pointer',
        }}>
          {playing ? '◉ PLAYING...' : '▶ PLAY TRANSMISSION'}
        </button>

        {/* Input */}
        <form onSubmit={handleSubmit}>
          <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
            maxLength={correctWord.current.length} placeholder="TYPE DECODED WORD"
            style={{
              width: '100%', padding: '12px 16px', background: '#111', border: `1px solid ${COLORS.ash}30`,
              color: COLORS.bone, fontFamily: "'Space Mono', monospace", fontSize: 18,
              letterSpacing: 6, textAlign: 'center', outline: 'none', boxSizing: 'border-box',
            }}
          />
          {error && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.crimson, marginTop: 8, textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, marginTop: 8, textAlign: 'center' }}>✓ TRANSMISSION DECODED</div>}
          <button type="submit" disabled={success} style={{
            width: '100%', marginTop: 16, padding: '12px', background: 'transparent',
            border: `2px solid ${success ? COLORS.flora : COLORS.ember}`,
            color: success ? COLORS.flora : COLORS.ember,
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4, cursor: 'pointer',
          }}>SUBMIT</button>
        </form>

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
};
