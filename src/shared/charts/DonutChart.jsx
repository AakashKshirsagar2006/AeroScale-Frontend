import { useEffect, useState } from 'react';

/**
 * Donut with a built-in legend. slices = [{ label, value, color }]. `center` goes in the hole.
 * The ring sweeps in once after mount.
 */
export function DonutChart({ slices, center, formatValue = (v) => String(v), size = 176, stroke = 22, label = 'Breakdown' }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(id); }, []);

  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = (size - stroke) / 2;
  const gap = slices.filter((s) => s.value > 0).length > 1 ? 1.2 : 0;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${slices.map((s) => `${s.label} ${formatValue(s.value)}`).join(', ')}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          {total > 0 && slices.map((s) => {
            const pct = (s.value / total) * 100;
            const dash = Math.max(0, pct - gap);
            const el = (
              <circle
                key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="butt"
                pathLength="100" strokeDasharray={ready ? `${dash} ${100 - dash}` : '0 100'} strokeDashoffset={-offset}
                style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
              />
            );
            offset += pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">{center}</div>
      </div>

      <ul className="min-w-40 space-y-2.5">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-3 text-sm">
            <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="text-slate-700">{s.label}</span>
            <span className="ml-auto pl-4 font-bold tabular-nums text-ink">{formatValue(s.value)}</span>
            <span className="w-10 text-right text-xs tabular-nums text-slate-500">{total ? Math.round((s.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
