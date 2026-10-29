/**
 * Audit trail for staff actions. Logs event names, role, user id and record id only.
 * Never names, phone numbers, emails, questions or IP addresses.
 */
import { formatEat } from "@/lib/enquiry/log";

export type StaffEvent =
  | "staff_anonymous"
  | "staff_forbidden"
  | "staff_csrf_refused"
  | "staff_auth_unavailable"
  | "staff_list"
  | "staff_status_changed"
  | "staff_status_failed"
  | "staff_deleted"
  | "staff_delete_failed"
  | "staff_sign_in_failed";

export function logStaff(event: StaffEvent, fields: Record<string, string | number | boolean | undefined> = {}) {
  const now = new Date();
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) clean[key] = value;
  }
  const level = /failed|forbidden|refused|anonymous|unavailable/.test(event) ? "warn" : "info";
  console.log(JSON.stringify({ level, event, ts_utc: now.toISOString(), ts_eat: formatEat(now), ...clean }));
}
