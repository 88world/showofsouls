import { useState, useEffect } from 'react';
import { COLORS } from '../../../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// BINARY DECODE — Convert binary sequences to reveal secrets
// Hard puzzle requiring binary to ASCII conversion
// ═══════════════════════════════════════════════════════════════

const BINARY_SEQUENCES = [
  { binary: '01000001', ascii: 'A' },
  { binary: '01001100', ascii: 'L' },
  { binary: '01001001', ascii: 'I' },
  { binary: '01000101', ascii: 'E' },
  { binary: '01001110', ascii: 'N' },
];

export const BinaryDecode = ({ isOpen, onClose, onSuccess }) => {
  const [answers, setAnswers] = useState(Array(5).fill(''));
  const [feedback, setFeedback] = useState('');
  const [flipped, setFlipped] = useState(Array(5).fill(false));

  const binaryToAscii = (binary) => {
    try {
      return String.fromCharCode(parseInt(binary, 2));
    } catch {
      return '?';
    }
  };

  const handleCheckAnswers = () => {
    let allCorrect = true;
    for (let i = 0; i < BINARY_SEQUENCES.length; i++) {
      if (answers[i].toUpperCase() !== BINARY_SEQUENCES[i].ascii) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setFeedback('✓ BINARY SEQUENCE DECODED - ACCESS GRANTED');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } else {
      const correct = answers.filter((a, i) => a.toUpperCase() === BINARY_SEQUENCES[i].ascii).length;
      setFeedback(`⚠ DECODING INCOMPLETE: ${correct}/${BINARY_SEQUENCES.length}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, animation: 'fadeIn 0.3s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 600, width: '100%',
        background: COLORS.cardDark,
        border: `2px solid ${COLORS.crimson}`,
        padding: 40, borderRadius: 8,
        animation: 'scaleIn 0.3s ease',
      }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28, letterSpacing: 3, color: COLORS.bone,
          margin: '0 0 16px 0',
        }}>BINARY DECODE</h2>

        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12, color: COLORS.ash,
          marginBottom: 24, lineHeight: 1.6,
        }}>
          Encrypted data detected. Convert each binary sequence to its ASCII character equivalent.
          Each binary number encodes a single letter. Solve all 5 to decrypt the message.
        </p>

        {/* Binary sequences */}
        <div style={{ marginBottom: 28 }}>
          {BINARY_SEQUENCES.map((item, i) => (
            <div key={i} style={{
              marginBottom: 16, padding: 12,
              background: '#0a0a0a', border: `1px solid ${COLORS.crimson}30`,
              borderRadius: 4,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 12,
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11, letterSpacing: 2,
                  color: COLORS.crimson,
                  padding: '6px 12px',
                  background: '#1a0a0a',
                  borderRadius: 3,
                }}>
                  {item.binary}
                </div>
                <button
                  onClick={() => {
                    const newFlipped = [...flipped];
                    newFlipped[i] = !newFlipped[i];
                    setFlipped(newFlipped);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: flipped[i] ? COLORS.flora + '20' : COLORS.ash + '10',
                    border: `1px solid ${flipped[i] ? COLORS.flora : COLORS.ash}`,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9, color: flipped[i] ? COLORS.flora : COLORS.ash,
                    cursor: 'pointer', borderRadius: 3,
                  }}
                >
                  {flipped[i] ? '✓ HINT' : '? HINT'}
                </button>
              </div>

              {flipped[i] && (
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10, color: COLORS.flora,
                  marginBottom: 12, padding: '8px 0',
                  borderTop: `1px dashed ${COLORS.flora}30`,
                  paddingTop: 8,
                }}>
                  Decimal value: {parseInt(item.binary, 2)} = '{String.fromCharCode(parseInt(item.binary, 2))}'
                </div>
              )}

              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, color: COLORS.ash,
                marginBottom: 8,
              }}>
                CHARACTER:
              </div>
              <input
                type="text"
                value={answers[i]}
                onChange={e => {
                  const newAnswers = [...answers];
                  newAnswers[i] = e.target.value.substring(0, 1).toUpperCase();
                  setAnswers(newAnswers);
                }}
                placeholder="?"
                maxLength="1"
                style={{
                  width: 70, padding: 10,
                  background: COLORS.bg,
                  border: `1px solid ${answers[i].toUpperCase() === item.ascii ? COLORS.flora : COLORS.crimson}`,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 18, letterSpacing: 2, textAlign: 'center',
                  color: COLORS.bone,
                  borderRadius: 4,
                }}
              />
            </div>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, color: feedback.startsWith('✓') ? COLORS.flora : COLORS.crimson,
            marginBottom: 20, letterSpacing: 1, textAlign: 'center',
          }}>
            {feedback}
          </div>
        )}

        {/* Decoded message preview */}
        <div style={{
          marginBottom: 24, padding: 12,
          background: '#1a1a1a', border: `1px solid ${COLORS.ash}20`,
          borderRadius: 4, textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 8,
          }}>DECODED MESSAGE</div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 20, letterSpacing: 3,
            color: answers.join('').length === 5 ? COLORS.flora : COLORS.crimson,
          }}>
            {answers.join('') || '?????'}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleCheckAnswers} style={{
            flex: 1, padding: 12,
            background: COLORS.crimson + '15',
            border: `1px solid ${COLORS.crimson}`,
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 2,
            color: COLORS.crimson, textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 4,
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = COLORS.crimson + '30'}
          onMouseLeave={e => e.currentTarget.style.background = COLORS.crimson + '15'}
          >
            SUBMIT DECRYPTION
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: 12,
            background: 'transparent',
            border: `1px solid ${COLORS.ash}30`,
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 2,
            color: COLORS.ash, textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 4,
          }}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
