"use client";

import { useSyncExternalStore } from "react";

/** Same-tab change notice. The browser's "storage" event only fires in other tabs. */
const CHANGE_EVENT = "staff:local-change";

export function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: key }));
  } catch {
    // Storage blocked (private mode or full). The screen still works for this visit.
  }
}

/** Reads a localStorage value as an external store (no setState in effects). Null on the server. */
export function useLocal(key: string): string | null {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener(CHANGE_EVENT, onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(CHANGE_EVENT, onChange);
      };
    },
    () => readLocal(key),
    () => null,
  );
}
