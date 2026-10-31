import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionNav } from "@/components/page/section-nav";
import { Stepper } from "@/components/page/stepper";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { FAQ, ENTRY_REQUIREMENTS, ADMISSION_DATES, OFFICE_HOURS } from "@/lib/content";
import { COPY, SCHOOL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "How to apply to Naalya Secondary School, Bweyogerere Campus: the steps, the official Education Hub, entry requirements, admission dates, and answers to common questions.",
};

const SECTIONS = [
  { id: "steps", label: "How to join" },
  { id: "requirements", label: "Requirements and dates" },
  { id: "faq", label: "Questions" },
] as const;

export default function AdmissionsPage() {
  return (
    <>
      <PageHero
        id="admissions-title"
        eyebrow="Admissions"
        title="How to join Bweyogerere Campus."
        lead="Start an application on the official Education Hub, or make an enquiry and a member of the admissions team will get back to you. Day and boarding places are available."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href={SCHOOL.applyUrl}>
              Start an application
              <ArrowUpRight aria-hidden />
              <span className="sr-only">(opens the Education Hub)</span>
            </a>
          </Button>
          <Button asChild variant="onDark" size="lg">
            <a href={SCHOOL.enquiryUrl}>Make an enquiry</a>
          </Button>
        </div>
      </PageHero>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-5 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-16">
        <div className="min-w-0 space-y-24">
          <SectionNav label="On this page, mobile" items={SECTIONS} className="lg:hidden" />

          <section id="steps" aria-labelledby="steps-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="steps-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Four steps to joining the family
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                The steps as the school’s admissions page describes them.
              </p>
            </Reveal>
            <Reveal className="mt-12">
              <Stepper steps={COPY.admissions.steps} />
            </Reveal>
            <Reveal className="mt-10 grid gap-6 md:grid-cols-2">
              <Card className="h-full p-7">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl">Apply online</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 p-0 text-base leading-[1.75] text-ink-muted">
                  <p>
                    Use the official Education Hub for the Naalya Secondary School application. The hub asks you to
                    fill in the details, submit, and then receive the decision.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full p-7">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl">Apply in person</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 p-0 text-base leading-[1.75] text-ink-muted">
                  <p>
                    You can also come to the campus to pick up a form. The school office is open during the hours
                    listed below.
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          </section>

          <section id="requirements" aria-labelledby="requirements-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="requirements-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Requirements and dates
              </h2>
            </Reveal>
            <Reveal className="mt-10 grid gap-6 md:grid-cols-2">
              <Card className="h-full p-7">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl">Entry requirements</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 p-0">
                  <div className="prose prose-navy max-w-none text-base leading-[1.75] text-ink-muted">
                    {ENTRY_REQUIREMENTS}
                  </div>
                </CardContent>
              </Card>
              <Card className="h-full p-7">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl">Admission dates</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 p-0">
                  <div className="prose prose-navy max-w-none text-base leading-[1.75] text-ink-muted">
                    {ADMISSION_DATES}
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal className="mt-10">
              <h3 className="font-serif text-2xl font-semibold text-navy">School office hours</h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {OFFICE_HOURS.map((hour) => (
                  <li key={hour.day} className="rounded-xl bg-soft-grey p-5">
                    <p className="font-semibold text-navy">{hour.day}</p>
                    <p className="mt-1 text-sm text-ink-muted">{hour.hours}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section id="faq" aria-labelledby="faq-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="faq-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Questions parents ask
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                Open a question to read its answer.
              </p>
            </Reveal>

            <Reveal className="mt-10">
              <div className="rounded-3xl bg-card px-6 shadow-md shadow-navy/5 md:px-10">
                <Accordion type="multiple" className="w-full">
                  {FAQ.map((item, index) => (
                    <AccordionItem key={item.question} value={`faq-${index}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-base leading-[1.7] text-ink-muted">
                          {item.answer ?? "Being confirmed by the school — contact the admissions office directly."}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Reveal>
          </section>

          <Reveal>
            <Card className="p-7 rounded-2xl bg-gold-tint/70 border border-gold/30">
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-navy">Fee information</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-base leading-[1.75] text-ink-muted">
                  Fee information is not shown on this preview. It will be published once the Bursar has approved it,
                  and the school will confirm when a fees page is needed. Please contact the school office for current
                  fee details.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <aside className="hidden lg:block" aria-label="Page navigation">
          <SectionNav label="On this page" items={SECTIONS} />
        </aside>
      </div>
    </>
  );
}
