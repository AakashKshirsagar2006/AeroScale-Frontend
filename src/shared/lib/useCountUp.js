import { useEffect, useRef, useState } from 'react';

/** Eases a number from its previous value to `target`. Skips the animation for people who asked for less motion. */
export function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const goal = Number(target) || 0;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { from.current = goal; setValue(goal); return undefined; }

    const begin = from.current;
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const v = begin + (goal - begin) * (1 - (1 - p) ** 4);
      from.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
