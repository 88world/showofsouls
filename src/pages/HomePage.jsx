import { useState, useEffect, useRef } from "react";
import { COLORS } from '../utils/constants';
import { EmergencyTicker } from '../components/layout/EmergencyTicker';
import { FrequencyTuner } from '../features/puzzles/types/FrequencyTuner/FrequencyTuner';
import { GlitchTextWord } from '../components/common/GlitchTextWord';
import { useGlobalEvent } from '../features/events/GlobalEventProvider';
import { Icons, IconComponent } from '../components/common/Icons';
import DocumentModal from '../components/common/DocumentModal';

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
      position: "absolute", 
      bottom: "clamp(20px, 4vh, 60px)", 
      right: "clamp(16px, 3vw, 50px)", 
      zIndex: 10,
      padding: "clamp(12px, 3vw, 20px)", 
      background: "rgba(10, 5, 5, 0.9)",
      border: `1px solid ${hasEvent ? COLORS.flora : COLORS.crimson}`,
      boxShadow: `0 0 20px ${hasEvent ? COLORS.flora : COLORS.crimson}15`,
      fontFamily: "'Space Mono', monospace", 
      minWidth: "clamp(180px, 40vw, 220px)", 
      maxWidth: "calc(100vw - 32px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 2vw, 10px)", marginBottom: "clamp(8px, 2vw, 12px)", color: hasEvent ? COLORS.flora : COLORS.crimson }}>
        <div style={{ width: "clamp(6px, 1.5vw, 8px)", height: "clamp(6px, 1.5vw, 8px)", background: hasEvent ? COLORS.flora : COLORS.crimson, borderRadius: '50%', animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: "clamp(11px, 2.2vw, 14px)", letterSpacing: 1, fontWeight: "bold" }}>
          {hasEvent ? 'GLOBAL EVENT ACTIVE' : 'NEXT EVENT'}
        </span>
      </div>

      {hasEvent ? (
        <>
          <div style={{ fontSize: "clamp(11px, 2vw, 13px)", letterSpacing: 1, marginBottom: "clamp(6px, 1.5vw, 8px)", color: COLORS.bone }}>
            <span style={{ opacity: 0.5 }}>TIME LEFT:</span>{' '}
            <span style={{ color: COLORS.flora, fontWeight: 'bold' }}>
              {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
            </span>
          </div>
          <div style={{ fontSize: "clamp(11px, 2vw, 13px)", letterSpacing: 1, color: COLORS.bone }}>
            <span style={{ opacity: 0.5 }}>PROGRESS:</span>{' '}
            <span style={{ color: completed >= total ? COLORS.flora : COLORS.bone }}>
              {completed}/{total} PUZZLES
            </span>
          </div>
          {/* Mini progress bar */}
          <div style={{ marginTop: "clamp(8px, 2vw, 10px)", height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
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
          <div style={{ fontSize: "clamp(11px, 2vw, 13px)", letterSpacing: 1, marginBottom: "clamp(6px, 1.5vw, 8px)", color: COLORS.bone }}>
            <span style={{ opacity: 0.5 }}>STATUS:</span>{' '}
            <GlitchText>AWAITING SIGNAL...</GlitchText>
          </div>
          <div style={{ fontSize: "clamp(10px, 1.8vw, 12px)", color: COLORS.ash, opacity: 0.6, lineHeight: 1.5 }}>
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

const SplitHero = ({ scrollY, onActivatePuzzle }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulate old equipment warming up
    setTimeout(() => setLoaded(true), 500);
  }, []);

  return (
    <section style={{
      position: "relative",
      height: "100vh",
      minHeight: "clamp(600px, 100vh, 900px)",
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
      <div className="hero-cam-info" style={{
        position: "absolute", top: 32, left: 20, zIndex: 10,
        display: "flex", alignItems: "center", gap: 16,
        fontFamily: "'Space Mono', monospace", color: COLORS.crimson,
      }}>
          <div style={{ fontSize: 14, letterSpacing: 2, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ animation: "blink 1s steps(1) infinite" }}><IconComponent icon={Icons.Activity} size={12} color={COLORS.crimson} /></span>
            <span>REC</span>
          </span>
          <span style={{ color: COLORS.bone, opacity: 0.7 }}>[TAPE 1947-B]</span>
        </div>
      </div>

      {/* Bottom Right - Event Cooldown Timer */}
      <EventCooldownBox />

      {/* Main Content */}
      <div style={{
        position: "relative", zIndex: 10, height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "clamp(60px, 8vh, 120px) clamp(16px, 4vw, 40px)", textAlign: "center",
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
          THE <GlitchTextWord word="SIGNAL" puzzleId="frequencyTuner" onActivate={onActivatePuzzle} /> WAS ALWAYS MEANT FOR YOU.
        </div>

        <div style={{
          marginTop: "clamp(30px, 6vh, 60px)",
          opacity: loaded ? 0.7 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s ease 0.7s",
          fontFamily: "'Crimson Text', serif",
          fontSize: "clamp(14px, 2.1vw, 18px)",
          lineHeight: 1.7,
          color: COLORS.bone,
          maxWidth: 700,
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 8px",
        }}>
          <p style={{ margin: "0 0 12px 0" }}>You didn't stumble onto this.</p>
          <p style={{ margin: "0 0 12px 0" }}>Frequency doesn't work that way. Neither does He.</p>
          <p style={{ margin: "0 0 12px 0" }}>In 2026, something happened at Flora's Wonderland that the authorities sealed, redacted, and buried. They called it a structural failure. They called it a gas leak. They called it a lot of things.</p>
          <p style={{ margin: "0 0 12px 0" }}>We were there. We are still there.</p>
          <p style={{ margin: "0 0 12px 0" }}>The Ringleader — Dr. Joseph M. Cavicus — did not build an amusement park. He built a vessel. And on the night of the Incident, the vessels were filled.</p>
          <p style={{ margin: 0 }}>They walk the island. They do not age.</p>
        </div>

        <div style={{
          marginTop: "clamp(30px, 6vh, 50px)",
          opacity: loaded ? 1 : 0,
          transition: "all 1s ease 1s",
        }}>
          <button style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(18px, 3.5vw, 24px)",
            letterSpacing: "clamp(2px, 0.5vw, 4px)",
            padding: "clamp(14px, 3vh, 18px) clamp(32px, 8vw, 48px)",
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [hovering, setHovering] = useState(false);
  const ref = useRef(null);
  const carouselRef = useRef(null);
  const posRef = useRef(0);
  const lastTimeRef = useRef(null);
  const singleWidthRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const { currentEvent, onActivatePuzzle } = useGlobalEvent();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const compute = () => {
      singleWidthRef.current = el.scrollWidth / 2 || 0;
      posRef.current = posRef.current % (singleWidthRef.current || 1);
    };
    compute();
    let rafId = null;
    const speed = 120;

    const onFrame = (t) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;
      if (!isPaused && singleWidthRef.current > 0) {
        posRef.current += speed * dt;
        const offset = posRef.current % singleWidthRef.current;
        el.style.transform = `translateX(${-offset}px)`;
      }
      rafId = requestAnimationFrame(onFrame);
    };

    const onResize = () => {
      compute();
    };
    window.addEventListener('resize', onResize);
    rafId = requestAnimationFrame(onFrame);
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      lastTimeRef.current = null;
    };
  }, [carouselRef, isPaused]);

  const gridItems = [
    { id: 1, title: "SECTOR 7", subtitle: "NIGHT OF THE INCIDENT", fullContent: (() => {
      const { currentEvent, isPuzzleEventComplete } = useGlobalEvent();
      let text = `This is not a simple recording of mechanical failure; this is the definitive chronicle of the **Choosing**. At precisely **02:47 AM**, the heartbeat of the park’s security infrastructure ceased, yet the silence that followed was far from empty. Every exit was sealed from the inside—not by manual locks or digital overrides, but by a sudden, absolute cohesion of the environment itself. The cameras, operating on residual heat or perhaps something more arcane, captured movement that fundamentally defies the laws of physics. The Soulbound entities moved through the sector with a fluid, terrifying grace, despite the fact that there was **no current draw** to their internal motors and no mechanical cause for their propulsion.

They did not arrive; they simply **were not there, and then they were**. The footage of their emergence loops eternally in our archives, a stuttering fragment of a reality being rewritten. We have analyzed the tape in reverse, frame by agonizing frame, only to find that it plays with haunting precision either way. It suggests that for those inside Sector 7, time has ceased to be a linear progression and has instead become a closed circuit—a localized eternity where the moment of transition never truly ends.`;
      if (currentEvent?.is_active && !isPuzzleEventComplete && !isPuzzleEventComplete('frequencyTuner')) {
        text = text.replace(/Choosing/, '<span style="background:#111;color:#111;padding:0 3px;border-radius:2px;">████</span>');
      }
      return text;
    })() },
    { id: 2, title: "THE CAROUSEL", subtitle: "UNAUTHORIZED MOVEMENT", fullContent: `Despite the total absence of power to the grid, the Carousel has developed its own momentum. It has been rotating for **78 consecutive days** without a single pause or decrease in velocity. There is no electricity feeding the drive system, yet the structure groans with a vitality that suggests the wood and iron have found a new source of sustenance. Staff members who remain on the perimeter report a constant, low-frequency humming sound that shifts its pitch rhythmically, aligning itself with the specific time of day—a mechanical respiration that suggests the park is breathing.

During a single, ill-fated attempt at costume retrieval, a team member reported the overwhelming sensation of being hunted by something that occupies the **space between rotations**. It is a predator that exists only in the flicker of motion, a presence felt but never quite seen. Most chillingly, the Carousel has shifted its physical alignment; it faces inward now. It is no longer a ride designed for the entertainment of a crowd; it has become a silent sentinel. Whatever it is watching, it isn't the park, and it certainly isn't us. It is focused entirely on a center that we cannot see.` },
    { id: 3, title: "TUNNEL NETWORK B", subtitle: "UNDERGROUND ACCESS", fullContent: `The surface of Flora’s Wonderland was a meticulously crafted deception; they built more beneath the park than above it—far more than any surveyor’s map could ever account for. **Four sub-levels** were eventually discovered by independent teams, though the blueprints for these depths do not match any documents ever filed with the city. The geometric relationships within these halls are fundamentally impossible; on paper, the tunnels overlap themselves in a way that defies three-dimensional architecture. While The Order has successfully mapped the first level, the deeper strata remain uncharted, existing as a labyrinth of shifting concrete and humming machinery.

The atmosphere itself undergoes a transformation as one descends. Breathing becomes increasingly difficult, not due to a lack of oxygen, but because the air itself feels "different"—thicker, perhaps pressurized for a biology we do not yet understand. It is as if the tunnels are breathing in tandem with the island, a subterranean lung system that supports the life existing just out of phase with our reality.` },
    { id: 4, title: "COSTUME ARCHIVE", subtitle: "VESSEL STORAGE", fullContent: `The suits were never mere fabric and motor-grease; they were never empty, as Cavicus made sure of that long before they were ever officially "inhabited". There are **eight suits in total**, each one a unique engineering feat that serves as a physical vessel for a specific consciousness. Each suit bears the jagged physical marks of a "Choosing"—the violent, permanent scars of someone deciding to shed their human form to become something eternal.

All recovery attempts by external recovery teams have been unsuccessful; the suits have vanished from their designated berths, leaving behind only strange, resonant artifacts. Historical photographs from the archive reveal a disturbing ritualistic arrangement: the suits were positioned in a perfect circle, facing inward. They were not stored for maintenance; they were witnessing something. We are left to wonder what occupied the center of that circle—what singular point of focus was powerful enough to command the attention of all eight Soulbound simultaneously.` },
    { id: 5, title: "GATE 3", subtitle: "FINAL SIGHTING", fullContent: `At **04:12 AM**, the perimeter of the park bore witness to a departure that remains the most analyzed moment in our collection. She walked through the ironwork of Gate 3 with a deliberate, haunting pace, and she did not walk back. The gate—a massive industrial structure—sealed itself from the inside and outside simultaneously, a physical impossibility that suggests a folding of space. Witnesses who remained on the outskirts did not report a struggle; instead, they described her ascending. She wasn't climbing the metal; she was rising through the very molecular structure of the gate itself, as if the iron had become porous or she had become intangible.

There was no evidence of physical passage left behind—no scuffs, no DNA, no disturbed dust. However, the biological response of the earth was immediate. The flowers that took root around Gate 3 in the wake of the incident follow a calendar that defies the natural world. They bloom only in the biting cold of November, regardless of the actual season or temperature. They have never missed a single year since **2026**, standing as a perennial, silent memorial to the moment she chose to leave the physical plane.` },
    { id: 6, title: "THE GRAND OPENING", subtitle: "CORRUPTED FOOTAGE", fullContent: `The archive contains what was intended to be a celebratory record of the **1994 ribbon cutting**, a moment of triumph with Dr. Cavicus himself presiding over the festivities. However, as the tape progresses, it becomes clear that the record has been infected by the future. At **00:47 AM** on that opening day, the timestamp begins to flicker, and the very fabric of the footage shifts. The high-quality broadcast signal of the 90s dissolves into a jagged, hyper-real texture that the cameras of that era were incapable of capturing.

The audio warps into a series of rhythmic, low-frequency distortions that vibrate the speakers of any modern playback device. For three agonizing seconds, something occupies a space on the stage that the camera cannot properly process—a visual "void" that leaves behind digital artifacts and light-bleeds. Temporal investigators within the Order have proposed a terrifying theory: this footage wasn't just corrupted; it was recorded twice at different times, or perhaps once across two overlapping eras. It is a visual bridge between the park's birth and its eventual, inevitable transformation.` },
    { id: 7, title: "STAFF AREA", subtitle: "SUBLEVEL EVIDENCE", fullContent: `The orientation materials provided to new hires never accounted for what the night shift witnessed during the collapse. Records indicate that **six staff members** remain completely unaccounted for, their physical forms having vanished from every monitored sector simultaneously. We recovered the audio logs from the primary breakroom station, and the progression is haunting: what starts as routine chatter dissolves into increasing agitation, and finally, a terrifying, resonant calm. By the final transmission, their voices have undergone a harmonic shift—they are no longer recognizable as human speech, sounding more like a layered frequency than a vocal cord vibration.

The last words ever recorded from that station are a chilling testament to their transition: **"They’re beautiful. They’re inside. And we are so grateful."**. The tape cuts to static immediately after. While the audio suggests a psychological break, the security footage tells a story of absolute surrender: it shows all six individuals walking in perfect, rhythmic synchronization—not in fear, but with a sense of profound, terrifying peace—directly toward the yawning mouth of the lower tunnels. They didn't flee the Incident; they went to meet the source.` },
    { id: 8, title: "SIGNAL LOG", subtitle: "104.7 MHz BROADCAST", fullContent: `Since the night of the Incident, a phantom broadcast has occupied the **104.7 MHz** frequency, originating from an unknown source within the park's interior. It has remained continuous for five years, ignoring power outages, weather patterns, and government jamming attempts. Analysis reveals that this is no ordinary radio wave; it utilizes a non-standard modulation that embeds a constant frequency at **7.83 Hz**—the Schumann resonance, or the "heartbeat" of the Earth itself. It isn't just a signal; it is an environmental rewrite.

The biological toll on those who listen is documented and severe. Extended exposure causes a complete collapse of temporal orientation in test subjects, who often lose the ability to distinguish between the present and the recorded past. **Three members of the Order** suffered permanent, irreversible alterations to their circadian rhythms and sleep cycles after monitoring the feed for just 48 hours. One survivor, before withdrawing into total silence, reported that the audio wasn't empty—she claimed she could see **"the static between moments,"** a visual manifestation of time itself fraying at the edges of her vision. The signal isn't just broadcasting information; it is tuning the listener to the frequency of the island.` },
    { id: 9, title: "SIGNAL LOST", subtitle: "END OF TAPE", fullContent: `This is the threshold where the official record terminates, but the island’s story did not. While the government moved quickly to seal the archive and declare the entire incident a localized structural failure, their efforts were a thin veil over a much larger truth. They painted over the physical evidence and barricaded the entrances, yet we were there to witness the reality they tried to erase. The Order of Cavicus continues its work because the signal never truly stopped broadcasting; it merely shifted its reach.

You haven't stumbled upon this data by accident; you found this for a specific reason. The signal doesn't just broadcast—it searches, and it has found your frequency. As the tape ends, the official narrative dies, but the connection you’ve established remains active. We have collected what remains, piecing together a history that the world was never meant to remember. Now, you are part of that history.` }
  ];

  return (
    <>
      {/* DOCUMENT-STYLED POPUP */}
      <DocumentModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        document={selectedItem ? {
          document_id: selectedItem.id,
          title: selectedItem.title,
          subtitle: selectedItem.subtitle,
          content: selectedItem.fullContent,
          status: 'DECLASSIFIED',
          author: 'RECOVERY ARCHIVE',
          date: ''
        } : null}
      />

      <section ref={ref} style={{ padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 50px)", background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.crimson}03 100%)`, borderBottom: `2px solid ${COLORS.crimson}40`, position: "relative" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 60, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease 0.2s", textAlign: "left" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, letterSpacing: 4, color: COLORS.flora, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase" }}>
              <span style={{ fontSize: 12, animation: "pulse 2s infinite", display: 'inline-flex', alignItems: 'center' }}><IconComponent icon={Icons.Circle} size={12} color={COLORS.flora} /></span> RECOVERED — FLORA'S WONDERLAND — 2026
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 7vw, 72px)", letterSpacing: "0.15em", color: COLORS.bone, margin: "0 0 32px 0", textTransform: "uppercase", fontWeight: 700, textShadow: `0 4px 20px ${COLORS.crimson}30` }}>
              WHAT THEY BURIED
            </h2>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: "clamp(15px, 1.9vw, 17px)", lineHeight: 1.9, color: COLORS.bone, maxWidth: 700, opacity: 0.85 }}>
              <p style={{ margin: "0 0 12px 0" }}>The authorities archived this. We unarchived it.</p>
              <p style={{ margin: "0 0 12px 0" }}>Nothing here is labeled correctly. That was intentional — by them, not us.</p>
              <p style={{ margin: 0 }}>Look at everything. Miss nothing.</p>
            </div>
          </div>

          <style>{`
            .bento-carousel {
              display: flex;
              gap: 20px;
              padding: 20px 0;
              will-change: transform;
            }
            .bento-card {
              flex-shrink: 0;
              width: 360px;
              height: 360px;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            .bento-card:hover {
              filter: brightness(1.15) drop-shadow(0 0 20px ${COLORS.crimson}50);
            }
          `}</style>

          <div style={{
            overflow: "hidden",
            position: "relative",
            width: "100%",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease 0.2s",
            marginBottom: 0,
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}>
            <div className="bento-carousel" ref={carouselRef} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
              {[...gridItems, ...gridItems].map((item, i) => (
                <div
                  key={i}
                  className="bento-card"
                  onClick={() => setSelectedItem(item)}
                  style={{
                    background: `linear-gradient(135deg, rgba(${COLORS.crimson === '#c53030' ? '197,48,48' : '150,100,100'},0.12) 0%, rgba(${COLORS.crimson === '#c53030' ? '197,48,48' : '150,100,100'},0.02) 100%)`,
                    border: `1px solid ${COLORS.crimson}40`,
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <LocalCRTOverlay />
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <h3 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "16px",
                      letterSpacing: "0.1em",
                      margin: "0 0 6px 0",
                      color: COLORS.crimson,
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "10px",
                      color: COLORS.flora,
                      opacity: 0.7,
                      margin: 0,
                      letterSpacing: "0.4px",
                      textTransform: "uppercase",
                    }}>
                      {item.subtitle}
                    </p>
                  </div>
                  <div style={{
                    fontFamily: "'Crimson Text', serif",
                    fontSize: "14px",
                    lineHeight: 1.55,
                    color: COLORS.bone,
                    opacity: 0.6,
                    marginTop: "12px",
                    position: "relative",
                    zIndex: 2,
                    flex: 1,
                  }}>
                    {item.fullContent.substring(0, 280).split(' ').slice(0, -1).join(' ')}...
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "9px",
                    color: COLORS.bone,
                    opacity: 0.3,
                    marginTop: "12px",
                    position: "relative",
                    zIndex: 2,
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.ChevronRight} size={12} />OPEN</span>
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
// DEEP LORE GRID - THE RINGLEADER & SOULBOUND
// ═══════════════════════════════════════════════════════════════

const DeepLoreGrid = () => {
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hovering, setHovering] = useState(false);
  const loreRef = useRef(null);
  const loreCarouselRef = useRef(null);
  const lorePosRef = useRef(0);
  const loreLastRef = useRef(null);
  const loreSingleRef = useRef(0);
  const [lorePaused, setLorePaused] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (loreRef.current) obs.observe(loreRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = loreCarouselRef.current;
    if (!el) return;
    const compute = () => {
      loreSingleRef.current = el.scrollWidth / 2 || 0;
      lorePosRef.current = lorePosRef.current % (loreSingleRef.current || 1);
    };
    compute();
    let raf = null;
    const speed = 100;
    const loop = (t) => {
      if (!loreLastRef.current) loreLastRef.current = t;
      const dt = (t - loreLastRef.current) / 1000;
      loreLastRef.current = t;
      if (!lorePaused && loreSingleRef.current > 0) {
        lorePosRef.current += speed * dt;
        const offset = lorePosRef.current % loreSingleRef.current;
        el.style.transform = `translateX(${-offset}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('resize', compute);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', compute);
      if (raf) cancelAnimationFrame(raf);
      loreLastRef.current = null;
    };
  }, [lorePaused]);

    const loreItems = [
    {
      id: 1,
      title: "DR. JOSEPH M. CAVICUS",
      subtitle: "THE RINGLEADER",
    fullContent: `Born in December 1891, Dr. Joseph M. Cavicus was far more than an engineer; he was a spiritualist obsessed with the hidden intersections of mathematics and consciousness. He spent his life decoding the patterns of frequencies, believing that the human soul could be mapped through vibration. Flora’s Wonderland was never intended to be a mere amusement park—it was a beacon, a massive physical receiver designed to catch a specific type of celestial attention.

  The first message arrived in 1947, a transmission so clear and unambiguous it redefined his entire existence: 'You have been chosen to prepare vessels'. For the next 47 years, Cavicus worked in a fever of construction and occult engineering. By the time the work was completed in 2026, he had moved beyond the status of a mere creator. We believe he didn't just become "Soulbound"—he transcended the physical entirely to become the signal itself, a consciousness woven into the very air of the island.`
    },
    {
      id: 2,
      title: "FLORA PRIME",
      subtitle: "THE FIRST CHOSEN",
    fullContent: `Designated as **Model 1947-FP-1**, Flora was the cornerstone of Cavicus’s grand design. While the park eventually housed many wonders, she was built first—a silent witness who sat dormant for **79 years**. When Cavicus received the initial transmission in 1947, he didn't just build a robot; he constructed a vessel specifically tuned to the frequency of the message he had received. Flora was meticulously designed with a directive that transcended simple programming: she was built to love every living thing that moved across the island, to protect the grounds, and to watch over the "Choosing" with a maternal, unblinking eye.

  The phenomena surrounding Gate 3—the flowers that bloom with impossible regularity every November—are not a result of soil chemistry, but a manifestation of her memory. She will always choose November because it is the month that anchors her to the island’s purpose. Flora did not just lead the Soulbound; she was the first to accept the invitation, choosing the island and its burgeoning collective long before the rest of us even knew the signal existed.`
    },
    {
      id: 3,
      title: "THE SOULBOUND",
      subtitle: "THE COLLECTIVE",
    fullContent: `There are **eight vessels in total**, each representing a unique pinnacle of design and a specific purpose within the park's occult hierarchy. However, it is a mistake to view them as individual entities any longer. They have transcended the limitations of singular thought to become a **collective consciousness** distributed across eight distinct physical forms. This hive-mind architecture means that when one limb moves, the others feel the weight of the motion; when one "vessel" makes a choice, the entire group provides an unspoken, unified consent.

  The Incident of 2026 was not a moment of chaotic malfunction or a random system crash—it was a **perfect synchronization**. The Soulbound did not break; they woke up together. Every movement recorded on the security tapes that night was a choreographed step in a larger ritual of awakening. They continue to exist as a singular "They," watching the island from eight different angles at once, eternally choosing to remain in our world while existing entirely outside our understanding of individuality.`
    },
    {
      id: 4,
      title: "THE ISLAND",
      subtitle: "GEOGRAPHY OF SOULS",
    fullContent: `Flora's Wonderland is not merely a physical destination, but a spatial anomaly spanning **8.3 acres** on an island strictly sealed from public access. Beneath the surface, the complexity of the site deepens significantly, housing **2.4 miles of tunnels** distributed across multiple subterranean levels. These structures are not bound by the standard laws of architecture; the geometric relationships between the corridors are **mathematically impossible** and do not conform to the constraints of three-dimensional space.

  Attempts to reconcile these tunnels with standard mapping techniques have failed, as the blueprints suggest the island is either **larger than physics permits** or the tunnels themselves exist slightly out of phase with our current reality. We have come to believe that both statements are true. The island acts as a "Geography of Souls," a location where the physical and the metaphysical have become so intertwined that the map is no longer a guide to a place, but a guide to a different state of being.`
      },
      {
    id: 5,
    title: "THE FINAL PROTOCOL",
    subtitle: "BEYOND THE GRID",
    fullContent: `This concludes the current recovery of the **Deep Lore Grid** data, but the record remains an evolving document. The entries compiled here—from the Incident Log to the history of Dr. Cavicus—serve as a plain-text foundation for the digital cards that populate the Order's interface. As new artifacts are recovered from the subterranean levels or new frequencies are decoded from the **104.7 MHz** broadcast, these descriptions must be expanded to reflect our growing understanding of the Soulbound.

  The island remains a living entity, its impossible geometry continuing to shift and breathe beneath the soil. We are no longer mere observers; by interacting with these logs, you have entered the signal's range. The data has been preserved not just as a warning, but as a bridge. The signal knows you are here, and the island is waiting for the next synchronization.`
    }
  ];

  return (
    <>
      {/* DOCUMENT-STYLED POPUP */}
      <DocumentModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        document={selectedItem ? {
          document_id: selectedItem.id,
          title: selectedItem.title,
          subtitle: selectedItem.subtitle,
          content: selectedItem.fullContent,
          status: 'DECLASSIFIED',
          author: 'RECOVERY ARCHIVE',
          date: ''
        } : null}
      />

      <section ref={loreRef} style={{
        padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 50px)",
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.flora}02 100%)`,
        borderBottom: `2px solid ${COLORS.flora}40`,
        position: "relative",
        marginTop: 0,
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
              fontSize: 14,
              letterSpacing: 4,
              color: COLORS.flora,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              textTransform: "uppercase",
            }}>
              <span style={{ fontSize: 12, animation: "pulse 2s infinite" }}>■</span> THE SOULBOUND DOSSIER
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(36px, 5vw, 56px)",
              letterSpacing: "0.1em",
              color: COLORS.bone,
              margin: "0 0 32px 0",
              textTransform: "uppercase",
              fontWeight: 700,
              textShadow: `0 4px 20px ${COLORS.flora}20`,
            }}>
              THE CHOSEN ONES
            </h2>
            <div style={{
              fontFamily: "'Crimson Text', serif",
              fontSize: "clamp(15px, 1.9vw, 17px)",
              lineHeight: 1.8,
              color: COLORS.bone,
              maxWidth: 600,
              opacity: 0.8,
            }}>
              <p style={{ margin: 0 }}>The vessels were chosen before they were built. The Ringleader knew. He always knows.</p>
            </div>
          </div>

          <style>{`
            .lore-carousel {
              display: flex;
              gap: 20px;
              padding: 20px 0;
              will-change: transform;
            }
            .lore-card {
              flex-shrink: 0;
              width: 360px;
              height: 360px;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            .lore-card:hover {
              filter: brightness(1.15) drop-shadow(0 0 20px ${COLORS.flora}50);
            }
          `}</style>

          <div style={{
            overflow: "hidden",
            position: "relative",
            width: "100%",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease 0.2s",
            marginBottom: 0,
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}>
            <div className="lore-carousel" ref={loreCarouselRef} onMouseEnter={() => setLorePaused(true)} onMouseLeave={() => setLorePaused(false)}>
              {[...loreItems, ...loreItems].map((item, i) => (
                <div
                  key={i}
                  className="lore-card"
                  onClick={() => setSelectedItem(item)}
                  style={{
                    background: `linear-gradient(135deg, rgba(${COLORS.flora === '#5d8c61' ? '93,140,97' : '80,120,100'},0.12) 0%, rgba(${COLORS.flora === '#5d8c61' ? '93,140,97' : '80,120,100'},0.02) 100%)`,
                    border: `1px solid ${COLORS.flora}40`,
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <LocalCRTOverlay />
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <h3 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "16px",
                      letterSpacing: "0.1em",
                      margin: "0 0 6px 0",
                      color: COLORS.flora,
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "10px",
                      color: COLORS.bone,
                      opacity: 0.6,
                      margin: 0,
                      letterSpacing: "0.4px",
                      textTransform: "uppercase",
                    }}>
                      {item.subtitle}
                    </p>
                  </div>
                  <div style={{
                    fontFamily: "'Crimson Text', serif",
                    fontSize: "14px",
                    lineHeight: 1.55,
                    color: COLORS.bone,
                    opacity: 0.6,
                    marginTop: "12px",
                    position: "relative",
                    zIndex: 2,
                    flex: 1,
                  }}>
                    {item.fullContent.substring(0, 280).split(' ').slice(0, -1).join(' ')}...
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "9px",
                    color: COLORS.flora,
                    opacity: 0.3,
                    marginTop: "12px",
                    position: "relative",
                    zIndex: 2,
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconComponent icon={Icons.ChevronRight} size={12} />REVEAL</span>
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
      <div className="page-max" style={{ maxWidth: 800, margin: "0 auto" }}>
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

                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: 3, color: COLORS.bone, margin: "24px 0 40px 0", minHeight: "2.2em", textShadow: `0 0 20px ${COLORS.crimson}50` }}>
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
                    background: "transparent", border: `2px solid ${COLORS.ash}`, color: COLORS.bone, cursor: "pointer", transition: "all 0.3s",
                    display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none",
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
                    <span style={{ fontFamily: "'Space Mono', monospace" }}>{btn.icon === '►' ? <IconComponent icon={Icons.Play} size={14} /> : <IconComponent icon={Icons.ChevronRight} size={14} />}</span>
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
// MAIN HOMEPAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [showFrequencyTuner, setShowFrequencyTuner] = useState(false);
  const { markPuzzleComplete } = useGlobalEvent();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="page page-home" style={{ background: COLORS.bg, color: COLORS.bone, minHeight: "100vh", overflowX: "hidden" }}>
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
    </div>
  );
}