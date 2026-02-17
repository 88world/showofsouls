import { COLORS } from '../utils/constants';

// ═══════════════════════════════════════════════════════════════
// INCIDENT PAGE
// Details about the park incident
// ═══════════════════════════════════════════════════════════════

export const IncidentPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.bone,
      padding: 'clamp(80px, 12vw, 120px) clamp(12px, 4vw, 40px) clamp(30px, 5vw, 60px)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(40px, 8vw, 80px)',
          letterSpacing: 8,
          color: COLORS.crimson,
          marginBottom: 24,
        }}>
          THE INCIDENT
        </h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 14,
          color: COLORS.bone,
          opacity: 0.7,
          letterSpacing: 1,
        }}>
          DETAILED INCIDENT REPORT COMING SOON
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
            color: COLORS.flora,
            letterSpacing: 1,
          }}>
            [CLASSIFIED] — SECURITY CLEARANCE REQUIRED
          </p>
        </div>
      </div>
    </div>
  );
};
