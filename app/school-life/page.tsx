import type { Metadata } from "next";
import { PhotoPlaceholder } from "@/components/brand/photo-placeholder";
import { PageHero } from "@/components/page/page-hero";
import { PendingNote, PendingTag } from "@/components/page/pending";
import { SectionNav } from "@/components/page/section-nav";
import { Reveal } from "@/components/motion/reveal";
import { CARE, CO_CURRICULAR, DAILY_ROUTINE, FACILITIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "School life",
  description:
    "Co-curricular activities, daily routine, mentorship, counselling, boarding and meals at Naalya Secondary School, Bweyogerere Campus.",
};

const SECTIONS = [
  { id: "activities", label: "Clubs and activities" },
  { id: "day", label: "A typical day" },
  { id: "care", label: "Care and support" },
  { id: "facilities", label: "Facilities and meals" },
  { id: "gallery", label: "Photographs" },
] as const;

export default function SchoolLifePage() {
  return (
    <>
      <PageHero
        id="school-life-title"
        eyebrow="School life"
        title="A structured day, with room for music, sport, debate and innovation."
        lead="Students balance academics, rest and activities. Teachers, prefects and counsellors look after each learner, both in class and outside it."
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-5 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-16">
        <div className="min-w-0 space-y-24">
          <SectionNav label="On this page, mobile" items={SECTIONS} className="lg:hidden" />

          <section id="activities" aria-labelledby="activities-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="activities-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Clubs and activities
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                Co-curricular activities run alongside lessons. Students can explore their interests, build new skills and
                make lasting friendships.
              </p>
            </Reveal>

            <ul className="mt-12 grid gap-6 sm:grid-cols-2">
              {CO_CURRICULAR.map((activity, index) => (
                <Reveal as="li" key={activity.title}>
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm shadow-navy/5">
                    <PhotoPlaceholder
                      tone={index % 2 === 0 ? "navy" : "gold"}
                      className="aspect-[4/3] w-full"
                      caption="Photo pending consent and school approval"
                    />
                    <div className="flex flex-1 flex-col p-6 md:p-7">
                      <h3 className="font-serif text-2xl font-semibold text-navy">{activity.title}</h3>
                      <p className="mt-3 text-base leading-[1.7] text-ink-muted">{activity.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </section>

          <section id="day" aria-labelledby="day-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="day-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                A typical day
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                The routine as the school has published it for Bweyogerere Campus.
              </p>
              <div className="mt-4">
                <PendingTag />
              </div>
            </Reveal>
            <Reveal className="mt-12 max-w-2xl">
              <ol className="divide-y divide-line/80 rounded-2xl bg-card px-6 shadow-sm shadow-navy/5 md:px-8">
                {DAILY_ROUTINE.map((item) => (
                  <li key={`${item.time}-${item.activity}`} className="grid grid-cols-[6.5rem_1fr] gap-4 py-4 md:grid-cols-[8rem_1fr]">
                    <span className="font-semibold tabular-nums text-navy">{item.time}</span>
                    <span className="text-base leading-relaxed text-ink-muted">{item.activity}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>

          <section id="care" aria-labelledby="care-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="care-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Care and support
              </h2>
            </Reveal>
            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {CARE.map((item, index) => (
                <Reveal as="li" key={item.title}>
                  <div className="h-full rounded-2xl bg-soft-grey p-7">
                    <h3 className="font-serif text-2xl font-semibold text-navy">{item.title}</h3>
                    <p className="mt-3 text-base leading-[1.7] text-ink-muted">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </section>

          <section id="facilities" aria-labelledby="facilities-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="facilities-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Facilities and meals
              </h2>
            </Reveal>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2">
              {FACILITIES.map((facility, index) => (
                <Reveal as="li" key={facility.title}>
                  <div className="h-full rounded-2xl bg-card p-7 shadow-sm shadow-navy/5">
                    <h3 className="font-serif text-2xl font-semibold text-navy">{facility.title}</h3>
                    <p className="mt-3 text-base leading-[1.7] text-ink-muted">{facility.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal className="mt-10 grid gap-6 md:grid-cols-2">
              <PendingNote>
                <span className="font-semibold text-navy">Transport.</span> Whether the school runs transport for day
                students, the routes and the fees, are pending HM approval.
              </PendingNote>
              <PendingNote>
                <span className="font-semibold text-navy">Meal menus.</span> The dining hall serves balanced meals. The
                weekly menu and any dietary arrangements will be confirmed by the school before publication.
              </PendingNote>
            </Reveal>
          </section>

          <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="gallery-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Photographs
              </h2>
              <div className="mt-8">
                <PendingNote>
                  Campus photographs will be added once the school has approved them. Any photo that shows a child who
                  can be identified needs a guardian’s consent, recorded before publication. Until then, this page shows
                  placeholders only.
                </PendingNote>
              </div>
            </Reveal>
          </section>
        </div>

        <aside className="hidden lg:block" aria-label="Page navigation">
          <SectionNav label="On this page" items={SECTIONS} />
        </aside>
      </div>
    </>
  );
}
