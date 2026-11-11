/**
 * Astro's sharp image service, with retries when measuring remote images.
 *
 * Astro measures a remote image (cdn.sanity.io) with one request and no retry.
 * A rare network blip then fails the whole build with "Failed to get the
 * dimensions", and Astro discards the real error. This retries that request
 * twice, 1s and then 2s apart, and logs a warning each time. Everything else
 * is Astro's sharp service unchanged, so the output is identical.
 *
 * Wired up in astro.config.mjs (`image.service.entrypoint`).
 */
import type { LocalImageService } from "astro";
import sharpService from "astro/assets/services/sharp";

const RETRY_DELAYS_MS = [1000, 2000];

const service: LocalImageService = {
  ...sharpService,
  async getRemoteSize(url, imageConfig, logger) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await sharpService.getRemoteSize!(url, imageConfig, logger);
      } catch (error) {
        const delay = RETRY_DELAYS_MS[attempt];
        // A blocked domain fails the same way every time, so don't retry it
        const blocked = (error as Error)?.name === "RemoteImageNotAllowed";
        if (delay === undefined || blocked) throw error;

        const warn = logger?.warn ?? console.warn;
        warn(
          `Couldn't measure ${url} (${(error as Error)?.message ?? error}). ` +
            `Retrying in ${delay / 1000}s.`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  },
};

export default service;
