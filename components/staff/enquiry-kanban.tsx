"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { StatusBadge } from "./ui";
import { useStatusMutation } from "./use-enquiries";
import { useStaff } from "./staff-context";
import type { StaffEnquiryView } from "@/lib/staff/enquiry-service";
import { KANBAN_STATUSES, STATUS_LABEL, ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/enquiry/status";
import { formatEatDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";

const COLUMN_HEADER: Record<EnquiryStatus, string> = {
  new: "bg-gold text-navy",
  contacted: "bg-emerald-700 text-white",
  "visit-scheduled": "bg-sky-800 text-white",
  enrolled: "bg-emerald-950 text-white",
  withdrawn: "bg-stone-500 text-white",
};

interface Props {
  items: StaffEnquiryView[];
  onMessage: (text: string) => void;
}

/**
 * Drag between columns with the mouse, touch, or keyboard (focus the grip, press Space, use arrow keys,
 * press Space to drop). Each card also has a "Move to" list, so nothing depends on dragging.
 * Oldest first in each column, so the most urgent enquiry is at the top.
 */
export function EnquiryKanban({ items, onMessage }: Props) {
  const { canUpdate } = useStaff();
  const { mutate: setStatus } = useStatusMutation();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const active = activeId ? items.find((item) => item.id === activeId) ?? null : null;

  function move(item: StaffEnquiryView, target: EnquiryStatus) {
    if (!canUpdate || item.status === target) return;
    setStatus({ id: item.id, status: target, label: item.parentName });
    onMessage(`${item.parentName} moved to ${STATUS_LABEL[target]}.`);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const item = items.find((candidate) => candidate.id === String(event.active.id));
    const target = event.over?.id as EnquiryStatus | undefined;
    if (!item || !target || !KANBAN_STATUSES.includes(target)) return;
    move(item, target);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(event: DragStartEvent) => setActiveId(String(event.active.id))}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-2">
        {KANBAN_STATUSES.map((status) => (
          <Column key={status} status={status} items={items.filter((item) => item.status === status)} header={COLUMN_HEADER[status]} canMove={canUpdate} onMove={move} />
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        Withdrawn enquiries appear in the table view only.
      </p>
      <DragOverlay>
        {active ? (
          <div className="w-72 rounded-2xl border-2 border-gold bg-card p-4 opacity-95 shadow-2xl">
            <p className="font-semibold text-navy">{active.parentName}</p>
            <p className="text-sm text-ink-muted">{active.reference}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  status,
  items,
  header,
  canMove,
  onMove,
}: {
  status: EnquiryStatus;
  items: StaffEnquiryView[];
  header: string;
  canMove: boolean;
  onMove: (item: StaffEnquiryView, target: EnquiryStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const sorted = [...items].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  return (
    <section
      ref={setNodeRef}
      aria-label={`${STATUS_LABEL[status]} column, ${items.length} enquiries`}
      className={cn(
        "flex min-h-64 flex-col rounded-2xl border-2 bg-card transition-colors",
        isOver ? "border-gold" : "border-transparent",
      )}
    >
      <header className={cn("flex items-center justify-between rounded-t-2xl px-4 py-3 font-semibold", header)}>
        <h2 className="text-lg">{STATUS_LABEL[status]}</h2>
        <span className="rounded-full bg-warm-white/25 px-3 py-0.5 text-sm tabular-nums">{items.length}</span>
      </header>
      <ul className="flex flex-col gap-3 p-3">
        {sorted.length === 0 ? <li className="px-2 py-6 text-center text-sm text-ink-muted">No enquiries here</li> : null}
        {sorted.map((item) => (
          <Card key={item.id} item={item} canMove={canMove} onMove={onMove} />
        ))}
      </ul>
    </section>
  );
}

function Card({
  item,
  canMove,
  onMove,
}: {
  item: StaffEnquiryView;
  canMove: boolean;
  onMove: (item: StaffEnquiryView, target: EnquiryStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id, disabled: !canMove });
  return (
    <li
      ref={setNodeRef}
      className={cn("rounded-xl border border-line bg-warm-white p-4 shadow-sm transition-shadow", isDragging && "opacity-40 shadow-lg")}
    >
      <div className="flex items-start gap-2">
        {canMove ? (
          <button
            type="button"
            {...listeners}
            {...attributes}
            aria-label={`Drag ${item.parentName}. Press Space to pick up, arrow keys to move, Space to drop.`}
            className="mt-0.5 inline-flex size-11 -ml-2 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-navy hover:bg-gold-tint focus-visible:outline-2 focus-visible:outline-gold"
          >
            <GripVertical aria-hidden className="size-5" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-navy">{item.parentName}</p>
          <p className="text-sm text-ink-muted">{item.reference}</p>
          <p className="mt-1 text-sm tabular-nums">{item.phone}</p>
          <p className="text-sm text-ink-muted">
            {item.desiredLevel} · {formatEatDateTime(item.createdAt)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <StatusBadge status={item.status} />
        {canMove ? (
          <label className="flex items-center gap-2 text-sm font-semibold text-navy">
            <span>Move to</span>
            <select
              className="min-h-11 rounded-xl border border-line bg-card px-2 text-base"
              value={item.status}
              onChange={(event) => onMove(item, event.target.value as EnquiryStatus)}
            >
              {ENQUIRY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </li>
  );
}
