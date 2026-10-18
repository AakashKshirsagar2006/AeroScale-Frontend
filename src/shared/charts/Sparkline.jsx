import { useId } from 'react';
import { smoothPath } from './scales';

/** Tiny trend line for tiles. values = number[]. Decorative, so it is hidden from screen readers. */
export function Sparkline({ values, color = '#ef4444', height = 40, className }) {
  const gid = `s${useId().replace(/:/g, '')}`;
  if (values.length < 2) return null;
  const W = 120;
  const max = Math.max(...values), min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1)) * W, y: 4 + (1 - (v - min) / span) * (height - 8) }));
  const line = smoothPath(pts);
  return (
    <svg aria-hidden viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className={className} style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.28" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient>
      </defs>
      <path d={`${line}L${W},${height}L0,${height}Z`} fill={`url(#${gid})`} className="animate-fade" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1" className="animate-draw" />
    </svg>
  );
}
