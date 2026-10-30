/** Enquiry lifecycle. Pure, so the server routes, the table and the Kanban board share one list. */
export const ENQUIRY_STATUSES = ["new", "contacted", "visit-scheduled", "enrolled", "withdrawn"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  "visit-scheduled": "Visit scheduled",
  enrolled: "Enrolled",
  withdrawn: "Withdrawn",
};

/** Columns shown on the Kanban board. Withdrawn enquiries are in the table only. */
export const KANBAN_STATUSES: readonly EnquiryStatus[] = ["new", "contacted", "visit-scheduled", "enrolled"];

export function isEnquiryStatus(value: unknown): value is EnquiryStatus {
  return typeof value === "string" && (ENQUIRY_STATUSES as readonly string[]).includes(value);
}

/** Enquiries waiting longer than this without a reply are "overdue" (school target: 24 hours). */
export const RESPONSE_TARGET_HOURS = 24;
