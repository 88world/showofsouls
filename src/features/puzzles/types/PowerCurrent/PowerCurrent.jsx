import { useState, useMemo } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// PowerCurrent — rotate tiles to connect a source to a target.
// Tiles: straight, corner, T, cross. Rotating changes connectors (N,E,S,W).

const TILE_TYPES = {
  STRAIGHT: [1,0,1,0], // vertical
  STRAIGHT_H: [0,1,0,1], // horizontal
  CORNER_NE: [1,1,0,0],
  CORNER_ES: [0,1,1,0],
  CORNER_SW: [0,0,1,1],
  CORNER_WN: [1,0,0,1],
  T_UP: [1,1,1,0],
  CROSS: [1,1,1,1],
};

const DIRS = [
  { dx: 0, dy: -1, side: 0, opp: 2 },
  { dx: 1, dy: 0, side: 1, opp: 3 },
  { dx: 0, dy: 1, side: 2, opp: 0 },
  { dx: -1, dy: 0, side: 3, opp: 1 },
];

function rotate(tile, times=1){
  let t = tile.slice();
  for (let i=0;i<times;i++) t = [t[3], t[0], t[1], t[2]];
  return t;
}

function cloneBoard(b){ return b.map(row => row.map(cell => ({...cell, conn: cell.conn.slice()}))); }

function makeRandomBoard(size=4){
  const types = Object.values(TILE_TYPES);
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ({ conn: rotate(types[Math.floor(Math.random()*types.length)], Math.floor(Math.random()*4)) })));
}

function checkSolutionBoard(b, size, source, target) {
  const inBounds = (x, y) => x >= 0 && x < size && y >= 0 && y < size;
  const key = (x, y) => `${x},${y}`;
  const visited = new Set();
  const stack = [];

  const sourceTile = b[source.y][source.x].conn;
  if (!sourceTile[source.side]) return false;

  stack.push({ x: source.x, y: source.y });

  while (stack.length) {
    const cur = stack.pop();
    const k = key(cur.x, cur.y);
    if (visited.has(k)) continue;
    visited.add(k);
    const tile = b[cur.y][cur.x].conn;
    if (cur.x === target.x && cur.y === target.y && tile[target.side]) return true;

    for (const d of DIRS) {
      const nx = cur.x + d.dx;
      const ny = cur.y + d.dy;
      if (!inBounds(nx, ny)) continue;
      if (tile[d.side] && b[ny][nx].conn[d.opp]) {
        stack.push({ x: nx, y: ny });
      }
    }
  }

  return false;
}

function generateSolvableBoard(size, source, target) {
  const board = makeRandomBoard(size);

  const inBounds = (x, y) => x >= 0 && x < size && y >= 0 && y < size;

  const path = [{ x: source.x, y: source.y }];
  const visited = new Set([`${source.x},${source.y}`]);
  let cx = source.x;
  let cy = source.y;

  while (cx !== target.x || cy !== target.y) {
    const options = DIRS
      .map((d) => ({ ...d, nx: cx + d.dx, ny: cy + d.dy }))
      .filter((d) => inBounds(d.nx, d.ny) && !visited.has(`${d.nx},${d.ny}`));

    // Bias toward target, but allow variation
    options.sort((a, b) => {
      const da = Math.abs(target.x - a.nx) + Math.abs(target.y - a.ny);
      const db = Math.abs(target.x - b.nx) + Math.abs(target.y - b.ny);
      return da - db;
    });

    const pick = options.length > 2 && Math.random() < 0.4
      ? options[Math.floor(Math.random() * options.length)]
      : options[0];

    if (!pick) break;
    cx = pick.nx;
    cy = pick.ny;
    path.push({ x: cx, y: cy });
    visited.add(`${cx},${cy}`);
  }

  // Ensure a connector chain along the path
  for (let i = 0; i < path.length; i += 1) {
    const current = path[i];
    const prev = path[i - 1];
    const next = path[i + 1];
    let conn = [0, 0, 0, 0];

    if (prev) {
      const dx = current.x - prev.x;
      const dy = current.y - prev.y;
      const dir = DIRS.find((d) => d.dx === dx && d.dy === dy);
      if (dir) conn[dir.opp] = 1;
    } else {
      conn[source.side] = 1;
    }

    if (next) {
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const dir = DIRS.find((d) => d.dx === dx && d.dy === dy);
      if (dir) conn[dir.side] = 1;
    } else {
      conn[target.side] = 1;
    }

    // If a node has a single connector, upgrade to a corner/straight that matches
    board[current.y][current.x].conn = conn;
  }

  // Scramble rotations so the path is not already solved
  let attempts = 0;
  do {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const turns = Math.floor(Math.random() * 4);
        board[y][x].conn = rotate(board[y][x].conn, turns);
      }
    }
    attempts += 1;
  } while (checkSolutionBoard(board, size, source, target) && attempts < 6);

  return board;
}

export const PowerCurrent = ({ isOpen, onClose, onSuccess }) => {
  const size = 4;
  const tileSize = 72;
  const center = tileSize / 2;
  const edge = 8;
  const hubRadius = 7;
  const activeStroke = 6;
  const inactiveStroke = 3;
  // define fixed source and target positions (can be randomized later)
  const source = useMemo(() => ({ x: 0, y: 1, side: 3 }), []); // left of (0,1) -> W connector
  const target = useMemo(() => ({ x: size-1, y: 2, side: 1 }), [size]); // right of (size-1,2)
  const [boardInit] = useState(() => generateSolvableBoard(size, source, target));
  const [board, setBoard] = useState(() => cloneBoard(boardInit));
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);

  if (!isOpen) return null;

  const checkSolution = (b) => checkSolutionBoard(b, size, source, target);

  const rotateAt = (x,y) => {
    if (solved) return;
    setBoard(prev => {
      const next = cloneBoard(prev);
      next[y][x].conn = rotate(next[y][x].conn, 1);
      setMoves(m => m + 1);
      if (checkSolution(next)) {
        setSolved(true);
        setTimeout(() => { onSuccess?.(); onClose?.(); }, 700);
      }
      return next;
    });
  };

  const reset = () => { setBoard(cloneBoard(boardInit)); setMoves(0); setSolved(false); };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 620, maxWidth: '94%', background: COLORS.cardDark, border: `2px solid ${COLORS.crimson}`, padding: 22, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: COLORS.bone }}>POWER CURRENT</div>
          <button onClick={onClose} aria-label="Close power current" style={{ background: 'transparent', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>
            <IconComponent icon={Icons.X} />
          </button>
        </div>

        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: COLORS.ash, marginBottom: 12 }}>Rotate tiles to route power from the source to the target. High-quality tiles (crosses/T) provide multiple paths.</div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 8, background: '#070707', padding: 12, borderRadius: 6 }}>
          {board.flatMap((row, y) => row.map((cell, x) => {
            const [n,e,s,w] = cell.conn;
            return (
                    <button key={`${x}-${y}`} onClick={() => rotateAt(x,y)} style={{ height: 72, background: '#0b0b0b', border: `1px solid ${COLORS.ash}20`, color: COLORS.bone, cursor: 'pointer', position: 'relative', padding:0 }}>
                      <svg width={tileSize} height={tileSize} viewBox={`0 0 ${tileSize} ${tileSize}`} style={{ display: 'block' }}>
                        {/* background tile */}
                        <rect x="2" y="2" width={tileSize - 4} height={tileSize - 4} rx="6" fill="#080808" stroke="rgba(255,255,255,0.02)" />
                        {/* center hub */}
                        <circle cx={center} cy={center} r={hubRadius} fill={COLORS.bg || '#0b0b0b'} />
                        {/* connectors: draw clean, aligned strokes to edges */}
                        {n ? (
                          <>
                            <line x1={center} y1={center} x2={center} y2={edge} stroke={`${COLORS.flora}40`} strokeWidth={activeStroke + 3} strokeLinecap="round" />
                            <line x1={center} y1={center} x2={center} y2={edge} stroke={COLORS.flora} strokeWidth={activeStroke} strokeLinecap="round" />
                            <circle cx={center} cy={edge} r="3" fill={COLORS.flora} />
                          </>
                        ) : (
                          <line x1={center} y1={center} x2={center} y2={edge} stroke="rgba(255,255,255,0.06)" strokeWidth={inactiveStroke} strokeLinecap="round" />
                        )}
                        {e ? (
                          <>
                            <line x1={center} y1={center} x2={tileSize - edge} y2={center} stroke={`${COLORS.flora}40`} strokeWidth={activeStroke + 3} strokeLinecap="round" />
                            <line x1={center} y1={center} x2={tileSize - edge} y2={center} stroke={COLORS.flora} strokeWidth={activeStroke} strokeLinecap="round" />
                            <circle cx={tileSize - edge} cy={center} r="3" fill={COLORS.flora} />
                          </>
                        ) : (
                          <line x1={center} y1={center} x2={tileSize - edge} y2={center} stroke="rgba(255,255,255,0.06)" strokeWidth={inactiveStroke} strokeLinecap="round" />
                        )}
                        {s ? (
                          <>
                            <line x1={center} y1={center} x2={center} y2={tileSize - edge} stroke={`${COLORS.flora}40`} strokeWidth={activeStroke + 3} strokeLinecap="round" />
                            <line x1={center} y1={center} x2={center} y2={tileSize - edge} stroke={COLORS.flora} strokeWidth={activeStroke} strokeLinecap="round" />
                            <circle cx={center} cy={tileSize - edge} r="3" fill={COLORS.flora} />
                          </>
                        ) : (
                          <line x1={center} y1={center} x2={center} y2={tileSize - edge} stroke="rgba(255,255,255,0.06)" strokeWidth={inactiveStroke} strokeLinecap="round" />
                        )}
                        {w ? (
                          <>
                            <line x1={center} y1={center} x2={edge} y2={center} stroke={`${COLORS.flora}40`} strokeWidth={activeStroke + 3} strokeLinecap="round" />
                            <line x1={center} y1={center} x2={edge} y2={center} stroke={COLORS.flora} strokeWidth={activeStroke} strokeLinecap="round" />
                            <circle cx={edge} cy={center} r="3" fill={COLORS.flora} />
                          </>
                        ) : (
                          <line x1={center} y1={center} x2={edge} y2={center} stroke="rgba(255,255,255,0.06)" strokeWidth={inactiveStroke} strokeLinecap="round" />
                        )}
                        {/* source/target indicators */}
                        {source.x === x && source.y === y && <circle cx={edge} cy={center} r="4" fill={COLORS.signal || COLORS.crimson} />}
                        {target.x === x && target.y === y && <circle cx={tileSize - edge} cy={center} r="4" fill={COLORS.flora} />}
                      </svg>
                    </button>
                  );
          }))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", color: COLORS.ash }}>MOVES: {moves}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={reset} style={{ padding: '8px 10px', background: 'transparent', border: `1px solid ${COLORS.ash}20`, color: COLORS.ash, cursor: 'pointer' }}>RESET</button>
            {solved ? (
              <div style={{ color: COLORS.flora, fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconComponent icon={Icons.CheckCircle2} size={14} color={COLORS.flora} />
                <span>POWERED</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerCurrent;
