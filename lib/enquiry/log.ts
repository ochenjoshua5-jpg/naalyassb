/**
 * Structured server logs for the enquiry pipeline.
 * Logs carry outcome codes, request ids and timestamps only. Never names, phone numbers,
 * emails, questions or raw IP addresses.
 */
import { randomUUID } from "node:crypto";

export const EAT_TIME_ZONE = "Africa/Kampala"; // UTC+3, no daylight saving

export function formatEat(date: Date): string {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: EAT_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${formatted} EAT`;
}

export function newRequestId(): string {
  return randomUUID();
}

export type EnquiryEvent =
  | "enquiry_received"
  | "enquiry_invalid"
  | "enquiry_rate_limited"
  | "enquiry_turnstile_failed"
  | "enquiry_store_ok"
  | "enquiry_store_error"
  | "enquiry_disabled"
  | "enquiry_bad_request"
  | "hub_check";

export function logEnquiry(event: EnquiryEvent, fields: Record<string, string | number | boolean> = {}) {
  const now = new Date();
  const line = {
    level: event.endsWith("error") || event.endsWith("failed") ? "error" : "info",
    event,
    ts_utc: now.toISOString(),
    ts_eat: formatEat(now),
    ...fields,
  };
  console.log(JSON.stringify(line));
}
