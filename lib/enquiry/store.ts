import { existsSync } from "node:fs";
import { mkdir, readFile, appendFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { EnquiryMode } from "./config";
import { isProductionRuntime } from "./config";

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
  status: "new";
  source: "website" | "test";
  createdAt: string; // UTC ISO 8601
}

export interface EnquiryStore {
  insert(record: EnquiryRecord): Promise<void>;
}

/** Test-only directory, outside the repository. The Playwright global teardown removes it. */
export const TEST_STORE_DIR = path.join(os.tmpdir(), "naalya-enquiry-test");
export const TEST_STORE_FILE = path.join(TEST_STORE_DIR, "records.ndjson");

/** Test-only switch: when this file exists in the temp store folder, every insert fails (simulated outage). */
export const TEST_OUTAGE_FLAG = path.join(TEST_STORE_DIR, "simulate-outage");

class TestFileStore implements EnquiryStore {
  async insert(record: EnquiryRecord): Promise<void> {
    if (isProductionRuntime()) throw new Error("test store refused in production");
    await mkdir(TEST_STORE_DIR, { recursive: true });
    if (existsSync(TEST_OUTAGE_FLAG)) throw new Error("Test backend deliberately unavailable");
    await appendFile(TEST_STORE_FILE, `${JSON.stringify(record)}\n`, "utf8");
  }
}

/** Real store: Supabase PostgREST insert with the service role key. Server-side only. */
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
