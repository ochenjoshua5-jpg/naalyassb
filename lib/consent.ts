"use client";

import * as CookieConsent from "vanilla-cookieconsent";

/*
 * Consent gate for anything that is not strictly necessary (analytics, marketing).
 * Nothing in this list is loaded on the site today. A tracking script must go through
 * loadIfConsented(), which runs it only after the visitor has ticked that category.
 */
export type OptionalCategory = "analytics" | "marketing";

export function hasConsent(category: OptionalCategory): boolean {
  if (typeof window === "undefined") return false;
  try {
    return CookieConsent.acceptedCategory(category);
  } catch {
    // Banner not initialised yet: treat as no consent.
    return false;
  }
}

export async function loadIfConsented(category: OptionalCategory, load: () => Promise<void> | void): Promise<boolean> {
  if (!hasConsent(category)) return false;
  await load();
  return true;
}
