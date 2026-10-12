import type { GalleryItem } from "@/types.ts";

import anewHero from "@/assets/projects/anew-aesthetic/anew-hero.avif";
import anewStorefrontWindow from "@/assets/projects/anew-aesthetic/anew-storefront-window.avif";
import artreauxPrimaryLogos from "@/assets/projects/artreaux/artreaux-primary-logos.avif";
import artreauxToteBag from "@/assets/projects/artreaux/artreaux-tote-bag.avif";
import avettWebpageHome from "@/assets/projects/avett-brothers/avett-webpage-home.avif";
import cccProductBottle from "@/assets/projects/ccc-cambridge-chemical/ccc-product-bottle.avif";
import cccStationeryMockup from "@/assets/projects/ccc-cambridge-chemical/ccc-stationery-mockup.avif";
import foolsGoldBadge from "@/assets/projects/fools-gold/fools-gold-badge.avif";
import foolsGoldHero from "@/assets/projects/fools-gold/fools-gold-hero.avif";
import foolsGoldJarPackaging from "@/assets/projects/fools-gold/fools-gold-jar-packaging.avif";
import foolsGoldSticker from "@/assets/projects/fools-gold/fools-gold-sticker.avif";
import humbleBeeHero from "@/assets/projects/humble-bee/humble-bee-hero.avif";
import humbleBeeMugs from "@/assets/projects/humble-bee/humble-bee-mugs.avif";
import ramkatConcertPhoto from "@/assets/projects/ramkat/ramkat-concert-photo.avif";
import richardsonsHeroMeat from "@/assets/projects/richardsons-butchery/richardsons-hero-meat.avif";
import richardsonsStorefrontWindow from "@/assets/projects/richardsons-butchery/richardsons-storefront-window.avif";
import rsaSign from "@/assets/projects/rsa/rsa-sign.avif";
import sparqWebpage from "@/assets/projects/sparq/sparq-webpage-01.avif";
import toptierWebpageHybrid from "@/assets/projects/toptier/toptier-webpage-hybrid.avif";
import uptownHero from "@/assets/projects/uptown-trading-co/uptown-hero.avif";

/**
 * Images for the infinite gallery on `/stuff`. Shaped like the document the
 * Studio will hold, so Sanity can replace this list without touching the page.
 */
export const galleryItems: GalleryItem[] = [
  { image: foolsGoldHero, alt: "Fool's Gold brand hero" },
  { image: avettWebpageHome, alt: "Avett Brothers website home page" },
  { image: humbleBeeMugs, alt: "Humble Bee mugs" },
  { image: anewHero, alt: "Anew Aesthetic brand hero" },
  { image: cccProductBottle, alt: "Cambridge Chemical Company product bottle" },
  {
    image: richardsonsStorefrontWindow,
    alt: "Richardson's Butchery storefront window",
  },
  { image: uptownHero, alt: "Uptown Trading Co. brand hero" },
  { image: toptierWebpageHybrid, alt: "TopTier website hybrid training page" },
  { image: foolsGoldBadge, alt: "Fool's Gold badge" },
  { image: artreauxPrimaryLogos, alt: "Artreaux primary logos" },
  { image: humbleBeeHero, alt: "Humble Bee brand hero" },
  { image: ramkatConcertPhoto, alt: "Concert at the Ramkat" },
  {
    image: cccStationeryMockup,
    alt: "Cambridge Chemical Company stationery mockup",
  },
  {
    image: richardsonsHeroMeat,
    alt: "Richardson's Butchery hero with cuts of meat",
  },
  { image: foolsGoldJarPackaging, alt: "Fool's Gold jar packaging" },
  { image: sparqWebpage, alt: "Sparq website page" },
  { image: artreauxToteBag, alt: "Artreaux tote bag" },
  { image: anewStorefrontWindow, alt: "Anew Aesthetic storefront window" },
  { image: foolsGoldSticker, alt: "Fool's Gold sticker" },
  { image: rsaSign, alt: "RSA sign" },
];
