/**
 * CSV export for staff. Pure (no imports) so it can be unit tested under Node.
 *
 * Spreadsheet formula injection: a parent's name such as =HYPERLINK(...) must never run when the
 * file is opened in Excel or Sheets. Text cells that start with = + - @ tab or CR get a leading
 * apostrophe. A plain Ugandan phone number (+256...) is data, not a formula, so it is left alone.
 */
const PLAIN_PHONE = /^\+?[0-9][0-9 ]{5,20}$/;
const DANGEROUS_START = /^[=+\-@\t\r]/;

export function safeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (DANGEROUS_START.test(text) && !PLAIN_PHONE.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) {
    return `'${text}`;
  }
  return text;
}

export function csvField(value: string | number | null | undefined): string {
  return `"${safeCell(value).replace(/"/g, '""')}"`;
}

export interface CsvRow {
  reference: string;
  parentName: string;
  phone: string;
  email: string | null;
  desiredLevel: string;
  learnerAge: number;
  preferredIntake: string;
  status: string;
  submittedEat: string;
  question: string | null;
}

export const CSV_HEADERS = [
  "Reference",
  "Parent name",
  "Phone",
  "Email",
  "Level",
  "Learner age",
  "Intake",
  "Status",
  "Submitted (EAT)",
  "Question",
];

/** Builds the CSV text for the rows the staff member is looking at (already filtered and sorted). */
export function toCsv(rows: CsvRow[]): string {
  const lines = [CSV_HEADERS.map(csvField).join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.reference,
        row.parentName,
        row.phone,
        row.email,
        row.desiredLevel,
        row.learnerAge,
        row.preferredIntake,
        row.status,
        row.submittedEat,
        row.question,
      ]
        .map(csvField)
        .join(","),
    );
  }
  return `\uFEFF${lines.join("\r\n")}\r\n`; // BOM so Excel reads UTF-8 names correctly
}
