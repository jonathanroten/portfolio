/** Reads a duration token from the root element, in milliseconds. */
export function duration(token: string): number {
  const time = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return parseFloat(time) * (time.endsWith("ms") ? 1 : 1000);
}
