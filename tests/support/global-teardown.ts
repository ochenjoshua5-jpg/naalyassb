import { readTestRecords } from "../../lib/enquiry/store";
import { removeTestStore, testStoreExists } from "./test-store";

/** Runs once after all tests. Removes every synthetic record and the temp store, then confirms it is gone. */
export default async function globalTeardown() {
  const before = (await readTestRecords()).length;
  await removeTestStore();
  const remaining = await testStoreExists();
  console.log(`[enquiry-teardown] synthetic records removed: ${before}; test store removed: ${!remaining}`);
  if (remaining) throw new Error("Synthetic enquiry test store was not removed");
}
