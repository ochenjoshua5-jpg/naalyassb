# Naalya Secondary School · Bweyogerere Campus — Design notes

Status: **preview for school review.** Palette, copy and imagery are provisional until the school confirms them.

## Palette (max three colours and their shades)

| Token | Hex | Use |
| --- | --- | --- |
| `--navy` | `#1b2a4a` | Text, headings, hero and admissions backgrounds |
| `--gold` | `#d4a843` | Primary buttons, focus rings, accents |
| `--warm-white` | `#faf8f5` | Page background |
| `--soft-grey` | `#f5f3ef` | Alternate section background |
| Shades | `--navy-deep`, `--navy-soft`, `--gold-deep`, `--gold-tint`, `--ink-muted` | Hover states, placeholder art, secondary text |

Contrast checked against the real tokens: navy on warm white 13.4:1; muted ink on warm white 7.0:1; navy on gold 6.4:1; gold on navy 6.4:1. Gold is not used for body text on light backgrounds (2.1:1). The gold focus ring is 3px with a navy outer ring, so it stays visible on both light and dark sections.

## Typography

- Headings: Fraunces (serif), self-hosted variable woff2 in `app/fonts/`.
- Body and UI: Inter (sans), self-hosted variable woff2.
- Handwritten accent: Caveat, used only for the Headmaster's signature line.
- Fonts load through `next/font/local`, so there is no layout shift from font swaps and no third-party font request.

## Shape, depth and layout

- Radius: 0.75rem on cards and inputs, pill shape on tags.
- Shadows are soft and layered. No harsh 1px black borders.
- Mobile-first. Every layout is designed at 375px first, then widened. Grids use `grid-cols-1` as the base.
- Asymmetry: the welcome section (text and tilted portrait), the programme cards (staggered heights) and the admissions section (split 5/7 with offset step cards).

## Motion

- Framer Motion scroll reveals. Duration 0.7s, `easeOut`, 24px movement, triggered once with a −80px viewport margin.
- Everything is disabled under `prefers-reduced-motion` (`MotionProvider` sets `reducedMotion="user"`).
- No linear easing and no high-stiffness springs.

## Accessibility

- Skip link, landmark regions, a single `h1` in the hero.
- Keyboard: all links and buttons reachable in source order; visible gold focus ring.
- Mobile menu uses a dialog with focus handling (Radix Dialog).
- Decorative placeholder art is `aria-hidden`.

## Imagery

No stock photos are used. Every image slot is either a **warm colour-block placeholder** or waits for an approved photo. See "Required approved images" below.

## Copy rules

- Only school-confirmed or school-published facts are shown. The public site is the source for the preview; each fact is marked as pending sign-off in `lib/site.ts`.
- No invented statistics, fees, testimonials, results or dates. News cards read "Date to be confirmed".
- Phone and email are `null` in `lib/site.ts` and are hidden until the school confirms them.
- The Headmaster's welcome uses the school's published words. The brief's example line is not used.
- The "Admissions Open for Term 1 2025" banner from the Cruip mapping is not used; it is out of date.

## Required approved images (for the school)

1. Official school crest or logo (SVG or high-res PNG). Currently an inline placeholder mark is used.
2. Headmaster portrait, with written consent (welcome section).
3. Two or three campus photos for the hero and gallery, with consent for any identifiable pupils.
4. Classroom or science lab photo (programmes section).
5. Co-curricular photo (music, drama or sports) with consent.
6. Optional: a photo of the campus entrance for the visit section.

## Feedback to record with the school

- Confirm the palette: navy `#1b2a4a` and gold `#d4a843` as the brand colours, or send the school's own colours.
- Confirm the Headmaster's welcome text, or supply the wording.
- Confirm the Education Hub application route (currently `hub.naalyaschools.ac.ug/naalya-secondary-school/apply`).
- Confirm an official phone number, WhatsApp number and email. Until then, none are shown.
- Confirm the physical address line shown in the visit section.
- Provide approved news and term dates, or confirm that the news section stays as a placeholder at launch.
- Name the person who will keep the site updated.
- Confirm the privacy notice owner before any enquiry form is added.

## Out of scope for this preview

Parent portal, online payments, auto-messaging, AI assistant, and a custom enquiry form (unless the school approves one). The enquiry button goes to the existing school route.
