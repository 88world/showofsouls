import { useState, useCallback } from 'react';
import { useGlobalEvent } from '../GlobalEventProvider';
import './PuzzleFragment.css';

// ═══════════════════════════════════════════════════════════════
// PUZZLE FRAGMENT - Retro TV mini-puzzle component
// 
// Embeds a small "TV screen" puzzle on each page. Each fragment
// has its own puzzle type (cipher, sequence, riddle, etc.) and
// reveals a piece of data when solved.
//
// Fragment types (template — content provided later):
//  - cipher:    Decode an encoded message
//  - sequence:  Enter a number/letter sequence
//  - riddle:    Answer a riddle or question
//  - hidden:    Click/interact to reveal
//  - observe:   Find something on the page
//
// Props:
//  - fragmentId: unique ID matching event puzzle_data
//  - type: 'cipher' | 'sequence' | 'riddle' | 'hidden' | 'observe'
//  - prompt: the puzzle text shown to users
//  - solution: correct answer (checked case-insensitive)
//  - hint: optional hint text
//  - revealData: data shown after solving (the "fragment piece")
//  - channel: TV channel label (e.g. "CH.03", "FREQ.7")
//  - label: fragment type label (e.g. "CIPHER", "SEQUENCE")
// ═══════════════════════════════════════════════════════════════

export default function PuzzleFragment({
  fragmentId,
  type = 'cipher',
  prompt = 'SIGNAL CORRUPTED — DECODE TO RECOVER',
  solution = '',
  hint = '',
  revealData = 'FRAGMENT DATA',
  channel = 'CH.??',
  label = 'FRAGMENT',
}) {
  const { collectFragment, hasFragment } = useGlobalEvent();
  const isCollected = hasFragment(fragmentId);

  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [showPuzzle, setShowPuzzle] = useState(false);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    
    if (!solution) return;

    if (input.trim().toUpperCase() === solution.toUpperCase()) {
      collectFragment(fragmentId, revealData);
      setError('');
      setInput('');
    } else {
      setError('SIGNAL MISMATCH — TRY AGAIN');
      setTimeout(() => setError(''), 3000);
    }
  }, [input, solution, fragmentId, revealData, collectFragment]);

  const handleHiddenClick = useCallback(() => {
    if (type === 'hidden') {
      collectFragment(fragmentId, revealData);
    }
  }, [type, fragmentId, revealData, collectFragment]);

  // ─── Collected state ───
  if (isCollected) {
    return (
      <div className="puzzle-fragment collected">
        <div className="fragment-tv-frame">
          <div className="fragment-screen">
            <div className="fragment-scanlines" />
            <div className="fragment-vignette" />
            
            <div className="fragment-header">
              <div className="fragment-channel">
                <div className="fragment-signal-dot" />
                <span>{channel}</span>
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: '#00ff66', letterSpacing: 1 }}>
                DECODED
              </span>
            </div>

            <div className="fragment-solved">
              <div className="fragment-solved-label">FRAGMENT RECOVERED</div>
              <div className="fragment-solved-data">{revealData}</div>
            </div>

            <div className="fragment-footer">
              <span className="fragment-type-label">{label}</span>
              <span className="fragment-status">COLLECTED</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Unsolved state ───
  return (
    <div 
      className="puzzle-fragment"
      onClick={type === 'hidden' ? handleHiddenClick : () => setShowPuzzle(true)}
    >
      <div className="fragment-tv-frame">
        <div className="fragment-screen">
          <div className="fragment-scanlines" />
          <div className="fragment-vignette" />

          <div className="fragment-header">
            <div className="fragment-channel">
              <div className="fragment-signal-dot" />
              <span>{channel}</span>
            </div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 7, color: '#c41e1e', letterSpacing: 1 }}>
              CORRUPTED
            </span>
          </div>

          <div className="fragment-content">
            {!showPuzzle ? (
              // Teaser state — distorted signal
              <div className="fragment-static">
                <div className="distorted">{prompt}</div>
                <div style={{ marginTop: 12, fontSize: 9, color: '#444' }}>
                  {'[ CLICK TO TUNE IN ]'}
                </div>
              </div>
            ) : (
              // Active puzzle state
              <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  color: '#888',
                  marginBottom: 12,
                  lineHeight: 1.6,
                  textAlign: 'center',
                }}>
                  {prompt}
                </div>

                {(type === 'cipher' || type === 'sequence' || type === 'riddle') && (
                  <>
                    <input
                      type="text"
                      className="fragment-cipher-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="ENTER ANSWER..."
                      autoFocus
                    />
                    <button type="submit" className="fragment-submit">
                      TRANSMIT
                    </button>
                  </>
                )}

                {error && <div className="fragment-error">{error}</div>}
                {hint && <div className="fragment-hint">{hint}</div>}
              </form>
            )}
          </div>

          <div className="fragment-footer">
            <span className="fragment-type-label">{label}</span>
            <span className="fragment-status">LOCKED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
