// ═══════════════════════════════════════════════════════════════
// PHYSICAL TAPE COMPONENT - STYLE REFERENCE
// Reusable VHS cassette tape visual component
// ═══════════════════════════════════════════════════════════════

import { COLORS } from '../utils/constants';

/**
 * PhysicalTape Component
 * 
 * A realistic VHS cassette tape visualization with:
 * - Spinning reels animation
 * - Physical label sticker
 * - Global unlock status badges
 * - Metadata display (title, date, length, status)
 * 
 * Props:
 * - id: string - Tape identifier (e.g., "TAPE-001")
 * - title: string - Tape title
 * - date: string - Recording date (optional)
 * - length: string - Duration (e.g., "47:23")
 * - status: string - Status label ("CORRUPT", "SAFE", "SEALED")
 * - isCorrupt: boolean - Whether tape is corrupted (affects styling)
 * - children: ReactNode - Custom content to display in date field
 * - unlocked: boolean - Whether globally unlocked (from useTapeUnlocks hook)
 * - unlockInfo: object - Who unlocked and when (from getTapeUnlockInfo)
 */

export const PhysicalTape = ({ id, title, date, length, status, isCorrupt, children, unlocked, unlockInfo }) => {
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
      
      {/* Cassette Reels */}
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
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          border: `4px dashed ${unlocked ? COLORS.flora : COLORS.ash}`, 
          opacity: 0.5, 
          animation: isCorrupt ? 'none' : 'spin 10s linear infinite' 
        }} />
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          border: `4px dashed ${unlocked ? COLORS.flora : COLORS.ash}`, 
          opacity: 0.5 
        }} />
      </div>

      {/* Cassette Label Sticker */}
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
        {/* Header Row */}
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
        
        {/* Metadata */}
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

// Required CSS:
// @keyframes spin { 100% { transform: rotate(360deg); } }
