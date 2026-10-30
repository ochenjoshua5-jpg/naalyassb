import { isProductionRuntime } from "@/lib/enquiry/config";

/**
 * Staff dashboard mode, decided from server environment variables on each request.
 *
 * - "disabled" (default): every /staff page and /api/staff route answers 404. The public preview is here.
 * - "clerk": the real dashboard. Needs STAFF_DASHBOARD=clerk, STAFF_DASHBOARD_APPROVED=yes,
 *   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY. Not enabled anywhere in this preview.
 * - "test": test-only sign-in via request headers. Refused when NODE_ENV or VERCEL_ENV is production.
 */
export type StaffMode = "disabled" | "clerk" | "test";

const warned = new Set<string>();
function warnOnce(message: string) {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(JSON.stringify({ level: "warn", event: "staff_config", message }));
}

export function getStaffMode(): StaffMode {
  const raw = (process.env.STAFF_DASHBOARD ?? "disabled").trim();
  if (raw === "" || raw === "disabled") return "disabled";

  if (raw === "test") {
    if (isProductionRuntime()) {
      warnOnce("STAFF_DASHBOARD=test is refused in production; the staff dashboard stays disabled.");
      return "disabled";
    }
    return "test";
  }

  if (raw === "clerk") {
    const approved = process.env.STAFF_DASHBOARD_APPROVED === "yes";
    const complete = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
    if (approved && complete) return "clerk";
    warnOnce("STAFF_DASHBOARD=clerk needs STAFF_DASHBOARD_APPROVED=yes and both Clerk keys. The dashboard stays disabled.");
    return "disabled";
  }

  warnOnce("Unknown STAFF_DASHBOARD value. The dashboard stays disabled.");
  return "disabled";
}
