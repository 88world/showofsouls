import { useEffect, useMemo, useState } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// RelayCalibration — tune a 4x4 relay matrix to match a hidden target.
// Each click cycles a relay and its orthogonal neighbors through 3 states.

const SIZE = 4;
const MAX_LEVEL = 2;
const STORAGE_KEY = 'sos_event_relay_calibration';

const clampIndex = (x, y) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;
const cloneGrid = (grid) => grid.map((row) => row.slice());

const applyMove = (grid, x, y) => {
  const next = cloneGrid(grid);
  const deltas = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  deltas.forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (clampIndex(nx, ny)) {
      next[ny][nx] = (next[ny][nx] + 1) % (MAX_LEVEL + 1);
    }
  });
  return next;
};

const generateState = () => {
  const target = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => Math.floor(Math.random() * (MAX_LEVEL + 1)))
  );
  let grid = cloneGrid(target);
  for (let i = 0; i < 18; i += 1) {
    grid = applyMove(grid, Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE));
  }
  return { target, initial: grid };
};

const getStoredState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.target || !parsed?.initial) return null;
    if (parsed.target.length !== SIZE || parsed.initial.length !== SIZE) return null;
    return parsed;
  } catch {
    return null;
  }
};

const storeState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const RelayCalibration = ({ isOpen, onClose, onSuccess }) => {
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [state, setState] = useState(() => {
    const stored = getStoredState();
    if (stored) return stored;
    const fresh = generateState();
    storeState(fresh);
    return fresh;
  });

  const [grid, setGrid] = useState(() => cloneGrid(state.initial));

  useEffect(() => {
    if (!isOpen) return;
    setSolved(false);
    setMoves(0);
    setGrid(cloneGrid(state.initial));
  }, [isOpen, state.initial]);

  const isMatch = useMemo(() => {
    return grid.every((row, y) => row.every((cell, x) => cell === state.target[y][x]));
  }, [grid, state.target]);

  useEffect(() => {
    if (!isOpen || solved) return;
    if (isMatch) {
      setSolved(true);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 900);
    }
  }, [isMatch, isOpen, onClose, onSuccess, solved]);

  if (!isOpen) return null;

  const levelColor = (level) => {
    if (level === 2) return COLORS.flora;
    if (level === 1) return COLORS.ember;
    return COLORS.ash + '40';
  };

  const handleClick = (x, y) => {
    if (solved) return;
    setGrid((prev) => applyMove(prev, x, y));
    setMoves((prev) => {
      const next = prev + 1;
      if (next >= 300) {
        setSolved(true);
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 900);
      }
      return next;
    });
  };

  const reset = () => {
    setGrid(cloneGrid(state.initial));
    setMoves(0);
    setSolved(false);
  };

  const regenerate = () => {
    const fresh = generateState();
    storeState(fresh);
    setState(fresh);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0b0a08',
          border: `2px solid ${COLORS.crimson}`,
          padding: 28,
          width: 520,
          maxWidth: 'calc(100% - 28px)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 4, color: COLORS.bone }}>
            RELAY CALIBRATION
          </div>
          <button
            onClick={onClose}
            aria-label="Close relay calibration"
            style={{ background: 'transparent', border: 'none', color: COLORS.ash, cursor: 'pointer' }}
          >
            <IconComponent icon={Icons.X} size={18} color={COLORS.ash} />
          </button>
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginTop: 6 }}>
          Match the relay grid to the target signature. Each click cycles a relay and its neighbors.
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 2 }}>
            TARGET SIGNATURE
          </div>
          <button
            onClick={regenerate}
            style={{
              background: 'transparent',
              border: `1px solid ${COLORS.ash}30`,
              color: COLORS.ash,
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: 2,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            RESEED
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 6, marginTop: 10 }}>
          {state.target.flatMap((row, y) =>
            row.map((cell, x) => (
              <div
                key={`t-${x}-${y}`}
                style={{
                  height: 16,
                  background: levelColor(cell),
                  border: `1px solid ${COLORS.ash}20`,
                  boxShadow: cell ? `0 0 6px ${levelColor(cell)}` : 'none',
                }}
              />
            ))
          )}
        </div>

        <div style={{
          marginTop: 18,
          padding: 10,
          background: '#070707',
          border: `1px solid ${COLORS.ash}20`,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: 8 }}>
            {grid.flatMap((row, y) =>
              row.map((cell, x) => (
                <button
                  key={`g-${x}-${y}`}
                  onClick={() => handleClick(x, y)}
                  style={{
                    height: 64,
                    background: '#0e0e0e',
                    border: `1px solid ${COLORS.ash}30`,
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: cell ? `0 0 10px ${levelColor(cell)}40` : 'none',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 10,
                    background: levelColor(cell),
                    opacity: cell === 0 ? 0.3 : 0.9,
                    borderRadius: 4,
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 6,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8,
                    color: COLORS.ash,
                    letterSpacing: 1,
                  }}>
                    {cell}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash }}>
            MOVES: {moves}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {solved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: COLORS.flora, fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
                <IconComponent icon={Icons.CheckCircle2} size={14} color={COLORS.flora} />
                RELAY SYNCHRONIZED
              </div>
            )}
            <button
              onClick={reset}
              style={{
                background: 'transparent',
                border: `1px solid ${COLORS.ash}30`,
                color: COLORS.ash,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: 2,
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              RESET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelayCalibration;
