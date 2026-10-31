import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page/page-hero";
import { PendingNote, PendingTag } from "@/components/page/pending";
import { SectionNav } from "@/components/page/section-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/motion/reveal";
import { OLEVEL_SUBJECTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Academics",
  description:
    "O-Level and A-Level education at Naalya Secondary School, Bweyogerere Campus: the national curriculum, subjects, how we teach, and how to find dates and results.",
};

const SECTIONS = [
  { id: "levels", label: "O-Level and A-Level" },
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

          {/* Levels: tabs keep the page short and let parents switch between levels */}
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
                      Our O-Level programme follows the new competency-based UCE curriculum. It builds strong foundations
                      in sciences, arts and technology, and learners develop practical skills alongside academic knowledge.
                    </p>
                    <p>
                      The curriculum emphasises critical thinking, projects and real-life application rather than rote
                      memorisation. Students choose electives that match their interests and future study paths.
                    </p>
                  </div>

                  <Card className="p-7 md:p-10">
                    <CardHeader className="p-0">
                      <CardTitle className="text-2xl">Subjects published for O-Level</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-8 space-y-9 p-0">
                      <SubjectGroup title="Sciences" subjects={OLEVEL_SUBJECTS.sciences} />
                      <SubjectGroup title="Arts" subjects={OLEVEL_SUBJECTS.arts} />
                      <SubjectGroup title="Subsidiary subjects" subjects={OLEVEL_SUBJECTS.subsidiaries} />
                    </CardContent>
                  </Card>

                  <PendingNote>
                    This subject list is published for Naalya Secondary Schools as a whole. The school will confirm which
                    subjects are taught at Bweyogerere Campus, and any subject limits, before it is published here.
                  </PendingNote>
                </TabsContent>

                <TabsContent value="alevel" className="space-y-10">
                  <div className="max-w-2xl space-y-5 text-lg leading-[1.8] text-navy">
                    <p>
                      Our A-Level programme follows the Uganda Advanced Certificate of Education (UACE) framework. It offers
                      a balanced mix of sciences, arts and commerce subjects.
                    </p>
                    <p>
                      Students specialise in subject combinations that match their academic goals and future careers. The
                      curriculum emphasises deep understanding and analytical skills, through critical thinking, research and
                      practical application.
                    </p>
                  </div>

                  <Card className="border-l-4 border-gold p-7 md:p-10">
                    <CardHeader className="p-0">
                      <CardTitle className="text-2xl">Subject combinations</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-6 p-0">
                      <PendingTag />
                      <p className="mt-4 max-w-2xl text-base leading-[1.7] text-ink-muted">
                        The list of A-Level subject combinations at Bweyogerere Campus is pending HM approval. It will appear
                        here once the school confirms it.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </Reveal>
          </section>

          {/* How we teach: only the approaches the school describes */}
          <section id="how-we-teach" aria-labelledby="how-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="how-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                How we teach
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                The approaches below are described on the school’s website. Each one is a way of working in class, not a
                promise of any result.
              </p>
            </Reveal>
            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {[
                ["Modern methods", "Interactive and technology-enhanced learning approaches."],
                ["Personal attention", "Personalised attention and individual support for each learner."],
                ["Continuous assessment", "Regular evaluation and feedback that helps learners improve."],
                ["Experienced teachers", "Educators who are committed to helping each learner reach their academic goals."],
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

          {/* Calendar: no dates until the school confirms them */}
          <section id="calendar" aria-labelledby="calendar-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="calendar-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Term dates
              </h2>
              <div className="mt-8">
                <PendingNote>
                  Term start and end dates, holidays and examination dates will be listed here once the school confirms
                  them. No dates are shown on this preview. For now, please ask the campus office.
                </PendingNote>
              </div>
            </Reveal>
          </section>

          {/* Exams and results: no results are published until verified */}
          <section id="exams" aria-labelledby="exams-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="exams-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Exams and results
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                O-Level students sit the UCE and A-Level students sit the UACE. These are the national examinations for
                each level.
              </p>
              <div className="mt-8">
                <PendingNote>
                  Results: pending HM approval. We will publish results only once the school has verified them, with the
                  year and the cohort they relate to.
                </PendingNote>
              </div>
            </Reveal>
          </section>

          <Reveal>
            <p className="max-w-2xl text-base leading-[1.75] text-ink-muted">
              Questions about a subject, a class or a learner’s progress? Please use the{" "}
              <Link href="/contact" className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 hover:decoration-navy">
                contact page
              </Link>{" "}
              to find the right route. Phone and email details are pending school confirmation.
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
