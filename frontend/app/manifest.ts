import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Life Tracker",
    short_name: "Life Tracker",
    description:
      "Track personal events, thoughts, groups, and life activity.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6eadf",
    theme_color: "#a86449",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
