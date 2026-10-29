"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useEnquiries } from "./use-enquiries";
import { Callout, MetricCard, Panel, ProgressBar, SkeletonBlock, StatusBadge, SyncingNote } from "./ui";
import { useStaff } from "./staff-context";
import { useNow } from "./use-view";
import { Button } from "@/components/ui/button";
import { computeMetrics, overdueItems, TARGET_HOURS, EAT } from "@/lib/staff/metrics";
import { formatEatDateTime, formatEatDay } from "@/lib/time";
import { RESPONSE_TARGET_HOURS } from "@/lib/enquiry/status";

function greeting(nowMs: number): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: EAT, hour: "numeric", hour12: false }).format(new Date(nowMs)));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Overview() {
  const { displayName } = useStaff();
  const { data, error, isPending, isFetching, refetch } = useEnquiries();
  const now = useNow();
  const items = useMemo(() => data?.items ?? [], [data]);
  const metrics = useMemo(() => computeMetrics(items, now), [items, now]);
  const overdue = useMemo(() => overdueItems(items, now), [items, now]);
  const recent = useMemo(() => [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5), [items]);
  const firstName = displayName.split(" ")[0] || "there";

  const maxDay = Math.max(1, ...metrics.lastSevenDays.map((day) => day.count));
  const levelTotal = metrics.levels["O-Level"] + metrics.levels["A-Level"];
  const oLevelShare = levelTotal ? metrics.levels["O-Level"] / levelTotal : 0;
  const responsePercent = metrics.averageResponseHours === null ? 0 : (metrics.averageResponseHours / TARGET_HOURS) * 100;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-navy md:text-4xl">
            {greeting(now)}, {firstName}
          </h1>
          <p className="mt-2 text-base text-ink-muted">
            Here is where things stand today ({formatEatDay(new Date(now))}, East Africa Time).
          </p>
          <SyncingNote active={isFetching && !isPending} />
        </div>
        <Button asChild className="min-h-12">
          <Link href="/staff/enquiries">Open enquiries</Link>
        </Button>
      </header>

      {error && !data ? (
        <Callout tone="urgent" title="We couldn’t load today’s figures just now.">
          <p>{error.message}</p>
          <Button className="mt-3 min-h-11" onClick={() => void refetch()}>
            Try again
          </Button>
        </Callout>
      ) : null}

      {overdue.length > 0 ? (
        <Callout tone="urgent" title={`⚠️ ${overdue.length} ${overdue.length === 1 ? "enquiry has" : "enquiries have"} not been contacted in over ${RESPONSE_TARGET_HOURS} hours`}>
          <p>
            Please reply first to {overdue[0].parentName}, who has been waiting longest.{" "}
            <Link href={`/staff/enquiries?open=${encodeURIComponent(overdue[0].id)}`} className="font-semibold underline underline-offset-4">
              Open it
            </Link>
          </p>
        </Callout>
      ) : null}

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          <p className="sr-only">Loading today’s figures</p>
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock key={index} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="New enquiries" value={String(metrics.newCount)} hint="Waiting for a first reply" />
          <MetricCard label="This week" value={String(metrics.thisWeek)} hint="Received in the last 7 days" />
          <MetricCard
            label="Replied within 24 hours"
            value={metrics.answeredCount ? `${Math.round((metrics.answeredWithinTarget / metrics.answeredCount) * 100)}%` : "—"}
            hint={metrics.answeredCount ? `${metrics.answeredWithinTarget} of ${metrics.answeredCount} replies` : "No replies recorded yet"}
          />
          <MetricCard
            label="Average reply time"
            value={metrics.averageResponseHours === null ? "—" : `${metrics.averageResponseHours.toFixed(1)} h`}
            hint={`Target: within ${TARGET_HOURS} hours`}
          >
            {metrics.averageResponseHours === null ? null : <ProgressBar value={responsePercent} label={`Average reply time against the ${TARGET_HOURS}-hour target`} />}
          </MetricCard>
        </div>
      )}

      {!isPending ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Panel>
            <h2 className="font-serif text-2xl font-semibold text-navy">Enquiries, last 7 days</h2>
            <p className="text-sm text-ink-muted">Per day, East Africa Time</p>
            <div role="img" aria-label={`Enquiries per day: ${metrics.lastSevenDays.map((day) => `${formatEatDay(`${day.day}T12:00:00+03:00`)} ${day.count}`).join(", ")}`} className="mt-6 flex h-56 items-end gap-3">
              {metrics.lastSevenDays.map((day) => (
                <div key={day.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-sm font-semibold tabular-nums text-navy" aria-hidden>
                    {day.count}
                  </span>
                  <div className="w-full rounded-t-lg bg-gold transition-[height] duration-500" style={{ height: `${Math.max(4, (day.count / maxDay) * 85)}%` }} />
                  <span className="text-xs text-ink-muted" aria-hidden>
                    {formatEatDay(`${day.day}T12:00:00+03:00`)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-serif text-2xl font-semibold text-navy">By level</h2>
            <p className="text-sm text-ink-muted">All enquiries</p>
            <div className="mt-6 flex items-center gap-6">
              <svg viewBox="0 0 36 36" className="size-32 -rotate-90" role="img" aria-label={`O-Level ${metrics.levels["O-Level"]}, A-Level ${metrics.levels["A-Level"]}`}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--soft-grey)" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="var(--navy)"
                  strokeWidth="4"
                  strokeDasharray={`${oLevelShare * 100} ${100 - oLevelShare * 100}`}
                />
              </svg>
              <ul className="flex flex-col gap-2 text-base">
                <li className="flex items-center gap-2"><span aria-hidden className="size-3 rounded-full bg-navy" /> O-Level: <strong>{metrics.levels["O-Level"]}</strong></li>
                <li className="flex items-center gap-2"><span aria-hidden className="size-3 rounded-full bg-soft-grey" /> A-Level: <strong>{metrics.levels["A-Level"]}</strong></li>
              </ul>
            </div>
          </Panel>
        </div>
      ) : null}

      <Panel>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl font-semibold text-navy">Most recent</h2>
          <Link href="/staff/enquiries" className="font-semibold text-navy underline underline-offset-4">
            All enquiries
          </Link>
        </div>
        {isPending ? (
          <SkeletonBlock className="mt-4 h-40" />
        ) : recent.length === 0 ? (
          <p className="mt-4 text-base text-ink-muted">No enquiries yet. New ones will appear here within about 30 seconds.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {recent.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/staff/enquiries?open=${encodeURIComponent(item.id)}`} className="min-w-0 font-semibold text-navy underline-offset-4 hover:underline">
                  {item.parentName} <span className="font-normal text-ink-muted">· {item.desiredLevel}</span>
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ink-muted">{formatEatDateTime(item.createdAt)}</span>
                  <StatusBadge status={item.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
