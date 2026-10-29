import { cn } from "@/lib/utils";

/*
 * PLACEHOLDER CREST.
 * The approved school crest has not been supplied yet. Replace this
 * component's markup with the approved artwork (keep the viewBox and
 * the accessible title) once the school signs off the file.
 */
export function Crest({
  className,
  title,
  tone = "navy",
}: {
  className?: string;
  /** Accessible name. Omit when the crest is decorative next to the school name. */
  title?: string;
  tone?: "navy" | "gold";
}) {
  const disc = tone === "navy" ? "#1B2A4A" : "#D4A843";
  const mark = tone === "navy" ? "#D4A843" : "#1B2A4A";
  const ring = tone === "navy" ? "#D4A843" : "#1B2A4A";

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <circle cx="32" cy="32" r="31" fill={disc} />
      <circle cx="32" cy="32" r="27" fill="none" stroke={ring} strokeWidth="1.5" />
      {/* Sunrise over the campus horizon */}
      <path d="M19 41a13 13 0 0 1 26 0z" fill={mark} />
      <rect x="15" y="44" width="34" height="2.2" rx="1.1" fill={mark} />
      <rect x="19" y="48.5" width="26" height="2.2" rx="1.1" fill={mark} />
      <rect x="23" y="53" width="18" height="2.2" rx="1.1" fill={mark} />
    </svg>
  );
}
