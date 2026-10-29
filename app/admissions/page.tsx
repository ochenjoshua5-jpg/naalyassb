import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { PendingNote, PendingTag } from "@/components/page/pending";
import { SectionNav } from "@/components/page/section-nav";
import { Stepper } from "@/components/page/stepper";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { ADMISSION_DATES, ENTRY_REQUIREMENTS, FAQ } from "@/lib/content";
import { COPY, SCHOOL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "How to apply to Naalya Secondary School, Bweyogerere Campus: the steps, the official Education Hub, and answers to common questions.",
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
                    Use the official Education Hub for the Naalya Secondary School application. The hub asks you to fill in
                    the details, submit, and then receive the decision.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full p-7">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl">Apply in person</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 p-0 text-base leading-[1.75] text-ink-muted">
                  <p>
                    You can also come to the campus to pick up a form. The office hours for this are pending HM approval;
                    please see the{" "}
                    <Link href="/contact" className="font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4">
                      contact page
                    </Link>
                    .
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
                  <PendingTag />
                  <p className="mt-4 text-base leading-[1.75] text-ink-muted">
                    {ENTRY_REQUIREMENTS ?? "The entry requirements for each level will be confirmed by the admissions team and published here."}
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full p-7">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl">Admission dates</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 p-0">
                  <PendingTag />
                  <p className="mt-4 text-base leading-[1.75] text-ink-muted">
                    {ADMISSION_DATES ?? "Intake dates will be shown here once the school has confirmed them."}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          </section>

          <section id="faq" aria-labelledby="faq-title" className="scroll-mt-28">
            <Reveal>
              <h2 id="faq-title" className="font-serif text-4xl font-semibold tracking-[-0.025em] text-navy sm:text-5xl">
                Questions parents ask
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-[1.75] text-ink-muted">
                Open a question to read its answer. Answers marked “pending” are being confirmed by the school and will be
                published once it approves them.
              </p>
            </Reveal>

            <Reveal className="mt-10">
              <div className="rounded-3xl bg-card px-6 shadow-md shadow-navy/5 md:px-10">
                <Accordion type="single" collapsible className="w-full">
                  {FAQ.map((item, index) => (
                    <AccordionItem key={item.question} value={`faq-${index}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>
                        {item.answer ? (
                          <p>{item.answer}</p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <PendingTag />
                            <p>
                              The answer to this question is being confirmed by the school. It will be published here once
                              approved.
                            </p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Reveal>
          </section>

          <Reveal>
            <PendingNote>
              Fees are not shown on this preview. Fee information will only be published once the Bursar has approved
              it, and the school will confirm when a fees page is needed.
            </PendingNote>
          </Reveal>
        </div>

        <aside className="hidden lg:block" aria-label="Page navigation">
          <SectionNav label="On this page" items={SECTIONS} />
        </aside>
      </div>
    </>
  );
}
