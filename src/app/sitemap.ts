import type { MetadataRoute } from "next";
import { plannerScenarios } from "@/content/site";

const BASE = "https://metis.gold";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/plan",
    "/about",
    "/capabilities",
    "/public-sector",
    "/research",
    "/leadership",
    "/documents",
    "/contact",
    "/privacy",
    "/terms",
  ];

  const scenarioRoutes = plannerScenarios.map((sc) => `/plan/${sc.slug}`);

  return [...staticRoutes, ...scenarioRoutes].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/plan" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/plan") ? 0.9 : 0.7,
  }));
}
