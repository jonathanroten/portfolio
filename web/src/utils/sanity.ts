import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";
import { defineQuery } from "groq";

const builder = createImageUrlBuilder(sanityClient);

/** Sanity image source (asset reference) as returned by the queries below. */
type SanityImage = {
  alt?: string;
  asset?: { _ref: string };
  hotspot?: { x: number; y: number; width: number; height: number } | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
};

/** Values of the Studio's `projectType` field on a project. */
export type ProjectType = "brand" | "interactive";

export type Project = {
  _id: string;
  title: string;
  slug: string;
  services: string[] | null;
  description: string | null;
  gallery: (SanityImage & { layout?: "default" | "fullWidth" })[] | null;
};

const PROJECTS_QUERY =
  defineQuery(`*[_type == "project" && projectType == $projectType && defined(slug.current)] | order(orderRank) {
  _id,
  title,
  "slug": slug.current,
  "services": services[defined(@->title)]->title,
  description,
  gallery[defined(asset)] { alt, asset, hotspot, crop, layout }
}`);

const HERO_IMAGES_QUERY = defineQuery(
  `*[_id == "homePage"][0].heroImages[defined(asset)] { asset, hotspot, crop }`,
);

/** Hero trail images, in the order set in the Studio. */
export async function getHeroImages(): Promise<SanityImage[]> {
  return (await sanityClient.fetch(HERO_IMAGES_QUERY)) ?? [];
}

const SERVICES_QUERY = defineQuery(
  `*[_type == "service" && defined(title)] | order(title asc).title`,
);

/** Published projects of one type, in the order set in the Studio. */
export async function getProjects(
  projectType: ProjectType,
): Promise<Project[]> {
  return sanityClient.fetch(PROJECTS_QUERY, { projectType });
}

let servicesRequest: Promise<string[]> | undefined;

/**
 * Titles of every service, A-Z. Memoized in builds: the footer calls this on
 * every page of the static build, so it only hits Sanity once. Not memoized in
 * dev, where a long-lived server would keep serving stale services.
 */
export function getServices(): Promise<string[]> {
  if (import.meta.env.DEV) return sanityClient.fetch(SERVICES_QUERY);
  servicesRequest ??= sanityClient.fetch(SERVICES_QUERY);
  return servicesRequest;
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
