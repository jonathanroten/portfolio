import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";
import { defineQuery } from "groq";

const builder = createImageUrlBuilder(sanityClient);

/** Sanity image source (asset reference) as returned by the queries below. */
type SanityImage = { alt?: string; asset?: { _ref: string } };

export type Project = {
  _id: string;
  title: string;
  slug: string;
  services: string[] | null;
  description: string | null;
  gallery: (SanityImage & { layout?: "default" | "fullWidth" })[] | null;
};

const PROJECTS_QUERY =
  defineQuery(`*[_type == "project" && defined(slug.current)] | order(orderRank) {
  _id,
  title,
  "slug": slug.current,
  services,
  description,
  gallery[] { alt, asset, layout }
}`);

export async function getProjects(): Promise<Project[]> {
  return sanityClient.fetch(PROJECTS_QUERY);
}

/**
 * Optimized CDN URL for a Sanity image, cropped to `ratio` (width / height)
 * around its hotspot and resized to `width`.
 */
export function imageUrl(
  image: SanityImage,
  width: number,
  ratio: number,
): string {
  return builder
    .image(image)
    .width(width)
    .height(Math.round(width / ratio))
    .fit("crop")
    .auto("format")
    .url();
}

/** Escape plain text for components that render their props with `set:html`. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
