/**
 * Name of a Sanity video on this site: its Sanity file ID, which is a hash of
 * its contents, so a replaced clip always gets a new name. Used by the videos
 * endpoint.
 */
export const videoName = (url: string) =>
  new URL(url).pathname.split("/").pop()?.replace(/\.\w+$/, "") ?? "";

/**
 * Site path of a Sanity video. The build copies each one to `/videos/`, where
 * Cloudflare serves it and the Worker answers the byte ranges Safari asks for.
 * Used by GalleryInfinite.
 */
export const videoPath = (url: string) => `/videos/${videoName(url)}.mp4`;
