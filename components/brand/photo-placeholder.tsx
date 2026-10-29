import { cn } from "@/lib/utils";

/*
 * Stand-in for an approved campus photograph. It is NOT stock imagery
 * and shows no children. Swap it for a rights-cleared photo (with
 * guardian consent where students are identifiable) using next/image,
 * keeping the same aspect ratio so the layout does not shift.
 */
export function PhotoPlaceholder({
  caption,
  captionPosition = "bottom",
  className,
  tone = "navy",
}: {
  caption?: string;
  captionPosition?: "top" | "bottom";
  className?: string;
  tone?: "navy" | "gold";
}) {
  const gradient =
    tone === "navy"
      ? "bg-[linear-gradient(165deg,var(--navy)_0%,var(--navy-soft)_58%,#7d6127_130%)]"
      : "bg-[linear-gradient(165deg,var(--gold)_0%,var(--gold-tint)_60%,var(--warm-white)_120%)]";

  return (
    <div className={cn("relative isolate overflow-hidden", gradient, className)}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 400 500"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 -z-10 size-full"
      >
        <circle cx="262" cy="232" r="92" fill={tone === "navy" ? "#D4A843" : "#1B2A4A"} opacity="0.92" />
        <path
          d="M0 348 C90 318 160 330 240 352 S350 372 400 344 L400 500 L0 500 Z"
          fill={tone === "navy" ? "#131F38" : "#1B2A4A"}
          opacity="0.9"
        />
        <path
          d="M0 392 C100 370 190 384 280 400 S360 412 400 396 L400 500 L0 500 Z"
          fill={tone === "navy" ? "#0E1830" : "#131F38"}
        />
      </svg>
      <div className="grain absolute inset-0 -z-10" />
      {caption ? (
        <p
          className={cn(
            "absolute inset-x-5 text-sm leading-snug text-warm-white/90",
            captionPosition === "top" ? "top-5" : "bottom-5",
          )}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}
