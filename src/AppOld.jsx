import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// SHOW OF SOULS V2 — REDESIGNED WEBSITE
// Split hero design with improved layouts
// ═══════════════════════════════════════════════════════════════

const COLORS = {
  bg: "#141a18",
  bgLight: "#1a211e",
  bgLighter: "#212825",
  crimson: "#c41e1e",
  ember: "#ff4500",
  flora: "#00ff66",
  floraDeep: "#1B4332",
  floraMuted: "#2d6a4f",
  gold: "#d4a017",
  smoke: "#1a1512",
  ash: "#221f1a",
  bone: "#e8dcc8",
  signal: "#ff0040",
  cardDark: "#0f1412",
  cardLight: "#e8e4dc",
};

// ─── Utility Components ─────────────────────────────────────
const GlitchText = ({ children, className = "" }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className={className} style={{ position: "relative", display: "inline-block" }}>
      {children}
      {glitch && (
        <>
          <span style={{
            position: "absolute", top: "-2px", left: "2px",
            color: COLORS.flora, opacity: 0.7, clipPath: "inset(0 0 50% 0)",
            pointerEvents: "none"
          }}>{children}</span>
          <span style={{
            position: "absolute", top: "2px", left: "-2px",
            color: COLORS.crimson, opacity: 0.7, clipPath: "inset(50% 0 0 0)",
            pointerEvents: "none"
          }}>{children}</span>
        </>
      )}
    </span>
  );
};

const MorsePulse = ({ color = COLORS.signal, size = 8 }) => {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1, 1, 1, 3, 3, 3, 1, 1, 1].map((w, i) => (
        <div key={i} style={{
          width: w === 1 ? size : size * 2.5,
          height: size,
          borderRadius: size / 2,
          background: color,
          animation: `morseBlink 3s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
};

// ─── Navigation (Floating Island) ───────────────────────────
const Nav = ({ scrollY }) => {
  const links = ["HOME", "THE INCIDENT", "CHARACTERS", "TAPES", "MEDIA"];

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
        {links.map((link) => (
          <a key={link} href="#" style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
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
            {link}
          </a>
        ))}

        {/* SOS Beacon Button - Premium Glass */}
        <button style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
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
        </button>
      </div>
    </nav>
  );
};

// ─── Emergency Ticker ───────────────────────────────────────
const EmergencyTicker = ({ messages }) => (
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
      animation: "tickerScroll 50s linear infinite",
      whiteSpace: "nowrap",
      fontFamily: "'Space Mono', monospace",
      fontSize: 10,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: COLORS.flora,
      fontWeight: 600,
    }}>
      {[...messages, ...messages, ...messages].map((m, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: COLORS.flora, fontSize: 12 }}>●</span>
          {m}
        </span>
      ))}
    </div>
  </div>
);

// ─── Split Hero Section ─────────────────────────────────────
const SplitHero = ({ scrollY }) => {
  const [loaded, setLoaded] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setLoaded(true);
    const t = setInterval(() => setTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      position: "relative",
      height: "100vh",
      minHeight: 750,
      overflow: "hidden",
      background: COLORS.bg,
    }}>
      {/* Logo - Top Left */}
      <div style={{
        position: "absolute",
        top: 32,
        left: 40,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        {/* SOS Icon with pulse */}
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.crimson} strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          {/* Pulse wave */}
          <svg width="48" height="24" viewBox="0 0 40 20" style={{ marginLeft: 2 }}>
            <polyline
              points="0,10 5,10 7,5 9,15 11,10 15,10"
              fill="none"
              stroke={COLORS.crimson}
              strokeWidth="1.5"
              opacity="0.8"
            >
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
            </polyline>
          </svg>
        </div>

        {/* SOS Text */}
        <div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28,
            fontStyle: "italic",
            letterSpacing: 2,
            color: COLORS.crimson,
            textShadow: `0 0 15px ${COLORS.crimson}40`,
            lineHeight: 1,
          }}>SOS</div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 7,
            letterSpacing: 1.2,
            color: COLORS.flora,
            textTransform: "uppercase",
            marginTop: 3,
            opacity: 0.8,
          }}>EMERGENCY SIGNAL: ACTIVE</div>
        </div>
      </div>
      {/* Background with large SOS letters and glows */}
      <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: `linear-gradient(135deg, #0d1410 0%, #151a16 40%, #1a100d 70%, #130d0a 100%)`,
      }}>
        {/* Large SOS Background Text */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "min(60vw, 800px)",
          fontWeight: 700,
          color: "transparent",
          WebkitTextStroke: `2px rgba(255, 255, 255, 0.02)`,
          letterSpacing: "0.1em",
          userSelect: "none",
          pointerEvents: "none",
        }}>
          SOS
        </div>

        {/* LEFT - Green Glow (Flora) */}
        <div style={{
          position: "absolute",
          left: "-20%",
          top: "30%",
          width: "50%",
          height: "60%",
          background: `radial-gradient(ellipse, ${COLORS.flora}40 0%, ${COLORS.floraDeep}30 40%, transparent 60%)`,
          filter: "blur(120px)",
          opacity: 0.5,
        }} />

        {/* RIGHT - Orange/Red Glow (Pyro) */}
        <div style={{
          position: "absolute",
          right: "-20%",
          top: "30%",
          width: "50%",
          height: "60%",
          background: `radial-gradient(ellipse, ${COLORS.ember}50 0%, ${COLORS.crimson}30 40%, transparent 70%)`,
          filter: "blur(120px)",
          opacity: 0.4,
        }} />

        {/* Additional atmospheric glow */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: `linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.5) 100%)`,
        }} />
      </div>

      {/* Signal Info Box - Bottom Right - Horror Styled */}
      <div style={{
        position: "absolute",
        bottom: 60,
        right: 50,
        zIndex: 10,
        padding: "28px 32px",
        background: "rgba(10, 10, 10, 0.9)",
        backdropFilter: "blur(30px) saturate(120%)",
        WebkitBackdropFilter: "blur(30px) saturate(120%)",
        border: `2px solid ${COLORS.crimson}70`,
        borderRadius: 6,
        boxShadow: `
          0 8px 40px rgba(0, 0, 0, 0.7),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 50px ${COLORS.crimson}25,
          0 0 80px ${COLORS.flora}15
        `,
        fontFamily: "'Space Mono', monospace",
        minWidth: 300,
        transition: "all 0.3s ease",
      }}>
        {/* Glitch overlay effect */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 0, 0, 0.03) 2px,
            rgba(255, 0, 0, 0.03) 4px
          )`,
          pointerEvents: "none",
          mixBlendMode: "overlay",
        }} />

        {/* Corner decorations */}
        <div style={{
          position: "absolute",
          top: -1,
          left: -1,
          width: 12,
          height: 12,
          borderTop: `2px solid ${COLORS.crimson}`,
          borderLeft: `2px solid ${COLORS.crimson}`,
        }} />
        <div style={{
          position: "absolute",
          bottom: -1,
          right: -1,
          width: 12,
          height: 12,
          borderBottom: `2px solid ${COLORS.crimson}`,
          borderRight: `2px solid ${COLORS.crimson}`,
        }} />

        {/* Warning header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: `1px solid rgba(255, 255, 255, 0.15)`,
        }}>
          <div style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: COLORS.crimson,
            boxShadow: `0 0 15px ${COLORS.crimson}, 0 0 25px ${COLORS.crimson}60`,
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <span style={{
            fontSize: 12,
            letterSpacing: 2,
            color: "#fff",
            textTransform: "uppercase",
            fontWeight: 700,
            textShadow: `0 2px 10px rgba(0, 0, 0, 0.8), 0 0 15px ${COLORS.crimson}60`,
          }}>
            SIGNAL: <span style={{ color: COLORS.flora, textShadow: `0 0 15px ${COLORS.flora}` }}>WEAK</span>
          </span>
        </div>

        {/* Coordinates */}
        <div style={{
          fontSize: 10,
          letterSpacing: 0.5,
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span style={{ color: COLORS.ash, opacity: 0.6 }}>COORD:</span>
          <span style={{
            color: COLORS.bone,
            fontWeight: 600,
            textShadow: `0 0 5px ${COLORS.flora}20`,
          }}>
            37.7749°N 122.4194°W
          </span>
        </div>

        {/* TX-ID */}
        <div style={{
          fontSize: 10,
          letterSpacing: 0.5,
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span style={{ color: COLORS.ash, opacity: 0.6 }}>TX-ID:</span>
          <span style={{
            color: COLORS.bone,
            fontWeight: 600,
            fontFamily: "'Courier New', monospace",
          }}>
            ATF3-0B1C-DEAD
          </span>
        </div>

        {/* Status bar */}
        <div style={{
          position: "relative",
          width: "100%",
          height: 6,
          background: `linear-gradient(90deg, ${COLORS.ash}10, ${COLORS.ash}20)`,
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${COLORS.ash}30`,
        }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "35%",
            background: `linear-gradient(90deg, ${COLORS.crimson}, ${COLORS.ember})`,
            boxShadow: `0 0 10px ${COLORS.crimson}60, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
            animation: "pulse 2s ease-in-out infinite",
          }} />
          {/* Glitch effect on bar */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(255, 255, 255, 0.05) 3px,
              rgba(255, 255, 255, 0.05) 4px
            )`,
          }} />
        </div>

        {/* Distress text */}
        <div style={{
          marginTop: 12,
          fontSize: 8,
          letterSpacing: 1.5,
          color: COLORS.crimson,
          textTransform: "uppercase",
          opacity: 0.5,
          textAlign: "center",
          animation: "morseBlink 3s ease-in-out infinite",
        }}>
          ⚠ TRANSMISSION UNSTABLE
        </div>
      </div>

      {/* Content Overlay */}
      <div style={{
        position: "relative",
        zIndex: 10,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 40px",
        textAlign: "center",
      }}>
        {/* Title */}
        <div style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(40px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(80px, 12vw, 140px)",
            letterSpacing: 20,
            lineHeight: 0.9,
            color: COLORS.bone,
            margin: 0,
            textShadow: `0 4px 40px rgba(0, 0, 0, 0.8)`,
          }}>
            SHOW OF SOULS
          </h1>
        </div>

        {/* Subtitle */}
        <div style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
          fontFamily: "'Crimson Text', serif",
          fontStyle: "italic",
          fontSize: 26,
          color: COLORS.bone,
          marginTop: 24,
          opacity: 0.9,
        }}>
          The signal was always meant for you.
        </div>

        {/* Transmission timestamp */}
        <div style={{
          opacity: loaded ? 0.7 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s",
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: 2,
          color: COLORS.bone,
          textTransform: "uppercase",
          marginTop: 40,
        }}>
          LAST TRANSMISSION: <span style={{ color: COLORS.crimson }}>[REDACTED]</span> 23:47:31 UTC
        </div>

        {/* CTA Button */}
        <div style={{
          marginTop: 32,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s",
        }}>
          <button style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            padding: "16px 40px",
            border: `2px solid ${COLORS.flora}`,
            background: "transparent",
            color: COLORS.flora,
            borderRadius: 4,
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${COLORS.crimson}15`;
              e.currentTarget.style.borderColor = COLORS.crimson;
              e.currentTarget.style.color = COLORS.bone;
              e.currentTarget.style.boxShadow = `0 0 20px ${COLORS.crimson}30, inset 0 0 10px ${COLORS.crimson}08`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = COLORS.flora;
              e.currentTarget.style.color = COLORS.flora;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
              <polyline points="4,10 8,10 10,6 12,14 14,10 18,10" strokeWidth="1.5" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
              </polyline>
            </svg>
            RECEIVE TRANSMISSION
          </button>
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        background: `linear-gradient(transparent, ${COLORS.bg})`,
        zIndex: 5,
      }} />
    </section>
  );
};

// ─── Password Terminal ─────────────────────────────────────
const PasswordTerminal = ({ isOpen, onClose, onSuccess }) => {
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const correctPassword = "FLORA1947"; // Secret password

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.toUpperCase() === correctPassword) {
      setSuccess(true);
      setError("");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setAttempts(prev => prev - 1);
      setError(`ACCESS DENIED. ${attempts - 1} ATTEMPTS REMAINING`);
      setInput("");
      if (attempts <= 1) {
        setTimeout(() => {
          onClose();
          setAttempts(3);
          setError("");
        }, 2000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.9)",
      backdropFilter: "blur(10px)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        background: COLORS.cardDark,
        border: `2px solid ${success ? COLORS.flora : COLORS.crimson}`,
        borderRadius: 8,
        padding: 40,
        maxWidth: 500,
        width: "90%",
        boxShadow: `0 0 40px ${success ? COLORS.flora : COLORS.crimson}30`,
        animation: "scaleIn 0.3s ease",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.ash}`,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: success ? COLORS.flora : COLORS.crimson,
            boxShadow: `0 0 12px ${success ? COLORS.flora : COLORS.crimson}`,
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <h3 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            letterSpacing: 2,
            color: COLORS.bone,
            textTransform: "uppercase",
            margin: 0,
          }}>
            {success ? "ACCESS GRANTED" : "ENCRYPTED TERMINAL"}
          </h3>
        </div>

        {/* Status */}
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: `${COLORS.bone}60`,
          marginBottom: 20,
          lineHeight: 1.6,
        }}>
          {'>'} DECRYPTION REQUIRED<br />
          {'>'} ENTER PASSWORD TO ACCESS CLASSIFIED FILES<br />
          {'>'} ATTEMPTS: {attempts}/3
        </div>

        {success ? (
          <>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24,
              letterSpacing: 3,
              color: COLORS.flora,
              textAlign: "center",
              padding: "20px 0",
              textShadow: `0 0 20px ${COLORS.flora}`,
            }}>
              DECRYPTION SUCCESSFUL
            </div>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                marginTop: 20,
                padding: "12px",
                background: COLORS.flora + "15",
                border: `1px solid ${COLORS.flora}`,
                borderRadius: 4,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: 1.5,
                color: COLORS.flora,
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = COLORS.flora + "30";
                e.currentTarget.style.boxShadow = `0 0 20px ${COLORS.flora}30`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = COLORS.flora + "15";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              CLOSE
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER PASSWORD..."
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                background: COLORS.bg,
                border: `1px solid ${error ? COLORS.crimson : COLORS.ash}`,
                borderRadius: 4,
                fontFamily: "'Space Mono', monospace",
                fontSize: 14,
                letterSpacing: 2,
                color: COLORS.bone,
                textTransform: "uppercase",
                outline: "none",
                transition: "all 0.3s",
              }}
            />
            {error && (
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                color: COLORS.crimson,
                marginTop: 12,
                textAlign: "center",
                animation: "shake 0.5s",
              }}>
                ⚠ {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "12px",
                  background: COLORS.flora + "15",
                  border: `1px solid ${COLORS.flora}`,
                  borderRadius: 4,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: COLORS.flora,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.flora + "25";
                  e.currentTarget.style.boxShadow = `0 0 15px ${COLORS.flora}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLORS.flora + "15";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                DECRYPT
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: `1px solid ${COLORS.ash}`,
                  borderRadius: 4,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: COLORS.bone,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.ash + "20";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                CANCEL
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Memory Game ─────────────────────────────────────────────
const MemoryGame = ({ isOpen, onClose, onSuccess }) => {
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [currentDisplay, setCurrentDisplay] = useState(null);
  const [gameState, setGameState] = useState("start"); // start, showing, input, success, failed
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState("");

  const startGame = () => {
    const newSequence = Array.from({ length: 3 + level }, () => Math.floor(Math.random() * 9) + 1);
    setSequence(newSequence);
    setUserInput([]);
    setGameState("showing");
    setMessage("MEMORIZE THE SEQUENCE...");

    // Show sequence
    newSequence.forEach((num, i) => {
      setTimeout(() => {
        setCurrentDisplay(num);
        setTimeout(() => setCurrentDisplay(null), 600);
      }, i * 1000);
    });

    // Switch to input mode
    setTimeout(() => {
      setGameState("input");
      setMessage("ENTER THE SEQUENCE");
    }, newSequence.length * 1000 + 500);
  };

  const handleNumberClick = (num) => {
    if (gameState !== "input") return;

    const newInput = [...userInput, num];
    setUserInput(newInput);

    // Check if correct
    if (newInput[newInput.length - 1] !== sequence[newInput.length - 1]) {
      setGameState("failed");
      setMessage("SEQUENCE ERROR - NEURAL SYNC FAILED");
      setTimeout(() => {
        setGameState("start");
        setLevel(1);
        setMessage("");
      }, 2000);
      return;
    }

    // Check if complete
    if (newInput.length === sequence.length) {
      if (level >= 3) {
        setGameState("success");
        setMessage("NEURAL SYNC COMPLETE - ACCESS GRANTED");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setGameState("success");
        setMessage(`LEVEL ${level} COMPLETE`);
        setTimeout(() => {
          setLevel(prev => prev + 1);
          startGame();
        }, 1500);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.9)",
      backdropFilter: "blur(10px)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        background: COLORS.cardDark,
        border: `2px solid ${gameState === "success" ? COLORS.flora : COLORS.crimson}`,
        borderRadius: 8,
        padding: 40,
        maxWidth: 500,
        width: "90%",
        boxShadow: `0 0 40px ${gameState === "success" ? COLORS.flora : COLORS.crimson}30`,
        animation: "scaleIn 0.3s ease",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.ash}`,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: gameState === "success" ? COLORS.flora : COLORS.crimson,
            boxShadow: `0 0 12px ${gameState === "success" ? COLORS.flora : COLORS.crimson}`,
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <h3 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            letterSpacing: 2,
            color: COLORS.bone,
            textTransform: "uppercase",
            margin: 0,
          }}>
            NEURAL PATTERN SYNC
          </h3>
        </div>

        {/* Level & Message */}
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: `${COLORS.bone}60`,
          marginBottom: 20,
          lineHeight: 1.6,
        }}>
          {'>'} LEVEL: {level}/3<br />
          {'>'} STATUS: {message || "WAITING FOR SYNC..."}
        </div>

        {/* Display Area */}
        {gameState !== "start" && (
          <div style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.ash}`,
            borderRadius: 8,
            padding: 40,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 120,
          }}>
            {currentDisplay !== null ? (
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 72,
                letterSpacing: 4,
                color: COLORS.crimson,
                textShadow: `0 0 30px ${COLORS.crimson}`,
                animation: "pulse 0.3s",
              }}>
                {currentDisplay}
              </div>
            ) : gameState === "input" && (
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 24,
                letterSpacing: 2,
                color: COLORS.flora,
              }}>
                {userInput.join(" - ") || "_"}
              </div>
            )}
          </div>
        )}

        {/* Number Pad */}
        {gameState === "input" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                style={{
                  padding: 20,
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.ash}`,
                  borderRadius: 8,
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 24,
                  color: COLORS.bone,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.flora + "15";
                  e.currentTarget.style.borderColor = COLORS.flora;
                  e.currentTarget.style.color = COLORS.flora;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLORS.bg;
                  e.currentTarget.style.borderColor = COLORS.ash;
                  e.currentTarget.style.color = COLORS.bone;
                }}
              >
                {num}
              </button>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          {gameState === "start" && (
            <button
              onClick={startGame}
              style={{
                flex: 1,
                padding: "12px",
                background: COLORS.flora + "15",
                border: `1px solid ${COLORS.flora}`,
                borderRadius: 4,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: 1.5,
                color: COLORS.flora,
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = COLORS.flora + "25";
                e.currentTarget.style.boxShadow = `0 0 15px ${COLORS.flora}30`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = COLORS.flora + "15";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              START SYNC
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: gameState === "start" ? 1 : "auto",
              padding: "12px 24px",
              background: "transparent",
              border: `1px solid ${COLORS.ash}`,
              borderRadius: 4,
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: 1.5,
              color: COLORS.bone,
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = COLORS.ash + "20";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            ABORT
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Random Easter Egg Popup ───────────────────────────────
const EasterEggPopup = ({ message, onClose }) => {
  return (
    <>
      {/* Backdrop - click to close */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(2px)",
          zIndex: 9997,
          animation: "fadeIn 0.3s ease",
          cursor: "pointer",
        }}
      />

      {/* Popup */}
      <div style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9998,
        maxWidth: 400,
        animation: "slideInRight 0.5s ease",
      }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: COLORS.cardDark,
            border: `2px solid ${COLORS.flora}`,
            borderRadius: 8,
            padding: 24,
            boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 30px ${COLORS.flora}30`,
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 12,
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: COLORS.flora,
              boxShadow: `0 0 12px ${COLORS.flora}`,
              animation: "pulse 1.5s ease-in-out infinite",
              marginTop: 4,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: 2,
                color: COLORS.flora,
                textTransform: "uppercase",
                marginBottom: 8,
              }}>
                ⚠ INTERCEPTED TRANSMISSION
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: COLORS.bone,
                lineHeight: 1.6,
              }}>
                {message}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: COLORS.ash + "20",
                border: `1px solid ${COLORS.ash}`,
                borderRadius: 4,
                color: COLORS.bone,
                cursor: "pointer",
                fontSize: 16,
                padding: "4px 8px",
                lineHeight: 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = COLORS.crimson + "30";
                e.currentTarget.style.borderColor = COLORS.crimson;
                e.currentTarget.style.color = COLORS.crimson;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = COLORS.ash + "20";
                e.currentTarget.style.borderColor = COLORS.ash;
                e.currentTarget.style.color = COLORS.bone;
              }}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── The Incident - Mosaic Gallery ─────────────────────────
const BentoGrid = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const ref = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showMemoryGame, setShowMemoryGame] = useState(false);
  const [unlockedSecrets, setUnlockedSecrets] = useState({
    password: false,
    memoryGame: false,
  });
  const [easterEgg, setEasterEgg] = useState(null);

  // Easter egg messages with password clues
  const easterEggMessages = [
    "...the flowers... FLORA... they bloom in darkness...",
    "Year of founding... 1947... the year it all began...",
    "They called her FLORA... born 1947... now she's everywhere...",
    "The password... it's in the name... FLORA... and the year... 1947...",
    "Entry code: F-L-O-R-A-1-9-4-7... don't forget...",
    "[CORRUPTED] ...floRA19... [SIGNAL LOST] ...47...",
  ];

  // Random easter egg popup (1-5 min for testing)
  useEffect(() => {
    const showEasterEgg = () => {
      const randomMessage = easterEggMessages[Math.floor(Math.random() * easterEggMessages.length)];
      setEasterEgg(randomMessage);

      // Auto-close after 8 seconds
      setTimeout(() => setEasterEgg(null), 8000);
    };

    // Random interval between 1-5 minutes (60000-300000 ms)
    const scheduleNext = () => {
      const delay = 60000 + Math.random() * 240000; // 1-5 min
      return setTimeout(() => {
        showEasterEgg();
        scheduleNext();
      }, delay);
    };

    const timeout = scheduleNext();
    return () => clearTimeout(timeout);
  }, []);

  // Random memory game popup (1-5 min for testing)
  useEffect(() => {
    const triggerMemoryGame = () => {
      if (!unlockedSecrets.memoryGame) {
        setShowMemoryGame(true);
      }
    };

    // Random interval between 1-5 minutes
    const scheduleNext = () => {
      const delay = 60000 + Math.random() * 240000; // 1-5 min
      return setTimeout(() => {
        triggerMemoryGame();
        scheduleNext();
      }, delay);
    };

    const timeout = scheduleNext();
    return () => clearTimeout(timeout);
  }, [unlockedSecrets.memoryGame]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Horror game-themed mosaic items - 3 rows, 6 columns with varying sizes
  const mosaicItems = [
    {
      id: 1,
      title: "LAST KNOWN LOCATION",
      subtitle: "SECTOR 4 - EAST WING",
      image: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=900&h=900&fit=crop",
      span: "col-span-2 row-span-2", // Large block
      timestamp: "23:47:31"
    },
    {
      id: 2,
      title: "SURVEILLANCE CAM 07",
      subtitle: "CORRUPTED FEED",
      image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&h=600&fit=crop",
      span: "col-span-1 row-span-1", // Small
      timestamp: "23:45:12"
    },
    {
      id: 3,
      title: "EVIDENCE #4521",
      subtitle: "BIOLOGICAL ANOMALY",
      image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&h=900&fit=crop",
      span: "col-span-2 row-span-2", // Large block
      timestamp: "23:41:08"
    },
    {
      id: 4,
      title: "THERMAL SCAN",
      subtitle: "UNKNOWN HEAT SIGNATURE",
      image: "https://images.unsplash.com/photo-1635241161466-541f065683ba?w=600&h=600&fit=crop",
      span: "col-span-1 row-span-1", // Small
      timestamp: "23:39:54"
    },
    {
      id: 5,
      title: "CONTAINMENT BREACH",
      subtitle: "ZONE 7 COMPROMISED",
      image: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=600&h=600&fit=crop",
      span: "col-span-1 row-span-1", // Small
      timestamp: "23:38:20"
    },
    {
      id: 6,
      title: "EMERGENCY LIGHTS",
      subtitle: "POWER FAILURE DETECTED",
      image: "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=600&h=600&fit=crop",
      span: "col-span-1 row-span-1", // Small
      timestamp: "23:37:05"
    },
    {
      id: 7,
      title: "FINAL TRANSMISSION",
      subtitle: "AUDIO LOG RECOVERED",
      image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=1000&h=600&fit=crop",
      span: "col-span-3 row-span-1", // Wide
      timestamp: "23:32:18"
    },
    {
      id: 8,
      title: "CLASSIFIED RECORDS",
      subtitle: "ACCESS RESTRICTED",
      image: "https://images.unsplash.com/photo-1516214104703-d870798883c5?w=800&h=600&fit=crop",
      span: "col-span-2 row-span-1", // Medium
      timestamp: "23:30:45"
    },
    {
      id: 9,
      title: "SYSTEM FAILURE",
      subtitle: "CRITICAL ERROR",
      image: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=600&h=600&fit=crop",
      span: "col-span-1 row-span-1", // Small
      timestamp: "23:28:12"
    }
  ];

  return (
    <>
      <PasswordTerminal
        isOpen={showPassword}
        onClose={() => setShowPassword(false)}
        onSuccess={() => setUnlockedSecrets(prev => ({ ...prev, password: true }))}
      />
      <MemoryGame
        isOpen={showMemoryGame}
        onClose={() => setShowMemoryGame(false)}
        onSuccess={() => setUnlockedSecrets(prev => ({ ...prev, memoryGame: true }))}
      />

      {/* Easter Egg Popup */}
      {easterEgg && (
        <EasterEggPopup
          message={easterEgg}
          onClose={() => setEasterEgg(null)}
        />
      )}

      <section ref={ref} style={{
        padding: "100px 40px 120px",
        background: COLORS.bg,
        position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute",
          top: "20%",
          left: "-10%",
          width: "40%",
          height: "60%",
          background: `radial-gradient(ellipse, ${COLORS.crimson}10, transparent)`,
          filter: "blur(100px)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{
            marginBottom: 60,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              letterSpacing: 3,
              color: COLORS.crimson,
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              █ CLASSIFIED ARCHIVES
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(52px, 6vw, 80px)",
              letterSpacing: 12,
              color: COLORS.bone,
              margin: 0,
              textShadow: `0 2px 40px ${COLORS.crimson}20`,
            }}>
              THE INCIDENT
            </h2>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 13,
              color: `${COLORS.bone}60`,
              marginTop: 16,
              maxWidth: 600,
              lineHeight: 1.8,
            }}>
              Retrieved from corrupted storage. Timestamp: March 17, 2024.
              Location: [REDACTED]. Status: Investigation ongoing.
            </p>
          </div>

          {/* Mosaic Grid - 3 Rows */}
          <div
            className="bento-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gridTemplateRows: "repeat(3, 220px)",
              gap: 16,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s",
            }}>
            {mosaicItems.map((item, i) => (
              <div
                key={item.id}
                className={item.span}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  // Easter egg: clicking certain cards reveals hints
                  if (item.id === 1 || item.id === 3 || item.id === 7) {
                    const hints = [
                      "...something whispers... 'FLORA'...",
                      "...the number flickers... 1947...",
                      "...combine them... the truth awaits...",
                    ];
                    const hint = hints[Math.floor(Math.random() * hints.length)];
                    setEasterEgg(hint);
                    setTimeout(() => setEasterEgg(null), 6000);
                  }
                }}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: `1px solid ${hoveredIndex === i ? COLORS.crimson + '60' : COLORS.ash + '20'}`,
                  transition: "all 0.3s ease",
                  boxShadow: hoveredIndex === i
                    ? `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${COLORS.crimson}20`
                    : "0 4px 16px rgba(0,0,0,0.4)",
                }}
              >
                {/* Background Image */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url('${item.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: `grayscale(${hoveredIndex === i ? 0 : 70}%) brightness(${hoveredIndex === i ? 0.6 : 0.4})`,
                  transition: "all 0.4s ease",
                  transform: hoveredIndex === i ? "scale(1.05)" : "scale(1)",
                }} />

                {/* Dark overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)`,
                }} />

                {/* Scanline effect */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 0, 0, 0.3) 2px,
                  rgba(0, 0, 0, 0.3) 4px
                )`,
                  opacity: 0.5,
                  pointerEvents: "none",
                }} />

                {/* Timestamp */}
                <div style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: 1,
                  color: COLORS.crimson,
                  background: "rgba(0, 0, 0, 0.7)",
                  padding: "5px 10px",
                  borderRadius: 3,
                  border: `1px solid ${COLORS.crimson}40`,
                }}>
                  {item.timestamp}
                </div>

                {/* Status indicator */}
                <div style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: COLORS.crimson,
                  boxShadow: `0 0 10px ${COLORS.crimson}`,
                  animation: "pulse 2s ease-in-out infinite",
                }} />

                {/* Content */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 20,
                  zIndex: 2,
                }}>
                  <h3 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 20,
                    letterSpacing: 2,
                    color: COLORS.bone,
                    margin: 0,
                    marginBottom: 4,
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10,
                    letterSpacing: 0.5,
                    color: `${COLORS.bone}80`,
                    margin: 0,
                    textTransform: "uppercase",
                  }}>
                    {item.subtitle}
                  </p>
                </div>

                {/* Glitch effect on hover */}
                {hoveredIndex === i && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(90deg, transparent, ${COLORS.crimson}10, transparent)`,
                    animation: "glitchSlide 0.5s ease-in-out infinite",
                    pointerEvents: "none",
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Warning footer - with hidden password trigger */}
          <div
            style={{
              marginTop: 40,
              padding: "20px 24px",
              background: `linear-gradient(135deg, ${COLORS.crimson}08, transparent)`,
              border: `1px solid ${COLORS.crimson}20`,
              borderRadius: 6,
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: 1.5,
              color: `${COLORS.bone}60`,
              textAlign: "center",
              textTransform: "uppercase",
              opacity: visible ? 1 : 0,
              transition: "opacity 0.8s 0.6s",
              position: "relative",
            }}
          >
            ⚠ WARNING: CLASSIFIED MATERIAL - UNAUTHORIZED ACCESS WILL BE PROSECUTED

            {/* Hidden clickable area - Easter egg to open password terminal */}
            <div
              onClick={() => setShowPassword(true)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
                opacity: 0,
              }}
              title="Click to decrypt..."
            />
          </div>

          {/* Hidden hint - only visible on hover */}
          {!unlockedSecrets.password && (
            <div style={{
              marginTop: 16,
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: "transparent",
              textAlign: "center",
              transition: "color 0.3s",
              cursor: "pointer",
            }}
              onMouseEnter={e => e.target.style.color = `${COLORS.bone}20`}
              onMouseLeave={e => e.target.style.color = "transparent"}
              onClick={() => setShowPassword(true)}
            >
              [CLICK WARNING TO DECRYPT FILES]
            </div>
          )}

          {/* Unlocked Secrets */}
          {(unlockedSecrets.password || unlockedSecrets.memoryGame) && (
            <div style={{
              marginTop: 40,
              padding: 32,
              background: `linear-gradient(135deg, ${COLORS.flora}10, transparent)`,
              border: `2px solid ${COLORS.flora}40`,
              borderRadius: 8,
              animation: "scaleIn 0.5s ease",
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 13,
                letterSpacing: 3,
                color: COLORS.flora,
                textTransform: "uppercase",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: COLORS.flora,
                  boxShadow: `0 0 12px ${COLORS.flora}`,
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
                CLASSIFIED FILES UNLOCKED
              </div>

              {unlockedSecrets.password && (
                <div style={{
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.ash}`,
                  borderRadius: 6,
                  padding: 32,
                  marginBottom: 16,
                }}>
                  <h4 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 28,
                    letterSpacing: 3,
                    color: COLORS.bone,
                    margin: "0 0 16px 0",
                  }}>
                    AUDIO LOG #FL-1947
                  </h4>
                  <p style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 14,
                    color: `${COLORS.bone}90`,
                    lineHeight: 1.8,
                    marginBottom: 20,
                  }}>
                    "They said Flora was safe. They lied. The park shutdown wasn't for safety violations.
                    Something emerged from Sector 4. The bioluminescence... it's not natural.
                    It's spreading. If you're reading this, stay away from—"
                  </p>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 12,
                    color: COLORS.crimson,
                    fontStyle: "italic",
                  }}>
                    [TRANSMISSION INTERRUPTED]
                  </div>
                </div>
              )}

              {unlockedSecrets.memoryGame && (
                <div style={{
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.ash}`,
                  borderRadius: 6,
                  padding: 32,
                }}>
                  <h4 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 28,
                    letterSpacing: 3,
                    color: COLORS.bone,
                    margin: "0 0 16px 0",
                  }}>
                    SURVEILLANCE FOOTAGE - ENHANCED
                  </h4>
                  <p style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 14,
                    color: `${COLORS.bone}90`,
                    lineHeight: 1.8,
                    marginBottom: 20,
                  }}>
                    Neural pattern sync complete. Enhanced footage reveals anomalous figure matching
                    neither staff profiles nor visitor logs. Entity displays non-standard movement patterns.
                    Facial recognition: NO MATCH FOUND.
                  </p>
                  <div style={{
                    padding: 20,
                    background: COLORS.cardDark,
                    border: `1px solid ${COLORS.crimson}40`,
                    borderRadius: 4,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 12,
                    color: COLORS.crimson,
                    textAlign: "center",
                    letterSpacing: 2,
                  }}>
                    ⚠ ENTITY CLASSIFICATION: UNKNOWN ⚠
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

// ─── CTA Terminal ───────────────────────────────────────────
const CTATerminal = () => {
  const [visible, setVisible] = useState(false);
  const [typed, setTyped] = useState("");
  const ref = useRef(null);
  const fullText = "IF YOU SEE THIS, THE SIGNAL REACHED YOU.";

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <section ref={ref} style={{
      padding: "100px 40px",
      background: COLORS.bg,
    }}>
      <div style={{
        maxWidth: 800,
        margin: "0 auto",
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: 3,
          color: COLORS.flora,
          textTransform: "uppercase",
          marginBottom: 8,
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s",
        }}>
          CTA CTA
        </div>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(36px, 5vw, 56px)",
          letterSpacing: 8,
          color: COLORS.bone,
          margin: "0 0 48px",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
        }}>
          DISTRESS TERMINAL
        </h2>

        <div style={{
          background: `linear-gradient(145deg, ${COLORS.smoke}, ${COLORS.bg})`,
          border: `1px solid ${COLORS.ash}`,
          borderRadius: 12,
          overflow: "hidden",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s",
        }}>
          {/* Terminal Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            background: COLORS.ash,
            borderBottom: `1px solid ${COLORS.ash}`,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.crimson }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.gold }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.flora }} />
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: 2,
              color: `${COLORS.bone}40`,
              textTransform: "uppercase",
              marginLeft: 8,
            }}>
              DISTRESS TERMINAL v0.7.3
            </span>
          </div>

          {/* Terminal Body */}
          <div style={{ padding: 40 }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: `${COLORS.flora}60`,
              letterSpacing: 1,
              marginBottom: 24,
            }}>
              {'>'} connecting to sos_beacon...<br />
              {'>'} signal detected. source: unknown<br />
              {'>'} decrypting message...<br />
            </div>

            <p style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(24px, 3vw, 32px)",
              letterSpacing: 3,
              color: COLORS.bone,
              margin: "24px 0",
              minHeight: "2em",
            }}>
              {typed}<span style={{
                animation: "cursorBlink 1s step-end infinite",
                color: COLORS.flora,
              }}>█</span>
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 32,
            }}>
              {[
                { label: "ADD TO WISHLIST", icon: "→" },
                { label: "JOIN DISCORD", icon: "→" },
                { label: "SUBSCRIBE FOR ALERTS", icon: "→" },
              ].map((btn, i) => (
                <button key={btn.label} style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  padding: "14px 24px",
                  background: "transparent",
                  border: `1px solid ${COLORS.bone}20`,
                  color: COLORS.bone,
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: visible ? 1 : 0,
                  transitionDelay: `${2 + i * 0.15}s`,
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = COLORS.crimson;
                    e.currentTarget.style.color = COLORS.crimson;
                    e.currentTarget.style.background = `${COLORS.crimson}10`;
                    e.currentTarget.style.boxShadow = `0 0 15px ${COLORS.crimson}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `${COLORS.bone}20`;
                    e.currentTarget.style.color = COLORS.bone;
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span>{btn.label}</span>
                  <span>{btn.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ─────────────────────────────────────────────────
const Footer = () => (
  <footer style={{
    padding: "60px 40px 40px",
    background: COLORS.bg,
    borderTop: `1px solid ${COLORS.ash}`,
  }}>
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 32,
          fontStyle: "italic",
          letterSpacing: 4,
          color: COLORS.crimson,
          textShadow: `0 0 20px ${COLORS.crimson}40`,
        }}>
          SOS
        </div>
        <MorsePulse color={`${COLORS.crimson}40`} size={4} />
      </div>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 9,
        letterSpacing: 2,
        color: `${COLORS.bone}20`,
        textAlign: "center",
      }}>
        SHOW OF SOULS © 2025 — TRANSMISSION ENDS — SIGNAL WILL RESUME
      </div>
    </div>
  </footer>
);

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [redFlash, setRedFlash] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [vhsTracking, setVhsTracking] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Random red flash effect
  useEffect(() => {
    const triggerFlash = () => {
      setRedFlash(true);
      setTimeout(() => setRedFlash(false), 150);
    };
    const interval = setInterval(triggerFlash, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const triggerGlitch = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    };
    const interval = setInterval(triggerGlitch, 10000 + Math.random() * 15000);
    return () => clearInterval(interval);
  }, []);

  // VHS tracking lines effect
  useEffect(() => {
    const triggerTracking = () => {
      setVhsTracking(true);
      setTimeout(() => setVhsTracking(false), 800);
    };
    const interval = setInterval(triggerTracking, 6000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: COLORS.bg, color: COLORS.bone, minHeight: "100vh" }}>
      {/* Effects Toggle Button */}
      <button
        onClick={() => setEffectsEnabled(!effectsEnabled)}
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 10001,
          padding: "12px 16px",
          background: effectsEnabled ? COLORS.flora + "20" : COLORS.crimson + "20",
          border: `2px solid ${effectsEnabled ? COLORS.flora : COLORS.crimson}`,
          borderRadius: 8,
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: 1.5,
          color: effectsEnabled ? COLORS.flora : COLORS.crimson,
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.3s",
          boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 20px ${effectsEnabled ? COLORS.flora : COLORS.crimson}30`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = `0 6px 24px rgba(0,0,0,0.6), 0 0 30px ${effectsEnabled ? COLORS.flora : COLORS.crimson}50`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.4), 0 0 20px ${effectsEnabled ? COLORS.flora : COLORS.crimson}30`;
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {effectsEnabled ? (
            <>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </>
          ) : (
            <>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </>
          )}
        </svg>
        {effectsEnabled ? "VHS ON" : "VHS OFF"}
      </button>

      {/* Retro TV Effect Overlay */}
      {effectsEnabled && (
        <>
          {/* Scanlines */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 9999,
            background: `repeating-linear-gradient(
            0deg,
            rgba(0, 20, 10, 0.15),
            rgba(0, 20, 10, 0.15) 3px,
            transparent 3px,
            transparent 10px
          )`,
            animation: "scanline 1s linear infinite",
          }} />

          {/* Film Grain - Multiple Layers */}
          <div style={{
            position: "fixed",
            inset: 0,
            opacity: 0.15,
            pointerEvents: "none",
            zIndex: 9999,
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "250px 250px",
              animation: "grain1 0.8s steps(5) infinite",
            }} />
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.6' numOctaves='2' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "300px 300px",
              animation: "grain2 1.2s steps(4) infinite",
              opacity: 0.6,
            }} />
          </div>

          {/* Red Flash */}
          {redFlash && (
            <div style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9999,
              background: `linear-gradient(135deg, ${COLORS.crimson}40, ${COLORS.signal}30)`,
              animation: "redPulse 0.15s ease-out",
            }} />
          )}

          {/* Glitch Effect - Vertical Displacement */}
          {glitchActive && (
            <>
              <div style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                zIndex: 9999,
                clipPath: `inset(0 0 ${60 + Math.random() * 30}% 0)`,
                transform: `translateY(-${Math.random() * 8}px)`,
                filter: `hue-rotate(${Math.random() * 20}deg)`,
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(90deg, ${COLORS.flora}20, transparent)`,
                }} />
              </div>
              <div style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                zIndex: 9999,
                clipPath: `inset(${30 + Math.random() * 20}% 0 0 0)`,
                transform: `translateY(${Math.random() * 8}px)`,
                filter: `hue-rotate(-${Math.random() * 20}deg)`,
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(90deg, transparent, ${COLORS.crimson}20)`,
                }} />
              </div>
            </>
          )}

          {/* Chromatic Aberration */}
          <div style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            boxShadow: `
            inset 3px 0 0 rgba(255, 0, 100, 0.04),
            inset -3px 0 0 rgba(0, 255, 100, 0.04)
          `,
          }} />

          {/* VHS Tracking Lines */}
          {vhsTracking && (
            <>
              <div style={{
                position: "fixed",
                left: 0,
                right: 0,
                height: "8px",
                top: "20%",
                pointerEvents: "none",
                zIndex: 9999,
                background: `repeating-linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.1),
                rgba(255, 255, 255, 0.1) 2px,
                rgba(0, 0, 0, 0.3) 2px,
                rgba(0, 0, 0, 0.3) 4px
              )`,
                animation: "trackingSlide 0.8s linear",
                filter: "blur(1px)",
              }} />
              <div style={{
                position: "fixed",
                left: 0,
                right: 0,
                height: "4px",
                top: "60%",
                pointerEvents: "none",
                zIndex: 9999,
                background: "rgba(255, 255, 255, 0.15)",
                animation: "trackingSlide 0.8s linear 0.2s",
                filter: "blur(2px)",
              }} />
            </>
          )}

          {/* VHS Color Bleeding */}
          <div style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            background: `linear-gradient(
            to right,
            ${COLORS.crimson}08 0%,
            transparent 5%,
            transparent 95%,
            ${COLORS.flora}08 100%
          )`,
            animation: "colorBleed 4s ease-in-out infinite",
          }} />

          {/* VHS Tape Noise Bands */}
          <div style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 200px,
            rgba(255, 255, 255, 0.02) 200px,
            rgba(255, 255, 255, 0.02) 202px,
            transparent 202px,
            transparent 400px
          )`,
            animation: "tapeNoise 8s linear infinite",
          }} />

          {/* Corner Vignette */}
          <div style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
            background: `radial-gradient(
            ellipse at center,
            transparent 40%,
            rgba(0, 0, 0, 0.3) 100%
          )`,
          }} />
        </>
      )}

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Crimson+Text:ital@0;1&display=swap" rel="stylesheet" />

      {/* Global Styles */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        @keyframes morseBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          50% { transform: translateY(-120px) translateX(40px); opacity: 0.8; }
          90% { opacity: 0.2; }
        }
        @keyframes gridShift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes floraBlob {
          0%, 100% { transform: scale(1) translate(0, 0); }
          33% { transform: scale(1.2) translate(10px, -10px); }
          66% { transform: scale(0.9) translate(-5px, 5px); }
        }
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
        @keyframes flicker {
          0% { opacity: 0.27861; }
          5% { opacity: 0.34769; }
          10% { opacity: 0.23604; }
          15% { opacity: 0.90626; }
          20% { opacity: 0.18128; }
          25% { opacity: 0.83891; }
          30% { opacity: 0.65583; }
          35% { opacity: 0.67807; }
          40% { opacity: 0.26559; }
          45% { opacity: 0.84693; }
          50% { opacity: 0.96019; }
          55% { opacity: 0.08594; }
          60% { opacity: 0.20313; }
          65% { opacity: 0.71988; }
          70% { opacity: 0.53455; }
          75% { opacity: 0.37288; }
          80% { opacity: 0.71428; }
          85% { opacity: 0.70419; }
          90% { opacity: 0.7003; }
          95% { opacity: 0.36108; }
          100% { opacity: 0.24387; }
        }
        @keyframes redPulse {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes glitchSlide {
          0% { transform: translateX(0); }
          33% { transform: translateX(10px); }
          66% { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }
        @keyframes grain1 {
          0% { background-position: 0% 0%; }
          33% { background-position: 47% 23%; }
          66% { background-position: 12% 89%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes grain2 {
          0% { background-position: 0% 0%; }
          25% { background-position: 67% 41%; }
          50% { background-position: 21% 73%; }
          75% { background-position: 84% 15%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes trackingSlide {
          0% { transform: translateY(0); opacity: 0.8; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes colorBleed {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes tapeNoise {
          0% { transform: translateY(0); }
          100% { transform: translateY(400px); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.ash}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${COLORS.crimson}40; }

        ::selection {
          background: ${COLORS.crimson}40;
          color: ${COLORS.bone};
        }

        @media (max-width: 900px) {
          nav > div > div:last-child > a { display: none !important; }
          
          /* Responsive fixes for the grid */
          .bento-grid {
             grid-template-columns: repeat(2, 1fr) !important;
             grid-template-rows: auto !important;
          }
          .col-span-2, .col-span-3 { grid-column: span 2 / span 2; }
        }

        /* Mosaic Grid Spans */
        .col-span-1 { grid-column: span 1 / span 1; }
        .col-span-2 { grid-column: span 2 / span 2; }
        .col-span-3 { grid-column: span 3 / span 3; }
        .row-span-1 { grid-row: span 1 / span 1; }
        .row-span-2 { grid-row: span 2 / span 2; }
      `}</style>

      <Nav scrollY={scrollY} />
      <SplitHero scrollY={scrollY} />

      <EmergencyTicker messages={[
        "EMERGENCY BROADCAST",
        "PARK EVACUATION IN PROGRESS",
        "AVOID SECTOR 4",
        "BIOLUMINESCENT HAZARD DETECTED",
        "EMBER ACTIVITY CRITICAL",
        "[REDACTED] SIGHTINGS CONFIRMED",
        "REMAIN INDOORS",
        "AWAIT FURTHER INSTRUCTIONS",
        "SOS",
      ]} />

      <BentoGrid />
      <CTATerminal />
      <Footer />
    </div>
  );
}