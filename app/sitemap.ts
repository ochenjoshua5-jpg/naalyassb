import type { MetadataRoute } from "next";
import { SCHOOL } from "@/lib/site";

/*
 * Public pages only. Excluded on purpose: /staff/* and /api/* (private), and /admissions/enquiry
 * (marked noindex because it is a working form, not a landing page). There is no /calendar page yet.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.SITE_URL ?? SCHOOL.websiteUrl).replace(/\/$/, "");
  const now = new Date();
  const pages: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/admissions", priority: 0.9, changeFrequency: "weekly" },
    { path: "/news", priority: 0.8, changeFrequency: "daily" },
    { path: "/academics", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/school-life", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "monthly" },
  ];
  return pages.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
