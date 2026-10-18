import { useId, useState } from 'react';
import { useWidth } from '@/shared/lib/useSize';
import { formatCompactPrice, formatPrice, formatShortDate, formatWeekday } from '@/shared/lib/format';
import { ChartTooltip } from './ChartTooltip';
import { labelIndexes, niceMax, smoothPath } from './scales';

const PAD = { l: 52, r: 14, t: 38, b: 28 };

/**
 * Smooth gradient area chart with a hover/touch crosshair.
 *   data = [{ date: Date, value: number, note?: string }]
 */
export function AreaChart({ data, height = 280, color = '#ef4444', formatValue = formatPrice, formatAxis = formatCompactPrice, label = 'Chart' }) {
  const [ref, width] = useWidth();
  const gid = `g${useId().replace(/:/g, '')}`;
  const [hover, setHover] = useState(null);

  const n = data.length;
  const innerW = Math.max(0, width - PAD.l - PAD.r);
  const innerH = height - PAD.t - PAD.b;
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)) * 1.05);
  const x = (i) => PAD.l + (n === 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v) => PAD.t + innerH - (v / max) * innerH;
  const pts = data.map((d, i) => ({ x: x(i), y: y(d.value) }));
  const line = smoothPath(pts);
  const area = n ? `${line}L${pts[n - 1].x},${PAD.t + innerH}L${pts[0].x},${PAD.t + innerH}Z` : '';
  const ticks = [0, 1, 2, 3, 4].map((k) => (max / 4) * k);
  const best = data.reduce((b, d, i) => (d.value > (data[b]?.value ?? -1) ? i : b), 0);

  const onMove = (e) => {
    if (!n) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left - PAD.l) / innerW;
    setHover(Math.min(n - 1, Math.max(0, Math.round(rel * (n - 1)))));
  };
  const active = hover ?? null;

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {width > 0 && n > 0 && (
        <>
          <svg width={width} height={height} role="img" aria-label={`${label}, ${n} points, highest ${formatValue(data[best].value)}`} className="overflow-visible">
            <defs>
              <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.32" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.l} x2={width - PAD.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray={t === 0 ? undefined : '3 5'} />
                <text x={PAD.l - 10} y={y(t) + 4} textAnchor="end" className="fill-slate-500 text-[11px] tabular-nums">{formatAxis(t)}</text>
              </g>
            ))}
            {labelIndexes(n, width < 480 ? 4 : 7).map((i) => (
              <text key={i} x={x(i)} y={height - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="fill-slate-500 text-[11px]">{formatShortDate(data[i].date)}</text>
            ))}

            <g key={`${n}-${data[n - 1].value}-${max}`}>
              <path d={area} fill={`url(#${gid})`} className="animate-fade" />
              <path d={line} fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" className="animate-draw" />
            </g>

            {/* the best point is always marked, the last one pulses */}
            <circle cx={x(best)} cy={y(data[best].value)} r="4.5" fill="#fff" stroke={color} strokeWidth="2.5" />
            <circle cx={x(n - 1)} cy={y(data[n - 1].value)} r="9" fill={color} className="origin-center animate-glow [transform-box:fill-box]" opacity="0.35" />
            <circle cx={x(n - 1)} cy={y(data[n - 1].value)} r="4.5" fill={color} />

            {active != null && (
              <g>
                <line x1={x(active)} x2={x(active)} y1={PAD.t} y2={PAD.t + innerH} stroke={color} strokeOpacity="0.35" strokeDasharray="4 4" />
                <circle cx={x(active)} cy={y(data[active].value)} r="6" fill="#fff" stroke={color} strokeWidth="3" />
              </g>
            )}
            <rect x={PAD.l} y={0} width={innerW} height={height} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} style={{ touchAction: 'pan-y' }} />
          </svg>
          {active != null && <ChartTooltip left={x(active)} width={width} title={formatWeekday(data[active].date)} value={formatValue(data[active].value)} note={data[active].note} />}
        </>
      )}
    </div>
  );
}
