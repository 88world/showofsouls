import { useState } from 'react';
import { COLORS } from '../utils/constants';
import { useProgression } from '../features/progression/ProgressionProvider';
import { PUZZLE_REGISTRY } from '../features/puzzles/config/puzzleRegistry';
import { PasswordTerminal } from '../features/puzzles/types/PasswordTerminal/PasswordTerminal';
import { MemoryGame } from '../features/puzzles/types/MemoryGame/MemoryGame';
import { useTapeUnlocks } from '../hooks/useTapeUnlocks';

// ═══════════════════════════════════════════════════════════════
// TAPES PAGE - CORRUPTED ARCHIVE 
// ═══════════════════════════════════════════════════════════════

export const TapesPage = () => {
  const [activePuzzle, setActivePuzzle] = useState(null);
  const [hoveredSecret, setHoveredSecret] = useState(null);

  const { 
    isPuzzleAvailable,
    isPuzzleCompleted,
  } = useProgression();

  const { 
    isTapeUnlocked, 
    getTapeUnlockInfo, 
    unlockTapeGlobal,
    loading: tapesLoading 
  } = useTapeUnlocks();

  // Map puzzles to their reward tapes
  const puzzleToTapeMap = {
    passwordTerminal: 'TAPE-001',
    memoryGame: 'TAPE-002',
  };

  // Enhanced puzzle completion handler with global tape unlock
  const handlePuzzleSuccess = async (puzzleId) => {
    const tapeId = puzzleToTapeMap[puzzleId];
    
    if (tapeId && !isTapeUnlocked(tapeId)) {
      // Get or create user ID
      let userId = localStorage.getItem('investigator_id');
      if (!userId) {
        userId = `INV-${Date.now()}`;
        localStorage.setItem('investigator_id', userId);
      }

      // Unlock tape globally
      const result = await unlockTapeGlobal(tapeId, userId, 'puzzle_completion');
      
      if (result.success) {
        console.log(`Tape ${tapeId} unlocked globally!`);
      } else if (!result.alreadyUnlocked) {
        console.error('Failed to unlock tape:', result.error);
      }
    }
    
    // Close the puzzle
    handleClosePuzzle();
  };

  const puzzleComponents = {
    passwordTerminal: PasswordTerminal,
    memoryGame: MemoryGame,
  };

  const handleSecretClick = (puzzleId) => {
    const puzzle = PUZZLE_REGISTRY[puzzleId];
    if (puzzle && isPuzzleAvailable(puzzle.id) && puzzle.enabled) {
      setActivePuzzle(puzzle);
    }
  };

  const handleClosePuzzle = () => {
    setActivePuzzle(null);
  };

  // --- INLINE TEXT TRIGGER ---
  const SecretTrigger = ({ puzzleId, children, style = {} }) => {
    const puzzle = PUZZLE_REGISTRY[puzzleId];
    const isAvailable = isPuzzleAvailable(puzzleId);
    const isCompleted = isPuzzleCompleted(puzzleId);
    const isHovered = hoveredSecret === puzzleId;

    if (!puzzle || !puzzle.enabled) return children;

    return (
      <span
        onClick={() => handleSecretClick(puzzleId)}
        onMouseEnter={() => setHoveredSecret(puzzleId)}
        onMouseLeave={() => setHoveredSecret(null)}
        style={{
          cursor: isAvailable ? 'crosshair' : 'default',
          position: 'relative',
          display: 'inline-block',
          transition: 'all 0.2s ease',
          ...(isHovered && isAvailable && {
            color: COLORS.bg,
            background: COLORS.crimson,
            textShadow: '0 0 5px rgba(255,0,0,0.8)',
            transform: 'scale(1.05)',
          }),
          ...(isCompleted && {
            opacity: 0.3,
            textDecoration: 'line-through',
            filter: 'blur(1px)',
          }),
          ...style,
        }}
        title={isHovered && isAvailable ? `[CORRUPTION_DETECTED]` : ''}
      >
        {children}
      </span>
    );
  };

  const ActivePuzzleComponent = activePuzzle ? puzzleComponents[activePuzzle.id] : null;

  const PhysicalTape = ({ id, title, date, length, status, isCorrupt, children }) => {
    const unlocked = isTapeUnlocked(id);
    const unlockInfo = getTapeUnlockInfo(id);
    
    return (
      <div style={{
        padding: 12,
        background: '#0a0a0a',
        border: `2px solid ${unlocked ? COLORS.flora : COLORS.ash}`,
        borderRadius: 6,
        boxShadow: unlocked 
          ? `8px 8px 0px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.8), 0 0 20px ${COLORS.flora}40`
          : '8px 8px 0px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.8)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: isCorrupt ? 0.8 : 1,
      }}>
        {/* Global Unlock Badge */}
        {unlocked && (
          <div style={{
            position: 'absolute',
            top: -8,
            right: -8,
            background: COLORS.flora,
            color: COLORS.bg,
            padding: '4px 8px',
            borderRadius: 3,
            fontSize: 10,
            fontFamily: "'Space Mono', monospace",
            fontWeight: 'bold',
            letterSpacing: 1,
            boxShadow: `0 0 15px ${COLORS.flora}80`,
            zIndex: 10,
          }}>
            GLOBALLY UNLOCKED
          </div>
        )}
        
        <div style={{
          background: '#000',
          height: 60,
          borderRadius: 4,
          border: `1px solid ${COLORS.ash}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 40,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', bottom: 10, width: '100%', height: 2, background: COLORS.ash, opacity: 0.3 }} />
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `4px dashed ${unlocked ? COLORS.flora : COLORS.ash}`, opacity: 0.5, animation: isCorrupt ? 'none' : 'spin 10s linear infinite' }} />
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `4px dashed ${unlocked ? COLORS.flora : COLORS.ash}`, opacity: 0.5 }} />
        </div>

        <div style={{
          background: COLORS.bone,
          padding: '12px 16px',
          borderRadius: 2,
          border: '1px solid #999',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, ${COLORS.ash}44 19px, ${COLORS.ash}44 20px)`,
          backgroundPosition: '0 8px',
          position: 'relative',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: COLORS.bg,
            fontWeight: 'bold',
            borderBottom: `2px solid ${COLORS.bg}`,
            paddingBottom: 4,
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>{id}</span>
            <span style={{ color: isCorrupt ? COLORS.crimson : COLORS.bg }}>[{status}]</span>
          </div>
          
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            color: COLORS.bg,
            lineHeight: 1.6,
            fontWeight: 'bold',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span>TITLE: {title}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              DATE: {children || date}
            </span>
            <span>LEN: {length}</span>
            
            {/* Unlock Info */}
            {unlocked && unlockInfo && (
              <div style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: `1px dashed ${COLORS.bg}`,
                fontSize: 9,
                opacity: 0.8,
              }}>
                <div>UNLOCKED BY: {unlockInfo.unlocked_by || 'ANON'}</div>
                <div>
                  AT: {new Date(unlockInfo.unlocked_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.bone,
      padding: '160px 40px 100px',
      position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* MAIN CONTENT WRAPPER */}
      <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: 60, borderBottom: `2px solid ${COLORS.ash}`, paddingBottom: 20 }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(40px, 8vw, 80px)',
            letterSpacing: 8,
            color: COLORS.bone,
            margin: 0,
            textShadow: `2px 2px 0 ${COLORS.crimson}, -2px -2px 0 ${COLORS.signal}`,
          }}>
            TAPES
          </h1>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            color: COLORS.bone,
            letterSpacing: 2,
            marginTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>MAGNETIC MEDIA REPOSITORY</span>
            <span style={{ color: COLORS.crimson, animation: 'blink 2s infinite' }}>● REC</span>
          </div>
        </div>

        {/* Tape Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 30,
        }}>
          {/* TAPE 1 - PASSWORD TERMINAL TRIGGER */}
          <PhysicalTape 
            id="TAPE-001" 
            title="Initial_Interview" 
            length="47:23" 
            status="CORRUPT" 
            isCorrupt={true}
          >
            <SecretTrigger puzzleId="passwordTerminal">
              <span style={{
                color: COLORS.crimson,
                background: 'transparent',
                padding: '0 4px',
                border: `1px solid ${COLORS.crimson}`,
                textDecoration: 'line-through',
              }}>
                [REDACTED]1947
              </span>
            </SecretTrigger>
          </PhysicalTape>
        </div>
      </div>

      {/* Active Puzzle Modal */}
      {activePuzzle && ActivePuzzleComponent && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
            backdropFilter: 'blur(8px)',
          }}
          onClick={handleClosePuzzle}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: 900,
              width: '100%',
              border: `2px solid ${COLORS.crimson}`, 
              boxShadow: `0 0 50px rgba(0,0,0,1), inset 0 0 30px rgba(255,0,0,0.1)`,
              background: COLORS.bg,
            }}
          >
            <div style={{
              background: '#1a0505',
              color: COLORS.bone,
              padding: '8px 16px',
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${COLORS.crimson}`
            }}>
              <span>EXAMINATION STATION // {activePuzzle.id.toUpperCase()}</span>
              <button
                onClick={handleClosePuzzle}
                style={{
                  background: COLORS.crimson,
                  border: 'none',
                  color: COLORS.bg,
                  fontWeight: 'bold',
                  fontSize: 12,
                  cursor: 'crosshair',
                  padding: '4px 12px',
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                [EJECT]
              </button>
            </div>
            
            <div style={{ padding: 40, position: 'relative' }}>
               <ActivePuzzleComponent 
                 puzzleId={activePuzzle.id}
                 isOpen={true}
                 onClose={handleClosePuzzle}
                 onSuccess={() => handlePuzzleSuccess(activePuzzle.id)}
               />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      `}</style>
    </div>
  );
};