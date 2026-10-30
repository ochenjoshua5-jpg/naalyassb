import { appendFile, mkdir, unlink, writeFile } from "node:fs/promises";
import { faker } from "@faker-js/faker";
import { TEST_STAFF_OUTAGE_FLAG, TEST_STORE_DIR, TEST_STORE_FILE, readTestRecords, type EnquiryRecord } from "../../lib/enquiry/store";
import type { EnquiryStatus } from "../../lib/enquiry/status";
import { syntheticEnquiry } from "./synthetic";

/**
 * SYNTHETIC TEST DATA ONLY. Staff test headers are honoured only when STAFF_DASHBOARD=test,
 * which the test server sets and the production build refuses.
 */
export const STAFF_USER_HEADER = "x-test-staff-user";
export const STAFF_ROLE_HEADER = "x-test-staff-role";
export const STAFF_NAME_HEADER = "x-test-staff-name";

export function staffHeaders(role: string, name = "Test Staff"): Record<string, string> {
  return {
    [STAFF_USER_HEADER]: `user_test_${role.replace(/[^a-z]/g, "")}_1`,
    [STAFF_ROLE_HEADER]: role,
    [STAFF_NAME_HEADER]: name,
  };
}

export const ADMISSIONS = staffHeaders("admissions", "Grace Namukasa");
export const ADMIN = staffHeaders("admin", "Joseph Okongo");
export const TEACHER = staffHeaders("teacher", "Ruth Teacher");

export function buildRecord(overrides: Partial<EnquiryRecord> & { ageDays?: number } = {}): EnquiryRecord {
  const synthetic = syntheticEnquiry();
  const ageDays = overrides.ageDays ?? 0;
  const created = new Date(Date.now() - ageDays * 86_400_000);
  const { ageDays: _ignored, ...rest } = overrides;
  void _ignored;
  return {
    id: crypto.randomUUID(),
    reference: `ENQ-${created.toISOString().slice(0, 10).replace(/-/g, "")}-${faker.string.hexadecimal({ length: 8, prefix: "" }).toUpperCase()}`,
    parentName: synthetic.parentName,
    phone: `+256${synthetic.digits}`,
    email: null,
    desiredLevel: synthetic.desiredLevel,
    learnerAge: Number(synthetic.learnerAge),
    preferredIntake: synthetic.preferredIntake,
    question: synthetic.question,
    consentGiven: true,
    consentNoticeVersion: "draft-2026-10-29",
    status: "new" as EnquiryStatus,
    contactedAt: null,
    source: "test",
    createdAt: created.toISOString(),
    ...rest,
  };
}

/** Appends synthetic records to the test store (the same file the real store writes to). */
export async function seedRecords(records: EnquiryRecord[]): Promise<void> {
  await mkdir(TEST_STORE_DIR, { recursive: true });
  await appendFile(TEST_STORE_FILE, records.map((record) => `${JSON.stringify(record)}\n`).join(""), "utf8");
}

export async function allRecords(): Promise<EnquiryRecord[]> {
  return readTestRecords();
}

export async function setStaffOutage(on: boolean): Promise<void> {
  if (on) {
    await mkdir(TEST_STORE_DIR, { recursive: true });
    await writeFile(TEST_STAFF_OUTAGE_FLAG, "on\n", "utf8");
  } else {
    await unlink(TEST_STAFF_OUTAGE_FLAG).catch(() => undefined);
  }
}
