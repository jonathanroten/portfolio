const plainQueries = [
  "(prefers-reduced-motion: reduce)",
  "(prefers-contrast: more)",
  "(forced-colors: active)",
].map((query) => window.matchMedia(query));

/** Milliseconds between texture uploads. */
export const uploadGap = 32;

/** Whether the visitor's settings ask for plain images, with no motion effect. */
export const prefersPlainImages = () =>
  plainQueries.some((query) => query.matches);

/** Calls `listener` whenever a setting behind `prefersPlainImages` changes. */
export const onPlainImagesChange = (listener: () => void) => {
  for (const query of plainQueries) query.addEventListener("change", listener);
};

/**
 * Starts the motion shader on `canvas`. Returns `null` straight away, without
 * downloading three, when the browser can't run WebGL well.
 */
export const loadMotionShader = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext("webgl2", {
    depth: false,
    antialias: false,
    failIfMajorPerformanceCaveat: true,
  });
  if (!context) return null;
  return import("@/utils/motion-shader.ts").then(({ createMotionShader }) =>
    createMotionShader(canvas, context),
  );
};
