import { test } from "node:test";
import assert from "node:assert/strict";
import { hasPermission, parseStaffRole } from "../../lib/staff/roles.ts";
import { safeCell, toCsv } from "../../lib/staff/csv.ts";
import { computeMetrics, eatDayKey, overdueItems } from "../../lib/staff/metrics.ts";
import { fetchStaffLookup, CLERK_API_BASE } from "../../lib/staff/clerk-role.ts";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

test("permission matrix: admin may delete, admissions may not, teacher and unknown roles get nothing", () => {
  assert.equal(hasPermission("admin", "enquiries:delete"), true);
  assert.equal(hasPermission("admissions", "enquiries:delete"), false);
  assert.equal(hasPermission("admissions", "enquiries:read"), true);
  assert.equal(hasPermission("admissions", "enquiries:update"), true);
  assert.equal(hasPermission("admissions", "news:publish"), true);
  assert.equal(hasPermission("teacher", "enquiries:read"), false);
  assert.equal(hasPermission("teacher", "news:publish"), false);
  assert.equal(hasPermission(null, "enquiries:read"), false);
  assert.equal(hasPermission(undefined, "enquiries:read"), false);
  assert.equal(hasPermission("ADMIN", "enquiries:read"), false, "role match is exact, not case-folded");
  assert.equal(parseStaffRole("admin "), null, "no trimming: unknown spacing is refused");
  assert.equal(parseStaffRole(["admin"]), null, "arrays are not roles");
  assert.equal(parseStaffRole("__proto__"), null);
});

test("CSV: formula injection is neutralised; plain phone numbers and quotes survive", () => {
  assert.equal(safeCell("=HYPERLINK(\"http://x\")"), "'=HYPERLINK(\"http://x\")");
  assert.equal(safeCell("+256772000111"), "+256772000111");
  assert.equal(safeCell("-5"), "-5");
  assert.equal(safeCell("@SUM(A1)"), "'@SUM(A1)");
  const csv = toCsv([
    {
      reference: "ENQ-20261029-ABCDEF01",
      parentName: "=cmd|' /C calc'!A0",
      phone: "+256772000111",
      email: null,
      desiredLevel: "O-Level",
      learnerAge: 14,
      preferredIntake: "not-sure",
      status: "new",
      submittedEat: "29 Oct 2026, 15:00 EAT",
      question: "He said \"hello\"\nand more",
    },
  ]);
  assert.ok(csv.startsWith("\uFEFF"), "BOM present");
  assert.ok(csv.includes('"\'=cmd|\' /C calc\'!A0"'), "formula neutralised");
  assert.ok(csv.includes('"+256772000111"'), "phone kept");
  assert.ok(csv.includes('"He said ""hello""\nand more"'), "quotes doubled");
});

test("metrics: counts, overdue, response time and EAT day buckets are exact", () => {
  const now = Date.parse("2026-10-29T12:00:00Z"); // 15:00 EAT
  const items = [
    { status: "new", createdAt: "2026-10-27T10:00:00Z", contactedAt: null, desiredLevel: "O-Level" }, // overdue
    { status: "contacted", createdAt: "2026-10-28T10:00:00Z", contactedAt: "2026-10-28T12:00:00Z", desiredLevel: "A-Level" }, // 2h
    { status: "contacted", createdAt: "2026-10-20T10:00:00Z", contactedAt: "2026-10-22T10:00:00Z", desiredLevel: "O-Level" }, // 48h, outside week
    { status: "new", createdAt: "2026-10-29T11:00:00Z", contactedAt: null, desiredLevel: "O-Level" }, // fresh
  ];
  const m = computeMetrics(items, now);
  assert.equal(m.total, 4);
  assert.equal(m.newCount, 2);
  assert.equal(m.thisWeek, 3);
  assert.equal(m.overdueCount, 1);
  assert.equal(m.answeredCount, 2);
  assert.equal(m.answeredWithinTarget, 1);
  assert.equal(Math.round(m.averageResponseHours), 25); // (2h + 48h) / 2
  assert.deepEqual(m.levels, { "O-Level": 3, "A-Level": 1 });
  assert.equal(m.lastSevenDays.at(-1).day, "2026-10-29");
  assert.equal(m.lastSevenDays.at(-1).count, 1);
  assert.equal(m.lastSevenDays.at(-2).count, 1);
  assert.equal(eatDayKey(Date.parse("2026-10-28T22:30:00Z")), "2026-10-29", "22:30 UTC is already the next EAT day");
  assert.equal(overdueItems(items, now)[0].createdAt, "2026-10-27T10:00:00Z");
});

test("metrics: empty data gives no response time rather than zero", () => {
  const m = computeMetrics([], Date.parse("2026-10-29T12:00:00Z"));
  assert.equal(m.averageResponseHours, null);
  assert.equal(m.lastSevenDays.length, 7);
});

const clerk = setupServer();
test.before(() => clerk.listen({ onUnhandledRequest: "error" }));
test.after(() => clerk.close());
test.afterEach(() => clerk.resetHandlers());

const USER = "user_2abcDEF123";

test("Clerk role lookup: sends the secret and reads the role", async () => {
  let seenAuth = "";
  clerk.use(
    http.get(`${CLERK_API_BASE}/users/:id`, ({ request, params }) => {
      seenAuth = request.headers.get("authorization") ?? "";
      assert.equal(params.id, USER);
      return HttpResponse.json({ first_name: "Grace", last_name: "Namukasa", public_metadata: { staffRole: "admissions" } });
    }),
  );
  const ok = await fetchStaffLookup(USER, "sk_test_fake");
  assert.equal(seenAuth, "Bearer sk_test_fake");
  assert.deepEqual(ok, { status: "ok", staffRole: "admissions", banned: false, displayName: "Grace Namukasa" });
  assert.equal(parseStaffRole(ok.staffRole), "admissions");
});

test("Clerk role lookup: teacher, missing and unknown roles mean no staff role", async () => {
  for (const metadata of [{ staffRole: "teacher" }, {}, { staffRole: "Admin" }, { staffRole: ["admin"] }]) {
    clerk.use(http.get(`${CLERK_API_BASE}/users/:id`, () => HttpResponse.json({ public_metadata: metadata })));
    const result = await fetchStaffLookup(USER, "sk_test_fake");
    assert.equal(parseStaffRole(result.staffRole), null, `role for ${JSON.stringify(metadata)}`);
    clerk.resetHandlers();
  }
});

test("Clerk role lookup: banned or locked users lose access even with an admin role", async () => {
  clerk.use(
    http.get(`${CLERK_API_BASE}/users/:id`, () =>
      HttpResponse.json({ banned: true, public_metadata: { staffRole: "admin" } }),
    ),
  );
  const banned = await fetchStaffLookup(USER, "sk_test_fake");
  assert.equal(banned.banned, true, "banned flag is returned so the session drops the role");
});

test("Clerk role lookup: outage, 5xx, bad JSON and malformed ids are handled without guessing", async () => {
  clerk.use(http.get(`${CLERK_API_BASE}/users/:id`, () => new HttpResponse(null, { status: 503 })));
  assert.deepEqual(await fetchStaffLookup(USER, "sk"), { status: "unavailable" });
  clerk.resetHandlers();

  clerk.use(http.get(`${CLERK_API_BASE}/users/:id`, () => HttpResponse.error()));
  assert.deepEqual(await fetchStaffLookup(USER, "sk"), { status: "unavailable" });
  clerk.resetHandlers();

  clerk.use(http.get(`${CLERK_API_BASE}/users/:id`, () => new HttpResponse("<html>", { status: 200 })));
  assert.deepEqual(await fetchStaffLookup(USER, "sk"), { status: "unavailable" });
  clerk.resetHandlers();

  clerk.use(http.get(`${CLERK_API_BASE}/users/:id`, () => new HttpResponse(null, { status: 404 })));
  assert.deepEqual(await fetchStaffLookup(USER, "sk"), { status: "ok", staffRole: null, banned: true, displayName: "" });
  clerk.resetHandlers();

  let calls = 0;
  clerk.use(http.get(`${CLERK_API_BASE}/users/:id`, () => { calls += 1; return HttpResponse.json({}); }));
  const bad = await fetchStaffLookup("user_../../admin", "sk");
  assert.equal(bad.banned, true);
  assert.equal(calls, 0, "malformed user id never reaches Clerk");
});

import { filterEnquiries, matchesSearch } from "../../lib/staff/filter.ts";

const sample = [
  { id: "1", parentName: "Sarah Namukasa", phone: "+256772123456", email: null, reference: "ENQ-20261029-AAAA1111", desiredLevel: "O-Level", status: "new", createdAt: "2026-10-29T08:00:00Z" },
  { id: "2", parentName: "Peter Ssemwogerere", phone: "+256701987654", email: "p@example.test", reference: "ENQ-20261020-BBBB2222", desiredLevel: "A-Level", status: "contacted", createdAt: "2026-10-20T08:00:00Z" },
  { id: "3", parentName: "Aisha Nabirye", phone: "+256781000111", email: null, reference: "ENQ-20260901-CCCC3333", desiredLevel: "O-Level", status: "withdrawn", createdAt: "2026-09-01T08:00:00Z" },
];
const now = Date.parse("2026-10-29T12:00:00Z");

test("search: names are case-insensitive; phone matches with 0 or +256; short digit strings do not match everything", () => {
  assert.deepEqual(filterEnquiries(sample, { search: "namukasa", status: "all", range: "all" }, now).map((r) => r.id), ["1"]);
  assert.deepEqual(filterEnquiries(sample, { search: "  SARAH   namukasa ", status: "all", range: "all" }, now).map((r) => r.id), ["1"]);
  assert.deepEqual(filterEnquiries(sample, { search: "0701 987", status: "all", range: "all" }, now).map((r) => r.id), ["2"]);
  assert.deepEqual(filterEnquiries(sample, { search: "+256 781", status: "all", range: "all" }, now).map((r) => r.id), ["3"]);
  assert.equal(filterEnquiries(sample, { search: "12", status: "all", range: "all" }, now).length, 0, "two digits are not enough to search by phone");
  assert.equal(filterEnquiries(sample, { search: "ENQ-2026", status: "all", range: "all" }, now).length, 3, "reference text matches");
  assert.equal(matchesSearch(sample[0], "<script>alert(1)</script>"), false, "markup is just text, and matches nothing");
});

test("filters: status and the last 7 / 30 days combine with search", () => {
  assert.deepEqual(filterEnquiries(sample, { search: "", status: "new", range: "all" }, now).map((r) => r.id), ["1"]);
  assert.deepEqual(filterEnquiries(sample, { search: "", status: "all", range: "week" }, now).map((r) => r.id), ["1"]);
  // Last 30 days from 29 Oct: 29 Oct and 20 Oct are in; 1 Sep is out.
  assert.deepEqual(filterEnquiries(sample, { search: "", status: "all", range: "month" }, now).map((r) => r.id), ["1", "2"]);
  // Peter is in the last 30 days, but not the last 7, so the week filter removes him.
  assert.deepEqual(filterEnquiries(sample, { search: "peter", status: "all", range: "week" }, now).map((r) => r.id), []);
  assert.deepEqual(filterEnquiries(sample, { search: "peter", status: "all", range: "month" }, now).map((r) => r.id), ["2"]);
});
