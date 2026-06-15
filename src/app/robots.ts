import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin-initialize-override-route", "/*/portal/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
