/**
 * Enquiry mode is decided at request time from server environment variables.
 *
 * - "disabled" (default): the form is NOT offered. /admissions/enquiry shows the verified
 *   fallback and POST /api/enquiry returns 503. Nothing is stored. This is the public preview state.
 * - "test-file": test-only. Refused when NODE_ENV or VERCEL_ENV is production. Used by Playwright.
 * - "supabase": the real store. Requires the school's approval flag, Supabase, Turnstile and Upstash.
 *   Not enabled anywhere in this preview.
 */
export type EnquiryMode = "disabled" | "test-file" | "supabase";

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function getEnquiryMode(): EnquiryMode {
  const raw = (process.env.ENQUIRY_STORE ?? "disabled").trim();

  if (raw === "disabled" || raw === "") return "disabled";

  if (raw === "test-file") {
    if (isProductionRuntime()) {
      logConfigProblem(`ENQUIRY_STORE=${raw} is refused in production; the form stays disabled.`);
      return "disabled";
    }
    return raw;
  }

  if (raw === "supabase") {
    const approved = process.env.ENQUIRY_SCHOOL_APPROVED === "yes";
    const complete =
      !!process.env.SUPABASE_URL &&
      !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !!process.env.TURNSTILE_SECRET_KEY &&
      !!process.env.TURNSTILE_SITE_KEY &&
      !!process.env.UPSTASH_REDIS_REST_URL &&
      !!process.env.UPSTASH_REDIS_REST_TOKEN;
    if (approved && complete) return "supabase";
    logConfigProblem(
      "ENQUIRY_STORE=supabase needs ENQUIRY_SCHOOL_APPROVED=yes and all Supabase, Turnstile and Upstash settings. The form stays disabled.",
    );
    return "disabled";
  }

  logConfigProblem(`Unknown ENQUIRY_STORE value. The form stays disabled.`);
  return "disabled";
}

export function isEnquiryTestMode(mode: EnquiryMode): boolean {
  return mode === "test-file";
}

const warned = new Set<string>();
function logConfigProblem(message: string) {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(JSON.stringify({ level: "warn", event: "enquiry_config", message }));
}
