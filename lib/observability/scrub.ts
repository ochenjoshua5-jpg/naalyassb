/*
 * Privacy scrubbing for error monitoring (Sentry). Parents' names, children's names, phone numbers and
 * email addresses must never leave the site in an error report. Matches are replaced with "[REDACTED]".
 *
 * Limitation: this works on known field names and on the shape of emails and phone numbers. A name typed
 * into free text (for example inside an error message) cannot be detected reliably, so error messages
 * must never include form content. The enquiry code only logs ids and statuses.
 */

export const REDACTED = "[REDACTED]";

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// Ugandan mobiles (07xx, +2567xx, 7xx xxx xxx, with or without spaces) and other international shapes.
const PHONE = /(?<!\d)(?:\+?256[\s-]?0?|0)?7\d{2}[\s-]?\d{3}[\s-]?\d{3}(?!\d)|\+\d{1,3}[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}(?!\d)/g;

// Field names that always carry personal data, whatever they contain.
const SENSITIVE_KEY =
  /^(parent|guardian|child|learner|student|applicant|first|last|full|other|middle)?[_ -]?(name|names|fullname|surname|firstname|lastname)$|parentname|childname|guardianname|studentname|applicantname|phone|telephone|mobile|whatsapp|email|e-?mail|address|dob|dateofbirth|birth/i;

export function scrubText(input: string): string {
  return input.replace(EMAIL, REDACTED).replace(PHONE, REDACTED);
}

/** Deep scrub of any JSON-like value. Keys that name personal data are replaced wholesale. */
export function scrubValue<T>(value: T, key = "", seen = new WeakSet<object>()): T {
  if (SENSITIVE_KEY.test(key)) return REDACTED as unknown as T;
  if (typeof value === "string") return scrubText(value) as unknown as T;
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value as object)) return REDACTED as unknown as T;
  seen.add(value as object);
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, "", seen)) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = scrubValue(v, k, seen);
  return out as T;
}

/** Sentry `beforeSend`: scrub the event and remove identifying user and network details. */
export function scrubEvent<E>(event: E): E {
  const scrubbed = scrubValue(event) as unknown as {
    user?: unknown;
    request?: { cookies?: unknown; headers?: unknown; query_string?: unknown };
  };
  // Sentry collects IP addresses, cookies and headers by default. The site does not need any of them.
  delete scrubbed.user;
  if (scrubbed.request && typeof scrubbed.request === "object") {
    delete scrubbed.request.cookies;
    delete scrubbed.request.headers;
    delete scrubbed.request.query_string;
  }
  return scrubbed as unknown as E;
}
