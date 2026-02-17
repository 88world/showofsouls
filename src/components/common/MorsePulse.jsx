import { COLORS } from '../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// MORSE PULSE COMPONENT
// Animated SOS morse code dots and dashes
// Pattern: · · · - - - · · · (SOS in morse)
// ═══════════════════════════════════════════════════════════════

export const MorsePulse = ({ color = COLORS.signal, size = 8 }) => {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1, 1, 1, 3, 3, 3, 1, 1, 1].map((w, i) => (
        <div
          key={i}
          style={{
            width: w === 1 ? size : size * 2.5,
            height: size,
            borderRadius: size / 2,
            background: color,
            animation: `morseBlink 3s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
};
