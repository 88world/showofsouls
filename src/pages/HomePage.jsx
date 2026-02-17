import { useState, useEffect, useRef } from "react";
import { COLORS } from '../utils/constants';
import { EmergencyTicker } from '../components/layout/EmergencyTicker';
import { PasswordTerminal, getPasswordHints } from '../features/puzzles/types/PasswordTerminal/PasswordTerminal';
import { MemoryGame } from '../features/puzzles/types/MemoryGame/MemoryGame';
import { useGlobalEvent } from '../features/events/GlobalEventProvider';

// ═══════════════════════════════════════════════════════════════
// UTILITY: LOCAL CRT EFFECT OVERLAY
// Applies scanlines and noise only to its container
// ═══════════════════════════════════════════════════════════════
const LocalCRTOverlay = () => (
  <>
    {/* Scanlines */}
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, opacity: 0.4,
      background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)`,
      mixBlendMode: "overlay",
    }} />
    {/* Vignette & Noise tint */}
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, opacity: 0.2,
      background: `radial-gradient(circle at center, transparent 50%, ${COLORS.bg} 100%), linear-gradient(to bottom, transparent, ${COLORS.crimson}10)`,
      mixBlendMode: "multiply",
    }} />
  </>
);

const GlitchText = ({ children, className = "" }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150 + Math.random() * 200);
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className={className} style={{ position: "relative", display: "inline-block", fontFamily: "'Space Mono', monospace" }}>
      <span style={{ position: "relative", zIndex: 2 }}>{children}</span>
      {glitch && (
        <>
          <span style={{
            position: "absolute", top: "-2px", left: "2px", zIndex: 1,
            color: COLORS.flora, opacity: 0.8, clipPath: "inset(0 0 40% 0)",
            transform: "translateX(-2px)", filter: "blur(1px)"
          }}>{children}</span>
          <span style={{
            position: "absolute", top: "2px", left: "-3px", zIndex: 1,
            color: COLORS.crimson, opacity: 0.8, clipPath: "inset(40% 0 0 0)",
            transform: "translateX(2px)", filter: "blur(1px)"
          }}>{children}</span>
        </>
      )}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// EVENT COOLDOWN BOX
// Shows countdown to next global event or active event status
// ═══════════════════════════════════════════════════════════════

const EventCooldownBox = () => {
  const { currentEvent, getTimeRemaining, getCompletedCount, getTotalPuzzles } = useGlobalEvent();
  const [time, setTime] = useState(null);

  useEffect(() => {
    const tick = () => setTime(getTimeRemaining());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [getTimeRemaining]);

  const hasEvent = currentEvent && time && !time.expired;
  const completed = getCompletedCount();
  const total = getTotalPuzzles();

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div style={{
      position: "absolute", bottom: 60, right: 50, zIndex: 10,
      padding: "20px", background: "rgba(10, 5, 5, 0.9)",
      border: `1px solid ${hasEvent ? COLORS.flora : COLORS.crimson}`,
      boxShadow: `0 0 20px ${hasEvent ? COLORS.flora : COLORS.crimson}15`,
      fontFamily: "'Space Mono', monospace", minWidth: 280,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, color: hasEvent ? COLORS.flora : COLORS.crimson }}>
        <div style={{ width: 8, height: 8, background: hasEvent ? COLORS.flora : COLORS.crimson, borderRadius: '50%', animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: 14, letterSpacing: 1, fontWeight: "bold" }}>
          {hasEvent ? 'GLOBAL EVENT ACTIVE' : 'NEXT EVENT'}
        </span>
      </div>

      {hasEvent ? (
        <>
          <div style={{ fontSize: 13, letterSpacing: 1, marginBottom: 8, color: COLORS.bone }}>
            <span style={{ opacity: 0.5 }}>TIME LEFT:</span>{' '}
            <span style={{ color: COLORS.flora, fontWeight: 'bold' }}>
              {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
            </span>
          </div>
          <div style={{ fontSize: 13, letterSpacing: 1, color: COLORS.bone }}>
            <span style={{ opacity: 0.5 }}>PROGRESS:</span>{' '}
            <span style={{ color: completed >= total ? COLORS.flora : COLORS.bone }}>
              {completed}/{total} PUZZLES
            </span>
          </div>
          {/* Mini progress bar */}
          <div style={{ marginTop: 10, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(completed / total) * 100}%`,
              background: completed >= total ? COLORS.flora : COLORS.crimson,
              transition: 'width 0.6s ease',
              boxShadow: `0 0 6px ${completed >= total ? COLORS.flora : COLORS.crimson}`,
            }} />
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, letterSpacing: 1, marginBottom: 8, color: COLORS.bone }}>
            <span style={{ opacity: 0.5 }}>STATUS:</span>{' '}
            <GlitchText>AWAITING SIGNAL...</GlitchText>
          </div>
          <div style={{ fontSize: 13, letterSpacing: 1, color: COLORS.bone, opacity: 0.5 }}>
            STANDBY FOR BROADCAST
          </div>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CINEMATIC HERO SECTION - MASCOT PARK THEME
// ═══════════════════════════════════════════════════════════════

const SplitHero = ({ scrollY }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulate old equipment warming up
    setTimeout(() => setLoaded(true), 500);
  }, []);

  return (
    <section style={{
      position: "relative",
      height: "100vh",
      minHeight: 750,
      overflow: "hidden",
      background: COLORS.bg,
      borderBottom: `2px solid ${COLORS.crimson}`,
    }}>
      {/* Gritty Background Aesthetic */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at 50% 30%, ${COLORS.crimson}05, transparent 50%),
          radial-gradient(circle at 80% 80%, ${COLORS.flora}05, transparent 40%),
          linear-gradient(180deg, ${COLORS.bg} 0%, #080a09 100%)
        `,
        filter: "contrast(120%) brightness(80%)",
      }} />
       <div style={{
          position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
          backgroundImage: `url('https://www.transparenttextures.com/patterns/noisy-net.png')`, // Subtle noise texture
       }} />


      {/* Top Left Cam Info */}
      <div style={{
        position: "absolute", top: 32, left: 40, zIndex: 10,
        display: "flex", alignItems: "center", gap: 16,
        fontFamily: "'Space Mono', monospace", color: COLORS.crimson,
      }}>
        <div style={{ fontSize: 14, letterSpacing: 2, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ animation: "blink 1s steps(1) infinite" }}>● REC</span>
          <span style={{ color: COLORS.bone, opacity: 0.7 }}>[TAPE 1947-B]</span>
        </div>
      </div>

      {/* Bottom Right - Event Cooldown Timer */}
      <EventCooldownBox />

      {/* Main Content */}
      <div style={{
        position: "relative", zIndex: 10, height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "0 40px", textAlign: "center",
      }}>
        <div style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "scale(1)" : "scale(1.1)",
          filter: loaded ? "blur(0px)" : "blur(10px)",
          transition: "all 1.5s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(70px, 14vw, 180px)",
            letterSpacing: "0.1em",
            lineHeight: 0.9,
            color: COLORS.bone,
            margin: 0,
            textShadow: `4px 4px 0 ${COLORS.crimson}40, -4px -4px 0 ${COLORS.flora}20`,
            position: "relative",
          }}>
            SHOW OF SOULS
          </h1>
        </div>

        <div style={{
          opacity: loaded ? 0.8 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s ease 0.5s",
          fontFamily: "'Space Mono', monospace",
          fontSize: "clamp(12px, 2vw, 16px)",
          letterSpacing: 3,
          color: COLORS.crimson,
          marginTop: 32,
          textTransform: "uppercase",
        }}>
          <GlitchText>The Park Is Open Forever.</GlitchText>
        </div>

        <div style={{
          marginTop: 80,
          opacity: loaded ? 1 : 0,
          transition: "all 1s ease 0.8s",
        }}>
          <button style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 24,
            letterSpacing: 4,
            padding: "18px 48px",
            border: `2px solid ${COLORS.bone}`,
            background: "transparent",
            color: COLORS.bone,
            cursor: "pointer",
            transition: "all 0.2s ease",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = COLORS.bone;
            e.currentTarget.style.color = COLORS.bg;
            e.currentTarget.style.borderColor = COLORS.bone;
            e.currentTarget.style.boxShadow = `0 0 30px ${COLORS.bone}40`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = COLORS.bone;
            e.currentTarget.style.borderColor = COLORS.bone;
            e.currentTarget.style.boxShadow = "none";
          }}>
            ENTER THE PARK
          </button>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// BENTO GRID - INCIDENT LOG: FLORA'S PARK
// ═══════════════════════════════════════════════════════════════

const BentoGrid = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const ref = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showMemoryGame, setShowMemoryGame] = useState(false);
  const [revealedHints, setRevealedHints] = useState({});
  const { markPuzzleComplete, getCompletedCount, getTotalPuzzles } = useGlobalEvent();

  // Password hints hidden in grid tiles
  const passwordHints = getPasswordHints();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Updated Mosaic Items for Mascot Horror Theme using mood-appropriate Unsplash images
  const mosaicItems = [
    { id: 1, title: "SUBJECT: FLORA", subtitle: "ANIMATRONIC MALFUNCTION", image: "https://images.unsplash.com/photo-1597847323857-86379a330887?w=800&h=800&fit=crop&q=80", span: "col-span-2 row-span-2", timestamp: "CAM 01" }, // Creepy doll/face
    { id: 2, title: "THE WHEEL", subtitle: "STRUCTURAL FAILURE", image: "https://images.unsplash.com/photo-1612675310808-c5b156334227?w=600&h=600&fit=crop&q=80", span: "col-span-1 row-span-1", timestamp: "CAM 03" }, // Rusted ride
    { id: 3, title: "COSTUME STORAGE", subtitle: "MULTIPLE SUITS MISSING", image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&h=800&fit=crop&q=80", span: "col-span-2 row-span-2", timestamp: "CAM 09" }, // Dark creepy hallway/room
    { id: 4, title: "BLUEPRINT REDACTION", subtitle: "UNDERGROUND LABYRINTH", image: "https://images.unsplash.com/photo-1635241161466-541f065683ba?w=600&h=600&fit=crop&q=80", span: "col-span-1 row-span-1", timestamp: "DOC #4B" }, // Abstract/tech
    { id: 5, title: "CAROUSEL", subtitle: "UNAUTHORIZED MOVEMENT", image: "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?w=600&h=600&fit=crop&q=80", span: "col-span-1 row-span-1", timestamp: "CAM 04" }, // Dark carousel
    { id: 6, title: "MAIN GATE", subtitle: "LOCKED FROM INSIDE", image: "https://images.unsplash.com/photo-1464059727076-3f5321828172?w=600&h=600&fit=crop&q=80", span: "col-span-1 row-span-1", timestamp: "CAM 01" }, // Rusted gate/fence
    { id: 7, title: "THE 'GRAND RE-OPENING'", subtitle: "CORRUPTED FOOTAGE", image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=1000&h=600&fit=crop&q=80", span: "col-span-3 row-span-1", timestamp: "TAPE B-SIDE" }, // Distorted/glitchy
    { id: 8, title: "STAFF AREA", subtitle: "EVIDENCE #1947-A", image: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=800&h=600&fit=crop&q=80", span: "col-span-2 row-span-1", timestamp: "PHOTO LOG" }, // Grimy/dirty texture
    { id: 9, title: "SIGNAL LOST", subtitle: "END OF TAPE", image: "https://images.unsplash.com/photo-1592312369181-4a02760b38b2?w=600&h=600&fit=crop&q=80", span: "col-span-1 row-span-1", timestamp: "---" } // Static/noise
  ];

  return (
    <>
      <PasswordTerminal isOpen={showPassword} onClose={() => setShowPassword(false)} onSuccess={() => { markPuzzleComplete('passwordTerminal'); setShowPassword(false); }} />
      <MemoryGame isOpen={showMemoryGame} onClose={() => setShowMemoryGame(false)} onSuccess={() => { markPuzzleComplete('memoryGame'); setShowMemoryGame(false); }} />

      <section ref={ref} style={{ padding: "120px 40px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.ash}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 60, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease 0.2s", textAlign: "left" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, letterSpacing: 3, color: COLORS.crimson, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ animation: "blink 1s infinite" }}>█</span> CLASSIFIED PARK RECORDS
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(42px, 5vw, 64px)", letterSpacing: 6, color: COLORS.bone, margin: 0, textShadow: `2px 2px 0 ${COLORS.crimson}40` }}>
              INCIDENT LOG: FLORA'S PARK
            </h2>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: COLORS.ash, marginTop: 16, maxWidth: 600, lineHeight: 1.8, borderLeft: `2px solid ${COLORS.crimson}`, paddingLeft: 16 }}>
              Recovered footage from the 1947 "Grand Re-opening" disaster. The mascots were supposed to bring joy. They brought only silence.
            </p>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gridTemplateRows: "repeat(3, 220px)", gap: 16,
            opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease 0.4s",
          }}>
            {mosaicItems.map((item, i) => (
              <div key={item.id} className={item.span}
                onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  // Click triggers for clues/puzzles
                  if (item.id === 3) setShowPassword(true);
                  // Tiles with password hints
                  const hint = passwordHints.find(h => h.tileId === item.id);
                  if (hint) {
                    setRevealedHints(prev => ({ ...prev, [item.id]: true }));
                  }
                }}
                style={{
                  position: "relative", overflow: "hidden", cursor: "pointer", background: "#000",
                  border: `2px solid ${hoveredIndex === i ? COLORS.crimson : COLORS.ash}`, transition: "all 0.3s ease",
                }}>
                {/* Local CRT Effect Applied to Image */}
                <LocalCRTOverlay />

                {/* Image */}
                <div style={{
                  position: "absolute", inset: 0, backgroundImage: `url('${item.image}')`, backgroundSize: "cover", backgroundPosition: "center",
                  filter: `grayscale(100%) contrast(120%) brightness(${hoveredIndex === i ? 0.5 : 0.3}) sepia(${hoveredIndex === i ? 20 : 0}%)`,
                  transition: "all 0.4s ease", transform: hoveredIndex === i ? "scale(1.02)" : "scale(1)", zIndex: 1
                }} />

                {/* Timestamp Label */}
                <div style={{
                  position: "absolute", top: 0, right: 0, fontFamily: "'Space Mono', monospace", fontSize: 11, zIndex: 5,
                  letterSpacing: 1, color: COLORS.bg, background: COLORS.crimson, padding: "4px 8px", fontWeight: "bold"
                }}>
                  {item.timestamp}
                </div>

                {/* Content Info */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px", zIndex: 5, background: "linear-gradient(to top, #000 0%, transparent 100%)" }}>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: hoveredIndex === i ? COLORS.crimson : COLORS.bone, margin: "0 0 4px 0", transition: "color 0.3s" }}>
                    <GlitchText>{item.title}</GlitchText>
                  </h3>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 1, color: COLORS.bone, opacity: 0.7, margin: 0, textTransform: "uppercase" }}>
                    {item.subtitle}
                  </p>
                </div>

                {/* Password Hint Overlay */}
                {(() => {
                  const hint = passwordHints.find(h => h.tileId === item.id);
                  if (!hint || !revealedHints[item.id]) return null;
                  return (
                    <div style={{
                      position: "absolute", top: 8, left: 8, zIndex: 10,
                      background: `${COLORS.bg}ee`, border: `1px solid ${COLORS.gold}`,
                      padding: "6px 12px", animation: "fadeIn 0.4s ease",
                    }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1.5,
                        color: COLORS.gold, textTransform: "uppercase",
                      }}>
                        ⚿ {hint.hint}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>


        </div>
      </section>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// CTA TERMINAL - FINAL TRANSMISSION
// ═══════════════════════════════════════════════════════════════

const CTATerminal = () => {
  const [visible, setVisible] = useState(false);
  const [typed, setTyped] = useState("");
  const ref = useRef(null);
  const fullText = "DON'T LET THEM LEAVE THE PARK. HELP US.";

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
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
    }, 80);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <section ref={ref} style={{ padding: "120px 40px 80px", background: COLORS.bg }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: 8, color: COLORS.bone,
          margin: "0 0 48px", textAlign: "center", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.2s", textShadow: `2px 2px 0 ${COLORS.crimson}40`
        }}>
          FINAL TRANSMISSION
        </h2>

        <div style={{
          background: "#0a0505", border: `2px solid ${COLORS.ash}`, position: "relative", overflow: "hidden",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease 0.4s",
          boxShadow: `0 10px 40px rgba(0,0,0,0.8)`
        }}>
          <LocalCRTOverlay />
          <div style={{ position: "relative", zIndex: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `2px solid ${COLORS.ash}`, background: COLORS.bg }}>
                <div style={{ width: 8, height: 8, background: COLORS.crimson, borderRadius: "50%", animation: "pulse 1s infinite" }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 2, color: COLORS.ash }}>
                EMERGENCY_BROADCAST_SYSTEM
                </span>
            </div>

            <div style={{ padding: 40, textAlign: "left" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: COLORS.crimson, opacity: 0.8, letterSpacing: 1, marginBottom: 24 }}>
                {'>'} SIGNAL SOURCE: PARK SECURITY BOOTH<br />
                {'>'} MESSAGE STATUS: URGENT<br />
                {'>'} ...<br />
                </div>

                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px, 3vw, 42px)", letterSpacing: 3, color: COLORS.bone, margin: "24px 0", minHeight: "2em", textShadow: `0 0 15px ${COLORS.crimson}60` }}>
                {typed}<span style={{ animation: "blink 0.5s step-end infinite", color: COLORS.crimson, marginLeft: 4 }}>█</span>
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 40 }}>
                {[
                    { label: "WISHLIST ON STEAM", icon: "→" },
                    { label: "JOIN THE DISCORD", icon: "→" },
                    { label: "WATCH TRAILER", icon: "►" }
                ].map((btn, i) => (
                    <button key={btn.label} style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, padding: "18px 24px",
                    background: "transparent", border: `2px solid ${COLORS.ash}`, color: COLORS.ash, cursor: "pointer", transition: "all 0.3s",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                    onMouseEnter={e => {
                    e.currentTarget.style.borderColor = COLORS.crimson;
                    e.currentTarget.style.color = COLORS.bg;
                    e.currentTarget.style.background = COLORS.crimson;
                    }}
                    onMouseLeave={e => {
                    e.currentTarget.style.borderColor = COLORS.ash;
                    e.currentTarget.style.color = COLORS.ash;
                    e.currentTarget.style.background = "transparent";
                    }}>
                    <span>{btn.label}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace" }}>{btn.icon}</span>
                    </button>
                ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN HOMEPAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ background: COLORS.bg, color: COLORS.bone, minHeight: "100vh", overflowX: "hidden" }}>
      <SplitHero scrollY={scrollY} />

      <EmergencyTicker messages={[
        "DO NOT APPROACH THE MASCOTS",
        "PARK IS CLOSED INDEFINITELY",
        "COSTUME DEPARTMENT LOCKDOWN",
        "REPORT ANY 'FLORA' SIGHTINGS",
        "THEY ARE NOT IN SUITS",
        "EMERGENCY EVACUATION FAILED",
        "SOS",
      ]} />

      <BentoGrid />

      <CTATerminal />
    </div>
  );
}