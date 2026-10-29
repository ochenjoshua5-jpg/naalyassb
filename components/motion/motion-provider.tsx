"use client";

import { MotionConfig } from "framer-motion";

/* Honours the visitor's reduced-motion setting across every Framer Motion element. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
