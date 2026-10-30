"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { EnquiryStatus } from "@/lib/enquiry/status";
import { STATUS_LABEL } from "@/lib/enquiry/status";

const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new: "bg-gold text-navy",
  contacted: "bg-emerald-100 text-emerald-900",
  "visit-scheduled": "bg-sky-100 text-sky-900",
  enrolled: "bg-emerald-700 text-white",
  withdrawn: "bg-stone-200 text-stone-700",
};

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <Badge className={cn("text-sm", STATUS_STYLE[status])} data-status={status}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl bg-card p-5 shadow-sm shadow-navy/5 md:p-6", className)}>{children}</section>;
}

export function MetricCard({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <Panel className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-ink-muted">{label}</p>
      <p className="font-serif text-4xl font-semibold text-navy" aria-live="polite">
        {value}
      </p>
      {hint ? <p className="text-sm text-ink-muted">{hint}</p> : null}
      {children}
    </Panel>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamped)} className="h-3 w-full overflow-hidden rounded-full bg-soft-grey">
      <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${clamped}%` }} />
    </div>
  );
}

/** Red for urgent, gold for information. Always text, never colour alone. */
export function Callout({ tone, title, children }: { tone: "urgent" | "info"; title: string; children?: ReactNode }) {
  return (
    <div
      role={tone === "urgent" ? "alert" : "status"}
      className={cn(
        "rounded-2xl border-l-4 p-5 text-base",
        tone === "urgent" ? "border-red-700 bg-red-50 text-red-950" : "border-gold bg-gold-tint text-navy",
      )}
    >
      <p className="font-semibold">{title}</p>
      {children ? <div className="mt-1 text-sm">{children}</div> : null}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-soft-grey", className)} />;
}

export function SyncingNote({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <p role="status" className="text-sm font-semibold text-ink-muted">
      Syncing…
    </p>
  );
}
