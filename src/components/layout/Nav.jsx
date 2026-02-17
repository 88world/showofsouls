import { Link } from 'react-router-dom';
import { COLORS } from '../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// NAVIGATION COMPONENT
// Floating glassmorphic navigation bar with SOS Beacon CTA
// ═══════════════════════════════════════════════════════════════

export const Nav = () => {
  const navLinks = [
    { label: "HOME", path: "/" },
    { label: "THE INCIDENT", path: "/incident" },
    { label: "CHARACTERS", path: "/characters" },
    { label: "TAPES", path: "/tapes" },
    { label: "FORUM", path: "/media" },
  ];

  return (
    <nav style={{
      position: "fixed",
      top: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 100,
      padding: "16px 32px",
      // Floating island glassmorphism
      background: "rgba(26, 26, 26, 0.6)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: `1px solid rgba(255, 255, 255, 0.08)`,
      borderRadius: 16,
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      transition: "all 0.3s ease",
      maxWidth: "fit-content",
    }}>
      {/* Nav Links - Floating Glass Buttons */}
      <div style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}>
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: COLORS.bone,
              textDecoration: "none",
              transition: "all 0.3s ease",
              position: "relative",
              padding: "10px 16px",
              borderRadius: 10,
              // Glass button effect
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
            }}
          >
            {link.label}
          </Link>
        ))}

        {/* SOS Beacon Button - Premium Glass */}
        <a
          href="https://store.steampowered.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            background: `linear-gradient(135deg, ${COLORS.crimson}dd, ${COLORS.crimson})`,
            color: "#fff",
            border: `1px solid ${COLORS.crimson}`,
            padding: "10px 18px",
            borderRadius: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.3s ease",
            boxShadow: `0 4px 20px ${COLORS.crimson}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
            position: "relative",
            overflow: "hidden",
            textDecoration: "none",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = `0 6px 30px ${COLORS.crimson}60, inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
            e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.crimson}ee, ${COLORS.crimson})`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = `0 4px 20px ${COLORS.crimson}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`;
            e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.crimson}dd, ${COLORS.crimson})`;
          }}
        >
          {/* Radio waves icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" opacity="0.8">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
            </path>
          </svg>
          WISHLIST ON STEAM
        </a>
      </div>
    </nav>
  );
};
