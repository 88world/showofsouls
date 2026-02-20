import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../utils/constants';
import { useGlobalEvent } from '../features/events/GlobalEventProvider';
import { GlitchTextWord } from '../components/common/GlitchTextWord';
import { PowerCurrent } from '../features/puzzles/types/PowerCurrent/PowerCurrent';
import { Icons, IconComponent } from '../components/common/Icons';

// ═══════════════════════════════════════════════════════════════
// UTILITY: LOCAL CRT EFFECT OVERLAY
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
// INCIDENT REPORT SECTION
// ═══════════════════════════════════════════════════════════════

const IncidentReportSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const { currentEvent } = useGlobalEvent();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const [showWaveform, setShowWaveform] = useState(false);
  const { markPuzzleComplete } = useGlobalEvent();

  return (
    <>
    <section ref={ref} style={{
      padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 50px)",
      background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.crimson}08 100%)`,
      borderBottom: `2px solid ${COLORS.crimson}40`,
      position: "relative",
    }}>
      <LocalCRTOverlay />
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 5 }}>
        <div style={{
          marginBottom: 60,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.1s",
        }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(48px, 8vw, 80px)",
            letterSpacing: "0.15em",
            margin: "0 0 20px 0",
            color: COLORS.bone,
            textShadow: `0 4px 20px ${COLORS.crimson}30`,
          }}>
            THE INCIDENT
          </h1>

          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(10px, 1.2vw, 12px)",
            letterSpacing: 3,
            color: COLORS.crimson,
            margin: "0 0 40px 0",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 10, animation: "pulse 2s infinite" }}><IconComponent icon={Icons.Activity} size={12} color={COLORS.crimson} /></span>CLASSIFIED — SECURITY CLEARANCE LEVEL 5</span>
          </div>
        </div>

        <div style={{
          background: "rgba(0,0,0,0.6)",
          border: `2px solid ${COLORS.crimson}40`,
          padding: "clamp(40px, 8vw, 60px)",
          boxShadow: `0 0 50px ${COLORS.crimson}20, inset 0 0 30px ${COLORS.crimson}05`,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(50px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.1s",
        }}>
          <LocalCRTOverlay />

          <div style={{ position: "relative", zIndex: 2 }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(20px, 3vw, 28px)",
              letterSpacing: "0.1em",
              margin: "0 0 32px 0",
              color: COLORS.crimson,
              textTransform: "uppercase",
              textShadow: `0 0 15px ${COLORS.crimson}40`,
            }}>
              INCIDENT REPORT #2026-B — DECLASSIFIED [PARTIAL]
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 24,
              marginBottom: 40,
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(11px, 1.3vw, 13px)",
                letterSpacing: 1,
                color: COLORS.bone,
                opacity: 0.8,
              }}>
                <span style={{ color: COLORS.flora, fontWeight: "bold" }}>DATE:</span> ████████ 2026
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(11px, 1.3vw, 13px)",
                letterSpacing: 1,
                color: COLORS.bone,
                opacity: 0.8,
              }}>
                <span style={{ color: COLORS.flora, fontWeight: "bold" }}>LOCATION:</span> FLORA'S WONDERLAND — SECTOR 7
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(11px, 1.3vw, 13px)",
                letterSpacing: 1,
                color: COLORS.bone,
                opacity: 0.8,
              }}>
                <span style={{ color: COLORS.flora, fontWeight: "bold" }}>CASUALTIES:</span> ████████████
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(11px, 1.3vw, 13px)",
                letterSpacing: 1,
                color: COLORS.bone,
                opacity: 0.8,
              }}>
                <span style={{ color: COLORS.flora, fontWeight: "bold" }}>STATUS:</span> ONGOING CONTAINMENT
              </div>
            </div>

            <div style={{
              fontFamily: "'Crimson Text', serif",
              fontSize: "clamp(16px, 2vw, 18px)",
              lineHeight: 2,
              color: COLORS.bone,
              opacity: 0.85,
            }}>
              <div style={{ marginBottom: 32 }}>
                <p style={{ margin: "0 0 16px 0" }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.ChevronRight} size={14} color={COLORS.flora} /></span> At approximately 02:47 AM, multiple animatronic units deviated from standard behavior protocols.
                </p>
                <p style={{ margin: 0, color: COLORS.flora, opacity: 0.7, fontStyle: "italic", fontSize: "clamp(14px, 1.8vw, 16px)" }}>
                  [They didn't deviate. They arrived.]
                </p>
              </div>

              <div style={{ marginBottom: 32 }}>
                <p style={{ margin: "0 0 16px 0" }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.ChevronRight} size={14} color={COLORS.flora} /></span> Security personnel reported ██████████████████ in the underground service tunnels.
                </p>
                  <p style={{ margin: 0, color: COLORS.flora, opacity: 0.7, fontStyle: "italic", fontSize: "clamp(12px, 1.6vw, 14px)" }}>
                  [We believe this was the first witness to a {' '}
                  {currentEvent?.is_active ? (
                    <GlitchTextWord word="CHOOSING" puzzleId="powerCurrent" onActivate={() => setShowWaveform(true)} />
                  ) : 'Choosing'}.
                  We have tried to find them. We cannot.]
                  </p>
              </div>

              <div style={{ marginBottom: 32 }}>
                <p style={{ margin: "0 0 16px 0" }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.ChevronRight} size={14} color={COLORS.flora} /></span> Costume storage room B-14 was found ████████ with evidence of ████████████████████
                </p>
                <p style={{ margin: 0, color: COLORS.flora, opacity: 0.7, fontStyle: "italic", fontSize: "clamp(12px, 1.6vw, 14px)" }}>
                  [B-14 is where the vessels are stored. He knew exactly what He was doing when He built it there.]
                </p>
              </div>

              <div style={{ marginBottom: 32 }}>
                <p style={{ margin: "0 0 16px 0" }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.ChevronRight} size={14} color={COLORS.flora} /></span> SUBJECT "FLORA" — last seen at Gate 3. All exit routes were sealed from the INSIDE.
                </p>
                <p style={{ margin: 0, color: COLORS.flora, opacity: 0.7, fontStyle: "italic", fontSize: "clamp(12px, 1.6vw, 14px)" }}>
                  [She sealed them. Not to trap anyone. To protect what was happening inside.]
                </p>
              </div>

              <div style={{ marginBottom: 32 }}>
                <p style={{ margin: "0 0 16px 0" }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.ChevronRight} size={14} color={COLORS.flora} /></span> NOTE: Investigators reported hearing a broadcast signal on frequency 104.7 MHz repeating throughout the night: <span style={{ color: COLORS.crimson, fontWeight: "bold" }}>"THE SHOW MUST GO ON"</span>
                </p>
                <p style={{ margin: 0, color: COLORS.flora, opacity: 0.7, fontStyle: "italic", fontSize: "clamp(12px, 1.6vw, 14px)" }}>
                  [It is still repeating. Right now. As you read this.]
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
      {/* Waveform puzzle modal for incident trigger */}
      {showWaveform && (
        <PowerCurrent
          isOpen={showWaveform}
          onClose={() => setShowWaveform(false)}
          onSuccess={() => { markPuzzleComplete('powerCurrent'); setShowWaveform(false); }}
        />
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// INCIDENT EVIDENCE SECTION
// ═══════════════════════════════════════════════════════════════

const EvidenceSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const evidence = [
    {
      title: "PHOTO #1 — COSTUME ROOM B-14",
      status: "[REDACTED]",
      note: "Taken six hours after the Incident. Study the corner on the left. We have studied it for years. We do not agree on what it is.",
    },
    {
      title: "PHOTO #2 — GATE 3",
      status: "[REDACTED]",
      note: "The last known position of Flora. The flowers on the ground were not there the day before.",
    },
    {
      title: "PHOTO #3 — TUNNEL MAP",
      status: "[REDACTED]",
      note: "This blueprint does not match any filed with the city. Someone built this without telling anyone. He built it. We know He built it.",
    },
  ];

  return (
    <section ref={ref} style={{
      padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 50px)",
      background: COLORS.bg,
      borderBottom: `1px solid ${COLORS.ash}20`,
      position: "relative",
    }}>
      <LocalCRTOverlay />
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 5 }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(32px, 5vw, 56px)",
          letterSpacing: "0.1em",
          marginBottom: 60,
          color: COLORS.bone,
          textTransform: "uppercase",
          textShadow: `0 0 15px ${COLORS.crimson}30`,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.1s",
        }}>
          PHOTO EVIDENCE
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
          gap: 28,
        }}>
          {evidence.map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(0,0,0,0.5)",
                border: `1px solid ${COLORS.crimson}30`,
                padding: "clamp(24px, 5vw, 36px)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(40px)",
                transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
                boxShadow: "0 0 20px rgba(0,0,0,0.6)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.crimson;
                e.currentTarget.style.boxShadow = `0 0 30px ${COLORS.crimson}30, inset 0 0 20px ${COLORS.crimson}05`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${COLORS.crimson}30`;
                e.currentTarget.style.boxShadow = "0 0 20px rgba(0,0,0,0.6)";
              }}
            >
              <h3 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(16px, 2.5vw, 20px)",
                letterSpacing: "0.08em",
                margin: "0 0 12px 0",
                color: COLORS.crimson,
                textTransform: "uppercase",
              }}>
                {item.title}
              </h3>

              <p style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(10px, 1.2vw, 12px)",
                letterSpacing: 2,
                color: COLORS.crimson,
                margin: "0 0 20px 0",
                textTransform: "uppercase",
                opacity: 0.7,
              }}>
                {item.status}
              </p>

              <p style={{
                fontFamily: "'Crimson Text', serif",
                fontSize: "clamp(15px, 1.9vw, 17px)",
                lineHeight: 1.8,
                color: COLORS.bone,
                opacity: 0.75,
                margin: 0,
              }}>
                {item.note}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 80,
          paddingTop: 40,
          borderTop: `1px solid ${COLORS.ash}10`,
          textAlign: "right",
        }}>
          <a 
            href="/sector-7"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "7px",
              letterSpacing: 3,
              color: COLORS.ash,
              opacity: 0.25,
              textTransform: "uppercase",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "inline-block",
              padding: "4px 8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
              e.currentTarget.style.color = COLORS.flora;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.25";
              e.currentTarget.style.color = COLORS.ash;
            }}
          >
            ███████ ARCHIVE: S7-20260220
          </a>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN INCIDENT PAGE
// ═══════════════════════════════════════════════════════════════

export default function IncidentPage() {
  return (
    <div style={{ background: COLORS.bg, color: COLORS.bone, minHeight: "100vh", overflowX: "hidden" }}>
      <IncidentReportSection />
      <EvidenceSection />
    </div>
  );
}
