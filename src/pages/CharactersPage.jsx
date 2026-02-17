import { useState } from 'react';
import { COLORS } from '../utils/constants';
import { useGlobalEvent } from '../features/events/GlobalEventProvider';
import { SequenceLock } from '../features/puzzles/types/SequenceLock/SequenceLock';

// ═══════════════════════════════════════════════════════════════
// CHARACTERS PAGE — Hidden Global Event Puzzle
// Flora, Pyro, and other characters
// ═══════════════════════════════════════════════════════════════

const CHARACTERS = [
  {
    name: 'FLORA',
    role: 'THE FLOWER MASCOT',
    status: 'ACTIVE — HOSTILE',
    color: COLORS.flora,
    icon: '🌸',
    notes: [
      'Primary animatronic attraction',
      'Last operational unit from the 1947 lineup',
      'Behavioral patterns: ██████████████',
      'WARNING: Do not make direct eye contact',
    ],
  },
  {
    name: 'PYRO',
    role: 'THE FIRE MASCOT',
    status: 'UNKNOWN',
    color: COLORS.ember,
    icon: '🔥',
    notes: [
      'Decommissioned after thermal incident',
      'Costume recovered — occupant not found',
      'Surveillance shows movement in Sector 4',
      'Approach with extreme caution',
    ],
  },
  {
    name: 'SUBJECT 3',
    role: '████████████',
    status: 'CLASSIFIED',
    color: COLORS.crimson,
    icon: '?',
    notes: [
      '███████████████████████',
      'Found in underground service tunnel B',
      '████████████████████████',
      '[THIS FILE REQUIRES LEVEL 6 CLEARANCE]',
    ],
  },
  {
    name: '???',
    role: 'THE WATCHER',
    status: 'UNCONFIRMED',
    color: COLORS.ash,
    icon: '👁',
    notes: [
      'Multiple sightings near Gate 3',
      'No matching costume in inventory',
      'Security feeds corrupted during appearances',
      'Staff report hearing humming in empty corridors',
    ],
  },
];

export const CharactersPage = () => {
  const [showSequence, setShowSequence] = useState(false);
  const [hoveredChar, setHoveredChar] = useState(null);
  const { markPuzzleComplete, isPuzzleEventComplete } = useGlobalEvent();
  const sequenceSolved = isPuzzleEventComplete('sequenceLock');

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.bone,
      padding: 'clamp(100px, 12vw, 140px) clamp(12px, 4vw, 40px) clamp(30px, 5vw, 60px)',
    }}>
      <SequenceLock
        isOpen={showSequence}
        onClose={() => setShowSequence(false)}
        onSuccess={() => { markPuzzleComplete('sequenceLock'); setShowSequence(false); }}
      />

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(40px, 8vw, 80px)',
          letterSpacing: 8,
          color: COLORS.flora,
          marginBottom: 8,
        }}>
          CHARACTERS
        </h1>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          color: COLORS.ash,
          letterSpacing: 3,
          marginBottom: 50,
        }}>
          PERSONNEL & ENTITY DOSSIERS — FLORA'S WONDERLAND
        </div>

        {/* Character Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {CHARACTERS.map((char, i) => (
            <div
              key={char.name}
              onMouseEnter={() => setHoveredChar(i)}
              onMouseLeave={() => setHoveredChar(null)}
              style={{
                background: '#0a0a08',
                border: `2px solid ${hoveredChar === i ? char.color : COLORS.ash + '20'}`,
                padding: 'clamp(16px, 3vw, 28px)',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Scanlines */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.1,
                background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 3px)',
              }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 'clamp(12px, 3vw, 24px)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Icon */}
                <div style={{
                  width: 60, height: 60, minWidth: 60,
                  background: char.color + '10',
                  border: `2px solid ${char.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {char.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 28,
                      letterSpacing: 4,
                      color: char.color,
                    }}>
                      {char.name}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9,
                      color: COLORS.ash,
                      letterSpacing: 2,
                    }}>
                      {char.role}
                    </div>
                  </div>

                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10,
                    letterSpacing: 2,
                    color: char.status.includes('HOSTILE') ? COLORS.crimson : char.status.includes('CLASSIFIED') ? COLORS.gold : COLORS.ash,
                    marginBottom: 12,
                  }}>
                    STATUS: {char.status}
                  </div>

                  {/* Notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {char.notes.map((note, j) => (
                      <div key={j} style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 'clamp(9px, 2vw, 11px)',
                        color: note.includes('██') ? COLORS.ash + '60' : COLORS.bone,
                        letterSpacing: 1,
                        opacity: 0.8,
                        paddingLeft: 10,
                        borderLeft: `2px solid ${char.color}20`,
                      }}>
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hidden puzzle trigger at the bottom — security access panel */}
        <div style={{
          marginTop: 50,
          padding: 'clamp(16px, 3vw, 24px)',
          background: '#0a0808',
          border: `1px dashed ${sequenceSolved ? COLORS.flora + '40' : '#a855f740'}`,
          textAlign: 'center',
          cursor: sequenceSolved ? 'default' : 'pointer',
          transition: 'all 0.3s',
        }}
          onClick={() => !sequenceSolved && setShowSequence(true)}
        >
          {sequenceSolved ? (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, letterSpacing: 2 }}>
              ✓ SECURITY SEQUENCE ACCEPTED — ACCESS GRANTED
            </div>
          ) : (
            <>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: '#a855f7',
                letterSpacing: 2,
                marginBottom: 6,
              }}>
                ⚿ SECURITY ACCESS PANEL
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                color: COLORS.ash,
                letterSpacing: 1,
                opacity: 0.6,
              }}>
                LEVEL 6 CLEARANCE REQUIRED — SOLVE SEQUENCE TO PROCEED
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
