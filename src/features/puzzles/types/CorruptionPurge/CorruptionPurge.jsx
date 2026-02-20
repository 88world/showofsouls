import { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// ═══════════════════════════════════════════════════════════════
// CORRUPTION PURGE — Click glitch artifacts before they disappear
// Global Event Puzzle — Hidden on ForumPage
// ═══════════════════════════════════════════════════════════════

const GLITCH_CHARS = ['▓', '█', '░', '▒', '╳', '◈', '◉', '▣', '⬡', '⬢', '◆', '◇'];
const TARGET_HITS = 15;
const SPAWN_INTERVAL = 800;
const GLITCH_LIFETIME = 1800;
const GAME_DURATION = 25000; // 25 seconds

export const CorruptionPurge = ({ isOpen, onClose, onSuccess }) => {
  const [phase, setPhase] = useState('idle'); // idle, active, success, fail
  const [glitches, setGlitches] = useState([]);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [missed, setMissed] = useState(0);
  const idCounter = useRef(0);
  const gameInterval = useRef(null);
  const timerInterval = useRef(null);
  const areaRef = useRef(null);

  const cleanup = useCallback(() => {
    if (gameInterval.current) clearInterval(gameInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    gameInterval.current = null;
    timerInterval.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const spawnGlitch = useCallback(() => {
    const id = ++idCounter.current;
    const x = 5 + Math.random() * 85; // %
    const y = 5 + Math.random() * 85; // %
    const char = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    const size = 18 + Math.random() * 22;

    setGlitches(prev => [...prev, { id, x, y, char, size, born: Date.now() }]);

    // Auto-remove after lifetime
    setTimeout(() => {
      setGlitches(prev => {
        const still = prev.find(g => g.id === id);
        if (still) setMissed(m => m + 1);
        return prev.filter(g => g.id !== id);
      });
    }, GLITCH_LIFETIME);
  }, []);

  const startGame = useCallback(() => {
    cleanup();
    setPhase('active');
    setHits(0);
    setMissed(0);
    setGlitches([]);
    setTimeLeft(GAME_DURATION);
    idCounter.current = 0;

    // Spawn glitches
    gameInterval.current = setInterval(spawnGlitch, SPAWN_INTERVAL);

    // Timer
    timerInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          return 0;
        }
        return prev - 100;
      });
    }, 100);
  }, [cleanup, spawnGlitch]);

  // Check game over
  useEffect(() => {
    if (phase !== 'active') return;
    if (hits >= TARGET_HITS) {
      cleanup();
      setPhase('success');
      setGlitches([]);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } else if (timeLeft <= 0) {
      cleanup();
      setPhase('fail');
      setGlitches([]);
    }
  }, [hits, timeLeft, phase, cleanup, onSuccess, onClose]);

  const handleGlitchClick = (id, e) => {
    e.stopPropagation();
    if (phase !== 'active') return;
    setGlitches(prev => prev.filter(g => g.id !== id));
    setHits(h => h + 1);
  };

  if (!isOpen) return null;

  const progress = Math.min(hits / TARGET_HITS, 1);
  const timePercent = timeLeft / GAME_DURATION;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.signal}`, padding: 28, maxWidth: 500, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.signal, letterSpacing: 4, marginBottom: 8 }}>CORRUPTION PURGE</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 6 }}>ELIMINATE {TARGET_HITS} GLITCH ARTIFACTS BEFORE TIME RUNS OUT</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 20 }}>Click the corruption fragments as they appear</div>

        {/* Stats bar */}
        {phase === 'active' && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora }}>
              PURGED: {hits}/{TARGET_HITS}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: timePercent < 0.3 ? COLORS.crimson : COLORS.ash }}>
              TIME: {(timeLeft / 1000).toFixed(1)}s
            </div>
          </div>
        )}

        {/* Progress bar */}
        {phase === 'active' && (
          <div style={{ height: 4, background: COLORS.ash + '15', marginBottom: 16 }}>
            <div style={{ height: '100%', width: `${progress * 100}%`, background: COLORS.flora, transition: 'width 0.2s' }} />
          </div>
        )}

        {/* Game area */}
        <div ref={areaRef} style={{
          position: 'relative', width: '100%', height: 280,
          background: '#060606', border: `1px solid ${COLORS.ash}15`,
          marginBottom: 20, overflow: 'hidden',
          cursor: phase === 'active' ? 'crosshair' : 'default',
        }}>
          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
          }} />

          {/* Glitch artifacts */}
          {glitches.map(g => {
            const age = (Date.now() - g.born) / GLITCH_LIFETIME;
            const opacity = age > 0.7 ? 1 - (age - 0.7) / 0.3 : 1;
            return (
              <div
                key={g.id}
                onClick={(e) => handleGlitchClick(g.id, e)}
                style={{
                  position: 'absolute',
                  left: `${g.x}%`, top: `${g.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: g.size, cursor: 'pointer',
                  color: COLORS.signal,
                  opacity,
                  textShadow: `0 0 8px ${COLORS.signal}, 0 0 16px ${COLORS.crimson}50`,
                  animation: 'corruptionGlitch 0.3s infinite',
                  userSelect: 'none',
                  transition: 'opacity 0.1s',
                  zIndex: 2,
                }}
              >
                {g.char}
              </div>
            );
          })}

          {/* Idle state */}
          {phase === 'idle' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 40, color: COLORS.signal + '30' }}><IconComponent icon={Icons.Zap} size={40} color={COLORS.signal + '30'} /></div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash }}>CORRUPTION DETECTED</div>
            </div>
          )}

          {phase === 'fail' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: COLORS.crimson, display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.XCircle} size={18} color={COLORS.crimson} />PURGE FAILED</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash }}>PURGED {hits}/{TARGET_HITS} — TRY AGAIN</div>
            </div>
          )}

          {phase === 'success' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: COLORS.flora, display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.CheckCircle2} size={18} color={COLORS.flora} />CORRUPTION PURGED</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash }}>SYSTEM CLEAN</div>
            </div>
          )}
        </div>

        <button onClick={() => (phase === 'idle' || phase === 'fail') && startGame()} disabled={phase === 'active' || phase === 'success'} style={{
          width: '100%', padding: '12px', background: 'transparent',
          border: `2px solid ${phase === 'success' ? COLORS.flora : COLORS.signal}`,
          color: phase === 'success' ? COLORS.flora : COLORS.signal,
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 4,
          cursor: phase === 'active' || phase === 'success' ? 'default' : 'pointer',
          opacity: phase === 'active' ? 0.4 : 1,
        }}>{phase === 'success' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.CheckCircle2} size={14} />SYSTEM PURGED</span>
        ) : phase === 'active' ? 'PURGING...' : phase === 'fail' ? 'RETRY PURGE' : 'INITIATE PURGE'}</button>

        <button onClick={onClose} aria-label="Close corruption purge" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>
          <IconComponent icon={Icons.X} />
        </button>

        <style>{`
          @keyframes corruptionGlitch {
            0% { transform: translate(-50%, -50%) skew(0deg); }
            25% { transform: translate(-48%, -52%) skew(2deg); }
            50% { transform: translate(-52%, -48%) skew(-1deg); }
            75% { transform: translate(-50%, -50%) skew(1deg); }
            100% { transform: translate(-50%, -50%) skew(0deg); }
          }
        `}</style>
      </div>
    </div>
  );
};
