import { useState, useRef, useCallback } from 'react';
import { COLORS } from '../../../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// JIGSAW FRAGMENT — Drag torn document pieces into correct positions
// Unlocks: Document
// ═══════════════════════════════════════════════════════════════

const PIECES = [
  { id: 0, label: 'CASE', subtext: 'FILE' },
  { id: 1, label: '#', subtext: '0041' },
  { id: 2, label: 'DATE:', subtext: '10/31' },
  { id: 3, label: 'SUBJ:', subtext: 'UNKWN' },
  { id: 4, label: 'STAT:', subtext: 'OPEN' },
  { id: 5, label: 'SIGN:', subtext: '█████' },
];

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Make sure it's actually shuffled
  if (shuffled.every((v, i) => v === i)) return shuffleArray(arr);
  return shuffled;
}

function getOrCreateShuffle() {
  const stored = localStorage.getItem('sos_puzzle_jigsaw');
  if (stored) {
    try {
      const arr = JSON.parse(stored);
      if (arr.length === PIECES.length) return arr;
    } catch {}
  }
  const order = shuffleArray(PIECES.map((_, i) => i));
  localStorage.setItem('sos_puzzle_jigsaw', JSON.stringify(order));
  return order;
}

export const JigsawFragment = ({ isOpen, onClose, onSuccess }) => {
  const [slots, setSlots] = useState(() => getOrCreateShuffle());
  const [dragFrom, setDragFrom] = useState(null);
  const [success, setSuccess] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const handleDragStart = (slotIdx) => {
    if (success) return;
    setDragFrom(slotIdx);
  };

  const handleDrop = (slotIdx) => {
    if (success || dragFrom === null || dragFrom === slotIdx) {
      setDragFrom(null);
      return;
    }
    setSlots(prev => {
      const next = [...prev];
      [next[dragFrom], next[slotIdx]] = [next[slotIdx], next[dragFrom]];
      return next;
    });
    setDragFrom(null);
  };

  // Check if solved
  const isSolved = slots.every((pieceId, slotIdx) => pieceId === slotIdx);

  // Auto-detect success
  if (isSolved && !success) {
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    }, 300);
  }

  // Touch-based swapping (tap two pieces to swap)
  const handleTap = (slotIdx) => {
    if (success) return;
    if (touchStart === null) {
      setTouchStart(slotIdx);
    } else {
      if (touchStart !== slotIdx) {
        setSlots(prev => {
          const next = [...prev];
          [next[touchStart], next[slotIdx]] = [next[slotIdx], next[touchStart]];
          return next;
        });
      }
      setTouchStart(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a08', border: `2px solid ${COLORS.ember}`, padding: 32, maxWidth: 460, width: 'calc(100% - 32px)', cursor: 'default', position: 'relative' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: COLORS.ember, letterSpacing: 4, marginBottom: 8 }}>JIGSAW FRAGMENT</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, letterSpacing: 2, marginBottom: 8 }}>TORN DOCUMENT RECONSTRUCTION</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1, marginBottom: 24 }}>Drag or tap two pieces to swap them into the correct order</div>

        {/* Reference order (small) */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, justifyContent: 'center' }}>
          {PIECES.map((p, i) => (
            <div key={i} style={{
              fontFamily: "'Space Mono', monospace", fontSize: 7, color: COLORS.ash + '60',
              padding: '2px 6px', border: `1px solid ${COLORS.ash}15`, letterSpacing: 1,
            }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Main puzzle grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24,
        }}>
          {slots.map((pieceId, slotIdx) => {
            const piece = PIECES[pieceId];
            const isCorrect = pieceId === slotIdx;
            const isSelected = touchStart === slotIdx;
            const isDragging = dragFrom === slotIdx;
            return (
              <div
                key={slotIdx}
                draggable={!success}
                onDragStart={() => handleDragStart(slotIdx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(slotIdx)}
                onClick={() => handleTap(slotIdx)}
                style={{
                  padding: '16px 12px', textAlign: 'center',
                  background: isSelected ? COLORS.ember + '20' : isDragging ? '#1a1a1a' : '#0d0d0a',
                  border: `2px solid ${isCorrect && success ? COLORS.flora + '60' : isSelected ? COLORS.ember : COLORS.ash + '20'}`,
                  cursor: 'grab', userSelect: 'none', transition: 'all 0.2s',
                  opacity: isDragging ? 0.4 : 1,
                  boxShadow: isSelected ? `0 0 12px ${COLORS.ember}20` : 'none',
                  borderStyle: isCorrect && success ? 'solid' : 'dashed',
                }}
              >
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: COLORS.bone,
                  letterSpacing: 3, marginBottom: 4,
                }}>{piece.label}</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash,
                  letterSpacing: 2,
                }}>{piece.subtext}</div>
              </div>
            );
          })}
        </div>

        {/* Status */}
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, marginBottom: 12, textAlign: 'center' }}>
          {slots.filter((p, i) => p === i).length}/{PIECES.length} PIECES IN PLACE
        </div>

        {success && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.flora, marginBottom: 12, textAlign: 'center' }}>✓ DOCUMENT RECONSTRUCTED</div>}

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
};
