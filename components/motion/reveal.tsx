/*
 * Scroll reveal, CSS only. Content is fully visible by default; a gentle 24px rise and fade is
 * applied by the `.reveal` class (see app/globals.css) only where the browser supports scroll-driven
 * animations and the visitor has not asked for reduced motion. No JavaScript animation library is shipped.
 */
import { cn } from "@/lib/utils";

/* `as` lets a reveal sit directly inside a list (li) or description list (div), where HTML requires it. */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  return <Tag className={cn("reveal", className)}>{children}</Tag>;
}

export function RevealGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("reveal", className)}>{children}</div>;
}
