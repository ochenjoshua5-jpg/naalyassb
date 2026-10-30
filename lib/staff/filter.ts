/**
 * Search and filter rules for the enquiry list and the Kanban board. Pure: shared by the UI and tests.
 */
export const RANGE_OPTIONS = ["all", "week", "month"] as const;
export type RangeFilter = (typeof RANGE_OPTIONS)[number];

export interface FilterState {
  search: string;
  status: string; // "all" or an enquiry status
  range: RangeFilter;
}

export interface Filterable {
  parentName: string;
  phone: string;
  email: string | null;
  reference: string;
  desiredLevel: string;
  status: string;
  createdAt: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Digits only. "+256 772 123 456" and "0772123456" both become comparable with the same rule. */
function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("0") ? `256${digits.slice(1)}` : digits;
}

export function matchesSearch(item: Filterable, rawSearch: string): boolean {
  const search = rawSearch.trim().toLowerCase().replace(/\s+/g, " ");
  if (!search) return true;

  const textFields = [item.parentName, item.reference, item.email ?? "", item.desiredLevel, item.status]
    .join(" ")
    .toLowerCase();
  if (textFields.includes(search)) return true;

  const searchDigits = phoneDigits(search);
  // Only treat the search as a phone number when it has at least 4 digits, so "ENQ-2026" does not match everything.
  return searchDigits.length >= 4 && phoneDigits(item.phone).includes(searchDigits);
}

export function filterEnquiries<T extends Filterable>(items: T[], state: FilterState, nowMs: number): T[] {
  const sinceMs = state.range === "week" ? nowMs - 7 * DAY_MS : state.range === "month" ? nowMs - 30 * DAY_MS : null;
  return items.filter((item) => {
    if (state.status !== "all" && item.status !== state.status) return false;
    if (sinceMs !== null && Date.parse(item.createdAt) < sinceMs) return false;
    return matchesSearch(item, state.search);
  });
}
