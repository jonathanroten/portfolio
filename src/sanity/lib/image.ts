import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type {
  SanityImageAssetReference,
  SanityImageCrop,
  SanityImageHotspot,
} from "../../../sanity.types.ts";

const builder = createImageUrlBuilder(sanityClient);

/**
 * An image as the queries return it. Their `defined(asset)` filters drop
 * images without an asset, but TypeGen can't narrow a named image type.
 */
type SanityImage = {
  asset: SanityImageAssetReference | null;
  hotspot: SanityImageHotspot | null;
  crop: SanityImageCrop | null;
};

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
 * Crops for gallery images, by their Studio `layout`: `default` sits in the
 * two-column grid and `fullWidth` spans both. Shared by the case studies on Home
 * and the case study pages, so their images keep the same shapes. The queries fill in
 * `default` for an image saved without a layout, so every image finds a crop.
 */
export const galleryCrops = {
  default: { width: 960, ratio: 8 / 9 },
  fullWidth: { width: 1600, ratio: 16 / 9 },
};
