import { useState, useRef, useEffect } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// ═══════════════════════════════════════════════════════════════
// PATTERN GRID — Toggle cells to match a target pattern (lights-out style)
// Unlocks: Document
// ═══════════════════════════════════════════════════════════════

const GRID_SIZE = 5;

function generateTarget() {
  // Generate a pattern with 6-10 active cells
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
  const count = 6 + Math.floor(Math.random() * 5);
  let placed = 0;
  while (placed < count) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    if (!grid[r][c]) {
      grid[r][c] = true;
      placed++;
    }
  }
  return grid;
}

function getOrCreateTarget() {
  const stored = localStorage.getItem('sos_puzzle_pattern');
  if (stored) {
    try {
      const grid = JSON.parse(stored);
      if (grid.length === GRID_SIZE && grid[0].length === GRID_SIZE) return grid;
    } catch {}
  }
  const target = generateTarget();
  localStorage.setItem('sos_puzzle_pattern', JSON.stringify(target));
  return target;
}

export const PatternGrid = ({ isOpen, onClose, onSuccess }) => {
  const target = useRef(getOrCreateTarget());
  const [grid, setGrid] = useState(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false))
  );
  const [success, setSuccess] = useState(false);
  const [showTarget, setShowTarget] = useState(true);
  const [moves, setMoves] = useState(0);

  const handleCellClick = (r, c) => {
    if (success) return;
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      // Toggle clicked cell + adjacent cells (lights-out mechanic)
      const toggle = (row, col) => {
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
          next[row][col] = !next[row][col];
        }
      };
      toggle(r, c);
      toggle(r - 1, c);
      toggle(r + 1, c);
      toggle(r, c - 1);
      toggle(r, c + 1);
      return next;
    });
    setMoves(m => m + 1);
  };

  // Check for match after each move
  useEffect(() => {
    if (moves > 0) {
      const match = grid.every((row, r) =>
        row.every((cell, c) => cell === target.current[r][c])
      );
      if (match) {
        setSuccess(true);
        setTimeout(() => { onSuccess(); onClose(); }, 1200);
      }
    }
  }, [grid, moves]);

  const handleReset = () => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false)));
    setMoves(0);
  };

  if (!isOpen) return null;

  const cellSize = 40;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.ember}`, padding: 32, maxWidth: 480, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.ember, letterSpacing: 4, marginBottom: 8 }}>PATTERN GRID</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 8 }}>NEURAL NETWORK CALIBRATION</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 24 }}>Toggle cells to match the target pattern (affects adjacent cells)</div>

        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          {/* Target grid */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash, letterSpacing: 2, marginBottom: 8, textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
              <span>TARGET</span>
              <span onClick={() => setShowTarget(!showTarget)} style={{ cursor: 'pointer', color: COLORS.ember }}>
                {showTarget ? 'HIDE' : 'SHOW'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`, gap: 2, opacity: showTarget ? 1 : 0.2, transition: 'opacity 0.3s' }}>
              {target.current.map((row, r) =>
                row.map((cell, c) => (
                  <div key={`t-${r}-${c}`} style={{
                    width: cellSize, height: cellSize,
                    background: cell ? COLORS.flora + '60' : '#111',
                    border: `1px solid ${cell ? COLORS.flora + '30' : COLORS.ash + '15'}`,
                    transition: 'all 0.2s',
                  }} />
                ))
              )}
            </div>
          </div>

          {/* Player grid */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash, letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>YOUR GRID</div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`, gap: 2 }}>
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const matchesTarget = cell === target.current[r][c];
                  return (
                    <div key={`p-${r}-${c}`} onClick={() => handleCellClick(r, c)} style={{
                      width: cellSize, height: cellSize,
                      background: cell ? COLORS.ember + '60' : '#111',
                      border: `1px solid ${cell ? COLORS.ember + '30' : COLORS.ash + '15'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: cell ? `inset 0 0 8px ${COLORS.ember}20` : 'none',
                    }} />
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span>MOVES: {moves}</span>
          <span onClick={handleReset} style={{ cursor: 'pointer', color: COLORS.ember, letterSpacing: 2 }}>RESET</span>
        </div>

        {success && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, marginBottom: 12, textAlign: 'center', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}><IconComponent icon={Icons.CheckCircle2} size={14} color={COLORS.flora} />PATTERN SYNCHRONIZED — {moves} MOVES</div>}

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}><IconComponent icon={Icons.X} size={18} color={COLORS.ash} /></button>
      </div>
    </div>
  );
};
