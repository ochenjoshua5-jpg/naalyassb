import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff/guard";
import { logStaff } from "@/lib/staff/audit";
import { StoreUnavailableError } from "@/lib/enquiry/store";
import { isEnquiryId, staffStore, statusPatchSchema, toStaffView } from "@/lib/staff/enquiry-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 1024;
const NOT_FOUND = "We couldn’t find that enquiry. It may have been removed.";
const UNAVAILABLE = "We couldn’t save that change just now. Nothing has been changed. Please try again.";

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

type Context = { params: Promise<{ id: string }> };

/** PATCH /api/staff/enquiries/[id] body {"status": "..."}. Needs enquiries:update. */
export async function PATCH(request: Request, context: Context) {
  const guard = await requireStaff(request, "enquiries:update", "status");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!isEnquiryId(id)) return json(404, { error: NOT_FOUND });

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json(415, { error: "Please send the change as JSON." });
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json(413, { error: "That change is too large." });
  }
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw);
  } catch {
    return json(400, { error: "We couldn’t read that change. Please try again." });
  }
  const parsed = statusPatchSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return json(422, { error: "Choose one of the listed statuses. Only the status can be changed here." });
  }

  const store = staffStore();
  if (!store) return json(503, { error: UNAVAILABLE });

  try {
    const updated = await store.updateStatus(id, parsed.data.status, new Date());
    if (!updated) return json(404, { error: NOT_FOUND });
    logStaff("staff_status_changed", { user: guard.session.userId, record: id, status: parsed.data.status });
    return json(200, { item: toStaffView(updated) });
  } catch (error) {
    logStaff("staff_status_failed", {
      action: "status",
      record: id,
      error: error instanceof StoreUnavailableError ? "not-connected" : "store-error",
    });
    return json(503, { error: UNAVAILABLE });
  }
}

/** DELETE /api/staff/enquiries/[id]. Admin only: enquiries:delete is not granted to admissions. */
export async function DELETE(request: Request, context: Context) {
  const guard = await requireStaff(request, "enquiries:delete", "delete");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!isEnquiryId(id)) return json(404, { error: NOT_FOUND });

  const store = staffStore();
  if (!store) return json(503, { error: UNAVAILABLE });

  try {
    const removed = await store.remove(id);
    if (!removed) return json(404, { error: NOT_FOUND });
    logStaff("staff_deleted", { user: guard.session.userId, record: id });
    return json(200, { ok: true });
  } catch (error) {
    logStaff("staff_delete_failed", {
      user: guard.session.userId,
      record: id,
      error: error instanceof StoreUnavailableError ? "not-connected" : "store-error",
    });
    return json(503, { error: UNAVAILABLE });
  }
}
