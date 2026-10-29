# Day 4: Admissions enquiry pipeline

Status: **built and tested in a test environment. The live enquiry form is switched OFF in the public preview.**

Timestamps in this document and in the code are East Africa Time (EAT, UTC+3, zone `Africa/Kampala`). Records are stored in UTC and shown in EAT.

---

## 1. Decision

The implementation guide says that a custom enquiry form is built only if the school approves it, and that the form is not enabled if storage, privacy approval or access controls are not ready. None of these are ready:

| Condition | Status |
| --- | --- |
| School approval for a custom form | Not given |
| Privacy notice reviewed by the school | Not given (draft only, `app/privacy/page.tsx`) |
| Storage (Supabase project) | No school project exists. Nothing was created. |
| Staff access and roles | Not decided |
| Retention period | Not set |
| Verified phone and email for the fallback | Not confirmed by the school |

So the pipeline is **built behind a flag and tested, and the public preview keeps the form off.**

| Route | Status |
| --- | --- |
| Apply Now → Education Hub (`https://hub.naalyaschools.ac.ug/naalya-secondary-school/apply`) | Verified link from the school's admissions page. Not reachable from this sandbox (see §2). |
| Make an enquiry → school's admissions page (`https://naalyaschools.ac.ug/admissions`) | Existing school route, unchanged. |
| Custom enquiry form (`/admissions/enquiry`) | Built. Shows the verified fallback while disabled. |
| Phone and email | Not shown. `lib/site.ts` keeps them `null` until the school confirms them. |

---

## 2. Apply Now verification

`npm run check:hub` requests the Hub link with a 10-second timeout per attempt. It retries only on 5xx responses (up to 3 attempts). It reports network errors once without retrying, and it checks that the final host is `hub.naalyaschools.ac.ug`. Every attempt is logged as JSON with UTC and EAT timestamps.

Result from this sandbox (outbound access is limited to package registries and GitHub):

```
{"event":"hub_check","attempt":1,"status":"no-response","error":"TypeError","elapsed_ms":83}
{"event":"hub_check","result":"unreachable","url":"https://hub.naalyaschools.ac.ug/naalya-secondary-school/apply"}
exit=2
```

**Still to do by a person:** open the Hub link on a phone and on a desktop from a normal internet connection, and confirm it loads the Naalya Secondary School application. The browser tests check that the link's `href` is the Hub URL. They do not check that the Hub responds.

---

## 3. Form: fields, rules and messages

The form and the API use one Zod schema (`lib/enquiry/schema.ts`). The server validates the same way, so client-side checks cannot be bypassed. Messages are warm and specific. The complete list is in the schema file.

| Field | Required | Rule | Notes |
| --- | --- | --- | --- |
| Parent or guardian's full name | Yes | 2 to 80 characters; letters, spaces, `.`, `'`, `’`, `-` | |
| Phone number | Yes | Spaces, dashes and brackets allowed. Normalised to `+256XXXXXXXXX`, then checked against `PHONE_PATTERN` | Accepts `07xx xxx xxx`, `0…`, `00256…`, `256…`, `+256…` |
| Email address | No | Valid email if given; lower-cased | Phone-only parents leave it blank |
| Level of interest | Yes | O-Level or A-Level | Secondary only |
| Learner's age | Yes | Whole years, 10 to 25 | Sanity check only. Eligibility is pending school confirmation. |
| Intake you have in mind | Yes | "Next available intake" or "Not sure yet, please advise me" | Non-dated. Term dates are pending HM approval. |
| Your question | No | Up to 500 characters. Refused if it contains a Uganda NIN-like code or a 13-or-more-digit number | Guidance says not to include medical details or ID numbers |
| Consent | Yes | Must be `true`. The label is the literal notice text. | Link to `/privacy` |
| Honeypot (`website`) | Hidden | Must be empty. A filled value is refused with 400. | Not visible to people |

**Deviations from the guide (agreed for Day 4, to be confirmed by the school):**
- `desiredLevel` is O-Level and A-Level, not nursery, primary and secondary. The school offers secondary only.
- `preferredTerm` with dated 2025 values is replaced by non-dated intake options.
- The learner's age range is a sanity check, not an eligibility rule.
- Phone input accepts spaces. Normalisation runs before the pattern check.

**Phone pattern:** the exact pattern from the Day 4 brief could not be recovered from my working notes. The schema uses `/^\+256[1-9]\d{8}$/` after normalisation. This **must be replaced with the approved pattern** (`PHONE_PATTERN` in `lib/enquiry/schema.ts`) before any launch.

**Privacy notice:** the consent text is marked `draft-2026-10-29` (`PRIVACY_NOTICE_VERSION`). Each stored record carries that version, so a later approved notice can be tracked. The school must approve the text.

---

## 4. Data structure, RLS and staff access

Migration: `supabase/migrations/20261029090000_enquiries.sql`. **Draft. Not applied to any project.**

- `public.enquiries`: one row per enquiry. Only the fields the school needs. Constraints on every field (checked in the database, not just the app). Status `new`, `contacted` or `closed`. `retain_until` is empty until the school sets a retention period.
- `public.staff_profiles`: maps a Supabase Auth user to `admissions` or `admin`, and an `active` flag.
- Row Level Security is on for both tables. `anon` and `authenticated` have all privileges revoked. Supabase's default grants are revoked explicitly, including `EXECUTE` on the helper function.
- Only active staff (role `admissions` or `admin`) can read enquiries.
- Staff can update **only** `status`, `handled_at` and `handled_by` (column-level grant). They cannot edit what the parent wrote, and they cannot delete or insert through the API.
- Writes come only from the website server, using the service-role key. That key is server-side only (see §6).
- Staff management: the admin role is granted in the Supabase dashboard or by SQL. The staff view is planned for Day 5.

**Verification:** `npm run verify:sql` runs the migration on PGlite (an in-memory Postgres engine), with Supabase-like roles and `auth.uid()`. **30 of 30 checks pass:** service-role writes; anonymous users cannot read, write, update or call the helper; non-staff and inactive staff see zero rows; admissions and admin staff can read; staff can change only the handling columns; deletes and direct inserts are refused; each constraint refuses bad data (phone without +256, consent false, age 9 or 26, unknown level or status, a date as intake, a bad reference, an oversize question, a duplicate reference, a null consent).

This is evidence about the SQL, not about a live Supabase project. The same checks must be rerun on the real project if the school approves it.

**Supabase:** the connector lists one project, `fatumahs-closet`. It is not connected to the school, so nothing was written to it.

---

## 5. Server validation and abuse controls

`POST /api/enquiry`, in this order:

1. **Mode.** If the mode is `disabled`, return 503 with the warm message. Nothing is stored.
2. **Content type** must be JSON (415 otherwise).
3. **Size** must be 8 KB or less (413 otherwise).
4. **JSON** must parse to an object (400 otherwise).
5. **Honeypot.** A filled `website` field returns 400 (no false success).
6. **Schema.** The shared Zod schema. Errors return 422 with per-field messages.
7. **Rate limit.** 3 enquiries per IP address per hour (429 otherwise). Production uses Upstash Redis (sliding window). Test mode uses an in-memory window. The IP is hashed (SHA-256, truncated) before it reaches the limiter or the logs.
8. **Turnstile.** The token is verified with Cloudflare's siteverify endpoint, using the server-side secret. Missing or rejected tokens return 403. In production, a missing secret fails closed.
9. **Store.** The insert must succeed. A storage failure returns 503 and never a success.
10. **Success.** 201 with the reference (`ENQ-YYYYMMDD-XXXXXXXX`), the UTC time and the EAT time.

**Fail-closed rules:** `ENQUIRY_STORE=supabase` is accepted only with `ENQUIRY_SCHOOL_APPROVED=yes` and every Supabase, Turnstile and Upstash setting present. Otherwise the form stays off. Test modes are refused whenever `NODE_ENV` or `VERCEL_ENV` is `production`.

**Client IP:** the rate limit reads `x-real-ip`, then the first `x-forwarded-for` value. This is correct only if the host overwrites these headers at the edge. **Verify this on the hosting platform before launch.**

**Logs** carry the event, request id, reason code and EAT timestamp. They never carry names, phone numbers, emails, questions or raw IP addresses. Store errors log only the error name.

---

## 6. Secrets audit

`npm run audit:secrets` checks four things and returned **pass**:

1. No `.env` file is tracked, except `.env.example` (which has no values).
2. No key-shaped value (JWT, `sb_secret_`, `sk_live`, AWS key, private key, or a named secret with a value) appears in tracked files.
3. No server-only variable name appears in the built client bundle (`.next/static`).
4. No `NEXT_PUBLIC_` variable carries a secret.

`.gitignore` covers `.env*` (with `.env.example` allowed), `test-results/` and `playwright-report/`.

---

## 7. Fallbacks

| Failure | What the parent sees | Saved? |
| --- | --- | --- |
| Form off (public preview) | "Online enquiries aren’t open yet", with the Education Hub, the admissions page and the school's X handle | No |
| API returns 503 (storage down) | "We couldn’t save your enquiry just now, so it has not been received", with Hub and admissions links. Answers stay in the form. | No |
| Network error or timeout (15 s) | "We couldn’t reach the enquiry service…" | No |
| 502 from a proxy | The same storage message | No |
| Rate limit (429) | "You have sent several enquiries from this connection in the last hour…" | No |
| Turnstile failure (403) | "Please complete the short security check…" | No |
| Honeypot filled (400) | The storage message. The response does not reveal the trap. | No |

No failure shows a success message or a reference number. Tests check each case.

---

## 8. Accessibility and interface

- Labels, hints and errors come from HeadlessUI (`Field`, `Label`, `Description`, `Input`, `Textarea`, `Fieldset`, `Legend`, `RadioGroup`, `Radio`, `Checkbox`). HeadlessUI is a new dependency for this form only (see §12).
- Errors appear as an alert with a summary. Each summary item moves focus to its field. Each field is marked `aria-invalid`.
- Each option set sits in a fieldset named by its legend (HeadlessUI's pattern; the radio group element itself is not separately named). Arrow keys move between options (tested).
- The consent checkbox is a real button with `role="checkbox"`, so its label is announced.
- Feedback uses Sonner toasts, plus inline status text. The button shows "Sending your enquiry…" with `aria-busy` while sending.
- On success, focus moves to the confirmation heading.
- The layout was tested at 375 px and 1280 px. There is no horizontal scrolling.
- The axe scan has no serious or critical violations on the form at either width.

---

## 9. Test evidence

Run with `npm run build`, then `npm run test:e2e`. The Chromium binary used in this sandbox comes from the `@sparticuz/chromium` npm package (Chromium 153), because the Playwright CDN is blocked here.

**Result: 52 of 52 tests pass.**

| Project | Server | Tests |
| --- | --- | --- |
| `closed-375`, `closed-1280` | Production build, `ENQUIRY_STORE=disabled`, port 3000 | Form not shown; no-index metadata; verified routes; no unconfirmed contact details; Apply link to the Hub; API returns 503 and stores nothing; no horizontal scroll; fallback page on Fast 3G |
| `open-375`, `open-1280` | Development server, `ENQUIRY_STORE=test-file`, port 3001 | Labels and controls; empty-submit messages; invalid input messages; consent required; full success path (normalised phone, minimal fields, EAT time checked against UTC); honeypot; rejected content types, bodies and methods; rate limit; loading state; keyboard arrows; axe; no horizontal scroll; Fast 3G submit |
| `backend-down-375`, `backend-down-1280` | Same test server, with the simulated outage switched on | Save failure (no success, answers kept, toast); fallback routes; API 503 with no reference; network abort; 502; Hub link |

**Fast 3G (closed page, production build, 1.6 Mbps down, 750 kbps up, 562.5 ms latency):** load about 3.1 s; about 373 KB transferred. This is under the guide's 1.5 MB target. The form page's production weight was not measured, because the test form runs on a development server (the app refuses test mode in production builds).

**Test data:**
- Every record is synthetic. Names come from Ugandan first-name and surname lists, with Faker for the rest. Phone numbers are random. Emails use `example.test`.
- Records go to a file in the operating system's temp directory, outside the repository, with `source: "test"`.
- Each test deletes its own records. The global teardown removes the temp directory and checks that it is gone. In the last run, teardown found **0 records left** before removing the directory.
- No real parent data was entered anywhere (sandbox, preview, or any hosted store).

**Other checks:** `npm run typecheck` (no errors), `npm run lint` (no errors), `npm run build` (succeeds; `/admissions/enquiry` and `/api/enquiry` are dynamic routes).

**Limits:**
- The test form runs on a development server, not a production build.
- Turnstile verification is skipped in test mode. The sandbox cannot reach Cloudflare.
- Upstash is not exercised in tests (in-memory limiter used instead).
- The Supabase store adapter (`SupabaseStore`) has not been run against a real project.

---

## 10. Quality gate (Day 4 checklist)

Legend: ✅ done and evidenced · ⚠️ done with a limit · ⛔ blocked (needs a person or an account)

### Form functionality
- ✅ Labels, hints and errors for every control; warm, specific messages (§3, §8)
- ✅ Client and server use the same Zod schema (§3, §5)
- ✅ Loading, success and error states; no false success (§7, tests)
- ✅ Phone with spaces and a leading 0 accepted and normalised (test)
- ⚠️ Phone pattern is a placeholder until the approved regex is confirmed (§3)

### Security
- ✅ Rate limit: 3 per IP per hour, 4th refused (test)
- ✅ Honeypot refuses bots (test)
- ✅ Body size, content type and method limits (test)
- ✅ Turnstile wired and fails closed in production (code); ⛔ not verified live (no Cloudflare keys, sandbox cannot reach Cloudflare)
- ✅ Service-role key server-side only; secrets audit pass (§6)
- ✅ Logs carry no personal data (§5)
- ⚠️ Client IP header trust must be verified on the host (§5)

### Privacy
- ✅ Only necessary fields stored (test checks the exact field list)
- ✅ Consent must be literally `true` (schema, database check, test)
- ✅ Sensitive-data guidance in the question field, with a server refusal for NIN-like codes (tested; long numeric codes are refused by the code but not tested)
- ⛔ School approval of the privacy text, retention period, staff access and cross-border hosting (none given)
- ✅ Enquiry data not public: RLS denies anonymous access (SQL check)
- ✅ The form is `noindex`, and the form is off in the public preview (test)

### Fallback
- ✅ Verified Hub link, admissions link and X handle shown (tests)
- ⛔ School phone and email not confirmed, so not shown
- ✅ Every failure case shows a warm message and the fallback routes (§7, tests)

### Data integrity
- ✅ Constraints enforce every rule at the database (SQL checks 30 of 30)
- ✅ Reference format and uniqueness (SQL check)
- ✅ Stored record matches the submitted, normalised values (test)
- ✅ Timestamps: stored in UTC; displayed in EAT, checked against UTC+3 (test)
- ⛔ Migration not applied; no live project

### Timestamps
- ✅ EAT (Africa/Kampala, UTC+3) for display and logs; UTC for storage

### Apply Now
- ✅ Link matches the school-published Hub URL (test)
- ⛔ Hub response not checked: unreachable from the sandbox (§2)

### Testing
- ✅ Playwright: 52 of 52 pass (§9)
- ✅ Synthetic data only; records deleted; teardown confirms removal (§9)
- ✅ Backend-failure test (simulated outage, network abort, 502)
- ✅ Fast 3G: closed page measured (about 3.1 s, 373 KB); form page not measured in production
- ✅ 375 px and 1280 px
- ✅ Axe: no serious or critical violations on the form

### Build and code health
- ✅ Typecheck, lint, production build
- ✅ Dependencies recorded in `package.json` (§12)

### Approval
- ⛔ HM review of the end-to-end flow (scheduled for end of Day 4)
- ⛔ School approval to enable the form (not requested as part of this build)

---

## 11. Blockers and open decisions

For the Headteacher's office, the admissions representative and the privacy reviewer:

1. **Confirm the Hub application link** from a phone and a desktop outside the sandbox.
2. **Confirm a contact phone number and email** for admissions (or confirm that the Hub and admissions page are the only routes). Until then, none are shown.
3. **Approve the privacy notice**, the retention period, the staff roles, and whether any data may be hosted outside Uganda.
4. **Decide whether the custom form should be enabled at all.** If it is, the school must approve it in writing, and an account owner must create the Supabase project, Cloudflare Turnstile keys and Upstash database.
5. **Provide the approved phone pattern**, if it differs from `/^\+256[1-9]\d{8}$/`.
6. **Confirm the learner-age range** (10 to 25 is a placeholder sanity check) and the intake wording.

For the developer, before any launch:
- Rerun `npm run verify:sql` and the migration on the real project.
- Test Turnstile, Upstash and Supabase in a staging environment with synthetic data only.
- Confirm the platform overwrites the client-IP headers.
- Remove the `test-file` mode from any deployment checklist (it is already refused in production builds).

---

## 12. Changes and dependencies

**New dependencies** (runtime): `react-hook-form` 7.91, `@hookform/resolvers` 5.9, `zod` 3.25, `@headlessui/react` 2.2, `sonner` 2.0, `@upstash/ratelimit` 2.2, `@upstash/redis` 1.40.

**New dependencies** (development): `@playwright/test` 1.64, `@faker-js/faker` 9.9, `@axe-core/playwright` 4.14.

**HeadlessUI** was added because the Day 4 guide requires it for every interactive form control. This supersedes the Day 3 "no new UI kits" decision **for the enquiry form only**. The rest of the site is unchanged.

**Files added:** `app/admissions/enquiry/page.tsx`, `app/api/enquiry/route.ts`, `components/enquiry/*`, `lib/enquiry/*`, `playwright.config.ts`, `tests/*`, `scripts/check-hub.mjs`, `scripts/secrets-audit.sh`, `scripts/verify-enquiry-sql.mjs`, `supabase/migrations/20261029090000_enquiries.sql`, `.env.example`, and this document.

**Files changed:** `.gitignore` (allows `.env.example`, ignores Playwright output), `package.json` and `package-lock.json` (dependencies and scripts).

**Not changed:** the live website, DNS, production settings, the Day 3 pages and content, and `lib/site.ts`.

## 13. Commands

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e         # needs the build; uses ports 3000 and 3001 on 127.0.0.1
npm run audit:secrets
npm run verify:sql       # needs: npm install --no-save @electric-sql/pglite
npm run check:hub        # real network check; exit 0 ok, 1 wrong status, 2 unreachable
```
