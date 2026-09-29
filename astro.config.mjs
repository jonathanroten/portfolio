// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE_URL } from "./src/consts.ts";
import { isNoindexRoute } from "./src/utils/seo.ts";

export default defineConfig({
  site: SITE_URL,
  integrations: [
    sitemap({
      filter: (page) => !isNoindexRoute(new URL(page).pathname),
    }),
  ],
  fonts: [
    {
      name: "Apfel Grotezk",
      cssVariable: "--font-apfel-grotezk",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/apfel-grotezk-regular.woff2"],
          },
          {
            weight: 500,
            style: "normal",
            src: ["./src/assets/fonts/apfel-grotezk-mittel.woff2"],
          },
          {
            weight: 700,
            style: "normal",
            src: ["./src/assets/fonts/apfel-grotezk-fett.woff2"],
          },
        ],
      },
    },
    {
      name: "DM Mono",
      cssVariable: "--font-dm-mono",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 500,
            style: "normal",
            src: ["./src/assets/fonts/dm-mono-medium.ttf"],
          },
        ],
      },
    },
    {
      name: "Hedvig Letters Serif",
      cssVariable: "--font-hedvig-letters-serif",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/hedvig-letters-serif_18pt-regular.ttf"],
          },
        ],
      },
    },
  ],

  vite: { build: { cssTarget: "safari15.4" } },
});
