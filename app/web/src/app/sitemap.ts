import type { MetadataRoute } from "next";
import { publicPages, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(publicPages).map(({ path }) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
