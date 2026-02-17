import { useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// FLOATING EMBERS — Ambient fire/flora particle background
// Sparse glowing points that drift and scatter from the cursor
// ═══════════════════════════════════════════════════════════════

const PARTICLE_COUNT = 35;
const MOUSE_RADIUS = 100;
const PUSH_FORCE = 0.6;

const PALETTE = [
  { r: 196, g: 30, b: 30 },    // crimson red
  { r: 0, g: 255, b: 102 },    // flora green
];

function createParticle(w, h) {
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 0.1 + 0.03;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: Math.random() * 1.5 + 0.8,
    baseAlpha: Math.random() * 0.4 + 0.3,
    alpha: 0,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.015 + 0.008,
    color,
    glowSize: Math.random() * 12 + 6,
    driftTimer: Math.random() * Math.PI * 2,
    driftSpeed: Math.random() * 0.002 + 0.0008,
  };
}

export function FloatingEmbers() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animId = useRef(null);
  const dpr = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    dpr.current = window.devicePixelRatio || 1;

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr.current;
      canvas.height = h * dpr.current;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr.current, 0, 0, dpr.current, 0, 0);

      // Re-init particles if needed
      if (particles.current.length === 0) {
        particles.current = Array.from({ length: PARTICLE_COUNT }, () => createParticle(w, h));
      }
    }

    resize();

    window.addEventListener('resize', resize);

    function handleMouseMove(e) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }

    function handleTouchMove(e) {
      if (e.touches.length > 0) {
        mouse.current.x = e.touches[0].clientX;
        mouse.current.y = e.touches[0].clientY;
      }
    }

    function handleMouseLeave() {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    function animate() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];

        // Pulse
        p.pulse += p.pulseSpeed;
        p.alpha = p.baseAlpha * (0.5 + 0.5 * Math.sin(p.pulse));

        // Random drift — gentle wandering
        p.driftTimer += p.driftSpeed;
        p.vx += Math.cos(p.driftTimer) * 0.006;
        p.vy += Math.sin(p.driftTimer * 0.7) * 0.006;

        // Mouse nudge — gentle push, not yeet
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * PUSH_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Friction — heavier so they don't fly away
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Clamp max speed
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 0.6) { p.vx *= 0.6 / spd; p.vy *= 0.6 / spd; }

        // Wrap edges
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) {
          p.y = h + 20;
          p.x = Math.random() * w;
        }
        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }

        // Draw glow
        const { r, g, b } = p.color;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowSize);
        grad.addColorStop(0, `rgba(${r},${g},${b},${p.alpha * 0.8})`);
        grad.addColorStop(0.3, `rgba(${r},${g},${b},${p.alpha * 0.3})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animId.current) cancelAnimationFrame(animId.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
