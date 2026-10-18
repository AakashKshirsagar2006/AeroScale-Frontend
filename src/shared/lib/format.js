const whole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const fine = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });

export const formatPrice = (value) => {
  const n = Number(value) || 0;
  return (Number.isInteger(n) ? whole : fine).format(n);
};
export const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const pad = (n) => String(n).padStart(2, '0');
/** ms -> { h, m, s } as zero-padded strings, plus the raw total seconds. Hours are not capped at 24. */
export function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return { h: pad(Math.floor(total / 3600)), m: pad(Math.floor((total % 3600) / 60)), s: pad(total % 60), total };
}

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// ---- added for the seller module ----
const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
/** 1250000 -> "12.5L" */
export const formatCompact = (value) => compact.format(Number(value) || 0);
/** 1250000 -> "₹12.5L" (chart axes, tight tiles) */
export const formatCompactPrice = (value) => `₹${compact.format(Number(value) || 0)}`;
export const formatShortDate = (value) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(value));
export const formatWeekday = (value) => new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(value));

/** Percent change from `before` to `now`. null when there is nothing to compare (both zero). */
export function percentChange(now, before) {
  if (!before) return now > 0 ? 100 : null;
  return ((now - before) / before) * 100;
}

const two = (n) => String(n).padStart(2, '0');
/** ms -> value for <input type="datetime-local"> in the browser's own time zone. */
export function toLocalInput(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}T${two(d.getHours())}:${two(d.getMinutes())}`;
}
/** Local calendar day as yyyy-MM-dd (what the analytics endpoint uses as a key). */
export const dayKey = (date) => `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
/** "2026-10-14" -> Date at local midnight (new Date('2026-10-14') would be UTC and can show the wrong day). */
export const parseDay = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
