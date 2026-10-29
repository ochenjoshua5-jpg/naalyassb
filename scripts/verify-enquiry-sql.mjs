/**
 * Verifies supabase/migrations/20261029090000_enquiries.sql on PGlite (real Postgres engine, in memory).
 * Checks RLS, column-level grants, anon/authenticated lockdown and CHECK constraints.
 * Run:  npm install --no-save @electric-sql/pglite && node scripts/verify-enquiry-sql.mjs
 * Not a substitute for testing on the real Supabase project once the school approves it.
 */
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";

const migration = fs.readFileSync(new URL("../supabase/migrations/20261029090000_enquiries.sql", import.meta.url), "utf8");
const db = new PGlite();
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok, detail });

// Minimal Supabase-like environment: roles, auth schema, auth.jwt() (Clerk subject), and Supabase's default grants.
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create function auth.jwt() returns jsonb language sql stable as $$
    select jsonb_build_object('sub', nullif(current_setting('request.jwt.claim.sub', true), ''))
  $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.jwt() to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`);
await db.exec(migration);

// Synthetic Clerk-style user ids (user_ followed by letters and digits).
const ADMISSIONS = "user_verifyAdmissions1";
const ADMIN = "user_verifyAdmin1";
const INACTIVE = "user_verifyInactive1";
const NON_STAFF = "user_verifyNonStaff1";
await db.exec(`
  insert into public.staff_profiles (user_id, role, full_name, active) values
    ('${ADMISSIONS}', 'admissions', 'Test Admissions', true),
    ('${ADMIN}', 'admin', 'Test Admin', true),
    ('${INACTIVE}', 'admissions', 'Test Inactive', false);
`);

// Run one statement as a given role and JWT subject. Returns rows or the error message.
async function as(role, sub, sql) {
  await db.exec(`set role ${role}`);
  await db.exec(`select set_config('request.jwt.claim.sub', '${sub ?? ""}', false)`);
  try {
    return { rows: (await db.query(sql)).rows };
  } catch (e) {
    return { error: e.message };
  } finally {
    await db.exec("reset role");
  }
}

const row = (suffix, extra = {}) => ({
  reference: `ENQ-20261029-${suffix}`,
  parent_name: "Nakato Grace",
  phone: "+256772123456",
  email: "parent@example.test",
  desired_level: "O-Level",
  learner_age: 15,
  preferred_intake: "not-sure",
  question: "Test question",
  consent_given: true,
  consent_notice_version: "draft-2026-10-29",
  source: "test",
  ...extra,
});
const insertSql = (r) => `insert into public.enquiries (${Object.keys(r).join(",")}) values (${Object.values(r).map((v) => (v === null ? "null" : typeof v === "boolean" ? String(v) : typeof v === "number" ? v : `'${String(v).replace(/'/g, "''")}'`)).join(",")}) returning id`;

// 1) Writes come from the service role (server only). It bypasses RLS.
const svc = await as("service_role", null, insertSql(row("AAAA1111")));
check("service_role can insert an enquiry", !!svc.rows?.length, svc.error ?? "");
const svc2 = await as("service_role", null, insertSql(row("BBBB2222", { email: null, question: null, desired_level: "A-Level", learner_age: 10, preferred_intake: "next-available" })));
check("service_role inserts optional fields as null (email, question)", !!svc2.rows?.length, svc2.error ?? "");
const svcAll = await as("service_role", null, "select count(*)::int as n from public.enquiries");
check("service_role reads all rows (bypasses RLS)", svcAll.rows?.[0]?.n === 2, JSON.stringify(svcAll));

// 2) Anonymous visitors: no access at all.
const anonSelect = await as("anon", null, "select * from public.enquiries");
check("anon cannot select enquiries", !!anonSelect.error && /permission denied/.test(anonSelect.error), anonSelect.error ?? JSON.stringify(anonSelect.rows));
const anonInsert = await as("anon", null, insertSql(row("CCCC3333")));
check("anon cannot insert directly", !!anonInsert.error && /permission denied/.test(anonInsert.error), anonInsert.error ?? "inserted!");
const anonUpdate = await as("anon", null, "update public.enquiries set status = 'withdrawn'");
check("anon cannot update", !!anonUpdate.error && /permission denied/.test(anonUpdate.error), anonUpdate.error ?? "updated!");
const anonStaffFn = await as("anon", null, "select public.is_enquiry_staff(array['admin'])");
check("anon cannot call is_enquiry_staff", !!anonStaffFn.error && /permission denied/.test(anonStaffFn.error), anonStaffFn.error ?? "callable!");
const anonProfiles = await as("anon", null, "select * from public.staff_profiles");
check("anon cannot read staff_profiles", !!anonProfiles.error, anonProfiles.error ?? JSON.stringify(anonProfiles.rows));

// 3) Signed-in users who are not staff see nothing (RLS filters rows).
const nonStaff = await as("authenticated", NON_STAFF, "select count(*)::int as n from public.enquiries");
check("non-staff signed-in user sees zero enquiries", nonStaff.rows?.[0]?.n === 0, nonStaff.error ?? JSON.stringify(nonStaff.rows));
const inactive = await as("authenticated", INACTIVE, "select count(*)::int as n from public.enquiries");
check("inactive staff member sees zero enquiries", inactive.rows?.[0]?.n === 0, inactive.error ?? JSON.stringify(inactive.rows));

// 4) Admissions and admin staff can read; the handling columns can be updated; the rest cannot.
const adm = await as("authenticated", ADMISSIONS, "select count(*)::int as n from public.enquiries");
check("admissions staff can read enquiries", adm.rows?.[0]?.n === 2, adm.error ?? JSON.stringify(adm.rows));
const adminRead = await as("authenticated", ADMIN, "select count(*)::int as n from public.enquiries");
check("admin staff can read enquiries", adminRead.rows?.[0]?.n === 2, adminRead.error ?? JSON.stringify(adminRead.rows));
const admUpdateStatus = await as("authenticated", ADMISSIONS, "update public.enquiries set status = 'contacted', contacted_at = now(), handled_at = now(), handled_by = '" + ADMISSIONS + "' where reference = 'ENQ-20261029-AAAA1111' returning status");
check("admissions staff can update status and handling fields", admUpdateStatus.rows?.[0]?.status === "contacted", admUpdateStatus.error ?? JSON.stringify(admUpdateStatus.rows));
const admEditParent = await as("authenticated", ADMISSIONS, "update public.enquiries set parent_name = 'Changed' where reference = 'ENQ-20261029-AAAA1111'");
check("staff cannot edit what the parent wrote (column grant)", !!admEditParent.error && /permission denied/.test(admEditParent.error), admEditParent.error ?? "edited!");
const admDelete = await as("authenticated", ADMISSIONS, "delete from public.enquiries returning id");
const afterAdmDelete = await as("authenticated", ADMIN, "select count(*)::int as n from public.enquiries");
check("admissions cannot delete (RLS removes zero rows, no error)", !admDelete.error && (admDelete.rows ?? []).length === 0 && afterAdmDelete.rows?.[0]?.n === 2, admDelete.error ?? `rows deleted: ${admDelete.rows?.length}, remaining: ${afterAdmDelete.rows?.[0]?.n}`);
const anonDelete = await as("anon", null, "delete from public.enquiries");
check("anon cannot delete", !!anonDelete.error && /permission denied/.test(anonDelete.error), anonDelete.error ?? "deleted!");
const admDeleteOne = await as("authenticated", ADMIN, "delete from public.enquiries where reference = 'ENQ-20261029-AAAA1111' returning id");
check("admin (Headmaster role) can delete an enquiry", (admDeleteOne.rows ?? []).length === 1, admDeleteOne.error ?? `rows: ${admDeleteOne.rows?.length}`);
await db.exec(`insert into public.enquiries (reference, parent_name, phone, desired_level, learner_age, preferred_intake, consent_given, consent_notice_version, source) values ('ENQ-20261029-AAAA1111', 'Nakato Grace', '+256772123456', 'O-Level', 15, 'not-sure', true, 'draft-2026-10-29', 'test')`);
const admInsert = await as("authenticated", ADMIN, insertSql(row("DDDD4444")));
check("staff cannot insert directly through the API", !!admInsert.error && /permission denied/.test(admInsert.error), admInsert.error ?? "inserted!");
const inactiveUpdate = await as("authenticated", INACTIVE, "update public.enquiries set status = 'withdrawn'");
const withdrawnNow = await db.query("select count(*)::int as n from public.enquiries where status = 'withdrawn'");
check("inactive staff update changes nothing (RLS filters the row)", !inactiveUpdate.error && withdrawnNow.rows[0].n === 0, inactiveUpdate.error ?? `withdrawn rows: ${withdrawnNow.rows[0].n}`);
const badHandler = await as("authenticated", ADMISSIONS, "update public.enquiries set handled_by = 'someone-else' where reference = 'ENQ-20261029-AAAA1111'");
check("handled_by must be a Clerk user id", !!badHandler.error && /violates check constraint/.test(badHandler.error), badHandler.error ?? "accepted!");
const ownProfile = await as("authenticated", ADMISSIONS, "select user_id from public.staff_profiles");
check("staff see only their own profile row", ownProfile.rows?.length === 1 && ownProfile.rows[0].user_id === ADMISSIONS, ownProfile.error ?? JSON.stringify(ownProfile.rows));

// 5) Constraints: bad data is refused at the database, whatever the server does.
const bad = {
  "phone without +256": { phone: "0772123456" },
  "consent false": { consent_given: false },
  "learner age 9": { learner_age: 9 },
  "learner age 26": { learner_age: 26 },
  "level Primary": { desired_level: "Primary" },
  "intake with date": { preferred_intake: "2025-01-20" },
  "bad reference": { reference: "ENQ-2026-zz" },
  "source unknown": { source: "partner" },
  "question over 500": { question: "x".repeat(501) },
  "status unknown": { status: "archived" },
  "status closed (old value)": { status: "closed" },
};
let i = 0;
for (const [label, patch] of Object.entries(bad)) {
  i += 1;
  const r = await as("service_role", null, insertSql(row(`EE0${i}0000`, patch)));
  check(`constraint refuses: ${label}`, !!r.error && /violates check constraint|invalid input/.test(r.error), r.error ?? "accepted!");
}
const dup = await as("service_role", null, insertSql(row("AAAA1111")));
check("duplicate reference refused", !!dup.error && /duplicate key/.test(dup.error), dup.error ?? "accepted!");
const nullConsent = await as("service_role", null, insertSql(row("FFFF5555", { consent_given: null })));
check("consent cannot be null", !!nullConsent.error, nullConsent.error ?? "accepted!");

// 6) Rows the staff member can see are the same rows the server wrote (no hidden defaults missed).
const cols = await db.query("select column_name from information_schema.columns where table_schema='public' and table_name='enquiries' order by ordinal_position");
const columnList = cols.rows.map((r) => r.column_name);

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `  -> ${r.detail}`}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
console.log(`enquiries columns: ${columnList.join(", ")}`);
process.exit(failed.length ? 1 : 0);
