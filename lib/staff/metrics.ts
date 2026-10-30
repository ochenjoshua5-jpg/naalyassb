/**
 * Dashboard figures. Pure: the caller passes "now", so tests are exact.
 * Days are East Africa Time (Africa/Kampala, UTC+3) because the school's week is EAT.
 */
export const EAT = "Africa/Kampala";
export const DAY_MS = 24 * 60 * 60 * 1000;
export const TARGET_HOURS = 24;

export interface MetricsItem {
  status: string;
  createdAt: string;
  contactedAt: string | null;
  desiredLevel: string;
}

export interface DashboardMetrics {
  total: number;
  newCount: number;
  thisWeek: number;
  overdueCount: number;
  averageResponseHours: number | null;
  answeredCount: number;
  answeredWithinTarget: number;
  levels: { "O-Level": number; "A-Level": number };
  lastSevenDays: { day: string; count: number }[];
}

/** YYYY-MM-DD of an instant, in EAT. */
export function eatDayKey(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: EAT, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(ms),
  );
}

export function computeMetrics(items: MetricsItem[], nowMs: number): DashboardMetrics {
  const weekAgo = nowMs - 7 * DAY_MS;
  const targetMs = TARGET_HOURS * 60 * 60 * 1000;

  let newCount = 0;
  let thisWeek = 0;
  let overdueCount = 0;
  let answeredCount = 0;
  let answeredWithinTarget = 0;
  let responseTotalMs = 0;
  const levels = { "O-Level": 0, "A-Level": 0 };

  const dayKeys: string[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) dayKeys.push(eatDayKey(nowMs - offset * DAY_MS));
  const dayCounts = new Map<string, number>(dayKeys.map((key) => [key, 0]));

  for (const item of items) {
    const created = Date.parse(item.createdAt);
    if (Number.isNaN(created)) continue;

    if (item.status === "new") newCount += 1;
    if (created >= weekAgo && created <= nowMs) thisWeek += 1;
    if (item.status === "new" && nowMs - created > targetMs) overdueCount += 1;
    if (item.desiredLevel === "O-Level" || item.desiredLevel === "A-Level") levels[item.desiredLevel] += 1;

    const key = eatDayKey(created);
    if (dayCounts.has(key)) dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);

    if (item.contactedAt) {
      const contacted = Date.parse(item.contactedAt);
      if (!Number.isNaN(contacted) && contacted >= created) {
        answeredCount += 1;
        responseTotalMs += contacted - created;
        if (contacted - created <= targetMs) answeredWithinTarget += 1;
      }
    }
  }

  return {
    total: items.length,
    newCount,
    thisWeek,
    overdueCount,
    averageResponseHours: answeredCount > 0 ? responseTotalMs / answeredCount / 3_600_000 : null,
    answeredCount,
    answeredWithinTarget,
    levels,
    lastSevenDays: dayKeys.map((day) => ({ day, count: dayCounts.get(day) ?? 0 })),
  };
}

/** Oldest first: the enquiries that have waited longest are at the top of the overdue list. */
export function overdueItems<T extends MetricsItem>(items: T[], nowMs: number): T[] {
  const targetMs = TARGET_HOURS * 60 * 60 * 1000;
  return items
    .filter((item) => item.status === "new" && nowMs - Date.parse(item.createdAt) > targetMs)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}
