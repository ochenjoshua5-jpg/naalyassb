import { PendingTag } from "@/components/page/pending";
import { cn } from "@/lib/utils";

/**
 * Vertical school timeline: navy line, gold dots. Entries that the school has
 * not confirmed show a "Pending HM Approval" tag instead of a made-up detail.
 */
export function Timeline({
  items,
  className,
}: {
  items: ReadonlyArray<{ year: string; title: string; body: string; status: "published" | "pending" }>;
  className?: string;
}) {
  return (
    <ol className={cn("relative ml-3 space-y-12 border-l-2 border-navy/15 md:ml-4", className)}>
      {items.map((item) => (
        <li key={`${item.year}-${item.title}`} className="relative pl-8 md:pl-12">
          <span
            aria-hidden
            className={cn(
              "absolute -left-[0.6875rem] top-1.5 size-5 rounded-full border-4 border-warm-white shadow-sm",
              item.status === "pending" ? "bg-warm-white ring-2 ring-navy/25" : "bg-gold",
            )}
          />
          <p className="font-serif text-2xl font-semibold text-navy">{item.year}</p>
          <h3 className="mt-1 font-sans text-lg font-semibold text-navy">{item.title}</h3>
          <p className="mt-2 max-w-2xl text-base leading-[1.75] text-ink-muted">{item.body}</p>
          {item.status === "pending" ? (
            <div className="mt-3">
              <PendingTag />
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
