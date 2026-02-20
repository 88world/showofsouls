import { COLORS } from '../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// EMERGENCY TICKER COMPONENT
// Scrolling news ticker with emergency messages
// ═══════════════════════════════════════════════════════════════

export const EmergencyTicker = ({ messages }) => (
  <div style={{
    background: `linear-gradient(90deg, ${COLORS.flora}15, ${COLORS.flora}25, ${COLORS.flora}15)`,
    borderTop: `1px solid ${COLORS.flora}40`,
    borderBottom: `1px solid ${COLORS.flora}40`,
    padding: "12px 0",
    overflow: "hidden",
    position: "relative",
  }}>
    <div style={{
      display: "flex",
      gap: 80,
      animation: "tickerScroll 5s linear infinite",
      whiteSpace: "nowrap",
      fontFamily: "'Space Mono', monospace",
      fontSize: 13,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: COLORS.flora,
      fontWeight: 600,
    }}>
      {[...messages, ...messages, ...messages].map((m, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: COLORS.flora, fontSize: 14 }}>●</span>
          {m}
        </span>
      ))}
    </div>
  </div>
);
