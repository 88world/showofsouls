import { useState, useMemo } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';
import { PUZZLE_IDS } from '../../config/puzzleRegistry';

// ═══════════════════════════════════════════════════════════════
// PASSWORD TERMINAL PUZZLE
// Random password per user — persists in localStorage
// ═══════════════════════════════════════════════════════════════

// Generate or retrieve a persistent random 5-letter password for this user
function getOrCreatePassword() {
  const stored = localStorage.getItem('sos_puzzle_password');
  // Validate stored password is exactly 5 letters (migration from old format)
  if (stored && stored.length === 5 && /^[A-Z]+$/.test(stored)) return stored;

  // 5-letter horror/lore themed words
  const words = [
    'FLORA', 'SPORE', 'GROVE', 'DECAY', 'RELIC',
    'GHOST', 'SKULL', 'BLOOD', 'HAUNT', 'DREAD',
    'GRAVE', 'FLESH', 'CURSE', 'FIEND', 'SHADE',
    'THORN', 'CRYPT', 'BLAZE', 'SMOKE', 'SPINE',
  ];
  const password = words[Math.floor(Math.random() * words.length)];
  localStorage.setItem('sos_puzzle_password', password);
  return password;
}

// Generate persistent hints for the grid tiles
export function getPasswordHints() {
  const password = getOrCreatePassword();
  return [
    { tileId: 1, hint: `1st letter: "${password[0]}"`, type: 'letter' },
    { tileId: 5, hint: `Last letter: "${password[4]}"`, type: 'letter' },
    { tileId: 4, hint: `Middle letter: "${password[2]}"`, type: 'letter' },
    { tileId: 6, hint: `5 letters. Rhymes with dark things.`, type: 'riddle' },
  ];
}

export const PasswordTerminal = ({ isOpen, onClose, onSuccess }) => {
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);

  // Stable random password — same for this user forever
  const correctPassword = useMemo(() => getOrCreatePassword(), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.toUpperCase() === correctPassword) {
      setSuccess(true);
      setError("");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setAttempts(prev => prev - 1);
      setError(`ACCESS DENIED. ${attempts - 1} ATTEMPTS REMAINING`);
      setInput("");
      // Reveal hint after first failed attempt
      if (!hintRevealed) setHintRevealed(true);
      if (attempts <= 1) {
        // Reset attempts (don't lock out — let them try again)
        setTimeout(() => {
          setAttempts(3);
          setError("");
        }, 2000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.9)",
      backdropFilter: "blur(10px)",
      zIndex: 9998,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        background: COLORS.cardDark,
        border: `2px solid ${success ? COLORS.flora : COLORS.crimson}`,
        borderRadius: 8,
        padding: 40,
        maxWidth: 500,
        width: "90%",
        boxShadow: `0 0 40px ${success ? COLORS.flora : COLORS.crimson}30`,
        animation: "scaleIn 0.3s ease",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.ash}`,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: success ? COLORS.flora : COLORS.crimson,
            boxShadow: `0 0 12px ${success ? COLORS.flora : COLORS.crimson}`,
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <h3 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            letterSpacing: 2,
            color: COLORS.bone,
            textTransform: "uppercase",
            margin: 0,
          }}>
            {success ? "ACCESS GRANTED" : "ENCRYPTED TERMINAL"}
          </h3>
        </div>

        {/* Status */}
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: `${COLORS.bone}60`,
          marginBottom: 20,
          lineHeight: 1.6,
        }}>
          {'>'} DECRYPTION REQUIRED<br />
          {'>'} ENTER PASSWORD TO ACCESS CLASSIFIED FILES<br />
          {'>'} ATTEMPTS: {attempts}/3<br />
          {'>'} PASSWORD IS 5 LETTERS LONG<br />
          {hintRevealed && (
            <span style={{ color: COLORS.gold }}>
              {'>'} HINT: LOOK FOR CLUES HIDDEN IN THE GRID TILES ABOVE
            </span>
          )}
        </div>

        {success ? (
          <>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24,
              letterSpacing: 3,
              color: COLORS.flora,
              textAlign: "center",
              padding: "20px 0",
              textShadow: `0 0 20px ${COLORS.flora}`,
            }}>
              DECRYPTION SUCCESSFUL
            </div>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                marginTop: 20,
                padding: "12px",
                background: COLORS.flora + "15",
                border: `1px solid ${COLORS.flora}`,
                borderRadius: 4,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: 1.5,
                color: COLORS.flora,
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = COLORS.flora + "30";
                e.currentTarget.style.boxShadow = `0 0 20px ${COLORS.flora}30`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = COLORS.flora + "15";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              CLOSE
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER PASSWORD..."
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                background: COLORS.bg,
                border: `1px solid ${error ? COLORS.crimson : COLORS.ash}`,
                borderRadius: 4,
                fontFamily: "'Space Mono', monospace",
                fontSize: 14,
                letterSpacing: 2,
                color: COLORS.bone,
                textTransform: "uppercase",
                outline: "none",
                transition: "all 0.3s",
              }}
            />
            {error && (
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                color: COLORS.crimson,
                marginTop: 12,
                textAlign: "center",
                animation: "shake 0.5s",
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <IconComponent icon={Icons.AlertTriangle} size={14} color={COLORS.crimson} />
                <span>{error}</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "12px",
                  background: COLORS.flora + "15",
                  border: `1px solid ${COLORS.flora}`,
                  borderRadius: 4,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: COLORS.flora,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.flora + "25";
                  e.currentTarget.style.boxShadow = `0 0 15px ${COLORS.flora}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLORS.flora + "15";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                DECRYPT
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: `1px solid ${COLORS.ash}`,
                  borderRadius: 4,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: COLORS.bone,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.ash + "20";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                CANCEL
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordTerminal;
