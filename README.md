# Portfolio

- `web/` — Astro site (Lumos). `cd web && npm install && npm run dev`
- `studio/` — Sanity Studio (project `fk2vli4s`, dataset `production`). `cd studio && npm install && npm run dev`

Each folder manages its own dependencies. The site's GROQ queries live in `web/src/utils/sanity.ts`; update them together with any schema change in `studio/schemaTypes/`.
