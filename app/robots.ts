import type { MetadataRoute } from "next";
import { SCHOOL } from "@/lib/site";

/* Private areas are disallowed. Staff pages are also noindex in their own metadata. */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.SITE_URL ?? SCHOOL.websiteUrl).replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/staff/", "/api/", "/admin/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
