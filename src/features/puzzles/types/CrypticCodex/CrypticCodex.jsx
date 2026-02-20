import { useState, useEffect } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// ═══════════════════════════════════════════════════════════════
// CRYPTIC CODEX — Multi-layer cipher system
// Expert level puzzle combining multiple cipher types
// ═══════════════════════════════════════════════════════════════

const CIPHER_SOLUTION = 'FLORA';
const CIPHER_HINTS = [
  { hint: '1st: Shift by 3', answer: 'F' },
  { hint: '2nd: Reverse alphabet', answer: 'L' },
  { hint: '3rd: ASCII 79', answer: 'O' },
  { hint: '4th: Shift by 5', answer: 'R' },
  { hint: '5th: Reverse alphabet', answer: 'A' },
];

export const CrypticCodex = ({ isOpen, onClose, onSuccess }) => {
  const [answers, setAnswers] = useState(Array(5).fill(''));
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);

  const handleCheckAnswer = () => {
    let allCorrect = true;
    for (let i = 0; i < CIPHER_SOLUTION.length; i++) {
      if (answers[i].toUpperCase() !== CIPHER_SOLUTION[i]) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setSuccess(true);
      setFeedback('CODEX DECRYPTED - TRUTH REVEALED');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } else {
      const correct = answers.filter((a, i) => a.toUpperCase() === CIPHER_SOLUTION[i]).length;
      setFeedback(`INCOMPLETE DECRYPTION: ${correct}/${CIPHER_SOLUTION.length} LETTERS`);
    }
  };

  const updateAnswer = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value.substring(0, 1).toUpperCase();
    setAnswers(newAnswers);
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
        }}>CRYPTIC CODEX</h2>

        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12, color: COLORS.ash,
          marginBottom: 24, lineHeight: 1.6,
        }}>
          This ancient codex uses layered encryption. Each cipher requires understanding 
          different encoding methods. Decipher all 5 letters to unlock the manuscript.
        </p>

        {/* Cipher challenges */}
        <div style={{ marginBottom: 28 }}>
          {CIPHER_HINTS.map((item, i) => (
            <div key={i} style={{
              marginBottom: 16, padding: 12,
              background: '#1a1a1a', border: `1px solid ${COLORS.crimson}20`,
              borderRadius: 4,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10, color: COLORS.crimson, letterSpacing: 1,
                }}>
                  CIPHER {i + 1}
                </span>
                  <button
                  onClick={() => setHintsRevealed(Math.max(hintsRevealed, i + 1))}
                  style={{
                    padding: '4px 8px', background: 'transparent',
                    border: `1px solid ${COLORS.ash}30`,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8, color: COLORS.ash, cursor: 'pointer',
                    borderRadius: 2,
                  }}
                >
                  {hintsRevealed > i ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <IconComponent icon={Icons.CheckCircle2} size={12} color={COLORS.flora} />
                      <span>HINT</span>
                    </span>
                  ) : '? HINT'}
                </button>
              </div>

              <div style={{
                fontSize: 11, color: COLORS.ash, marginBottom: 8,
                fontFamily: "'Space Mono', monospace",
              }}>
                {item.hint}
              </div>

              <input
                type="text"
                value={answers[i]}
                onChange={e => updateAnswer(i, e.target.value)}
                placeholder="?"
                maxLength="1"
                style={{
                  width: 60, padding: 8,
                  background: COLORS.bg,
                  border: `1px solid ${answers[i].toUpperCase() === CIPHER_SOLUTION[i] ? COLORS.flora : COLORS.crimson}`,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 16, letterSpacing: 2, textAlign: 'center',
                  color: COLORS.bone,
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              />
            </div>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, color: success ? COLORS.flora : COLORS.crimson,
            marginBottom: 20, letterSpacing: 1, textAlign: 'center',
          }}>
            {success ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <IconComponent icon={Icons.CheckCircle2} size={14} color={COLORS.flora} />
                <span>{feedback}</span>
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <IconComponent icon={Icons.AlertTriangle} size={14} color={COLORS.crimson} />
                <span>{feedback}</span>
              </span>
            )}
          </div>
        )}

        {/* Answer preview */}
        <div style={{
          marginBottom: 24, padding: 12,
          background: '#0a0a0a', border: `1px solid ${COLORS.ash}15`,
          borderRadius: 4, textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 8,
          }}>DECODED TEXT</div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 24, letterSpacing: 4,
            color: answers.every((a, i) => a.toUpperCase() === CIPHER_SOLUTION[i]) ? COLORS.flora : COLORS.crimson,
          }}>
            {answers.join('') || '?????'}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleCheckAnswer} style={{
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
