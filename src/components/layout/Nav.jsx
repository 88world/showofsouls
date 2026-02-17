import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { COLORS } from '../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// NAVIGATION COMPONENT
// Floating glassmorphic navigation bar with SOS Beacon CTA
// Fully responsive — hamburger menu on mobile
// ═══════════════════════════════════════════════════════════════

export const Nav = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
  };

  const navLinks = [
    { label: "HOME", path: "/" },
    { label: "THE INCIDENT", path: "/incident" },
    { label: "CHARACTERS", path: "/characters" },
    { label: "TAPES", path: "/tapes" },
    { label: "FORUM", path: "/media" },
  ];

  return (
    <>
      <nav className="sos-nav" style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        padding: "12px 24px",
        background: "rgba(26, 26, 26, 0.6)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: `1px solid rgba(255, 255, 255, 0.08)`,
        borderRadius: 16,
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        transition: "all 0.3s ease",
        maxWidth: "calc(100vw - 32px)",
        width: "fit-content",
      }}>
        {/* Desktop links */}
        <div className="nav-desktop" style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={(e) => handleNavClick(e, link.path)}
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
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                whiteSpace: "nowrap",
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
            className="nav-steam-btn"
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
              whiteSpace: "nowrap",
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" opacity="0.8">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
              </path>
            </svg>
            WISHLIST ON STEAM
          </a>
        </div>

        {/* Mobile: Logo + Hamburger */}
        <div className="nav-mobile-header" style={{
          display: "none",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22,
            letterSpacing: 4,
            color: COLORS.bone,
          }}>SOS</span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 5,
              zIndex: 102,
            }}
          >
            <span style={{
              display: "block", width: 24, height: 2,
              background: COLORS.bone,
              transition: "all 0.3s ease",
              transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
            }} />
            <span style={{
              display: "block", width: 24, height: 2,
              background: COLORS.bone,
              transition: "all 0.3s ease",
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: "block", width: 24, height: 2,
              background: COLORS.bone,
              transition: "all 0.3s ease",
              transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
            }} />
          </button>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 99,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}
      <div className="nav-mobile-menu" style={{
        position: "fixed",
        top: 0, right: 0, bottom: 0,
        width: 280,
        maxWidth: "80vw",
        background: "rgba(20, 26, 24, 0.98)",
        backdropFilter: "blur(20px)",
        borderLeft: `1px solid ${COLORS.ash}30`,
        zIndex: 101,
        transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "none",
        flexDirection: "column",
        padding: "80px 24px 32px",
        gap: 4,
        overflowY: "auto",
      }}>
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            onClick={(e) => handleNavClick(e, link.path)}
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: COLORS.bone,
              textDecoration: "none",
              padding: "16px 16px",
              borderBottom: `1px solid ${COLORS.ash}15`,
              transition: "all 0.2s ease",
              display: "block",
            }}
          >
            {link.label}
          </Link>
        ))}
        <a
          href="https://store.steampowered.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuOpen(false)}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            background: `linear-gradient(135deg, ${COLORS.crimson}dd, ${COLORS.crimson})`,
            color: "#fff",
            border: `1px solid ${COLORS.crimson}`,
            padding: "14px 18px",
            borderRadius: 8,
            textDecoration: "none",
            textAlign: "center",
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49" opacity="0.8" />
          </svg>
          WISHLIST ON STEAM
        </a>
      </div>
    </>
  );
};
