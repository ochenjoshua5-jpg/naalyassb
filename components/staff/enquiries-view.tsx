"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Table2 } from "lucide-react";
import { useEnquiries } from "./use-enquiries";
import { EnquiryTable } from "./enquiry-table";
import { EnquiryKanban } from "./enquiry-kanban";
import { Callout, Panel, SkeletonBlock, SyncingNote } from "./ui";
import { useIsDesktop, useNow } from "./use-view";
import { useLocal, writeLocal } from "./use-local";
import { useStaff } from "./staff-context";
import { RESPONSE_TARGET_HOURS, STATUS_LABEL, ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/enquiry/status";
import { filterEnquiries, type FilterState, type RangeFilter } from "@/lib/staff/filter";
import { overdueItems } from "@/lib/staff/metrics";
import { Button } from "@/components/ui/button";

const VIEW_KEY = "staff:enquiry-view";

export function EnquiriesView() {
  return (
    <Suspense fallback={<SkeletonBlock className="h-96" />}>
      <EnquiriesContent />
    </Suspense>
  );
}

function EnquiriesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { canUpdate } = useStaff();
  const { data, error, isPending, isFetching, refetch } = useEnquiries();
  const isDesktop = useIsDesktop();

  const [filters, setFilters] = useState<FilterState>({ search: "", status: "all", range: "all" });
  const storedView = useLocal(VIEW_KEY);
  const [message, setMessage] = useState("");
  const openId = params.get("open");
  // null = nothing chosen by the user yet, so the row named in the link (?open=) is shown open.
  const [expanded, setExpanded] = useState<{ id: string | null } | null>(null);
  const expandedId = expanded ? expanded.id : openId;
  const now = useNow();

  // Board is the desktop default. Phones and tablets always get the table (the board is too cramped).
  const preferred = storedView === "table" ? "table" : "board";
  const view = !isDesktop ? "table" : openId ? "table" : preferred;

  function chooseView(next: "table" | "board") {
    writeLocal(VIEW_KEY, next);
  }

  const items = useMemo(() => data?.items ?? [], [data]);
  const overdue = useMemo(() => overdueItems(items, now), [items, now]);
  const filtered = useMemo(() => filterEnquiries(items, filters, now), [items, filters, now]);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <p className="sr-only">Loading enquiries</p>
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-96 w-full" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <Callout tone="urgent" title="We couldn’t load the enquiries just now.">
        <p>{error.message} Nothing has been changed.</p>
        <Button className="mt-3 min-h-11" onClick={() => void refetch()}>
          Try again
        </Button>
      </Callout>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-navy md:text-4xl">Enquiries</h1>
          <p className="mt-2 text-base text-ink-muted">
            New enquiries appear here within about 30 seconds. {items.length} in total.
          </p>
          <SyncingNote active={isFetching && !isPending} />
        </div>
        {isDesktop && !openId ? (
          <div role="group" aria-label="Choose how to view enquiries" className="inline-flex rounded-xl border-2 border-navy p-1">
            <button
              type="button"
              aria-pressed={view === "board"}
              onClick={() => chooseView("board")}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 font-semibold ${view === "board" ? "bg-navy text-warm-white" : "text-navy"}`}
            >
              <LayoutGrid aria-hidden className="size-5" /> Board
            </button>
            <button
              type="button"
              aria-pressed={view === "table"}
              onClick={() => chooseView("table")}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 font-semibold ${view === "table" ? "bg-navy text-warm-white" : "text-navy"}`}
            >
              <Table2 aria-hidden className="size-5" /> Table
            </button>
          </div>
        ) : null}
      </header>

      {overdue.length > 0 ? (
        <Callout tone="urgent" title={`⚠️ ${overdue.length} ${overdue.length === 1 ? "enquiry has" : "enquiries have"} not been contacted in over ${RESPONSE_TARGET_HOURS} hours`}>
          <p>
            Oldest first:{" "}
            {overdue.slice(0, 3).map((item) => item.parentName).join(", ")}
            {overdue.length > 3 ? ` and ${overdue.length - 3} more` : ""}. Filter by New to see them all.
          </p>
        </Callout>
      ) : null}

      <Panel className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem_12rem] md:items-end">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-navy">Search</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => setFilters((f) => ({ ...f, search: event.target.value }))}
            placeholder="Name, phone, reference or email"
            className="min-h-12 rounded-xl border border-line bg-card px-4 text-base text-navy placeholder:text-ink-muted"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-navy">Status</span>
          <select
            value={filters.status}
            onChange={(event) => setFilters((f) => ({ ...f, status: event.target.value }))}
            className="min-h-12 rounded-xl border border-line bg-card px-3 text-base text-navy"
          >
            <option value="all">All statuses</option>
            {ENQUIRY_STATUSES.map((status: EnquiryStatus) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-navy">Show</span>
          <select
            value={filters.range}
            onChange={(event) => setFilters((f) => ({ ...f, range: event.target.value as RangeFilter }))}
            className="min-h-12 rounded-xl border border-line bg-card px-3 text-base text-navy"
          >
            <option value="all">All dates</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
        </label>
      </Panel>

      <p role="status" className="text-sm font-semibold text-navy">
        {filtered.length === items.length ? `Showing all ${items.length}` : `Showing ${filtered.length} of ${items.length}`} enquiries.
      </p>
      {message ? (
        <p role="status" className="rounded-xl bg-gold-tint px-4 py-3 text-base font-semibold text-navy">
          {message}
        </p>
      ) : null}

      {view === "board" && canUpdate ? (
        <EnquiryKanban items={filtered} onMessage={setMessage} />
      ) : (
        <EnquiryTable
          rows={filtered}
          expandedId={expandedId}
          onExpandedChange={(id) => {
            setExpanded({ id });
            if (id === null && openId) router.replace("/staff/enquiries");
          }}
          onMessage={setMessage}
        />
      )}
    </div>
  );
}
