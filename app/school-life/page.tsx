import type { Metadata } from "next";
import { PageHero } from "@/components/page/page-hero";
import { PendingNote, PendingTag } from "@/components/page/pending";
import { SectionNav } from "@/components/page/section-nav";
import { Reveal } from "@/components/motion/reveal";
import { RealImage } from "@/components/brand/real-image";
import { CARE, CO_CURRICULAR, DAILY_ROUTINE, FACILITIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "School life",
  description:
    "Co-curricular activities, daily routine, mentorship, counselling, boarding and meals at Naalya Secondary School, Bweyogerere Campus.",
};

const GALLERY_ITEMS: ReadonlyArray<{ src: string; alt: string; label: string }> = [
  {
    src: "/images/naalya-school-overview.jpg",
    alt: "Wide aerial view of Naalya Secondary School Bweyogerere Campus",
    label: "Campus overview",
  },
  {
    src: "/images/NAALYA-building.jpg",
    alt: "Multi-storey school building with palm trees",
    label: "School buildings",
  },
  {
    src: "/images/class-time.jpg",
    alt: "Students in a classroom with a teacher at the chalkboard",
    label: "Academics",
  },
  {
    src: "/images/ICT-LAB.jpg",
    alt: "Students at desktop computers in the ICT laboratory",
    label: "ICT lab",
  },
  {
    src: "/images/hockey-wins-main.jpg",
    alt: "School hockey team with trophy, medals and goalkeeper",
    label: "Sports",
  },
  {
    src: "/images/trophy-wins.jpg",
    alt: "Students holding trophies and medals",
    label: "Achievements",
  },
  {
    src: "/images/mdd-dance.jpg",
    alt: "MDD performers in costume on stage",
    label: "Music, dance & drama",
  },
  {
    src: "/images/mdd.jpg",
    alt: "Students in traditional cultural performance costume",
    label: "Cultural performance",
  },
  {
    src: "/images/DANCE.jpg",
    alt: "Students dancing in red tops and striped skirts on stage",
    label: "Dance troupe",
  },
  {
    src: "/images/robotics-club.jpg",
    alt: "Teacher and students working on electronics circuit boards",
    label: "Robotics club",
  },
  {
    src: "/images/arts-and-crafts.jpg",
    alt: "Student at a sewing machine with colourful fabric",
    label: "Arts and crafts",
  },
  {
    src: "/images/prefects-pics.jpg",
    alt: "Student prefects in navy uniforms with the school crest",
    label: "Student leadership",
  },
] as const;

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

            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CO_CURRICULAR.map((activity, index) => {
                const activityImages: Record<string, { src: string; alt: string }> = {
                  "Music and dance": {
                    src: "/images/mdd-dance.jpg",
                    alt: "Students performing music and dance on stage at Naalya Secondary School, Bweyogerere Campus",
                  },
                  "Drama and debate": {
                    src: "/images/mdd.jpg",
                    alt: "Students in traditional cultural performance costume on stage",
                  },
                  "Arts and craft": {
                    src: "/images/arts-and-crafts.jpg",
                    alt: "Student working at a sewing machine in the arts and craft class",
                  },
                  "Electrical & Electronics Innovation Club": {
                    src: "/images/robotics-club.jpg",
                    alt: "Students and teacher working on electronics circuit boards in the innovation club",
                  },
                  "Sports and athletics": {
                    src: "/images/hockey-wins-main.jpg",
                    alt: "School hockey team celebrating a win with trophies and medals",
                  },
                  "Blood donation": {
                    src: "/images/trophy-wins.jpg",
                    alt: "Students holding trophies and medals in celebration",
                  },
                };
                const image = activityImages[activity.title];
                return (
                  <Reveal as="li" key={activity.title}>
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm shadow-navy/5">
                      <RealImage
                        src={image.src}
                        alt={image.alt}
                        className="aspect-[4/3] w-full object-cover object-center"
                      />
                      <div className="flex flex-1 flex-col p-6 md:p-7">
                        <h3 className="font-serif text-2xl font-semibold text-navy">{activity.title}</h3>
                        <p className="mt-3 text-base leading-[1.7] text-ink-muted">{activity.body}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
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
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <Reveal className="lg:w-1/2">
                <RealImage
                  src="/images/ICT-LAB.jpg"
                  alt="Students using computers in the ICT laboratory at Naalya Secondary School, Bweyogerere Campus"
                  className="w-full rounded-2xl shadow-xl shadow-navy/15 object-cover object-center aspect-video"
                  priority
                />
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  ICT laboratory with desktop computers for digital learning and technology skills.
                </p>
              </Reveal>
              <Reveal className="lg:w-1/2 min-w-0">
                <h2 id="facilities-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                  Facilities and meals
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                  Modern facilities alongside a balanced approach to academics and activities. Students can be day or
                  boarding students.
                </p>
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
              </Reveal>
            </div>
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
            <div className="space-y-12">
              <Reveal>
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  <div className="lg:w-1/3 min-w-0">
                    <h2 id="gallery-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                      Photographs
                    </h2>
                    <p className="mt-4 text-lg leading-[1.75] text-ink-muted">
                      Campus life in pictures: academics, sports, performing arts, clubs and facilities at
                      Bweyogerere Campus.
                    </p>
                    <PendingNote className="mt-6">
                      Photographs published with the school’s approval. Any image showing an identifiable student is
                      shared with recorded guardian consent.
                    </PendingNote>
                  </div>
                  <div className="lg:w-2/3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {GALLERY_ITEMS.map((item) => (
                        <div
                          key={item.src}
                          className="rounded-2xl overflow-hidden shadow-md shadow-navy/10 bg-card border border-line group"
                        >
                          <RealImage
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-48 md:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                          <p className="px-3 py-2 text-sm font-medium text-navy">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        </div>

        <aside className="hidden lg:block" aria-label="Page navigation">
          <SectionNav label="On this page" items={SECTIONS} />
        </aside>
      </div>
    </>
  );
}
