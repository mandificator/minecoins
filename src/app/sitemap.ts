import type { MetadataRoute } from "next";
import { listDocs } from "@/lib/docs";

const BASE = "https://promethium.work";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/agentic-mining",
    "/staking",
    "/bridge",
    "/rent-a-miner",
    "/explorer",
    "/docs",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const docRoutes = listDocs()
    .filter((d) => d.exists)
    .map((d) => ({
      url: `${BASE}/docs/${d.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...docRoutes];
}
