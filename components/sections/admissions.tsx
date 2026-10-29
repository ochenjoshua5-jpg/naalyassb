import { ArrowUpRight } from "lucide-react";
import { MotionLink } from "@/components/motion/motion-link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { COPY, SCHOOL } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Admissions() {
  const { admissions } = COPY;

  return (
    <section
      id="admissions"
      aria-labelledby="admissions-title"
      className="relative isolate scroll-mt-20 overflow-hidden bg-navy py-24 text-warm-white md:py-32"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(44rem_30rem_at_100%_0%,rgba(212,168,67,0.18),transparent_62%)]"
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-5 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{admissions.eyebrow}</p>
          <h2 id="admissions-title" className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-warm-white sm:text-5xl">
            {admissions.title}
          </h2>
          <p className="mt-6 text-lg leading-[1.7] text-warm-white/85">{admissions.body}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <MotionLink href={SCHOOL.applyUrl} size="lg" className="w-full sm:w-auto">
              Start an application
              <ArrowUpRight aria-hidden />
              <span className="sr-only">(opens the Education Hub)</span>
            </MotionLink>
            <MotionLink href={SCHOOL.enquiryUrl} variant="onDark" size="lg" className="w-full sm:w-auto">
              Make an enquiry
            </MotionLink>
          </div>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-7 md:gap-5">
          {admissions.steps.map((step, index) => (
            <RevealItem key={step.title} className={cn(index % 2 === 1 && "sm:translate-y-8")}>
              <div className="h-full rounded-xl bg-warm-white/[0.06] p-6 ring-1 ring-inset ring-warm-white/10 md:p-7">
                <p className="font-serif text-3xl font-semibold text-gold">0{index + 1}</p>
                <h3 className="mt-4 font-serif text-2xl font-semibold text-warm-white">{step.title}</h3>
                <p className="mt-3 leading-[1.7] text-warm-white/80">{step.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
