import type { APIRoute, GetStaticPaths } from "astro";
import { getGalleryItems } from "@/sanity/lib/queries.ts";
import { videoName } from "@/sanity/lib/video.ts";

export const getStaticPaths = (async () => {
  const items = await getGalleryItems();
  return items.flatMap(({ video }) =>
    video
      ? [
          {
            params: { name: videoName(video) },
            props: { url: video },
          },
        ]
      : [],
  );
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const response = await fetch(props.url);
  if (!response.ok) {
    throw new Error(`Video download failed (${response.status}): ${props.url}`);
  }
  return new Response(await response.arrayBuffer(), {
    headers: { "Content-Type": "video/mp4" },
  });
};
