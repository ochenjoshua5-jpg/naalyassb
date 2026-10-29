"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { BookOpen, CalendarDays, Download, Inbox, LayoutDashboard, Newspaper, Search } from "lucide-react";
import { useEnquiries } from "./use-enquiries";
import { downloadCsv, toCsvRows } from "./export";
import { useStaff } from "./staff-context";
import { STATUS_LABEL } from "@/lib/enquiry/status";
import { formatEatDateTime } from "@/lib/time";

const RECENT_KEY = "staff:recent";
export const OPEN_PALETTE_EVENT = "staff:open-palette";
const MAX_RECENT = 5;

interface RecentItem {
  id: string;
  label: string;
  href: string;
  at: string;
}

function readRecent(): RecentItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as RecentItem[]).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

/** Exposed so the table and the Kanban board can record what staff opened. */
export function rememberRecent(item: Omit<RecentItem, "at">) {
  const next = [{ ...item, at: new Date().toISOString() }, ...readRecent().filter((r) => r.id !== item.id)].slice(
    0,
    MAX_RECENT,
  );
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

/** ⌘K (Mac) or Ctrl+K (Windows). Search covers enquiries, pages, actions and help. */
export function CommandPalette() {
  const router = useRouter();
  const { role, canPublish } = useStaff();
  const { data } = useEnquiries();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    const openPalette = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, openPalette);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, openPalette);
    };
  }, []);

  // Read the recent list each time the palette opens (never on the server, where it is closed).
  const recent = useMemo(() => (open ? readRecent() : []), [open]);

  const items = useMemo(() => data?.items ?? [], [data]);

  function go(href: string, recentItem?: Omit<RecentItem, "at">) {
    if (recentItem) rememberRecent(recentItem);
    setOpen(false);
    router.push(href);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Staff command palette"
      overlayClassName="fixed inset-0 z-50 bg-navy/40"
      contentClassName="fixed left-1/2 top-[12vh] z-50 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border-2 border-navy bg-warm-white shadow-2xl"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search aria-hidden className="size-5 text-ink-muted" />
        <Command.Input
          placeholder="Search a name, phone, enquiry or page…"
          className="h-14 w-full bg-transparent text-lg text-navy outline-none placeholder:text-ink-muted focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>
      <Command.List className="max-h-[60vh] overflow-y-auto p-2">
        <Command.Empty className="px-4 py-8 text-center text-base text-ink-muted">
          Nothing matches yet. Try a parent’s name, a phone number or a reference like ENQ-.
        </Command.Empty>

        {recent.length > 0 ? (
          <Command.Group heading="Recent" className="palette-group">
            {recent.map((item) => (
              <Command.Item
                key={`recent-${item.id}`}
                value={`recent ${item.label}`}
                onSelect={() => go(item.href)}
                className="palette-item"
              >
                <span className="flex-1 truncate">{item.label}</span>
                <span className="text-sm text-ink-muted">{formatEatDateTime(item.at)}</span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}

        <Command.Group heading="Enquiries" className="palette-group">
          {items.slice(0, 200).map((item) => (
            <Command.Item
              key={item.id}
              value={`enquiry ${item.parentName} ${item.phone} ${item.reference} ${STATUS_LABEL[item.status]}`}
              onSelect={() =>
                go(`/staff/enquiries?open=${encodeURIComponent(item.id)}`, {
                  id: item.id,
                  label: `${item.parentName} (${item.reference})`,
                  href: `/staff/enquiries?open=${encodeURIComponent(item.id)}`,
                })
              }
              className="palette-item"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold text-navy">{item.parentName}</span>
                <span className="truncate text-sm text-ink-muted">
                  {item.reference} · {item.desiredLevel} · {formatEatDateTime(item.createdAt)}
                </span>
              </span>
              <span className="text-sm font-semibold text-navy">{STATUS_LABEL[item.status]}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Pages" className="palette-group">
          <Command.Item value="pages overview dashboard" onSelect={() => go("/staff/dashboard")} className="palette-item">
            <LayoutDashboard aria-hidden className="size-5" /> Overview
          </Command.Item>
          <Command.Item value="pages enquiries inbox" onSelect={() => go("/staff/enquiries")} className="palette-item">
            <Inbox aria-hidden className="size-5" /> Enquiries
          </Command.Item>
          {canPublish ? (
            <Command.Item value="pages content news editor" onSelect={() => go("/staff/content")} className="palette-item">
              <Newspaper aria-hidden className="size-5" /> News and notices
            </Command.Item>
          ) : null}
          <Command.Item value="pages calendar" disabled className="palette-item opacity-60">
            <CalendarDays aria-hidden className="size-5" /> Calendar (coming later)
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Actions" className="palette-group">
          <Command.Item
            value="actions export enquiries csv download"
            onSelect={() => {
              downloadCsv(toCsvRows(items));
              setOpen(false);
            }}
            className="palette-item"
          >
            <Download aria-hidden className="size-5" /> Export all enquiries (CSV)
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Help" className="palette-group">
          <Command.Item value="help staff guide how to" onSelect={() => go("/staff/guide")} className="palette-item">
            <BookOpen aria-hidden className="size-5" /> Staff guide
          </Command.Item>
          <Command.Item value={`help report a problem ${role ?? ""}`} onSelect={() => go("/staff/guide#problem")} className="palette-item">
            <BookOpen aria-hidden className="size-5" /> Report a problem
          </Command.Item>
        </Command.Group>
      </Command.List>
      <p className="border-t border-line px-4 py-2 text-xs text-ink-muted">
        ↑ ↓ to move · Enter to open · Esc to close
      </p>
    </Command.Dialog>
  );
}
