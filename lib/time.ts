/** Shared date formatting. East Africa Time (UTC+3, no daylight saving). Safe for client and server. */
export const EAT_TIME_ZONE = "Africa/Kampala";

export function formatEatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Unknown time";
  const text = new Intl.DateTimeFormat("en-GB", {
    timeZone: EAT_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${text} EAT`;
}

export function formatEatDay(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Unknown day";
  return new Intl.DateTimeFormat("en-GB", { timeZone: EAT_TIME_ZONE, day: "numeric", month: "short" }).format(date);
}

/** "5 minutes ago", "2 hours ago", "3 days ago". Relative to the given "now". */
export function formatRelative(value: string, nowMs: number): string {
  const then = Date.parse(value);
  if (Number.isNaN(then)) return "";
  const seconds = Math.round((then - nowMs) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), "hour");
  return rtf.format(Math.round(seconds / 86_400), "day");
}
