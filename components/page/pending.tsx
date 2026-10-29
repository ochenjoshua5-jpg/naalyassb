import { PENDING_LABEL } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Inline marker for any detail the school has not yet confirmed. */
export function PendingTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-gold-tint px-3 py-1 text-sm font-semibold leading-none text-navy",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-navy" />
      {PENDING_LABEL}
    </span>
  );
}

/** Block note: what is pending, and what will be published once it is confirmed. */
export function PendingNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <aside
      className={cn(
        "rounded-2xl border-l-4 border-gold bg-gold-tint/60 p-6 text-base leading-[1.7] text-navy shadow-sm shadow-navy/5 md:p-7",
        className,
      )}
    >
      <div className="mb-3">
        <PendingTag />
      </div>
      <div className="text-ink-muted">{children}</div>
    </aside>
  );
}
