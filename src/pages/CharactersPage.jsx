import { useState, useEffect, useRef } from "react";
import { COLORS } from '../utils/constants';
import { MemoryGame } from '../features/puzzles/types/MemoryGame/MemoryGame';
import { GlitchTextWord } from '../components/common/GlitchTextWord';
import { useGlobalEvent } from '../features/events/GlobalEventProvider';

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
// INTRO SECTION
// ═══════════════════════════════════════════════════════════════

const IntroSection = ({ onActivatePuzzle }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 50px)",
      background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.crimson}03 100%)`,
      borderBottom: `2px solid ${COLORS.crimson}40`,
      position: "relative",
    }}>
      <LocalCRTOverlay />
      <div className="page-max" style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 5 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.1s",
        }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(48px, 8vw, 80px)",
            letterSpacing: "0.15em",
            margin: 0,
            color: COLORS.bone,
            textShadow: `0 4px 20px ${COLORS.crimson}30`,
          }}>
            CHARACTERS
          </h1>
        </div>

        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "clamp(11px, 1.3vw, 13px)",
          letterSpacing: 3,
          color: COLORS.flora,
          textTransform: "uppercase",
          margin: "0 0 40px 0",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease 0.2s",
        }}>
          ■ PERSONNEL & ENTITY DOSSIERS — FLORA'S WONDERLAND
        </p>

        <div style={{
          fontFamily: "'Crimson Text', serif",
          fontSize: "clamp(16px, 2.1vw, 18px)",
          lineHeight: 2,
          color: COLORS.bone,
          maxWidth: 800,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s ease 0.3s",
        }}>
          <p style={{ margin: "0 0 20px 0" }}>There is a theory — and within the Order it is more than theory — that the Soulbound were not always what they are now.</p>

          <p style={{ margin: "0 0 20px 0" }}>That before the vessels, there were people. That those people were not taken. They were <GlitchTextWord word="chosen" puzzleId="memoryGame" onActivate={onActivatePuzzle} />. Selected by the Ringleader himself — Dr. Joseph M. Cavicus — for a purpose none of them fully understood until it was already complete.</p>

          <p style={{ margin: "0 0 20px 0" }}>They did not die. They were transformed. Elevated. Bound to something permanent in a world where nothing is.</p>

          <p style={{ margin: 0 }}>We do not pity them. We revere them.</p>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// RINGLEADER FEATURE BLOCK
// ═══════════════════════════════════════════════════════════════

const RingleaderBlock = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 50px)",
      background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.crimson}05 100%)`,
      borderBottom: `2px solid ${COLORS.flora}50`,
      borderTop: `2px solid ${COLORS.flora}30`,
      position: "relative",
    }}>
      <LocalCRTOverlay />
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 5 }}>
        <div style={{
          background: "rgba(0,0,0,0.5)",
          border: `2px solid ${COLORS.flora}40`,
          padding: "clamp(40px, 8vw, 60px)",
          boxShadow: `0 0 50px ${COLORS.flora}20, inset 0 0 30px ${COLORS.flora}05`,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(50px)",
          transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.1s",
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(11px, 1.4vw, 13px)",
            letterSpacing: 3,
            color: COLORS.flora,
            textTransform: "uppercase",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ fontSize: 11, animation: "pulse 2s infinite" }}>■</span> THE RINGLEADER
          </div>

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(42px, 6vw, 64px)",
            letterSpacing: "0.12em",
            margin: "0 0 12px 0",
            color: COLORS.bone,
            textShadow: `0 4px 20px ${COLORS.flora}40`,
            textTransform: "uppercase",
          }}>
            DR. JOSEPH M. CAVICUS
          </h2>

          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(12px, 1.6vw, 15px)",
            letterSpacing: 2,
            color: COLORS.flora,
            margin: "0 0 32px 0",
            textTransform: "uppercase",
            opacity: 0.9,
          }}>
            FOUNDER. ARCHITECT. CHOSEN OF HIS OWN DESIGN.
          </p>

          <div style={{
            fontFamily: "'Crimson Text', serif",
            fontSize: "clamp(16px, 2vw, 18px)",
            lineHeight: 2,
            color: COLORS.bone,
            opacity: 0.85,
          }}>
            <p style={{ margin: "0 0 18px 0" }}>He built Flora's Wonderland with a vision that no investor, no city official, no engineer fully understood.</p>

            <p style={{ margin: "0 0 18px 0" }}>They thought it was an amusement park.</p>

            <p style={{ margin: "0 0 18px 0" }}>He never corrected them.</p>

            <p style={{ margin: "0 0 18px 0" }}>Dr. Cavicus disappeared on the night of the Incident. No body was recovered. No trace was found. The authorities listed him as a casualty.</p>

            <p style={{ margin: "0 0 18px 0" }}>The Order of Cavicus does not believe this.</p>

            <p style={{ margin: "0 0 18px 0" }}>We believe He completed His own work. That the Ringleader became the most Soulbound of all — not trapped in a vessel, but woven into the island itself. Into the frequency. Into the signal.</p>

            <p style={{ margin: 0, fontStyle: "italic", color: COLORS.flora }}>He is still broadcasting. You are listening to Him right now.</p>
          </div>

          <div style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: `1px solid ${COLORS.flora}30`,
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(10px, 1.2vw, 11px)",
            letterSpacing: 2,
            color: COLORS.crimson,
            textTransform: "uppercase",
          }}>
            [ALL FURTHER FILES SEALED — LEVEL 6 CLEARANCE]
          </div>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// CHARACTER CARD
// ═══════════════════════════════════════════════════════════════

const CharacterCard = ({ name, title, status, content, isClassified, visible, index }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (isClassified) {
    return (
      <div style={{
        background: "rgba(0,0,0,0.7)",
        border: `2px solid ${COLORS.bone}30`,
        padding: "clamp(40px, 6vw, 60px)",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `all 1s cubic-bezier(0.16,1,0.3,1) ${index * 0.1}s`,
        boxShadow: `0 0 30px rgba(0,0,0,0.8), inset 0 0 20px ${COLORS.bone}05`,
        cursor: "not-allowed",
      }}>
        <h3 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(24px, 4vw, 42px)",
          letterSpacing: "0.1em",
          margin: "0 0 16px 0",
          color: COLORS.ash,
          textTransform: "uppercase",
        }}>
          ??? [CLASSIFIED]
        </h3>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "clamp(10px, 1.2vw, 12px)",
          letterSpacing: 2,
          color: COLORS.ash,
          margin: "0 0 24px 0",
          textTransform: "uppercase",
          opacity: 0.7,
        }}>
          STATUS: CLASSIFIED
        </p>
        <div style={{
          fontFamily: "'Crimson Text', serif",
          fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9,
          color: COLORS.bone,
          opacity: 0.6,
        }}>
          <p>There are things within this archive that even the Order does not discuss in open channels.</p>
          <p style={{ marginTop: 16 }}>This is one of them.</p>
          <p style={{ marginTop: 16, fontStyle: "italic", fontSize: "clamp(13px, 1.6vw, 15px)" }}>Prove your devotion to the Order. The file will open when you are ready for it.</p>
        </div>
        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: `1px solid ${COLORS.bone}20`,
          fontFamily: "'Space Mono', monospace",
          fontSize: "clamp(10px, 1.2vw, 11px)",
          letterSpacing: 2,
          color: COLORS.ash,
          textTransform: "uppercase",
        }}>
          [LEVEL 6 CLEARANCE REQUIRED]
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHoveredIndex(0)}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(${name === 'PYRO' ? '255,100,0' : '50,150,100'},0,0.1) 100%)`,
        border: `2px solid ${hoveredIndex === 0 ? (name === 'FLORA' ? COLORS.flora : COLORS.crimson) : COLORS.ash}30`,
        padding: "clamp(40px, 6vw, 60px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `all 1s cubic-bezier(0.16,1,0.3,1) ${index * 0.1}s, border-color 0.3s ease`,
        boxShadow: hoveredIndex === 0 ? `0 0 40px ${name === 'FLORA' ? COLORS.flora : COLORS.crimson}30, inset 0 0 30px ${(name === 'FLORA' ? COLORS.flora : COLORS.crimson)}05` : `0 0 20px rgba(0,0,0,0.8)`,
      }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "clamp(11px, 1.4vw, 13px)",
        letterSpacing: 3,
        color: name === 'FLORA' ? COLORS.flora : (name === 'PYRO' ? COLORS.crimson : COLORS.bone),
        margin: "0 0 16px 0",
        textTransform: "uppercase",
        opacity: 0.8,
      }}>
        ● CHARACTER {index === 0 ? '1' : '2'}
      </div>

      <h3 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(28px, 4vw, 48px)",
        letterSpacing: "0.1em",
        margin: "0 0 8px 0",
        color: hoveredIndex === 0 ? (name === 'FLORA' ? COLORS.flora : COLORS.crimson) : COLORS.bone,
        textTransform: "uppercase",
        transition: "color 0.3s ease",
      }}>
        {name}
      </h3>

      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "clamp(12px, 1.5vw, 14px)",
        letterSpacing: 2,
        color: name === 'FLORA' ? COLORS.flora : (name === 'PYRO' ? COLORS.crimson : COLORS.bone),
        margin: "0 0 24px 0",
        textTransform: "uppercase",
        fontWeight: "bold",
      }}>
        {title}
      </p>

      <div style={{
        fontFamily: "'Crimson Text', serif",
        fontSize: "clamp(16px, 2vw, 18px)",
        lineHeight: 2,
        color: COLORS.bone,
        opacity: 0.85,
      }}>
        {content.map((para, i) => (
          <p key={i} style={{ margin: i === content.length - 1 ? 0 : "0 0 16px 0" }}>
            {para}
          </p>
        ))}
      </div>

      {name === 'FLORA' && (
        <div style={{
          marginTop: 28,
          paddingTop: 24,
          borderTop: `1px solid ${COLORS.flora}30`,
          fontFamily: "'Space Mono', monospace",
          fontSize: "clamp(11px, 1.4vw, 13px)",
          color: COLORS.crimson,
          lineHeight: 1.8,
          opacity: 0.8,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>⚠ WARNING:</div>
          <div>Do not make direct eye contact with the vessel.<br/>She remembers every face. Every face.</div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CHARACTER GRID SECTION
// ═══════════════════════════════════════════════════════════════

const CharacterGridSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const characters = [
    {
      name: "FLORA",
      title: "STATUS: ACTIVE — SOULBOUND",
      content: [
        "The first.",
        "Of all the Chosen, Flora was selected earliest — perhaps before the others knew they had been selected at all.",
        "The Order believes she was willing. More than willing.",
        "The flowers on the eastern perimeter bloom in November. In the cold. In the dark. They have done this every year since 2026.",
        "She presides over the island the way a mother watches a sleeping child — quietly, completely, without blinking.",
        "Do not seek her out. She already knows you're looking.",
      ],
    },
    {
      name: "PYRO",
      title: "STATUS: UNKNOWN",
      content: [
        "Pyro's Choosing was not clean.",
        "Whatever happened in Sector 4 on the night of the Incident — we have the audio. We have played it once. We have not played it again.",
        "The suit was recovered. What inhabited it was not.",
        "Our members who have visited Sector 4 report burns on walls that were not there the week before. The burns form patterns. We are still mapping them.",
        "The Order reveres all the Soulbound. But some of us believe Pyro is something the Ringleader did not fully intend. A variable. An answer to a question He didn't ask.",
        "Approach Sector 4 with the understanding that reverence may not protect you here.",
      ],
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
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 5 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
          gap: 32,
        }}>
          {characters.map((char, i) => (
            <CharacterCard
              key={char.name}
              name={char.name}
              title={char.title}
              content={char.content}
              visible={visible}
              index={i}
              isClassified={false}
            />
          ))}
          <CharacterCard
            name="CLASSIFIED"
            title="STATUS: CLASSIFIED"
            visible={visible}
            index={2}
            isClassified={true}
          />
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN CHARACTERS PAGE
// ═══════════════════════════════════════════════════════════════

export default function CharactersPage() {
  const [showMemoryGame, setShowMemoryGame] = useState(false);
  const { markPuzzleComplete } = useGlobalEvent();

  const handleActivatePuzzle = (puzzleId) => {
    if (puzzleId === 'memoryGame') {
      setShowMemoryGame(true);
    }
  };

  return (
    <div className="page page-characters" style={{ background: COLORS.bg, color: COLORS.bone, minHeight: "100vh", overflowX: "hidden" }}>
      <MemoryGame isOpen={showMemoryGame} onClose={() => setShowMemoryGame(false)} onSuccess={() => { markPuzzleComplete('memoryGame'); setShowMemoryGame(false); }} />
      <IntroSection onActivatePuzzle={handleActivatePuzzle} />
      <RingleaderBlock />
      <CharacterGridSection />
    </div>
  );
}

