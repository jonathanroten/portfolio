/** Reads a duration token from the root element, in milliseconds. */
export const duration = (token: string) => {
  const time = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return parseFloat(time) * (time.endsWith("ms") ? 1 : 1000);
};
