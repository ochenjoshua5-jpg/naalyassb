"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useEnquiries } from "./use-enquiries";
import { readLocal, useLocal, writeLocal } from "./use-local";
import { RESPONSE_TARGET_HOURS } from "@/lib/enquiry/status";
import { formatEatDateTime, formatRelative } from "@/lib/time";
import { cn } from "@/lib/utils";

const LAST_SEEN_KEY = "staff:lastSeenEnquiryAt";

/**
 * In-app alert for new enquiries. Polls with the enquiry list (every 30 seconds), so a new enquiry
 * appears within about 30 seconds. Email and SMS alerts are NOT built here (they need a provider).
 */
export function NotificationBell() {
  const router = useRouter();
  const { data } = useEnquiries();
  const [open, setOpen] = useState(false);
  const lastSeen = useLocal(LAST_SEEN_KEY);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // First visit on this device: existing enquiries are not "new" to this person.
    if (readLocal(LAST_SEEN_KEY) === null) writeLocal(LAST_SEEN_KEY, new Date().toISOString());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const items = useMemo(
    () => [...(data?.items ?? [])].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [data],
  );
  const fresh = useMemo(
    () => (lastSeen ? items.filter((item) => item.createdAt > lastSeen) : []),
    [items, lastSeen],
  );
  const recent = items.slice(0, 5);

  function markAllSeen() {
    writeLocal(LAST_SEEN_KEY, new Date().toISOString());
  }

  function openEnquiry(id: string) {
    markAllSeen();
    setOpen(false);
    router.push(`/staff/enquiries?open=${encodeURIComponent(id)}`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={fresh.length ? `Notifications, ${fresh.length} new` : "Notifications, none new"}
        className="relative inline-flex size-11 items-center justify-center rounded-xl text-navy hover:bg-gold-tint focus-visible:outline-2 focus-visible:outline-gold"
      >
        <Bell aria-hidden className="size-6" />
        {fresh.length > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-6 items-center justify-center rounded-full bg-red-700 px-1.5 text-xs font-bold text-white">
            {fresh.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-3 shadow-xl shadow-navy/15">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="font-semibold text-navy">Latest enquiries</p>
            {fresh.length > 0 ? (
              <button type="button" onClick={markAllSeen} className="text-sm font-semibold text-navy underline underline-offset-4">
                Mark all as read
              </button>
            ) : null}
          </div>
          {recent.length === 0 ? (
            <p className="px-2 py-4 text-sm text-ink-muted">No enquiries yet. New ones will appear here.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {recent.map((item) => {
                const isFresh = !!lastSeen && item.createdAt > lastSeen;
                const overdue =
                  item.status === "new" && now - Date.parse(item.createdAt) > RESPONSE_TARGET_HOURS * 3_600_000;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openEnquiry(item.id)}
                      className="flex w-full min-h-11 items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-warm-white focus-visible:outline-2 focus-visible:outline-gold"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "mt-2 size-2.5 shrink-0 rounded-full",
                          overdue ? "bg-red-700" : isFresh ? "bg-gold" : "bg-transparent",
                        )}
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="font-semibold text-navy">
                          New enquiry from {item.parentName}
                        </span>
                        <span className="text-sm text-ink-muted">
                          {item.desiredLevel} · {formatRelative(item.createdAt, now)} · {formatEatDateTime(item.createdAt)}
                        </span>
                        {overdue ? <span className="text-sm font-semibold text-red-800">Waiting more than 24 hours</span> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
