import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Promethium — Agentic Mining Company",
    short_name: "Promethium",
    description:
      "Real Proof-of-Work tokens on Solana. Mine an element that refuses to exist, stabilize it before it fades, and let agents run your mining for you.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a2bd6",
    theme_color: "#0a2bd6",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
