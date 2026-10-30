/**
 * Reads a user's staff metadata from Clerk's Backend API (user public metadata).
 *
 * Written with plain fetch (no SDK) so the Node unit tests can intercept it with MSW.
 * It returns the RAW role string and the banned flag. The caller (session.ts) validates the role
 * against the allow-list in roles.ts. Anything unexpected returns "unavailable", never a guess.
 *
 * Import-free on purpose, so it runs under Node's type stripping in the unit tests.
 */

export const CLERK_API_BASE = "https://api.clerk.com/v1";

export type StaffLookup =
  | { status: "ok"; staffRole: unknown; banned: boolean; displayName: string }
  | { status: "unavailable" };

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export async function fetchStaffLookup(
  userId: string,
  secretKey: string,
  fetchImpl: FetchLike = fetch,
): Promise<StaffLookup> {
  if (!/^user_[A-Za-z0-9]+$/.test(userId)) return { status: "ok", staffRole: null, banned: true, displayName: "" };

  let response: Response;
  try {
    response = await fetchImpl(`${CLERK_API_BASE}/users/${encodeURIComponent(userId)}`, {
      method: "GET",
      headers: { authorization: `Bearer ${secretKey}`, accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    return { status: "unavailable" };
  }

  if (response.status === 404) return { status: "ok", staffRole: null, banned: true, displayName: "" };
  if (!response.ok) return { status: "unavailable" };

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { status: "unavailable" };
  }
  if (!body || typeof body !== "object") return { status: "unavailable" };

  const user = body as Record<string, unknown>;
  const metadata = (user.public_metadata ?? {}) as Record<string, unknown>;
  const banned = user.banned === true || user.locked === true;
  const first = typeof user.first_name === "string" ? user.first_name : "";
  const last = typeof user.last_name === "string" ? user.last_name : "";
  const displayName = `${first} ${last}`.trim();

  return { status: "ok", staffRole: metadata.staffRole ?? null, banned, displayName };
}
