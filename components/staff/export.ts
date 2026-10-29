import type { StaffEnquiryView } from "@/lib/staff/enquiry-service";
import { CSV_HEADERS, toCsv, type CsvRow } from "@/lib/staff/csv";
import { eatDayKey } from "@/lib/staff/metrics";
import { formatEatDateTime } from "@/lib/time";

export function toCsvRows(items: StaffEnquiryView[]): CsvRow[] {
  return items.map((item) => ({
    reference: item.reference,
    parentName: item.parentName,
    phone: item.phone,
    email: item.email,
    desiredLevel: item.desiredLevel,
    learnerAge: item.learnerAge,
    preferredIntake: item.preferredIntake === "not-sure" ? "Not sure yet" : "Next available",
    status: item.status,
    submittedEat: formatEatDateTime(item.createdAt),
    question: item.question,
  }));
}

/** Downloads a CSV in the browser. The file name carries the EAT date. */
export function downloadCsv(rows: CsvRow[]): void {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `naalya-enquiries-${eatDayKey(Date.now())}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export { CSV_HEADERS };
