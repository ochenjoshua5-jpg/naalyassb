import { NextResponse } from "next/server";
import { getStaffMode } from "./config";
import { getStaffSession, type StaffSession } from "./session";
import { hasPermission, type Permission } from "./roles";
import { logStaff } from "./audit";

export type GuardResult =
  | { ok: true; session: StaffSession }
  | { ok: false; response: NextResponse };

function refuse(status: number, body: Record<string, unknown>): NextResponse {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

/**
 * Server-side permission gate for every staff API route. The UI hiding a button is never the control:
 * each route calls this and the database policy is the second layer.
 *
 * Order matters: disabled -> 404 (feature hidden), signed out -> 401, signed in without the
 * permission -> 403, Clerk unreachable -> 503 (fail closed, never a guessed role).
 */
export async function requireStaff(request: Request, permission: Permission, action: string): Promise<GuardResult> {
  if (getStaffMode() === "disabled") {
    return { ok: false, response: refuse(404, { error: "Not found" }) };
  }

  // Cross-site writes are refused even with a valid session (CSRF). Browsers send Origin on writes.
  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    if (origin) {
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        originHost = "";
      }
      const requestHost = request.headers.get("host") ?? new URL(request.url).host;
      if (originHost !== requestHost) {
        logStaff("staff_csrf_refused", { action });
        return { ok: false, response: refuse(403, { error: "Insufficient permissions" }) };
      }
    }
  }

  const result = await getStaffSession(request.headers);

  if (result.status === "unavailable") {
    logStaff("staff_auth_unavailable", { action });
    return {
      ok: false,
      response: refuse(503, {
        error: "The sign-in check is unavailable right now. Your work has not been changed. Please try again in a minute.",
      }),
    };
  }

  if (result.status === "anonymous") {
    logStaff("staff_anonymous", { action });
    return { ok: false, response: refuse(401, { error: "Authentication required" }) };
  }

  if (!hasPermission(result.session.role, permission)) {
    logStaff("staff_forbidden", { action, user: result.session.userId, permission });
    return { ok: false, response: refuse(403, { error: "Insufficient permissions" }) };
  }

  return { ok: true, session: result.session };
}
