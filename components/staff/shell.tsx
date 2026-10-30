"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Newspaper, BookOpen, Inbox, Settings } from "lucide-react";
import { useStaff } from "./staff-context";
import { NotificationBell } from "./notifications";
import { CommandPalette, OPEN_PALETTE_EVENT } from "./command-palette";
import { ROLE_LABEL } from "@/lib/staff/roles";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/staff/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/staff/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/staff/content", label: "News and notices", icon: Newspaper, publish: true },
  { href: "/staff/guide", label: "Staff guide", icon: BookOpen },
] as const;

const LATER = [
  { label: "Calendar", icon: CalendarDays },
  { label: "Settings", icon: Settings },
] as const;

export function StaffShell({ children, signOut }: { children: ReactNode; signOut: ReactNode }) {
  const pathname = usePathname();
  const { displayName, role, canPublish } = useStaff();
  const roleText = role ? ROLE_LABEL[role] : "No staff role";

  return (
    <div className="min-h-dvh bg-warm-white text-foreground">
      <a href="#staff-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-warm-white">
        Skip to main content
      </a>
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside aria-label="Staff navigation" className="bg-navy text-warm-white lg:sticky lg:top-0 lg:h-dvh lg:min-h-0">
          <div className="flex items-center gap-3 border-b border-warm-white/10 px-5 py-5">
            <div aria-hidden className="grid size-10 place-items-center rounded-xl bg-gold font-serif text-lg font-bold text-navy">
              B
            </div>
            <div>
              <p className="font-serif text-lg font-semibold leading-tight">Bweyogerere</p>
              <p className="text-sm text-warm-white/75">Staff Portal</p>
            </div>
          </div>
          <nav aria-label="Sections" className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
            {NAV.filter((item) => !("publish" in item) || canPublish).map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-gold",
                    active ? "bg-gold text-navy" : "text-warm-white hover:bg-warm-white/10",
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                  {item.label}
                </Link>
              );
            })}
            {LATER.map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  aria-disabled="true"
                  className="flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-base text-warm-white/50"
                >
                  <Icon aria-hidden className="size-5" />
                  {item.label} <span className="text-xs">(coming later)</span>
                </span>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-warm-white/95 px-4 py-3 backdrop-blur md:px-8">
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy">{displayName}</p>
              <p className="truncate text-sm text-ink-muted">{roleText}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
                className="hidden min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-navy hover:bg-gold-tint sm:inline-flex"
              >
                Search <kbd className="rounded bg-soft-grey px-1.5 py-0.5 text-xs">Ctrl K</kbd>
              </button>
              <NotificationBell />
              {signOut}
            </div>
          </header>
          <main id="staff-main" className="flex-1 px-4 py-6 md:px-8 md:py-8" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
      <CommandPalette />
    </div>
  );
}
