/** Site name. Appended to every page title and used as `og:site_name`. */
export const SITE_NAME = "Jonathan Roten";
/** Canonical origin. Resolves canonical URLs, social images, and the sitemap. */
export const SITE_URL = "https://jonathanroten.com";
/** BCP 47 locale tag used to format dates and numbers. */
export const SITE_LOCALE = "en-US";
/**
 * Routes kept out of search results. Each is excluded from the sitemap and
 * served with a `robots: noindex, nofollow` tag, so the two can't disagree.
 *
 * Surrounding slashes are optional: `"/thanks"`, `"thanks"` and `"/thanks/"`
 * all match the same route. End one in `/*` to cover every route beneath it.
 */
export const NOINDEX_ROUTES: string[] = ["/404", "/case-studies/*"];
/**
 * Public Turnstile site key for jonathanroten.com. Development uses
 * Cloudflare's always-pass test key instead.
 */
export const TURNSTILE_SITE_KEY = "0x4AAAAAAFabMJD99WC8rqRT";
