const queries = [
  "(prefers-reduced-motion: reduce)",
  "(prefers-contrast: more)",
  "(forced-colors: active)",
].map((query) => window.matchMedia(query));

/** Whether the visitor's system asks for reduced motion, more contrast or forced colors. */
export function prefersPlainImages(): boolean {
  return queries.some((query) => query.matches);
}

/** Calls back whenever one of those settings changes. */
export function onPlainImagesChange(callback: () => void): void {
  for (const query of queries) query.addEventListener("change", callback);
}
