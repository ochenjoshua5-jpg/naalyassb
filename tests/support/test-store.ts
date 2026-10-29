import { mkdir, readFile, rm, stat, unlink, writeFile } from "node:fs/promises";
import { TEST_OUTAGE_FLAG, TEST_STORE_DIR, TEST_STORE_FILE, readTestRecords, type EnquiryRecord } from "../../lib/enquiry/store";

/** Finds synthetic records by their nine national digits (unique per generated test record). */
export async function recordsWithDigits(digits: string): Promise<EnquiryRecord[]> {
  const all = await readTestRecords();
  return all.filter((record) => record.phone.endsWith(digits));
}

/** Removes the test store file entirely. Used by test cleanup and by the global teardown. */
export async function removeTestStore(): Promise<void> {
  await rm(TEST_STORE_DIR, { recursive: true, force: true });
}

export async function testStoreExists(): Promise<boolean> {
  try {
    await stat(TEST_STORE_DIR);
    return true;
  } catch {
    return false;
  }
}

/** Deletes this test's synthetic records. Safe because the suite runs with one worker. */
export async function deleteRecordsWithDigits(digits: string): Promise<number> {
  let text: string;
  try {
    text = await readFile(TEST_STORE_FILE, "utf8");
  } catch {
    return 0;
  }
  const lines = text.split("\n").filter(Boolean);
  const kept = lines.filter((line) => !(JSON.parse(line) as EnquiryRecord).phone.endsWith(digits));
  await writeFile(TEST_STORE_FILE, kept.map((line) => `${line}\n`).join(""), "utf8");
  return lines.length - kept.length;
}

/** Simulates a storage outage: while on, the real store throws on every insert. */
export async function setOutage(on: boolean): Promise<void> {
  if (on) {
    await mkdir(TEST_STORE_DIR, { recursive: true });
    await writeFile(TEST_OUTAGE_FLAG, "on\n", "utf8");
  } else {
    await unlink(TEST_OUTAGE_FLAG).catch(() => undefined);
  }
}
