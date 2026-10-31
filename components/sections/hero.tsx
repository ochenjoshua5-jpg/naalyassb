"use client";

import { ArrowUpRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Crest } from "@/components/brand/crest";
import { PhotoPlaceholder } from "@/components/brand/photo-placeholder";
import { MotionLink } from "@/components/motion/motion-link";
import { COPY, SCHOOL } from "@/lib/site";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-navy text-warm-white"
    >
      {/* Warm gold light and grain: atmosphere, not a stock photo */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(48rem_32rem_at_88%_8%,rgba(212,168,67,0.22),transparent_62%),radial-gradient(40rem_30rem_at_0%_100%,rgba(43,63,102,0.9),transparent_70%)]"
      />
      <div aria-hidden className="grain absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 pb-28 pt-32 md:grid-cols-12 md:gap-10 md:pb-36 md:pt-44">
        {/* Static on purpose: text that starts hidden cannot be painted (or measured as the LCP) until the
            page's JavaScript runs. The headline and lead are visible from the first paint. */}
        <div className="md:col-span-7">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{COPY.hero.eyebrow}</p>

          <h1
            id="hero-title"
            className="mt-5 font-serif text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.03em] text-warm-white sm:text-6xl lg:text-[4.5rem]"
          >
            {COPY.hero.title}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-[1.7] text-warm-white/85 md:text-xl">{COPY.hero.lead}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MotionLink href={SCHOOL.applyUrl} size="lg" className="w-full sm:w-auto">
              Apply now
              <ArrowUpRight aria-hidden />
              <span className="sr-only">(opens the Education Hub)</span>
            </MotionLink>
            <MotionLink href={SCHOOL.enquiryUrl} variant="onDark" size="lg" className="w-full sm:w-auto">
              Make an enquiry
            </MotionLink>
          </div>

          <ul className="mt-10 flex flex-wrap gap-2" aria-label="Campus at a glance">
            {COPY.hero.chips.map((chip) => (
              <li key={chip}>
                <Badge variant="default">{chip}</Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative md:col-span-5">
          <PhotoPlaceholder
            tone="gold"
            className="aspect-[4/5] w-full max-w-md rotate-[-1.5deg] rounded-2xl shadow-2xl shadow-navy-deep/40 md:ml-auto md:max-w-none"
            captionPosition="top"
            caption="Campus photograph: to be added with the school’s permission"
          />

          <div className="absolute -bottom-7 left-4 flex items-center gap-4 rounded-xl bg-warm-white p-4 pr-6 text-navy shadow-xl shadow-navy-deep/30 md:-left-10">
            <Crest className="size-14" tone="navy" title="Naalya Bweyogerere crest (placeholder)" />
            <div className="leading-tight">
              <p className="font-serif text-lg font-semibold">Bweyogerere</p>
              <p className="flex items-center gap-1 text-sm text-ink-muted">
                <MapPin aria-hidden className="size-4" />
                Kira Town Council
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Curved hand-off into the warm white page */}
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-14 w-full text-background md:h-20"
      >
        <path d="M0 96 L0 56 C240 12 480 8 720 40 C960 72 1200 80 1440 36 L1440 96 Z" fill="currentColor" />
      </svg>
    </section>
  );
}
