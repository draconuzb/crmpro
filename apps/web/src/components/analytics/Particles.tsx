import { useEffect, useRef } from 'react';
import { useThemeMode } from '../../contexts/ThemeContext';

const Particles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useThemeMode();

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    // Skip on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      c.style.display = 'none';
      return;
    }

    const ctx = c.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth, h = window.innerHeight;
    let animId: number | null = null;
    const N = window.innerWidth < 600 ? 18 : 35;
    const pts: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];

    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.3 + 0.4, a: Math.random() * 0.25 + 0.05,
      });
    }

    let vis = true;
    function draw() {
      if (!vis || !ctx) { animId = null; return; }
      ctx.clearRect(0, 0, w, h);
      const light = !isDark;
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = light ? `rgba(91,141,238,${p.a})` : `rgba(200,200,255,${p.a})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    const onVis = () => {
      vis = !document.hidden;
      if (vis && !animId) draw();
    };
    document.addEventListener('visibilitychange', onVis);
    draw();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="an-particles" aria-hidden="true" role="presentation" />;
};

export default Particles;
