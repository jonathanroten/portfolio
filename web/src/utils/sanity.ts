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

/** Content shown on every page, from the Site Settings document in the Studio. */
export type SiteSettings = {
  navigation: { _key: string; label: string; href: string }[];
  socialLinks: { _key: string; label: string; url: string }[];
  /** Default meta description for pages that don't set their own. Empty when unset. */
  seoDescription: string;
};

const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0] {
  "navigation": navigation[defined(label) && defined(href)] { _key, label, href },
  "socialLinks": socialLinks[defined(label) && defined(url)] { _key, label, url },
  seoDescription
}`);

const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const settings = await sanityClient.fetch(SITE_SETTINGS_QUERY);
  return {
    navigation: settings?.navigation ?? [],
    socialLinks: settings?.socialLinks ?? [],
    seoDescription: settings?.seoDescription?.trim() ?? "",
  };
};

let siteSettingsRequest: Promise<SiteSettings> | undefined;

/**
 * Site Settings, with empty lists when the document or a field is missing.
 * Memoized in builds like `getServices`, since the nav and page head call it on
 * every page.
 */
export function getSiteSettings(): Promise<SiteSettings> {
  if (import.meta.env.DEV) return fetchSiteSettings();
  siteSettingsRequest ??= fetchSiteSettings();
  return siteSettingsRequest;
}

/** The Home description, for the hero and the mobile menu. */
export type Description = {
  /** Runs of text, flagged where the Studio's Highlight mark is applied. */
  runs: { text: string; highlight: boolean }[];
  /** Plain text. Empty when unset. */
  text: string;
};

const DESCRIPTION_QUERY =
  defineQuery(`*[_id == "homePage"][0].description[0].children[defined(text)] {
  text,
  "highlight": "highlight" in coalesce(marks, [])
}`);

const fetchDescription = async (): Promise<Description> => {
  const runs: Description["runs"] =
    (await sanityClient.fetch(DESCRIPTION_QUERY)) ?? [];
  return {
    runs,
    text: runs
      .map((run) => run.text)
      .join("")
      .trim(),
  };
};

let descriptionRequest: Promise<Description> | undefined;

/**
 * The Home description. Memoized in builds like `getServices`, since the nav
 * calls it on every page.
 */
export function getDescription(): Promise<Description> {
  if (import.meta.env.DEV) return fetchDescription();
  descriptionRequest ??= fetchDescription();
  return descriptionRequest;
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
