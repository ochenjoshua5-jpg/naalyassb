import { expect, test } from "@playwright/test";
import { ADMIN, ADMISSIONS, TEACHER, allRecords, buildRecord, seedRecords, setStaffOutage, staffHeaders } from "./support/staff";
import { removeTestStore } from "./support/test-store";

/**
 * API-level access control against the real route handlers (test server, STAFF_DASHBOARD=test).
 * The database-level rules are checked separately by scripts/verify-enquiry-sql.mjs on PGlite.
 * Every write checks the record afterwards, so a 200 that changed nothing (or a 403 that changed
 * something) is caught.
 */

const NONEXISTENT = "00000000-0000-4000-8000-000000000000";

/**
 * Bodies are sent as raw bytes. Playwright JSON-encodes plain strings when the content type is
 * application/json, which would test something other than what the route receives.
 */
function json(value: unknown): Buffer {
  return Buffer.from(JSON.stringify(value));
}

test.beforeAll(async () => {
  await removeTestStore();
});

test.afterEach(async () => {
  await setStaffOutage(false);
});

test.describe("anonymous visitors", () => {
  test("GET /api/staff/enquiries → 401 with no data", async ({ request }) => {
    const response = await request.get("/api/staff/enquiries");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Authentication required" });
  });

  test("PATCH and DELETE → 401 and nothing changes", async ({ request }) => {
    const record = buildRecord();
    await seedRecords([record]);
    const patch = await request.patch(`/api/staff/enquiries/${record.id}`, {
      headers: { "content-type": "application/json" },
      data: json({ status: "contacted" }),
    });
    expect(patch.status()).toBe(401);
    const del = await request.delete(`/api/staff/enquiries/${record.id}`);
    expect(del.status()).toBe(401);
    const stored = (await allRecords()).find((r) => r.id === record.id);
    expect(stored?.status).toBe("new");
  });

  test("public news is still open (200)", async ({ request }) => {
    const response = await request.get("/news");
    expect(response.status()).toBe(200);
  });

  test("the staff dashboard redirects to sign-in, and renders no data", async ({ request }) => {
    const response = await request.get("/staff/dashboard", { maxRedirects: 0 });
    expect([301, 302, 303, 307, 308]).toContain(response.status());
    expect(response.headers()["location"]).toContain("/staff/sign-in");
  });

  test("the sign-up page does not exist", async ({ request }) => {
    expect((await request.get("/staff/sign-up", { headers: ADMIN })).status()).toBe(404);
    expect((await request.get("/staff/sign-up/factor-one", { headers: ADMIN })).status()).toBe(404);
  });
});

test.describe("signed in without staff access", () => {
  test("teacher GET /api/staff/enquiries → 403, no data", async ({ request }) => {
    await seedRecords([buildRecord()]);
    const response = await request.get("/api/staff/enquiries", { headers: TEACHER });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: "Insufficient permissions" });
    expect(body.items).toBeUndefined();
  });

  test("teacher cannot change status or delete", async ({ request }) => {
    const record = buildRecord();
    await seedRecords([record]);
    const patch = await request.patch(`/api/staff/enquiries/${record.id}`, {
      headers: { ...TEACHER, "content-type": "application/json" },
      data: json({ status: "enrolled" }),
    });
    expect(patch.status()).toBe(403);
    const del = await request.delete(`/api/staff/enquiries/${record.id}`, { headers: TEACHER });
    expect(del.status()).toBe(403);
    expect((await allRecords()).find((r) => r.id === record.id)?.status).toBe("new");
  });

  test("a signed-in user with no role header is refused", async ({ request }) => {
    const response = await request.get("/api/staff/enquiries", { headers: { "x-test-staff-user": "user_test_norole_1" } });
    expect(response.status()).toBe(403);
  });

  test("role names are exact: ADMIN, superuser, teacher and prototype names are all refused", async ({ request }) => {
    for (const role of ["ADMIN", "Admissions", "superuser", "teacher", "__proto__", "constructor"]) {
      const response = await request.get("/api/staff/enquiries", { headers: staffHeaders(role) });
      expect(response.status(), `role ${JSON.stringify(role)}`).toBe(403);
    }
  });
});

test.describe("admissions role", () => {
  test("GET lists enquiries, with only the fields staff need", async ({ request }) => {
    await seedRecords([buildRecord(), buildRecord({ ageDays: 2 })]);
    const response = await request.get("/api/staff/enquiries", { headers: ADMISSIONS });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.items.length).toBeGreaterThanOrEqual(2);
    const keys = Object.keys(body.items[0]).sort();
    expect(keys).toEqual(
      ["consentNoticeVersion", "contactedAt", "createdAt", "desiredLevel", "email", "id", "learnerAge", "parentName", "phone", "preferredIntake", "question", "reference", "status"].sort(),
    );
    expect(response.headers()["cache-control"]).toContain("no-store");
    const dates = body.items.map((item: { createdAt: string }) => item.createdAt);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  test("PATCH changes the status, and the stored record shows it", async ({ request }) => {
    const record = buildRecord();
    await seedRecords([record]);
    const response = await request.patch(`/api/staff/enquiries/${record.id}`, {
      headers: { ...ADMISSIONS, "content-type": "application/json" },
      data: json({ status: "visit-scheduled" }),
    });
    expect(response.status()).toBe(200);
    const stored = (await allRecords()).find((r) => r.id === record.id);
    expect(stored?.status).toBe("visit-scheduled");
    expect(stored?.contactedAt).not.toBeNull();
  });

  test("DELETE → 403, and the record is still there (the rule is enforced, not just the screen)", async ({ request }) => {
    const record = buildRecord();
    await seedRecords([record]);
    const response = await request.delete(`/api/staff/enquiries/${record.id}`, { headers: ADMISSIONS });
    expect(response.status()).toBe(403);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect((await allRecords()).some((r) => r.id === record.id)).toBe(true);
  });

  test("a status change cannot also rewrite what the parent wrote", async ({ request }) => {
    const record = buildRecord({ parentName: "Nakato Grace" });
    await seedRecords([record]);
    for (const data of [
      { status: "contacted", parentName: "Changed Name" },
      { status: "contacted", phone: "+256700000000" },
      { status: "contacted", id: NONEXISTENT },
      { status: "contacted", reference: "ENQ-20990101-FFFFFFFF" },
      { status: "contacted", contactedAt: "2000-01-01T00:00:00Z" },
    ]) {
      const response = await request.patch(`/api/staff/enquiries/${record.id}`, {
        headers: { ...ADMISSIONS, "content-type": "application/json" },
        data: json(data),
      });
      expect(response.status(), JSON.stringify(data)).toBe(422);
    }
    const stored = (await allRecords()).find((r) => r.id === record.id);
    expect(stored?.parentName).toBe("Nakato Grace");
    expect(stored?.status).toBe("new");
  });

  test("malicious status values are refused with 422, never 500", async ({ request }) => {
    const record = buildRecord();
    await seedRecords([record]);
    for (const status of ["archived", "NEW", "", null, ["new"], { $ne: 1 }, "contacted; drop table", "__proto__"]) {
      const response = await request.patch(`/api/staff/enquiries/${record.id}`, {
        headers: { ...ADMISSIONS, "content-type": "application/json" },
        data: json({ status }),
      });
      expect(response.status(), JSON.stringify(status)).toBe(422);
    }
    expect((await allRecords()).find((r) => r.id === record.id)?.status).toBe("new");
  });

  test("bad bodies: wrong content type, not JSON, a JSON array, oversize", async ({ request }) => {
    const record = buildRecord();
    await seedRecords([record]);
    const url = `/api/staff/enquiries/${record.id}`;
    expect((await request.patch(url, { headers: { ...ADMISSIONS, "content-type": "text/plain" }, data: Buffer.from("status=contacted") })).status()).toBe(415);
    expect((await request.patch(url, { headers: { ...ADMISSIONS, "content-type": "application/json" }, data: Buffer.from("{not json") })).status()).toBe(400);
    expect((await request.patch(url, { headers: { ...ADMISSIONS, "content-type": "application/json" }, data: Buffer.from("[]") })).status()).toBe(422);
    expect((await request.patch(url, { headers: { ...ADMISSIONS, "content-type": "application/json" }, data: json({ status: "contacted", pad: "x".repeat(2_000) }) })).status()).toBe(413);
  });

  test("malformed or unknown ids → 404, including injection-shaped ids", async ({ request }) => {
    for (const id of ["1 OR 1=1", "../../etc/passwd", "%00", NONEXISTENT]) {
      const response = await request.patch(`/api/staff/enquiries/${encodeURIComponent(id)}`, {
        headers: { ...ADMISSIONS, "content-type": "application/json" },
        data: json({ status: "contacted" }),
      });
      expect(response.status(), id).toBe(404);
    }
  });

  test("cross-site writes are refused even with a valid session (CSRF)", async ({ request }) => {
    const record = buildRecord();
    await seedRecords([record]);
    const response = await request.patch(`/api/staff/enquiries/${record.id}`, {
      headers: { ...ADMISSIONS, "content-type": "application/json", origin: "https://evil.example" },
      data: json({ status: "contacted" }),
    });
    expect(response.status()).toBe(403);
    expect((await allRecords()).find((r) => r.id === record.id)?.status).toBe("new");
  });

  test("a same-site Origin is allowed", async ({ request, baseURL }) => {
    const record = buildRecord();
    await seedRecords([record]);
    const host = new URL(baseURL ?? "http://127.0.0.1:3001").host;
    const response = await request.patch(`/api/staff/enquiries/${record.id}`, {
      headers: { ...ADMISSIONS, "content-type": "application/json", origin: `http://${host}` },
      data: json({ status: "contacted" }),
    });
    expect(response.status()).toBe(200);
  });
});

test.describe("admin role", () => {
  test("DELETE → 200 and the record is gone", async ({ request }) => {
    const record = buildRecord();
    await seedRecords([record]);
    const response = await request.delete(`/api/staff/enquiries/${record.id}`, { headers: ADMIN });
    expect(response.status()).toBe(200);
    expect((await allRecords()).some((r) => r.id === record.id)).toBe(false);
  });

  test("DELETE of an unknown id → 404", async ({ request }) => {
    const response = await request.delete(`/api/staff/enquiries/${NONEXISTENT}`, { headers: ADMIN });
    expect(response.status()).toBe(404);
  });

  test("each status value can be set", async ({ request }) => {
    const record = buildRecord();
    await seedRecords([record]);
    for (const status of ["contacted", "visit-scheduled", "enrolled", "withdrawn", "new"]) {
      const response = await request.patch(`/api/staff/enquiries/${record.id}`, {
        headers: { ...ADMIN, "content-type": "application/json" },
        data: json({ status }),
      });
      expect(response.status(), status).toBe(200);
    }
  });
});

test.describe("storage outage", () => {
  test("list shows a warm 503 with no data, and changes nothing", async ({ request }) => {
    await seedRecords([buildRecord()]);
    await setStaffOutage(true);
    const response = await request.get("/api/staff/enquiries", { headers: ADMISSIONS });
    expect(response.status()).toBe(503);
    const body = await response.json();
    expect(body.error).toContain("Nothing has been changed");
    expect(body.items).toBeUndefined();
  });

  test("a status change during an outage is refused and nothing is written", async ({ request }) => {
    const record = buildRecord();
    await seedRecords([record]);
    await setStaffOutage(true);
    const response = await request.patch(`/api/staff/enquiries/${record.id}`, {
      headers: { ...ADMISSIONS, "content-type": "application/json" },
      data: json({ status: "contacted" }),
    });
    expect(response.status()).toBe(503);
    await setStaffOutage(false);
    expect((await allRecords()).find((r) => r.id === record.id)?.status).toBe("new");
  });
});
