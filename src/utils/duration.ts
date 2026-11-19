/** Reads a duration token from the root element, in milliseconds, or 0 when it doesn't parse. Lets scripts take their timings from the CSS tokens instead of repeating them. Used by Cursor, ImageTrail, and SmoothScroll. */
export function duration(token: string): number {
  const time = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  const ms = parseFloat(time) * (time.endsWith("ms") ? 1 : 1000);
  return Number.isFinite(ms) ? ms : 0;
}
