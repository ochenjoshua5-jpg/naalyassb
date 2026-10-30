"use client";

import { Fragment, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  type PaginationState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { StatusBadge, Panel } from "./ui";
import { useDeleteMutation, useStatusMutation } from "./use-enquiries";
import { downloadCsv, toCsvRows } from "./export";
import { useStaff } from "./staff-context";
import type { StaffEnquiryView } from "@/lib/staff/enquiry-service";
import { ENQUIRY_STATUSES, STATUS_LABEL, type EnquiryStatus } from "@/lib/enquiry/status";
import { formatEatDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

interface Props {
  rows: StaffEnquiryView[];
  expandedId: string | null;
  onExpandedChange: (id: string | null) => void;
  onMessage: (text: string) => void;
}

export function EnquiryTable({ rows, expandedId, onExpandedChange, onMessage }: Props) {
  const { canUpdate, canDelete } = useStaff();
  const statusMutation = useStatusMutation();
  const { mutate: setStatus } = statusMutation;
  const deleteMutation = useDeleteMutation();
  const { mutate: deleteEnquiry } = deleteMutation;

  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StaffEnquiryView | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const columns = useMemo<ColumnDef<StaffEnquiryView>[]>(() => {
    const list: ColumnDef<StaffEnquiryView>[] = [];

    if (canUpdate) {
      list.push({
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all enquiries on this page"
            className="size-5 accent-navy"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.parentName}`}
            className="size-5 accent-navy"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      });
    }

    list.push(
      {
        id: "parentName",
        accessorKey: "parentName",
        header: "Parent name",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-semibold text-navy">{row.original.parentName}</p>
            <p className="text-sm text-ink-muted">{row.original.reference}</p>
          </div>
        ),
      },
      { id: "phone", accessorKey: "phone", header: "Phone", cell: ({ getValue }) => <span className="whitespace-nowrap tabular-nums">{String(getValue())}</span> },
      {
        id: "desiredLevel",
        accessorKey: "desiredLevel",
        header: "Level",
        meta: { className: "hidden md:table-cell" },
        cell: ({ getValue }) => <span className="whitespace-nowrap">{String(getValue())}</span>,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const item = row.original;
          if (canUpdate && editingId === item.id) {
            return (
              <select
                autoFocus
                aria-label={`Change status for ${item.parentName}`}
                className="min-h-11 rounded-xl border border-navy/30 bg-card px-3 text-base text-navy"
                defaultValue={item.status}
                onBlur={() => setEditingId(null)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setEditingId(null);
                }}
                onChange={(event) => {
                  const next = event.target.value as EnquiryStatus;
                  setEditingId(null);
                  if (next !== item.status) {
                    setStatus({ id: item.id, status: next, label: item.parentName });
                  }
                }}
              >
                {ENQUIRY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            );
          }
          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canUpdate}
                onDoubleClick={() => canUpdate && setEditingId(item.id)}
                aria-label={canUpdate ? `${item.parentName}: ${STATUS_LABEL[item.status]}. Double-click or use Change to edit.` : undefined}
                className="rounded-full disabled:cursor-default"
              >
                <StatusBadge status={item.status} />
              </button>
              {canUpdate ? (
                <button
                  type="button"
                  onClick={() => setEditingId(item.id)}
                  aria-label={`Change status for ${item.parentName}`}
                  className="inline-flex size-11 items-center justify-center rounded-xl text-navy hover:bg-gold-tint"
                >
                  <Pencil aria-hidden className="size-4" />
                </button>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Submitted (EAT)",
        cell: ({ row }) => <span className="whitespace-nowrap text-sm">{formatEatDateTime(row.original.createdAt)}</span>,
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const item = row.original;
          const open = expandedId === item.id;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => onExpandedChange(open ? null : item.id)}
                aria-expanded={open}
                aria-label={`${open ? "Hide" : "View"} details for ${item.parentName}`}
                className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 font-semibold text-navy hover:bg-gold-tint"
              >
                {open ? <ChevronUp aria-hidden className="size-4" /> : <ChevronDown aria-hidden className="size-4" />}
                {open ? "Hide" : "View"}
              </button>
              {canDelete ? (
                <button
                  type="button"
                  onClick={() => setPendingDelete(item)}
                  aria-label={`Delete enquiry from ${item.parentName}`}
                  className="inline-flex size-11 items-center justify-center rounded-xl text-red-800 hover:bg-red-50"
                >
                  <Trash2 aria-hidden className="size-5" />
                </button>
              ) : null}
            </div>
          );
        },
      },
    );
    return list;
    // editingId and expandedId drive the rendered cells; the table rebuilds its column defs when they change.
  }, [canUpdate, canDelete, editingId, expandedId, onExpandedChange, setStatus]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, rowSelection, columnVisibility, pagination },
    getRowId: (row) => row.id,
    enableRowSelection: canUpdate,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selected = table.getSelectedRowModel().rows.map((row) => row.original);
  const pageCount = Math.max(1, table.getPageCount());
  const current = table.getState().pagination.pageIndex;
  const totalRows = table.getPrePaginationRowModel().rows.length;
  const first = totalRows === 0 ? 0 : current * PAGE_SIZE + 1;
  const last = Math.min(totalRows, (current + 1) * PAGE_SIZE);

  async function markSelectedContacted() {
    const eligible = selected.filter((item) => item.status === "new");
    const skipped = selected.length - eligible.length;
    if (eligible.length === 0) {
      onMessage("None of the selected enquiries are waiting as New, so nothing was changed.");
      return;
    }
    setBulkBusy(true);
    const results = await Promise.allSettled(
      eligible.map((item) =>
        statusMutation.mutateAsync({ id: item.id, status: "contacted", label: item.parentName, silent: true }),
      ),
    );
    setBulkBusy(false);
    const failed = results.filter((result) => result.status === "rejected").length;
    const done = eligible.length - failed;
    const skippedText = skipped > 0 ? ` ${skipped} already past New, so left as they are.` : "";
    if (failed === 0) {
      onMessage(`${done} enquir${done === 1 ? "y" : "ies"} marked as Contacted.${skippedText}`);
    } else {
      onMessage(`${done} marked as Contacted; ${failed} could not be changed and are still New. Please try again.${skippedText}`);
    }
    setRowSelection({});
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    deleteEnquiry({ id: target.id, label: target.parentName });
  }

  const sortIcon = (columnId: string) => {
    const sort = sorting.find((s) => s.id === columnId);
    if (!sort) return <ArrowUpDown aria-hidden className="size-4 opacity-50" />;
    return sort.desc ? <ArrowDown aria-hidden className="size-4" /> : <ArrowUp aria-hidden className="size-4" />;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <details className="relative">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-line bg-card px-4 font-semibold text-navy">
            Columns
          </summary>
          <div className="absolute z-20 mt-2 flex w-56 flex-col gap-2 rounded-2xl border border-line bg-card p-4 shadow-xl">
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <label key={column.id} className="flex min-h-11 items-center gap-3 text-base text-navy">
                  <input type="checkbox" className="size-5 accent-navy" checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()} />
                  {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
                </label>
              ))}
          </div>
        </details>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => downloadCsv(toCsvRows(table.getPrePaginationRowModel().rows.map((row) => row.original)))}
          disabled={totalRows === 0}
        >
          Export to CSV ({totalRows})
        </Button>
      </div>

      {canUpdate && selected.length > 0 ? (
        <Panel className="flex flex-wrap items-center justify-between gap-3 border-l-4 border-gold">
          <p className="font-semibold text-navy" aria-live="polite">
            {selected.length} selected
          </p>
          <div className="flex gap-2">
            <Button onClick={markSelectedContacted} disabled={bulkBusy} className="min-h-11">
              {bulkBusy ? "Marking…" : "Mark as Contacted"}
            </Button>
            <Button variant="outline" className="min-h-11" onClick={() => setRowSelection({})}>
              Clear selection
            </Button>
          </div>
        </Panel>
      ) : null}

      <div className="relative overflow-x-auto rounded-2xl bg-card shadow-sm shadow-navy/5">
        <table className="w-full min-w-[40rem] border-collapse text-left text-base">
          <caption className="sr-only">Enquiries, sorted by the column chosen in the headers</caption>
          <thead className="bg-soft-grey/60 text-sm font-semibold text-navy">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta as { className?: string } | undefined;
                  const sortable = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        sortable && sorting.find((s) => s.id === header.column.id)
                          ? sorting.find((s) => s.id === header.column.id)?.desc
                            ? "descending"
                            : "ascending"
                          : undefined
                      }
                      className={cn("px-4 py-3 align-middle", meta?.className)}
                    >
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortIcon(header.column.id)}
                        </button>
                      ) : (
                        <span className="inline-flex min-h-11 items-center">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-10 text-center text-ink-muted">
                  No enquiries match these filters. Try clearing the search or the status filter.
                </td>
              </tr>
            ) : null}
            {table.getRowModel().rows.map((row) => {
              const item = row.original;
              const open = expandedId === item.id;
              return (
                <Fragment key={row.id}>
                  <tr className={cn("border-t border-line", row.getIsSelected() && "bg-gold-tint/50", open && "bg-warm-white")}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                      return (
                        <td key={cell.id} className={cn("px-4 py-3 align-middle", meta?.className)}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                  {open ? (
                    <tr className="bg-warm-white">
                      <td colSpan={table.getVisibleLeafColumns().length} className="px-4 pb-6 pt-2">
                        <dl className="grid gap-4 rounded-2xl border border-line bg-card p-5 text-base md:grid-cols-2">
                          <div>
                            <dt className="text-sm font-semibold text-ink-muted">Level and learner age</dt>
                            <dd className="text-navy">
                              {item.desiredLevel}, age {item.learnerAge}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-semibold text-ink-muted">Preferred intake</dt>
                            <dd className="text-navy">{item.preferredIntake === "not-sure" ? "Not sure yet" : "Next available"}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-semibold text-ink-muted">Email</dt>
                            <dd className="break-all text-navy">{item.email ?? "Not given"}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-semibold text-ink-muted">Consent</dt>
                            <dd className="text-navy">
                              Given. Notice version {item.consentNoticeVersion}. Submitted {formatEatDateTime(item.createdAt)}.
                            </dd>
                          </div>
                          <div className="md:col-span-2">
                            <dt className="text-sm font-semibold text-ink-muted">Question from the parent</dt>
                            <dd className="whitespace-pre-wrap break-words text-navy">{item.question ?? "No question was written."}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-semibold text-ink-muted">First reply recorded</dt>
                            <dd className="text-navy">{item.contactedAt ? formatEatDateTime(item.contactedAt) : "Not yet"}</dd>
                          </div>
                        </dl>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <nav aria-label="Enquiry pages" className="flex flex-wrap items-center justify-between gap-3 text-base">
        <p aria-live="polite" className="text-ink-muted">
          Showing {first}–{last} of {totalRows} enquiries
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="min-h-11" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <label className="flex items-center gap-2">
            <span className="sr-only">Go to page</span>
            <select
              className="min-h-11 rounded-xl border border-line bg-card px-3"
              value={current}
              onChange={(event) => table.setPageIndex(Number(event.target.value))}
            >
              {Array.from({ length: pageCount }, (_, index) => (
                <option key={index} value={index}>
                  Page {index + 1} of {pageCount}
                </option>
              ))}
            </select>
          </label>
          <Button variant="outline" className="min-h-11" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </nav>

      <Dialog open={pendingDelete !== null} onClose={() => setPendingDelete(null)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-navy/40" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-2xl bg-warm-white p-6 shadow-2xl">
            <DialogTitle className="font-serif text-2xl font-semibold text-navy">Delete this enquiry?</DialogTitle>
            <p className="mt-3 text-base text-ink-muted">
              The enquiry from {pendingDelete?.parentName} ({pendingDelete?.reference}) will be removed for good. This cannot be undone.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="outline" className="min-h-11" onClick={() => setPendingDelete(null)} autoFocus>
                Keep it
              </Button>
              <Button className="min-h-11 bg-red-800 text-white hover:bg-red-900" onClick={confirmDelete}>
                Delete enquiry
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
