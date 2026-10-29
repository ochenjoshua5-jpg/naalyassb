import { existsSync } from "node:fs";
import { mkdir, readFile, appendFile, rename, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { EnquiryMode } from "./config";
import { isProductionRuntime } from "./config";
import type { EnquiryStatus } from "./status";

/** Row written to storage. Only the fields the school needs to reply. */
export interface EnquiryRecord {
  id: string;
  reference: string;
  parentName: string;
  phone: string;
  email: string | null;
  desiredLevel: "O-Level" | "A-Level";
  learnerAge: number;
  preferredIntake: "next-available" | "not-sure";
  question: string | null;
  consentGiven: true;
  consentNoticeVersion: string;
  status: EnquiryStatus;
  /** Set the first time the enquiry moves away from "new". Used for the response-time figure. */
  contactedAt: string | null;
  source: "website" | "test";
  createdAt: string; // UTC ISO 8601
}

/** Raised when a store operation is not available in this deployment. Routes turn it into a warm 503. */
export class StoreUnavailableError extends Error {
  constructor(message = "Storage is not connected") {
    super(message);
    this.name = "StoreUnavailable";
  }
}

export interface EnquiryStore {
  insert(record: EnquiryRecord): Promise<void>;
  list(): Promise<EnquiryRecord[]>;
  updateStatus(id: string, status: EnquiryStatus, now: Date): Promise<EnquiryRecord | null>;
  remove(id: string): Promise<boolean>;
}

/** Test-only directory, outside the repository. The Playwright global teardown removes it. */
export const TEST_STORE_DIR = path.join(os.tmpdir(), "naalya-enquiry-test");
export const TEST_STORE_FILE = path.join(TEST_STORE_DIR, "records.ndjson");

/** Test-only switch: when this file exists, every insert fails (simulated outage). */
export const TEST_OUTAGE_FLAG = path.join(TEST_STORE_DIR, "simulate-outage");

/** Test-only switch: when this file exists, every staff read and write fails (simulated outage). */
export const TEST_STAFF_OUTAGE_FLAG = path.join(TEST_STORE_DIR, "simulate-staff-outage");

function assertTestRuntime() {
  if (isProductionRuntime()) throw new StoreUnavailableError("test store refused in production");
}

class TestFileStore implements EnquiryStore {
  async insert(record: EnquiryRecord): Promise<void> {
    assertTestRuntime();
    await mkdir(TEST_STORE_DIR, { recursive: true });
    if (existsSync(TEST_OUTAGE_FLAG)) throw new Error("Test backend deliberately unavailable");
    await appendFile(TEST_STORE_FILE, `${JSON.stringify(record)}\n`, "utf8");
  }

  async list(): Promise<EnquiryRecord[]> {
    assertTestRuntime();
    if (existsSync(TEST_STAFF_OUTAGE_FLAG)) throw new Error("Test staff backend deliberately unavailable");
    return readAll();
  }

  async updateStatus(id: string, status: EnquiryStatus, now: Date): Promise<EnquiryRecord | null> {
    assertTestRuntime();
    if (existsSync(TEST_STAFF_OUTAGE_FLAG)) throw new Error("Test staff backend deliberately unavailable");
    const records = await readAll();
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) return null;
    const current = records[index];
    const updated: EnquiryRecord = {
      ...current,
      status,
      contactedAt: current.contactedAt ?? (current.status === "new" && status !== "new" ? now.toISOString() : null),
    };
    records[index] = updated;
    await writeAll(records);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    assertTestRuntime();
    if (existsSync(TEST_STAFF_OUTAGE_FLAG)) throw new Error("Test staff backend deliberately unavailable");
    const records = await readAll();
    const kept = records.filter((record) => record.id !== id);
    if (kept.length === records.length) return false;
    await writeAll(kept);
    return true;
  }
}

async function readAll(): Promise<EnquiryRecord[]> {
  try {
    const text = await readFile(TEST_STORE_FILE, "utf8");
    return text
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as EnquiryRecord);
  } catch {
    return [];
  }
}

/** Writes to a temp file first, then renames, so a crash never leaves a half-written store. */
async function writeAll(records: EnquiryRecord[]): Promise<void> {
  await mkdir(TEST_STORE_DIR, { recursive: true });
  const tmp = `${TEST_STORE_FILE}.tmp`;
  await writeFile(tmp, records.map((record) => `${JSON.stringify(record)}\n`).join(""), "utf8");
  await rename(tmp, TEST_STORE_FILE);
}

/**
 * Real store: Supabase PostgREST with the service role key. Server-side only.
 * Only the public insert is implemented. Staff list/update/delete are NOT implemented yet, because
 * the staff access design (Clerk identity inside Supabase RLS) is still to be decided and applied.
 */
class SupabaseStore implements EnquiryStore {
  constructor(private url: string, private key: string) {}

  async insert(record: EnquiryRecord): Promise<void> {
    const row = {
      id: record.id,
      reference: record.reference,
      parent_name: record.parentName,
      phone: record.phone,
      email: record.email,
      desired_level: record.desiredLevel,
      learner_age: record.learnerAge,
      preferred_intake: record.preferredIntake,
      question: record.question,
      consent_given: record.consentGiven,
      consent_notice_version: record.consentNoticeVersion,
      status: record.status,
      source: record.source,
      created_at: record.createdAt,
    };
    const response = await fetch(`${this.url.replace(/\/$/, "")}/rest/v1/enquiries`, {
      method: "POST",
      headers: {
        apikey: this.key,
        authorization: `Bearer ${this.key}`,
        "content-type": "application/json",
        prefer: "return=minimal",
      },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`Supabase insert failed with status ${response.status}`);
    }
  }

  async list(): Promise<EnquiryRecord[]> {
    throw new StoreUnavailableError("The enquiry list is not connected to a store yet.");
  }

  async updateStatus(): Promise<EnquiryRecord | null> {
    throw new StoreUnavailableError("Status changes are not connected to a store yet.");
  }

  async remove(): Promise<boolean> {
    throw new StoreUnavailableError("Deleting enquiries is not connected to a store yet.");
  }
}

export function createStore(mode: EnquiryMode): EnquiryStore | null {
  switch (mode) {
    case "test-file":
      return new TestFileStore();
    case "supabase":
      return new SupabaseStore(process.env.SUPABASE_URL ?? "", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "");
    default:
      return null;
  }
}

/** Read test records (test helper; never used by the app). */
export async function readTestRecords(): Promise<EnquiryRecord[]> {
  return readAll();
}
