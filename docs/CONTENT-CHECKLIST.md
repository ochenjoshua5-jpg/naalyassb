# Content checklist: what the school must confirm

Status: **for school review.** This is the current list of everything the public site still needs before launch. It replaces the Day 3 register for day-to-day use; the fact-check sources are still in `docs/CONTENT-REVIEW.md`.

Last checked: 2026-11-01, against the rendered pages (every public route, desktop width) and the source files.

## Rules behind this list

- Nothing unconfirmed is published. Unconfirmed items show **Pending HM Approval** (or “pending school confirmation”) instead of a made-up detail.
- No child is shown in a photograph without a recorded guardian consent.
- The headteacher's portrait is not shown until he approves it.
- Leadership names and roles are not shown until the headteacher confirms them.

## Approval switches in the code

| Switch | File | Value now | Turn on only when |
| --- | --- | --- | --- |
| `CHILD_PHOTOS_APPROVED` | `lib/photos.ts` | `false` | Guardian consent is recorded for every identifiable child shown |
| `HEADTEACHER_PHOTO_APPROVED` | `lib/photos.ts` | `false` | The headteacher approves his portrait in writing |
| `LEADERSHIP_APPROVED` | `lib/content.ts` | `false` | The headteacher confirms the campus leadership names and roles |
| `SCHOOL.phone`, `SCHOOL.email` | `lib/site.ts` | `null` | The school confirms the number or address (then it is shown) |

## Items the school must supply, by page

Confirmed by the school before launch: **yes** / **no**. Owner is the person named in `docs/CONTENT-REVIEW.md`.

### Home (`/`)

| # | What visitors see now | Where in the code | What the school must supply | Confirmed |
| --- | --- | --- | --- | --- |
| H1 | Two news placeholders: “Date to be confirmed”, “Placeholder: awaiting approved content” | `lib/site.ts` (`placeholders`), `components/sections/news.tsx` | Real notices, each with a confirmed date and the department that issued it. Remove the placeholders when notices exist. | No |
| H2 | Contact summary: “Campus phone and email details are pending school confirmation” | `components/sections/visit.tsx`, `lib/site.ts` | Phone number, email address | No |
| H3 | Campus card: street address to be confirmed | `components/sections/visit.tsx` | Full street address | No |
| H4 | Headteacher portrait shows the neutral placeholder | `components/sections/welcome.tsx`, `lib/photos.ts` | Written approval of the portrait | No |

### About (`/about`)

| # | What visitors see now | Where in the code | What the school must supply | Confirmed |
| --- | --- | --- | --- | --- |
| A1 | Campus leadership names and roles: now **hidden**; a note says they will be published once confirmed | `app/about/page.tsx`, `lib/content.ts` (`CAMPUS_TEAM`, `CAMPUS_CHAIR`, `LEADERSHIP_APPROVED`) | Confirm the five team members, their roles, and the chairman. Confirm before turning the switch on. | No |
| A2 | Timeline: “Further milestones” marked pending | `lib/content.ts` (`TIMELINE`) | Milestones the school wants to share (1996 and 2004 are published) | No |
| A3 | Campus facilities: classroom and laboratory counts, sports grounds, shared facilities marked pending | `app/about/page.tsx` | Numbers and facts for this campus | No |
| A4 | Campus visit booking: pending HM approval | `app/about/page.tsx` | How visits are booked, with contact route | No |
| A5 | Mission and vision: two wordings exist (campus page and network page) | `lib/content.ts` | The headteacher chooses one | No |
| A6 | Values: network-wide wording | `lib/content.ts` (`VALUES`) | Confirm Bweyogerere-specific wording | No |
| A7 | Headteacher portrait: hidden until approved | `app/about/page.tsx`, `lib/photos.ts` | Written approval of the portrait | No |

### Academics (`/academics`)

| # | What visitors see now | Where in the code | What the school must supply | Confirmed |
| --- | --- | --- | --- | --- |
| C1 | O-Level subjects for Bweyogerere: the list is for the whole network; a tag says the school will confirm which subjects are taught here | `lib/content.ts` (`OLEVEL_SUBJECTS`), `app/academics/page.tsx` | Subjects taught at Bweyogerere and any limits | No |
| C2 | A-Level subject combinations: pending | `app/academics/page.tsx` | Combinations offered at Bweyogerere | No |
| C3 | Term start and end dates, holidays, exam dates: none shown | `app/academics/page.tsx` | Dates from the school's confirmed calendar | No |
| C4 | Exam results: none shown | `app/academics/page.tsx` | Verified results with year and cohort (only publish once verified) | No |
| C5 | Phone and email: pending | `app/academics/page.tsx` | Phone number, email address | No |
| C6 | Featured classroom photo: hidden (child photo) | `app/academics/page.tsx`, `lib/photos.ts` | Guardian consent for each student shown | No |

### Admissions (`/admissions`)

| # | What visitors see now | Where in the code | What the school must supply | Confirmed |
| --- | --- | --- | --- | --- |
| D1 | Office hours for collecting forms: pending | `app/admissions/page.tsx` | Office hours | No |
| D2 | Entry requirements: pending | `lib/content.ts` (`ENTRY_REQUIREMENTS`) | Requirements for each level | No |
| D3 | Admission dates: pending | `lib/content.ts` (`ADMISSION_DATES`) | Dates from the school's confirmed calendar | No |
| D4 | FAQ answers pending (7): age range, uniform, phones and gadgets, visiting times, parents' or guardians' duties, fees, transport | `lib/content.ts` (`FAQ`, answers are `null`) | One answer per question | No |
| D5 | Fees: pending the bursar's approval | `lib/content.ts` | Fee structure (only publish once approved) | No |
| D6 | Application route: the Education Hub link is published | `lib/site.ts` (`applyUrl`) | Confirm the Education Hub is the current route | No |

### Contact (`/contact`)

| # | What visitors see now | Where in the code | What the school must supply | Confirmed |
| --- | --- | --- | --- | --- |
| K1 | Phone: not shown | `lib/site.ts` (`phone`) | Campus phone number (test the number before publishing) | No |
| K2 | Email: not shown | `lib/site.ts` (`email`) | Campus email address (send a test before publishing) | No |
| K3 | WhatsApp: whether the campus uses it | `app/contact/page.tsx` | Yes or no, and the number if yes | No |
| K4 | Office hours: pending | `app/contact/page.tsx` | Office hours | No |
| K5 | Street address and landmark: pending | `app/contact/page.tsx` | Street address and landmark | No |
| K6 | Map and directions: pending; no map pin is shown | `app/contact/page.tsx` | Location confirmed against the campus; coordinates only once checked | No |
| K7 | Campus visit booking: pending | `app/contact/page.tsx` | How visits are booked | No |

### News (`/news`)

| # | What visitors see now | Where in the code | What the school must supply | Confirmed |
| --- | --- | --- | --- | --- |
| N1 | No notices published | `lib/content.ts` (`NEWS_ITEMS` is empty) | Each notice: title, confirmed date, department, approver | No |
| N2 | Notice categories (Academics, Sports, Events, Announcements): pending | `app/news/page.tsx`, `lib/content.ts` (`NEWS_CATEGORIES`) | Confirm the categories | No |
| N3 | Who keeps this page up to date: pending | `app/news/page.tsx` | Name and role of the person responsible | No |
| N4 | Notices by text message or email: pending | `app/news/page.tsx` | Whether and how notices are sent | No |

### Privacy (`/privacy`)

| # | What visitors see now | Where in the code | What the school must supply | Confirmed |
| --- | --- | --- | --- | --- |
| P1 | Retention periods for enquiry and application records: pending | `app/privacy/page.tsx` | Periods, and who can see the records at the school | No |
| P2 | Privacy contact: pending HM approval | `app/privacy/page.tsx` | Name, role and contact details | No |
| P3 | Parental consent process for children's data: still to be confirmed | `app/privacy/page.tsx` | The school's process | No |
| P4 | Legal name of the organisation responsible for personal data | `docs/CONTENT-REVIEW.md` | Legal name | No |
| P5 | Hosting location (if outside Uganda, the notice must say so) | `docs/CONTENT-REVIEW.md` | Hosting location | No |
| P6 | Child protection and safeguarding statement | `docs/CONTENT-REVIEW.md` | Statement | No |
| P7 | Analytics or messaging tools | `docs/CONTENT-REVIEW.md` | Yes or no | No |

### School life (`/school-life`)

| # | What visitors see now | Where in the code | What the school must supply | Confirmed |
| --- | --- | --- | --- | --- |
| L1 | Daily routine: pending HM approval. Shown as published. Open questions: whether “10:00 AM Breakfast” is a break; whether “4:40” is PM (shown as 4:40 PM) | `lib/content.ts` (`DAILY_ROUTINE`), `app/school-life/page.tsx` | Confirm each time and label | No |
| L2 | Transport for day students: routes and fees pending | `app/school-life/page.tsx` | Whether transport runs, routes, fees | No |
| L3 | Meal menus: pending | `app/school-life/page.tsx` | Weekly menu and dietary arrangements | No |
| L4 | Photographs gallery: only campus photos shown; more pictures pending consent | `app/school-life/page.tsx`, `lib/photos.ts` | Guardian consent for student photos | No |
| L5 | Activity photographs: placeholders (child photos) | `lib/content.ts`, `lib/photos.ts` | Guardian consent for each student shown | No |

## Photographs

| Photo | Shows | Status on site |
| --- | --- | --- |
| `naalya-school-overview.jpg` | Campus aerial view | Shown (campus only) |
| `NAALYA-building.jpg` | School building | Shown (campus only) |
| `hm.jpg` | Headteacher portrait | Hidden until approved |
| `class-time.jpg`, `ICT-LAB.jpg`, `arts-and-crafts.jpg`, `robotics-club.jpg`, `hockey-wins-main.jpg`, `trophy-wins.jpg`, `mdd-dance.jpg`, `mdd.jpg`, `DANCE.jpg`, `prefects-pics.jpg` | Students | Hidden until guardian consent is recorded |

## Fixes made in this review

- **Leadership names were visible** on the About page under a “Pending HM Approval” label. They are now hidden behind `LEADERSHIP_APPROVED`.
- **Internal notes were visible** in the daily routine (for example, “as published; the school to confirm…”). They have been removed from the visitor text; the open questions stay in item L1.

## Open risks

- **The live Netlify site shows content that is not in this repository.** At the last check it showed the phone number `0772 444 516` and “Bbuto Village”, which are not confirmed. Find the source before launch, and remove the details unless the school confirms them.
- **Placeholder wording is visible.** The news placeholders and the header crest say “placeholder”. Replace them with final wording or artwork when the school supplies it.
