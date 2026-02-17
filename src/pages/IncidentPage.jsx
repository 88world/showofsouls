import { useState } from 'react';
import { COLORS } from '../utils/constants';
import { useGlobalEvent } from '../features/events/GlobalEventProvider';
import { CipherDecoder } from '../features/puzzles/types/CipherDecoder/CipherDecoder';

// ═══════════════════════════════════════════════════════════════
// INCIDENT PAGE
// Details about the park incident — Hidden Global Event Puzzle
// ═══════════════════════════════════════════════════════════════

const REDACTED_LINES = [
  { text: 'DATE: ██████ 1947', delay: 0 },
  { text: 'LOCATION: FLORA\'S WONDERLAND — SECTOR 7', delay: 1 },
  { text: 'CASUALTIES: ████████████', delay: 2 },
  { text: 'STATUS: ONGOING CONTAINMENT', delay: 3 },
  { text: '', delay: 4 },
  { text: '> At approximately 02:47 AM, multiple animatronic units', delay: 5 },
  { text: '  deviated from standard behavior protocols.', delay: 6 },
  { text: '> Security personnel reported ████████████████', delay: 7 },
  { text: '  ██████████ in the underground service tunnels.', delay: 8 },
  { text: '> Costume storage room B-14 was found ████████', delay: 9 },
  { text: '  with evidence of ████████████████████.', delay: 10 },
  { text: '', delay: 11 },
  { text: '> SUBJECT "FLORA" last seen at Gate 3.', delay: 12 },
  { text: '> All exit routes were sealed from the INSIDE.', delay: 13 },
  { text: '', delay: 14 },
  { text: '> NOTE: Investigators reported hearing', delay: 15 },
  { text: '  a broadcast signal on frequency 104.7 MHz', delay: 16 },
  { text: '  repeating: "THE SHOW MUST GO ON"', delay: 17 },
];

export const IncidentPage = () => {
  const [showCipher, setShowCipher] = useState(false);
  const { markPuzzleComplete, isPuzzleEventComplete } = useGlobalEvent();
  const cipherSolved = isPuzzleEventComplete('cipherDecoder');

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.bone,
      padding: 'clamp(100px, 12vw, 140px) clamp(12px, 4vw, 40px) clamp(30px, 5vw, 60px)',
    }}>
      <CipherDecoder
        isOpen={showCipher}
        onClose={() => setShowCipher(false)}
        onSuccess={() => { markPuzzleComplete('cipherDecoder'); setShowCipher(false); }}
      />

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(40px, 8vw, 80px)',
          letterSpacing: 8,
          color: COLORS.crimson,
          marginBottom: 8,
          textShadow: `2px 2px 0 ${COLORS.signal}40`,
        }}>
          THE INCIDENT
        </h1>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          color: COLORS.crimson,
          letterSpacing: 3,
          marginBottom: 40,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ animation: 'blink 1s infinite' }}>●</span> CLASSIFIED — SECURITY CLEARANCE LEVEL 5
        </div>

        {/* Incident Report */}
        <div style={{
          background: '#0a0808',
          border: `2px solid ${COLORS.ash}30`,
          padding: 'clamp(20px, 4vw, 40px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: 0.15,
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 3px)',
          }} />

          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: COLORS.ash,
            letterSpacing: 2,
            marginBottom: 20,
            paddingBottom: 12,
            borderBottom: `1px solid ${COLORS.ash}20`,
          }}>
            INCIDENT REPORT #1947-B — DECLASSIFIED [PARTIAL]
          </div>

          {REDACTED_LINES.map((line, i) => (
            <div key={i} style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 'clamp(10px, 2.5vw, 13px)',
              color: line.text.includes('██') ? COLORS.ash : COLORS.bone,
              letterSpacing: 1,
              lineHeight: 2,
              opacity: line.text === '' ? 0 : 0.85,
              minHeight: line.text === '' ? 16 : undefined,
            }}>
              {line.text}
            </div>
          ))}

          <div style={{ marginTop: 30, borderTop: `1px solid ${COLORS.ash}20`, paddingTop: 20 }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: COLORS.crimson,
              letterSpacing: 2,
              marginBottom: 12,
            }}>
              ⚠ ADDENDUM — ENCRYPTED TRANSMISSION RECOVERED
            </div>

            {/* Hidden puzzle trigger — the encrypted addendum */}
            <div
              onClick={() => !cipherSolved && setShowCipher(true)}
              style={{
                padding: '16px 20px',
                background: cipherSolved ? `${COLORS.flora}08` : `${COLORS.crimson}08`,
                border: `1px dashed ${cipherSolved ? COLORS.flora : COLORS.crimson}40`,
                cursor: cipherSolved ? 'default' : 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {cipherSolved ? (
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, letterSpacing: 2 }}>
                  ✓ TRANSMISSION DECODED — PUZZLE COMPLETE
                </div>
              ) : (
                <>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 11,
                    color: COLORS.crimson,
                    letterSpacing: 2,
                    marginBottom: 6,
                  }}>
                    XVHG WGRK FHXM LQPZ YBNE...
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    color: COLORS.ash,
                    letterSpacing: 1,
                    opacity: 0.6,
                  }}>
                    [CLICK TO ATTEMPT DECRYPTION]
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Evidence photos placeholder */}
        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))', gap: 12 }}>
          {['PHOTO #1 — COSTUME ROOM', 'PHOTO #2 — GATE 3', 'PHOTO #3 — TUNNEL MAP'].map((label, i) => (
            <div key={i} style={{
              aspectRatio: '4/3',
              background: '#080808',
              border: `1px solid ${COLORS.ash}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.05,
                background: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
              }} />
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                color: COLORS.ash,
                letterSpacing: 1,
                textAlign: 'center',
                opacity: 0.5,
              }}>
                {label}<br />[REDACTED]
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      `}</style>
    </div>
  );
};
