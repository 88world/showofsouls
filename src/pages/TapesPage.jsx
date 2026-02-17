import { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../utils/constants';
import { useProgression } from '../features/progression/ProgressionProvider';
import { useGlobalEvent } from '../features/events/GlobalEventProvider';
import { PUZZLE_REGISTRY } from '../features/puzzles/config/puzzleRegistry';
import { PasswordTerminal } from '../features/puzzles/types/PasswordTerminal/PasswordTerminal';
import { MemoryGame } from '../features/puzzles/types/MemoryGame/MemoryGame';
import { MorseDecoder } from '../features/puzzles/types/MorseDecoder/MorseDecoder';
import { FrequencyTuner } from '../features/puzzles/types/FrequencyTuner/FrequencyTuner';
import { WaveformMatch } from '../features/puzzles/types/WaveformMatch/WaveformMatch';
import { SignalScramble } from '../features/puzzles/types/SignalScramble/SignalScramble';
import { WireSplice } from '../features/puzzles/types/WireSplice/WireSplice';
import { RedactionReveal } from '../features/puzzles/types/RedactionReveal/RedactionReveal';
import { FileDecryptor } from '../features/puzzles/types/FileDecryptor/FileDecryptor';
import { KeypadLock } from '../features/puzzles/types/KeypadLock/KeypadLock';
import { PatternGrid } from '../features/puzzles/types/PatternGrid/PatternGrid';
import { JigsawFragment } from '../features/puzzles/types/JigsawFragment/JigsawFragment';
import { SpectralAnalysis } from '../features/puzzles/types/SpectralAnalysis/SpectralAnalysis';
import { useTapeUnlocks } from '../hooks/useTapeUnlocks';
import { useGameStore } from '../store';
import { getAllRecordings, getAllDocuments } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// RETRO AUDIO PLAYER — Reel-to-reel / cassette style
// ═══════════════════════════════════════════════════════════════

const RetroAudioPlayer = ({ src, title, recordingId }) => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [vuLevel, setVuLevel] = useState(0);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '00:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Generate a fake frequency from recording ID for display
  const freqSeed = (recordingId || 'REC').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const fakeFreq = (87.5 + (freqSeed % 200) / 10).toFixed(1);

  // Setup Web Audio analyser for VU meter
  const setupAnalyser = useCallback(() => {
    if (analyserRef.current || !audioRef.current) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (e) { /* analyser optional */ }
  }, []);

  const animateVU = useCallback(() => {
    if (analyserRef.current && isPlaying) {
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setVuLevel(avg / 255);
    } else if (isPlaying) {
      // Fake VU when analyser unavailable
      setVuLevel(0.3 + Math.random() * 0.4);
    }
    if (isPlaying) {
      animRef.current = requestAnimationFrame(animateVU);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animRef.current = requestAnimationFrame(animateVU);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setVuLevel(0);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, animateVU]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (!analyserRef.current) setupAnalyser();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const handleEnded = () => { setIsPlaying(false); setCurrentTime(0); };

  const [isDragging, setIsDragging] = useState(false);

  const seekToPosition = useCallback((clientX) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  }, [duration]);

  const handleProgressDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    seekToPosition(e.clientX);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    seekToPosition(e.touches[0].clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => { seekToPosition(e.clientX); };
    const handleUp = () => { setIsDragging(false); };
    const handleTouchMove = (e) => { e.preventDefault(); seekToPosition(e.touches[0].clientX); };
    const handleTouchEnd = () => { setIsDragging(false); };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, seekToPosition]);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // VU meter needle angle: -45 (min) to +45 (max)
  const needleAngle = -45 + vuLevel * 90;

  // Signal strength bars (5 bars)
  const signalBars = Math.ceil(vuLevel * 5);

  return (
    <div style={{
      background: 'linear-gradient(180deg, #1a1610 0%, #0e0c08 100%)',
      border: `1px solid ${COLORS.ember}30`,
      borderTop: `2px solid ${COLORS.ember}50`,
      padding: 0, position: 'relative', overflow: 'hidden',
      boxShadow: `inset 0 1px 0 ${COLORS.ember}15, 0 2px 8px rgba(0,0,0,0.5)`,
    }}>
      <audio ref={audioRef} src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded} preload="metadata"
        crossOrigin="anonymous"
      />

      {/* === RADIO FACE PLATE === */}
      {/* Top panel — frequency band + signal */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px 4px', borderBottom: `1px solid ${COLORS.ash}10`,
      }}>
        {/* Frequency display (green LCD style) */}
        <div style={{
          background: '#0a1a0a', border: `1px solid #1a3a1a`,
          padding: '3px 8px', display: 'flex', alignItems: 'baseline', gap: 4,
          boxShadow: isPlaying ? `0 0 8px #0f3f0f40` : 'none',
        }}>
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 14,
            color: isPlaying ? '#4aff4a' : '#1a4a1a', letterSpacing: 1,
            textShadow: isPlaying ? '0 0 6px #4aff4a80' : 'none',
            transition: 'all 0.4s',
          }}>{fakeFreq}</span>
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 7,
            color: isPlaying ? '#4aff4a80' : '#1a4a1a', letterSpacing: 1,
          }}>MHz</span>
        </div>

        {/* Signal strength bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              width: 3, height: 3 + i * 2.5,
              background: isPlaying && i <= signalBars
                ? (i <= 3 ? '#4aff4a' : i === 4 ? COLORS.ember : COLORS.crimson)
                : COLORS.ash + '20',
              borderRadius: 1,
              transition: 'background 0.15s',
              boxShadow: isPlaying && i <= signalBars ? `0 0 3px ${i <= 3 ? '#4aff4a' : COLORS.crimson}40` : 'none',
            }} />
          ))}
        </div>
      </div>

      {/* VU METER — analog needle gauge */}
      <div style={{
        padding: '8px 10px 4px', display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          width: '100%', height: 36, position: 'relative',
          background: '#0a0906', border: `1px solid ${COLORS.ash}15`,
          borderRadius: 2, overflow: 'hidden',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
        }}>
          {/* VU scale markings */}
          <div style={{
            position: 'absolute', top: 4, left: 0, right: 0,
            display: 'flex', justifyContent: 'space-between',
            padding: '0 8px',
          }}>
            {['-20', '-10', '-7', '-5', '-3', '0', '+3'].map((label, i) => (
              <span key={i} style={{
                fontFamily: "'Space Mono', monospace", fontSize: 6,
                color: i >= 5 ? COLORS.crimson + '80' : COLORS.ash + '50',
                letterSpacing: 0,
              }}>{label}</span>
            ))}
          </div>

          {/* VU tick marks */}
          <div style={{
            position: 'absolute', top: 14, left: 8, right: 8,
            height: 1, display: 'flex', justifyContent: 'space-between',
          }}>
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} style={{
                width: 1, height: i % 5 === 0 ? 6 : 3,
                background: i >= 17 ? COLORS.crimson + '60' : COLORS.ash + '30',
              }} />
            ))}
          </div>

          {/* Needle */}
          <div style={{
            position: 'absolute', bottom: 2, left: '50%',
            width: 2, height: 22,
            background: `linear-gradient(to top, ${COLORS.ember}, ${COLORS.crimson})`,
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${needleAngle}deg)`,
            transition: isPlaying ? 'transform 0.08s ease-out' : 'transform 0.5s ease',
            borderRadius: '1px 1px 0 0',
            boxShadow: isPlaying ? `0 0 4px ${COLORS.ember}60` : 'none',
          }} />

          {/* Needle pivot */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 6, height: 6, borderRadius: '50%',
            background: '#2a2218', border: `1px solid ${COLORS.ember}40`,
          }} />

          {/* VU label */}
          <div style={{
            position: 'absolute', bottom: 2, right: 6,
            fontFamily: "'Space Mono', monospace", fontSize: 6,
            color: COLORS.ember + '40', letterSpacing: 2,
          }}>VU</div>
        </div>
      </div>

      {/* Tuning band / progress bar */}
      <div style={{ padding: '4px 10px 2px' }}>
        {/* Frequency band scale */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginBottom: 2,
          padding: '0 2px',
        }}>
          {['55', '65', '76', '88', '100', '108'].map((f, i) => (
            <span key={i} style={{
              fontFamily: "'Space Mono', monospace", fontSize: 6,
              color: COLORS.ash + '35', letterSpacing: 0,
            }}>{f}</span>
          ))}
        </div>

        {/* Progress / tuning dial — draggable */}
        <div ref={progressRef} onMouseDown={handleProgressDown} onTouchStart={handleTouchStart}
          style={{
            height: 10, background: '#0a0906',
            cursor: isDragging ? 'grabbing' : 'pointer', position: 'relative',
            border: `1px solid ${COLORS.ash}15`, borderRadius: 1,
            touchAction: 'none',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
            padding: '2px 0',
          }}
        >
          {/* Filled portion — glowing green */}
          <div style={{
            height: '100%', width: `${pct}%`,
            background: `linear-gradient(90deg, #1a4a1a, #4aff4a80)`,
            transition: 'width 0.1s linear', borderRadius: 1,
          }} />

          {/* Tuning indicator (draggable handle) */}
          <div style={{
            position: 'absolute', top: -4, bottom: -4,
            left: `calc(${pct}% - 5px)`, width: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            zIndex: 2,
          }}>
            <div style={{
              width: 3, height: '100%',
              background: COLORS.crimson,
              boxShadow: isPlaying ? `0 0 8px ${COLORS.crimson}` : `0 0 4px ${COLORS.crimson}60`,
            }} />
          </div>
        </div>
      </div>

      {/* Controls — military radio style */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px 8px',
      }}>
        {/* Time counter (amber LED) */}
        <div style={{
          background: '#0c0806', border: `1px solid ${COLORS.ember}25`,
          padding: '2px 6px', minWidth: 48,
          fontFamily: "'Space Mono', monospace", fontSize: 11,
          color: isPlaying ? COLORS.ember : COLORS.ember + '50',
          letterSpacing: 2, textAlign: 'center',
          textShadow: isPlaying ? `0 0 4px ${COLORS.ember}60` : 'none',
          boxShadow: `inset 0 1px 3px rgba(0,0,0,0.4)`,
        }}>{formatTime(currentTime)}</div>

        {/* Transport buttons — chunky toggle switches */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {/* REW */}
          <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10); }}
            style={{
              background: '#1a1610', border: `1px solid ${COLORS.ash}25`,
              color: COLORS.ash, fontFamily: "'Space Mono', monospace",
              fontSize: 8, cursor: 'pointer', padding: '5px 6px',
              lineHeight: 1, transition: 'all 0.2s', letterSpacing: 1,
              borderRadius: 2,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.03)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.ember; e.currentTarget.style.color = COLORS.ember; e.currentTarget.style.background = '#2a2218'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '25'; e.currentTarget.style.color = COLORS.ash; e.currentTarget.style.background = '#1a1610'; }}
          >◄◄</button>

          {/* PLAY/STOP — big center toggle */}
          <button onClick={togglePlay}
            style={{
              background: isPlaying
                ? `radial-gradient(circle, ${COLORS.crimson}30, #1a0808)`
                : `radial-gradient(circle, ${COLORS.ember}15, #1a1610)`,
              border: `2px solid ${isPlaying ? COLORS.crimson : COLORS.ember}80`,
              color: isPlaying ? COLORS.crimson : COLORS.ember,
              fontFamily: "'Space Mono', monospace",
              fontSize: 12, cursor: 'pointer',
              width: 36, height: 28, borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isPlaying
                ? `0 0 12px ${COLORS.crimson}30, inset 0 1px 3px rgba(0,0,0,0.4)`
                : `0 0 8px ${COLORS.ember}10, inset 0 1px 3px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.03)`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >{isPlaying ? '■' : '▶'}</button>

          {/* FWD */}
          <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 10); }}
            style={{
              background: '#1a1610', border: `1px solid ${COLORS.ash}25`,
              color: COLORS.ash, fontFamily: "'Space Mono', monospace",
              fontSize: 8, cursor: 'pointer', padding: '5px 6px',
              lineHeight: 1, transition: 'all 0.2s', letterSpacing: 1,
              borderRadius: 2,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.03)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.ember; e.currentTarget.style.color = COLORS.ember; e.currentTarget.style.background = '#2a2218'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '25'; e.currentTarget.style.color = COLORS.ash; e.currentTarget.style.background = '#1a1610'; }}
          >►►</button>
        </div>

        {/* Duration counter */}
        <div style={{
          background: '#0c0806', border: `1px solid ${COLORS.ash}15`,
          padding: '2px 6px', minWidth: 48,
          fontFamily: "'Space Mono', monospace", fontSize: 11,
          color: COLORS.ash + '60', letterSpacing: 2, textAlign: 'center',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
        }}>{formatTime(duration)}</div>
      </div>

      {/* Bottom status strip */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '3px 10px 4px',
        borderTop: `1px solid ${COLORS.ash}08`,
        background: '#0a0906',
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: 7,
          color: COLORS.ash + '30', letterSpacing: 2, textTransform: 'uppercase',
        }}>FIELD UNIT MK-IV</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            background: isPlaying ? '#4aff4a' : COLORS.ash + '20',
            boxShadow: isPlaying ? '0 0 6px #4aff4a80' : 'none',
            transition: 'all 0.3s',
          }} />
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 7,
            color: isPlaying ? '#4aff4a90' : COLORS.ash + '30',
            letterSpacing: 2,
          }}>{isPlaying ? 'RECEIVING' : 'STANDBY'}</span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CRT VIDEO MODAL — Old TV overlay effect
// ═══════════════════════════════════════════════════════════════

const CRTVideoModal = ({ tape, onClose }) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showStatic, setShowStatic] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '00:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const t = setTimeout(() => setShowStatic(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (videoRef.current && !showStatic) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [showStatic]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) { setShowControls(true); if (hideTimer.current) clearTimeout(hideTimer.current); }
    else resetHideTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isPlaying, resetHideTimer]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); }
    else { videoRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const seekTo = useCallback((clientX) => {
    if (!progressRef.current || !videoRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  }, [duration]);

  const handleProgressDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    seekTo(e.clientX);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    seekTo(e.touches[0].clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => seekTo(e.clientX);
    const handleUp = () => setIsDragging(false);
    const handleTouchMove = (e) => { e.preventDefault(); seekTo(e.touches[0].clientX); };
    const handleTouchEnd = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); window.removeEventListener('touchmove', handleTouchMove); window.removeEventListener('touchend', handleTouchEnd); };
  }, [isDragging, seekTo]);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const btnStyle = {
    background: 'transparent', border: `1px solid ${COLORS.ash}30`,
    color: COLORS.ash, fontFamily: "'Space Mono', monospace",
    cursor: 'pointer', transition: 'all 0.2s', borderRadius: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'crtPowerOn 0.3s ease-out',
        cursor: 'pointer',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        onMouseMove={resetHideTimer}
        style={{
          position: 'relative',
          maxWidth: 900, width: '95vw',
          background: '#000',
          border: `3px solid ${COLORS.ash}40`,
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: `0 0 80px rgba(0,0,0,0.8), 0 0 40px ${COLORS.crimson}10, inset 0 0 60px rgba(0,0,0,0.5)`,
          cursor: 'default',
        }}
      >
        {/* TV outer bezel */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, borderRadius: 8, boxShadow: 'inset 0 0 100px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
        {/* Scanlines */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 11, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)', pointerEvents: 'none' }} />
        {/* Scanline sweep */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 12, background: 'linear-gradient(transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)', backgroundSize: '100% 4px', animation: 'crtScanline 8s linear infinite', pointerEvents: 'none' }} />
        {/* Flicker */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 13, animation: 'crtFlicker 0.15s infinite', pointerEvents: 'none' }} />
        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 14, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />
        {/* Aberration */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 15, boxShadow: 'inset 3px 0 8px rgba(255,0,0,0.05), inset -3px 0 8px rgba(0,100,255,0.05)', pointerEvents: 'none' }} />

        {/* Static noise */}
        {showStatic && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.6, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`, backgroundSize: '128px 128px', animation: 'crtStatic 0.1s steps(5) infinite' }} />
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: COLORS.ash, letterSpacing: 4, zIndex: 1, animation: 'blink 0.5s infinite' }}>LOADING SIGNAL...</div>
          </div>
        )}

        {/* Top bar — tape info + REC + close */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 18,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
          padding: '12px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          opacity: showControls ? 1 : 0, transition: 'opacity 0.4s',
          pointerEvents: showControls ? 'auto' : 'none',
        }}>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.crimson, letterSpacing: 2 }}>{tape.tape_id}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: COLORS.bone, letterSpacing: 3, marginTop: 2 }}>{tape.title}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            {/* REC indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.crimson, boxShadow: `0 0 8px ${COLORS.crimson}`, animation: 'blink 1.5s infinite' }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.crimson, letterSpacing: 2 }}>REC</span>
            </div>
            {/* Close button — under REC */}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
              ...btnStyle, width: 28, height: 28, fontSize: 14,
              background: 'rgba(0,0,0,0.5)', border: `1px solid ${COLORS.crimson}50`,
              color: COLORS.crimson, zIndex: 20, position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.crimson + '30'; e.currentTarget.style.boxShadow = `0 0 10px ${COLORS.crimson}30`; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.boxShadow = 'none'; }}
            >×</button>
          </div>
        </div>

        {/* Click-to-play/pause overlay on video */}
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute', inset: 0, zIndex: 16,
            cursor: 'pointer',
          }}
        >
          {/* Big center play button when paused */}
          {!isPlaying && !showStatic && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 64, height: 64, borderRadius: '50%',
              background: `${COLORS.crimson}80`,
              border: `2px solid ${COLORS.crimson}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 30px ${COLORS.crimson}40`,
              transition: 'all 0.3s',
            }}>
              <span style={{ color: '#fff', fontSize: 26, marginLeft: 4 }}>▶</span>
            </div>
          )}
        </div>

        {/* Custom controls bar — bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 17,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)',
          padding: '24px 12px 10px',
          opacity: showControls ? 1 : 0, transition: 'opacity 0.4s',
          pointerEvents: showControls ? 'auto' : 'none',
        }}>
          {/* Progress bar — draggable */}
          <div
            ref={progressRef}
            onMouseDown={handleProgressDown}
            onTouchStart={handleTouchStart}
            style={{
              height: 6, background: COLORS.ash + '15',
              cursor: isDragging ? 'grabbing' : 'pointer',
              position: 'relative', marginBottom: 10, borderRadius: 3,
              touchAction: 'none',
            }}
          >
            {/* Buffered look */}
            <div style={{
              position: 'absolute', height: '100%', width: '100%',
              background: COLORS.ash + '10', borderRadius: 3,
            }} />
            {/* Played portion */}
            <div style={{
              height: '100%', width: `${pct}%`,
              background: `linear-gradient(90deg, ${COLORS.crimson}90, ${COLORS.crimson})`,
              borderRadius: 3, position: 'relative', zIndex: 1,
            }}>
              {/* Scrub handle */}
              <div style={{
                position: 'absolute', right: -6, top: -5,
                width: 16, height: 16, borderRadius: '50%',
                background: COLORS.crimson,
                border: '3px solid #000',
                boxShadow: `0 0 8px ${COLORS.crimson}60`,
                cursor: isDragging ? 'grabbing' : 'grab',
              }} />
            </div>
          </div>

          {/* Buttons row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Play/Pause */}
            <button onClick={togglePlay} style={{
              ...btnStyle, width: 34, height: 28, fontSize: 13,
              border: `1px solid ${isPlaying ? COLORS.crimson : COLORS.bone}50`,
              color: isPlaying ? COLORS.crimson : COLORS.bone,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = (isPlaying ? COLORS.crimson : COLORS.bone) + '20'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >{isPlaying ? '▮▮' : '▶'}</button>

            {/* Rewind 10s */}
            <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10); }}
              style={{ ...btnStyle, padding: '4px 6px', fontSize: 9, letterSpacing: 1 }}
              onMouseEnter={e => { e.currentTarget.style.color = COLORS.bone; e.currentTarget.style.borderColor = COLORS.bone + '60'; }}
              onMouseLeave={e => { e.currentTarget.style.color = COLORS.ash; e.currentTarget.style.borderColor = COLORS.ash + '30'; }}
            >◄10</button>

            {/* Forward 10s */}
            <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime + 10); }}
              style={{ ...btnStyle, padding: '4px 6px', fontSize: 9, letterSpacing: 1 }}
              onMouseEnter={e => { e.currentTarget.style.color = COLORS.bone; e.currentTarget.style.borderColor = COLORS.bone + '60'; }}
              onMouseLeave={e => { e.currentTarget.style.color = COLORS.ash; e.currentTarget.style.borderColor = COLORS.ash + '30'; }}
            >10►</button>

            {/* Time display */}
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 11,
              color: COLORS.crimson, letterSpacing: 1, marginLeft: 4,
              textShadow: `0 0 6px ${COLORS.crimson}40`,
            }}>
              {formatTime(currentTime)}
              <span style={{ color: COLORS.ash + '60', margin: '0 4px' }}>/</span>
              <span style={{ color: COLORS.ash }}>{formatTime(duration)}</span>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Tape info */}
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: COLORS.ash + '50', letterSpacing: 2, marginRight: 4 }}>
              {tape.date || '???'} • [{tape.status}]
            </div>

            {/* Mute */}
            <button onClick={toggleMute} style={{
              ...btnStyle, padding: '4px 8px', fontSize: 11,
              color: isMuted ? COLORS.crimson : COLORS.ash,
              border: `1px solid ${isMuted ? COLORS.crimson : COLORS.ash}30`,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = COLORS.bone; e.currentTarget.style.borderColor = COLORS.bone + '60'; }}
            onMouseLeave={e => { e.currentTarget.style.color = isMuted ? COLORS.crimson : COLORS.ash; e.currentTarget.style.borderColor = (isMuted ? COLORS.crimson : COLORS.ash) + '30'; }}
            >{isMuted ? '🔇' : '🔊'}</button>
          </div>
        </div>

        {/* Video element — no native controls */}
        <video
          ref={videoRef}
          src={tape.video_url}
          onTimeUpdate={() => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
          onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
          onLoadedData={() => setIsLoaded(true)}
          onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{
            width: '100%',
            display: 'block',
            filter: 'contrast(1.1) brightness(0.95) saturate(0.85)',
          }}
        />
      </div>

      {/* CRT keyframes */}
      <style>{`
        @keyframes crtPowerOn {
          0% { opacity: 0; transform: scaleY(0.01) scaleX(0.8); }
          40% { opacity: 1; transform: scaleY(0.01) scaleX(0.8); }
          60% { transform: scaleY(1.1) scaleX(0.95); }
          80% { transform: scaleY(0.98) scaleX(1.02); }
          100% { transform: scaleY(1) scaleX(1); }
        }
        @keyframes crtScanline {
          0% { background-position: 0 -100%; }
          100% { background-position: 0 100%; }
        }
        @keyframes crtFlicker {
          0% { opacity: 0.97; }
          50% { opacity: 1; }
          100% { opacity: 0.98; }
        }
        @keyframes crtStatic {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-5%, 5%); }
          40% { transform: translate(3%, -3%); }
          60% { transform: translate(-2%, 2%); }
          80% { transform: translate(4%, -4%); }
          100% { transform: translate(-1%, 1%); }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TAPES PAGE - CORRUPTED ARCHIVE 
// ═══════════════════════════════════════════════════════════════

export const TapesPage = () => {
  const [activePuzzle, setActivePuzzle] = useState(null);
  const [activePuzzleContentId, setActivePuzzleContentId] = useState(null); // tracks which content the puzzle unlocks
  const [hoveredSecret, setHoveredSecret] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [recordingsLoading, setRecordingsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [showSpectral, setShowSpectral] = useState(false);

  useEffect(() => {
    const loadRecordings = async () => {
      setRecordingsLoading(true);
      const data = await getAllRecordings();
      setRecordings(data);
      setRecordingsLoading(false);
    };
    const loadDocuments = async () => {
      setDocumentsLoading(true);
      const data = await getAllDocuments();
      setDocuments(data);
      setDocumentsLoading(false);
    };
    loadRecordings();
    loadDocuments();
  }, []);

  const { 
    isPuzzleAvailable,
    isPuzzleCompleted,
  } = useProgression();

  const {
    markPuzzleComplete,
    isPuzzleEventComplete,
    getCompletedCount,
    getTotalPuzzles,
    currentEvent,
  } = useGlobalEvent();

  const { 
    tapes,
    isTapeUnlocked, 
    getTapeUnlockInfo, 
    unlockTapeGlobal,
    loading: tapesLoading 
  } = useTapeUnlocks();

  // Map puzzles to their reward tapes
  const puzzleToTapeMap = {
    passwordTerminal: 'TAPE-001',
    memoryGame: 'TAPE-002',
  };

  // Enhanced puzzle completion handler with global event tracking
  const handlePuzzleSuccess = async (puzzleId) => {
    // Mark as completed for global event progress
    markPuzzleComplete(puzzleId);

    const tapeId = puzzleToTapeMap[puzzleId];
    
    if (tapeId && !isTapeUnlocked(tapeId)) {
      let userId = localStorage.getItem('investigator_id');
      if (!userId) {
        userId = `INV-${Date.now()}`;
        localStorage.setItem('investigator_id', userId);
      }

      const result = await unlockTapeGlobal(tapeId, userId, 'puzzle_completion');
      
      if (result.success) {
        console.log(`Tape ${tapeId} unlocked globally!`);
      }
    }
    
    handleClosePuzzle();
  };

  const puzzleComponents = {
    passwordTerminal: PasswordTerminal,
    memoryGame: MemoryGame,
    morseDecoder: MorseDecoder,
    frequencyTuner: FrequencyTuner,
    waveformMatch: WaveformMatch,
    signalScramble: SignalScramble,
    wireSplice: WireSplice,
    redactionReveal: RedactionReveal,
    fileDecryptor: FileDecryptor,
    keypadLock: KeypadLock,
    patternGrid: PatternGrid,
    jigsawFragment: JigsawFragment,
  };

  // Puzzle IDs assigned to recordings by index (0-4)
  const recordingPuzzles = ['morseDecoder', 'frequencyTuner', 'waveformMatch', 'signalScramble', 'wireSplice'];
  // Puzzle IDs assigned to documents by index (0-4)
  const documentPuzzles = ['redactionReveal', 'fileDecryptor', 'keypadLock', 'patternGrid', 'jigsawFragment'];

  // Local unlock state from Zustand store
  const { unlockedContent, unlockContent, completePuzzle: storePuzzleComplete } = useGameStore();

  const isLocallyUnlocked = (contentId) => unlockedContent.includes(contentId);

  // Handle local puzzle success for recordings/documents
  const handleLocalPuzzleSuccess = (puzzleId, contentId) => {
    storePuzzleComplete(puzzleId);
    unlockContent(contentId);
    markPuzzleComplete(puzzleId);
    handleClosePuzzle();
  };

  // Open a local puzzle for a recording or document
  const openLocalPuzzle = (puzzleId, contentId) => {
    const puzzle = PUZZLE_REGISTRY[puzzleId];
    if (puzzle) {
      setActivePuzzle(puzzle);
      setActivePuzzleContentId(contentId);
    }
  };

  const handleSecretClick = (puzzleId) => {
    const puzzle = PUZZLE_REGISTRY[puzzleId];
    if (puzzle && isPuzzleAvailable(puzzle.id) && puzzle.enabled) {
      setActivePuzzle(puzzle);
    }
  };

  const handleClosePuzzle = () => {
    setActivePuzzle(null);
    setActivePuzzleContentId(null);
  };

  // --- INLINE TEXT TRIGGER ---
  const SecretTrigger = ({ puzzleId, children, style = {} }) => {
    const puzzle = PUZZLE_REGISTRY[puzzleId];
    const isAvailable = isPuzzleAvailable(puzzleId);
    const isCompleted = isPuzzleCompleted(puzzleId);
    const isHovered = hoveredSecret === puzzleId;

    if (!puzzle || !puzzle.enabled) return children;

    return (
      <span
        onClick={() => handleSecretClick(puzzleId)}
        onMouseEnter={() => setHoveredSecret(puzzleId)}
        onMouseLeave={() => setHoveredSecret(null)}
        style={{
          cursor: isAvailable ? 'crosshair' : 'default',
          position: 'relative',
          display: 'inline-block',
          transition: 'all 0.2s ease',
          ...(isHovered && isAvailable && {
            color: COLORS.bg,
            background: COLORS.crimson,
            textShadow: '0 0 5px rgba(255,0,0,0.8)',
            transform: 'scale(1.05)',
          }),
          ...(isCompleted && {
            opacity: 0.3,
            textDecoration: 'line-through',
            filter: 'blur(1px)',
          }),
          ...style,
        }}
      >
        {children}
      </span>
    );
  };

  const ActivePuzzleComponent = activePuzzle ? puzzleComponents[activePuzzle.id] : null;

  // ═══ Unknown / Placeholder Cassette ═══
  const UnknownTape = () => (
    <div style={{
      padding: 14,
      background: '#080808',
      border: `2px dashed ${COLORS.ash}40`,
      borderRadius: 6,
      boxShadow: '4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      opacity: 0.4,
      transition: 'opacity 0.3s',
      cursor: 'default',
      minHeight: 200,
    }}>
      {/* Reel window — dark */}
      <div style={{
        background: '#000',
        height: 64,
        borderRadius: 3,
        border: `1px solid ${COLORS.ash}30`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px dashed ${COLORS.ash}40` }} />
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px dashed ${COLORS.ash}40` }} />
      </div>
      {/* Label — just a ? */}
      <div style={{
        background: '#1a1a1a',
        padding: '16px 10px',
        borderRadius: 2,
        border: '1px solid #222',
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 36,
          color: COLORS.bone,
          letterSpacing: 4,
          lineHeight: 1,
        }}>?</div>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: COLORS.bone,
          opacity: 0.5,
          letterSpacing: 2,
          marginTop: 6,
        }}>CLASSIFIED</div>
      </div>
    </div>
  );

  // ═══ Physical Cassette Tape ═══
  const PhysicalTape = ({ id, title, date, length, status, isCorrupt, videoUrl, onPlay, children }) => {
    const unlocked = isTapeUnlocked(id);
    const unlockInfo = getTapeUnlockInfo(id);
    const hasVideo = !!videoUrl;
    
    return (
      <div
        onClick={() => unlocked && hasVideo && onPlay?.()}
        style={{
          padding: 14,
          background: '#0a0a0a',
          border: `2px solid ${unlocked ? COLORS.flora : COLORS.ash}40`,
          borderRadius: 6,
          boxShadow: unlocked 
            ? `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 16px ${COLORS.flora}30`
            : '4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          opacity: unlocked ? (isCorrupt ? 0.8 : 1) : 0.7,
          minHeight: 200,
          cursor: unlocked && hasVideo ? 'pointer' : 'default',
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => { if (unlocked && hasVideo) e.currentTarget.style.boxShadow = `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 24px ${COLORS.crimson}30`; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = unlocked ? `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 16px ${COLORS.flora}30` : '4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8)'; }}
      >
        {/* Global Unlock Badge */}
        {unlocked && (
          <div style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: COLORS.flora,
            color: COLORS.bg,
            padding: '2px 6px',
            borderRadius: 2,
            fontSize: 10,
            fontFamily: "'Space Mono', monospace",
            fontWeight: 'bold',
            letterSpacing: 1,
            boxShadow: `0 0 10px ${COLORS.flora}60`,
            zIndex: 10,
          }}>
            UNLOCKED
          </div>
        )}
        
        {/* Reel window */}
        <div style={{
          background: '#000',
          height: 64,
          borderRadius: 3,
          border: `1px solid ${COLORS.ash}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 28,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', bottom: 8, width: '100%', height: 1, background: COLORS.ash, opacity: 0.2 }} />
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px dashed ${unlocked ? COLORS.flora : COLORS.ash}`, opacity: 0.5, animation: isCorrupt ? 'none' : 'spin 10s linear infinite' }} />
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px dashed ${unlocked ? COLORS.flora : COLORS.ash}`, opacity: 0.5 }} />
          {/* Play icon overlay for video tapes — only when unlocked */}
          {unlocked && hasVideo && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              opacity: 0, transition: 'opacity 0.3s',
            }}
            className="tape-play-overlay"
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `${COLORS.crimson}cc`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${COLORS.crimson}60`,
              }}>
                <span style={{ color: '#fff', fontSize: 16, marginLeft: 3 }}>▶</span>
              </div>
            </div>
          )}
        </div>

        {/* Label */}
        <div style={{
          background: COLORS.bone,
          padding: '12px 12px',
          borderRadius: 2,
          flex: 1,
          border: '1px solid #999',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.08)',
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 15px, ${COLORS.ash}30 15px, ${COLORS.ash}30 16px)`,
          backgroundPosition: '0 6px',
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: COLORS.bg,
            fontWeight: 'bold',
            borderBottom: `1px solid ${COLORS.bg}`,
            paddingBottom: 3,
            marginBottom: 5,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>{id}</span>
            <span style={{ color: isCorrupt ? COLORS.crimson : COLORS.bg }}>[{unlocked ? status : 'SEALED'}]</span>
          </div>
          
          {unlocked ? (
            <>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                color: COLORS.bg,
                lineHeight: 1.5,
                fontWeight: 'bold',
              }}>
                <div>{title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {children || date || '---'}
                </div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{length}</div>
              </div>

              {/* Unlock Info */}
              {unlockInfo && (
                <div style={{
                  marginTop: 5,
                  paddingTop: 5,
                  borderTop: `1px dashed ${COLORS.bg}`,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  color: COLORS.bg,
                  opacity: 0.7,
                }}>
                  <div>BY: {unlockInfo.unlocked_by || 'ANON'}</div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              color: COLORS.bg,
              lineHeight: 1.5,
              fontWeight: 'bold',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: 4,
              opacity: 0.6,
            }}>
              <div style={{ fontSize: 18 }}>🔒</div>
              <div style={{ fontSize: 10, letterSpacing: 2 }}>SOLVE PUZZLE</div>
              <div style={{ fontSize: 9, letterSpacing: 1, opacity: 0.6 }}>TO UNSEAL THIS TAPE</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.bone,
      padding: 'clamp(100px, 15vw, 160px) clamp(12px, 4vw, 40px) clamp(40px, 8vw, 100px)',
      position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* Spectral Analysis — Global Event Puzzle */}
      <SpectralAnalysis
        isOpen={showSpectral}
        onClose={() => setShowSpectral(false)}
        onSuccess={() => { markPuzzleComplete('spectralAnalysis'); setShowSpectral(false); }}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: 60, borderBottom: `2px solid ${COLORS.ash}`, paddingBottom: 20 }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(40px, 8vw, 80px)',
            letterSpacing: 8,
            color: COLORS.bone,
            margin: 0,
            textShadow: `2px 2px 0 ${COLORS.crimson}, -2px -2px 0 ${COLORS.signal}`,
          }}>
            TAPES
          </h1>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 14,
            color: COLORS.bone,
            letterSpacing: 2,
            marginTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>MAGNETIC MEDIA REPOSITORY</span>
            <span style={{ color: COLORS.crimson, animation: 'blink 2s infinite' }}>● REC</span>
          </div>

          {/* Hidden Spectral Analysis trigger */}
          <div
            onClick={() => !isPuzzleEventComplete('spectralAnalysis') && setShowSpectral(true)}
            style={{
              marginTop: 14,
              padding: '10px 16px',
              background: '#060606',
              border: `1px dashed ${isPuzzleEventComplete('spectralAnalysis') ? COLORS.flora + '40' : COLORS.flora + '20'}`,
              cursor: isPuzzleEventComplete('spectralAnalysis') ? 'default' : 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {isPuzzleEventComplete('spectralAnalysis') ? (
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.flora, letterSpacing: 2 }}>
                ✓ ANOMALOUS FREQUENCY IDENTIFIED — SPECTRUM LOCKED
              </div>
            ) : (
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                color: COLORS.flora, letterSpacing: 2, opacity: 0.6,
              }}>
                ⚡ ANOMALOUS FREQUENCY DETECTED ON TAPE HEADERS — [ANALYZE]
              </div>
            )}
          </div>
        </div>

        {/* Tape Grid — responsive */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 16,
        }}>
          {tapesLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                padding: 10,
                background: '#080808',
                border: `2px dashed ${COLORS.ash}20`,
                borderRadius: 6,
                height: 130,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.3,
              }}>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13,
                  color: COLORS.ash,
                  letterSpacing: 2,
                  animation: 'blink 1.5s infinite',
                }}>LOADING...</span>
              </div>
            ))
          ) : tapes.length === 0 ? (
            // Fallback when DB is empty — show 6 unknown tapes
            Array.from({ length: 6 }).map((_, i) => (
              <UnknownTape key={i} />
            ))
          ) : (
            // Render tapes from database
            tapes.map((tape) => (
              tape.is_visible ? (
                <PhysicalTape
                  key={tape.tape_id}
                  id={tape.tape_id}
                  title={tape.title}
                  date={tape.date}
                  length={tape.length}
                  status={tape.status}
                  isCorrupt={tape.is_corrupt}
                  videoUrl={tape.video_url}
                  onPlay={() => setActiveVideo(tape)}
                >
                  {/* Puzzle trigger for tapes that have one */}
                  {tape.puzzle_trigger && (
                    <SecretTrigger puzzleId={tape.puzzle_trigger}>
                      <span style={{
                        color: COLORS.crimson,
                        background: 'transparent',
                        padding: '0 2px',
                        border: `1px solid ${COLORS.crimson}`,
                        textDecoration: 'line-through',
                        fontSize: 12,
                      }}>
                        [REDACTED]1947
                      </span>
                    </SecretTrigger>
                  )}
                </PhysicalTape>
              ) : (
                <UnknownTape key={tape.tape_id} />
              )
            ))
          )}
        </div>

        {/* ═══ VOICE RECORDINGS ═══ */}
        <div style={{ marginTop: 80, borderBottom: `2px solid ${COLORS.ash}`, paddingBottom: 20, marginBottom: 30 }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(28px, 5vw, 48px)',
            letterSpacing: 6,
            color: COLORS.bone,
            margin: 0,
            textShadow: `2px 2px 0 ${COLORS.crimson}40`,
          }}>
            VOICE RECORDINGS
          </h2>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 14,
            color: COLORS.ash,
            letterSpacing: 2,
            marginTop: 8,
          }}>
            RECOVERED AUDIO TRANSMISSIONS
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 16,
        }}>
          {recordingsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{
                padding: 14, background: '#080808',
                border: `2px dashed ${COLORS.ash}20`, borderRadius: 6,
                height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0.3,
              }}>
                <span style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 13,
                  color: COLORS.ash, letterSpacing: 2, animation: 'blink 1.5s infinite',
                }}>LOADING...</span>
              </div>
            ))
          ) : recordings.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`vr-${i}`} style={{
                padding: 14, background: '#080808',
                border: `2px dashed ${COLORS.ash}40`, borderRadius: 6,
                boxShadow: '4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8)',
                display: 'flex', flexDirection: 'column', gap: 10,
                opacity: 0.4, minHeight: 160, justifyContent: 'center', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
                  {[12, 24, 18, 32, 14, 28, 10, 20, 26, 16].map((h, j) => (
                    <div key={j} style={{ width: 3, height: h, background: COLORS.ash, opacity: 0.4, borderRadius: 1 }} />
                  ))}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: COLORS.bone, letterSpacing: 4 }}>?</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.bone, opacity: 0.5, letterSpacing: 2 }}>CLASSIFIED</div>
              </div>
            ))
          ) : (
            recordings.map((rec, recIndex) => {
              const puzzleId = recIndex < recordingPuzzles.length ? recordingPuzzles[recIndex] : null;
              const contentId = `recording_${rec.recording_id}`;
              const localUnlocked = !puzzleId || isLocallyUnlocked(contentId);
              
              return rec.is_visible && localUnlocked ? (
                <div key={rec.recording_id} style={{
                  padding: 14, background: '#0a0a0a',
                  border: `2px solid ${COLORS.ember}`,
                  borderRadius: 6,
                  boxShadow: `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 12px ${COLORS.ember}20`,
                  display: 'flex', flexDirection: 'column', gap: 10,
                  minHeight: 160,
                }}>
                  {/* Waveform visual */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-end', gap: 3, height: 40,
                    justifyContent: 'center', padding: '8px 0',
                  }}>
                    {[12, 24, 18, 32, 14, 28, 10, 20, 26, 16, 22, 30, 15].map((h, j) => (
                      <div key={j} style={{
                        width: 3, height: h, background: COLORS.ember,
                        opacity: 0.7, borderRadius: 1,
                      }} />
                    ))}
                  </div>
                  {/* Info */}
                  <div style={{
                    background: '#1a1008', padding: '12px 10px', borderRadius: 2,
                    border: `1px solid ${COLORS.ember}30`, flex: 1,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  }}>
                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 9,
                      color: COLORS.ember, letterSpacing: 2, marginBottom: 4,
                    }}>{rec.recording_id}</div>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 18,
                      color: COLORS.bone, letterSpacing: 2, lineHeight: 1.2,
                    }}>{rec.title}</div>
                    {rec.description && (
                      <div style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 10,
                        color: COLORS.ash, marginTop: 6, lineHeight: 1.4,
                      }}>{rec.description.length > 60 ? rec.description.slice(0, 60) + '...' : rec.description}</div>
                    )}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', marginTop: 8,
                      fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash, letterSpacing: 1,
                    }}>
                      <span>{rec.date || '???'}</span>
                      <span>{rec.duration || '--:--'}</span>
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 8,
                      color: rec.status === 'DECLASSIFIED' ? COLORS.flora : rec.status === 'CORRUPTED' ? COLORS.crimson : COLORS.ash,
                      letterSpacing: 2, marginTop: 6,
                    }}>{rec.status}</div>
                  </div>
                  {/* Retro audio player */}
                  {rec.audio_url && (
                    <RetroAudioPlayer src={rec.audio_url} title={rec.title} recordingId={rec.recording_id} />
                  )}
                </div>
              ) : rec.is_visible && puzzleId && !localUnlocked ? (
                /* PUZZLE-LOCKED recording — visible but needs puzzle */
                <div key={rec.recording_id} onClick={() => openLocalPuzzle(puzzleId, contentId)} style={{
                  padding: 14, background: '#0a0806',
                  border: `2px solid ${COLORS.ember}40`, borderRadius: 6,
                  boxShadow: `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 8px ${COLORS.ember}10`,
                  display: 'flex', flexDirection: 'column', gap: 10,
                  minHeight: 160, justifyContent: 'center', alignItems: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.ember; e.currentTarget.style.boxShadow = `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 16px ${COLORS.ember}30`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ember + '40'; e.currentTarget.style.boxShadow = `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 8px ${COLORS.ember}10`; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
                    {[12, 24, 18, 32, 14, 28, 10, 20, 26, 16].map((h, j) => (
                      <div key={j} style={{ width: 3, height: h, background: COLORS.ember, opacity: 0.3, borderRadius: 1 }} />
                    ))}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: COLORS.ember, letterSpacing: 4 }}>🔒</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ember, letterSpacing: 2 }}>SOLVE PUZZLE TO UNLOCK</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: COLORS.ash, letterSpacing: 1 }}>
                    {PUZZLE_REGISTRY[puzzleId]?.name?.toUpperCase() || 'PUZZLE'}
                  </div>
                </div>
              ) : (
                <div key={rec.recording_id} style={{
                  padding: 14, background: '#080808',
                  border: `2px dashed ${COLORS.ash}40`, borderRadius: 6,
                  boxShadow: '4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8)',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  opacity: 0.4, minHeight: 160, justifyContent: 'center', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
                    {[12, 24, 18, 32, 14, 28, 10, 20, 26, 16].map((h, j) => (
                      <div key={j} style={{ width: 3, height: h, background: COLORS.ash, opacity: 0.4, borderRadius: 1 }} />
                    ))}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: COLORS.bone, letterSpacing: 4 }}>?</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.bone, opacity: 0.5, letterSpacing: 2 }}>CLASSIFIED</div>
                </div>
              );
            })
          )}
        </div>

        {/* ═══ DOCUMENTS ═══ */}
        <div style={{ marginTop: 80, borderBottom: `2px solid ${COLORS.ash}`, paddingBottom: 20, marginBottom: 30 }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(28px, 5vw, 48px)',
            letterSpacing: 6,
            color: COLORS.bone,
            margin: 0,
            textShadow: `2px 2px 0 ${COLORS.crimson}40`,
          }}>
            DOCUMENTS
          </h2>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 14,
            color: COLORS.ash,
            letterSpacing: 2,
            marginTop: 8,
          }}>
            DECLASSIFIED PARK RECORDS &amp; CORRESPONDENCE
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 16,
        }}>
          {documentsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{
                padding: 14, background: '#080808',
                border: `2px dashed ${COLORS.ash}20`, borderRadius: 6,
                height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0.3,
              }}>
                <span style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 13,
                  color: COLORS.ash, letterSpacing: 2, animation: 'blink 1.5s infinite',
                }}>LOADING...</span>
              </div>
            ))
          ) : documents.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`doc-${i}`} style={{
                padding: 14, background: '#080808',
                border: `2px dashed ${COLORS.ash}40`, borderRadius: 6,
                boxShadow: '4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8)',
                display: 'flex', flexDirection: 'column', gap: 8,
                opacity: 0.4, minHeight: 180, position: 'relative',
              }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 10px' }}>
                  {[70, 90, 55, 80, 40, 65].map((w, j) => (
                    <div key={j} style={{ width: `${w}%`, height: 2, background: COLORS.ash, opacity: 0.2, borderRadius: 1 }} />
                  ))}
                </div>
                <div style={{
                  borderTop: `1px solid ${COLORS.ash}20`, padding: '10px 10px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: COLORS.bone, letterSpacing: 3 }}>?</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.bone, opacity: 0.5, letterSpacing: 2 }}>CLASSIFIED</div>
                </div>
              </div>
            ))
          ) : (
            documents.map((doc, docIndex) => {
              const puzzleId = docIndex < documentPuzzles.length ? documentPuzzles[docIndex] : null;
              const contentId = `document_${doc.document_id}`;
              const localUnlocked = !puzzleId || isLocallyUnlocked(contentId);
              
              return doc.is_visible && localUnlocked ? (
                <div key={doc.document_id} style={{
                  padding: 14, background: '#0a0a0a',
                  border: `2px solid ${COLORS.crimson}`,
                  borderRadius: 6,
                  boxShadow: `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 12px ${COLORS.crimson}15`,
                  display: 'flex', flexDirection: 'column', gap: 8,
                  minHeight: 180, position: 'relative',
                }}>
                  {/* Document type badge */}
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    fontFamily: "'Space Mono', monospace", fontSize: 8,
                    color: COLORS.crimson, letterSpacing: 2,
                    background: COLORS.crimson + '15', padding: '3px 8px',
                    border: `1px solid ${COLORS.crimson}30`,
                  }}>{(doc.doc_type || 'REPORT').toUpperCase()}</div>

                  {/* Content preview */}
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column', gap: 8,
                    padding: '12px 10px',
                  }}>
                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 9,
                      color: COLORS.crimson, letterSpacing: 2,
                    }}>{doc.document_id}</div>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
                      color: COLORS.bone, letterSpacing: 2, lineHeight: 1.2,
                    }}>{doc.title}</div>
                    {doc.content && (
                      <div style={{
                        fontFamily: "'Crimson Text', serif", fontSize: 13,
                        color: COLORS.ash, lineHeight: 1.5, marginTop: 4,
                        overflow: 'hidden', maxHeight: 52,
                      }}>{doc.content.length > 100 ? doc.content.slice(0, 100) + '...' : doc.content}</div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{
                    borderTop: `1px solid ${COLORS.crimson}20`, padding: '10px 10px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 9,
                      color: COLORS.ash, letterSpacing: 1,
                    }}>{doc.date || '???'}</div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 8,
                      color: doc.status === 'DECLASSIFIED' ? COLORS.flora : doc.status === 'REDACTED' ? COLORS.crimson : COLORS.ash,
                      letterSpacing: 2,
                    }}>{doc.status}</div>
                  </div>

                  {/* File link */}
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 9,
                      color: COLORS.crimson, letterSpacing: 1, textDecoration: 'none',
                      padding: '6px 10px', borderTop: `1px solid ${COLORS.ash}15`,
                      display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = COLORS.bone}
                    onMouseLeave={e => e.currentTarget.style.color = COLORS.crimson}
                    >📄 VIEW DOCUMENT</a>
                  )}
                </div>
              ) : doc.is_visible && puzzleId && !localUnlocked ? (
                /* PUZZLE-LOCKED document — visible but needs puzzle */
                <div key={doc.document_id} onClick={() => openLocalPuzzle(puzzleId, contentId)} style={{
                  padding: 14, background: '#0a0806',
                  border: `2px solid ${COLORS.crimson}40`, borderRadius: 6,
                  boxShadow: `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 8px ${COLORS.crimson}10`,
                  display: 'flex', flexDirection: 'column', gap: 8,
                  minHeight: 180, justifyContent: 'center', alignItems: 'center',
                  cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.crimson; e.currentTarget.style.boxShadow = `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 16px ${COLORS.crimson}30`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.crimson + '40'; e.currentTarget.style.boxShadow = `4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8), 0 0 8px ${COLORS.crimson}10`; }}
                >
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 10px', justifyContent: 'center', alignItems: 'center' }}>
                    {[70, 90, 55, 80, 40].map((w, j) => (
                      <div key={j} style={{ width: `${w}%`, height: 2, background: COLORS.crimson, opacity: 0.15, borderRadius: 1 }} />
                    ))}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: COLORS.crimson, letterSpacing: 4 }}>🔒</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.crimson, letterSpacing: 2 }}>SOLVE PUZZLE TO UNLOCK</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: COLORS.ash, letterSpacing: 1, marginBottom: 8 }}>
                    {PUZZLE_REGISTRY[puzzleId]?.name?.toUpperCase() || 'PUZZLE'}
                  </div>
                </div>
              ) : (
                <div key={doc.document_id} style={{
                  padding: 14, background: '#080808',
                  border: `2px dashed ${COLORS.ash}40`, borderRadius: 6,
                  boxShadow: '4px 4px 0px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.8)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  opacity: 0.4, minHeight: 180, position: 'relative',
                }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 10px' }}>
                    {[70, 90, 55, 80, 40, 65].map((w, j) => (
                      <div key={j} style={{ width: `${w}%`, height: 2, background: COLORS.ash, opacity: 0.2, borderRadius: 1 }} />
                    ))}
                  </div>
                  <div style={{
                    borderTop: `1px solid ${COLORS.ash}20`, padding: '10px 10px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: COLORS.bone, letterSpacing: 3 }}>?</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.bone, opacity: 0.5, letterSpacing: 2 }}>CLASSIFIED</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Active Puzzle — renders its own full-screen modal */}
      {activePuzzle && ActivePuzzleComponent && (
        <ActivePuzzleComponent 
          puzzleId={activePuzzle.id}
          isOpen={true}
          onClose={handleClosePuzzle}
          onSuccess={() => {
            if (activePuzzleContentId) {
              handleLocalPuzzleSuccess(activePuzzle.id, activePuzzleContentId);
            } else {
              handlePuzzleSuccess(activePuzzle.id);
            }
          }}
        />
      )}

      {/* CRT Video Modal */}
      {activeVideo && activeVideo.video_url && (
        <CRTVideoModal tape={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        div:hover > .tape-play-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
};