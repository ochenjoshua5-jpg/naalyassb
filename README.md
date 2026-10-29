# Naalya Secondary School — Bweyogerere Campus website (preview)

A mobile-first homepage preview for Naalya Secondary School, Bweyogerere Campus, Kira Town Council, Wakiso District, Uganda.

This is a **preview build for school review**. It does not replace the live site at naalyaschools.ac.ug, change DNS, or submit applications.

## Stack

- Next.js 16 (App Router), React, TypeScript, Tailwind CSS v4
- shadcn/ui-style owned components in `components/ui/` (Radix primitives)
- Framer Motion for gentle scroll reveals
- Self-hosted fonts (Fraunces, Inter, Caveat) via `next/font/local`

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production preview
npm run typecheck
npm run lint
```

## Where things live

- `lib/site.ts` — the single source of truth for school details, navigation and copy. Edit facts here.
- `app/globals.css` — design tokens (palette, radius, motion).
- `components/sections/` — homepage sections in order: hero, welcome, programmes, news, admissions, visit.
- `components/site/` — header, mobile menu, footer, sticky action bar.
- `docs/DESIGN.md` — design decisions, accessibility notes, required approved images, and the feedback list for the school.
- `lib/content.ts` — structured content for the public pages (timeline, values, subjects, daily routine, FAQ, news and gallery models). Every item carries its approval status; anything unconfirmed is shown as "Pending HM Approval".
- `app/about`, `app/academics`, `app/school-life`, `app/news`, `app/admissions`, `app/contact`, `app/privacy` — the content pages.
- `docs/CONTENT-REVIEW.md` — fact-check register: every public statement, its source, its status and the questions for the school.

## Before going live

See `docs/DESIGN.md` for the full list. In short: approved logo and photos, confirmed palette, confirmed Headmaster's welcome, confirmed contact details, and a privacy notice before any form is added.
