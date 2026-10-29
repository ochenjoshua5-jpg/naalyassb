import type { EnquiryMode } from "./config";
import { isEnquiryTestMode } from "./config";

export type TurnstileResult =
  | { ok: true; skipped: boolean }
  | { ok: false; reason: "missing-token" | "rejected" | "not-configured" | "unreachable" };

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile token on the server. The secret never leaves the server.
 * In test modes the check is skipped (the sandbox cannot reach Cloudflare). Production fails closed.
 */
export async function verifyTurnstile(
  mode: EnquiryMode,
  token: string | undefined,
  remoteIp: string,
): Promise<TurnstileResult> {
  if (isEnquiryTestMode(mode)) return { ok: true, skipped: true };

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: false, reason: "not-configured" };
  if (!token) return { ok: false, reason: "missing-token" };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);
    const response = await fetch(SITEVERIFY, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return { ok: false, reason: "unreachable" };
    const data = (await response.json()) as { success?: boolean };
    return data.success ? { ok: true, skipped: false } : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
