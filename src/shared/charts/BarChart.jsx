import { useState } from 'react';
import { useWidth } from '@/shared/lib/useSize';
import { formatCompact, formatShortDate, formatWeekday } from '@/shared/lib/format';
import { ChartTooltip } from './ChartTooltip';
import { labelIndexes, niceMax } from './scales';

const PAD = { l: 34, r: 8, t: 38, b: 28 };

/** Rounded bars that grow from the bottom. data = [{ date: Date, value: number, note?: string }] */
export function BarChart({ data, height = 240, color = '#3b82f6', formatValue = (v) => String(v), formatAxis = formatCompact, label = 'Chart' }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const n = data.length;
  const innerW = Math.max(0, width - PAD.l - PAD.r);
  const innerH = height - PAD.t - PAD.b;
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const slot = n ? innerW / n : 0;
  const barW = Math.max(2, Math.min(28, slot * 0.68));
  const y = (v) => PAD.t + innerH - (v / max) * innerH;
  const cx = (i) => PAD.l + slot * i + slot / 2;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }} onPointerLeave={() => setHover(null)}>
      {width > 0 && n > 0 && (
        <>
          <svg width={width} height={height} role="img" aria-label={`${label}, total ${formatValue(total)} over ${n} days`} className="overflow-visible">
            {[0, 1, 2, 3].map((k) => (max / 3) * k).map((t) => (
              <g key={t}>
                <line x1={PAD.l} x2={width - PAD.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray={t === 0 ? undefined : '3 5'} />
                <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-500 text-[11px] tabular-nums">{formatAxis(t)}</text>
              </g>
            ))}
            {labelIndexes(n, width < 480 ? 4 : 7).map((i) => (
              <text key={i} x={cx(i)} y={height - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="fill-slate-500 text-[11px]">{formatShortDate(data[i].date)}</text>
            ))}
            {data.map((d, i) => {
              const h = Math.max(d.value > 0 ? 3 : 0, innerH - (y(d.value) - PAD.t));
              return (
                <g key={i} onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)}>
                  <rect x={PAD.l + slot * i} y={PAD.t} width={slot} height={innerH} fill="transparent" />
                  <rect
                    x={cx(i) - barW / 2} y={PAD.t + innerH - h} width={barW} height={h} rx={Math.min(6, barW / 2)}
                    fill={color} opacity={hover == null || hover === i ? 1 : 0.35}
                    className="origin-bottom animate-rise transition-opacity [transform-box:fill-box]"
                    style={{ animationDelay: `${Math.min(i * 12, 500)}ms` }}
                  />
                </g>
              );
            })}
          </svg>
          {hover != null && <ChartTooltip left={cx(hover)} width={width} title={formatWeekday(data[hover].date)} value={formatValue(data[hover].value)} note={data[hover].note} />}
        </>
      )}
    </div>
  );
}
