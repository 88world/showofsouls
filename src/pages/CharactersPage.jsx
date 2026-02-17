import { COLORS } from '../utils/constants';

// ═══════════════════════════════════════════════════════════════
// CHARACTERS PAGE
// Flora, Pyro, and other characters
// ═══════════════════════════════════════════════════════════════

export const CharactersPage = () => {
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
          color: COLORS.flora,
          marginBottom: 24,
        }}>
          CHARACTERS
        </h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 14,
          color: COLORS.bone,
          opacity: 0.7,
          letterSpacing: 1,
        }}>
          CHARACTER PROFILES & DOSSIERS COMING SOON
        </p>
      </div>
    </div>
  );
};
