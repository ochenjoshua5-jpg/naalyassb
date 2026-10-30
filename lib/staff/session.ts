import { getStaffMode } from "./config";
import { fetchStaffLookup } from "./clerk-role";
import { parseStaffRole, type StaffRole } from "./roles";
import { isProductionRuntime } from "@/lib/enquiry/config";

export interface StaffSession {
  userId: string;
  displayName: string;
  /** null means signed in but no staff role: every staff permission is refused. */
  role: StaffRole | null;
}

export type SessionResult =
  | { status: "anonymous" }
  | { status: "unavailable" }
  | { status: "signed-in"; session: StaffSession };

export const TEST_USER_HEADER = "x-test-staff-user";
export const TEST_ROLE_HEADER = "x-test-staff-role";
export const TEST_NAME_HEADER = "x-test-staff-name";

/**
 * Who is calling? Returns anonymous when nobody is signed in.
 *
 * - disabled: always anonymous (the routes answer 404 before this is ever used).
 * - test: reads the test headers. Refused in production, and only reachable when STAFF_DASHBOARD=test.
 * - clerk: asks Clerk for the signed-in user, then reads that user's role from Clerk.
 */
export async function getStaffSession(headers: Headers): Promise<SessionResult> {
  const mode = getStaffMode();

  if (mode === "test") {
    if (isProductionRuntime()) return { status: "anonymous" };
    const userId = headers.get(TEST_USER_HEADER);
    if (!userId) return { status: "anonymous" };
    return {
      status: "signed-in",
      session: {
        userId: userId.slice(0, 64),
        displayName: (headers.get(TEST_NAME_HEADER) ?? "Test staff").slice(0, 80),
        role: parseStaffRole(headers.get(TEST_ROLE_HEADER)),
      },
    };
  }

  if (mode === "clerk") {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) return { status: "anonymous" };
    const secret = process.env.CLERK_SECRET_KEY ?? "";
    const lookup = await fetchStaffLookup(userId, secret);
    if (lookup.status === "unavailable") return { status: "unavailable" };
    // Banned or locked users keep no staff role, even if their metadata still says admin.
    const role = lookup.banned ? null : parseStaffRole(lookup.staffRole);
    return {
      status: "signed-in",
      session: { userId, displayName: lookup.displayName || "Staff member", role },
    };
  }

  return { status: "anonymous" };
}
