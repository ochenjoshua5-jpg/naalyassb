import type { Metadata } from "next";
import { PageHero } from "@/components/page/page-hero";
import { SectionNav } from "@/components/page/section-nav";
import { Reveal } from "@/components/motion/reveal";
import { RealImage } from "@/components/brand/real-image";
import { CARE, CO_CURRICULAR, DAILY_ROUTINE, FACILITIES, DAY_STUDENT_ROUTINE } from "@/lib/content";

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
                Co-curricular activities run alongside lessons. Students can explore their interests, build new
                skills and make lasting friendships.
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
                The daily routine at Bweyogerere Campus balances academics, meals, sports, prep time and rest.
              </p>
            </Reveal>
            <Reveal className="mt-12 max-w-2xl">
              <div className="rounded-2xl bg-card p-6 shadow-sm shadow-navy/5 md:px-8">
                <p className="text-sm font-semibold text-ink-muted">For boarding students</p>
                <ol className="divide-y divide-line/80 rounded-xl bg-card px-6 shadow-sm shadow-navy/5 md:px-8 mt-4">
                  {DAILY_ROUTINE.map((item) => (
                    <li key={`${item.time}-${item.activity}`} className="grid grid-cols-[6.5rem_1fr] gap-4 py-4 md:grid-cols-[8rem_1fr]">
                      <span className="font-semibold tabular-nums text-navy">{item.time}</span>
                      <span className="text-base leading-relaxed text-ink-muted">{item.activity}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 text-sm font-semibold text-ink-muted">For day students</p>
                <p className="text-base leading-[1.7] text-ink-muted">
                  The school day runs {DAY_STUDENT_ROUTINE.start} – {DAY_STUDENT_ROUTINE.end}. Day students should
                  report no later than {DAY_STUDENT_ROUTINE.assembly} for assembly.
                </p>
              </div>
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
                  Bweyogerere Campus is well-equipped with facilities that support both academic and extracurricular
                  activities. From classrooms and science labs to boarding houses and a dining hall, the campus is
                  designed to help every student thrive.
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
              <CardTransport />
              <CardMeals />
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
                <p className="mt-6 text-base leading-[1.7] text-ink-muted">
                  Photographs published with the school’s approval. Any image showing an identifiable student is
                  shared with recorded guardian consent. Consent forms are available from the school office.
                </p>
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

function CardTransport() {
  return (
    <div className="h-full rounded-2xl bg-card p-7 shadow-sm shadow-navy/5">
      <h3 className="font-serif text-2xl font-semibold text-navy">Transport for day students</h3>
      <p className="mt-3 text-base leading-[1.7] text-ink-muted">
        Naalya Secondary School – Bweyogerere Campus is accessible from multiple routes within Kira Town Council and
        Greater Kampala. School transport arrangements for day students, including routes and fees, are being
        confirmed. Please contact the school office for current transport options.
      </p>
      <p className="mt-4 text-base leading-[1.7] text-ink-muted">
        General directions for day student families:<br />
        • From Kampala/Ntinda: take the Namugongo Road northeast, alight at or near Bweyogerere Shell Station, then
        local transport to Bbuto Village.<br />
        • From Kireka/Bweyogerere Town: follow Bweyogerere Centre road directly toward the campus.
      </p>
    </div>
  );
}

function CardMeals() {
  return (
    <div className="h-full rounded-2xl bg-card p-7 shadow-sm shadow-navy/5">
      <h3 className="font-serif text-2xl font-semibold text-navy">Meal menus</h3>
      <p className="mt-3 text-base leading-[1.7] text-ink-muted">
        The dining hall serves nutritious, balanced meals to support student health and growth.
      </p>
      <table className="mt-4 w-full text-left border-collapse text-base leading-[1.7] text-ink-muted">
        <thead>
          <tr className="border-b border-line">
            <th className="py-2 text-left text-sm font-semibold text-navy">Meal</th>
            <th className="py-2 text-left text-sm font-semibold text-navy">Typical offerings</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-line/50">
            <td className="py-2 font-semibold text-navy">Breakfast</td>
            <td className="py-2">Porridge, bread, eggs (rotating days)</td>
          </tr>
          <tr className="border-b border-line/50">
            <td className="py-2 font-semibold text-navy">Lunch</td>
            <td className="py-2">Posho (maize meal), beans, rice, vegetable stew, or matoke</td>
          </tr>
          <tr className="border-b border-line/50">
            <td className="py-2 font-semibold text-navy">Dinner</td>
            <td className="py-2">Rice or posho, beans, groundnut stew, or mixed vegetables</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-4 text-sm leading-relaxed text-ink-muted">
        Dietary needs (e.g., medical, religious) should be communicated to the school nurse and bursar at the time of
        enrolment. The specific menu and dietary accommodation policy are subject to school confirmation.
      </p>
    </div>
  );
}
