import { NOINDEX_ROUTES } from "../consts.ts";

const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, "")}`;

const routes = NOINDEX_ROUTES.map(normalize);
const excluded = new Set(routes.filter((route) => !route.endsWith("/*")));
const prefixes = routes
  .filter((route) => route.endsWith("/*"))
  .map((route) => route.slice(0, -1));

/** Checks whether a route should be hidden from search. Used by BaseHead. */
export function isNoindexRoute(pathname: string): boolean {
  const path = normalize(pathname);
  return (
    excluded.has(path) || prefixes.some((prefix) => path.startsWith(prefix))
  );
}
