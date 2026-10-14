/** Page metadata for `BaseHead` and layouts. */
export interface SeoProps {
  /** Page title. The site name is appended. */
  title?: string;
  /** Page and social description. Defaults to the Site Settings SEO description. */
  description?: string;
  /** Social image. Defaults to `/og-image.jpg`. */
  image?: string;
  /** Open Graph type. */
  type?: "website" | "article";
  /** Override `NOINDEX_ROUTES` for this page's robots tag. */
  noindex?: boolean;
}

/** One gallery image as sent to the browser, cropped and resized for display. */
export interface GalleryImage {
  src: string;
  width: number;
  height: number;
  /** Services provided, joined with commas. Empty when the image has none. */
  service: string;
}
