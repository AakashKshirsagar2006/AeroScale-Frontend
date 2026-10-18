// Sale countdowns must follow the server's clock, not a phone that is 3 minutes fast.
// Every API response carries a standard `Date` header; we keep the difference between it and our clock.
let offset = 0;

export const serverNow = () => Date.now() + offset;

export function syncServerClock(dateHeader) {
  const server = Date.parse(dateHeader);
  if (!Number.isNaN(server)) offset = server - Date.now();
}
