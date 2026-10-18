/** Floating label that follows the pointer. `left` is in px inside the chart box; it stays inside the edges. */
export function ChartTooltip({ left, width, title, value, note }) {
  const x = Math.min(Math.max(left, 64), Math.max(64, width - 64));
  return (
    <div role="status" className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 animate-enter rounded-xl bg-ink px-3 py-2 text-center shadow-xl shadow-slate-900/25" style={{ left: x }}>
      <p className="text-[11px] font-medium text-slate-300">{title}</p>
      <p className="text-sm font-bold tabular-nums text-white">{value}</p>
      {note && <p className="text-[11px] text-slate-400">{note}</p>}
    </div>
  );
}
