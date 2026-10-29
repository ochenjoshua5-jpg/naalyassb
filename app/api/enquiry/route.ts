import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getEnquiryMode, isEnquiryTestMode } from "@/lib/enquiry/config";
import { HONEYPOT_FIELD, PRIVACY_NOTICE_VERSION, enquirySchema, type EnquiryData } from "@/lib/enquiry/schema";
import { createRateLimiter, clientIp, hashClient } from "@/lib/enquiry/rate-limit";
import { verifyTurnstile } from "@/lib/enquiry/turnstile";
import { createStore, type EnquiryRecord } from "@/lib/enquiry/store";
import { formatEat, logEnquiry, newRequestId } from "@/lib/enquiry/log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024;

/** Shown whenever the enquiry cannot be saved. Never a false success. */
const UNAVAILABLE_MESSAGE =
  "We couldn’t save your enquiry just now, so it has not been received. Please try again in a few minutes, or use the Education Hub or the admissions page in the meantime.";

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

function newReference(now: Date): string {
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const code = randomBytes(4).toString("hex").toUpperCase();
  return `ENQ-${stamp}-${code}`;
}

export async function POST(request: Request) {
  const requestId = newRequestId();
  const mode = getEnquiryMode();

  if (mode === "disabled") {
    logEnquiry("enquiry_disabled", { request_id: requestId });
    return json(503, { ok: false, code: "DISABLED", message: UNAVAILABLE_MESSAGE });
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    logEnquiry("enquiry_bad_request", { request_id: requestId, reason: "content-type" });
    return json(415, { ok: false, code: "BAD_CONTENT_TYPE", message: "Please send your enquiry from the form on this page." });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    logEnquiry("enquiry_bad_request", { request_id: requestId, reason: "too-large" });
    return json(413, { ok: false, code: "TOO_LARGE", message: "That enquiry is too long. Please shorten your question and try again." });
  }

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    logEnquiry("enquiry_bad_request", { request_id: requestId, reason: "json" });
    return json(400, { ok: false, code: "BAD_JSON", message: "We couldn’t read that enquiry. Please try again from the form." });
  }

  // Honeypot: a real parent never fills this field. Refuse rather than pretend success.
  if (typeof body[HONEYPOT_FIELD] === "string" && body[HONEYPOT_FIELD].length > 0) {
    logEnquiry("enquiry_bad_request", { request_id: requestId, reason: "honeypot" });
    return json(400, { ok: false, code: "REJECTED", message: UNAVAILABLE_MESSAGE });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    logEnquiry("enquiry_invalid", { request_id: requestId, fields: Object.keys(fieldErrors).length });
    return json(422, {
      ok: false,
      code: "INVALID",
      message: "Please check the highlighted fields. Your answers are still in the form.",
      fieldErrors,
    });
  }
  const data: EnquiryData = parsed.data;

  const ip = clientIp(request.headers);
  const clientKey = hashClient(ip);
  try {
    const limit = await createRateLimiter(mode).consume(clientKey);
    if (!limit.ok) {
      logEnquiry("enquiry_rate_limited", { request_id: requestId });
      return json(429, {
        ok: false,
        code: "RATE_LIMITED",
        message:
          "You have sent several enquiries from this connection in the last hour. Please wait a while before trying again, or use the Education Hub or the admissions page.",
      });
    }
  } catch {
    logEnquiry("enquiry_store_error", { request_id: requestId, stage: "rate-limit" });
    return json(503, { ok: false, code: "UNAVAILABLE", message: UNAVAILABLE_MESSAGE });
  }

  const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : undefined;
  const turnstile = await verifyTurnstile(mode, turnstileToken, ip);
  if (!turnstile.ok) {
    logEnquiry("enquiry_turnstile_failed", { request_id: requestId, reason: turnstile.reason });
    const message =
      turnstile.reason === "missing-token"
        ? "Please complete the short security check, then send your enquiry again."
        : "We couldn’t confirm the security check. Please try again, or use the Education Hub or the admissions page.";
    return json(403, { ok: false, code: "TURNSTILE", message });
  }

  const now = new Date();
  const record: EnquiryRecord = {
    id: crypto.randomUUID(),
    reference: newReference(now),
    parentName: data.parentName,
    phone: data.phone,
    email: data.email ?? null,
    desiredLevel: data.desiredLevel,
    learnerAge: data.learnerAge,
    preferredIntake: data.preferredIntake,
    question: data.question ?? null,
    consentGiven: true,
    consentNoticeVersion: PRIVACY_NOTICE_VERSION,
    status: "new",
    source: isEnquiryTestMode(mode) ? "test" : "website",
    createdAt: now.toISOString(),
  };

  logEnquiry("enquiry_received", { request_id: requestId, level: data.desiredLevel, test_mode: isEnquiryTestMode(mode) });

  const store = createStore(mode);
  if (!store) return json(503, { ok: false, code: "UNAVAILABLE", message: UNAVAILABLE_MESSAGE });

  try {
    await store.insert(record);
  } catch (error) {
    // Only the error name is logged: no record content, no contact details.
    logEnquiry("enquiry_store_error", {
      request_id: requestId,
      stage: "insert",
      error: error instanceof Error ? error.name : "unknown",
    });
    return json(503, { ok: false, code: "UNAVAILABLE", message: UNAVAILABLE_MESSAGE });
  }

  logEnquiry("enquiry_store_ok", { request_id: requestId, reference: record.reference });
  return json(201, {
    ok: true,
    reference: record.reference,
    submittedAt: record.createdAt,
    submittedAtEat: formatEat(now),
  });
}

export async function GET() {
  return json(405, { ok: false, code: "METHOD", message: "Please use the enquiry form." });
}
