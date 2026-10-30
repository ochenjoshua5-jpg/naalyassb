import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff/guard";
import { logStaff } from "@/lib/staff/audit";
import { StoreUnavailableError } from "@/lib/enquiry/store";
import { staffStore, toStaffView } from "@/lib/staff/enquiry-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UNAVAILABLE =
  "We couldn’t load the enquiry list just now. Nothing has been changed. Please refresh in a minute.";

/** GET /api/staff/enquiries: every enquiry, newest first. Needs enquiries:read. */
export async function GET(request: Request) {
  const guard = await requireStaff(request, "enquiries:read", "list");
  if (!guard.ok) return guard.response;

  const store = staffStore();
  if (!store) {
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503, headers: { "cache-control": "no-store" } });
  }

  try {
    const records = await store.list();
    const items = records
      .map(toStaffView)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    logStaff("staff_list", { user: guard.session.userId, count: items.length });
    return NextResponse.json(
      { items, fetchedAt: new Date().toISOString() },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logStaff("staff_status_failed", {
      action: "list",
      error: error instanceof StoreUnavailableError ? "not-connected" : "store-error",
    });
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
