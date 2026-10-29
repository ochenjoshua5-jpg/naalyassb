"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

/** True on desktop-sized screens. Server render assumes mobile, so nothing desktop-only flashes on phones. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(DESKTOP_QUERY);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

/** Current time, refreshed every minute, so "waiting over 24 hours" stays correct on a long-open screen. */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}
