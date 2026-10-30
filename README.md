# Portfolio

- `web` Astro site with Lumos
- `studio` Sanity Studio

Run npm install and npm run dev inside each folder. When you change a field in studio/schemaTypes, update the queries in web/src/utils/sanity.ts to match.

After publishing a new case study, run npm run organize-media inside studio to file its images into a folder in the Media tool and tag them "Case Study". Add `-- --dry-run` to preview first: `npm run organize-media -- --dry-run`.

## Deploying the site

The site deploys from web as a Cloudflare Worker named `portfolio`. Cloudflare serves the built pages as static files, and only `/api/*` runs web/worker/index.ts, which sends the contact form.

Deploy with `npm run build && npx wrangler deploy` inside web. On a new computer, run `npx wrangler login` first.

The Worker needs two secrets, listed under `secrets.required` in web/wrangler.jsonc:

- `CONTACT_TO`: the inbox form messages go to. It must be a verified destination in Email Routing.
- `TURNSTILE_SECRET_KEY`: the Turnstile widget's secret, kept in 1Password.

Secrets stay on the Worker between deploys, so they're only set once. To change one, run `npx wrangler secret put <NAME>` and paste the value when asked. A deploy fails if either is missing, which is on purpose.

Locally they live in web/.dev.vars, which git ignores. Use Cloudflare's always-pass test secret there, never the real one:

```
CONTACT_TO=you@example.com
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

To test the form locally, run `npm run build` once, then `npm run dev:worker` and `npm run dev` in two terminals inside web. Emails aren't sent; the Worker's terminal prints each one with the path to its text.

### First deploy of a new Worker

`secret put` only works on a Worker that already exists, and the deploy that creates it fails without the secrets. This only happens once per Worker, for example after renaming it or when starting a client site from this project.

1. Make a file outside the repo with `CONTACT_TO=<inbox>` and `TURNSTILE_SECRET_KEY=pending` on separate lines.
2. Run `npx wrangler deploy --secrets-file <that file>`, then delete the file.
3. Run `npx wrangler secret put TURNSTILE_SECRET_KEY` and paste the real secret from 1Password. Until then the form refuses every send, so a forgotten step shows up in the first test.
4. In Cloudflare, add the Worker's address (for example `portfolio.jonathanroten.workers.dev`) to the Turnstile widget's hostnames.
5. Send a test from the live form and check that it arrives.

## After updating sanity-plugin-media

The Media tool's asset details are customized in studio/helpers/assetDetails.tsx: images tagged "Case Study" get a read-only Alt Text field with a placeholder pointing to the case study, since their alt text lives on the case study image. That relies on how the plugin builds its form, so check it after updating the plugin (read the changelog first for a major version, e.g. 6 → 7):

1. Run `npx tsc --noEmit` inside studio. It fails if the plugin renamed or removed something the customization uses.
2. Run `npm run dev`, open the Media tab and click a case study image. Alt Text should be greyed out with a placeholder saying it's set on the case study.
3. Click an image with no "Case Study" tag. Its Alt Text field should be empty and editable.

If the field becomes editable again, nothing is lost, but the placeholder is gone too, so restore the customization before relying on it.
