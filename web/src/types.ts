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

/** One image in the infinite gallery. */
export interface GalleryItem {
  /** Imported image. Resized at build for the gallery. */
  image: ImageMetadata;
  /** Describes the image for people who cannot see it. */
  alt: string;
}

/** One gallery image as sent to the browser, resized for display. */
export interface GalleryImage {
  src: string;
  width: number;
  height: number;
}
