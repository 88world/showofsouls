import { COLORS } from '../utils/constants';

// ═══════════════════════════════════════════════════════════════
// MEDIA PAGE (Audio Logs & Documents)
// Unlockable lore content
// ═══════════════════════════════════════════════════════════════

export const MediaPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.bone,
      padding: '120px 40px 60px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(40px, 8vw, 80px)',
          letterSpacing: 8,
          color: COLORS.ember,
          marginBottom: 24,
        }}>
          MEDIA ARCHIVE
        </h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 14,
          color: COLORS.bone,
          opacity: 0.7,
          letterSpacing: 1,
        }}>
          AUDIO LOGS • DOCUMENTS • TRANSMISSIONS
        </p>
        <div style={{
          marginTop: 40,
          padding: 24,
          border: `1px solid ${COLORS.ash}`,
          borderRadius: 8,
          background: COLORS.bgLight,
        }}>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 14,
            color: COLORS.gold,
            letterSpacing: 1,
          }}>
            UNLOCK CONTENT BY COMPLETING PUZZLES
          </p>
        </div>
      </div>
    </div>
  );
};
