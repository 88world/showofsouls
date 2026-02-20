import { useState } from 'react';
import { COLORS } from '../utils/constants';
import { useGlobalEvent } from '../features/events/GlobalEventProvider';
import { SpectralAnalysis } from '../features/puzzles/types/SpectralAnalysis/SpectralAnalysis';

// ═══════════════════════════════════════════════════════════════
// MEDIA PAGE (Audio Logs & Documents)
// Unlockable lore content
// ═══════════════════════════════════════════════════════════════

export const MediaPage = () => {
  const [showSpectral, setShowSpectral] = useState(false);
  const { currentEvent, markPuzzleComplete, isPuzzleEventComplete } = useGlobalEvent();
  const spectralSolved = isPuzzleEventComplete('spectralAnalysis');
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

        {/* Glitched puzzle trigger — SpectralAnalysis */}
        {currentEvent?.is_active && !spectralSolved && (
          <div
            onClick={() => setShowSpectral(true)}
            style={{
              marginTop: 50,
              padding: 20,
              textAlign: 'center',
              cursor: 'pointer',
              fontFamily: "'Space Mono', monospace",
              fontSize: 14,
              letterSpacing: 2,
              color: COLORS.ember,
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLORS.crimson;
              e.currentTarget.style.textShadow = `0 0 10px ${COLORS.ember}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLORS.ember;
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            ELECTROMAGNETIC INTERFERENCE DETECTED
          </div>
        )}

        <SpectralAnalysis
          isOpen={showSpectral}
          onClose={() => setShowSpectral(false)}
          onSuccess={() => { markPuzzleComplete('spectralAnalysis'); setShowSpectral(false); }}
        />
      </div>
    </div>
  );
};
