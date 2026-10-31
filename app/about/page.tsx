import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/page/page-hero";
import { SectionNav } from "@/components/page/section-nav";
import { Timeline } from "@/components/page/timeline";
import { Reveal } from "@/components/motion/reveal";
import { RealImage } from "@/components/brand/real-image";
import {
  CAMPUS_CHAIR,
  CAMPUS_TEAM,
  FACILITIES,
  TIMELINE,
  VALUES,
} from "@/lib/content";
import { COPY, SCHOOL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the campus",
  description:
    "The story, mission, vision, values and leadership of Naalya Secondary School, Bweyogerere Campus, in Kira Town Council, Wakiso District.",
};

const SECTIONS = [
  { id: "our-story", label: "Our story" },
  { id: "our-growth", label: "Our growth" },
  { id: "mission-vision", label: "Mission and vision" },
  { id: "values", label: "Values" },
  { id: "leadership", label: "Leadership" },
  { id: "campus", label: "The campus" },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        id="about-title"
        eyebrow="About the campus"
        title="A school built on hard work, discipline and care."
        lead="Naalya Secondary School Bweyogerere Campus opened in 2004 and is one of the three established campuses under the Naalya Schools umbrella. Located in Kira Town Council, approximately 13 kilometres from Kampala, the campus was founded to meet the growing demand for quality secondary education in the region. Over time, Bweyogerere has become known for strong academic results, inclusive student life, and a culture of integrity and innovation."
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-5 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-20">
        <div className="min-w-0">
          <SectionNav label="On this page, mobile" items={SECTIONS} className="lg:hidden" />

          {/* Chapter 1: story */}
          <section id="our-story" aria-labelledby="our-story-title" className="scroll-mt-28">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">Chapter one</p>
              <h2 id="our-story-title" className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Our story
              </h2>
              <div className="mt-8 max-w-2xl space-y-6 text-lg leading-[1.8] text-navy">
                <p>
                  Naalya Secondary School began in 1996 with a first campus in Namugongo, founded by a group of
                  professional teachers who wanted to nurture both academic performance and strong moral character.
                </p>
                <p>
                  Bweyogerere Campus opened in 2004 in Kira Town Council, Wakiso District, to meet the rising demand
                  for quality secondary education in the Naalya area. Today it is known for strong academic results,
                  inclusive student life, and a culture of integrity and innovation — rooted in the principles of hard
                  work, discipline, integrity and excellence on which Naalya was founded.
                </p>
              </div>
            </Reveal>
          </section>

          {/* Chapter 2: growth, timeline */}
          <section id="our-growth" aria-labelledby="our-growth-title" className="mt-24 scroll-mt-28">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">Chapter two</p>
              <h2 id="our-growth-title" className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Our growth
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                From a single campus in 1996 to a multi-campus school system today, Naalya has grown to meet the needs
                of more families. Bweyogerere Campus is one of the three established campuses under the Naalya Schools
                umbrella.
              </p>
              <div className="mt-14 max-w-2xl">
                <Timeline items={TIMELINE} />
              </div>
            </Reveal>
          </section>

          {/* Pull quote */}
          <Reveal className="mt-24">
            <figure className="rounded-3xl bg-navy px-8 py-14 text-warm-white shadow-xl shadow-navy/20 md:px-14">
              <blockquote className="font-serif text-3xl leading-snug tracking-[-0.01em] md:text-4xl">
                <span aria-hidden className="mr-2 text-gold">“</span>
                {COPY.welcome.pullQuote}
                <span aria-hidden className="ml-1 text-gold">”</span>
              </blockquote>
              <figcaption className="mt-8 font-hand text-3xl text-gold">{SCHOOL.headteacher.name}</figcaption>
              <p className="text-base text-warm-white/75">{SCHOOL.headteacher.title}</p>
            </figure>
          </Reveal>

          {/* Chapter 3: mission, vision, values */}
          <section id="mission-vision" aria-labelledby="mission-title" className="mt-24 scroll-mt-28">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">Chapter three</p>
              <h2 id="mission-title" className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                What guides us
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Reveal>
                <Card className="h-full border-l-4 border-gold">
                  <CardHeader>
                    <CardTitle className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      Our mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <p className="font-serif text-xl leading-relaxed text-navy">{COPY.welcome.mission}</p>
                  </CardContent>
                </Card>
              </Reveal>
              <Reveal>
                <Card className="h-full border-l-4 border-navy">
                  <CardHeader>
                    <CardTitle className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      Our vision
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <p className="font-serif text-xl leading-relaxed text-navy">{COPY.welcome.vision}</p>
                  </CardContent>
                </Card>
              </Reveal>
            </div>

            <section id="values" aria-labelledby="values-title" className="mt-20 scroll-mt-28">
              <Reveal>
                <h3 id="values-title" className="font-serif text-3xl font-semibold text-navy">
                  Our values
                </h3>
                <p className="mt-3 max-w-2xl text-base leading-[1.75] text-ink-muted">
                  The values that guide Naalya Secondary Schools — lived out every day at Bweyogerere Campus.
                </p>
              </Reveal>
              <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {VALUES.map((value, index) => (
                  <Reveal key={value.title} className="border-t-2 border-gold pt-5">
                    <dt className="font-serif text-2xl font-semibold text-navy">{value.title}</dt>
                    <dd className="mt-2 text-base leading-[1.7] text-ink-muted">{value.body}</dd>
                  </Reveal>
                ))}
              </dl>
            </section>
          </section>

          {/* Chapter 4: people */}
          <section id="leadership" aria-labelledby="leadership-title" className="mt-24 scroll-mt-28">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">Chapter four</p>
              <h2 id="leadership-title" className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Our people
              </h2>
            </Reveal>

            <Reveal className="mt-10">
              <div className="flex flex-col gap-6 rounded-2xl bg-card p-6 shadow-sm shadow-navy/5 sm:flex-row sm:items-center sm:p-8">
                <RealImage
                  src="/images/hm.jpg"
                  alt="Portrait of Mr. Okongo David, Headteacher of Naalya Secondary School, Bweyogerere Campus"
                  className="shrink-0 size-24 rounded-full object-cover object-center"
                  priority
                />
                <div>
                  <p className="font-hand text-4xl leading-none text-navy">{SCHOOL.headteacher.name}</p>
                  <p className="mt-2 text-base text-ink-muted">{SCHOOL.headteacher.title}</p>
                  <p className="mt-3 text-base leading-relaxed text-ink-muted">
                    Mr. Okongo David serves as Headteacher of Naalya Secondary School – Bweyogerere Campus. Under his
                    leadership, the campus has continued to build on its reputation for academic excellence, strong
                    moral values, and inclusive student development. Mr. Okongo is committed to providing every
                    learner with an environment that is both structured and nurturing.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal className="mt-10">
              <h3 className="font-serif text-2xl font-semibold text-navy">Campus leadership team</h3>
              <p className="mt-4 max-w-2xl text-base leading-[1.75] text-ink-muted">
                The campus leadership team works together to ensure every learner is supported, challenged and cared
                for.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {CAMPUS_TEAM.map((person) => (
                  <li key={person.name} className="rounded-xl bg-soft-grey p-5">
                    <p className="font-semibold text-navy">{person.name}</p>
                    <p className="mt-1 text-sm text-ink-muted">{person.role}</p>
                  </li>
                ))}
                <li className="rounded-xl bg-soft-grey p-5 sm:col-span-2">
                  <p className="font-semibold text-navy">{CAMPUS_CHAIR.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">{CAMPUS_CHAIR.role}</p>
                </li>
              </ul>
            </Reveal>
          </section>

          {/* Chapter 5: campus */}
          <section id="campus" aria-labelledby="campus-title" className="mt-24 scroll-mt-28">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <Reveal className="lg:w-1/2">
                <RealImage
                  src="/images/naalya-school-overview.jpg"
                  alt="Wide aerial view of Naalya Secondary School Bweyogerere Campus showing buildings, green lawns, trees and parking"
                  className="w-full rounded-2xl shadow-xl shadow-navy/15 object-cover object-center aspect-video"
                  priority
                />
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  Bweyogerere Campus — day and boarding education in Kira Town Council, Wakiso District.
                </p>
              </Reveal>
              <Reveal className="lg:w-1/2 min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">Chapter five</p>
                <h2 id="campus-title" className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                  The campus
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
          </section>

          {/* Campus visit booking */}
          <Reveal className="mt-24">
            <div className="grid gap-8 rounded-3xl bg-gold-tint/70 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-navy md:text-4xl">
                  Visit Bweyogerere Campus
                </h2>
                <p className="mt-4 max-w-xl text-base leading-[1.75] text-navy/80">
                  Prospective parents and students are welcome to visit Naalya Secondary School – Bweyogerere Campus.
                  To arrange a guided campus tour, please contact the school office during working hours
                  (Monday–Friday, 8:00 AM – 5:00 PM). Visit booking details are being finalised — check back soon or
                  call the school office directly.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Button asChild size="lg">
                  <a href={SCHOOL.applyUrl}>
                    Start an application
                    <ArrowUpRight aria-hidden />
                    <span className="sr-only">(opens the Education Hub)</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={SCHOOL.enquiryUrl}>Make an enquiry</a>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        <aside className="hidden lg:block" aria-label="Page navigation and links">
          <SectionNav label="On this page" items={SECTIONS} />
          <div className="mt-10 rounded-2xl bg-card p-5 text-sm leading-relaxed text-ink-muted shadow-sm shadow-navy/5">
            <p>
              Looking for dates or contact details?{" "}
              <Link href="/contact" className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4">
                See the contact page
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
