import { cn } from "@/lib/utils";

/**
 * "On this page" navigation. Sticky beside the content on large screens and
 * a simple wrapping list on phones. Plain anchor links, so it works without
 * JavaScript and with the keyboard.
 */
export function SectionNav({
  label,
  items,
  className,
}: {
  label: string;
  items: ReadonlyArray<{ id: string; label: string }>;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("lg:sticky lg:top-28", className)}>
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">On this page</p>
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1 lg:border-l lg:border-line">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex min-h-11 items-center rounded-lg px-4 py-2 text-[0.95rem] font-medium text-navy transition-colors hover:bg-gold-tint/60 lg:-ml-px lg:rounded-none lg:border-l-2 lg:border-transparent lg:px-4 lg:hover:border-gold lg:hover:bg-transparent lg:hover:text-gold-deep"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
