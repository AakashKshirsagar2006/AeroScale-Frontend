import { useEffect, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');

/** Loops a countdown forever. Used for the decorative flash-sale timer in the hero. */
export function useCountdown(totalSeconds) {
  const [left, setLeft] = useState(totalSeconds);
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s <= 1 ? totalSeconds : s - 1)), 1000);
    return () => clearInterval(id);
  }, [totalSeconds]);
  return { h: pad(Math.floor(left / 3600)), m: pad(Math.floor((left % 3600) / 60)), s: pad(left % 60) };
}
