import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../utils/constants';

// Local CRT overlay used across cards and modals
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
// CUSTOM RETRO RADIO PLAYER ("THE SURPLUS SCANNER")
// ═══════════════════════════════════════════════════════════════

// A reusable component for the "screws" in the corners of the radio rack
const RackScrew = () => (
  <div style={{
    width: 12, height: 12, borderRadius: '50%',
    background: 'linear-gradient(135deg, #3a3a3a, #1a1a1a)',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 2px rgba(0,0,0,0.5)',
    border: '1px solid #0a0a0a',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', fontSize: 8
  }}>+</div>
);

// Small glowing LED indicator
const StatusLED = ({ label, active, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <div style={{
      width: 8, height: 8, borderRadius: '50%',
      background: active ? color : '#1a1a1a',
      boxShadow: active ? `0 0 8px ${color}, inset 0 0 4px ${color}EE` : 'inset 0 1px 2px rgba(0,0,0,0.5)',
      border: '1px solid rgba(0,0,0,0.5)', transition: 'all 0.2s ease'
    }} />
    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: COLORS.ash, opacity: 0.7, letterSpacing: 1 }}>{label}</span>
  </div>
);

const YouTubeAudioPlayer = ({ videoId = 'zWlI2ztER7o' }) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const [vu, setVu] = useState(0);
  const [freqJitter, setFreqJitter] = useState(4625.0);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) { setIsReady(true); return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setIsReady(true);
  }, []);

  // Initialize Player
  useEffect(() => {
    if (!isReady || !containerRef.current || playerRef.current) return;
    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '0', width: '0', videoId,
      playerVars: { autoplay: 0, controls: 0, disablekb: 1 },
      events: {
        onReady: (e) => { e.target.setVolume(volume); },
        onStateChange: (e) => { setIsPlaying(e.data === (window.YT && window.YT.PlayerState.PLAYING)); }
      }
    });
    return () => { try { if (playerRef.current?.destroy) playerRef.current.destroy(); } catch (e) {} playerRef.current = null; };
  }, [isReady]);

  const togglePlay = () => { if (playerRef.current) isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo(); };
  const handleVolume = (v) => { setVolume(v); if (playerRef.current?.setVolume) playerRef.current.setVolume(v); };

  // Simulated Animations (VU and frequency jitter)
  useEffect(() => {
    let raf = null;
    const tick = () => {
      // VU Meter math
      const target = isPlaying ? (0.3 + Math.random() * 0.6) : 0.02 + Math.random() * 0.05;
      setVu((v) => Math.max(0, Math.min(1, v * 0.9 + target * 0.1)));
      // Frequency jitter math for 4625 kHz
      if (isPlaying) setFreqJitter(4625.0 + (Math.random() * 0.4 - 0.2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [isPlaying]);

  // Styles for the main radio chassis
  const chassisStyle = {
    width: '100%', maxWidth: 720, margin: '40px auto 60px', position: 'relative',
    background: `linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)`,
    borderTop: `1px solid #3a3a3a`, borderBottom: `1px solid #0a0a0a`,
    boxShadow: `0 20px 40px rgba(0,0,0,0.6), inset 0 2px 2px rgba(255,255,255,0.05), inset 0 -2px 10px rgba(0,0,0,0.8)`,
    borderRadius: 4, padding: '16px 20px',
    display: 'flex', flexDirection: 'column', gap: 16,
  };

  // Style for the glowing display screen area
  const screenAreaStyle = {
    background: '#080808', borderRadius: 2, padding: 12,
    border: `2px solid #333`,
    boxShadow: 'inset 0 0 20px rgba(0,0,0,1)',
    position: 'relative', overflow: 'hidden',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
  };

  // Style for the physical play button
  const buttonStyle = {
    fontFamily: "'Space Mono', monospace", fontSize: 14, letterSpacing: 1, fontWeight: 700,
    padding: '14px 24px', borderRadius: 2, cursor: 'pointer',
    background: isPlaying
      ? `linear-gradient(180deg, ${COLORS.ember}aa, ${COLORS.crimson})`
      : `linear-gradient(180deg, #3a3a3a, #2a2a2a)`,
    color: isPlaying ? '#fff' : COLORS.ash,
    border: '1px solid rgba(0,0,0,0.5)',
    borderTop: isPlaying ? `1px solid ${COLORS.ember}` : `1px solid #4a4a4a`,
    boxShadow: isPlaying
      ? `inset 0 2px 10px rgba(0,0,0,0.5), 0 0 15px ${COLORS.ember}60`
      : `0 4px 0 #111, 0 6px 10px rgba(0,0,0,0.5)`,
    transform: isPlaying ? 'translateY(4px)' : 'translateY(0)',
    transition: 'all 0.1s ease', outline: 'none',
    textShadow: isPlaying ? `0 0 8px ${COLORS.ember}` : 'none',
    minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
  };

  return (
    <div style={chassisStyle}>
      {/* Rack Screws & Texture Overlay */}
      <div style={{ position: 'absolute', top: 8, left: 8 }}><RackScrew /></div>
      <div style={{ position: 'absolute', top: 8, right: 8 }}><RackScrew /></div>
      <div style={{ position: 'absolute', bottom: 8, left: 8 }}><RackScrew /></div>
      <div style={{ position: 'absolute', bottom: 8, right: 8 }}><RackScrew /></div>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none', backgroundImage: `url('https://www.transparenttextures.com/patterns/noisy-net.png')`, mixBlendMode: 'overlay' }} />

      {/* TOP SECTION - THE DISPLAY SCREEN */}
      <div style={screenAreaStyle}>
        {/* CRT Overlay for screen */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.2, background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)`, zIndex: 2 }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.3, background: `radial-gradient(circle at center, transparent 50%, #000 100%)`, zIndex: 3 }} />

        {/* Frequency Readout */}
        <div style={{ zIndex: 10, position: 'relative' }}>
           <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.flora, opacity: 0.7, letterSpacing: 1, marginBottom: 4 }}>TUNED FREQUENCY</div>
           <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 0.8, color: isPlaying ? COLORS.flora : COLORS.ash, textShadow: isPlaying ? `0 0 15px ${COLORS.flora}80` : 'none', transition: 'color 0.3s' }}>
             {isPlaying ? freqJitter.toFixed(1) : '----.-'} <span style={{ fontSize: 24 }}>kHz</span>
           </div>
        </div>

        {/* Center - VU Meter (Retro VFD Style) */}
        <div style={{ flex: 1, maxWidth: 250, margin: '0 20px', zIndex: 10, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: 8, color: COLORS.ash, marginBottom: 4 }}>
            <span>L</span><span>SIGNAL STRENGTH</span><span>R</span>
          </div>
          <div style={{ height: 24, background: '#111', border: `1px solid #333`, borderRadius: 2, overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 0 10px #000' }}>
            {/* Grid overlay for VFD look */}
            <div style={{ position: 'absolute', inset: 0, backgroundSize: '4px 4px', backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', opacity: 0.3, zIndex: 2 }}></div>
            {/* The Bar */}
            <div style={{
              width: `${Math.round(vu * 100)}%`, height: '100%',
              background: `linear-gradient(90deg, ${COLORS.flora}40, ${COLORS.flora}, ${COLORS.ember}, ${COLORS.crimson})`,
              boxShadow: `0 0 15px ${COLORS.flora}60`,
              transition: 'width 0.06s linear', position: 'relative', zIndex: 1
            }} />
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', gap: 12, zIndex: 10, position: 'relative' }}>
           <StatusLED label="POWER" active={true} color={COLORS.ember} />
           <StatusLED label="CARRIER" active={isPlaying && vu > 0.1} color={COLORS.flora} />
           <StatusLED label="LOCKED" active={isPlaying} color={COLORS.crimson} />
        </div>
      </div>

      {/* BOTTOM SECTION - CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '0 20px', position: 'relative', zIndex: 10 }}>

        {/* Play Button */}
        <button onClick={togglePlay} style={buttonStyle}>
          <span style={{ fontSize: 18 }}>{isPlaying ? '■' : '►'}</span>
          {isPlaying ? 'DISENGAGE' : 'ENGAGE'}
        </button>

        {/* Volume Fader Section */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16, background: '#1a1a1a', padding: '8px 16px', borderRadius: 2, border: '1px solid #333', borderBottom: '1px solid #555', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)' }}>
           <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, letterSpacing: 1 }}>GAIN</div>

           {/* Custom styled range input to look like a fader */}
           <div style={{ flex: 1, position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
             {/* Fader Track slot */}
             <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: '#000', borderBottom: '1px solid #333', borderRadius: 2 }}></div>
             <input
               type="range" min="0" max="100" value={volume}
               onChange={(e) => handleVolume(Number(e.target.value))}
               style={{
                 width: '100%', position: 'relative', zIndex: 2, margin: 0, opacity: 0, cursor: 'pointer', height: '100%' 
               }}
             />
             {/* The physical fader knob rendered based on volume position */}
             <div style={{
               position: 'absolute', left: `calc(${volume}% - 10px)`, top: 0, width: 20, height: 24,
               background: `linear-gradient(180deg, #555, #2a2a2a)`,
               border: '1px solid #1a1a1a', borderTop: '1px solid #777', borderRadius: 2,
               boxShadow: '0 4px 8px rgba(0,0,0,0.5)', pointerEvents: 'none',
               display: 'flex', justifyContent: 'center', alignItems: 'center'
             }}>
                 <div style={{ width: 2, height: 14, background: volume > 0 ? COLORS.ember : '#111', boxShadow: volume > 0 ? `0 0 5px ${COLORS.ember}` : 'none' }}></div>
             </div>
           </div>

           <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: volume > 0 ? COLORS.ember : COLORS.ash, width: 36, textAlign: 'right', textShadow: volume > 0 ? `0 0 8px ${COLORS.ember}60` : 'none' }}>
             {volume}
           </div>
        </div>

      </div>

      {/* Hidden player container */}
      <div style={{ width: 1, height: 1, overflow: 'hidden', position: 'relative' }}>
        <div ref={containerRef} />
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
// SECTOR 7 DISCOVERY GRID
// ═══════════════════════════════════════════════════════════════

const Sector7Grid = () => {
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const ref = useRef(null);
  const carouselRef = useRef(null);
  const posRef = useRef(0);
  const lastTimeRef = useRef(null);
  const singleWidthRef = useRef(0);

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
    const speed = 100;

    const onFrame = (t) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      if (singleWidthRef.current > 0) {
        posRef.current += speed * dt;
        const offset = posRef.current % singleWidthRef.current;
        el.style.transform = `translateX(${-offset}px)`;
      }

      rafId = requestAnimationFrame(onFrame);
    };

    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    rafId = requestAnimationFrame(onFrame);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      lastTimeRef.current = null;
    };
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
            <div
              ref={carouselRef}
              style={{
                display: "flex",
                gap: 14,
                padding: "16px 0",
                willChange: "transform",
              }}
            >
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
                  <div>
                    <h3 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "24px",
                      letterSpacing: "0.05em",
                      color: COLORS.flora,
                      margin: "0 0 4px 0"
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
// MAIN SECTOR 7 PAGE EXPORT
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
      
      {/* Inserted the new Retro Radio Player right below the hero */}
      <YouTubeAudioPlayer videoId="zWlI2ztER7o" />
      
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