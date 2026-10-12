# Portfolio

- `web` Astro site with Lumos
- `studio` Sanity Studio

Run npm install and npm run dev inside each folder. When you change a field in studio/schemaTypes, update the queries in web/src/utils/sanity.ts to match.

After publishing a new project, run npm run organize-media inside studio to file its project images into a project folder in the Media tool and tag them "Project". Add `-- --dry-run` to preview first: `npm run organize-media -- --dry-run`.

## After updating sanity-plugin-media

The Media tool's asset details are customized in studio/helpers/assetDetails.tsx: images tagged "Project" get a read-only Alt Text field with a placeholder pointing to the project gallery, since their alt text lives on the project image. That relies on how the plugin builds its form, so check it after updating the plugin (read the changelog first for a major version, e.g. 6 → 7):

1. Run `npx tsc --noEmit` inside studio. It fails if the plugin renamed or removed something the customization uses.
2. Run `npm run dev`, open the Media tab and click a project image. Alt Text should be greyed out with a placeholder saying it's set in the project gallery.
3. Click an image with no "Project" tag. Its Alt Text field should be empty and editable.

If the field becomes editable again, nothing is lost, but the placeholder is gone too, so restore the customization before relying on it.
