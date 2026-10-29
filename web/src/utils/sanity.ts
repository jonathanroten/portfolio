import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";
import { defineQuery } from "groq";
import type {
  DESCRIPTION_QUERY_RESULT,
  GALLERY_QUERY_RESULT,
  HERO_IMAGES_QUERY_RESULT,
  PROJECTS_QUERY_RESULT,
  Project,
  SanityImageAssetReference,
  SanityImageCrop,
  SanityImageHotspot,
  SITE_SETTINGS_QUERY_RESULT,
} from "../../sanity.types.ts";

const builder = createImageUrlBuilder(sanityClient);

/**
 * An image as the queries below return it. Their `defined(asset)` filters drop
 * images without an asset, but TypeGen can't narrow a named image type.
 */
type SanityImage = {
  asset: SanityImageAssetReference | null;
  hotspot: SanityImageHotspot | null;
  crop: SanityImageCrop | null;
};

/** Values of the Studio's `projectType` field on a project. */
export type ProjectType = Project["projectType"];

const PROJECTS_QUERY =
  defineQuery(`*[_type == "project" && projectType == $projectType && defined(slug.current)] | order(orderRank) {
  _id,
  title,
  "slug": slug.current,
  "services": services[defined(@->title)]->title,
  description,
  projectGallery[defined(asset)] { alt, asset, hotspot, crop, layout }
}`);

const HERO_IMAGES_QUERY = defineQuery(
  `*[_id == "homePage"][0].heroImages[defined(asset)] { asset, hotspot, crop }`,
);

/** Hero trail images, in the order set in the Studio. */
export async function getHeroImages(): Promise<
  NonNullable<HERO_IMAGES_QUERY_RESULT>
> {
  return (await sanityClient.fetch(HERO_IMAGES_QUERY)) ?? [];
}

const GALLERY_QUERY = defineQuery(
  `*[_id == "gallery"][0].items[defined(asset)] { alt, aspectRatio, asset, hotspot, crop, "services": services[defined(@->title)]->title }`,
);

/** Images for the infinite gallery, in the order set in the Studio. */
export async function getGalleryItems(): Promise<
  NonNullable<GALLERY_QUERY_RESULT>
> {
  return (await sanityClient.fetch(GALLERY_QUERY)) ?? [];
}

const SERVICES_QUERY = defineQuery(
  `*[_type == "service" && defined(title)] | order(title asc).title`,
);

/** Published projects of one type, in the order set in the Studio. */
export async function getProjects(
  projectType: ProjectType,
): Promise<PROJECTS_QUERY_RESULT> {
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

type SiteSettingsResult = NonNullable<SITE_SETTINGS_QUERY_RESULT>;

/** Content shown on every page, from the Site Settings document in the Studio. */
export type SiteSettings = {
  navigation: NonNullable<SiteSettingsResult["navigation"]>;
  socialLinks: NonNullable<SiteSettingsResult["socialLinks"]>;
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
  runs: NonNullable<DESCRIPTION_QUERY_RESULT>;
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

/**
 * Crops for gallery images, by their Studio `layout`: `half` sits in the
 * two-column grid and `full` spans both. Shared by the Home projects and the
 * studies pages, so their images keep the same shapes.
 */
export const galleryCrops = {
  half: { width: 960, ratio: 8 / 9 },
  full: { width: 1600, ratio: 16 / 9 },
};
