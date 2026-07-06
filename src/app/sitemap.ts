import type { MetadataRoute } from "next";
import { locales } from "@/i18n/locales";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/categories", "/about", "/contact", "/privacy", "/terms"];
  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path ? "monthly" : "daily",
      priority: path ? 0.5 : 1,
    })),
  );
}
