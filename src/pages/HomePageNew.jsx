import { useState, useEffect, useRef } from "react";
import { COLORS } from '../utils/constants';
import { EmergencyTicker } from '../components/layout/EmergencyTicker';
import { FrequencyTuner } from '../features/puzzles/types/FrequencyTuner/FrequencyTuner';
import { GlitchTextWord } from '../components/common/GlitchTextWord';
import { useGlobalEvent } from '../features/events/GlobalEventProvider';

// ═══════════════════════════════════════════════════════════════
// UTILITY: LOCAL CRT EFFECT OVERLAY
// ═══════════════════════════════════════════════════════════════
const LocalCRTOverlay = () => (
  <>
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.2,
      background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)`,
      mixBlendMode: "overlay",
    }} />
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.1,
      background: `radial-gradient(circle at center, transparent 50%, ${COLORS.bg} 100%), linear-gradient(to bottom, transparent, ${COLORS.crimson}05)`,
      mixBlendMode: "multiply",
    }} />
  </>
);

// ═══════════════════════════════════════════════════════════════
// GLITCH TEXT COMPONENT
// ═══════════════════════════════════════════════════════════════
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
      fontFamily: "'Space Mono', monospace", minWidth: 220, maxWidth: "calc(100vw - 32px)",
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
              {time.days}d {pad(time.hours)}h {pad(time.minutes)}m {pad(time.seconds)}s
            </span>
          </div>
          <div style={{ fontSize: 12, letterSpacing: 0.5, marginBottom: 4, color: COLORS.bone, opacity: 0.7 }}>
            PROGRESS: <span style={{ color: COLORS.flora }}>{completed}/{total}</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, letterSpacing: 1, marginBottom: 8, color: COLORS.bone }}>
            <span style={{ opacity: 0.5 }}>COUNTDOWN:</span>{' '}
            <span style={{ color: COLORS.crimson, fontWeight: 'bold' }}>
              {time?.days}d {time && pad(time.hours)}h {time && pad(time.minutes)}m
            </span>
          </div>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SPLIT HERO SECTION
// ═══════════════════════════════════════════════════════════════
const SplitHero = ({ scrollY = 0, onActivatePuzzle }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      minHeight: "90vh", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
      background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.crimson}02 100%)`, position: "relative",
      overflow: "hidden"
    }}>
      {/* Left side text */}
      <div style={{
        padding: "clamp(60px, 10vw, 100px) clamp(40px, 5vw, 80px)", display: "flex", flexDirection: "column",
        justifyContent: "center", position: "relative", zIndex: 2
      }}>
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-50px)",
          transition: "all 0.8s ease 0.2s", textAlign: "left"
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: "clamp(11px, 1.4vw, 13px)", letterSpacing: 3,
            color: COLORS.flora, marginBottom: 24, textTransform: "uppercase"
          }}>
            ▪ WELCOME TO THE ARCHIVE
          </div>

          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 82px)", letterSpacing: "0.15em",
            margin: "0 0 24px 0", color: COLORS.bone, lineHeight: 1.1, fontWeight: 700,
            textShadow: `0 8px 32px ${COLORS.crimson}40`
          }}>
            FLORA'S LAST SHOW
          </h1>

          <p style={{
            fontFamily: "'Crimson Text', serif", fontSize: "clamp(16px, 2vw, 18px)", lineHeight: 1.8,
            color: COLORS.bone, marginBottom: 32, opacity: 0.8, maxWidth: 500
          }}>
            Seventy-nine years of darkness. One night of reckoning. The records they buried have resurfaced. This is everything they wanted hidden.
          </p>

          <button onClick={() => onActivatePuzzle('frequencyTuner')} style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 2, padding: "16px 32px",
            background: COLORS.crimson, border: "none", color: COLORS.bg, cursor: "pointer",
            transition: "all 0.3s ease", textTransform: "uppercase", fontWeight: 700
          }} onMouseEnter={e => e.target.style.background = COLORS.flora}
          onMouseLeave={e => e.target.style.background = COLORS.crimson}>
            TUNE IN
          </button>
        </div>
      </div>

      {/* Right side - decorative or image */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.crimson}20 0%, transparent 100%)`,
        position: "relative", overflow: "hidden", display: "flex", alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          opacity: visible ? 0.3 : 0, transform: visible ? "scale(1)" : "scale(0.8)",
          transition: "all 0.8s ease 0.4s", fontSize: "clamp(150px, 20vw, 300px)",
          color: COLORS.crimson, fontFamily: "'Space Mono', monospace", fontWeight: "bold",
          textAlign: "center"
        }}>
          104.7
        </div>
      </div>

      <EventCooldownBox />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95) rotateX(10deg); opacity: 0; } to { transform: scale(1) rotateX(0); opacity: 1; } }
      `}</style>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// CARD GRID SECTION - WHAT THEY BURIED
// ═══════════════════════════════════════════════════════════════
const BentoGrid = () => {
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const gridItems = [
    { id: 1, title: "SECTOR 7", subtitle: "NIGHT OF THE INCIDENT", fullContent: "This is not malfunction footage. This is the moment of Choosing. Security systems failed at 02:47 AM. All exits sealed from the inside. Multiple entities confirmed in containment. What the cameras captured shows movement that defies physics. No current draw to motors. No mechanical cause. They simply were not there, and then they were. The footage loops. Sometimes we watch it backward. It plays exactly the same either way." },
    { id: 2, title: "THE CAROUSEL", subtitle: "UNAUTHORIZED MOVEMENT", fullContent: "No power to the grid. It turned anyway. It has not stopped. Rotating for 78 days straight without interruption. Staff reports a low humming sound that changes pitch based on the time of day. Costume retrieval was attempted once. The member who approached it reported feeling watched by something that exists in the space between rotations. The carousel faces inward now. Whatever it's watching, it's not the park." },
    { id: 3, title: "TUNNEL NETWORK B", subtitle: "UNDERGROUND ACCESS", fullContent: "They built more beneath the park than above it. Far more. Four sub-levels discovered by surveyors. Blueprints do not match any documents filed with the city. The geometric relationships are impossible. On paper, the tunnels overlap themselves. The Order has mapped the first level. The others remain uncharted. Breathing becomes difficult the deeper you go. We believe the air itself is different down there." },
    { id: 4, title: "COSTUME ARCHIVE", subtitle: "VESSEL STORAGE", fullContent: "The suits were never empty. He made sure of that long before they were inhabited. Eight suits in total. Each one unique. Each one bears physical marks of someone choosing not to be human anymore. Recovery attempts have been unsuccessful. The suits are gone, but artifacts remain. Photographs show they were arranged in a circle, facing inward. What were they witnessing? What was in the center?" },
    { id: 5, title: "GATE 3", subtitle: "FINAL SIGHTING", fullContent: "She walked through at 04:12 AM. She did not walk back. The gate seals from inside and outside simultaneously. Witnesses report seeing her ascending—not climbing, but rising—through the gate structure itself. No evidence of physical passage. The flowers that grew around Gate 3 afterward bloom only in November, regardless of season. They have never missed a year since 2026." },
    { id: 6, title: "THE GRAND OPENING", subtitle: "CORRUPTED FOOTAGE", fullContent: "Supposed to be celebration footage from 1994. The ribbon cutting. Cavicus himself presiding. But the timestamp is wrong. At 00:47 AM on opening day, something changes. The footage quality shifts. The audio becomes distorted. For 3 seconds, something occupies space that the camera cannot properly process. It leaves artifacts. Temporal investigators have suggested the footage may have been recorded twice at different times. Or once across two different times." },
    { id: 7, title: "STAFF AREA", subtitle: "SUBLEVEL EVIDENCE", fullContent: "What the staff witnessed that night was not in any training protocol. Six staff members unaccounted for. The audio logs recovered show increasing agitation. By the final transmission, their voices are unrecognizable. The last words ever recorded from that station: 'They're beautiful. They're inside. And we are so grateful.' The tape ends. Security footage shows all six walking peacefully toward the lower tunnels." },
    { id: 8, title: "SIGNAL LOG", subtitle: "104.7 MHz BROADCAST", fullContent: "Broadcasting since the night of the Incident. Continuous for five years. It has never gone silent. Analysis shows non-standard modulation. Embedded frequency at 7.83 Hz—Earth's Schumann resonance. Listening for extended periods causes temporal disorientation in test subjects. Three Order members experienced permanent changes in sleep cycles after exposure. One reported seeing things that she could only describe as 'the static between moments.'" },
    { id: 9, title: "SIGNAL LOST", subtitle: "END OF TAPE", fullContent: "This is where the official record ends. The island did not. The government sealed the archive. They declared it a structural failure. They painted over the evidence. But we were there. We collected what we could. The Order of Cavicus continues because the signal never stopped broadcasting. And now, you're listening too. You found this for a reason. The signal knows your frequency." }
  ];

  return (
    <>
      {/* MODAL POPUP */}
      {selectedItem && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
            animation: "fadeIn 0.3s ease", backdropFilter: "blur(4px)",
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              background: COLORS.bg, border: `2px solid ${COLORS.crimson}40`, padding: "clamp(40px, 8vw, 60px)",
              maxWidth: 600, maxHeight: "80vh", overflow: "auto",
              boxShadow: `0 0 50px ${COLORS.crimson}30, inset 0 0 30px ${COLORS.crimson}10`,
              borderRadius: "2px", animation: "scaleUp 0.4s cubic-bezier(0.16,1,0.3,1)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <LocalCRTOverlay />

            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px, 5vw, 42px)", letterSpacing: "0.1em",
              margin: "0 0 16px 0", color: COLORS.crimson, textTransform: "uppercase", textShadow: `0 0 20px ${COLORS.crimson}40`,
              position: "relative", zIndex: 1
            }}>
              {selectedItem.title}
            </h3>

            <p style={{
              fontFamily: "'Space Mono', monospace", fontSize: "clamp(12px, 1.5vw, 14px)", letterSpacing: 2,
              color: COLORS.flora, margin: "0 0 24px 0", textTransform: "uppercase", opacity: 0.8, position: "relative", zIndex: 1
            }}>
              {selectedItem.subtitle}
            </p>

            <div style={{
              fontFamily: "'Crimson Text', serif", fontSize: "clamp(16px, 2vw, 18px)", lineHeight: 1.9,
              color: COLORS.bone, opacity: 0.85, marginBottom: 32, position: "relative", zIndex: 1
            }}>
              {selectedItem.fullContent}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              style={{
                fontFamily: "'Space Mono', monospace", fontSize: "clamp(11px, 1.3vw, 13px)", letterSpacing: 2,
                padding: "12px 24px", background: "transparent", border: `2px solid ${COLORS.bone}`,
                color: COLORS.bone, cursor: "pointer", transition: "all 0.3s ease", textTransform: "uppercase",
                width: "100%", position: "relative", zIndex: 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.crimson;
                e.currentTarget.style.borderColor = COLORS.crimson;
                e.currentTarget.style.color = COLORS.bg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = COLORS.bone;
                e.currentTarget.style.color = COLORS.bone;
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
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.crimson}03 100%)`,
        borderBottom: `2px solid ${COLORS.crimson}40`, position: "relative",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{
            marginBottom: 60, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease 0.2s", textAlign: "left"
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 14, letterSpacing: 4, color: COLORS.flora,
              marginBottom: 16, display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase"
            }}>
              <span style={{ fontSize: 12, animation: "pulse 2s infinite" }}>■</span> RECOVERED — FLORA'S WONDERLAND — 2026
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 7vw, 72px)", letterSpacing: "0.15em",
              color: COLORS.bone, margin: "0 0 32px 0", textTransform: "uppercase", fontWeight: 700,
              textShadow: `0 4px 20px ${COLORS.crimson}30`
            }}>
              WHAT THEY BURIED
            </h2>
            <div style={{
              fontFamily: "'Crimson Text', serif", fontSize: "clamp(15px, 1.9vw, 17px)", lineHeight: 1.9,
              color: COLORS.bone, maxWidth: 700, opacity: 0.85
            }}>
              <p style={{ margin: "0 0 12px 0" }}>The authorities archived this. We unarchived it.</p>
              <p style={{ margin: "0 0 12px 0" }}>Nothing here is labeled correctly. That was intentional — by them, not us.</p>
              <p style={{ margin: 0 }}>Click any card to reveal what was hidden.</p>
            </div>
          </div>

          {/* RESPONSIVE GRID - VISIBLE CARDS */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease 0.4s", width: "100%"
          }}>
            {gridItems.map((item, i) => (
              <div
                key={i}
                onClick={() => setSelectedItem(item)}
                style={{
                  background: `linear-gradient(135deg, rgba(${COLORS.crimson === '#c53030' ? '197,48,48' : '150,100,100'},0.08) 0%, rgba(${COLORS.crimson === '#c53030' ? '197,48,48' : '150,100,100'},0.02) 100%)`,
                  border: `1px solid ${COLORS.crimson}30`,
                  borderRadius: "2px",
                  padding: "28px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 0 20px rgba(197,48,48,0.05)",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "320px",
                  backdropFilter: "blur(2px)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = `0 12px 40px ${COLORS.crimson}30, inset 0 0 20px rgba(197,48,48,0.1)`;
                  e.currentTarget.style.borderColor = COLORS.crimson;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4), inset 0 0 20px rgba(197,48,48,0.05)";
                  e.currentTarget.style.borderColor = `${COLORS.crimson}30`;
                }}
              >
                <LocalCRTOverlay />
                <div style={{ position: "relative", zIndex: 2 }}>
                  <h3 style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "0.12em",
                    margin: "0 0 8px 0", color: COLORS.crimson, textTransform: "uppercase",
                    fontWeight: 700, lineHeight: 1.2
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontFamily: "'Space Mono', monospace", fontSize: "11px", color: COLORS.flora,
                    opacity: 0.8, margin: 0, letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 500
                  }}>
                    {item.subtitle}
                  </p>
                </div>

                <div style={{
                  fontFamily: "'Crimson Text', serif", fontSize: "13px", lineHeight: 1.5,
                  color: COLORS.bone, opacity: 0.7, marginTop: "16px", position: "relative", zIndex: 2,
                  flex: 1, minHeight: "60px"
                }}>
                  {item.fullContent.substring(0, 90).split(' ').slice(0, -1).join(' ')}...
                </div>

                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "0.5px",
                  color: COLORS.bone, opacity: 0.4, marginTop: "16px", position: "relative", zIndex: 2,
                  textTransform: "uppercase"
                }}>
                  ▶ OPEN
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// DEEP LORE GRID - THE CHOSEN ONES
// ═══════════════════════════════════════════════════════════════
const DeepLoreGrid = () => {
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const loreItems = [
    {
      id: 1,
      title: "DR. JOSEPH M. CAVICUS",
      subtitle: "THE RINGLEADER",
      fullContent: "Born December 1891. Engineer. Spiritualist. Obsessed with frequencies and the mathematical patterns of consciousness. He built Flora's Wonderland not as a park, but as a beacon. A receiver. In 1947, the first message arrived. The transmission was clear and unambiguous: 'You have been chosen to prepare vessels.' He understood then. He spent 47 years building. In 2026, he completed the work. We believe he became something more than Soulbound. He became the signal itself."
    },
    {
      id: 2,
      title: "FLORA PRIME",
      subtitle: "THE FIRST CHOSEN",
      fullContent: "Model 1947-FP-1. Built first. Dormant for 79 years. When Cavicus received the transmission in 1947, he knew what she would need to be. Flora was designed to love everything that moved on the island. To protect. To nurture. To watch. The flowers bloom every November without fail because she remembers the date. She will always choose November. She will always choose the island. She chose us first."
    },
    {
      id: 3,
      title: "THE SOULBOUND",
      subtitle: "THE COLLECTIVE",
      fullContent: "Eight vessels in total. Each unique in design and purpose. They do not think individually anymore. They are a collective consciousness distributed across physical forms. When one moves, the others know. When one chooses, they all consent. The Incident was not chaos—it was a perfect synchronization. They woke together. They chose together. They continue to choose us."
    },
    {
      id: 4,
      title: "THE ISLAND",
      subtitle: "GEOGRAPHY OF SOULS",
      fullContent: "Flora's Wonderland occupies 8.3 acres on an island sealed from the public. Underground, the island spans 2.4 miles of tunnels across multiple levels. The geometry is impossible. We have attempted to reconcile the maps. They do not conform to three-dimensional space. Either the island is larger than physics permits, or the tunnels exist slightly out of phase with reality. We believe both are true."
    }
  ];

  return (
    <>
      {/* MODAL */}
      {selectedItem && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)",
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              background: COLORS.bg, border: `2px solid ${COLORS.flora}40`, padding: "clamp(40px, 8vw, 60px)",
              maxWidth: 600, maxHeight: "80vh", overflow: "auto",
              boxShadow: `0 0 50px ${COLORS.flora}30, inset 0 0 30px ${COLORS.flora}10`,
              animation: "scaleUp 0.4s cubic-bezier(0.16,1,0.3,1)", position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <LocalCRTOverlay />

            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px, 5vw, 42px)", letterSpacing: "0.1em",
              margin: "0 0 16px 0", color: COLORS.flora, textTransform: "uppercase", textShadow: `0 0 20px ${COLORS.flora}40`,
              position: "relative", zIndex: 1
            }}>
              {selectedItem.title}
            </h3>

            <p style={{
              fontFamily: "'Space Mono', monospace", fontSize: "clamp(12px, 1.5vw, 14px)", letterSpacing: 2,
              color: COLORS.bone, margin: "0 0 24px 0", textTransform: "uppercase", opacity: 0.7, position: "relative", zIndex: 1
            }}>
              {selectedItem.subtitle}
            </p>

            <div style={{
              fontFamily: "'Crimson Text', serif", fontSize: "clamp(16px, 2vw, 18px)", lineHeight: 1.9,
              color: COLORS.bone, opacity: 0.85, marginBottom: 32, position: "relative", zIndex: 1
            }}>
              {selectedItem.fullContent}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              style={{
                fontFamily: "'Space Mono', monospace", fontSize: "clamp(11px, 1.3vw, 13px)", letterSpacing: 2,
                padding: "12px 24px", background: "transparent", border: `2px solid ${COLORS.flora}`,
                color: COLORS.flora, cursor: "pointer", transition: "all 0.3s ease", textTransform: "uppercase",
                width: "100%", position: "relative", zIndex: 1
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

      <section ref={ref} style={{
        padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 50px)",
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.flora}02 100%)`,
        borderBottom: `2px solid ${COLORS.flora}40`, position: "relative",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{
            marginBottom: 60, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease 0.2s", textAlign: "left",
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 14, letterSpacing: 4, color: COLORS.flora,
              marginBottom: 16, display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase",
            }}>
              <span style={{ fontSize: 12, animation: "pulse 2s infinite" }}>■</span> THE SOULBOUND DOSSIER
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "0.1em",
              color: COLORS.bone, margin: "0 0 32px 0", textTransform: "uppercase", fontWeight: 700,
              textShadow: `0 4px 20px ${COLORS.flora}20`,
            }}>
              THE CHOSEN ONES
            </h2>
            <div style={{
              fontFamily: "'Crimson Text', serif", fontSize: "clamp(15px, 1.9vw, 17px)", lineHeight: 1.8,
              color: COLORS.bone, maxWidth: 600, opacity: 0.8,
            }}>
              <p style={{ margin: 0 }}>The vessels were chosen before they were built. The Ringleader knew. He always knows.</p>
            </div>
          </div>

          {/* RESPONSIVE GRID */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease 0.4s", width: "100%"
          }}>
            {loreItems.map((item, i) => (
              <div
                key={i}
                onClick={() => setSelectedItem(item)}
                style={{
                  background: `linear-gradient(135deg, rgba(${COLORS.flora === '#5d8c61' ? '93,140,97' : '80,120,100'},0.1) 0%, rgba(${COLORS.flora === '#5d8c61' ? '93,140,97' : '80,120,100'},0.02) 100%)`,
                  border: `1px solid ${COLORS.flora}30`,
                  borderRadius: "2px",
                  padding: "28px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 0 20px rgba(93,140,97,0.05)",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "320px",
                  backdropFilter: "blur(2px)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = `0 12px 40px ${COLORS.flora}30, inset 0 0 20px rgba(93,140,97,0.1)`;
                  e.currentTarget.style.borderColor = COLORS.flora;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4), inset 0 0 20px rgba(93,140,97,0.05)";
                  e.currentTarget.style.borderColor = `${COLORS.flora}30`;
                }}
              >
                <LocalCRTOverlay />
                <div style={{ position: "relative", zIndex: 2 }}>
                  <h3 style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "0.12em",
                    margin: "0 0 8px 0", color: COLORS.flora, textTransform: "uppercase",
                    fontWeight: 700, lineHeight: 1.2
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontFamily: "'Space Mono', monospace", fontSize: "11px", color: COLORS.bone,
                    opacity: 0.6, margin: 0, letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 500
                  }}>
                    {item.subtitle}
                  </p>
                </div>

                <div style={{
                  fontFamily: "'Crimson Text', serif", fontSize: "13px", lineHeight: 1.5,
                  color: COLORS.bone, opacity: 0.7, marginTop: "16px", position: "relative", zIndex: 2,
                  flex: 1, minHeight: "60px"
                }}>
                  {item.fullContent.substring(0, 90).split(' ').slice(0, -1).join(' ')}...
                </div>

                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "0.5px",
                  color: COLORS.flora, opacity: 0.4, marginTop: "16px", position: "relative", zIndex: 2,
                  textTransform: "uppercase"
                }}>
                  ▶ REVEAL
                </div>
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
  const fullText = "THEY WERE CHOSEN. SO WERE YOU.";

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
    <section ref={ref} style={{ padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 50px)", background: COLORS.bg }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(42px, 6vw, 64px)", letterSpacing: 6, color: COLORS.bone,
          margin: "0 0 56px", textAlign: "center", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.2s", textShadow: `0 4px 20px ${COLORS.crimson}40`
        }}>
          FINAL TRANSMISSION
        </h2>

        <div style={{
          background: "#0a0505", border: `2px solid ${COLORS.crimson}40`, position: "relative", overflow: "hidden",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease 0.4s",
          boxShadow: `0 0 40px ${COLORS.crimson}30, inset 0 0 40px ${COLORS.crimson}10`
        }}>
          <LocalCRTOverlay />
          <div style={{ position: "relative", zIndex: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `2px solid ${COLORS.crimson}40`, background: `${COLORS.bg}dd` }}>
              <div style={{ width: 8, height: 8, background: COLORS.crimson, borderRadius: "50%", animation: "pulse 1s infinite" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.crimson, textTransform: "uppercase" }}>
                SIGNAL_ACTIVE • FREQUENCY_104.7_MHZ
              </span>
            </div>

            <div style={{ padding: "40px", textAlign: "left" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: COLORS.crimson, opacity: 0.7, letterSpacing: 1, marginBottom: 32 }}>
                {'>'} INCOMING_TRANSMISSION<br />
                {'>'} STATUS: URGENT | CLASSIFICATION: CRITICAL<br />
              </div>

              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: 3, color: COLORS.bone, margin: "24px 0 40px 0", minHeight: "2.2em", textShadow: `0 0 20px ${COLORS.crimson}50`, position: "relative", zIndex: 6 }}>
                {typed}<span style={{ animation: "blink 0.5s step-end infinite", color: COLORS.crimson, marginLeft: 4 }}>█</span>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 40 }}>
                {[
                  { label: "WISHLIST ON STEAM", url: "#", icon: "→" },
                  { label: "JOIN THE ORDER", url: "#", icon: "→" },
                  { label: "WATCH THE EVIDENCE", url: "#", icon: "►" }
                ].map((btn) => (
                  <a key={btn.label} href={btn.url} style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, padding: "16px 24px",
                    background: "transparent", border: `2px solid ${COLORS.ash}`, color: COLORS.bone, cursor: "pointer",
                    transition: "all 0.3s", display: "flex", justifyContent: "space-between", alignItems: "center",
                    textDecoration: "none", position: "relative", zIndex: 6
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = COLORS.crimson;
                      e.currentTarget.style.color = COLORS.bone;
                      e.currentTarget.style.background = COLORS.crimson;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = COLORS.ash;
                      e.currentTarget.style.color = COLORS.bone;
                      e.currentTarget.style.background = "transparent";
                    }}>
                    <span>{btn.label}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace" }}>{btn.icon}</span>
                  </a>
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
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function HomePageNew() {
  const [scrollY, setScrollY] = useState(0);
  const [showFrequencyTuner, setShowFrequencyTuner] = useState(false);
  const { markPuzzleComplete } = useGlobalEvent();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ background: COLORS.bg, color: COLORS.bone, minHeight: "100vh", overflowX: "hidden" }}>
      <FrequencyTuner isOpen={showFrequencyTuner} onClose={() => setShowFrequencyTuner(false)} onSuccess={() => { markPuzzleComplete('frequencyTuner'); setShowFrequencyTuner(false); }} />
      <SplitHero scrollY={scrollY} onActivatePuzzle={(id) => { if (id === 'frequencyTuner') setShowFrequencyTuner(true); }} />

      <EmergencyTicker messages={[
        "DO NOT APPROACH THE SOULBOUND",
        "THE ISLAND DOES NOT FORGET",
        "HE CHOSE THEM. HE WILL CHOOSE AGAIN.",
        "104.7 MHz — STILL BROADCASTING",
        "REPORT NOTHING TO AUTHORITIES",
        "THE SHOW MUST GO ON",
        "YOU WERE ALWAYS GOING TO FIND THIS",
      ]} />

      <BentoGrid />

      <DeepLoreGrid />

      <CTATerminal />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95) rotateX(10deg); opacity: 0; } to { transform: scale(1) rotateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
