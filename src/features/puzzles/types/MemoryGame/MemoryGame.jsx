import { useState, useMemo } from 'react';
import { COLORS } from '../../../../utils/constants';
import { PUZZLE_IDS } from '../../config/puzzleRegistry';

// ═══════════════════════════════════════════════════════════════
// MEMORY GAME PUZZLE
// Neural Pattern Sync — Random sequences persisted per user
// ═══════════════════════════════════════════════════════════════

// Generate or retrieve persistent random sequences for each level
function getOrCreateSequences() {
  const stored = localStorage.getItem('sos_puzzle_memory_sequences');
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  
  const sequences = {
    1: Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1),
    2: Array.from({ length: 5 }, () => Math.floor(Math.random() * 9) + 1),
    3: Array.from({ length: 6 }, () => Math.floor(Math.random() * 9) + 1),
  };
  localStorage.setItem('sos_puzzle_memory_sequences', JSON.stringify(sequences));
  return sequences;
}

export const MemoryGame = ({ isOpen, onClose, onSuccess }) => {
  // Persistent sequences — same for this user forever
  const sequences = useMemo(() => getOrCreateSequences(), []);
  
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [currentDisplay, setCurrentDisplay] = useState(null);
  const [gameState, setGameState] = useState("start"); // start, showing, input, success, failed
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState("");

  const startGame = (lvl) => {
    const currentLevel = typeof lvl === 'number' ? lvl : level;
    const levelSequence = sequences[currentLevel];
    
    if (!levelSequence) {
      console.error(`No sequence found for level ${currentLevel}`);
      return;
    }

    setSequence(levelSequence);
    setUserInput([]);
    setGameState("showing");
    setMessage("MEMORIZE THE SEQUENCE...");

    // Show sequence with proper timing
    let displayIdx = 0;
    const showNext = () => {
      if (displayIdx >= levelSequence.length) {
        // All displayed, switch to input
        setTimeout(() => {
          setGameState("input");
          setMessage("ENTER THE SEQUENCE");
        }, 500);
        return;
      }

      const num = levelSequence[displayIdx];
      setCurrentDisplay(num);
      
      setTimeout(() => {
        setCurrentDisplay(null);
        displayIdx++;
        setTimeout(showNext, 400); // Gap between numbers
      }, 600);
    };

    setTimeout(showNext, 500);
  };

  const handleNumberClick = (num) => {
    if (gameState !== "input" || !sequence || sequence.length === 0) return;

    const newInput = [...userInput, num];
    setUserInput(newInput);

    // Check if correct number was entered
    const correctNum = sequence[newInput.length - 1];
    if (num !== correctNum) {
      setGameState("failed");
      setMessage("SEQUENCE ERROR - NEURAL SYNC FAILED");
      setTimeout(() => {
        setGameState("start");
        setLevel(1);
        setUserInput([]);
        setMessage("");
      }, 2000);
      return;
    }

    // Check if complete sequence was entered
    if (newInput.length === sequence.length) {
      if (level >= 3) {
        // All levels complete - puzzle solved!
        setGameState("success");
        setMessage("NEURAL SYNC COMPLETE - ACCESS GRANTED");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 2000);
      } else {
        // Move to next level
        setGameState("success");
        setMessage(`LEVEL ${level} COMPLETE`);
        setTimeout(() => {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          startGame(nextLevel);
        }, 1500);
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
        border: `2px solid ${gameState === "success" ? COLORS.flora : COLORS.crimson}`,
        borderRadius: 8,
        padding: 40,
        maxWidth: 500,
        width: "90%",
        boxShadow: `0 0 40px ${gameState === "success" ? COLORS.flora : COLORS.crimson}30`,
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
            background: gameState === "success" ? COLORS.flora : COLORS.crimson,
            boxShadow: `0 0 12px ${gameState === "success" ? COLORS.flora : COLORS.crimson}`,
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
            NEURAL PATTERN SYNC
          </h3>
        </div>

        {/* Level & Message */}
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: `${COLORS.bone}60`,
          marginBottom: 20,
          lineHeight: 1.6,
        }}>
          {'>'} LEVEL: {level}/3<br />
          {'>'} STATUS: {message || "WAITING FOR SYNC..."}
        </div>

        {/* Display Area */}
        {gameState !== "start" && (
          <div style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.ash}`,
            borderRadius: 8,
            padding: 40,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 120,
          }}>
            {currentDisplay !== null ? (
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 72,
                letterSpacing: 4,
                color: COLORS.crimson,
                textShadow: `0 0 30px ${COLORS.crimson}`,
                animation: "pulse 0.3s",
              }}>
                {currentDisplay}
              </div>
            ) : gameState === "input" && (
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 24,
                letterSpacing: 2,
                color: COLORS.flora,
              }}>
                {userInput.join(" - ") || "_"}
              </div>
            )}
          </div>
        )}

        {/* Number Pad */}
        {gameState === "input" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                style={{
                  padding: 20,
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.ash}`,
                  borderRadius: 8,
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 24,
                  color: COLORS.bone,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.flora + "15";
                  e.currentTarget.style.borderColor = COLORS.flora;
                  e.currentTarget.style.color = COLORS.flora;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLORS.bg;
                  e.currentTarget.style.borderColor = COLORS.ash;
                  e.currentTarget.style.color = COLORS.bone;
                }}
              >
                {num}
              </button>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          {gameState === "start" && (
            <button
              onClick={startGame}
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
              START SYNC
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: gameState === "start" ? 1 : "auto",
              padding: "12px 24px",
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
            ABORT
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
