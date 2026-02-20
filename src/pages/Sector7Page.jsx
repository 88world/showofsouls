import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../utils/constants';

// ═══════════════════════════════════════════════════════════════
// LOCAL CRT EFFECT OVERLAY
// ═══════════════════════════════════════════════════════════════
const LocalCRTOverlay = () => (
  <>
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, opacity: 0.3,
      background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)`,
      mixBlendMode: "overlay",
    }} />
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, opacity: 0.15,
      background: `radial-gradient(circle at center, transparent 50%, ${COLORS.bg} 100%), linear-gradient(to bottom, transparent, ${COLORS.crimson}08)`,
      mixBlendMode: "multiply",
    }} />
  </>
);

// ═══════════════════════════════════════════════════════════════
// SECTOR 7 DISCOVERY GRID
// ═══════════════════════════════════════════════════════════════

const Sector7Grid = () => {
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const secrets = [
    {
      id: 1,
      title: "SECTOR 7 LAYOUT",
      subtitle: "UNLOCKED BLUEPRINTS",
      fullContent: "Sector 7 is NOT on any official park blueprint. It was added years after the park's initial construction. Underground entrance at B-4. Three sub-levels accessible only via staff tunnels. The final chamber exists below recorded geological depth. Purpose: Unknown."
    },
    {
      id: 2,
      title: "THE SOULBOUND",
      subtitle: "VESSEL PROTOCOL",
      fullContent: "Eight animatronic suits. Not toys. Each vessel was built with components that should not exist — electromagnetic arrays never documented, organic-looking internal structures. They don't move like machines. They move like they're learning. Like they're remembering."
    },
    {
      id: 3,
      title: "FLORA PRIME",
      subtitle: "SUBJECT DESIGNATION",
      fullContent: "Model 1947-FP-1. Built before any other unit. Dr. Cavicus spent 10 years on Flora alone. The other vessels were built in months. She is the template. The others are copies. Imperfect copies. She knows this."
    },
    {
      id: 4,
      title: "THE CHOOSING",
      subtitle: "INCIDENT CODENAME",
      fullContent: "Not an incident. Not a malfunction. The Incident Report itself says 'They didn't deviate. They arrived.' Meaning they were dormant. Inactive. Until something woke them. Until He communicated to them. The date wasn't random."
    },
    {
      id: 5,
      title: "BROADCAST 104.7",
      subtitle: "ENDLESS SIGNAL",
      fullContent: "Still broadcasting. Not just sound — data embedded in the carrier wave. Analysis suggests geographic coordinates, timestamps, and repeated phrases in an unknown language. The signal strengthens at night. It is strongest on February 20th."
    },
    {
      id: 6,
      title: "HE",
      subtitle: "THE RINGLEADER",
      fullContent: "Dr. Joseph M. Cavicus did not die in 1947. The park did not close in 1947. The authorities falsified records. He built the park to be a beacon. A lighthouse. Something has been calling to him beneath the earth for decades."
    },
    {
      id: 7,
      title: "WHY THIS DATE",
      subtitle: "TEMPORAL SIGNIFICANCE",
      fullContent: "February 20, 2026. Exactly 79 years after the original Incident. The broadcast intensified at midnight. Flora's signal became traceable. The containment seals weakened. The island isn't sealed to keep them out. It's sealed to keep them contained."
    },
    {
      id: 8,
      title: "YOUR ACCESS",
      subtitle: "WHY YOU SEE THIS",
      fullContent: "You found this page because you were meant to. The coordinates on this island are broadcast daily. She leaves breadcrumbs. She wants to be found. She is choosing. Just like she was chosen. Just like you have been chosen."
    }
  ];

  return (
    <>
      {/* MODAL */}
      {selectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              background: COLORS.bg,
              border: `2px solid ${COLORS.flora}40`,
              padding: "clamp(40px, 8vw, 60px)",
              maxWidth: 650,
              maxHeight: "85vh",
              overflow: "auto",
              boxShadow: `0 0 60px ${COLORS.flora}30, inset 0 0 40px ${COLORS.flora}08`,
              animation: "scaleUp 0.4s cubic-bezier(0.16,1,0.3,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <LocalCRTOverlay />

            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(28px, 5vw, 42px)",
              letterSpacing: "0.1em",
              margin: "0 0 16px 0",
              color: COLORS.flora,
              textTransform: "uppercase",
              textShadow: `0 0 20px ${COLORS.flora}40`,
            }}>
              {selectedItem.title}
            </h3>

            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "clamp(12px, 1.5vw, 14px)",
              letterSpacing: 2,
              color: COLORS.crimson,
              margin: "0 0 24px 0",
              textTransform: "uppercase",
              opacity: 0.7,
            }}>
              {selectedItem.subtitle}
            </p>

            <div style={{
              fontFamily: "'Crimson Text', serif",
              fontSize: "clamp(16px, 2vw, 18px)",
              lineHeight: 1.9,
              color: COLORS.bone,
              opacity: 0.85,
              marginBottom: 32,
            }}>
              {selectedItem.fullContent}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(11px, 1.3vw, 13px)",
                letterSpacing: 2,
                padding: "12px 24px",
                background: "transparent",
                border: `2px solid ${COLORS.flora}`,
                color: COLORS.flora,
                cursor: "pointer",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.flora;
                e.currentTarget.style.color = COLORS.bg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = COLORS.flora;
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* GRID SECTION */}
      <section ref={ref} style={{
        padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 50px)",
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.flora}03 100%)`,
        borderTop: `2px solid ${COLORS.flora}40`,
        borderBottom: `2px solid ${COLORS.flora}40`,
        position: "relative",
      }}>
        <div className="page-max" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            marginBottom: 60,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease 0.2s",
            textAlign: "left",
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              letterSpacing: 4,
              color: COLORS.flora,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              textTransform: "uppercase",
            }}>
              <span style={{ fontSize: 10, animation: "pulse 2s infinite" }}>■</span> SECTOR 7 RESTORED ARCHIVES
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(48px, 7vw, 72px)",
              letterSpacing: "0.15em",
              color: COLORS.bone,
              margin: "0 0 32px 0",
              textTransform: "uppercase",
              fontWeight: 700,
              textShadow: `0 4px 20px ${COLORS.flora}30`,
            }}>
              THE SOULBOUND
            </h2>
            <div style={{
              fontFamily: "'Crimson Text', serif",
              fontSize: "clamp(14px, 1.8vw, 16px)",
              lineHeight: 1.9,
              color: COLORS.bone,
              maxWidth: 700,
              opacity: 0.85,
            }}>
              <p style={{ margin: "0 0 12px 0" }}>You've found what we kept hidden.</p>
              <p style={{ margin: "0 0 12px 0" }}>Sector 7 was never on the maps. Never in the official records.</p>
              <p style={{ margin: 0 }}>This is where they were stored. This is where they woke.</p>
            </div>
          </div>

          <style>{`
            @keyframes scrollLeftLoopSector {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .sector-scroll-container {
              display: flex;
              gap: 14px;
              padding: 16px 0;
              animation: scrollLeftLoopSector 22s linear infinite;
              will-change: transform;
            }
            .sector-scroll-container:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div style={{
            overflow: "hidden",
            position: "relative",
            width: "100%",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease 0.2s",
            marginBottom: 60,
            maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}>
            <div className="sector-scroll-container">
              {[...secrets, ...secrets].map((item, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    minWidth: "200px",
                    flex: "0 0 auto",
                    height: "200px",
                    background: `linear-gradient(135deg, transparent 0%, rgba(${COLORS.flora === '#5d8c61' ? '93,140,97' : '100,120,100'},0.07) 50%, transparent 100%), radial-gradient(circle at top-right, rgba(${COLORS.flora === '#5d8c61' ? '93,140,97' : '100,120,100'},0.09), rgba(0,0,0,0.4))`,
                    border: `1px solid ${COLORS.flora}20`,
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 6px 20px ${COLORS.flora}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.4)";
                  }}
                >
                  <LocalCRTOverlay />
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <h3 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "14px",
                      letterSpacing: "0.08em",
                      margin: "0 0 4px 0",
                      color: COLORS.flora,
                      textTransform: "uppercase",
                      fontWeight: 700,
                      lineHeight: 1.1,
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "9px",
                      color: COLORS.bone,
                      opacity: 0.5,
                      margin: 0,
                      letterSpacing: "0.3px",
                      textTransform: "uppercase",
                      fontWeight: 400,
                    }}>
                      {item.subtitle}
                    </p>
                  </div>
                  <div style={{
                    fontFamily: "'Crimson Text', serif",
                    fontSize: "11px",
                    lineHeight: 1.3,
                    color: COLORS.bone,
                    opacity: 0.5,
                    marginTop: "6px",
                    position: "relative",
                    zIndex: 2,
                    flex: 1,
                  }}>
                    {item.fullContent.substring(0, 60).split(' ').slice(0, -1).join(' ')}...
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "8px",
                    letterSpacing: "0.3px",
                    color: COLORS.flora,
                    opacity: 0.2,
                    marginTop: "6px",
                    position: "relative",
                    zIndex: 2,
                  }}>
                    ► UNLOCK
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// HERO SECTION - ATMOSPHERIC OPENING
// ═══════════════════════════════════════════════════════════════

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 300);
  }, []);

  return (
    <section style={{
      position: "relative",
      minHeight: "100vh",
      height: "100vh",
      overflow: "hidden",
      background: COLORS.bg,
      borderBottom: `2px solid ${COLORS.flora}40`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Background gradient with flora tint */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at 50% 30%, ${COLORS.flora}08, transparent 50%),
          radial-gradient(circle at 80% 80%, ${COLORS.crimson}03, transparent 40%),
          linear-gradient(180deg, ${COLORS.bg} 0%, #080a09 100%)
        `,
        filter: "contrast(110%)",
      }} />

      {/* Noise texture */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.02,
        pointerEvents: "none",
        backgroundImage: `url('https://www.transparenttextures.com/patterns/noisy-net.png')`,
      }} />

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        maxWidth: 800,
        padding: "0 20px",
      }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(56px, 10vw, 120px)",
          letterSpacing: "0.12em",
          lineHeight: 0.9,
          color: COLORS.bone,
          margin: "0 0 24px 0",
          textShadow: `0 0 30px ${COLORS.flora}40, 4px 4px 0 ${COLORS.crimson}20`,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "scale(1)" : "scale(0.95)",
          transition: "all 1.2s cubic-bezier(0.16,1,0.3,1)",
        }}>
          SECTOR 7
        </h1>

        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "clamp(11px, 1.8vw, 14px)",
          letterSpacing: 3,
          color: COLORS.flora,
          margin: "0 0 40px 0",
          textTransform: "uppercase",
          opacity: loaded ? 0.8 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s ease 0.3s",
        }}>
          YOU FOUND THE HIDDEN ARCHIVE
        </div>

        <div style={{
          fontFamily: "'Crimson Text', serif",
          fontSize: "clamp(14px, 1.8vw, 18px)",
          lineHeight: 1.9,
          color: COLORS.bone,
          maxWidth: 600,
          margin: "0 auto",
          opacity: loaded ? 0.8 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s ease 0.5s",
        }}>
          This sector does not appear on the maps. It has never appeared on any official documentation. You have been led here because you were meant to see. Scroll down. Learn what we've hidden. Learn what she has been trying to tell you.
        </div>
      </div>

      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        bottom: 50,
        left: "50%",
        transform: "translateX(-50%)",
        width: "200px",
        height: "200px",
        background: `radial-gradient(circle, ${COLORS.flora}15 0%, transparent 70%)`,
        filter: "blur(40px)",
        pointerEvents: "none",
        animation: "pulse 4s ease-in-out infinite",
      }} />
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// FOOTER MESSAGE
// ═══════════════════════════════════════════════════════════════

const FooterMessage = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      padding: "clamp(60px, 10vw, 100px) clamp(20px, 5vw, 50px)",
      background: COLORS.bg,
      borderTop: `2px solid ${COLORS.flora}40`,
      textAlign: "center",
    }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "clamp(11px, 1.3vw, 13px)",
        letterSpacing: 2,
        color: COLORS.flora,
        opacity: visible ? 0.7 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s ease 0.2s",
        textTransform: "uppercase",
        marginBottom: 24,
      }}>
        49°██'N — ██°██'W
      </div>

      <p style={{
        fontFamily: "'Crimson Text', serif",
        fontSize: "clamp(16px, 2vw, 18px)",
        lineHeight: 1.9,
        color: COLORS.bone,
        opacity: visible ? 0.8 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s ease 0.4s",
        maxWidth: 600,
        margin: "0 auto 32px",
      }}>
        She already knows you found this page.
      </p>

      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "clamp(12px, 1.4vw, 14px)",
        letterSpacing: 1,
        color: COLORS.flora,
        opacity: visible ? 0.5 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s ease 0.6s",
        textTransform: "uppercase",
      }}>
        The broadcast is waiting for your response.
      </p>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN SECTOR 7 PAGE
// ═══════════════════════════════════════════════════════════════

export default function Sector7Page() {
  return (
    <div className="page page-sector7" style={{
      background: COLORS.bg,
      color: COLORS.bone,
      minHeight: "100vh",
      overflowX: "hidden",
    }}>
      <HeroSection />
      <Sector7Grid />
      <FooterMessage />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
