# Portfolio

- `web` Astro site with Lumos
- `studio` Sanity Studio

Run npm install and npm run dev inside each folder. When you change a field in studio/schemaTypes, update the queries in web/src/utils/sanity.ts to match.

After publishing a new project, run npm run organize-media inside studio to file its gallery images into a project folder in the Media tool. Add `-- --dry-run` to preview first: `npm run organize-media -- --dry-run`.
