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

// Minimal Supabase-like environment: roles, auth schema, auth.uid(), and Supabase's default grants.
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`);
await db.exec(migration);

const ADMISSIONS = "11111111-1111-1111-1111-111111111111";
const ADMIN = "22222222-2222-2222-2222-222222222222";
const INACTIVE = "33333333-3333-3333-3333-333333333333";
const NON_STAFF = "44444444-4444-4444-4444-444444444444";
await db.exec(`
  insert into auth.users (id) values ('${ADMISSIONS}'), ('${ADMIN}'), ('${INACTIVE}'), ('${NON_STAFF}');
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
const anonUpdate = await as("anon", null, "update public.enquiries set status = 'closed'");
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
const admUpdateStatus = await as("authenticated", ADMISSIONS, "update public.enquiries set status = 'contacted', handled_at = now(), handled_by = '" + ADMISSIONS + "' where reference = 'ENQ-20261029-AAAA1111' returning status");
check("admissions staff can update status and handling fields", admUpdateStatus.rows?.[0]?.status === "contacted", admUpdateStatus.error ?? JSON.stringify(admUpdateStatus.rows));
const admEditParent = await as("authenticated", ADMISSIONS, "update public.enquiries set parent_name = 'Changed' where reference = 'ENQ-20261029-AAAA1111'");
check("staff cannot edit what the parent wrote (column grant)", !!admEditParent.error && /permission denied/.test(admEditParent.error), admEditParent.error ?? "edited!");
const admDelete = await as("authenticated", ADMIN, "delete from public.enquiries");
check("staff cannot delete enquiries through the API", !!admDelete.error && /permission denied/.test(admDelete.error), admDelete.error ?? "deleted!");
const admInsert = await as("authenticated", ADMIN, insertSql(row("DDDD4444")));
check("staff cannot insert directly through the API", !!admInsert.error && /permission denied/.test(admInsert.error), admInsert.error ?? "inserted!");
const inactiveUpdate = await as("authenticated", INACTIVE, "update public.enquiries set status = 'closed'");
const closedNow = await db.query("select count(*)::int as n from public.enquiries where status = 'closed'");
check("inactive staff update changes nothing (RLS filters the row)", !inactiveUpdate.error && closedNow.rows[0].n === 0, inactiveUpdate.error ?? `closed rows: ${closedNow.rows[0].n}`);
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
