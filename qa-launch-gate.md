# Day 6 launch gate: public site

Tested: production build (`next build` + `next start`) on 127.0.0.1:3000 in the sandbox, branch `arena/b5f5c5e7-naalyassb`.
The real Vercel host has NOT been tested. Date: 2026-10-30.

## Result: NOT ready to launch

Blocking items are listed under "Open". Lighthouse passing does not mean launch-ready; the manual tests are still required.

## Automated gates

| Gate | Result | Evidence |
|---|---|---|
| Lighthouse mobile, median of 3 runs, 9 pages | Performance 0.92–0.95 (pass). Accessibility, Best Practices 1.0 (pass). SEO 1.0 except `/admissions/enquiry` 0.63 (deliberate noindex, see Open). **LCP 2.89–3.32 s (FAIL, target ≤ 2.5 s).** TBT 43–99 ms (pass). CLS 0 (pass). Transfer 314–382 KB (pass, limit 1.5 MB). | `qa-lighthouse-mobile.json` |
| Lighthouse desktop, median of 3 runs | Performance 1.0, Accessibility 1.0, Best Practices 1.0 on all pages. SEO 1.0 except `/admissions/enquiry` 0.63 (noindex). | `qa-lighthouse-desktop.json` |
| Viewport (375, 390, 412, 768, 1280 px), 9 pages | 45 page-width checks: no horizontal overflow, no broken images. Hamburger menu works at 375, 390, 412, 768. No non-exempt touch target under 44 px. | `qa-viewport-report.json`, `qa-screenshots/` |
| axe-core WCAG 2.1 AA, 9 pages at 1280 and 390 px | 0 P0 (critical or serious), 0 total violations. | `qa-accessibility-report.json` |
| BackstopJS visual regression, 9 pages at 375, 768, 1280 px, mismatch threshold 0.1 % | 27 of 27 pass after the privacy page's new Cookies block was accepted into the reference. | `backstop/backstop.json` (bitmaps not committed) |
| Broken links (internal only) | 176 link instances, 41 unique, 0 broken. | `qa-broken-links.json` |
| Playwright suite (closed and test servers) | 133 passed, 4 skipped, 0 failed. | run log, not committed |
| Unit tests | Scrub 6/6, staff core 10/10. | |
| Type check and lint (changed files) | tsc 0, eslint 0. | |
| Secret scan | Regex scan only over working tree, `.next/static` and all history: no matches. Not verified-secret scanning. | `qa-secret-scan.txt` |
| Sitemap and robots | `/staff`, `/api`, `/admin` excluded from sitemap; robots disallows them. Priorities: home 1.0, admissions 0.9, news daily. | `app/sitemap.ts`, `app/robots.ts` |
| Security headers | CSP (no `unsafe-eval` in production), X-Frame-Options DENY, HSTS max-age 31536000, nosniff, Referrer-Policy, Permissions-Policy; `X-Powered-By` removed. | `next.config.ts` |
| Cookie consent | Banner renders on first visit; "Only essential" stores `necessary` only; banner stays hidden after reload; no console errors; no third-party requests; no Sentry script loaded when no DSN is set. | browser check during Day 6 |
| Hidden fee documents | No fee-structure PDF or document link anywhere in the site. Fees withheld with a notice on `/admissions`. | code search |

## Open (must be resolved or accepted before launch)

1. **LCP on mobile is 2.9–3.3 s; target is ≤ 2.5 s.** Diagnosis: the largest element is the hero intro paragraph; a no-JavaScript test paints it at about 1.8 s, so JavaScript is adding about 1 s. Reducing further needs a framework-level change (for example, fewer client components on the first screen). Decision needed from the school or the team.
2. **`/admissions/enquiry` SEO 0.63** because the page is `noindex` by design. Either accept (the page is a form, not a search landing page) or allow indexing. Decision needed.
3. **Real screen reader, real 3G and a real low-end Android phone have not been tested.** Lighthouse and the emulations are not a substitute. These manual tests are required by the Day 6 brief.
4. **TruffleHog `--only-verified` was not run** (the binary download is blocked here). Only the regex secret scan was run.
5. **ZAP baseline scan was not run** (no Java or Docker; downloads blocked). CSP, HSTS and the other headers are in place and checked with curl, but a ZAP pass is still required.
6. **Gold colour `#B8922E`** on the warm white background is 2.76:1 (fails 3:1 large text). Brand decision needed; no colour was changed.
7. Sentry DSN and source-map token, Turnstile keys, Supabase backup and restore, Vercel rollback test, and the school-confirmed phone and email are still needed from the school or the user.
8. Staff dashboard: a hydration mismatch appears in the development server on `/staff/enquiries` (not in production; the dashboard stays disabled). Investigate before the dashboard is enabled.

## Notes

- Generated outputs are kept out of Git: `.lighthouseci/`, `backstop/bitmaps_*`, `backstop/html_report/`. The Backstop reference images are local only and must be regenerated on a fresh checkout (`backstop reference`).
- Cookie banner styling: the banner is pinned to the site font, and its width is set explicitly. The sandbox has no system fonts, which made the banner text invisible until this was fixed; real devices are not affected by that sandbox fault.
