# jonathanroten.com

The source for my portfolio site: a static Astro site built on Lumos for Astro, integrated with Sanity CMS and hosted on Cloudflare Workers. This is a personal project, shared for reference. It doesn't take outside contributions, so pull requests and issues are not accepted.

## Stack

| Part         | Built with                                                                                                                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site         | [Astro](https://astro.build) with [Lumos for Astro](https://lumosframework.com), a component and styling framework                                                                                              |
| Content      | [Sanity](https://www.sanity.io), edited in the Sanity Studio in `sanity`                                                                                                                                        |
| Hosting      | [Cloudflare Workers](https://developers.cloudflare.com/workers/): the built pages are served as static files                                                                                                    |
| Contact form | A small Worker at `/api/*`, with [Turnstile](https://developers.cloudflare.com/turnstile/) bot checks, per-visitor rate limiting, and [Email Routing](https://developers.cloudflare.com/email-routing/) to send |
| Motion       | [Lenis](https://lenis.darkroom.engineering) smooth scrolling, and a [three.js](https://threejs.org) shader for the speed-reactive image effects                                                                 |
| Deploys      | [GitHub Actions](https://docs.github.com/actions): every pull request is checked, and `main` deploys to Cloudflare once the checks pass                                                                         |

## Repository layout

The site is the repository root. Read `LUMOS.md` before adding pages, components or styles.

| Folder                | What's in it                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components`      | Lumos library components plus the site's own, such as `interactive/ImageTrail.astro` (the home hero) and `content/GalleryInfinite.astro` (the Stuff gallery) |
| `src/utils/sanity.ts` | Every Sanity query, and the image URL helper                                                                                                                 |
| `worker`              | The contact form Worker                                                                                                                                      |
| `sanity`              | The Sanity Studio: schemas in `schemaTypes`, sidebar in `structure`                                                                                          |

## License

Lumos for Astro is MIT-licensed (`LICENSE`). The site's design, writing and images are © Jonathan Roten and aren't licensed for reuse.
