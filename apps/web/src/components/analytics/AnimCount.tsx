import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

const defaultFmt = (n: number) => n.toLocaleString('uz-UZ');

const AnimCount: React.FC<Props> = ({ value, duration = 900, formatter = defaultFmt, className, style }) => {
  const [display, setDisplay] = useState('0');
  const prevRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const target = Number(value) || 0;
    const from = prevRef.current;
    prevRef.current = target;

    if (target === 0 && from === 0) { setDisplay(formatter(0)); return; }

    const t0 = performance.now();
    function tick(now: number) {
      const p = Math.min((now - t0) / duration, 1);
      // Ease out cubic
      const e = 1 - Math.pow(1 - p, 3);
      const current = Math.round(from + (target - from) * e);
      setDisplay(formatter(current));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration, formatter]);

  return <span className={className} style={style}>{display}</span>;
};

export default AnimCount;
