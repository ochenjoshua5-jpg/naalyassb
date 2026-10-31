import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page/page-hero";
import { SectionNav } from "@/components/page/section-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/motion/reveal";
import { RealImage } from "@/components/brand/real-image";
import {
  OLEVEL_STANDARD_SUBJECTS,
  ALEVEL_COMBINATIONS,
  ALEVEL_SUBSIDIARIES,
  TERM_DATES_2026,
  TERM_HOLIDAYS_2026,
  NEW_STUDENT_REPORTING_2026,
  TOTAL_INSTRUCTIONAL_DAYS_2026,
  EXAM_INFO,
  RESULTS_STATEMENT,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Academics",
  description:
    "O-Level and A-Level education at Naalya Secondary School, Bweyogerere Campus: the national curriculum, subjects, term dates, and how to find results.",
};

const SECTIONS = [
  { id: "levels", label: "O-Level and A-Level" },
  { id: "subjects", label: "Subjects" },
  { id: "how-we-teach", label: "How we teach" },
  { id: "calendar", label: "Term dates" },
  { id: "exams", label: "Exams and results" },
] as const;

function SubjectGroup({ title, subjects }: { title: string; subjects: readonly string[] }) {
  return (
    <div>
      <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">{title}</h3>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {subjects.map((subject) => (
          <li
            key={subject}
            className="rounded-full bg-soft-grey px-4 py-2 text-[0.95rem] font-medium text-navy"
          >
            {subject}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AcademicsPage() {
  return (
    <>
      <PageHero
        id="academics-title"
        eyebrow="Academics"
        title="O-Level and A-Level, taught with practical skills and personal attention."
        lead="Bweyogerere Campus follows the Uganda National Curriculum. Learners prepare for the UCE (O-Level) and UACE (A-Level) national examinations."
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-5 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-16">
        <div className="min-w-0 space-y-24">
          <SectionNav label="On this page, mobile" items={SECTIONS} className="lg:hidden" />

          {/* Featured classroom image */}
          <Reveal className="w-full">
            <div className="rounded-2xl overflow-hidden shadow-xl shadow-navy/15">
              <RealImage
                src="/images/class-time.jpg"
                alt="Students in a classroom at Naalya Secondary School, Bweyogerere Campus, with a teacher at the chalkboard"
                className="w-full h-[22rem] object-cover object-center md:h-[28rem]"
                priority
              />
              <p className="mt-4 text-sm leading-relaxed text-ink-muted text-center">
                Active learning in the classroom: teachers guide students through the Uganda National Curriculum.
              </p>
            </div>
          </Reveal>

          {/* Levels */}
          <section id="levels" aria-labelledby="levels-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="levels-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Our two levels
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                Choose a level to see how it is taught and which subjects are offered.
              </p>
            </Reveal>

            <Reveal className="mt-10">
              <Tabs defaultValue="olevel">
                <TabsList aria-label="Choose a level">
                  <TabsTrigger value="olevel">O-Level</TabsTrigger>
                  <TabsTrigger value="alevel">A-Level</TabsTrigger>
                </TabsList>

                <TabsContent value="olevel" className="space-y-10">
                  <div className="max-w-2xl space-y-5 text-lg leading-[1.8] text-navy">
                    <p>
                      Our O-Level programme follows the new competency-based UCE curriculum. It builds strong
                      foundations in sciences, arts and technology, and learners develop practical skills alongside
                      academic knowledge.
                    </p>
                    <p>
                      The curriculum emphasises critical thinking, projects and real-life application rather than rote
                      memorisation. Students choose electives that match their interests and future study paths.
                    </p>
                  </div>

                  <Card className="p-7 md:p-10">
                    <CardHeader className="p-0">
                      <CardTitle className="text-2xl">O-Level (UCE) subjects</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-8 space-y-9 p-0">
                      <SubjectGroup title="Sciences" subjects={OLEVEL_STANDARD_SUBJECTS} />
                    </CardContent>
                    <p className="mt-6 text-base leading-[1.7] text-ink-muted">
                      Students typically offer between 8 and 10 subjects, with five compulsory core subjects.
                      The precise list taught at Bweyogerere Campus and any subject caps can be confirmed with the
                      school office.
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="alevel" className="space-y-10">
                  <div className="max-w-2xl space-y-5 text-lg leading-[1.8] text-navy">
                    <p>
                      Our A-Level programme follows the Uganda Advanced Certificate of Education (UACE) framework. It
                      offers a balanced mix of sciences, arts and commerce subjects.
                    </p>
                    <p>
                      Students specialise in subject combinations that match their academic goals and future careers.
                      The curriculum emphasises deep understanding and analytical skills, through critical thinking,
                      research and practical application.
                    </p>
                  </div>

                  <Card className="border-l-4 border-gold p-7 md:p-10">
                    <CardHeader className="p-0">
                      <CardTitle className="text-2xl">A-Level (UACE) subject combinations</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-8 space-y-9 p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-line">
                              <th className="py-3 text-left text-sm font-semibold text-navy">Stream</th>
                              <th className="py-3 text-left text-sm font-semibold text-navy">Combination</th>
                              <th className="py-3 text-left text-sm font-semibold text-navy">Code</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ALEVEL_COMBINATIONS.map((comb) => (
                              <tr key={`${comb.code}-${comb.combination}`} className="border-b border-line/50 hover:bg-soft-grey">
                                <td className="py-3 text-base text-ink-muted">{comb.stream}</td>
                                <td className="py-3 text-base text-navy">{comb.combination}</td>
                                <td className="py-3 text-base text-navy font-mono">{comb.code}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-6 text-base leading-[1.7] text-ink-muted">
                        A learner offers a combination of three principal subjects and two subsidiary subjects.
                        Subsidiary subjects are always:{ " "}
                        {ALEVEL_SUBSIDIARIES.join(", ")}.
                      </p>
                      <p className="mt-4 text-base leading-[1.7] text-ink-muted">
                        The confirmed combinations specifically available at Bweyogerere Campus can be confirmed with
                        the school office.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </Reveal>
          </section>

          {/* How we teach */}
          <section id="how-we-teach" aria-labelledby="how-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="how-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                How we teach
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                Our teachers use interactive, technology-enhanced approaches that put the learner at the centre.
              </p>
            </Reveal>
            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {[
                [
                  "Modern methods",
                  "Interactive and technology-enhanced learning approaches that engage every learner.",
                ],
                [
                  "Personal attention",
                  "Personalised attention and individual support for each learner, so no one is left behind.",
                ],
                [
                  "Continuous assessment",
                  "Regular evaluation and feedback that helps learners improve and grow in confidence.",
                ],
                [
                  "Experienced teachers",
                  "Dedicated educators who are committed to helping each learner reach their academic goals.",
                ],
              ].map(([title, body], index) => (
                <Reveal as="li" key={title}>
                  <div className="h-full rounded-2xl bg-card p-7 shadow-sm shadow-navy/5">
                    <h3 className="font-serif text-2xl font-semibold text-navy">{title}</h3>
                    <p className="mt-3 text-base leading-[1.7] text-ink-muted">{body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </section>

          {/* Calendar */}
          <section id="calendar" aria-labelledby="calendar-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="calendar-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Term dates — 2026
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                Based on the Uganda Ministry of Education school calendar for 2026.
              </p>
            </Reveal>

            <Reveal className="mt-10">
              <div className="grid gap-6 md:grid-cols-3">
                {TERM_DATES_2026.map((term) => (
                  <Card key={term.term} className="p-6 md:p-8">
                    <CardHeader className="p-0 pb-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
                        {term.term}
                      </p>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <p className="font-serif text-xl font-semibold text-navy">
                        {term.start} – {term.end}
                      </p>
                      <p className="mt-2 text-sm text-ink-muted">{term.days} instructional days</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Reveal>

            <Reveal className="mt-10">
              <h3 className="font-serif text-2xl font-semibold text-navy">Holiday breaks</h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {TERM_HOLIDAYS_2026.map((holiday) => (
                  <li key={holiday.label} className="rounded-xl bg-soft-grey p-5">
                    <p className="font-semibold text-navy">{holiday.label}</p>
                    <p className="mt-1 text-sm text-ink-muted">{holiday.dates}</p>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-10">
              <h3 className="font-serif text-2xl font-semibold text-navy">New student reporting</h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {NEW_STUDENT_REPORTING_2026.map((item) => (
                  <li key={item.level} className="rounded-xl bg-soft-grey p-5">
                    <p className="font-semibold text-navy">{item.level}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      Placement: {item.placement}<br />
                      Reporting: {item.reporting}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-base leading-[1.7] text-ink-muted">
                In total, schools will have {TOTAL_INSTRUCTIONAL_DAYS_2026} in 2026.
              </p>
            </Reveal>
          </section>

          {/* Exams and results */}
          <section id="exams" aria-labelledby="exams-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="exams-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Exams and results
              </h2>
            </Reveal>

            <Reveal className="mt-10 grid gap-6 md:grid-cols-2">
              <Card className="h-full p-7">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl">National examinations</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 p-0">
                  <ul className="space-y-4 text-base leading-[1.7] text-ink-muted">
                    <li>
                      <span className="font-semibold text-navy">O-Level:</span> Students sit the UCE (Uganda
                      Certificate of Education) in Senior 4.
                    </li>
                    <li>
                      <span className="font-semibold text-navy">A-Level:</span> Students sit the UACE (Uganda
                      Advanced Certificate of Education) in Senior 6.
                    </li>
                  </ul>
                  <p className="mt-4 text-base leading-[1.7] text-ink-muted">
                    Examination timetables are released annually by the Uganda National Examinations Board (UNEB).{" "}
                    <a
                      href={EXAM_INFO.unebLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy"
                    >
                      Visit {EXAM_INFO.unebLabel} for live dates
                    </a>
                    .
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full p-7 border-l-4 border-gold">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl">Academic results</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 p-0">
                  <p className="text-base leading-[1.7] text-ink-muted">
                    {RESULTS_STATEMENT}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          </section>

          <Reveal>
            <p className="max-w-2xl text-base leading-[1.75] text-ink-muted">
              Questions about a subject, a class or a learner’s progress? Please use the{" "}
              <Link href="/contact" className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy">
                contact page
              </Link>{" "}
              to find the right route.
            </p>
          </Reveal>
        </div>

        <aside className="hidden lg:block" aria-label="Page navigation">
          <SectionNav label="On this page" items={SECTIONS} />
        </aside>
      </div>
    </>
  );
}
